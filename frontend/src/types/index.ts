export * from './course';
export * from './public-course';
export * from './assessment';
export * from './chat';
export * from './testimonial';

export interface UserPageProps {
  params: {
    user_id: string;
  };
}

export type GenerateCoursesPageProps = UserPageProps;
export type GeneratePublicCoursesPageProps = UserPageProps;
