import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faWindowMinimize,
  faWindowRestore,
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
}) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        if (!playlistId) return;
        const response = await axios.get(
          `${process.env.REACT_APP_PLAYLIST_API_BASE}/get-songs?playlistId=${playlistId}`
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
        />
      )}
    </div>
  );
};

export default PlaylistSongs;
