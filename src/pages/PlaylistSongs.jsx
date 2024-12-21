import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faWindowMinimize,
  faWindowRestore,
} from "@fortawesome/free-solid-svg-icons"; // Import minimize and restore icons
import SongPlayer from "../SongPlayer"; // Assuming SongPlayer is in the same folder
import "./PlaylistSongs.css";

const PlaylistSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false); // To track minimize state of SongPlayer

  const location = useLocation();
  const navigate = useNavigate();
  const { playlistId, playlistName } = location.state || {}; // Use state for playlist data

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
    setIsMinimized(false); // Ensure SongPlayer is expanded when a song is selected
  };

  const handleMinimizeToggle = () => {
    setIsMinimized((prevState) => !prevState);
  };

  if (loading) return <div>Loading songs...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="playlist-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        Back
      </button>
      <h1 className="title">{playlistName || "Playlist"}</h1>
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

      {/* SongPlayer Component for playing the selected song */}
      {selectedSong && (
        <div
          className={`song-player-container ${isMinimized ? "minimized" : ""}`}
        >
          <button className="minimize-btn" onClick={handleMinimizeToggle}>
            <FontAwesomeIcon
              icon={isMinimized ? faWindowRestore : faWindowMinimize}
              className="minimize-icon"
            />
          </button>
          <SongPlayer
            song={selectedSong}
            isMinimized={isMinimized}
            setIsMinimized={setIsMinimized}
          />
        </div>
      )}
    </div>
  );
};

export default PlaylistSongs;
