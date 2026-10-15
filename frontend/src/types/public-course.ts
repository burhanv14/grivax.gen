export interface PublicChapter {
  id?: string;
  public_chapter_id: string;
  public_unit_id: string;
  name: string;
  youtubeVidLink: string;
  readingMaterial?: string;
  order: number;
}

export interface PublicUnit {
  id?: string;
  public_unit_id: string;
  public_course_id: string;
  name: string;
  order: number;
  chapters: PublicChapter[];
}

export interface Student {
  user_id: string;
  name?: string;
  email: string;
  image?: string;
}

export interface PublicCourseEnrollment {
  enrollment_id: string;
  public_course_id: string;
  student_id: string;
  enrolledAt: Date | string;
  progress: number;
  student: Student;
}

export interface PublicCourse {
  id?: string;
  public_course_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  image: string;
  price?: number;
  isPublished: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  teacher: {
    user_id: string;
    name?: string;
    email: string;
  };
  units: PublicUnit[];
  enrollments: PublicCourseEnrollment[];
  _count: {
    enrollments: number;
  };
}
