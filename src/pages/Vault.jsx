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

  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const hardcodedPassword = "4252"; // Replace with your desired password

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
    if (song) handleSongClick(song);
  };

  const fetchSongs = (page) => {
    setIsPageSwitching(true);
    axios
      .get(
        `${process.env.REACT_APP_SONG_API_BASE}/get-song-list?vaultProtected=true&page=${page}&size=${pageSize}`
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
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handlePasswordSubmit = () => {
    if (password === hardcodedPassword) {
      setPasswordModalVisible(false); // Hide the password modal
    } else {
      alert("Incorrect password. Redirecting to Home.");
      navigate("/"); // Redirect to home page if password is incorrect
    }
  };

  const handlePageChange = (newPage) => {
    fetchSongs(newPage);
  };

  const fetchTypeaheadList = () => {
    axios
      .get(
        `${process.env.REACT_APP_SONG_API_BASE}/get-song-list-lite?vaultProtected=true`
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
              <button className="submit-button" onClick={handlePasswordSubmit}>
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Main Content (Visible only if password is correct) */}
        {!passwordModalVisible && (
          <>
            <div className="action-bar">
              {/* Button to open upload modal */}
              <button className="upload-button" onClick={openModal}>
                Upload Song
              </button>

              <CustomTypeahead
                options={allAvailableSongs.map((i) => i.originalName)}
                onSelect={handleTypeaheadSelect}
                placeholder="Find a song..."
              />
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
                  {songsList.length > 0 ? (
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
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Vault;
