import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Lock, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface CountdownData {
  hasActiveCountdown: boolean;
  targetDate?: string;
  timeLeft?: number;
  setBy?: string;
  isAccessible?: boolean;
  countdownEnded?: boolean;
  message?: string;
}

interface CountdownDisplayProps {
  onAccessGranted?: () => void;
}

export default function CountdownDisplay({ onAccessGranted }: CountdownDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const { data: countdownData, refetch } = useQuery<CountdownData>({
    queryKey: ['/api/countdown'],
    refetchInterval: 1000, // Refetch every second
  });

  useEffect(() => {
    if (countdownData?.hasActiveCountdown && countdownData?.targetDate) {
      const updateTimer = () => {
        const target = new Date(countdownData.targetDate!);
        const now = new Date();
        const difference = target.getTime() - now.getTime();

        if (difference <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          // Refetch to check if countdown ended
          refetch();
          if (onAccessGranted) {
            onAccessGranted();
          }
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);

      return () => clearInterval(timer);
    }
  }, [countdownData, refetch, onAccessGranted]);

  // If no active countdown or countdown ended, return null
  if (!countdownData?.hasActiveCountdown || countdownData?.countdownEnded) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-2xl mx-auto p-8 text-center">
        {/* Lock Icon */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-6 rounded-full bg-primary/20 border border-primary/50">
            <Lock className="w-16 h-16 text-primary" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-white mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Site is Locked 🔒
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl text-gray-300 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          The celebration will begin soon!
        </motion.p>

        {/* Countdown Timer */}
        <motion.div
          className="grid grid-cols-4 gap-4 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {[
            { value: timeLeft.days, label: 'Days' },
            { value: timeLeft.hours, label: 'Hours' },
            { value: timeLeft.minutes, label: 'Minutes' },
            { value: timeLeft.seconds, label: 'Seconds' },
          ].map((item, index) => (
            <div key={item.label} className="bg-card/20 backdrop-blur-sm rounded-lg p-4 border border-primary/30">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-300">{item.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Set By Info */}
        {countdownData?.setBy && (
          <motion.div
            className="flex items-center justify-center space-x-2 text-gray-400 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <Clock className="w-4 h-4" />
            <span>Timer set by: {countdownData.setBy}</span>
          </motion.div>
        )}

        {/* Target Time */}
        {countdownData?.targetDate && (
          <motion.div
            className="text-gray-500 text-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            Unlocks on: {new Date(countdownData.targetDate).toLocaleString()}
          </motion.div>
        )}

        {/* Bot Instructions */}
        <motion.div
          className="mt-8 p-4 bg-card/10 rounded-lg border border-primary/20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          <p className="text-gray-300 text-sm">
            🤖 To manage the countdown, use the Telegram bot with commands:
          </p>
          <div className="mt-2 text-xs text-gray-400">
            <code>/start</code> - Check status • <code>/settime DD/MM/YYYY_HH:MM AM/PM</code> - Set timer
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}