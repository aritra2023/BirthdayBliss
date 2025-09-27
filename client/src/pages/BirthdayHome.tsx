import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from '@/components/HeroSection';
import TypewriterText from '@/components/TypewriterText';
import PhotoStack from '@/components/PhotoCarousel';
import Timeline from '@/components/Timeline';
import LoveCounter from '@/components/LoveCounter';
import GiftBox from '@/components/GiftBox';
import FireworksEnding from '@/components/FireworksEnding';
import FloatingHeartCursor from '@/components/FloatingHeartCursor';
import AudioPlayer from '@/components/AudioPlayer';

export default function BirthdayHome() {
  const [currentSection, setCurrentSection] = useState(0);
  const [showSurprise, setShowSurprise] = useState(false);

  //todo: replace with real data
  const girlfriendName = "My Love";
  const relationshipStartDate = new Date('2025-03-15T14:59:00');
  
  const personalMessage = `My dearest ${girlfriendName}, 

On this beautiful day that celebrates the wonderful moment you came into this world, I want you to know how incredibly grateful I am to have you in my life. 

Every day with you feels like a gift, and your smile lights up my entire world. You bring so much joy, laughter, and love into everything you touch. 

Today isn't just about celebrating another year of your amazing life - it's about celebrating all the ways you make the world brighter just by being in it.

Happy Birthday, beautiful! I love you more than words could ever express. ❤️`;

  // Import photos
  const photos = [
    {
      id: '1',
      src: new URL('../../../attached_assets/WhatsApp Image 2025-09-27 at 02.41.20_71532eaa_1758922010754.jpg', import.meta.url).href,
      caption: 'Our first video call 💕'
    },
    {
      id: '2', 
      src: new URL('../../../attached_assets/WhatsApp Image 2025-09-27 at 02.41.19_9cf81b1c_1758922030634.jpg', import.meta.url).href,
      caption: 'Ek sath tuition jana - Together through every lesson 📚'
    },
    {
      id: '3',
      src: new URL('../../../attached_assets/WhatsApp Image 2025-09-27 at 02.41.19_b1b35cb0_1758922037145.jpg', import.meta.url).href, 
      caption: 'Game khelna ek sath - Playing games together, making memories 🎮'
    },
    {
      id: '4',
      src: new URL('../../../attached_assets/WhatsApp Image 2025-09-27 at 02.41.20_1b90f551_1758922049819.jpg', import.meta.url).href,
      caption: 'Dono ka haar hapte ka momo date - Our weekly momo tradition 🥟'
    },
    {
      id: '5',
      src: new URL('../../../attached_assets/WhatsApp Image 2025-09-27 at 02.41.20_4ab0d124_1758922061413.jpg', import.meta.url).href,
      caption: 'First movie date - Lost in the story, found in each other 🎬'
    },
    {
      id: '6',
      src: new URL('../../../attached_assets/WhatsApp Image 2025-09-27 at 02.41.19_ac923fee_1758922080619.jpg', import.meta.url).href,
      caption: 'First planned outing - The beginning of our adventures together ✨'
    },
    {
      id: '7',
      src: new URL('../../../attached_assets/WhatsApp Image 2025-09-27 at 02.41.18_bb0f31f6_1758922088573.jpg', import.meta.url).href,
      caption: 'লজ্জাবতী লতা আমার (B) - আমার মনের মাঝে তুমি চিরকাল 💖'
    }
  ];

  const timelineEvents = [
    {
      id: '1',
      date: 'March 2025',
      title: 'Our first video call 💕',
      description: 'The moment we connected through screens but our hearts were already so close. Your smile lit up my entire world.',
      icon: 'video'
    },
    {
      id: '2', 
      date: 'April 2025',
      title: 'Ek sath tuition jana 📚',
      description: 'Together through every lesson, every chapter, every moment of learning. You made studying feel like an adventure.',
      icon: 'book'
    },
    {
      id: '3',
      date: 'May 2025', 
      title: 'Gaming memories 🎮',
      description: 'Playing games together, sharing victories and defeats. Every match was more fun because you were by my side.',
      icon: 'gamepad'
    },
    {
      id: '4',
      date: 'June 2025',
      title: 'Our weekly momo tradition 🥟', 
      description: 'Every week, our special momo dates became the highlight. Simple moments that created the most beautiful memories.',
      icon: 'utensils'
    },
    {
      id: '5',
      date: 'July 2025',
      title: 'First movie date 🎬',
      description: 'Lost in the story on screen, but found something even more beautiful in each other. The perfect date that felt like a dream.',
      icon: 'film'
    },
    {
      id: '6',
      date: 'August 2025',
      title: 'First planned outing ✨',
      description: 'The beginning of our adventures together. Every step we took was the start of our beautiful journey.',
      icon: 'sparkles'
    },
    {
      id: '7',
      date: 'September 2025',
      title: 'লজ্জাবতী লতা আমার 💖',
      description: 'আমার মনের মাঝে তুমি চিরকাল। My shy one, you will forever remain in my heart, bringing joy to every moment.',
      icon: 'heart'
    }
  ];

  const enterSite = () => setCurrentSection(1);
  const showSurpriseSection = () => setShowSurprise(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Floating Heart Cursor */}
      <FloatingHeartCursor />
      
      {/* Audio Player */}
      <AudioPlayer autoPlay />

      {/* Hero Section */}
      <AnimatePresence>
        {currentSection === 0 && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <HeroSection 
              girlfriendName={girlfriendName}
              onEnterSite={enterSite}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence>
        {currentSection >= 1 && (
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="space-y-0"
          >
            {/* Personal Message Section */}
            <section className="py-16 px-4 bg-gradient-to-br from-card to-background">
              <div className="max-w-4xl mx-auto">
                <motion.h2
                  className="text-4xl md:text-5xl font-romantic text-center text-primary mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  data-testid="message-title"
                >
                  A Message From My Heart 💖
                </motion.h2>
                
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                  <TypewriterText 
                    text={personalMessage}
                    delay={500}
                    speed={50}
                    className="text-card-foreground whitespace-pre-line"
                    onComplete={() => console.log('Message complete')}
                  />
                  
                  {!showSurprise && (
                    <motion.div
                      className="text-center mt-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 8 }}
                    >
                      <button
                        onClick={showSurpriseSection}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-full hover-elevate"
                        data-testid="button-click-surprise"
                      >
                        ✨ Click for Surprise ✨
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </section>

            {/* Surprise Sections */}
            <AnimatePresence>
              {showSurprise && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="space-y-0"
                >
                  {/* Photo Gallery */}
                  <PhotoStack photos={photos} className="bg-gradient-to-br from-background to-secondary/10" />
                  
                  {/* Timeline */}
                  <Timeline events={timelineEvents} className="bg-gradient-to-br from-secondary/10 to-primary/10" />
                  
                  {/* Love Counter */}
                  <LoveCounter startDate={relationshipStartDate} className="bg-gradient-to-br from-primary/10 to-card" />
                  
                  {/* Gift Box */}
                  <GiftBox girlfriendName={girlfriendName} className="bg-gradient-to-br from-card to-accent/10" />
                  
                  {/* Fireworks Ending */}
                  <FireworksEnding className="bg-gradient-to-br from-accent/10 to-background" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}