# DULCi IELTS HUB

## Overview

DULCi IELTS HUB is a production-grade web application for IELTS General Training (computer-based) test preparation. The platform provides mock tests, a question bank, AI-powered scoring for writing and speaking, study planning, and material uploads with auto-organization. The app is designed to help users prepare for all four IELTS sections: Listening, Reading, Writing, and Speaking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design tokens (CSS variables for theming)
- **Charts**: Recharts for analytics visualization
- **Animations**: Framer Motion for transitions
- **File Uploads**: Uppy with AWS S3 presigned URL flow

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in `shared/routes.ts` as the contract
- **Validation**: Zod schemas for request/response validation
- **Authentication**: Replit Auth with OpenID Connect, session-based with connect-pg-simple
- **AI Integration**: OpenAI API for chat, image generation, and IELTS scoring

### Database
- **Provider**: Neon Postgres (serverless PostgreSQL)
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Key Tables**: users, sessions, passages, questions, tests, attempts, attempt_answers, study_plans, uploads, conversations, messages
- **Enums**: section (listening/reading/writing/speaking), question_type (multiple_choice, true_false_not_given, etc.)

### API Contract
All endpoints are defined in `shared/routes.ts` with Zod schemas:
- `GET/POST /api/questions` - Question bank CRUD
- `POST /api/questions/generate-test` - AI test generation
- `GET /api/tests`, `GET /api/tests/:id` - Test retrieval
- `GET/POST /api/attempts` - Test attempt management
- `POST /api/attempts/:id/answers` - Answer submission
- `POST /api/attempts/:id/complete` - Complete attempt with scoring
- `GET/POST /api/study-plan` - Study plan management
- `GET /api/uploads/history`, `POST /api/uploads/:id/process` - File uploads

### Key Design Patterns
- **Shared Types**: Schema and route definitions in `shared/` folder used by both client and server
- **Centralized Error Handling**: Zod validation errors return structured JSON with field information
- **Band Score Storage**: Half bands (6.5, 7.0) stored as integers multiplied by 2 (13, 14) in database
- **Idempotent Seeding**: Database seed script checks for existing data before inserting
- **Client Input Schemas**: `createAttemptInputSchema` omits userId (server adds from session)
- **Nested Question Extraction**: `getTest` extracts questionIds from sections, nested tasks, and parts

### Question & Options Format
- **Multiple Choice**: Options stored as objects `{a: "...", b: "...", c: "...", d: "..."}`
- **True/False/Not Given**: `options: null`, rendered as True/False/Not Given buttons
- **Short Answer**: `options: null`, rendered as text input
- **Essay/Letter**: `options: null`, rendered as textarea
- **correctAnswer**: Stored as key ("a", "b") for MC, string for T/F ("true", "false"), null for writing

### Seeded Content
- 9 passages across 6 topics (Tea History, Remote Work, Exercise, Fashion, Digital Literacy, Marine Biology)
- 32 questions (Reading, Writing, Speaking, Listening)
- 5 system tests including comprehensive "IELTS GT Full Mock Test 1" with all 4 sections

## External Dependencies

### Third-Party Services
- **Neon Postgres**: Serverless PostgreSQL database (connection via `DATABASE_URL`)
- **Replit Auth**: OpenID Connect authentication (`ISSUER_URL`, `REPL_ID`)
- **OpenAI API**: AI features for chat, scoring, and image generation (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- **Google Cloud Storage**: Object storage for file uploads (via Replit sidecar at localhost:1106)

### Key NPM Packages
- **Database**: drizzle-orm, pg, connect-pg-simple
- **Auth**: passport, openid-client, express-session
- **Validation**: zod, drizzle-zod
- **AI**: openai
- **Frontend**: @tanstack/react-query, @radix-ui/*, recharts, framer-motion
- **File Uploads**: @uppy/core, @uppy/aws-s3, @google-cloud/storage

### Environment Variables Required
- `DATABASE_URL` - Neon Postgres connection string
- `SESSION_SECRET` - Express session secret
- `REPL_ID` - Replit deployment ID
- `ISSUER_URL` - Replit OIDC issuer (defaults to https://replit.com/oidc)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI API base URL