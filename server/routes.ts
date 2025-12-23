import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Integrations
  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);
  registerImageRoutes(app);
  registerObjectStorageRoutes(app);

  // API Routes
  
  // Questions
  app.get(api.questions.list.path, async (req, res) => {
    const filters = {
      section: req.query.section as string,
      type: req.query.type as string,
      limit: req.query.limit ? Number(req.query.limit) : undefined
    };
    const questions = await storage.getQuestions(filters);
    res.json(questions);
  });

  app.post(api.questions.create.path, async (req, res) => {
    try {
      const input = api.questions.create.input.parse(req.body);
      const question = await storage.createQuestion(input);
      res.status(201).json(question);
    } catch (err) {
       if (err instanceof z.ZodError) {
         res.status(400).json({ message: err.errors[0].message });
       }
    }
  });

  // Tests
  app.get(api.tests.list.path, async (req, res) => {
    const tests = await storage.getTests();
    res.json(tests);
  });

  app.get(api.tests.get.path, async (req, res) => {
    const test = await storage.getTest(Number(req.params.id));
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json(test); 
  });

  app.post("/api/questions/generate-test", async (req, res) => {
    // Mock generation logic
    const { sections } = req.body;
    const test = await storage.createTest({
      title: `Generated Test - ${new Date().toLocaleDateString()}`,
      structure: { sections },
      isSystem: false
    });
    res.status(201).json(test);
  });

  // Attempts
  app.get(api.attempts.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const attempts = await storage.getUserAttempts(userId);
    res.json(attempts);
  });

  app.post(api.attempts.create.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const input = api.attempts.create.input.parse(req.body);
    const attempt = await storage.createAttempt({ ...input, userId });
    res.status(201).json(attempt);
  });

  app.post(api.attempts.submitAnswer.path, isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { questionId, answer } = req.body;
    // Save answer
    await storage.saveAnswer({
      attemptId: Number(id),
      questionId,
      answer,
      isCorrect: false, // Logic to check answer needed
      score: 0
    });
    res.json({ success: true });
  });

  app.post(api.attempts.complete.path, isAuthenticated, async (req, res) => {
     const { id } = req.params;
     // Calculate score logic here
     const attempt = await storage.updateAttemptStatus(Number(id), "completed", { total: 0 }, new Date());
     res.json(attempt);
  });

  // Study Plan
  app.get(api.plans.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const plan = await storage.getStudyPlan(userId);
    if (!plan) return res.status(404).json({ message: "No plan found" });
    res.json(plan);
  });

  app.post(api.plans.create.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const input = api.plans.create.input.parse(req.body);
    const plan = await storage.createStudyPlan({ ...input, userId });
    res.status(201).json(plan);
  });

  // Uploads
  app.get(api.uploads.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const uploads = await storage.getUploads(userId);
    res.json(uploads);
  });

  app.post(api.uploads.process.path, isAuthenticated, async (req: any, res) => {
    const { id } = req.params;
    // Mock process logic
    // In real app, trigger OCR/Parser background job here
    res.json({ success: true });
  });

  // Seeding
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingTests = await storage.getTests();
  if (existingTests.length === 0) {
    // Add a demo test
    await storage.createTest({
      title: "IELTS GT Mock Test 1",
      structure: { sections: ["listening", "reading", "writing", "speaking"] },
      isSystem: true
    });
    
    // Add some dummy questions
    await storage.createQuestion({
      section: "reading",
      type: "multiple_choice",
      content: "What is the main topic of the passage?",
      options: ["History", "Science", "Art", "Sports"],
      correctAnswer: "History",
      difficulty: 1
    });
  }
}
