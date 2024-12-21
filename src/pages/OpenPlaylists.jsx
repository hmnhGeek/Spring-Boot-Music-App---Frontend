import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faHome } from "@fortawesome/free-solid-svg-icons";
import PlaylistSongs from "./PlaylistSongs"; // Import PlaylistSongs component
import "./OpenPlaylists.css";
import SongPlayer from "../SongPlayer";
import AddPlaylistModal from "../components/AddPlaylistModal/AddPlaylistModal";

const OpenPlaylists = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null); // State to manage selected playlist
  const [isMinimized, setIsMinimized] = useState(false); // To track minimize state of SongPlayer
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close state
  const [counterForNextSong, setCounterForNextSong] = useState(0);

  // Function to fetch playlists from the API
  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_PLAYLIST_API_BASE}?isProtected=false`
      );
      setPlaylists(response.data);
    } catch (err) {
      setError("Failed to load playlists. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []); // Initial load of playlists

  const handleMinimizeToggle = () => {
    setIsMinimized((prevState) => !prevState);
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

  const onSongEnd = () => {
    if (selectedSong) {
      setCounterForNextSong((c) => c + 1);
    }
  };

  if (loading) return <div>Loading playlists...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <div style={{ margin: "30px", float: "right" }}>
        <button
          className="submit-button"
          onClick={() => setIsModalOpen(true)} // Open the modal
          style={{ marginLeft: "10px" }}
        >
          Add Playlist
        </button>
        &nbsp;&nbsp;&nbsp;
        <button className="submit-button" onClick={() => navigate("/")}>
          <FontAwesomeIcon icon={faHome} /> Home
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
            vaultProtected={false}
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
                    <FontAwesomeIcon icon={faTrash} className="delete-icon" />
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
              onSongEnd={onSongEnd}
            />
          </div>
        )}
      </div>

      {/* AddPlaylistModal */}
      <AddPlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddPlaylist} // Pass handleAddPlaylist to update the playlists
        vaultProtected={false}
      />
    </>
  );
};

export default OpenPlaylists;
