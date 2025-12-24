import { db } from "./db";
import { eq, desc, inArray } from "drizzle-orm";
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
  createTest(test: any): Promise<Test>;
  
  // Passages
  getPassage(id: number): Promise<any | undefined>;
  getPassagesByIds(ids: number[]): Promise<any[]>;
  
  // Attempts
  createAttempt(attempt: InsertAttempt): Promise<Attempt>;
  getAttempt(id: number): Promise<Attempt | undefined>;
  getAttemptWithDetails(id: number): Promise<any | undefined>;
  getUserAttempts(userId: string): Promise<Attempt[]>;
  updateAttemptStatus(id: number, status: string, score?: any, completedAt?: Date): Promise<Attempt>;
  saveAnswer(answer: any): Promise<AttemptAnswer>;
  getAttemptAnswers(attemptId: number): Promise<AttemptAnswer[]>;
  upsertAnswer(answer: any): Promise<AttemptAnswer>;
  
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

  async getTest(id: number): Promise<any> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    if (!test) return undefined;
    
    // Extract question IDs from structure and fetch them
    const questionIds: number[] = [];
    const structure = test.structure as any;
    
    if (structure?.sections) {
      for (const section of structure.sections) {
        // Direct questionIds in section
        if (section.questionIds) {
          questionIds.push(...section.questionIds);
        }
        // Nested tasks within section (Writing)
        if (section.tasks) {
          for (const task of section.tasks) {
            if (task.questionId) questionIds.push(task.questionId);
          }
        }
        // Nested parts within section (Speaking)
        if (section.parts) {
          for (const part of section.parts) {
            if (part.questionId) questionIds.push(part.questionId);
          }
        }
      }
    }
    
    // Top-level tasks (legacy format)
    if (structure?.tasks) {
      for (const task of structure.tasks) {
        if (task.questionId) questionIds.push(task.questionId);
      }
    }
    
    // Top-level parts (legacy format)
    if (structure?.parts) {
      for (const part of structure.parts) {
        if (part.questionId) questionIds.push(part.questionId);
      }
    }
    
    let testQuestions: Question[] = [];
    if (questionIds.length > 0) {
      testQuestions = await db.select().from(questions).where(
        inArray(questions.id, questionIds)
      );
    }
    
    return { ...test, questions: testQuestions };
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

  async getAttemptAnswers(attemptId: number): Promise<AttemptAnswer[]> {
    return await db.select().from(attemptAnswers).where(eq(attemptAnswers.attemptId, attemptId));
  }

  async upsertAnswer(answer: any): Promise<AttemptAnswer> {
    const existing = await db.select().from(attemptAnswers)
      .where(eq(attemptAnswers.attemptId, answer.attemptId))
      .where(eq(attemptAnswers.questionId, answer.questionId));
    
    if (existing.length > 0) {
      const [updated] = await db.update(attemptAnswers)
        .set({ answer: answer.answer, isCorrect: answer.isCorrect, score: answer.score })
        .where(eq(attemptAnswers.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [saved] = await db.insert(attemptAnswers).values(answer).returning();
      return saved;
    }
  }

  async getPassage(id: number): Promise<any | undefined> {
    const [passage] = await db.select().from(passages).where(eq(passages.id, id));
    return passage;
  }

  async getPassagesByIds(ids: number[]): Promise<any[]> {
    if (ids.length === 0) return [];
    return await db.select().from(passages).where(inArray(passages.id, ids));
  }

  async getAttemptWithDetails(id: number): Promise<any | undefined> {
    const attempt = await this.getAttempt(id);
    if (!attempt) return undefined;
    
    if (!attempt.testId) return { ...attempt, test: null, answers: [], passages: [] };
    
    const test = await this.getTest(attempt.testId);
    if (!test) return { ...attempt, test: null, answers: [], passages: [] };
    
    const answers = await this.getAttemptAnswers(id);
    
    const passageIds: number[] = [];
    if (test.questions) {
      for (const q of test.questions) {
        if (q.passageId && !passageIds.includes(q.passageId)) {
          passageIds.push(q.passageId);
        }
      }
    }
    
    const passagesList = await this.getPassagesByIds(passageIds);
    
    return {
      ...attempt,
      test,
      answers,
      passages: passagesList
    };
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
