"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import PlaceholderImage from "./placeholder-image"

// Mock data - would be fetched from an API in a real application
const testimonials = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Software Engineer",
    content:
      "Grivax.gen completely transformed my learning experience. The personalized courses and adaptive quizzes helped me master complex topics in half the time it would have taken with traditional methods.",
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Data Scientist",
    content:
      "As someone who needs to stay current with the latest in data science, Grivax.gen has been invaluable. The platform identifies my knowledge gaps and creates targeted learning paths to address them.",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "UX Designer",
    content:
      "The interactive nature of Grivax.gen's courses makes learning engaging and effective. I've recommended it to all my colleagues who want to upskill or transition to new roles.",
  },
]

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="min-w-full px-4">
              <Card className="border-none bg-muted/50 shadow-none">
                <CardContent className="flex flex-col items-center p-6 text-center md:p-10">
                  <Quote className="mb-6 h-12 w-12 text-primary/20" />
                  <p className="mb-6 text-lg italic text-muted-foreground md:text-xl">"{testimonial.content}"</p>
                  <div className="flex flex-col items-center">
                    <div className="mb-4 h-16 w-16 overflow-hidden rounded-full">
                      <PlaceholderImage
                        width={100}
                        height={100}
                        alt={testimonial.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <h4 className="font-poppins font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={prevTestimonial}
          className="h-8 w-8 rounded-full"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {testimonials.map((_, index) => (
          <Button
            key={index}
            variant="outline"
            size="icon"
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full p-0 ${index === currentIndex ? "bg-primary" : "bg-muted-foreground/20"}`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={nextTestimonial}
          className="h-8 w-8 rounded-full"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

