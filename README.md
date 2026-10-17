# Grivax.gen

AI-powered learning platform. Personalized courses, AI-generated assessments, and doubt-solving — built with a Next.js frontend and a Spring Boot backend.

## Tech Stack

**Frontend** (`/frontend`) — Next.js 14 · React 18 · TypeScript · Tailwind CSS · shadcn/ui · NextAuth · reactflow

**Backend** (`/backend`) — Spring Boot 4.1.1 · Java 25 · Spring Data JPA · Spring Security · Spring Data REST · PostgreSQL

**Integrations** — Gemini AI · YouTube/Google Search API · reCAPTCHA v3

## Features

- AI-tailored learning paths and course content
- Auto-generated quizzes and assessments
- AI-powered doubt solving
- Video lessons with YouTube integration
- User authentication & course enrollment
- Progress tracking and certificates

## Project Structure

```
grivax.gen/
├── frontend/          # Next.js web app
├── backend/           # Spring Boot REST API
└── docs/              # Architecture diagrams & wireframes
```

## Quick Start

### Prerequisites

- Node.js 20+
- Java 25 + Maven
- PostgreSQL database

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API runs on `http://localhost:8080` (configurable via `SERVER_PORT`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000` and proxies `/api` requests to the backend.

### Environment Variables

Create `.env` files in both `frontend/` and `backend/` as needed:

**Backend** (`application.properties`):
```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/grivax
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your-password
GEMINI_API_KEY=your-gemini-key
YOUTUBE_API_KEY=your-youtube-key
GOOGLE_CX=your-google-cx
RECAPTCHA_SECRET_KEY=your-recaptcha-secret
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend**:
```env
BACKEND_URL=http://localhost:8080
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

## Docs

Architecture diagrams, sequence diagrams, and wireframes are in [`/docs`](docs).

## License

MIT