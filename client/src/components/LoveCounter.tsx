import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Timer, Star } from 'lucide-react';

interface LoveCounterProps {
  startDate: Date;
  className?: string;
}

interface TimeUnit {
  value: number;
  label: string;
  icon: string;
}

const getCounterIcon = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'calendar': Calendar,
    'clock': Clock,
    'timer': Timer,
    'star': Star,
  };
  return iconMap[iconName] || Star;
};

export default function LoveCounter({ startDate, className = '' }: LoveCounterProps) {
  const [timeUnits, setTimeUnits] = useState<TimeUnit[]>([]);

  useEffect(() => {
    const updateCounter = () => {
      const now = new Date();
      const diff = now.getTime() - startDate.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUnits([
        { value: days, label: 'Days', icon: 'calendar' },
        { value: hours, label: 'Hours', icon: 'clock' },
        { value: minutes, label: 'Minutes', icon: 'timer' },
        { value: seconds, label: 'Seconds', icon: 'star' }
      ]);
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <section className={`py-16 px-4 ${className}`} data-testid="love-counter">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-romantic text-primary mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          data-testid="counter-title"
        >
          Time We've Been Together
        </motion.h2>
        
        <motion.p
          className="text-lg text-muted-foreground mb-12 font-display"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Every moment with you is a treasure ✨
        </motion.p>

        <div className="grid grid-cols-4 gap-2 md:gap-6">
          {timeUnits.map((unit, index) => (
            <motion.div
              key={unit.label}
              className="bg-card rounded-2xl p-6 shadow-lg hover-elevate"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              data-testid={`counter-${unit.label.toLowerCase()}`}
            >
              <div className="flex justify-center mb-2">
                {(() => {
                  const IconComponent = getCounterIcon(unit.icon);
                  return <IconComponent className="w-8 h-8 text-primary" />;
                })()}
              </div>
              <motion.div
                className="text-3xl md:text-4xl font-bold text-primary mb-2"
                key={unit.value}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {unit.value.toLocaleString()}
              </motion.div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {unit.label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-lg font-display text-card-foreground">
            "In all the time we've been together, you continue to make my heart skip a beat every single day 💝"
          </p>
        </motion.div>
      </div>
    </section>
  );
}