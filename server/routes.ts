import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import TelegramBotService from "./telegram-bot";

// API Error wrapper for consistent error handling
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// API response helper
const sendResponse = (res: any, data: any, status = 200) => {
  return res.status(status).json({
    success: status < 400,
    timestamp: new Date().toISOString(),
    ...data
  });
};

// Error response helper
const sendError = (res: any, error: string, status = 500, details?: any) => {
  console.error(`❌ API Error [${status}]:`, error, details ? details : '');
  
  return res.status(status).json({
    success: false,
    error,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && details ? { details } : {})
  });
};

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
  app.get('/api/countdown', asyncHandler(async (req: any, res: any) => {
    const activeCountdown = await storage.getActiveCountdown();
    
    if (!activeCountdown || !activeCountdown.targetDate) {
      return sendResponse(res, { 
        hasActiveCountdown: false, 
        message: 'No active countdown' 
      });
    }

    const targetTime = new Date(activeCountdown.targetDate);
    const now = new Date();
    
    if (targetTime <= now) {
      // Countdown has ended, deactivate it
      await storage.updateCountdown(activeCountdown.id, { isActive: false });
      return sendResponse(res, { 
        hasActiveCountdown: false, 
        countdownEnded: true,
        message: 'Countdown has ended' 
      });
    }

    const timeLeft = targetTime.getTime() - now.getTime();
    
    return sendResponse(res, {
      hasActiveCountdown: true,
      targetDate: activeCountdown.targetDate,
      timeLeft,
      setBy: activeCountdown.setBy,
      isAccessible: false
    });
  }));

  // Check if site should be accessible
  app.get('/api/access-status', asyncHandler(async (req: any, res: any) => {
    const activeCountdown = await storage.getActiveCountdown();
    
    if (!activeCountdown || !activeCountdown.targetDate) {
      return sendResponse(res, { 
        isAccessible: true, 
        reason: 'No countdown active' 
      });
    }

    const targetTime = new Date(activeCountdown.targetDate);
    const now = new Date();
    
    if (targetTime <= now) {
      // Countdown has ended, deactivate it
      await storage.updateCountdown(activeCountdown.id, { isActive: false });
      return sendResponse(res, { 
        isAccessible: true, 
        reason: 'Countdown ended',
        endedAt: targetTime
      });
    }

    const timeLeft = targetTime.getTime() - now.getTime();
    
    return sendResponse(res, {
      isAccessible: false,
      reason: 'Countdown active',
      targetDate: activeCountdown.targetDate,
      timeLeft,
      setBy: activeCountdown.setBy
    });
  }));

  // Bot status API
  app.get('/api/bot-status', asyncHandler(async (req: any, res: any) => {
    const botStatus = await storage.getBotStatus();
    return sendResponse(res, botStatus || { 
      isActive: false, 
      siteStatus: 'offline' 
    });
  }));

  // Track visitor access
  app.post('/api/track-visitor', asyncHandler(async (req: any, res: any) => {
    const { timestamp, userAgent, ip } = req.body;
    
    // Validate request body
    if (!userAgent && !timestamp) {
      return sendError(res, 'Missing required visitor information', 400);
    }
    
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
        console.warn('Failed to send Telegram notification:', botError);
      }
    }

    return sendResponse(res, { 
      message: 'Visitor tracked successfully',
      visitorInfo
    });
  }));

  // Readiness check endpoint for deployment platforms
  app.get('/ready', asyncHandler(async (_req: any, res: any) => {
    const checks = {
      storage: false,
      telegram: false,
      environment: true
    };

    // Check storage readiness
    try {
      await storage.getBotStatus(); // Simple storage test
      checks.storage = true;
    } catch (error) {
      console.warn('Storage readiness check failed:', error);
      checks.storage = false;
    }
    
    // Add explicit database readiness if MongoDB is configured
    if (process.env.MONGODB_URI) {
      // Import isDatabaseAvailable from storage if needed for more detailed check
      checks.storage = checks.storage; // Keep the storage test result for now
    }

    // Check telegram bot (if configured)
    if (process.env.TELEGRAM_BOT_TOKEN) {
      checks.telegram = telegramBot ? true : false;
    } else {
      checks.telegram = true; // Not required if not configured
    }

    const allReady = Object.values(checks).every(check => check === true);
    const status = allReady ? 200 : 503;

    return sendResponse(res, {
      ready: allReady,
      checks,
      timestamp: new Date().toISOString()
    }, status);
  }));

  const httpServer = createServer(app);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    try {
      if (telegramBot && typeof telegramBot.stop === 'function') {
        telegramBot.stop();
      }
    } catch (error) {
      console.error('⚠️  Error stopping Telegram bot during shutdown:', error);
    }
  });

  return httpServer;
}
