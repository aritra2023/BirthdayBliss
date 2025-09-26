import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import FloatingElements from './FloatingElements';

interface FireworksEndingProps {
  className?: string;
}

export default function FireworksEnding({ className = '' }: FireworksEndingProps) {
  const fireworksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create fireworks effect with particles
    const createFirework = () => {
      if (!fireworksRef.current) return;
      
      const firework = document.createElement('div');
      firework.className = 'absolute w-2 h-2 rounded-full animate-confetti';
      firework.style.left = Math.random() * 100 + '%';
      firework.style.top = Math.random() * 100 + '%';
      
      const colors = ['bg-yellow-400', 'bg-pink-400', 'bg-purple-400', 'bg-blue-400', 'bg-green-400'];
      firework.classList.add(colors[Math.floor(Math.random() * colors.length)]);
      
      fireworksRef.current.appendChild(firework);
      
      setTimeout(() => {
        firework.remove();
      }, 3000);
    };

    const interval = setInterval(createFirework, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`} data-testid="fireworks-ending">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
      
      {/* Floating Elements */}
      <FloatingElements type="confetti" count={10} />
      <FloatingElements type="hearts" count={8} />
      
      {/* Fireworks Container */}
      <div ref={fireworksRef} className="absolute inset-0 pointer-events-none" />
      
      {/* Main Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Main Message */}
          <motion.h1
            className="text-6xl md:text-8xl font-romantic font-bold text-primary animate-glow"
            initial={{ y: 50 }}
            whileInView={{ y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            data-testid="ending-title"
          >
            I Love You
          </motion.h1>
          
          <motion.div
            className="text-5xl md:text-7xl font-elegant text-primary animate-heartbeat"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1, ease: "easeOut" }}
            data-testid="ending-forever"
          >
            Forever ❤️
          </motion.div>
          
          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground font-display max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            data-testid="ending-subtitle"
          >
            Thank you for being the most incredible person in my life. Here's to many more birthdays together! 🎉
          </motion.p>
          
          {/* Anniversary Note */}
          <motion.div
            className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
          >
            <p className="text-lg font-display text-card-foreground">
              "Every moment with you is a celebration. Happy Birthday, my love! 💝"
            </p>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent z-10" />
    </section>
  );
}