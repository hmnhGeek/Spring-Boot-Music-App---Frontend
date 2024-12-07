import React, { useState, useEffect } from "react";
import axios from "axios";
import SongPlayer from "../SongPlayer";
import UploadModal from "../components/UploadModal/UploadModal";
import { useNavigate } from "react-router-dom";
import SongCard from "../components/SongCard/SongCard";
import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons"; // Import FontAwesome icons
import CustomTypeahead from "../components/CustomTypeahead/CustomTypeahead";

const Home = (props) => {
  const [songsList, setSongsList] = useState([]); // Ensure songsList is always initialized as an array
  const [selectedSong, setSelectedSong] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [allAvailableSongs, setAllAvailableSongs] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(8); // Default page size
  const [isLoading, setIsLoading] = useState(false);
  const [isPageSwitching, setIsPageSwitching] = useState(false);
  const [filteredSong, setFilteredSong] = useState([]);

  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const fetchCoverImage = async (song) => {
    try {
      const coverResponse = await fetch(
        `${process.env.REACT_APP_SONG_API_BASE}/get-song-cover-image/${song.id}`
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

  const handleTypeaheadSelect = (selected) => {
    const song = allAvailableSongs.find((x) => x.originalName === selected);
    if (song) fetchCoverImage(song);
  };

  const fetchSongs = (page) => {
    setIsPageSwitching(true);
    axios
      .get(
        `${process.env.REACT_APP_SONG_API_BASE}/get-song-list?vaultProtected=false&page=${page}&size=${pageSize}`
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

  useEffect(() => {
    setIsLoading(true);
    fetchSongs(0); // Load first page initially
    fetchTypeaheadList();
  }, []);

  const handleSongClick = (song) => {
    setSelectedSong(song);
    setIsMinimized(false); // Reset minimize when a new song is clicked
  };

  const refreshSongList = () => {
    setIsLoading(true);
    fetchSongs(currentPage); // Refresh current page after upload
    fetchTypeaheadList();
    setFilteredSong([]);
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handlePageChange = (newPage) => {
    fetchSongs(newPage);
  };

  const fetchTypeaheadList = () => {
    axios
      .get(
        `${process.env.REACT_APP_SONG_API_BASE}/get-song-list-lite?vaultProtected=false`
      )
      .then((response) => setAllAvailableSongs(response.data))
      .catch((err) => console.log(err));
  };

  return (
    <>
      <div className="home-page">
        <div className="action-bar">
          <button className="upload-button" onClick={openModal}>
            Upload Song
          </button>

          <CustomTypeahead
            options={allAvailableSongs.map((i) => i.originalName)}
            onSelect={handleTypeaheadSelect}
            onClear={() => setFilteredSong([])}
            placeholder="Find a song..."
          />
          <button
            className="vault-button"
            onClick={() => handleNavigate("/vault")}
          >
            <FontAwesomeIcon icon={faLock} /> &nbsp; Vault
          </button>
        </div>
        {/* Button to open modal */}
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
              ) : (
                songsList.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    selectedSong={selectedSong}
                    handleSongClick={handleSongClick}
                    refresh={refreshSongList}
                  />
                ))
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
      </div>
    </>
  );
};

export default Home;
