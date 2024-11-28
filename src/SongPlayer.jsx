import { useEffect, useRef, useState } from "react";
import "./SongPlayer.css"; // Importing the CSS for styling

const SongPlayer = ({ songId }) => {
  const [audioSrc, setAudioSrc] = useState(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false); // State to manage play/pause
  const [progress, setProgress] = useState(0); // State for progress bar
  const [coverImage, setCoverImage] = useState(null); // State for the cover image
  const audioRef = useRef(null);

  useEffect(() => {
    if (!songId) return;

    // Function to fetch the audio file
    const fetchSong = async () => {
      try {
        setError(null); // Clear previous errors
        setAudioSrc(null); // Clear previous audio source
        setProgress(0); // Reset progress
        if (audioRef.current) {
          audioRef.current.pause(); // Stop the current audio if playing
          audioRef.current.currentTime = 0; // Reset the current time
          setIsPlaying(false); // Ensure the state reflects that it's stopped
        }

        // Fetch the song file
        const response = await fetch(
          `${process.env.REACT_APP_SONG_API_BASE}/get-song/${songId}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch song: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioSrc(url); // Set the audio source
      } catch (err) {
        setError("Could not load the song. Please try again.");
        console.error(err);
      }
    };

    // Fetch the cover image
    const fetchCoverImage = async () => {
      try {
        const coverResponse = await fetch(
          `${process.env.REACT_APP_SONG_API_BASE}/get-song-cover-image/${songId}`
        );
        if (!coverResponse.ok) {
          throw new Error(
            `Failed to fetch cover image: ${coverResponse.statusText}`
          );
        }

        const blob = await coverResponse.blob();
        const coverUrl = URL.createObjectURL(blob);
        setCoverImage(coverUrl); // Set the cover image URL
      } catch (err) {
        setError("Could not load the cover image. Please try again.");
        console.error(err);
      }
    };

    fetchSong();
    fetchCoverImage();

    // Cleanup the blob URLs to prevent memory leaks
    return () => {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
      if (coverImage) {
        URL.revokeObjectURL(coverImage);
      }
    };
  }, [songId]); // Depend on `songId` to refetch both song and cover image when it changes

  // Automatically play the song once the audioSrc is available and isPlaying is true
  useEffect(() => {
    if (audioRef.current && audioSrc) {
      if (isPlaying) {
        audioRef.current.play(); // Play the song when `isPlaying` is true
      } else {
        audioRef.current.pause(); // Pause when `isPlaying` is false
      }
    }
  }, [audioSrc, isPlaying]); // Trigger this effect when audioSrc or isPlaying changes

  // Automatically play the song when a new song is loaded
  useEffect(() => {
    if (audioRef.current && audioSrc && !isPlaying) {
      setIsPlaying(true); // Start playing the song automatically when the audioSrc is set
    }
  }, [audioSrc]); // This effect runs once audioSrc is set

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev); // Toggle the play/pause state
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((currentTime / duration) * 100);
    }
  };

  return (
    <div className="player-container">
      {error && <p className="error-message">{error}</p>}
      {audioSrc && coverImage && (
        <div className="player">
          {/* Song Cover */}
          <div className="cover-container">
            <img src={coverImage} alt="Song Cover" className="cover-image" />
          </div>

          {/* Progress Bar */}
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

          {/* Play/Pause Button */}
          <div className="play-pause-btn-container">
            <button
              className={`play-pause-btn ${isPlaying ? "playing" : ""}`}
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <i className="fa fa-pause" aria-hidden="true"></i>
              ) : (
                <i className="fa fa-play" aria-hidden="true"></i>
              )}
            </button>
          </div>

          {/* Audio Element */}
          <audio
            ref={audioRef}
            src={audioSrc}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      )}
    </div>
  );
};

export default SongPlayer;
