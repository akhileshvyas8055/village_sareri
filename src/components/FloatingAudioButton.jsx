import { useState, useEffect } from 'react';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';

// Singleton audio instance shared across the app
export const globalAudio = new Audio('/video/discover.mp4');

const FloatingAudioButton = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const handlePlay = () => {
      setIsPlaying(true);
      setHasPlayed(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    globalAudio.addEventListener('play', handlePlay);
    globalAudio.addEventListener('pause', handlePause);
    globalAudio.addEventListener('ended', handleEnded);

    // If audio is already playing when this mounts
    if (!globalAudio.paused) {
      setIsPlaying(true);
      setHasPlayed(true);
    }

    return () => {
      globalAudio.removeEventListener('play', handlePlay);
      globalAudio.removeEventListener('pause', handlePause);
      globalAudio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const toggleAudio = () => {
    if (globalAudio.paused) {
      globalAudio.play().catch(e => console.log("Playback failed:", e));
    } else {
      globalAudio.pause();
    }
  };

  // Only show the button if the audio has been triggered at least once
  if (!hasPlayed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-fade-in-up">
      <button 
        onClick={toggleAudio}
        className="w-14 h-14 bg-saffron text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,153,51,0.5)] hover:scale-110 hover:shadow-[0_0_30px_rgba(255,153,51,0.8)] transition-all duration-300"
        title={isPlaying ? "Mute Background Audio" : "Play Background Audio"}
      >
        {isPlaying ? <FiVolume2 className="w-6 h-6 animate-pulse" /> : <FiVolumeX className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default FloatingAudioButton;
