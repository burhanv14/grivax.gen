import type React from 'react';

export interface Testimonial {
  id: number | string;
  name: string;
  title: string;
  text: string;
  image: string;
  color: string;
  rating: number;
  icon?: React.ElementType;
  iconBg?: string;
  iconColor?: string;
  achievement: string;
}
