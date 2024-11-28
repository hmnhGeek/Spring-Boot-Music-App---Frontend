import { useEffect, useRef, useState } from "react";

const SongPlayer = ({ songId }) => {
  const [audioSrc, setAudioSrc] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!songId) return;

    const fetchSong = async () => {
      try {
        setError(null); // Clear previous errors
        setAudioSrc(null); // Clear previous audio source
        if (audioRef.current) {
          audioRef.current.pause(); // Stop the current audio if playing
          audioRef.current.currentTime = 0; // Reset the current time
        }

        const response = await fetch(
          `${process.env.REACT_APP_SONG_API_BASE}/get-song/${songId}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch song: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
      } catch (err) {
        setError("Could not load the song. Please try again.");
        console.error(err);
      }
    };

    fetchSong();

    // Cleanup the blob URL to prevent memory leaks
    return () => {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [songId]); // Depend on `songId` to refetch when it changes

  useEffect(() => {
    if (audioRef.current && audioSrc) {
      audioRef.current.play(); // Auto-play the song when audio source is updated
    }
  }, [audioSrc]);

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {audioSrc && (
        <audio ref={audioRef} controls>
          <source src={audioSrc} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default SongPlayer;
