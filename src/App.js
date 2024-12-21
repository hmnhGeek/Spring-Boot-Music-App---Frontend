import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Vault from "./pages/Vault";
import OpenPlaylists from "./pages/OpenPlaylists";
import PlaylistSongs from "./pages/PlaylistSongs";
import VaultPlaylists from "./pages/VaultPlaylists";

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
        <Routes>
          <Route path="/vault" element={<Vault />} />
        </Routes>
        <Routes>
          <Route path="/playlists" element={<OpenPlaylists />} />
        </Routes>
        <Routes>
          <Route path="/protectedPlaylists" element={<VaultPlaylists />} />
        </Routes>
        <Routes>
          <Route path="/playlist" element={<PlaylistSongs />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
