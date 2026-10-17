# Grivax.gen

AI-powered learning management system. Generates personalized courses, units, chapters, reading materials, YouTube resources, and assessments with Google Gemini. Includes an AI tutor chatbot, public course marketplace, student enrollment, and progress tracking.

## Architecture

```
grivax.gen/
├── frontend/          # Next.js 14 App Router (React 18, TypeScript, Tailwind, shadcn/ui)
├── backend/           # Spring Boot 4.1.1 (Java 25, Spring Data JPA, PostgreSQL)
└── docs/              # Architecture & sequence diagrams, wireframes
```

The frontend calls the backend REST API (`/api/*`) either directly or through Next.js rewrites defined in `next.config.mjs`.

## Backend (`/backend`)

**Stack:** Spring Boot 4.1.1 · Java 25 · Maven · PostgreSQL · Spring Data JPA · Spring RestClient · Lombok · BCrypt

**API surface (all under `/api`):**

| Controller | Endpoints | Purpose |
|---|---|---|
| `AuthController` | `/signup`, `/auth/verify-credentials`, `/auth/oauth-user`, `/verify-recaptcha` | Signup, login verification, OAuth sync, reCAPTCHA v3 |
| `CourseController` | `/courses`, `/{user_id}/{course_id}`, chapter complete/status | Private courses, chapter/unit/course progress |
| `CourseGenerationController` | `/generate-course/*`, `/generate-public-course/*`, `/convert-to-public-course/*` | AI course generation, async detailed build, public conversion |
| `ChatController` | `/chat` | Gemini AI tutor with page context |
| `AssessmentController` | `/assessments`, `/quizzes` | Course assessments, attempts, scoring |
| `UnitTestController` | `/unit-tests`, `/test` | Per-unit flashcard tests and attempts |
| `PublicCourseController` | `/public-courses` | Public marketplace, enrollment, chapter management |
| `StudentController` | `/students`, `/{user_id}/enrolled-courses` | Student directory, enrollments |
| `UserController` | `/user`, `/update-role` | Profile, role (STUDENT/TEACHER) |

**External services used:** Gemini (course content, chat, assessments, flashcards), YouTube Data API (video links), Google Custom Search (course images), reCAPTCHA v3 (signup protection).

**Run locally:**
```bash
cd backend
./mvnw spring-boot:run
```
API defaults to `http://localhost:8080`. Requires a PostgreSQL database.

## Frontend (`/frontend`)

**Stack:** Next.js 14.2.29 · React 18 · TypeScript · Tailwind CSS · shadcn/ui · NextAuth.js v4 · framer-motion · react-three/fiber · reactflow

**Routes:** `/`, `/login`, `/signup`, `/select-role`, `/dashboard/[user_id]`, `/courses/*`, `/generate-courses/*`, `/generate-public-course/*`, `/create-public-course/*`, `/public-courses/*`, `/assessments/*`, `/api/auth/[...nextauth]`

**Run locally:**
```bash
cd frontend
npm install
npm run dev
```
App defaults to `http://localhost:3000` and proxies `/api/*` to the backend.

## Environment variables

### Backend (`application.properties`)

| Variable | Required | Notes |
|---|---|---|
| `SPRING_DATASOURCE_URL` | Yes | Production PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | Yes | |
| `SPRING_DATASOURCE_PASSWORD` | Yes | |
| `SERVER_PORT` | No | Default `8080` |
| `CORS_ALLOWED_ORIGINS` | Yes | Production frontend origin(s), e.g. `https://app.grivax.gen` |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `YOUTUBE_API_KEY` | Yes | YouTube Data API key |
| `GOOGLE_API_KEY` | Yes | Falls back to `YOUTUBE_API_KEY` if unset |
| `GOOGLE_CX` | Yes | Google Custom Search Engine ID |
| `RECAPTCHA_SECRET_KEY` | Yes | reCAPTCHA v3 secret key |

### Frontend

| Variable | Required | Notes |
|---|---|---|
| `BACKEND_URL` | Yes | Production backend URL (default is `http://localhost:8080`) |
| `NEXTAUTH_SECRET` | Yes | Random string (e.g. `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | Production frontend URL |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Google OAuth |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | No | GitHub OAuth |

Never commit `.env` files (already ignored by `.gitignore`).

### Production .env Examples

### Backend (backend/.env or platform env vars)
SPRING_DATASOURCE_URL=jdbc:postgresql://prod-db-host:5432/grivax_prod
SPRING_DATASOURCE_USERNAME=grivax_prod
SPRING_DATASOURCE_PASSWORD=changeme-strong-password
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=https://app.grivax.gen
GEMINI_API_KEY=your-gemini-production-key
YOUTUBE_API_KEY=your-youtube-production-key
GOOGLE_API_KEY=your-google-api-key
GOOGLE_CX=your-google-search-cx-id
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
Also override in application.properties (or a application-prod.properties profile):
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

### Frontend (frontend/.env.production)
BACKEND_URL=https://api.grivax.gen
NEXTAUTH_URL=https://app.grivax.gen
NEXTAUTH_SECRET=your-32-character-random-secret
NODE_ENV=production
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key

## Deployment notes

- Backend needs a running PostgreSQL instance; no `compose.yaml` is present in the repo.
- Set `CORS_ALLOWED_ORIGINS` to your production frontend domain before deploying.
- Build the backend with `./mvnw package` and run the produced jar, or use the included `Dockerfile`.
- The frontend is a standard Next.js app — deploy to Vercel, Docker, or any Node host with the environment variables above.

## License

MIT