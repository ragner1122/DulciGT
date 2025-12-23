import { z } from 'zod';
import { insertQuestionSchema, insertTestSchema, insertAttemptSchema, insertPlanSchema, insertUploadSchema, questions, tests, attempts, studyPlans, uploads } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  questions: {
    list: {
      method: 'GET' as const,
      path: '/api/questions',
      input: z.object({
        section: z.string().optional(),
        type: z.string().optional(),
        limit: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof questions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/questions',
      input: insertQuestionSchema,
      responses: {
        201: z.custom<typeof questions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/questions/generate-test',
      input: z.object({
        sections: z.array(z.string()), // listening, reading, etc.
        difficulty: z.number().optional(),
      }),
      responses: {
        201: z.custom<typeof tests.$inferSelect>(),
      },
    }
  },
  tests: {
    list: {
      method: 'GET' as const,
      path: '/api/tests',
      responses: {
        200: z.array(z.custom<typeof tests.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tests/:id',
      responses: {
        200: z.custom<typeof tests.$inferSelect & { questions: typeof questions.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  attempts: {
    list: {
      method: 'GET' as const,
      path: '/api/attempts',
      responses: {
        200: z.array(z.custom<typeof attempts.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/attempts',
      input: insertAttemptSchema,
      responses: {
        201: z.custom<typeof attempts.$inferSelect>(),
      },
    },
    submitAnswer: {
      method: 'POST' as const,
      path: '/api/attempts/:id/answers',
      input: z.object({
        questionId: z.number(),
        answer: z.any(),
      }),
      responses: {
        200: z.object({ success: z.boolean(), feedback: z.any().optional() }),
      },
    },
    complete: {
      method: 'POST' as const,
      path: '/api/attempts/:id/complete',
      responses: {
        200: z.custom<typeof attempts.$inferSelect>(),
      },
    }
  },
  plans: {
    get: {
      method: 'GET' as const,
      path: '/api/study-plan',
      responses: {
        200: z.custom<typeof studyPlans.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/study-plan',
      input: insertPlanSchema,
      responses: {
        201: z.custom<typeof studyPlans.$inferSelect>(),
      },
    },
  },
  uploads: {
    list: {
      method: 'GET' as const,
      path: '/api/uploads/history',
      responses: {
        200: z.array(z.custom<typeof uploads.$inferSelect>()),
      },
    },
    process: {
      method: 'POST' as const,
      path: '/api/uploads/:id/process',
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
