import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Heart, Loader2 } from 'lucide-react';

interface GiftBoxProps {
  girlfriendName: string;
  className?: string;
}

interface AIContent {
  poem: string;
  romanticLine: string;
}

export default function GiftBox({ girlfriendName, className = '' }: GiftBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiContent, setAiContent] = useState<AIContent | null>(null);

  const generateAIContent = async () => {
    setIsLoading(true);
    try {
      // Simulate AI API call - in real implementation, this would call the Gemini API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      //todo: replace with real Gemini API call
      const mockContent: AIContent = {
        poem: `${girlfriendName}, my dearest love so true,\nYour smile lights up my world in every hue.\nWith every laugh, with every gentle touch,\nYou mean to me so very, very much.\n\nYour kindness flows like rivers to the sea,\nYour heart's the greatest gift you give to me.\nOn this your special day, I want to say,\nI love you more than words could ever convey.`,
        romanticLine: "Two souls, one story, infinite love ❤️"
      };
      
      setAiContent(mockContent);
    } catch (error) {
      console.error('Failed to generate AI content:', error);
    }
    setIsLoading(false);
  };

  const handleOpenGift = () => {
    if (!isOpen) {
      setIsOpen(true);
      generateAIContent();
    }
  };

  return (
    <section className={`py-16 px-4 ${className}`} data-testid="gift-box">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-romantic text-primary mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          data-testid="gift-title"
        >
          A Special Gift Just For You 🎁
        </motion.h2>

        <div className="flex justify-center">
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Gift Box */}
            <AnimatePresence mode="wait">
              {!isOpen ? (
                <motion.button
                  key="closed-box"
                  onClick={handleOpenGift}
                  className="relative group cursor-pointer hover-elevate"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid="button-open-gift"
                >
                  <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-xl flex items-center justify-center relative overflow-hidden">
                    {/* Gift Box Decoration */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <div className="absolute top-1/2 left-0 right-0 h-4 bg-yellow-300 transform -translate-y-1/2" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-4 bg-yellow-300 transform -translate-x-1/2" />
                    
                    {/* Bow */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-6 bg-yellow-300 rounded-full relative">
                        <div className="absolute top-1 left-1 w-2 h-4 bg-yellow-400 rounded-full" />
                        <div className="absolute top-1 right-1 w-2 h-4 bg-yellow-400 rounded-full" />
                      </div>
                    </div>
                    
                    <Gift className="w-12 h-12 text-white z-10" />
                    
                    {/* Sparkles */}
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-6 h-6 text-yellow-300" />
                    </motion.div>
                  </div>
                  
                  <motion.p
                    className="mt-4 text-muted-foreground font-display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    Click to open your surprise! ✨
                  </motion.p>
                </motion.button>
              ) : (
                <motion.div
                  key="opened-box"
                  className="bg-card rounded-2xl p-8 shadow-xl max-w-2xl"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  data-testid="gift-content"
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">Creating something special for you...</p>
                    </div>
                  ) : aiContent ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="space-y-8"
                    >
                      {/* AI Generated Poem */}
                      <div>
                        <h3 className="font-romantic text-2xl text-primary mb-4 flex items-center justify-center">
                          <Heart className="w-6 h-6 mr-2" />
                          A Poem Written Just For You
                        </h3>
                        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6">
                          <pre className="font-display text-card-foreground whitespace-pre-wrap text-center leading-relaxed">
                            {aiContent.poem}
                          </pre>
                        </div>
                      </div>

                      {/* Romantic Line */}
                      <div>
                        <motion.p
                          className="text-xl font-elegant text-primary text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                        >
                          {aiContent.romanticLine}
                        </motion.p>
                      </div>

                      {/* Portrait Placeholder */}
                      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl p-8 text-center">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mb-4">
                          <span className="text-3xl">👫</span>
                        </div>
                        <p className="text-muted-foreground">
                          Our AI-generated cartoon portrait will appear here
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <p className="text-muted-foreground">Something went wrong. Please try again!</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}