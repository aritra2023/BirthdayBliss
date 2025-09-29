import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage';

const BOT_TOKEN = '8112019635:AAEX9XX7DDxq7Lfj-XDDRwYx73BjLITB9HY';

class TelegramBotService {
  private bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot(BOT_TOKEN, { polling: true });
    this.setupCommands();
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
            statusMessage += `🎯 Target: ${targetTime.toLocaleString()}\n`;
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
        statusMessage += `/settime DD/MM/YYYY_HH:MM AM/PM - Set countdown timer`;
        
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
          `🎯 Target: ${targetDate.toLocaleString()}\n` +
          `⏰ Time remaining: ${days}d ${hours}h ${minutes}m\n` +
          `👤 Set by: ${userName}\n\n` +
          `🔒 Site will be locked until countdown ends.`
        );

      } catch (error) {
        console.error('Error in /settime command:', error);
        await this.bot.sendMessage(chatId, '❌ Error setting countdown. Please try again.');
      }
    });

    // Handle unknown commands
    this.bot.on('message', async (msg) => {
      const text = msg.text || '';
      
      // Skip if it's a known command
      if (text.startsWith('/start') || text.startsWith('/settime')) {
        return;
      }
      
      // Only respond to commands (messages starting with /)
      if (text.startsWith('/')) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(chatId,
          '❓ Unknown command. Available commands:\n\n' +
          '/start - Check bot and site status\n' +
          '/settime DD/MM/YYYY_HH:MM AM/PM - Set countdown timer\n\n' +
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

      const targetDate = new Date(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed
        parseInt(day),
        hour,
        minute,
        0,
        0
      );

      // Validate the date
      if (isNaN(targetDate.getTime())) {
        return null;
      }

      return targetDate;
    } catch (error) {
      return null;
    }
  }

  public stop() {
    this.bot.stopPolling();
  }
}

export default TelegramBotService;