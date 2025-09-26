import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';

interface Photo {
  id: string;
  src: string;
  caption: string;
}

interface PhotoStackProps {
  photos: Photo[];
  className?: string;
}

export default function PhotoStack({ photos, className = '' }: PhotoStackProps) {
  const [revealedCount, setRevealedCount] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const revealNext = () => {
    if (revealedCount < photos.length) {
      setRevealedCount(prev => prev + 1);
      if (revealedCount + 1 === photos.length) {
        setIsCompleted(true);
      }
    }
  };

  const resetStack = () => {
    setRevealedCount(1);
    setIsCompleted(false);
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No photos to display
      </div>
    );
  }

  return (
    <section className={`py-16 px-4 ${className}`} data-testid="photo-stack">
      <div className="max-w-3xl mx-auto">
        <motion.h2 
          className="text-3xl md:text-4xl lg:text-5xl font-romantic text-center text-primary mb-8 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          data-testid="photo-stack-title"
        >
          Our Beautiful Memories 💕
        </motion.h2>

        <div className="relative max-w-md sm:max-w-lg mx-auto px-2">
          {/* Photo Stack */}
          <div className="relative min-h-[500px] flex flex-col items-center justify-center">
            <div className="relative w-full space-y-4">
              {photos.slice(0, revealedCount).map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className="relative rounded-2xl overflow-hidden shadow-2xl bg-card cursor-pointer w-full"
                  initial={{ 
                    opacity: 0, 
                    y: 100,
                    scale: 0.9,
                    rotateY: -15
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: 1,
                    rotateY: 0
                  }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={index === revealedCount - 1 ? revealNext : undefined}
                  data-testid={`photo-${index}`}
                >
                  <div className="relative bg-white dark:bg-card rounded-2xl overflow-hidden">
                    {/* Image Container with Equal Padding */}
                    <div className="p-4 sm:p-6 flex items-center justify-center">
                      <img 
                        src={photo.src} 
                        alt={`Memory ${index + 1}`}
                        className="max-w-full h-auto object-contain max-h-[350px] sm:max-h-[450px] rounded-lg shadow-sm"
                        style={{ 
                          aspectRatio: 'auto',
                          minHeight: '180px'
                        }}
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    </div>
                    {/* Fallback placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center text-center text-muted-foreground hidden">
                      <div>
                        <div className="text-6xl mb-4">📸</div>
                        <p className="text-lg">Memory {index + 1}</p>
                        <p className="text-sm mt-2 max-w-xs mx-auto opacity-60">Loading image...</p>
                      </div>
                    </div>
                    
                    {/* Tap Indicator for Latest Photo */}
                    {index === revealedCount - 1 && !isCompleted && (
                      <motion.div
                        className="absolute inset-0 bg-primary/10 rounded-xl flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="bg-white/90 dark:bg-card/90 rounded-full px-4 py-2 flex items-center space-x-2">
                          <span className="text-sm font-medium text-primary">Tap to reveal next</span>
                          <ArrowRight className="w-4 h-4 text-primary" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Caption */}
                  <div className="p-4 sm:p-6 bg-card/95 backdrop-blur-sm">
                    <p className="text-center text-card-foreground font-display text-sm sm:text-base leading-relaxed">
                      {photo.caption}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Completion Message & Reset */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="inline-flex items-center space-x-2 text-primary font-romantic text-lg mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.8, repeat: 1 }}
                >
                  <Heart className="w-6 h-6" />
                  <span>All our precious memories revealed!</span>
                  <Heart className="w-6 h-6" />
                </motion.div>
                
                <motion.button
                  onClick={resetStack}
                  className="bg-primary/10 hover:bg-primary/20 text-primary px-6 py-2 rounded-full font-medium transition-colors hover-elevate"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid="button-reset-stack"
                >
                  Experience Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Indicator */}
          <div className="mt-8 text-center">
            <div className="flex justify-center items-center space-x-1 mb-2">
              {photos.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index < revealedCount ? 'bg-primary' : 'bg-muted'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: index < revealedCount ? 1 : 0.5 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {revealedCount} of {photos.length} memories revealed
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}