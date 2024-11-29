import { useEffect, useRef, useState } from "react";
import "./SongPlayer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";

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
          setProgress(0); // Reset progress when a new song is loaded
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
    if (isPlaying) {
      // Save the current position before pausing
      const currentTime = audioRef.current.currentTime;
      setProgress((currentTime / audioRef.current.duration) * 100);
    }
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
        <div className="minimized-strip">
          <img
            src={coverImage}
            alt="Song Cover"
            className="cover-small"
            onClick={() => setIsMinimized(false)}
          />
          <span
            className="song-title-small"
            onClick={() => setIsMinimized(false)}
          >
            {song.originalName}
          </span>

          <div className="play-pause-btn-container">
            <button onClick={togglePlayPause} className="play-pause-btn">
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
            </button>
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
              <button onClick={togglePlayPause} className="play-pause-btn">
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
              </button>
            </div>
          </div>
        </>
      )}
      {/* Always render audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default SongPlayer;
