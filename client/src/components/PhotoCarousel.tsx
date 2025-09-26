import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Photo {
  id: string;
  src: string;
  caption: string;
}

interface PhotoCarouselProps {
  photos: Photo[];
  className?: string;
}

export default function PhotoCarousel({ photos, className = '' }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const constraintsRef = useRef(null);

  const x = useMotionValue(0);
  const scale = useTransform(x, [-150, 0, 150], [0.9, 1, 0.9]);
  const rotate = useTransform(x, [-150, 0, 150], [-15, 0, 15]);

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No photos to display
      </div>
    );
  }

  return (
    <section className={`py-16 px-4 ${className}`} data-testid="photo-carousel">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          className="text-4xl md:text-5xl font-romantic text-center text-primary mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          data-testid="carousel-title"
        >
          Our Beautiful Memories 💕
        </motion.h2>

        <div className="relative" ref={constraintsRef}>
          {/* Main Photo Display */}
          <div className="flex justify-center items-center min-h-[400px] relative">
            <motion.div
              className="relative w-full max-w-lg"
              style={{ scale, rotate }}
              drag="x"
              dragConstraints={constraintsRef}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) {
                  prevPhoto();
                } else if (info.offset.x < -100) {
                  nextPhoto();
                }
              }}
            >
              <motion.div
                key={currentIndex}
                className="relative rounded-2xl overflow-hidden shadow-xl bg-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                data-testid={`photo-${currentIndex}`}
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="text-6xl mb-4">📸</div>
                    <p className="text-lg">Photo {currentIndex + 1}</p>
                    <p className="text-sm mt-2 max-w-xs mx-auto">{photos[currentIndex].src}</p>
                  </div>
                </div>
                
                {/* Caption */}
                <div className="p-6 bg-card">
                  <p className="text-center text-card-foreground font-display text-lg leading-relaxed">
                    {photos[currentIndex].caption}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevPhoto}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-card/80 backdrop-blur-sm rounded-full shadow-lg hover-elevate"
            data-testid="button-prev-photo"
          >
            <ChevronLeft className="w-6 h-6 text-card-foreground" />
          </button>
          
          <button
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-card/80 backdrop-blur-sm rounded-full shadow-lg hover-elevate"
            data-testid="button-next-photo"
          >
            <ChevronRight className="w-6 h-6 text-card-foreground" />
          </button>
        </div>

        {/* Photo Indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted hover-elevate'
              }`}
              data-testid={`indicator-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}