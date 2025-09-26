import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface FloatingElementsProps {
  type: 'balloons' | 'hearts' | 'confetti';
  count?: number;
  className?: string;
}

export default function FloatingElements({ type, count = 20, className = '' }: FloatingElementsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getElementContent = (index: number) => {
    switch (type) {
      case 'balloons':
        const balloonColors = ['🎈', '🎈', '🎈'];
        return <span className="text-4xl">{balloonColors[index % balloonColors.length]}</span>;
      case 'hearts':
        const heartStyles = ['text-primary', 'text-pink-400', 'text-red-400'];
        return <span className={`text-2xl ${heartStyles[index % heartStyles.length]}`}>❤️</span>;
      case 'confetti':
        const confettiColors = ['bg-primary', 'bg-pink-400', 'bg-yellow-400', 'bg-purple-400'];
        return <div className={`w-2 h-2 ${confettiColors[index % confettiColors.length]} rounded`}></div>;
      default:
        return null;
    }
  };

  const getAnimationVariants = (index: number) => {
    const delay = Math.random() * 2;
    const duration = 4 + Math.random() * 4;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    
    return {
      initial: { 
        x, 
        y: window.innerHeight + 50, 
        opacity: 0,
        rotate: 0 
      },
      animate: {
        x: x + (Math.random() - 0.5) * 200,
        y: type === 'confetti' ? -100 : y,
        opacity: [0, 1, 1, 0],
        rotate: type === 'confetti' ? 360 : 0,
      },
      transition: {
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut"
      }
    };
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-10 overflow-hidden ${className}`}
      data-testid={`floating-${type}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute"
          {...getAnimationVariants(index)}
        >
          {getElementContent(index)}
        </motion.div>
      ))}
    </div>
  );
}