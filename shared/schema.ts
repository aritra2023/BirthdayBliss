import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const countdownSettings = pgTable("countdown_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetDate: timestamp("target_date"),
  isActive: boolean("is_active").default(false),
  setBy: text("set_by"), // Telegram user who set the countdown
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const botStatus = pgTable("bot_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  isActive: boolean("is_active").default(true),
  lastPing: timestamp("last_ping").defaultNow(),
  siteStatus: text("site_status").default("online"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCountdownSchema = createInsertSchema(countdownSettings).pick({
  targetDate: true,
  isActive: true,
  setBy: true,
});

export const insertBotStatusSchema = createInsertSchema(botStatus).pick({
  isActive: true,
  siteStatus: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCountdown = z.infer<typeof insertCountdownSchema>;
export type CountdownSettings = typeof countdownSettings.$inferSelect;
export type InsertBotStatus = z.infer<typeof insertBotStatusSchema>;
export type BotStatus = typeof botStatus.$inferSelect;
