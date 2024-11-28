import axios from "axios";
import { useEffect, useState } from "react";
import SongPlayer from "./SongPlayer";
import "./App.css"; // Make sure to import the CSS file

const App = () => {
  const [songsList, setSongsList] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SONG_API_BASE}/get-song-list`)
      .then((response) => {
        setSongsList(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <div className="app-container">
      {/* Left section for song list */}
      <div className={`left-section ${selectedSong ? "with-player" : ""}`}>
        <ul>
          {songsList.map((x) => (
            <li
              key={x.id}
              onClick={() => setSelectedSong(x)} // Update selected song on click
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

      {/* Right section for the player */}
      {selectedSong && (
        <div className="right-section">
          <SongPlayer
            songId={selectedSong.id}
            songTitle={selectedSong.originalName}
          />
        </div>
      )}
    </div>
  );
};

export default App;
