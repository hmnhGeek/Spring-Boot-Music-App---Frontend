import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SongPlayer from "../SongPlayer";
import UploadModal from "../components/UploadModal/UploadModal";
import "./Vault.css";
import SongCard from "../components/SongCard/SongCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faChevronLeft,
  faChevronRight,
  faGift,
  faUpload,
} from "@fortawesome/free-solid-svg-icons"; // Import FontAwesome icons
import CustomTypeahead from "../components/CustomTypeahead/CustomTypeahead";

const Vault = (props) => {
  const [songsList, setSongsList] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(true);
  const [password, setPassword] = useState("");
  const [allAvailableSongs, setAllAvailableSongs] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(8); // Default page size
  const [isLoading, setIsLoading] = useState(false);
  const [isPageSwitching, setIsPageSwitching] = useState(false);
  const [filteredSong, setFilteredSong] = useState([]);
  const [sessionPassword, setSessionPassword] = useState("");

  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  useEffect(() => {
    if (!passwordModalVisible) {
      setIsLoading(true);
      fetchSongs(0);
      fetchTypeaheadList();
    }
  }, [passwordModalVisible]);

  useEffect(() => {
    fetchSongs(currentPage); // Fetch songs for the current page
  }, [currentPage]);

  const handleTypeaheadSelect = (selected) => {
    const song = allAvailableSongs.find((x) => x.originalName === selected);
    if (song) fetchCoverImage(song);
  };

  const fetchSongs = (page) => {
    setIsPageSwitching(true);
    axios
      .get(
        `${process.env.REACT_APP_SONG_API_BASE}/get-song-list?password=${sessionPassword}&vaultProtected=true&page=${page}&size=${pageSize}`
      )
      .then((response) => {
        setSongsList(response.data.content || []); // Ensure content is handled gracefully
        setTotalPages(response.data.totalPages || 0);
        setCurrentPage(page);
        setIsLoading(false);
        setIsPageSwitching(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
        setIsPageSwitching(false);
      });
  };

  const handleSongClick = (song) => {
    setSelectedSong(song);
    setIsMinimized(false); // Reset minimize when a new song is clicked
  };

  const refreshSongList = () => {
    setIsLoading(true);
    fetchSongs(currentPage); // Re-fetch songs after upload
    fetchTypeaheadList();
    setFilteredSong([]);
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  // Updated password validation API call with base64 encoding
  const handlePasswordSubmit = async () => {
    try {
      // Base64 encode the password
      const encodedPassword = btoa(password); // 'btoa' encodes to base64

      const response = await axios.post(
        `${process.env.REACT_APP_CRED_API}`, // Replace with your actual password validation endpoint
        { encodedPassword } // Pass the base64-encoded password
      );

      if (response.status === 200) {
        // Check if status is 200 (OK)
        setPasswordModalVisible(false); // Hide the password modal if the password is valid
        setSessionPassword(encodedPassword);
      } else {
        alert("Incorrect password.");
        setSessionPassword("");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Handle 401 Unauthorized
        alert("Incorrect password.");
        setSessionPassword("");
      } else {
        console.error("Error validating password:", error);
        setSessionPassword("");
        alert("An error occurred while validating the password.");
      }
    }
  };

  const fetchCoverImage = async (song) => {
    try {
      const coverResponse = await fetch(
        `${process.env.REACT_APP_SONG_API_BASE}/get-song-cover-image/${song.id}?password=${sessionPassword}`
      );

      if (!coverResponse.ok) {
        throw new Error(
          `Failed to fetch cover image: ${coverResponse.statusText}`
        );
      }

      const blob = await coverResponse.blob(); // Convert response to Blob
      const base64Image = await convertBlobToBase64(blob); // Convert Blob to base64

      // Remove the data:image/jpeg;base64, part if it's included in the base64 string
      const rawBase64Image = base64Image.split(",")[1]; // Get only the base64 part

      song.coverImageData = rawBase64Image; // Assign raw base64 image data without the prefix

      // Update filteredSong with the song and the base64 image (raw base64)
      setFilteredSong([
        {
          ...song,
          coverImageData: rawBase64Image, // Attach only the raw base64 image data
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper function to convert Blob to Base64
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // reader.result is a Base64 string
      reader.onerror = reject;
      reader.readAsDataURL(blob); // This converts the blob to Base64
    });
  };

  const handlePageChange = (newPage) => {
    fetchSongs(newPage);
  };

  const playRandomSong = () => {
    const allSongs = songsList;
    if (allSongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * allSongs.length);
      setSelectedSong(allSongs[randomIndex]);
      setIsMinimized(false); // Ensure player is not minimized
    }
  };

  const fetchTypeaheadList = () => {
    axios
      .get(
        `${process.env.REACT_APP_SONG_API_BASE}/get-song-list-lite?password=${sessionPassword}&vaultProtected=true`
      )
      .then((response) => setAllAvailableSongs(response.data))
      .catch((err) => console.log(err));
  };

  return (
    <>
      <div className="vault-page">
        {/* Password Modal */}
        {passwordModalVisible && (
          <div className="password-modal">
            <div className="modal-content">
              <h2>Enter Vault Password</h2>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="password-input"
              />
              <div>
                <button
                  className="submit-button"
                  onClick={handlePasswordSubmit}
                >
                  Submit
                </button>
                &nbsp;&nbsp;&nbsp;
                <button className="submit-button" onClick={() => navigate("/")}>
                  <FontAwesomeIcon icon={faHome} /> Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content (Visible only if password is correct) */}
        {!passwordModalVisible && (
          <>
            <div className="action-bar">
              {/* Button to open upload modal */}
              <button className="upload-button" onClick={openModal}>
                <FontAwesomeIcon icon={faUpload} /> &nbsp; Upload Song
              </button>
              <CustomTypeahead
                options={allAvailableSongs.map((i) => i.originalName)}
                onSelect={handleTypeaheadSelect}
                onClear={() => setFilteredSong([])}
                placeholder="Find a song..."
              />
              <button className="random-song-button" onClick={playRandomSong}>
                <FontAwesomeIcon icon={faGift} /> &nbsp; Surprise Me!
              </button>
              <button
                className="vault-button"
                onClick={() => handleNavigate("/")}
              >
                <FontAwesomeIcon icon={faHome} /> &nbsp; Home
              </button>
            </div>

            {/* Upload Modal */}
            <UploadModal
              isVisible={isModalVisible}
              onClose={closeModal}
              onSubmit={refreshSongList}
            />

            {(isPageSwitching || isLoading) && (
              <div className="bouncing-balls-container">
                <div className="bouncing-ball"></div>
                <div className="bouncing-ball"></div>
                <div className="bouncing-ball"></div>
              </div>
            )}

            {/* Song List as Cards */}
            {!isPageSwitching && !isLoading && (
              <div className="song-list">
                <div className="song-cards-container">
                  {filteredSong.length > 0 ? (
                    <SongCard
                      key={filteredSong[0].id}
                      song={filteredSong[0]}
                      selectedSong={selectedSong}
                      handleSongClick={handleSongClick}
                      refresh={refreshSongList}
                    />
                  ) : songsList.length > 0 ? (
                    songsList.map((song) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        selectedSong={selectedSong}
                        handleSongClick={handleSongClick}
                        refresh={refreshSongList}
                      />
                    ))
                  ) : (
                    <p>No songs available</p> // Fallback when the list is empty
                  )}
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && (
              <div className="pagination-container">
                <button
                  className="pagination-btn prev"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                <button
                  className="pagination-btn next"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage + 1 >= totalPages}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}

            {/* Song Player */}
            {selectedSong && (
              <SongPlayer
                song={selectedSong}
                isMinimized={isMinimized}
                setIsMinimized={setIsMinimized}
                onSongEnd={playRandomSong}
                sessionPassword={sessionPassword}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Vault;
