import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoiceMessageProps {
  audioSrc: string;
  autoPlay?: boolean;
  className?: string;
  onEnded?: () => void;
  onPlay?: () => void;
  isPlaying?: boolean;
  onPause?: (index: number) => void;
  index?: number;
}

export default function VoiceMessage({ 
  audioSrc, 
  autoPlay = false, 
  className = '', 
  onEnded,
  onPlay,
  isPlaying: externalIsPlaying,
  onPause,
  index = 0
}: VoiceMessageProps) {
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Use external isPlaying if provided, otherwise use internal state
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;

  // Generate stable waveform bar heights once
  const waveformBars = useMemo(() => 
    Array.from({ length: 20 }, () => Math.random() * 20 + 8),
    []
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = async () => {
      setDuration(audio.duration);
      setIsLoaded(true);
      if (autoPlay) {
        try {
          await audio.play();
          setInternalIsPlaying(true);
          onPlay?.();
        } catch (error) {
          console.log('Autoplay was prevented by the browser:', error);
          setInternalIsPlaying(false);
        }
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setInternalIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };

    const handlePlay = () => {
      setInternalIsPlaying(true);
      onPlay?.();
    };
    const handlePause = () => {
      setInternalIsPlaying(false);
      onPause?.(index);
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [autoPlay]);

  // Handle external playback control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || externalIsPlaying === undefined) return;

    if (externalIsPlaying && audio.paused) {
      audio.play().catch((error) => {
        console.error('Failed to play audio externally:', error);
      });
    } else if (!externalIsPlaying && !audio.paused) {
      audio.pause();
    }
  }, [externalIsPlaying]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      try {
        await audio.play();
      } catch (error) {
        console.error('Failed to play audio:', error);
        setInternalIsPlaying(false);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      className={`bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-4 max-w-sm mx-auto cursor-pointer ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      onClick={togglePlayPause}
      data-testid="voice-message"
    >
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
      
      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          className="w-10 h-10 bg-primary hover:bg-primary/80 rounded-full flex items-center justify-center text-primary-foreground shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!isLoaded}
          data-testid="button-play-pause"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 ml-0.5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </motion.button>

        {/* Waveform & Progress */}
        <div className="flex-1 space-y-2">
          {/* Voice Icon & Duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Volume2 className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Voice Message</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {isLoaded ? formatTime(duration - currentTime) : '0:00'}
            </span>
          </div>

          {/* Waveform Bars */}
          <div className="flex items-center space-x-1 h-8">
            {waveformBars.map((barHeight, i) => {
              const isActive = progressPercentage > (i / waveformBars.length) * 100;
              
              return (
                <motion.div
                  key={i}
                  className={`w-1 rounded-full transition-colors duration-150 ${
                    isActive 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`}
                  style={{ height: `${barHeight}px` }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                />
              );
            })}
          </div>
        </div>

        {/* Heart icon to show it's a love message */}
        <div className="text-red-500">
          💕
        </div>
      </div>
    </motion.div>
  );
}