import React from "react";
import "./SongCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDeleteLeft,
  faPlay,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const SongCard = ({ song, selectedSong, handleSongClick, refresh }) => {
  const handleSongDelete = () => {
    axios
      .delete(`${process.env.REACT_APP_SONG_API_BASE}/${song.id}`)
      .then((response) => refresh())
      .catch((err) => console.log(err));
  };

  return (
    <div
      key={song.id}
      className={`song-card ${selectedSong?.id === song.id ? "selected" : ""}`}
    >
      <div className="song-cover">
        {/* Check if coverImageData exists and render the image */}
        {song.coverImageData && (
          <img
            className="cover-image"
            src={`data:image/jpeg;base64,${song.coverImageData}`} // Assuming it's base64 JPEG data
            alt={`Cover for ${song.originalName}`}
          />
        )}
      </div>
      <div className="card-song-title">
        {song.originalName.substr(0, 16)}...
      </div>
      <div style={{ display: "flow" }}>
        <button
          className="card-delete-button"
          onClick={() => handleSongDelete(song)}
        >
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
