interface CourseCardProps {
  title: string;
  description: string;
  image: string;
  duration: string;
  level: string;
  price: number;
  rating: number;
  instructor: string;
  category: string;
}

export function CourseCard({
  title,
  description,
  image,
  duration,
  level,
  price,
  rating,
  instructor,
  category
}: CourseCardProps) {
  // ... existing code ...
} 