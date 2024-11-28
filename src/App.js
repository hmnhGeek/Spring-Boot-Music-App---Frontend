import axios from "axios";
import { useEffect, useState } from "react";
import SongPlayer from "./SongPlayer";

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
    <div>
      <ul>
        {songsList.map((x) => (
          <li
            key={x.id}
            onClick={() => setSelectedSong(x.id)} // Update selected song on click
            style={{
              cursor: "pointer",
              padding: "10px",
              background: selectedSong === x.id ? "#f0f0f0" : "transparent",
            }}
          >
            {x.originalName}
          </li>
        ))}
      </ul>
      {selectedSong && <SongPlayer songId={selectedSong} />}{" "}
      {/* Play song immediately */}
    </div>
  );
};

export default App;
