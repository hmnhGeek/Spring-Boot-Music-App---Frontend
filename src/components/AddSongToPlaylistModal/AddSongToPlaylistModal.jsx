// AddSongToPlaylistModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddSongToPlaylistModal.css"; // For modal styles
import CustomTypeahead from "../CustomTypeahead/CustomTypeahead";

const AddSongToPlaylistModal = ({
  onClose,
  onAddSong,
  playlistId,
  vaultProtected,
  sessionPassword,
}) => {
  const [allAvailableSongs, setAllAvailableSongs] = useState([]);
  const [filteredSong, setFilteredSong] = useState([]);

  // Fetch all available songs from API
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SONG_API_BASE}/get-song-list-lite?vaultProtected=${vaultProtected}&password=${sessionPassword}`
        );
        setAllAvailableSongs(response.data); // Assuming data is an array of songs
      } catch (error) {
        console.error("Failed to fetch songs:", error);
      }
    };
    fetchSongs();
  }, []);

  // Handle selection from the typeahead
  const handleTypeaheadSelect = (selectedSong) => {
    setFilteredSong(selectedSong);
  };

  // Handle add song to playlist
  const handleAddSong = async () => {
    if (filteredSong) {
      try {
        const songToAdd = allAvailableSongs.find(
          (song) => song.originalName === filteredSong
        );

        const response = await axios.post(
          `${process.env.REACT_APP_PLAYLIST_API_BASE}/add-to-playlist`,
          {
            playlistId: playlistId,
            songId: songToAdd.id,
            password: sessionPassword,
          }
        );

        if (response.status === 200) {
          onAddSong(songToAdd); // Add the song to the playlist
          onClose(); // Close the modal
        } else {
          alert("Failed to add song. Please try again.");
        }
      } catch (error) {
        console.error("Error adding song to playlist:", error);
        alert("Failed to add song. Please try again.");
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Song to Playlist</h2>
        <CustomTypeahead
          options={allAvailableSongs.map((i) => i.originalName)}
          onSelect={handleTypeaheadSelect}
          onClear={() => setFilteredSong([])}
          placeholder="Find a song..."
        />
        <div className="modal-buttons">
          <button onClick={onClose} className="add-button">
            Close
          </button>
          &nbsp;&nbsp;&nbsp;
          <button
            onClick={handleAddSong}
            className="add-button"
            disabled={!filteredSong}
          >
            Add Song
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSongToPlaylistModal;
