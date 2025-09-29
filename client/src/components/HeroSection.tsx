import { motion } from 'framer-motion';
import FloatingElements from './FloatingElements';

interface HeroSectionProps {
  girlfriendName: string;
  onEnterSite?: () => void;
}

export default function HeroSection({ girlfriendName, onEnterSite }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-card to-primary/10">
      {/* Floating Elements Background */}
      <FloatingElements type="hearts" count={5} />
      <FloatingElements type="balloons" count={3} />
      
      {/* Hero Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Main Title */}
          <motion.h1 
            className="text-6xl md:text-8xl font-romantic font-bold text-primary animate-glow"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
            data-testid="hero-title"
          >
            Happy Birthday
          </motion.h1>
          
          <motion.div
            className="text-5xl md:text-7xl font-elegant text-primary animate-heartbeat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2, ease: "easeOut" }}
            data-testid="hero-name"
          >
            Madamji
          </motion.div>
          
          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground font-display max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.5, ease: "easeOut" }}
            data-testid="hero-subtitle"
          >
            Today is all about celebrating the most amazing person in my world 💕
          </motion.p>
          
          {/* Enter Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3, ease: "easeOut" }}
          >
            <button
              onClick={onEnterSite}
              className="px-8 py-4 text-lg font-medium bg-primary text-primary-foreground rounded-full shadow-lg hover-elevate transform transition-all duration-300 hover:scale-105"
              data-testid="button-enter-site"
            >
              ✨ Enter the Celebration ✨
            </button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent z-10" />
    </section>
  );
}