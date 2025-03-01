// src/UploadModal.jsx

import React, { useState } from "react";
import axios from "axios";
import "./UploadModal.css";

// Modal component for uploading song and cover image
const UploadModal = ({ isVisible, onClose, onSubmit }) => {
  const [songFile, setSongFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [isProtected, setIsProtected] = useState(true); // Checkbox default to selected

  const handleSongFileChange = (event) => {
    setSongFile(event.target.files[0]);
  };

  const handleCoverImageChange = (event) => {
    setCoverImage(event.target.files[0]);
  };

  const handleCheckboxChange = (event) => {
    setIsProtected(event.target.checked);
  };

  const handleSubmit = () => {
    if (songFile && coverImage) {
      const formData = new FormData();
      formData.append("songFilePath", songFile);
      formData.append("coverImagePath", coverImage);

      // Making POST request to upload song and cover image
      axios
        .post("http://localhost:8080/api/songs/upload", formData, {
          headers: {
            accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          console.log("Upload successful", response.data);

          const songId = response.data.id;

          // Call API to update protection policy based on checkbox state
          axios
            .put(
              `http://localhost:8080/api/songs/update-protection-policy/${songId}?vaultProtected=${isProtected}`
            )
            .then(() => {
              console.log("Protection policy updated successfully");
              onSubmit(); // Call parent callback to refresh song list
              onClose(); // Close modal after submission
            })
            .catch((error) => {
              console.error("Failed to update protection policy", error);
            });
        })
        .catch((error) => {
          console.error("Upload failed", error);
        });
    } else {
      alert("Please select both a song and a cover image.");
    }
  };

  return (
    isVisible && (
      <div className="modal-overlay">
        <div className="upload-modal-content">
          <h2>Upload Song</h2>
          <div className="form-group">
            <label>Song File (MP3):</label>
            <input
              type="file"
              onChange={handleSongFileChange}
              accept="audio/mpeg"
            />
          </div>
          <div className="form-group">
            <label>Cover Image:</label>
            <input
              type="file"
              onChange={handleCoverImageChange}
              accept="image/*"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isProtected}
                onChange={handleCheckboxChange}
              />
              Protected
            </label>
          </div>
          <button className="modal-button" onClick={handleSubmit}>
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

export default UploadModal;
