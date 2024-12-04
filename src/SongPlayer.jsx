import { useEffect, useRef, useState } from "react";
import "./SongPlayer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faMinimize } from "@fortawesome/free-solid-svg-icons";

const SongPlayer = ({ song, isMinimized, setIsMinimized }) => {
  const [audioSrc, setAudioSrc] = useState(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [coverImage, setCoverImage] = useState(null);
  const [dominantColor, setDominantColor] = useState(null); // Store the dominant color
  const [textColor, setTextColor] = useState(null); // Store the text color
  const audioRef = useRef(null);

  // Function to get the dominant color from an image using canvas
  const getDominantColor = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = "Anonymous"; // To avoid CORS issues if the image is from a different domain
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const width = img.width;
        const height = img.height;

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;

        let r = 0,
          g = 0,
          b = 0;

        // Loop through all pixels to average the color
        for (let i = 0; i < pixels.length; i += 4) {
          r += pixels[i];
          g += pixels[i + 1];
          b += pixels[i + 2];
        }

        const pixelCount = pixels.length / 4;
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        resolve(`rgb(${r},${g},${b})`);
      };
      img.onerror = reject;
    });
  };

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

        // Extract the dominant color from the cover image
        const dominantColor = await getDominantColor(coverUrl);
        setDominantColor(dominantColor);

        // Calculate and set the text color
        const calculatedTextColor = calculateTextColor(dominantColor);
        setTextColor(calculatedTextColor);
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

  const calculateTextColor = (rgb) => {
    const [r, g, b] = rgb
      .match(/\d+/g)
      .map(Number)
      .map((v) => v / 255); // Normalize to 0–1
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.5 ? "#000" : "#fff"; // Black text for light background, white for dark
  };

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
      style={{
        backgroundColor: dominantColor, // Set the background color dynamically
        color: textColor,
      }}
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
            style={{ color: textColor }}
          >
            {song.originalName}
          </span>

          <div className="play-pause-btn-container">
            <button
              onClick={togglePlayPause}
              style={{ backgroundColor: dominantColor, color: textColor }}
              className="play-pause-btn"
            >
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
          <div style={{ float: "right" }}>
            <button
              className="minimize-btn"
              onClick={() => setIsMinimized(true)}
              style={{ color: textColor }}
            >
              <FontAwesomeIcon icon={faMinimize} />
            </button>
          </div>
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
                onClick={togglePlayPause}
                className="play-pause-btn"
                style={{ backgroundColor: dominantColor, color: textColor }}
              >
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
