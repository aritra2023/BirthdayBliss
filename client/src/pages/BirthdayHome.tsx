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
  const relationshipStartDate = new Date('2023-01-15T14:30:00');
  
  const personalMessage = `My dearest ${girlfriendName}, 

On this beautiful day that celebrates the wonderful moment you came into this world, I want you to know how incredibly grateful I am to have you in my life. 

Every day with you feels like a gift, and your smile lights up my entire world. You bring so much joy, laughter, and love into everything you touch. 

Today isn't just about celebrating another year of your amazing life - it's about celebrating all the ways you make the world brighter just by being in it.

Happy Birthday, beautiful! I love you more than words could ever express. ❤️`;

  const photos = [
    {
      id: '1',
      src: '/api/placeholder/400/300',
      caption: 'Our first date at the coffee shop where we talked for hours ☕'
    },
    {
      id: '2', 
      src: '/api/placeholder/400/300',
      caption: 'That amazing sunset during our weekend getaway 🌅'
    },
    {
      id: '3',
      src: '/api/placeholder/400/300', 
      caption: 'Laughing together at the park - you make everything more fun! 😄'
    },
    {
      id: '4',
      src: '/api/placeholder/400/300',
      caption: 'Celebrating your last birthday - and now here we are again! 🎂'
    }
  ];

  const timelineEvents = [
    {
      id: '1',
      date: 'January 15, 2023',
      title: 'First Meeting',
      description: 'The day our eyes first met at the coffee shop. I knew there was something special about you from that very moment.',
      icon: 'sparkles'
    },
    {
      id: '2', 
      date: 'February 14, 2023',
      title: 'First Date',
      description: 'Our magical Valentine\'s day dinner where we talked until the restaurant closed. Time just stopped when I was with you.',
      icon: 'heart'
    },
    {
      id: '3',
      date: 'May 20, 2023', 
      title: 'First Trip Together',
      description: 'Our weekend getaway to the mountains. Watching the sunrise with you was when I knew I was falling deeply in love.',
      icon: 'mountain'
    },
    {
      id: '4',
      date: 'August 10, 2023',
      title: 'Moving In Together', 
      description: 'The day we decided to share our lives and our home. Every morning with you feels like a blessing.',
      icon: 'home'
    },
    {
      id: '5',
      date: 'December 25, 2023',
      title: 'First Christmas',
      description: 'Celebrating our first Christmas together, creating traditions that will last a lifetime. You make every holiday magical.',
      icon: 'tree'
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