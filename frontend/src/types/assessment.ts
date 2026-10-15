// ==========================================
// Assessment Types (Course-level Evaluation)
// ==========================================

export interface AssessmentQuestion {
  id?: number;
  question?: string;
  questionText?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export type Question = AssessmentQuestion;

export interface AssessmentAttempt {
  attempt_id: string;
  assessment_id?: string;
  quiz_id?: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  completedAt: string;
  answers: number[];
}

export interface AssessmentData {
  assessment?: {
    assessment_id: string;
    questions: AssessmentQuestion[];
  };
  quiz?: {
    quiz_id: string;
    questions: AssessmentQuestion[];
  };
  hasAttempt: boolean;
  attempt?: AssessmentAttempt;
}

export interface AssessmentResult {
  questionIndex: number;
  questionText: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
  options: string[];
}

export interface AssessmentResultsData {
  success: boolean;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  results: AssessmentResult[];
}

export interface AssessmentCompletion {
  courseId: string;
  hasAttempt: boolean;
  score?: number;
  completedAt?: string;
}

// ==========================================
// Unit Test Types (Unit-level Evaluation)
// ==========================================

export interface UnitTestQuestion {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
}

export interface UnitTestAttempt {
  score: number;
  correctCount: number;
  totalQuestions: number;
  completedAt: string;
}

export interface UnitTestData {
  test_id: string;
  questions: UnitTestQuestion[];
  hasAttempted: boolean;
  userAttempt: UnitTestAttempt | null;
}

// ==========================================
// Aliases for Backward Compatibility
// ==========================================
export type QuizQuestion = AssessmentQuestion;
export type QuizAttempt = AssessmentAttempt;
export type QuizData = AssessmentData;
export type QuizResult = AssessmentResult;
export type QuizResultsData = AssessmentResultsData;
export type QuizCompletion = AssessmentCompletion;
