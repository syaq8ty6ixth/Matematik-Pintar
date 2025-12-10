import React, { useState, useRef, useEffect } from 'react';

export const AudioControl: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // URL for a royalty-free happy upbeat background music suitable for kids
  const MUSIC_URL = "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3"; 

  useEffect(() => {
    // Attempt to play on mount
    const playAudio = async () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.15; // Keep volume low so it doesn't distract
        try {
          await audioRef.current.play();
          setIsMuted(false);
        } catch (err) {
          // Autoplay blocked by browser policy
          console.log("Autoplay blocked, waiting for user interaction");
          setIsMuted(true);
        }
      }
    };

    // Add a global click listener to start music if autoplay was blocked
    const handleFirstInteraction = () => {
      if (audioRef.current && audioRef.current.paused && !isMuted) {
         audioRef.current.play().catch(e => console.log(e));
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    playAudio();

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-fade-in-up">
      <button
        onClick={toggleMute}
        className={`
          flex items-center justify-center w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-300 transform hover:scale-110 active:scale-95
          ${isMuted 
            ? 'bg-gray-200 border-gray-300 text-gray-500' 
            : 'bg-yellow-400 border-yellow-500 text-yellow-900 animate-pulse'}
        `}
        title={isMuted ? "Mainkan Muzik" : "Senyapkan Muzik"}
      >
        <span className="text-2xl">
          {isMuted ? '🔇' : '🎵'}
        </span>
      </button>
      
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={MUSIC_URL} 
        loop 
      />
    </div>
  );
};