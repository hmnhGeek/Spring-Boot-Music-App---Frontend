import { useEffect, useRef, useState } from "react";
import "./SongPlayer.css";

const SongPlayer = ({ song, isMinimized, setIsMinimized }) => {
  const [audioSrc, setAudioSrc] = useState(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [coverImage, setCoverImage] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!song) return;

    const fetchSong = async () => {
      try {
        setError(null);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsPlaying(false);
        }

        const response = await fetch(
          `${process.env.REACT_APP_SONG_API_BASE}/get-song/${song.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch song: " + response.statusText);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
      } catch (err) {
        setError("Could not load the song. Please try again.");
        console.error(err);
      }
    };

    const fetchCoverImage = async () => {
      try {
        setCoverImage(null);

        const coverResponse = await fetch(
          `${process.env.REACT_APP_SONG_API_BASE}/get-song-cover-image/${song.id}`
        );
        if (!coverResponse.ok) {
          throw new Error(
            "Failed to fetch cover image: " + coverResponse.statusText
          );
        }

        const blob = await coverResponse.blob();
        const coverUrl = URL.createObjectURL(blob);
        setCoverImage(coverUrl);
      } catch (err) {
        setError("Could not load the cover image. Please try again.");
        console.error(err);
      }
    };

    fetchSong();
    fetchCoverImage();

    return () => {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
      if (coverImage) {
        URL.revokeObjectURL(coverImage);
      }
    };
  }, [song]);

  useEffect(() => {
    if (audioRef.current && audioSrc) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Playback started.");
            })
            .catch((error) => {
              setError("Could not autoplay the song. Please try manually.");
              console.error(error);
            });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [audioSrc, isPlaying]);

  useEffect(() => {
    if (audioRef.current && audioSrc && !isPlaying) {
      setIsPlaying(true);
    }
  }, [audioSrc]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((currentTime / duration) * 100);
    }
  };

  return (
    <div
      className={`player-container ${isMinimized ? "minimized" : "expanded"}`}
    >
      {/* Minimized version (horizontal strip) */}
      {isMinimized && (
        <div className="minimized-strip" onClick={() => setIsMinimized(false)}>
          <img src={coverImage} alt="Song Cover" className="cover-small" />
          <span className="song-title-small">{song.originalName}</span>
        </div>
      )}

      {/* Full player view */}
      {!isMinimized && (
        <>
          <button className="minimize-btn" onClick={() => setIsMinimized(true)}>
            Minimize
          </button>
          <div className="player">
            <div className="header">
              <div className="song-title">{song.originalName}</div>
            </div>

            <div className="cover-container">
              <img src={coverImage} alt="Song Cover" className="cover-image" />
            </div>

            <div className="progress-bar-container">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => {
                  if (audioRef.current) {
                    const duration = audioRef.current.duration;
                    audioRef.current.currentTime =
                      (e.target.value / 100) * duration;
                  }
                }}
                className="progress-bar"
              />
            </div>

            <div className="play-pause-btn-container">
              <button
                className={`play-pause-btn ${isPlaying ? "playing" : ""}`}
                onClick={togglePlayPause}
              >
                {isPlaying ? "▶" : "⏸"}
              </button>
            </div>

            <audio
              ref={audioRef}
              src={audioSrc}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SongPlayer;
