import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./OpenPlaylists.css";

const OpenPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchPlaylists();
  }, []);

  const handlePlaylistClick = (playlist) => {
    // Pass the playlist information using state instead of URL
    navigate(`/playlist`, {
      state: { playlistId: playlist.id, playlistName: playlist.name },
    });
  };

  if (loading) return <div>Loading playlists...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="playlist-container">
      <h1 className="title">Open Playlists</h1>
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
    </div>
  );
};

export default OpenPlaylists;
