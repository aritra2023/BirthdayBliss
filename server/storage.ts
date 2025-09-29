import { 
  type User, 
  type InsertUser, 
  type CountdownSettings, 
  type InsertCountdown, 
  type BotStatus, 
  type InsertBotStatus 
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Countdown settings methods
  getActiveCountdown(): Promise<CountdownSettings | undefined>;
  setCountdown(countdown: InsertCountdown): Promise<CountdownSettings>;
  updateCountdown(id: string, updates: Partial<CountdownSettings>): Promise<CountdownSettings | undefined>;
  deactivateAllCountdowns(): Promise<void>;
  
  // Bot status methods
  getBotStatus(): Promise<BotStatus | undefined>;
  updateBotStatus(updates: Partial<BotStatus>): Promise<BotStatus>;
  createBotStatus(status: InsertBotStatus): Promise<BotStatus>;
}

import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, and } from 'drizzle-orm';
import { users, countdownSettings, botStatus } from '@shared/schema';

const db = drizzle(process.env.DATABASE_URL!);

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Countdown settings methods
  async getActiveCountdown(): Promise<CountdownSettings | undefined> {
    const result = await db.select().from(countdownSettings).where(eq(countdownSettings.isActive, true));
    return result[0];
  }

  async setCountdown(countdown: InsertCountdown): Promise<CountdownSettings> {
    // First deactivate all existing countdowns
    await this.deactivateAllCountdowns();
    
    // Insert new countdown
    const result = await db.insert(countdownSettings).values({
      ...countdown,
      updatedAt: new Date(),
    }).returning();
    
    return result[0];
  }

  async updateCountdown(id: string, updates: Partial<CountdownSettings>): Promise<CountdownSettings | undefined> {
    const result = await db.update(countdownSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(countdownSettings.id, id))
      .returning();
    
    return result[0];
  }

  async deactivateAllCountdowns(): Promise<void> {
    await db.update(countdownSettings)
      .set({ isActive: false, updatedAt: new Date() });
  }

  // Bot status methods
  async getBotStatus(): Promise<BotStatus | undefined> {
    const result = await db.select().from(botStatus).limit(1);
    return result[0];
  }

  async updateBotStatus(updates: Partial<BotStatus>): Promise<BotStatus> {
    // Get existing status or create if none exists
    let existingStatus = await this.getBotStatus();
    
    if (!existingStatus) {
      existingStatus = await this.createBotStatus({
        isActive: true,
        siteStatus: 'online',
      });
    }

    const result = await db.update(botStatus)
      .set({ ...updates, lastPing: new Date() })
      .where(eq(botStatus.id, existingStatus.id))
      .returning();
    
    return result[0];
  }

  async createBotStatus(status: InsertBotStatus): Promise<BotStatus> {
    const result = await db.insert(botStatus).values(status).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
