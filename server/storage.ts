import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  questions, tests, attempts, attemptAnswers, studyPlans, uploads, passages,
  type Question, type InsertQuestion, type Test, type Attempt, type InsertAttempt, type AttemptAnswer, type StudyPlan, type InsertQuestion as InsertQuestionType
} from "@shared/schema";

export interface IStorage {
  // Questions
  getQuestions(filters?: { section?: string; type?: string; limit?: number }): Promise<Question[]>;
  createQuestion(question: InsertQuestionType): Promise<Question>;
  
  // Tests
  getTests(): Promise<Test[]>;
  getTest(id: number): Promise<Test | undefined>;
  createTest(test: any): Promise<Test>; // Typed as any for now to bypass strict InsertTest mismatch if any
  
  // Attempts
  createAttempt(attempt: InsertAttempt): Promise<Attempt>;
  getAttempt(id: number): Promise<Attempt | undefined>;
  getUserAttempts(userId: string): Promise<Attempt[]>;
  updateAttemptStatus(id: number, status: string, score?: any, completedAt?: Date): Promise<Attempt>;
  saveAnswer(answer: any): Promise<AttemptAnswer>;
  
  // Plans
  getStudyPlan(userId: string): Promise<StudyPlan | undefined>;
  createStudyPlan(plan: any): Promise<StudyPlan>;
  
  // Uploads
  getUploads(userId: string): Promise<any[]>;
  createUpload(upload: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getQuestions(filters?: { section?: string; type?: string; limit?: number }): Promise<Question[]> {
    let query = db.select().from(questions);
    if (filters?.section) {
      query = query.where(eq(questions.section, filters.section as any)) as any;
    }
    if (filters?.type) {
      query = query.where(eq(questions.type, filters.type as any)) as any;
    }
    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    return await query;
  }

  async createQuestion(question: InsertQuestionType): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async getTests(): Promise<Test[]> {
    return await db.select().from(tests).orderBy(desc(tests.createdAt));
  }

  async getTest(id: number): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test;
  }

  async createTest(test: any): Promise<Test> {
    const [newTest] = await db.insert(tests).values(test).returning();
    return newTest;
  }

  async createAttempt(attempt: InsertAttempt): Promise<Attempt> {
    const [newAttempt] = await db.insert(attempts).values(attempt).returning();
    return newAttempt;
  }

  async getAttempt(id: number): Promise<Attempt | undefined> {
    const [attempt] = await db.select().from(attempts).where(eq(attempts.id, id));
    return attempt;
  }

  async getUserAttempts(userId: string): Promise<Attempt[]> {
    return await db.select().from(attempts).where(eq(attempts.userId, userId)).orderBy(desc(attempts.startedAt));
  }

  async updateAttemptStatus(id: number, status: string, score?: any, completedAt?: Date): Promise<Attempt> {
    const [updated] = await db
      .update(attempts)
      .set({ status, score, completedAt })
      .where(eq(attempts.id, id))
      .returning();
    return updated;
  }

  async saveAnswer(answer: any): Promise<AttemptAnswer> {
    const [saved] = await db.insert(attemptAnswers).values(answer).returning();
    return saved;
  }

  async getStudyPlan(userId: string): Promise<StudyPlan | undefined> {
    const [plan] = await db.select().from(studyPlans).where(eq(studyPlans.userId, userId)).orderBy(desc(studyPlans.createdAt)).limit(1);
    return plan;
  }

  async createStudyPlan(plan: any): Promise<StudyPlan> {
    const [newPlan] = await db.insert(studyPlans).values(plan).returning();
    return newPlan;
  }

  async getUploads(userId: string): Promise<any[]> {
    return await db.select().from(uploads).where(eq(uploads.userId, userId)).orderBy(desc(uploads.createdAt));
  }

  async createUpload(upload: any): Promise<any> {
    const [newUpload] = await db.insert(uploads).values(upload).returning();
    return newUpload;
  }
}

export const storage = new DatabaseStorage();
