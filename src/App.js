// src/App.js

import axios from "axios";
import { useEffect, useState } from "react";
import SongPlayer from "./SongPlayer";
import "./App.css";
import UploadModal from "./components/UploadModal/UploadModal";

const App = () => {
  const [songsList, setSongsList] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SONG_API_BASE}/get-song-list`)
      .then((response) => {
        setSongsList(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleSongClick = (song) => {
    setSelectedSong(song);
    setIsMinimized(false); // Reset minimize when a new song is clicked
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const refreshSongList = () => {
    // Re-fetch the song list after a successful upload
    axios
      .get(`${process.env.REACT_APP_SONG_API_BASE}/get-song-list`)
      .then((response) => {
        setSongsList(response.data);
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="app-container">
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

      {/* Song List */}
      <div className="song-list">
        <ul>
          {songsList.map((x) => (
            <li
              key={x.id}
              onClick={() => handleSongClick(x)} // Update selected song on click
              style={{
                cursor: "pointer",
                padding: "10px",
                background:
                  selectedSong?.id === x.id ? "#f0f0f0" : "transparent",
              }}
            >
              {x.originalName}
            </li>
          ))}
        </ul>
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

export default App;
