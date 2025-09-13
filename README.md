# Grivax - Dynamic Education Platform

## 🚀 Project Overview
**Grivax** is a next-generation education platform designed to generate **automated and dynamic courses and quizzes**. The platform provides a one-stop solution for exam preparation, offering a seamless learning experience with modern UI/UX, multi-language support, and intelligent content generation.

### 🔹 Key Features
- **Dynamic Content Generation:** AI-driven course and quiz generation.
- **Multi-Language Support:** Supports **English and Hindi**.
- **Dark & Light Mode:** User-friendly theme toggle.
- **Smooth Transitions:** Elegant animations enhance user experience.
- **Fully Responsive:** Optimized for **desktop, tablet, and mobile**.
- **Modern UI:** Inspired by [learnweb3.io](https://learnweb3.io/) with a sleek and stylish design.
- **Scalable Architecture:** Built for easy integration with future backend APIs.

---

## 🔧 How It Works
1. **Course & Quiz Generation:** The platform dynamically generates course content and quizzes based on user input.
2. **User Interaction:** Users can explore generated courses, take quizzes, and track progress.
3. **Adaptive UI:** The website supports theme switching and localization (English/Hindi).
4. **Smooth Navigation:** The app uses client-side routing and transitions for a seamless experience.

---

## 🛠️ Tech Stack
### Frontend:
- **Next.js (App Router)** - Modern React framework for SSR and SSG.
- **Tailwind CSS** - Utility-first CSS for styling.
- **i18next** - Internationalization support.
- **Framer Motion** - Smooth animations.

### Backend (Planned for Future Integration):
- **Node.js & Express** - Backend server.
- **MongoDB / PostgreSQL** - Database for storing course and quiz data.
- **OpenAI API** - AI-powered content generation (future scope).

---

## 📜 Vision & Future Enhancements
Grivax aims to revolutionize online learning by automating course and quiz creation. Future versions will include:
- **AI-driven personalized recommendations**
- **Gamification with rewards and leaderboards**
- **Voice-assisted learning**
- **Integration with educational APIs**
- **Collaboration features for group studies**

---

## 🔄 Software Development Life Cycle (SDLC)
The project follows the **Agile SDLC model** to ensure continuous improvements and adaptability.

### 🔹 Phase 1: Planning & Requirement Analysis
- Define core features and functionality.
- Research user needs and design UI wireframes.

### 🔹 Phase 2: System Design
- Architect frontend using Next.js App Router.
- Define API contracts for backend integration.

### 🔹 Phase 3: Development
- Implement frontend with dynamic routing.
- Develop UI components (NavBar, Course Cards, Quiz UI, etc.).
- Integrate multi-language support and theme switching.

### 🔹 Phase 4: Testing
- Conduct unit tests for components.
- Perform UI/UX testing across devices.
- Ensure smooth transitions and accessibility.

### 🔹 Phase 5: Deployment & Maintenance
- Deploy on **Vercel** for frontend hosting.
- Plan for future backend integration.
- Monitor user feedback and iterate based on Agile sprints.

---

## 📑 Technical Documentation
### 🏗️ Folder Structure
```
/src
  ├── app (Next.js App Router)
  ├── components (Reusable UI components)
  ├── hooks (Custom React hooks)
  ├── styles (Tailwind CSS global styles)
  ├── utils (Helper functions)
  ├── i18n (Localization files)
  ├── public (Static assets)
  ├── pages (Fallback for App Router)
```

### 📜 API Endpoints (Planned)
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | /api/courses | Fetch all dynamically generated courses |
| GET | /api/quizzes | Retrieve quizzes for a course |
| POST | /api/quiz/submit | Submit user answers and get scores |

---

## 🚀 Getting Started
### Prerequisites:
- **Node.js v18+**
- **npm / yarn / pnpm**

### Installation:
```bash
git clone https://github.com/your-username/grivax-gen.git
cd grivax-gen
npm install
npm run dev
```
The application will be available at `http://localhost:3000`

---

## 📌 Contribution Guidelines
We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m 'Add new feature'`).
4. Push to branch (`git push origin feature-name`).
5. Open a Pull Request.

---

## 📜 License
This project is licensed under the **MIT License**.

---

## 📞 Contact
For inquiries, open an issue or reach out via email at **22ucc123@lnmiit.ac.in**.

---

## ⚙️ Course Generation Progress Tracking

Real-time (near) progress for course material generation is exposed through an enhanced status endpoint and a lightweight polling UI component.

### Backend Flow
1. User accepts a generated outline (`/api/generate-course/[user_id]/[course_id]` POST).
2. Server triggers detailed content + unit & chapter creation **asynchronously** (background task) and returns immediately.
3. While units/chapters are persisted, the client polls:
   `/api/generate-course/[user_id]/[course_id]/status`.
4. The status route derives progress directly from the database—no extra tables required.

### Status Response Shape
```
{
  status: 'generating' | 'completed',
  course_id,
  user_id,
  progress: {
    percent: number,
    unitsCreated: number,
    completedUnits: number,        // units with >=1 chapter
    totalIntendedUnits: number,    // from original outline (modules length)
    totalChapters: number,
    chaptersPerUnit: [{ unit_id, chapters }]
  }
}
```

### Frontend Component
`CourseGenerationProgress` (in `src/components/course-generation-progress.tsx`) handles polling every 2.5s, displays:
- Overall percent bar
- Per-unit badges (✓ when at least one chapter created)
- Auto-calls `onComplete()` when status reaches `completed`.

### Design Decisions
- Chose polling over SSE to minimize infra changes and keep deploy targets (e.g. serverless) simple.
- Progress inference avoids schema migration; can evolve later (e.g. add `generation_state` table if granular events needed).
- Background generation isolates latency from user interaction and enables future cancellation patterns.

### Extensibility Ideas
- Swap polling for Server-Sent Events (SSE) if longer generation tasks appear.
- Persist fine-grained events (chapter_started, unit_completed) for audit / analytics.
- Add cancellation endpoint to abort long external API calls.

