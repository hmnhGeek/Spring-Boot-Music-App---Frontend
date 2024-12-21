import React, { useState } from "react";
import axios from "axios";
import "./AddPlaylistModal.css"; // Import the CSS for styling the modal

const AddPlaylistModal = ({
  isOpen,
  onClose,
  onSubmit,
  sessionPassword,
  vaultProtected,
}) => {
  const [playlistName, setPlaylistName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle input change for playlist name
  const handleInputChange = (event) => {
    setPlaylistName(event.target.value);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (playlistName.trim()) {
      setLoading(true);
      setError(null); // Reset error before the API call

      try {
        // API call to create a new playlist
        const response = await axios.post(
          `${process.env.REACT_APP_PLAYLIST_API_BASE}/create-playlist`,
          {
            playlistName: playlistName,
            isProtected: vaultProtected, // Hardcoded as per the requirement
            password: sessionPassword,
          }
        );

        // Pass the created playlist back to the parent component
        onSubmit(response.data); // You can modify this depending on the response data structure

        // Close the modal and clear the input field
        setPlaylistName("");
        onClose();
      } catch (err) {
        setError("Failed to create playlist. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // If the modal isn't open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Playlist</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="playlistName">Playlist Name</label>
            <input
              type="text"
              id="playlistName"
              value={playlistName}
              onChange={handleInputChange}
              placeholder="Enter playlist name"
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div className="modal-buttons">
            <button
              type="button"
              className="modal-button close-button"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
            <button
              type="submit"
              className="modal-button add-button"
              disabled={!playlistName.trim() || loading}
            >
              {loading ? "Creating..." : "Add Playlist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlaylistModal;
