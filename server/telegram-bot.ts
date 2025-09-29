import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage';
import moment from 'moment-timezone';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

class TelegramBotService {
  private bot: TelegramBot;

  constructor() {
    try {
      // Validate bot token
      if (!BOT_TOKEN || BOT_TOKEN.length < 10) {
        throw new Error('Telegram bot token is not configured properly');
      }
      
      // Only enable polling in production or when explicitly set
      const pollingEnabled = process.env.NODE_ENV === 'production' || process.env.ENABLE_TELEGRAM_POLLING === 'true';
      
      this.bot = new TelegramBot(BOT_TOKEN, { 
        polling: pollingEnabled
      });
      
      // Add error handlers for the bot
      this.bot.on('error', (error) => {
        console.error('❌ Telegram Bot Error:', error);
      });

      this.bot.on('polling_error', (error) => {
        console.error('❌ Telegram Polling Error:', error);
        if (error.message.includes('409 Conflict')) {
          console.log('⚠️  Multiple bot instances detected, stopping polling...');
          this.bot.stopPolling();
        }
      });
      
      if (pollingEnabled) {
        this.setupCommands();
      } else {
        console.log('🤖 Telegram bot initialized (polling disabled for development)');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error);
      throw error;
    }
  }

  private setupCommands() {
    // Handle /start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userName = msg.from?.first_name || 'User';
      
      try {
        // Update bot status
        await storage.updateBotStatus({
          isActive: true,
          siteStatus: 'online',
        });

        // Get current countdown if any
        const activeCountdown = await storage.getActiveCountdown();
        
        let statusMessage = `🎉 Hello ${userName}!\n\n`;
        statusMessage += `✅ Bot Status: Active\n`;
        statusMessage += `✅ Site Status: Online\n\n`;
        
        if (activeCountdown && activeCountdown.targetDate) {
          const targetTime = new Date(activeCountdown.targetDate);
          const now = new Date();
          
          if (targetTime > now) {
            const timeLeft = targetTime.getTime() - now.getTime();
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            
            statusMessage += `⏰ Active Countdown: ${days}d ${hours}h ${minutes}m remaining\n`;
            statusMessage += `🎯 Target: ${targetTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST\n`;
            statusMessage += `👤 Set by: ${activeCountdown.setBy}\n\n`;
            statusMessage += `🔒 Site will be accessible after countdown ends.`;
          } else {
            statusMessage += `🎉 Countdown has ended! Site is now accessible.`;
          }
        } else {
          statusMessage += `📌 No active countdown. Site is fully accessible.\n\n`;
          statusMessage += `Use /settime to set a countdown timer.`;
        }
        
        statusMessage += `\n\n📝 Commands:\n`;
        statusMessage += `/start - Check bot and site status\n`;
        statusMessage += `/settime DD/MM/YYYY_HH:MM AM/PM - Set countdown timer\n`;
        statusMessage += `/unlocknow - Instantly unlock any active timer`;
        
        await this.bot.sendMessage(chatId, statusMessage);
        
      } catch (error) {
        console.error('Error in /start command:', error);
        await this.bot.sendMessage(chatId, '❌ Error checking status. Please try again.');
      }
    });

    // Handle /settime command
    this.bot.onText(/\/settime (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userName = msg.from?.first_name || 'User';
      const timeString = match?.[1];

      if (!timeString) {
        await this.bot.sendMessage(chatId, 
          '❌ Please provide time in format: /settime DD/MM/YYYY_HH:MM AM/PM\n' +
          'Example: /settime 31/12/2024_11:59 PM'
        );
        return;
      }

      try {
        const targetDate = this.parseTimeString(timeString);
        
        if (!targetDate) {
          await this.bot.sendMessage(chatId,
            '❌ Invalid time format. Please use: DD/MM/YYYY_HH:MM AM/PM\n' +
            'Example: /settime 31/12/2024_11:59 PM'
          );
          return;
        }

        const now = new Date();
        if (targetDate <= now) {
          await this.bot.sendMessage(chatId, '❌ Target time must be in the future!');
          return;
        }

        // Set the countdown
        await storage.setCountdown({
          targetDate,
          isActive: true,
          setBy: userName,
        });

        const timeLeft = targetDate.getTime() - now.getTime();
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        await this.bot.sendMessage(chatId,
          `✅ Countdown set successfully!\n\n` +
          `🎯 Target: ${targetDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST\n` +
          `⏰ Time remaining: ${days}d ${hours}h ${minutes}m\n` +
          `👤 Set by: ${userName}\n\n` +
          `🔒 Site will be locked until countdown ends.`
        );

      } catch (error) {
        console.error('Error in /settime command:', error);
        await this.bot.sendMessage(chatId, '❌ Error setting countdown. Please try again.');
      }
    });

    // Handle /unlocknow command
    this.bot.onText(/\/unlocknow/, async (msg) => {
      const chatId = msg.chat.id;
      const userName = msg.from?.first_name || 'User';

      try {
        // Check if there's an active countdown
        const activeCountdown = await storage.getActiveCountdown();
        
        if (!activeCountdown || !activeCountdown.isActive) {
          await this.bot.sendMessage(chatId, '📌 No active countdown to unlock. Site is already accessible!');
          return;
        }

        // Deactivate all countdowns
        await storage.deactivateAllCountdowns();

        await this.bot.sendMessage(chatId,
          `✅ Timer unlocked successfully!\n\n` +
          `🔓 All countdowns have been deactivated\n` +
          `👤 Unlocked by: ${userName}\n` +
          `🌐 Site is now fully accessible!\n\n` +
          `⏰ Previous timer was set by: ${activeCountdown.setBy || 'Unknown'}\n` +
          `🎯 Original target was: ${activeCountdown.targetDate ? new Date(activeCountdown.targetDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Unknown'}`
        );

      } catch (error) {
        console.error('Error in /unlocknow command:', error);
        await this.bot.sendMessage(chatId, '❌ Error unlocking timer. Please try again.');
      }
    });

    // Handle unknown commands
    this.bot.on('message', async (msg) => {
      const text = msg.text || '';
      
      // Skip if it's a known command
      if (text.startsWith('/start') || text.startsWith('/settime') || text.startsWith('/unlocknow')) {
        return;
      }
      
      // Only respond to commands (messages starting with /)
      if (text.startsWith('/')) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(chatId,
          '❓ Unknown command. Available commands:\n\n' +
          '/start - Check bot and site status\n' +
          '/settime DD/MM/YYYY_HH:MM AM/PM - Set countdown timer\n' +
          '/unlocknow - Instantly unlock any active timer\n\n' +
          'Example: /settime 25/12/2024_06:00 AM'
        );
      }
    });

    console.log('🤖 Telegram bot is running...');
  }

  private parseTimeString(timeString: string): Date | null {
    try {
      // Expected format: DD/MM/YYYY_HH:MM AM/PM
      const [datePart, timePart] = timeString.trim().split('_');
      
      if (!datePart || !timePart) {
        return null;
      }

      const [day, month, year] = datePart.split('/');
      const timeMatch = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      
      if (!timeMatch) {
        return null;
      }

      const [, hourStr, minuteStr, ampm] = timeMatch;
      let hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);

      // Convert to 24-hour format
      if (ampm.toUpperCase() === 'PM' && hour !== 12) {
        hour += 12;
      } else if (ampm.toUpperCase() === 'AM' && hour === 12) {
        hour = 0;
      }

      // Create date string in IST timezone
      const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      
      // Parse the date in IST timezone
      const targetDateMoment = moment.tz(dateString, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');

      // Validate the date
      if (!targetDateMoment.isValid()) {
        return null;
      }

      return targetDateMoment.toDate();
    } catch (error) {
      return null;
    }
  }

  public async sendNotification(message: string, chatId?: number) {
    try {
      // If no specific chatId provided, log the notification instead
      if (chatId) {
        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown'
        });
        console.log(`📤 Notification sent to chat ${chatId}`);
      } else {
        // Log the notification instead of sending if no chatId
        console.log('📢 Notification (no chat ID):', message);
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error instanceof Error ? error.message : error);
      // Don't throw error, just log it to prevent breaking the application
    }
  }

  public stop() {
    try {
      console.log('🛑 Stopping Telegram bot...');
      this.bot.stopPolling();
      console.log('✅ Telegram bot stopped successfully');
    } catch (error) {
      console.error('❌ Error stopping Telegram bot:', error);
    }
  }
}

export default TelegramBotService;