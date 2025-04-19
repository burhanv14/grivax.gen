"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ArrowLeft, ArrowRight, Quote, Star, Clock, Award, Heart } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    name: "Rahul Gupta",
    title: "Computer Science Student",
    text: "Grivax.gen has completely transformed my learning experience. The personalized courses and quizzes have helped me grasp complex programming concepts I struggled with before.",
    image: "https://i.pravatar.cc/",
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
    image: "https://i.pravatar.cc/",
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
    image: "https://i.pravatar.cc/",
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
    image: "https://i.pravatar.cc/",
    color: "from-blue-500/20 to-blue-500/5",
    rating: 4.5,
    icon: Clock,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    achievement: "Saved 10+ hours weekly on lesson planning",
  },
]

// Star rating component with animation
const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.floor(rating)
        const isHalf = !isFilled && star === Math.ceil(rating) && rating % 1 !== 0

        return (
          <motion.div
            key={star}
            className="relative"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
              delay: star * 0.1,
            }}
          >
            <Star className={`h-4 w-4 ${isFilled ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`} />
            {isHalf && (
              <motion.div
                className="absolute inset-0 overflow-hidden w-[50%]"
                initial={{ width: 0 }}
                animate={{ width: "50%" }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              </motion.div>
            )}
          </motion.div>
        )
      })}
      <motion.span
        className="text-sm text-muted-foreground ml-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {rating.toFixed(1)}
      </motion.span>
    </div>
  )
}

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right
  const containerRef = useRef(null)
  const autoplayRef = useRef(null)
  const progressRef = useRef(null)

  // Progress animation
  const progress = useMotionValue(0)
  const springProgress = useSpring(progress, { damping: 20, stiffness: 100 })

  // Drag animation values
  const dragX = useMotionValue(0)
  const dragXSpring = useSpring(dragX, { damping: 40, stiffness: 300 })
  const dragOpacity = useTransform(dragXSpring, [-200, 0, 200], [0.5, 1, 0.5])
  const dragScale = useTransform(dragXSpring, [-200, 0, 200], [0.95, 1, 0.95])
  const dragRotate = useTransform(dragXSpring, [-200, 0, 200], [2, 0, -2])

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
        handleNext()
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
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    resetAutoplay()
  }

  const handleNext = () => {
    setDirection(1)
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

    // Reset drag animation
    dragX.set(0)
    setIsDragging(false)
  }

  const handleDragMove = (e) => {
    if (!isDragging) return

    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0
    const diffX = currentX - startX

    // Visual feedback during drag
    if (Math.abs(diffX) > 5) {
      dragX.set(diffX * 0.5)
    }
  }

  const testimonial = testimonials[currentIndex]
  const IconComponent = testimonial.icon

  // Variants for animations
  const cardVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? 5 : -5,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { type: "spring", stiffness: 400, damping: 30 },
        rotateY: { type: "spring", stiffness: 300, damping: 30 },
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? -5 : 5,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
        rotateY: { type: "spring", stiffness: 300, damping: 30 },
      },
    }),
  }

  const backgroundVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 0.7, transition: { duration: 0.8 } },
    exit: { opacity: 0, transition: { duration: 0.4 } },
  }

  const quoteVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1, transition: { delay: 0.3, type: "spring", stiffness: 300, damping: 20 } },
    exit: { opacity: 0, scale: 0, transition: { duration: 0.2 } },
  }

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  }

  const avatarVariants = {
    initial: { scale: 0, rotate: -30 },
    animate: { scale: 1, rotate: 0, transition: { delay: 0.1, type: "spring", stiffness: 200, damping: 15 } },
    exit: { scale: 0, rotate: 30, transition: { duration: 0.2 } },
  }

  const iconVariants = {
    initial: { scale: 0 },
    animate: { scale: 1, transition: { delay: 0.4, type: "spring", stiffness: 500, damping: 15 } },
    exit: { scale: 0, transition: { duration: 0.2 } },
  }

  const achievementVariants = {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
    exit: { opacity: 0, scale: 0.8, y: 20, transition: { duration: 0.2 } },
  }

  const navButtonVariants = {
    initial: { opacity: 0.6, scale: 0.9 },
    hover: {
      opacity: 1,
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 0.95 },
  }

  const navDotVariants = {
    inactive: { scale: 1, backgroundColor: "rgba(var(--primary), 0.3)" },
    active: {
      scale: 1.25,
      backgroundColor: "rgb(var(--primary))",
      transition: { type: "spring", stiffness: 500, damping: 15 },
    },
    hover: { scale: 1.1 },
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Progress bar */}
      <motion.div
        className="absolute -top-2 left-0 right-0 h-0.5 bg-primary/10 rounded-full overflow-hidden z-10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div className="h-full bg-primary" style={{ width: springProgress.get() + "%" }} />
      </motion.div>

      {/* Main container */}
      <motion.div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl p-1 cursor-grab active:cursor-grabbing"
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseMove={handleDragMove}
        onMouseLeave={() => {
          if (isDragging) {
            dragX.set(0)
          }
          setIsDragging(false)
        }}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onTouchMove={handleDragMove}
        style={{
          opacity: isDragging ? dragOpacity : 1,
          scale: isDragging ? dragScale : 1,
          rotateZ: isDragging ? dragRotate : 0,
        }}
        whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
        transition={{ duration: 0.2 }}
      >
        {/* Background gradient with animation */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`bg-${currentIndex}`}
            className={`absolute inset-0 bg-gradient-to-b ${testimonial.color} rounded-2xl -z-10 blur-xl`}
            variants={backgroundVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        </AnimatePresence>

        {/* Card content with animation */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={`testimonial-${currentIndex}`}
            className="bg-background/90 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-muted/50 dark:bg-muted/50"
            variants={cardVariants}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ x: isDragging ? dragXSpring : 0 }}
          >
            <div className="relative">
              {/* Animated quotes */}
              <motion.div
                variants={quoteVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute -top-2 -left-2"
              >
                <Quote className="h-8 w-8 text-primary/20 rotate-180" />
              </motion.div>

              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Avatar with animation */}
                <motion.div
                  className="relative"
                  variants={avatarVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <motion.div
                    className={`absolute -bottom-2 -right-2 p-2 rounded-full ${testimonial.iconBg} ${testimonial.iconColor} shadow-lg border border-background`}
                    variants={iconVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <IconComponent className="h-4 w-4" />
                  </motion.div>
                </motion.div>

                {/* Content with animation */}
                <motion.div
                  className="flex-1 space-y-4 text-center md:text-left"
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-2">
                    <div>
                      <h4 className="font-bold text-xl">{testimonial.name}</h4>
                      <p className="text-muted-foreground">{testimonial.title}</p>
                    </div>
                    <StarRating rating={testimonial.rating} />
                  </div>

                  <p className="text-lg md:text-xl text-foreground/90 italic leading-relaxed">"{testimonial.text}"</p>

                  <motion.div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${testimonial.iconBg} ${testimonial.iconColor} text-sm font-medium mt-2`}
                    variants={achievementVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{testimonial.achievement}</span>
                  </motion.div>
                </motion.div>
              </div>

              {/* Bottom quote with animation */}
              <motion.div
                variants={quoteVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute -bottom-2 -right-2"
              >
                <Quote className="h-8 w-8 text-primary/20" />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Navigation dots with animation */}
      <div className="flex justify-center mt-6 space-x-3">
        {testimonials.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1)
              setCurrentIndex(index)
              resetAutoplay()
            }}
            className="w-2 h-2 rounded-full"
            variants={navDotVariants}
            initial="inactive"
            animate={index === currentIndex ? "active" : "inactive"}
            whileHover="hover"
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation arrows with animation */}
      <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-8 mt-4">
        <motion.button
          onClick={handlePrev}
          className="group relative flex items-center justify-center"
          variants={navButtonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          aria-label="Previous testimonial"
        >
          <div className="flex items-center gap-1 text-sm font-medium text-primary transition-transform duration-200">
            <ArrowLeft className="h-5 w-5" />
            <motion.span
              className="overflow-hidden"
              initial={{ width: 0, opacity: 0 }}
              whileHover={{ width: "auto", opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              Prev
            </motion.span>
          </div>
        </motion.button>

        <motion.button
          onClick={handleNext}
          className="group relative flex items-center justify-center"
          variants={navButtonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          aria-label="Next testimonial"
        >
          <div className="flex items-center gap-1 text-sm font-medium text-primary transition-transform duration-200">
            <motion.span
              className="overflow-hidden"
              initial={{ width: 0, opacity: 0 }}
              whileHover={{ width: "auto", opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              Next
            </motion.span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </motion.button>
      </div>
    </div>
  )
}
