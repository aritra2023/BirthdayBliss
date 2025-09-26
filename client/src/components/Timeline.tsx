import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Sparkles, Heart, Mountain, Home, TreePine } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: string;
}

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'sparkles': Sparkles,
    'heart': Heart,
    'mountain': Mountain,
    'home': Home,
    'tree': TreePine,
  };
  return iconMap[iconName] || Sparkles;
};

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

function TimelineItem({ event, index }: { event: TimelineEvent; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      className="relative mb-8 md:mb-16"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      data-testid={`timeline-item-${index}`}
    >
      {/* Mobile Layout */}
      <div className="md:hidden flex items-start space-x-4">
        {/* Mobile Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
            className="text-primary-foreground"
          >
            {(() => {
              const IconComponent = getIconComponent(event.icon);
              return <IconComponent className="w-5 h-5" />;
            })()}
          </motion.div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 min-w-0">
          <motion.div
            className="bg-card rounded-xl p-4 shadow-lg hover-elevate"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="font-romantic text-lg text-primary font-semibold mb-1">
              {event.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              {event.date}
            </p>
            <p className="text-card-foreground text-sm leading-relaxed">
              {event.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className={`hidden md:flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Content Card */}
        <div className={`w-5/12 ${isEven ? 'pr-8' : 'pl-8'}`}>
          <motion.div
            className="bg-card rounded-2xl p-6 shadow-lg hover-elevate"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? -50 : 50 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 mr-3 text-primary">
                {(() => {
                  const IconComponent = getIconComponent(event.icon);
                  return <IconComponent className="w-6 h-6" />;
                })()}
              </div>
              <h3 className="font-romantic text-xl text-primary font-semibold">
                {event.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3 font-medium">
              {event.date}
            </p>
            <p className="text-card-foreground leading-relaxed">
              {event.description}
            </p>
          </motion.div>
        </div>

        {/* Center Icon */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center z-10 shadow-lg">
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.3, delay: index * 0.2 + 0.3 }}
            className="text-primary-foreground"
          >
            {(() => {
              const IconComponent = getIconComponent(event.icon);
              return <IconComponent className="w-5 h-5" />;
            })()}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Timeline({ events, className = '' }: TimelineProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No timeline events to display
      </div>
    );
  }

  return (
    <section className={`py-16 px-4 ${className}`} data-testid="timeline">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-romantic text-center text-primary mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          data-testid="timeline-title"
        >
          Our Journey Together 💕
        </motion.h2>

        <div className="relative" ref={ref}>
          {/* Mobile Center Line */}
          <motion.div
            className="md:hidden absolute left-9 top-10 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent"
            initial={{ height: 0 }}
            animate={isInView ? { height: '90%' } : { height: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Desktop Center Line */}
          <motion.div
            className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent"
            initial={{ height: 0 }}
            animate={isInView ? { height: '100%' } : { height: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            style={{ top: '48px' }}
          />

          {/* Timeline Items */}
          <div className="relative px-4 md:px-0">
            {events.map((event, index) => (
              <TimelineItem key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}