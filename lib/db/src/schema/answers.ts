import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { expertsTable } from "./experts";
import { questionsTable } from "./questions";

export const answersTable = pgTable("answers", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  questionId: integer("question_id").notNull().references(() => questionsTable.id, { onDelete: "cascade" }),
  expertId: integer("expert_id").references(() => expertsTable.id, { onDelete: "set null" }),
  expertName: text("expert_name").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnswerSchema = createInsertSchema(answersTable).omit({
  id: true,
  ownerId: true,
  expertName: true,
  createdAt: true,
});

export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type AnswerRecord = typeof answersTable.$inferSelect;
