import React from "react";
import "./SongCard.css";

const SongCard = ({ song, selectedSong, handleSongClick }) => {
  return (
    <div
      key={song.id}
      className={`song-card ${selectedSong?.id === song.id ? "selected" : ""}`}
      onClick={() => handleSongClick(song)} // Update selected song on click
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
      <div className="card-song-title">{song.originalName}</div>
    </div>
  );
};

export default SongCard;
