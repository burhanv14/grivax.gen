export interface Chapter {
  id?: string;
  chapter_id?: string;
  name: string;
  description?: string;
  youtubeVidLink: string;
  readingMaterial: string | null;
  unit_id?: string;
  isCompleted?: boolean;
  order?: number;
  course_id?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UnitTestSummary {
  test_id: string;
  questions: any[];
}

export interface Unit {
  id?: string;
  unit_id?: string;
  name: string;
  course_id?: string;
  chapters: Chapter[];
  progress?: number;
  order?: number;
  test?: UnitTestSummary;
  isCompleted?: boolean;
  isSelected?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Course {
  id?: string;
  course_id: string;
  user_id?: string;
  genId?: string;
  title: string;
  description?: string;
  image?: string;
  units?: Unit[];
  progress?: number;
  assessment?: {
    assessment_id: string;
    questions: any[];
    attempts: Array<{
      attempt_id: string;
      score: number;
      correctCount: number;
      totalQuestions: number;
      completedAt: string;
    }>;
  };
  quiz?: {
    quiz_id: string;
    questions: any[];
    attempts: Array<{
      attempt_id: string;
      score: number;
      correctCount: number;
      totalQuestions: number;
      completedAt: string;
    }>;
  };
  isCompleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CourseModule {
  week: number;
  title: string;
  objectives: string[];
  timeSpent: string;
}

export interface CourseStructure {
  title: string;
  description: string;
  modules: CourseModule[];
}

export interface CourseOutlineData {
  course_id: string;
  courseStructure: CourseStructure;
}

export type CourseData = CourseOutlineData;

export interface ChapterProgress {
  unit_id: string;
  chapters: number;
}

export interface GenerationProgress {
  percent: number;
  unitsCreated: number;
  totalIntendedUnits: number;
  chaptersPerUnit: ChapterProgress[];
}

export interface CourseGenerationStatus {
  course_id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed' | string;
  progress?: GenerationProgress;
  error?: string;
}

export interface EnrolledCourse {
  id: string;
  title: string;
  image: string;
  progress: number;
  lastActivity: string;
  nextLesson: string;
  isCompleted: boolean;
}
