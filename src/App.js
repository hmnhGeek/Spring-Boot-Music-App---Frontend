import axios from "axios";
import { useEffect, useState } from "react";
import SongPlayer from "./SongPlayer";
import "./App.css";

const App = () => {
  const [songsList, setSongsList] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SONG_API_BASE}/get-song-list`)
      .then((response) => {
        setSongsList(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleSongClick = (song) => {
    setSelectedSong(song);
    setIsMinimized(false); // Reset minimize when a new song is clicked
  };

  return (
    <div className="app-container">
      {/* Song List */}
      <div className="song-list">
        <ul>
          {songsList.map((x) => (
            <li
              key={x.id}
              onClick={() => handleSongClick(x)} // Update selected song on click
              style={{
                cursor: "pointer",
                padding: "10px",
                background:
                  selectedSong?.id === x.id ? "#f0f0f0" : "transparent",
              }}
            >
              {x.originalName}
            </li>
          ))}
        </ul>
      </div>

      {/* Song Player */}
      {selectedSong && (
        <SongPlayer
          song={selectedSong}
          isMinimized={isMinimized}
          setIsMinimized={setIsMinimized}
        />
      )}
    </div>
  );
};

export default App;
