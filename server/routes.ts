import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import TelegramBotService from "./telegram-bot";

// Initialize Telegram bot
let telegramBot: TelegramBotService;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Telegram bot
  try {
    telegramBot = new TelegramBotService();
    console.log('✅ Telegram bot initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error);
  }

  // Countdown API routes
  app.get('/api/countdown', async (req, res) => {
    try {
      const activeCountdown = await storage.getActiveCountdown();
      
      if (!activeCountdown || !activeCountdown.targetDate) {
        return res.json({ 
          hasActiveCountdown: false, 
          message: 'No active countdown' 
        });
      }

      const targetTime = new Date(activeCountdown.targetDate);
      const now = new Date();
      
      if (targetTime <= now) {
        // Countdown has ended, deactivate it
        await storage.updateCountdown(activeCountdown.id, { isActive: false });
        return res.json({ 
          hasActiveCountdown: false, 
          countdownEnded: true,
          message: 'Countdown has ended' 
        });
      }

      const timeLeft = targetTime.getTime() - now.getTime();
      
      res.json({
        hasActiveCountdown: true,
        targetDate: activeCountdown.targetDate,
        timeLeft,
        setBy: activeCountdown.setBy,
        isAccessible: false
      });
    } catch (error) {
      console.error('Error fetching countdown:', error);
      res.status(500).json({ error: 'Failed to fetch countdown status' });
    }
  });

  // Check if site should be accessible
  app.get('/api/access-status', async (req, res) => {
    try {
      const activeCountdown = await storage.getActiveCountdown();
      
      if (!activeCountdown || !activeCountdown.targetDate) {
        return res.json({ isAccessible: true, reason: 'No countdown active' });
      }

      const targetTime = new Date(activeCountdown.targetDate);
      const now = new Date();
      
      if (targetTime <= now) {
        // Countdown has ended, deactivate it
        await storage.updateCountdown(activeCountdown.id, { isActive: false });
        return res.json({ 
          isAccessible: true, 
          reason: 'Countdown ended',
          endedAt: targetTime
        });
      }

      const timeLeft = targetTime.getTime() - now.getTime();
      
      res.json({
        isAccessible: false,
        reason: 'Countdown active',
        targetDate: activeCountdown.targetDate,
        timeLeft,
        setBy: activeCountdown.setBy
      });
    } catch (error) {
      console.error('Error checking access status:', error);
      res.status(500).json({ error: 'Failed to check access status' });
    }
  });

  // Bot status API
  app.get('/api/bot-status', async (req, res) => {
    try {
      const botStatus = await storage.getBotStatus();
      res.json(botStatus || { isActive: false, siteStatus: 'offline' });
    } catch (error) {
      console.error('Error fetching bot status:', error);
      res.status(500).json({ error: 'Failed to fetch bot status' });
    }
  });

  // Track visitor access
  app.post('/api/track-visitor', async (req, res) => {
    try {
      const { timestamp, userAgent, ip } = req.body;
      
      // Log visitor access
      console.log(`🔍 New visitor detected:`, {
        timestamp,
        userAgent: userAgent?.slice(0, 100) + '...',
        ip: ip || req.ip || 'unknown'
      });

      // Store visitor info (you can expand this to save to database if needed)
      const visitorInfo = {
        timestamp: timestamp || new Date().toISOString(),
        userAgent: userAgent || 'unknown',
        ip: ip || req.ip || 'unknown',
        accessTime: new Date().toISOString()
      };

      // Send notification to Telegram bot if available
      if (telegramBot) {
        try {
          const message = `🚨 New visitor detected!\n⏰ Time: ${visitorInfo.accessTime}\n🌐 IP: ${visitorInfo.ip}\n📱 Device: ${visitorInfo.userAgent?.slice(0, 50)}...`;
          await telegramBot.sendNotification(message);
        } catch (botError) {
          console.log('Failed to send Telegram notification:', botError);
        }
      }

      res.json({ 
        success: true, 
        message: 'Visitor tracked successfully',
        visitorInfo
      });
    } catch (error) {
      console.error('Error tracking visitor:', error);
      res.status(500).json({ error: 'Failed to track visitor' });
    }
  });

  const httpServer = createServer(app);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    if (telegramBot) {
      telegramBot.stop();
    }
  });

  return httpServer;
}
