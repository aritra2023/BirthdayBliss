import { 
  type User, 
  type InsertUser, 
  type CountdownSettings, 
  type InsertCountdown, 
  type BotStatus, 
  type InsertBotStatus 
} from "@shared/schema";
import { randomUUID } from "crypto";
import { MongoClient, type Collection, type Db } from "mongodb";
import moment from "moment-timezone";

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

// MongoDB connection with hardcoded connection string for easy deployment
const MONGODB_URI = "mongodb+srv://404movie:404moviepass@cluster0.fca76c9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let mongoClient: MongoClient | null = null;
let db: Db | null = null;
let isDatabaseAvailable = false;

// MongoDB Collections
let usersCollection: Collection<User> | null = null;
let countdownCollection: Collection<CountdownSettings> | null = null;
let botStatusCollection: Collection<BotStatus> | null = null;

let initializationPromise: Promise<void> | null = null;

// Initialize MongoDB connection (singleton pattern to prevent multiple connections)
async function initializeDatabase(): Promise<void> {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // Check if already initialized
      if (isDatabaseAvailable && db) {
        return;
      }

      mongoClient = new MongoClient(MONGODB_URI);
      await mongoClient.connect();
      db = mongoClient.db("birthdayApp");
      
      // Initialize collections
      usersCollection = db.collection<User>("users");
      countdownCollection = db.collection<CountdownSettings>("countdowns");
      botStatusCollection = db.collection<BotStatus>("botStatus");
      
      // Test the connection
      await db.admin().ping();
      isDatabaseAvailable = true;
      console.log('🗄️  MongoDB connection successful');
    } catch (error) {
      console.warn('MongoDB connection failed, falling back to memory storage:', error);
      isDatabaseAvailable = false;
      db = null;
      if (mongoClient) {
        try {
          await mongoClient.close();
        } catch (closeError) {
          console.warn('Error closing MongoDB client:', closeError);
        }
      }
      mongoClient = null;
      // Reset the initialization promise so it can be retried
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

export class MongoDBStorage implements IStorage {
  private ensureCollections() {
    if (!usersCollection || !countdownCollection || !botStatusCollection) {
      throw new Error('MongoDB collections not initialized');
    }
    return { usersCollection, countdownCollection, botStatusCollection };
  }

  // Helper function to get IST time
  private getISTTime(): Date {
    return moment().tz('Asia/Kolkata').toDate();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const { usersCollection } = this.ensureCollections();
    const result = await usersCollection.findOne({ id });
    return result || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { usersCollection } = this.ensureCollections();
    const result = await usersCollection.findOne({ username });
    return result || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { usersCollection } = this.ensureCollections();
    const user: User = {
      id: randomUUID(),
      username: insertUser.username,
      password: insertUser.password,
    };
    await usersCollection.insertOne(user);
    return user;
  }

  // Countdown settings methods with IST timezone support
  async getActiveCountdown(): Promise<CountdownSettings | undefined> {
    const { countdownCollection } = this.ensureCollections();
    const result = await countdownCollection.findOne({ isActive: true });
    return result || undefined;
  }

  async setCountdown(countdown: InsertCountdown): Promise<CountdownSettings> {
    const { countdownCollection } = this.ensureCollections();
    
    // First deactivate all existing countdowns
    await this.deactivateAllCountdowns();
    
    // Create new countdown with IST timestamp
    const istTime = this.getISTTime();
    const newCountdown: CountdownSettings = {
      id: randomUUID(),
      targetDate: countdown.targetDate ? moment(countdown.targetDate).tz('Asia/Kolkata').toDate() : null,
      isActive: countdown.isActive ?? true,
      setBy: countdown.setBy ?? null,
      createdAt: istTime,
      updatedAt: istTime,
    };
    
    await countdownCollection.insertOne(newCountdown);
    return newCountdown;
  }

  async updateCountdown(id: string, updates: Partial<CountdownSettings>): Promise<CountdownSettings | undefined> {
    const { countdownCollection } = this.ensureCollections();
    
    const updateData = {
      ...updates,
      updatedAt: this.getISTTime(),
    };
    
    const result = await countdownCollection.findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return result ?? undefined;
  }

  async deactivateAllCountdowns(): Promise<void> {
    const { countdownCollection } = this.ensureCollections();
    await countdownCollection.updateMany(
      {},
      { 
        $set: { 
          isActive: false, 
          updatedAt: this.getISTTime() 
        }
      }
    );
  }

  // Bot status methods
  async getBotStatus(): Promise<BotStatus | undefined> {
    const { botStatusCollection } = this.ensureCollections();
    const result = await botStatusCollection.findOne({});
    return result || undefined;
  }

  async updateBotStatus(updates: Partial<BotStatus>): Promise<BotStatus> {
    const { botStatusCollection } = this.ensureCollections();
    
    // Get existing status or create if none exists
    let existingStatus = await this.getBotStatus();
    
    if (!existingStatus) {
      existingStatus = await this.createBotStatus({
        isActive: true,
        siteStatus: 'online',
      });
    }

    const updateData = {
      ...updates,
      lastPing: this.getISTTime(),
    };

    const result = await botStatusCollection.findOneAndUpdate(
      { id: existingStatus.id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return result ?? existingStatus;
  }

  async createBotStatus(status: InsertBotStatus): Promise<BotStatus> {
    const { botStatusCollection } = this.ensureCollections();
    
    const botStatus: BotStatus = {
      id: randomUUID(),
      isActive: status.isActive ?? true,
      lastPing: this.getISTTime(),
      siteStatus: status.siteStatus ?? 'online',
    };
    
    await botStatusCollection.insertOne(botStatus);
    return botStatus;
  }
}

// Create a function to get the appropriate storage implementation
function createStorage(): IStorage {
  if (isDatabaseAvailable && db) {
    console.log('🗄️  Using MongoDB storage with IST timezone support');
    return new MongoDBStorage();
  } else {
    console.log('💾 Using memory storage (development mode)');
    return new MemoryStorage();
  }
}

// Create a proper storage instance that waits for initialization
class StorageProxy implements IStorage {
  private actualStorage: IStorage = new MemoryStorage();
  private initialized: boolean = false;

  private async ensureInitialized(): Promise<IStorage> {
    // Always try to initialize MongoDB if not already available
    if (!isDatabaseAvailable || !db) {
      await initializeDatabase();
    }
    
    // Update storage based on current availability
    if (isDatabaseAvailable && db && !(this.actualStorage instanceof MongoDBStorage)) {
      this.actualStorage = new MongoDBStorage();
      console.log('🗄️  Switched to MongoDB storage');
    } else if (!isDatabaseAvailable && !(this.actualStorage instanceof MemoryStorage)) {
      this.actualStorage = new MemoryStorage();
      console.log('💾 Switched to memory storage (MongoDB unavailable)');
    }
    
    this.initialized = true;
    return this.actualStorage;
  }

  async getUser(id: string): Promise<User | undefined> {
    const storage = await this.ensureInitialized();
    return storage.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const storage = await this.ensureInitialized();
    return storage.getUserByUsername(username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const storage = await this.ensureInitialized();
    return storage.createUser(user);
  }

  async getActiveCountdown(): Promise<CountdownSettings | undefined> {
    const storage = await this.ensureInitialized();
    return storage.getActiveCountdown();
  }

  async setCountdown(countdown: InsertCountdown): Promise<CountdownSettings> {
    const storage = await this.ensureInitialized();
    return storage.setCountdown(countdown);
  }

  async updateCountdown(id: string, updates: Partial<CountdownSettings>): Promise<CountdownSettings | undefined> {
    const storage = await this.ensureInitialized();
    return storage.updateCountdown(id, updates);
  }

  async deactivateAllCountdowns(): Promise<void> {
    const storage = await this.ensureInitialized();
    return storage.deactivateAllCountdowns();
  }

  async getBotStatus(): Promise<BotStatus | undefined> {
    const storage = await this.ensureInitialized();
    return storage.getBotStatus();
  }

  async updateBotStatus(updates: Partial<BotStatus>): Promise<BotStatus> {
    const storage = await this.ensureInitialized();
    return storage.updateBotStatus(updates);
  }

  async createBotStatus(status: InsertBotStatus): Promise<BotStatus> {
    const storage = await this.ensureInitialized();
    return storage.createBotStatus(status);
  }
}

export const storage: IStorage = new StorageProxy();
