import React, { useState } from "react";
import "./SongCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlay, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const EditCoverImageModal = ({ songId, isVisible, onClose, refresh }) => {
  const [coverImage, setCoverImage] = useState(null);

  const handleCoverImageChange = (event) => {
    setCoverImage(event.target.files[0]);
  };

  const handleCoverChangeRequest = async () => {
    const formData = new FormData();
    formData.append("coverImagePath", coverImage); // Fix key name

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_SONG_API_BASE}/change-cover/${songId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob", // Ensures we receive a binary file
        }
      );

      // Get content type from response headers (e.g., "image/jpeg")
      const contentType = response.headers["content-type"] || "image/jpeg"; // Default to JPEG

      // Determine file extension from content type
      const extensionMap = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
      };
      const extension = extensionMap[contentType] || "jpg"; // Fallback to jpg

      // Get filename from content-disposition header (if available)
      const contentDisposition = response.headers["content-disposition"];
      let filename = `cover_image.${extension}`; // Default filename
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+?)"/);
        if (match) filename = match[1];
      } else {
        filename = `cover_image.${extension}`; // Use detected extension
      }

      // Create a download link for the image
      const blob = new Blob([response.data], { type: contentType });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      // Refresh UI
      refresh();
    } catch (err) {
      console.log("Error downloading image:", err);
    }
  };

  return (
    isVisible && (
      <div className="modal-overlay">
        <div className="upload-modal-content">
          <div className="form-group">
            <label>New Cover Image:</label>
            <input
              type="file"
              onChange={handleCoverImageChange}
              accept="image/*"
            />
          </div>
          <button className="modal-button" onClick={handleCoverChangeRequest}>
            Submit
          </button>
          <button className="modal-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    )
  );
};

const SongCard = ({ song, selectedSong, handleSongClick, refresh }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleSongDelete = () => {
    // Show a confirmation popup
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${song.originalName}"?`
    );

    if (confirmDelete) {
      axios
        .delete(`${process.env.REACT_APP_SONG_API_BASE}/${song.id}`)
        .then(() => refresh())
        .catch((err) => console.log(err));
    }
  };

  return (
    <div
      key={song.id}
      className={`song-card ${selectedSong?.id === song.id ? "selected" : ""}`}
    >
      <EditCoverImageModal
        songId={song.id}
        isVisible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        refresh={refresh}
      />
      <div className="song-cover">
        <button
          className="edit-button"
          onClick={() => setEditModalVisible(true)}
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
        {song.coverImageData && (
          <img
            className="cover-image"
            src={`data:image/jpeg;base64,${song.coverImageData}`}
            alt={`Cover for ${song.originalName}`}
          />
        )}
      </div>
      <div className="card-song-title">
        {song.originalName.substr(0, 16)}...
      </div>
      <div style={{ display: "flow" }}>
        <button className="card-delete-button" onClick={handleSongDelete}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
        <button
          className="card-play-button"
          onClick={() => handleSongClick(song)}
        >
          <FontAwesomeIcon icon={faPlay} /> &nbsp; Play
        </button>
      </div>
    </div>
  );
};

export default SongCard;
