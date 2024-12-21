import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faWindowRestore,
  faWindowMinimize,
} from "@fortawesome/free-solid-svg-icons";
import PlaylistSongs from "./PlaylistSongs"; // Import PlaylistSongs component
import "./OpenPlaylists.css";
import SongPlayer from "../SongPlayer";

const OpenPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null); // State to manage selected playlist
  const [isMinimized, setIsMinimized] = useState(false); // To track minimize state of SongPlayer

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

  const handleMinimizeToggle = () => {
    setIsMinimized((prevState) => !prevState);
  };

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist); // Set the selected playlist
  };

  if (loading) return <div>Loading playlists...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="playlist-container">
      {!selectedPlaylist && <h1 className="title">Open Playlists</h1>}
      {selectedPlaylist ? (
        // If a playlist is selected, render PlaylistSongs with the selected playlist data
        <PlaylistSongs
          playlistId={selectedPlaylist.id}
          playlistName={selectedPlaylist.name}
          setSelectedPlaylist={setSelectedPlaylist}
          setSelectedSong={setSelectedSong}
          setIsMinimized={setIsMinimized}
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
          className={`song-player-container ${isMinimized ? "minimized" : ""}`}
        >
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

export default OpenPlaylists;
