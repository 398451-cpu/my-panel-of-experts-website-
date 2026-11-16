import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const expertsTable = pgTable("experts", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  bio: text("bio").notNull().default(""),
  avatarUrl: text("avatar_url"),
  tone: text("tone").notNull().default("Warm and thoughtful"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

export const insertExpertSchema = createInsertSchema(expertsTable).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
});

export type InsertExpert = z.infer<typeof insertExpertSchema>;
export type ExpertRecord = typeof expertsTable.$inferSelect;
