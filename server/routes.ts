import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, bandToDisplay } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { seedDatabase } from "./seed";

// Centralized error handler to prevent crashes
function handleError(res: Response, err: unknown) {
  console.error("API Error:", err);
  if (err instanceof z.ZodError) {
    const firstError = err.errors[0];
    return res.status(400).json({ 
      message: firstError.message,
      field: firstError.path.join('.')
    });
  }
  if (err instanceof Error) {
    return res.status(500).json({ message: err.message });
  }
  return res.status(500).json({ message: "An unexpected error occurred" });
}

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
  
  // Seed database on startup
  await seedDatabase();

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
    try {
      const userId = req.user.claims.sub;
      const plan = await storage.getStudyPlan(userId);
      if (!plan) return res.status(404).json({ message: "No plan found" });
      // Convert stored band (int x2) back to display (float)
      const displayPlan = {
        ...plan,
        targetBand: bandToDisplay(plan.targetBand)
      };
      res.json(displayPlan);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post(api.plans.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Parse and transform: float targetBand -> int x2, string examDate -> Date
      const input = api.plans.create.input.parse(req.body);
      
      // Generate actual plan data based on target band and exam date
      const daysUntilExam = Math.ceil((input.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const planMode = daysUntilExam <= 15 ? "15-day" : "30-day";
      const displayBand = bandToDisplay(input.targetBand);
      
      const planData = generateStudyPlan(displayBand, daysUntilExam, planMode);
      
      const plan = await storage.createStudyPlan({ 
        ...input, 
        userId,
        planData
      });
      
      // Return with display band
      res.status(201).json({
        ...plan,
        targetBand: displayBand
      });
    } catch (err) {
      handleError(res, err);
    }
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

  return httpServer;
}

// Generate actual study plan data
function generateStudyPlan(targetBand: number, daysUntilExam: number, mode: string) {
  const weeks = mode === "15-day" ? 2 : 4;
  const dailyTasks: any[] = [];
  
  // Determine focus areas based on target band
  const focusAreas = targetBand >= 7.5 
    ? ["Advanced Writing", "Complex Reading", "Speaking Fluency", "Listening Detail"]
    : targetBand >= 6.5
    ? ["Writing Structure", "Reading Speed", "Speaking Confidence", "Listening Practice"]
    : ["Grammar Basics", "Vocabulary Building", "Reading Comprehension", "Listening Fundamentals"];

  // Generate daily schedule
  for (let day = 1; day <= Math.min(daysUntilExam, mode === "15-day" ? 15 : 30); day++) {
    const weekNum = Math.ceil(day / 7);
    const dayOfWeek = ((day - 1) % 7) + 1;
    
    let tasks: string[] = [];
    let section: string;
    
    // Rotate through sections
    switch (dayOfWeek) {
      case 1: // Monday - Listening
        section = "listening";
        tasks = ["Complete 1 listening test section", "Review mistakes", "Shadow practice 15 min"];
        break;
      case 2: // Tuesday - Reading  
        section = "reading";
        tasks = ["Complete 2 reading passages", "Vocabulary extraction", "Speed reading drill"];
        break;
      case 3: // Wednesday - Writing
        section = "writing";
        tasks = ["Write Task 1 letter (20 min)", "Write Task 2 essay (40 min)", "Review model answers"];
        break;
      case 4: // Thursday - Speaking
        section = "speaking";
        tasks = ["Practice Part 1 questions", "Record Part 2 monologue", "Part 3 discussion practice"];
        break;
      case 5: // Friday - Mixed Review
        section = "mixed";
        tasks = ["Review week's mistakes", "Vocabulary quiz", "Timed practice any weak area"];
        break;
      case 6: // Saturday - Mock Test
        section = "full_test";
        tasks = weekNum % 2 === 0 
          ? ["Complete full mock test", "Score and analyze"]
          : ["Half test (Listening + Reading)", "Deep review"];
        break;
      case 7: // Sunday - Light Review
        section = "rest";
        tasks = ["Light vocabulary review", "Watch English content", "Relaxation day"];
        break;
      default:
        section = "mixed";
        tasks = ["General practice"];
    }

    dailyTasks.push({
      day,
      week: weekNum,
      date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      section,
      tasks,
      estimatedMinutes: section === "full_test" ? 180 : section === "rest" ? 30 : 90,
      completed: false
    });
  }

  return {
    mode,
    targetBand,
    totalDays: dailyTasks.length,
    focusAreas,
    weeklyGoals: [
      { week: 1, goal: "Foundation & Assessment", focus: "Identify weak areas through diagnostic tests" },
      { week: 2, goal: "Skill Building", focus: focusAreas.slice(0, 2).join(" & ") },
      ...(mode === "30-day" ? [
        { week: 3, goal: "Intensive Practice", focus: "Focus on weakest sections" },
        { week: 4, goal: "Mock Tests & Polish", focus: "Full tests and final refinement" }
      ] : [])
    ],
    dailyTasks,
    tips: [
      "Complete all tasks in order for best results",
      "Review mistakes immediately after each practice",
      "Record speaking practice for self-assessment",
      "Take notes on new vocabulary daily",
      targetBand >= 7 ? "Focus on coherence and advanced vocabulary" : "Focus on accuracy and basic structures"
    ]
  };
}
