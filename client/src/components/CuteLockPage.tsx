import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Lock, Clock, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CuteLockPageProps {
  targetDate?: string;
  timeLeft?: number;
  onAccessGranted?: () => void;
}

export default function CuteLockPage({ targetDate, timeLeft, onAccessGranted }: CuteLockPageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notification, setNotification] = useState<string>('');
  
  // Request notification permission on component mount
  useEffect(() => {
    requestNotificationPermission();
    trackVisitor();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotification('✅ Notifications enabled! You\'ll get a special message when it\'s time! 🎉');
      } else if (permission === 'denied') {
        setNotification('❌ Notifications blocked. You\'ll miss the special birthday surprise! 💔');
      }
    }
  };

  // Track visitor access
  const trackVisitor = async () => {
    try {
      await fetch('/api/track-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          ip: 'visitor'
        })
      });
    } catch (error) {
      console.log('Failed to track visitor:', error);
    }
  };

  // Check if birthday time has arrived
  const checkBirthdayTime = () => {
    if (targetDate) {
      const target = new Date(targetDate);
      const now = new Date();
      
      if (now >= target) {
        // Send birthday notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🎉 Happy Birthday Madamji! 🎂', {
            body: 'The special day has arrived! Click to see your surprise! 💖',
            icon: '/birthday-icon.png',
            badge: '/birthday-badge.png'
          });
        }
        
        if (onAccessGranted) {
          onAccessGranted();
        }
      }
    }
  };

  useEffect(() => {
    checkBirthdayTime();
    const interval = setInterval(checkBirthdayTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onAccessGranted]);

  const formatTimeLeft = () => {
    if (!timeLeft) return 'Loading...';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const timeComponents = formatTimeLeft();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-rose-100 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-rose-900/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Cute Lock Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            <Lock className="w-24 h-24 text-pink-500 mx-auto mb-4" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-pink-600 dark:text-pink-300 mb-2"
            data-testid="lock-page-title"
          >
            🔒 Something Special is Coming! 🎂
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-600 dark:text-gray-300 text-lg mb-6"
          >
            A magical birthday surprise is waiting... ✨
          </motion.p>
        </motion.div>

        {/* Countdown Timer */}
        {timeLeft && typeof timeComponents === 'object' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6"
          >
            <div className="grid grid-cols-4 gap-4 text-center">
              {[
                { value: timeComponents.days, label: 'Days', icon: '📅' },
                { value: timeComponents.hours, label: 'Hours', icon: '⏰' },
                { value: timeComponents.minutes, label: 'Minutes', icon: '⏱️' },
                { value: timeComponents.seconds, label: 'Seconds', icon: '⚡' }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-3"
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-300" data-testid={`countdown-${item.label.toLowerCase()}`}>
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Floating Hearts Animation */}
        <div className="relative h-32 overflow-hidden rounded-2xl mb-6">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ y: 120, x: Math.random() * 300, opacity: 0 }}
              animate={{ 
                y: -20, 
                x: Math.random() * 300,
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              <Heart className="w-6 h-6 text-pink-400 fill-pink-300" />
            </motion.div>
          ))}
        </div>

        {/* Notification Status */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 mb-6 text-center"
          >
            <p className="text-sm text-gray-600 dark:text-gray-300" data-testid="notification-status">
              {notification}
            </p>
          </motion.div>
        )}

        {/* Cute message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-pink-400 to-purple-400 rounded-full p-4 inline-block mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            Someone very special is preparing something amazing for you! 💕<br/>
            Keep this page open to get notified when it's ready! 🔔
          </p>
          
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-6"
          >
            <span className="text-4xl">🎁✨💖</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}