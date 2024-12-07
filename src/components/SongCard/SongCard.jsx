import React from "react";
import "./SongCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const SongCard = ({ song, selectedSong, handleSongClick, refresh }) => {
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
      <div className="song-cover">
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
