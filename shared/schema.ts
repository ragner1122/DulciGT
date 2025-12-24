import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
export * from "./models/chat";

// Enums
export const sectionEnum = pgEnum("section", ["listening", "reading", "writing", "speaking"]);
export const questionTypeEnum = pgEnum("question_type", [
  "multiple_choice",
  "true_false_not_given",
  "matching_headings",
  "matching_information",
  "sentence_completion",
  "short_answer",
  "essay",
  "letter",
  "speaking_part_1",
  "speaking_part_2",
  "speaking_part_3"
]);

// Tables
export const passages = pgTable("passages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  section: sectionEnum("section").notNull(),
  metadata: jsonb("metadata"), // e.g. source, topic
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  section: sectionEnum("section").notNull(),
  part: integer("part"), // 1, 2, 3, 4
  type: questionTypeEnum("type").notNull(),
  content: text("content").notNull(), // Question text or prompt
  options: jsonb("options"), // For MCQ
  correctAnswer: jsonb("correct_answer"), // Key for auto-marking
  explanation: text("explanation"),
  passageId: integer("passage_id").references(() => passages.id),
  difficulty: integer("difficulty").default(1), // 1-5
  tags: text("tags").array(),
});

export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  structure: jsonb("structure").notNull(), // List of question IDs/sections
  isSystem: boolean("is_system").default(false), // Pre-made vs generated
  createdAt: timestamp("created_at").defaultNow(),
});

export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Links to auth.users
  testId: integer("test_id").references(() => tests.id),
  status: text("status").notNull().default("in_progress"), // in_progress, completed
  score: jsonb("score"), // Overall and section scores
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent"), // in seconds
});

export const attemptAnswers = pgTable("attempt_answers", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").references(() => attempts.id),
  questionId: integer("question_id").references(() => questions.id),
  answer: jsonb("answer"), // User's answer (text or selection)
  isCorrect: boolean("is_correct"),
  score: integer("score"), // Raw score
  aiFeedback: jsonb("ai_feedback"), // JSON structured AI feedback
});

export const studyPlans = pgTable("study_plans", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  targetBand: integer("target_band").notNull(),
  examDate: timestamp("exam_date").notNull(),
  planData: jsonb("plan_data").notNull(), // Generated schedule
  progress: jsonb("progress"), // Tracked completion
  createdAt: timestamp("created_at").defaultNow(),
});

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  status: text("status").notNull(), // processing, ready, error
  processedData: jsonb("processed_data"), // Extracted content
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertTestSchema = createInsertSchema(tests).omit({ id: true, createdAt: true });
export const insertAttemptSchema = createInsertSchema(attempts).omit({ id: true, startedAt: true, completedAt: true });
// Client input schema - userId is added by server from session
export const createAttemptInputSchema = insertAttemptSchema.omit({ userId: true });
export const insertAnswerSchema = createInsertSchema(attemptAnswers).omit({ id: true });
export const insertPlanSchema = createInsertSchema(studyPlans).omit({ id: true, createdAt: true, progress: true });
export const insertUploadSchema = createInsertSchema(uploads).omit({ id: true, createdAt: true });

// Types
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Test = typeof tests.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type AttemptAnswer = typeof attemptAnswers.$inferSelect;
export type StudyPlan = typeof studyPlans.$inferSelect;
