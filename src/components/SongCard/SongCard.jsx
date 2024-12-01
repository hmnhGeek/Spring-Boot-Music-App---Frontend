import React from "react";
import "./SongCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

const SongCard = ({ song, selectedSong, handleSongClick }) => {
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
      <div>
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
