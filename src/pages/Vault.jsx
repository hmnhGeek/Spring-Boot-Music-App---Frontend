import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import SongPlayer from "../SongPlayer";
import UploadModal from "../components/UploadModal/UploadModal";

const Vault = (props) => {
  const [songsList, setSongsList] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_SONG_API_BASE}/get-song-list?vaultProtected=true`
      )
      .then((response) => {
        setSongsList(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleSongClick = (song) => {
    setSelectedSong(song);
    setIsMinimized(false); // Reset minimize when a new song is clicked
  };

  const refreshSongList = () => {
    // Re-fetch the song list after a successful upload
    axios
      .get(
        `${process.env.REACT_APP_SONG_API_BASE}/get-song-list?vaultProtected=true`
      )
      .then((response) => {
        setSongsList(response.data);
      })
      .catch((error) => console.log(error));
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="home-page">
      {/* Button to open modal */}
      <button className="upload-button" onClick={openModal}>
        Upload Song
      </button>

      {/* Upload Modal */}
      <UploadModal
        isVisible={isModalVisible}
        onClose={closeModal}
        onSubmit={refreshSongList}
      />

      {/* Song List as Cards */}
      <div className="song-list">
        <div className="song-cards-container">
          {songsList.map((song) => (
            <div
              key={song.id}
              className={`song-card ${
                selectedSong?.id === song.id ? "selected" : ""
              }`}
              onClick={() => handleSongClick(song)} // Update selected song on click
            >
              <div className="song-cover">
                {/* Check if coverImageData exists and render the image */}
                {song.coverImageData && (
                  <img
                    className="cover-image"
                    src={`data:image/jpeg;base64,${song.coverImageData}`} // Assuming it's base64 JPEG data
                    alt={`Cover for ${song.originalName}`}
                  />
                )}
              </div>
              <div className="card-song-title">{song.originalName}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Song Player */}
      {selectedSong && (
        <SongPlayer
          song={selectedSong}
          isMinimized={isMinimized}
          setIsMinimized={setIsMinimized}
        />
      )}
    </div>
  );
};

export default Vault;
