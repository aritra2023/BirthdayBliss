import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Heart {
  id: number;
  x: number;
  y: number;
}

export default function FloatingHeartCursor() {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Add new heart
      const newHeart: Heart = {
        id: nextId,
        x: e.clientX,
        y: e.clientY,
      };
      
      setHearts(prev => [...prev, newHeart]);
      setNextId(prev => prev + 1);
      
      // Remove heart after animation
      setTimeout(() => {
        setHearts(prev => prev.filter(heart => heart.id !== newHeart.id));
      }, 2000);
    };

    // Throttle mouse events to avoid performance issues
    let throttleTimer: NodeJS.Timeout | null = null;
    const throttledHandleMouseMove = (e: MouseEvent) => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        handleMouseMove(e);
        throttleTimer = null;
      }, 100);
    };

    document.addEventListener('mousemove', throttledHandleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', throttledHandleMouseMove);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [nextId]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50" data-testid="floating-heart-cursor">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-pink-400 text-sm"
          style={{
            left: heart.x - 8,
            top: heart.y - 8,
          }}
          initial={{ opacity: 1, scale: 0 }}
          animate={{ 
            opacity: 0, 
            scale: 1,
            y: heart.y - 100,
          }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  );
}