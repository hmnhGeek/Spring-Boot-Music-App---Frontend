import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faHome } from "@fortawesome/free-solid-svg-icons";
import PlaylistSongs from "./PlaylistSongs"; // Import PlaylistSongs component
import "./OpenPlaylists.css";
import SongPlayer from "../SongPlayer";
import AddPlaylistModal from "../components/AddPlaylistModal/AddPlaylistModal";

const VaultPlaylists = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null); // State to manage selected playlist
  const [isMinimized, setIsMinimized] = useState(false); // To track minimize state of SongPlayer
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close state
  const [passwordModalVisible, setPasswordModalVisible] = useState(true);
  const [sessionPassword, setSessionPassword] = useState("");
  const [password, setPassword] = useState("");
  const [counterForNextSong, setCounterForNextSong] = useState(0);

  useEffect(() => {
    if (!passwordModalVisible) {
      setLoading(false);
      fetchPlaylists();
    }
  }, [passwordModalVisible]);

  // Function to fetch playlists from the API
  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_PLAYLIST_API_BASE}?isProtected=true&password=${sessionPassword}`
      );
      setPlaylists(response.data);
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
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist); // Set the selected playlist
  };

  // Handle the addition of a new playlist
  const handleAddPlaylist = (newPlaylist) => {
    // Update the playlists state to include the newly created playlist
    setPlaylists((prevPlaylists) => [...prevPlaylists, newPlaylist]);

    // Close the modal after the new playlist is added
    setIsModalOpen(false);
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

  const onSongEnd = () => {
    if (selectedSong) {
      setCounterForNextSong((c) => c + 1);
    }
  };

  return (
    <>
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
              <button className="submit-button" onClick={handlePasswordSubmit}>
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

      {!passwordModalVisible && (
        <>
          <div style={{ margin: "30px", float: "right" }}>
            <button className="submit-button" onClick={() => navigate("/")}>
              <FontAwesomeIcon icon={faHome} /> Home
            </button>
            <button
              className="submit-button"
              onClick={() => setIsModalOpen(true)} // Open the modal
              style={{ marginLeft: "10px" }}
            >
              Add Playlist
            </button>
          </div>

          <div className="playlist-container">
            {!selectedPlaylist && <h1 className="title">Playlists</h1>}

            {selectedPlaylist ? (
              // If a playlist is selected, render PlaylistSongs with the selected playlist data
              <PlaylistSongs
                playlistId={selectedPlaylist.id}
                playlistName={selectedPlaylist.name}
                setSelectedPlaylist={setSelectedPlaylist}
                setSelectedSong={setSelectedSong}
                setIsMinimized={setIsMinimized}
                sessionPassword={sessionPassword}
                vaultProtected={true}
                nextSongTrigger={counterForNextSong}
              />
            ) : (
              <table className="playlist-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {playlists.map((playlist) => (
                    <tr key={playlist.id}>
                      <td
                        className="clickable"
                        onClick={() => handlePlaylistClick(playlist)}
                      >
                        {playlist.name}
                      </td>
                      <td>
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="delete-icon"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* SongPlayer Component for playing the selected song */}
            {selectedSong && (
              <div
                className={`song-player-container ${
                  isMinimized ? "minimized" : ""
                }`}
              >
                <SongPlayer
                  song={selectedSong}
                  isMinimized={isMinimized}
                  setIsMinimized={setIsMinimized}
                  sessionPassword={sessionPassword}
                  onSongEnd={onSongEnd}
                />
              </div>
            )}
          </div>

          {/* AddPlaylistModal */}
          <AddPlaylistModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddPlaylist}
            sessionPassword={sessionPassword}
            vaultProtected={true}
          />
        </>
      )}
    </>
  );
};

export default VaultPlaylists;
