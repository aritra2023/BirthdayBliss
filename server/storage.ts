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

// Memory Storage Implementation for Development
export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private usersByUsername: Map<string, User> = new Map();
  private countdowns: Map<string, CountdownSettings> = new Map();
  private botStatusData: BotStatus | undefined;

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.usersByUsername.get(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: randomUUID(),
      username: insertUser.username,
      password: insertUser.password,
    };
    this.users.set(user.id, user);
    this.usersByUsername.set(user.username, user);
    return user;
  }

  // Countdown settings methods
  async getActiveCountdown(): Promise<CountdownSettings | undefined> {
    for (const countdown of Array.from(this.countdowns.values())) {
      if (countdown.isActive) {
        return countdown;
      }
    }
    return undefined;
  }

  async setCountdown(countdown: InsertCountdown): Promise<CountdownSettings> {
    // First deactivate all existing countdowns
    await this.deactivateAllCountdowns();
    
    // Create new countdown
    const newCountdown: CountdownSettings = {
      id: randomUUID(),
      targetDate: countdown.targetDate ?? null,
      isActive: countdown.isActive ?? true,
      setBy: countdown.setBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.countdowns.set(newCountdown.id, newCountdown);
    return newCountdown;
  }

  async updateCountdown(id: string, updates: Partial<CountdownSettings>): Promise<CountdownSettings | undefined> {
    const countdown = this.countdowns.get(id);
    if (!countdown) return undefined;
    
    const updated = {
      ...countdown,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.countdowns.set(id, updated);
    return updated;
  }

  async deactivateAllCountdowns(): Promise<void> {
    for (const [id, countdown] of Array.from(this.countdowns.entries())) {
      this.countdowns.set(id, {
        ...countdown,
        isActive: false,
        updatedAt: new Date(),
      });
    }
  }

  // Bot status methods
  async getBotStatus(): Promise<BotStatus | undefined> {
    return this.botStatusData;
  }

  async updateBotStatus(updates: Partial<BotStatus>): Promise<BotStatus> {
    if (!this.botStatusData) {
      this.botStatusData = await this.createBotStatus({
        isActive: true,
        siteStatus: 'online',
      });
    }

    this.botStatusData = {
      ...this.botStatusData,
      ...updates,
      lastPing: new Date(),
    };
    
    return this.botStatusData;
  }

  async createBotStatus(status: InsertBotStatus): Promise<BotStatus> {
    const botStatus: BotStatus = {
      id: randomUUID(),
      isActive: status.isActive ?? true,
      lastPing: new Date(),
      siteStatus: status.siteStatus ?? 'online',
    };
    
    this.botStatusData = botStatus;
    return botStatus;
  }
}

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and } from 'drizzle-orm';
import { users, countdownSettings, botStatus } from '@shared/schema';

// Use HTTP driver for better compatibility in serverless environments
let db: ReturnType<typeof drizzle> | null = null;
let isDatabaseAvailable = false;

// Initialize database connection and test it
async function initializeDatabase() {
  try {
    if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL);
      db = drizzle({ client: sql });
      
      // Test the connection by running a simple query
      await sql`SELECT 1 as test`;
      isDatabaseAvailable = true;
      console.log('🗄️  Database connection successful');
    }
  } catch (error) {
    console.warn('Database connection failed, falling back to memory storage:', error);
    isDatabaseAvailable = false;
    db = null;
  }
}

// Initialize the database connection
initializeDatabase();

export class DatabaseStorage implements IStorage {
  private ensureDb() {
    if (!db) {
      throw new Error('Database not initialized');
    }
    return db;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const database = this.ensureDb();
    const result = await database.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const database = this.ensureDb();
    const result = await database.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const database = this.ensureDb();
    const result = await database.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Countdown settings methods
  async getActiveCountdown(): Promise<CountdownSettings | undefined> {
    const database = this.ensureDb();
    const result = await database.select().from(countdownSettings).where(eq(countdownSettings.isActive, true));
    return result[0];
  }

  async setCountdown(countdown: InsertCountdown): Promise<CountdownSettings> {
    const database = this.ensureDb();
    // First deactivate all existing countdowns
    await this.deactivateAllCountdowns();
    
    // Insert new countdown
    const result = await database.insert(countdownSettings).values({
      ...countdown,
      updatedAt: new Date(),
    }).returning();
    
    return result[0];
  }

  async updateCountdown(id: string, updates: Partial<CountdownSettings>): Promise<CountdownSettings | undefined> {
    const database = this.ensureDb();
    const result = await database.update(countdownSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(countdownSettings.id, id))
      .returning();
    
    return result[0];
  }

  async deactivateAllCountdowns(): Promise<void> {
    const database = this.ensureDb();
    await database.update(countdownSettings)
      .set({ isActive: false, updatedAt: new Date() });
  }

  // Bot status methods
  async getBotStatus(): Promise<BotStatus | undefined> {
    const database = this.ensureDb();
    const result = await database.select().from(botStatus).limit(1);
    return result[0];
  }

  async updateBotStatus(updates: Partial<BotStatus>): Promise<BotStatus> {
    const database = this.ensureDb();
    // Get existing status or create if none exists
    let existingStatus = await this.getBotStatus();
    
    if (!existingStatus) {
      existingStatus = await this.createBotStatus({
        isActive: true,
        siteStatus: 'online',
      });
    }

    const result = await database.update(botStatus)
      .set({ ...updates, lastPing: new Date() })
      .where(eq(botStatus.id, existingStatus.id))
      .returning();
    
    return result[0];
  }

  async createBotStatus(status: InsertBotStatus): Promise<BotStatus> {
    const database = this.ensureDb();
    const result = await database.insert(botStatus).values(status).returning();
    return result[0];
  }
}

// Create a function to get the appropriate storage implementation
function createStorage(): IStorage {
  if (isDatabaseAvailable && db) {
    console.log('🗄️  Using database storage');
    return new DatabaseStorage();
  } else {
    console.log('💾 Using memory storage (development mode)');
    return new MemoryStorage();
  }
}

// Export the storage - will use memory storage initially and switch to database if available
export const storage: IStorage = new MemoryStorage();

// Update the storage reference after database initialization
initializeDatabase().then(() => {
  // Replace the storage implementation if database is available
  if (isDatabaseAvailable && db) {
    Object.setPrototypeOf(storage, DatabaseStorage.prototype);
    Object.assign(storage, new DatabaseStorage());
  }
});
