import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { expertsTable } from "./experts";

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  expertId: integer("expert_id").references(() => expertsTable.id, { onDelete: "set null" }),
  expertName: text("expert_name"),
  body: text("body").notNull(),
  topic: text("topic").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({
  id: true,
  ownerId: true,
  expertName: true,
  createdAt: true,
});

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type QuestionRecord = typeof questionsTable.$inferSelect;
