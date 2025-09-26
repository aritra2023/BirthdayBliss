import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  src?: string;
  autoPlay?: boolean;
  className?: string;
}

export default function AudioPlayer({ src, autoPlay = false, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = volume;
    
    if (autoPlay) {
      // Attempt to play, but handle autoplay restrictions
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [autoPlay, volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        console.log('Audio play failed');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Mock audio since we don't have an actual audio file
  const hasSrc = Boolean(src);

  return (
    <motion.div
      className={`fixed bottom-6 right-6 bg-card/90 backdrop-blur-sm rounded-full p-4 shadow-lg z-40 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      data-testid="audio-player"
    >
      {hasSrc && (
        <audio
          ref={audioRef}
          src={src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
      
      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="p-2 rounded-full bg-primary text-primary-foreground hover-elevate"
          data-testid="button-play-pause"
          disabled={!hasSrc}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>

        {/* Volume Control */}
        <button
          onClick={toggleMute}
          className="p-2 rounded-full hover-elevate"
          data-testid="button-mute"
          disabled={!hasSrc}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Volume Slider */}
        <div className="hidden md:block">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
            disabled={!hasSrc}
            data-testid="volume-slider"
          />
        </div>

        {/* Music Note Animation */}
        <motion.div
          animate={isPlaying ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-primary"
        >
          🎵
        </motion.div>
      </div>

      {!hasSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Audio Preview</span>
        </div>
      )}
    </motion.div>
  );
}