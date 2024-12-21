import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PlaylistSongs.css";

const PlaylistSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              <th>Song Name</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr key={song.id}>
                <td>{song.originalName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PlaylistSongs;
