import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faWindowMinimize,
  faWindowRestore,
  faTrash, // Import trash icon
} from "@fortawesome/free-solid-svg-icons"; // Import minimize and restore icons
import SongPlayer from "../SongPlayer"; // Assuming SongPlayer is in the same folder
import "./PlaylistSongs.css";
import AddSongToPlaylistModal from "../components/AddSongToPlaylistModal/AddSongToPlaylistModal";

const PlaylistSongs = ({
  playlistId,
  playlistName,
  setSelectedPlaylist,
  setSelectedSong,
  setIsMinimized,
  sessionPassword,
  vaultProtected,
}) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch the songs for the playlist
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        if (!playlistId) return;
        const response = await axios.get(
          `${process.env.REACT_APP_PLAYLIST_API_BASE}/get-songs?playlistId=${playlistId}&password=${sessionPassword}`
        );
        setSongs(response.data);
      } catch (err) {
        setError("Failed to load songs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [playlistId]); // Only fetch if playlistId changes

  const handlePlayClick = (song) => {
    setSelectedSong(song);
    setIsMinimized(false);
  };

  const handleBackClick = () => {
    setSelectedPlaylist(null);
  };

  const handleAddSong = (song) => {
    setSongs((prevSongs) => [...prevSongs, song]);
  };

  const handleDeleteSong = async (songId) => {
    try {
      // Make the DELETE request
      const response = await axios.delete(
        `${process.env.REACT_APP_PLAYLIST_API_BASE}/remove-song/${playlistId}/${songId}?password=${sessionPassword}`
      );

      // If successful, remove the song from the list
      if (response.status === 200) {
        setSongs((prevSongs) => prevSongs.filter((song) => song.id !== songId));
      }
    } catch (err) {
      console.error("Error deleting song:", err);
      setError("Failed to delete song. Please try again later.");
    }
  };

  if (loading) return <div>Loading songs...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="playlist-container">
      <h1 className="title">{playlistName || "Playlist"}</h1>
      <div className="button-container">
        <button className="back-button" onClick={handleBackClick}>
          Back
        </button>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
          Add
        </button>
      </div>
      {songs.length === 0 ? (
        <p className="no-songs">No songs available in this playlist.</p>
      ) : (
        <table className="playlist-table">
          <thead>
            <tr>
              <th>Play</th>
              <th>Song Name</th>
              <th>Delete</th> {/* Added the Delete column */}
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr key={song.id}>
                <td>
                  <FontAwesomeIcon
                    icon={faPlay}
                    className="play-icon"
                    onClick={() => handlePlayClick(song)}
                  />
                </td>
                <td>{song.originalName}</td>
                <td>
                  <FontAwesomeIcon
                    icon={faTrash} // Trash icon for deletion
                    className="delete-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDeleteSong(song.id)} // Call the delete function
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isModalOpen && (
        <AddSongToPlaylistModal
          onClose={() => setIsModalOpen(false)}
          onAddSong={handleAddSong}
          playlistId={playlistId}
          sessionPassword={sessionPassword}
          vaultProtected={vaultProtected}
        />
      )}
    </div>
  );
};

export default PlaylistSongs;
