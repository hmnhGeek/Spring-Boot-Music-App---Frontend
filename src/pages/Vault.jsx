import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SongPlayer from "../SongPlayer";
import UploadModal from "../components/UploadModal/UploadModal";
import "./Vault.css";
import SongCard from "../components/SongCard/SongCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

const Vault = (props) => {
  const [songsList, setSongsList] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(true);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const hardcodedPassword = "4252"; // Replace with your desired password

  useEffect(() => {
    if (!passwordModalVisible) {
      axios
        .get(
          `${process.env.REACT_APP_SONG_API_BASE}/get-song-list?vaultProtected=true`
        )
        .then((response) => {
          setSongsList(response.data);
        })
        .catch((error) => console.log(error));
    }
  }, [passwordModalVisible]);

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

  const handlePasswordSubmit = () => {
    if (password === hardcodedPassword) {
      setPasswordModalVisible(false); // Hide the password modal
    } else {
      alert("Incorrect password. Redirecting to Home.");
      navigate("/"); // Redirect to home page if password is incorrect
    }
  };

  return (
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
          {/* Button to open upload modal */}
          <button className="upload-button" onClick={openModal}>
            Upload Song
          </button>

          <button className="vault-button" onClick={() => handleNavigate("/")}>
            <FontAwesomeIcon icon={faHome} /> &nbsp; Home
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
                <SongCard
                  song={song}
                  selectedSong={selectedSong}
                  handleSongClick={handleSongClick}
                />
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
        </>
      )}
    </div>
  );
};

export default Vault;
