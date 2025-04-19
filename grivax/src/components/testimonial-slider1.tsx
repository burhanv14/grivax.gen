"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { ArrowLeft, ArrowRight, Quote, Star, Clock, Award, Heart } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Rahul Gupta",
    title: "Computer Science Student",
    text: "Grivax.gen has completely transformed my learning experience. The personalized courses and quizzes have helped me grasp complex programming concepts I struggled with before.",
    image: "/placeholder.svg?height=80&width=80",
    color: "from-primary/20 to-primary/5",
    rating: 5,
    icon: Star,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    achievement: "Completed 12 courses",
  },
  {
    id: 2,
    name: "Rohan Joshi",
    title: "Mathematics Teacher",
    text: "I highly recommend Grivax.gen to both students and educators. The adaptive learning technology is truly innovative and effective for teaching advanced mathematical concepts.",
    image: "/placeholder.svg?height=80&width=80",
    color: "from-purple-600/20 to-purple-600/5",
    rating: 4.5,
    icon: Award,
    iconBg: "bg-purple-600/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    achievement: "Improved student scores by 32%",
  },
  {
    id: 3,
    name: "Karan Jain",
    title: "Parent of High School Student",
    text: "As a parent, I'm thrilled with the progress my child has made using Grivax.gen. It's engaging, educational, and tailored to their individual needs. Their grades have improved significantly!",
    image: "/placeholder.svg?height=80&width=80",
    color: "from-green-500/20 to-green-500/5",
    rating: 5,
    icon: Heart,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500",
    achievement: "Child's GPA increased from 3.2 to 3.8",
  },
  {
    id: 4,
    name: "Sheetal Gupta",
    title: "Biology Researcher",
    text: "The interactive learning modules for scientific subjects are outstanding. I use Grivax.gen to stay updated on the latest research methodologies and to prepare for my lectures.",
    image: "/placeholder.svg?height=80&width=80",
    color: "from-blue-500/20 to-blue-500/5",
    rating: 4.5,
    icon: Clock,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    achievement: "Saved 10+ hours weekly on lesson planning",
  },
]

// Star rating component
const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.floor(rating)
        const isHalf = !isFilled && star === Math.ceil(rating) && rating % 1 !== 0

        return (
          <div key={star} className="relative">
            <Star className={`h-4 w-4 ${isFilled ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`} />
            {isHalf && (
              <div className="absolute inset-0 overflow-hidden w-[50%]">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              </div>
            )}
          </div>
        )
      })}
      <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const containerRef = useRef(null)
  const autoplayRef = useRef(null)
  const progressRef = useRef(null)

  // Progress animation
  const progress = useMotionValue(0)
  const springProgress = useSpring(progress, { damping: 20, stiffness: 100 })

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        handlePrev()
      } else if (e.key === "ArrowRight") {
        handleNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const resetAutoplay = () => {
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current)
    }

    // Reset progress animation
    progress.set(0)

    const startTime = Date.now()
    const duration = 6000 // 6 seconds

    const updateProgress = () => {
      if (progressRef.current) {
        const elapsed = Date.now() - startTime
        const newProgress = Math.min((elapsed / duration) * 100, 100)
        progress.set(newProgress)

        if (newProgress < 100) {
          requestAnimationFrame(updateProgress)
        }
      }
    }

    progressRef.current = requestAnimationFrame(updateProgress)

    autoplayRef.current = setTimeout(() => {
      if (!isDragging) {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
      }
    }, duration)
  }

  useEffect(() => {
    resetAutoplay()
    return () => {
      if (autoplayRef.current) {
        clearTimeout(autoplayRef.current)
      }
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current)
      }
    }
  }, [currentIndex, isDragging])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    resetAutoplay()
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    resetAutoplay()
  }

  const handleDragStart = (e) => {
    setIsDragging(true)
    setStartX(e.clientX || (e.touches && e.touches[0].clientX) || 0)
  }

  const handleDragEnd = (e) => {
    if (!isDragging) return

    const endX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0
    const diffX = endX - startX

    if (diffX > 100) {
      handlePrev()
    } else if (diffX < -100) {
      handleNext()
    }

    if (containerRef.current) {
      containerRef.current.style.transform = ""
    }

    setIsDragging(false)
  }

  const handleDragMove = (e) => {
    if (!isDragging || !containerRef.current) return

    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0
    const diffX = currentX - startX

    // Visual feedback during drag
    if (Math.abs(diffX) > 20) {
      containerRef.current.style.transform = `translateX(${diffX * 0.2}px)`
    }
  }

  const testimonial = testimonials[currentIndex]
  const IconComponent = testimonial.icon

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="absolute -top-2 left-0 right-0 h-0.5 bg-primary/10 rounded-full overflow-hidden z-10">
        <motion.div className="h-full bg-primary" style={{ width: springProgress.get() + "%" }} />
      </div>

      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${testimonial.color} rounded-2xl -z-10 blur-xl opacity-70`} />

      {/* Main container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl p-1 cursor-grab active:cursor-grabbing"
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseMove={handleDragMove}
        onMouseLeave={() => {
          if (isDragging && containerRef.current) {
            containerRef.current.style.transform = ""
          }
          setIsDragging(false)
        }}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onTouchMove={handleDragMove}
      >
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-muted/50 dark:bg-muted/50">
          <div className="relative">
            <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20 rotate-180" />

            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className={`absolute -bottom-2 -right-2 p-2 rounded-full ${testimonial.iconBg} ${testimonial.iconColor} shadow-lg border border-background`}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
              </div>

              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-2">
                  <div>
                    <h4 className="font-bold text-xl">{testimonial.name}</h4>
                    <p className="text-muted-foreground">{testimonial.title}</p>
                  </div>
                  <StarRating rating={testimonial.rating} />
                </div>

                <p className="text-lg md:text-xl text-foreground/90 italic leading-relaxed">"{testimonial.text}"</p>

                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${testimonial.iconBg} ${testimonial.iconColor} text-sm font-medium mt-2`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{testimonial.achievement}</span>
                </div>
              </div>
            </div>

            <Quote className="absolute -bottom-2 -right-2 h-8 w-8 text-primary/20" />
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center mt-6 space-x-3">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index)
              resetAutoplay()
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-primary scale-125" : "bg-primary/30 hover:bg-primary/50"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation arrows - redesigned for a sleeker look */}
      <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-8 mt-4">
        <button
          onClick={handlePrev}
          className="group relative flex items-center justify-center"
          aria-label="Previous testimonial"
        >
          <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:translate-x-[-3px] transition-transform duration-200">
            <ArrowLeft className="h-5 w-5" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Prev</span>
          </div>
        </button>

        <button
          onClick={handleNext}
          className="group relative flex items-center justify-center"
          aria-label="Next testimonial"
        >
          <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:translate-x-[3px] transition-transform duration-200">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Next</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </button>
      </div>
    </div>
  )
}
