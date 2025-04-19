"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Info, Target, Award, UserPlus, MousePointer } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const carouselItems = [
  {
    id: "what",
    title: "What is Grivax?",
    description:
      "Grivax is an AI-powered educational platform that creates personalized learning experiences tailored to your unique needs and learning style.",
    icon: Info,
    color: "from-primary/20 to-primary/5",
    accentColor: "bg-primary",
    textColor: "text-primary",
    visual: (isActive) => (
      <div className="relative h-full w-full flex items-center justify-center">
        <motion.div
          className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/20"
          animate={
            isActive
              ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }
              : { scale: 1, opacity: 0.5 }
          }
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="relative z-10 bg-background rounded-xl p-4 shadow-lg border border-primary/20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={
            isActive
              ? {
                  scale: 1,
                  opacity: 1,
                  y: [0, -10, 0],
                }
              : { scale: 0.9, opacity: 0 }
          }
          transition={{
            duration: 0.5,
            y: {
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            },
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm font-medium">AI-Powered Education</div>
          </div>
        </motion.div>
        <motion.div
          className="absolute bottom-4 right-4 bg-background rounded-xl p-4 shadow-lg border border-primary/20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={
            isActive
              ? {
                  scale: 1,
                  opacity: 1,
                  y: [0, 10, 0],
                }
              : { scale: 0.9, opacity: 0 }
          }
          transition={{
            duration: 0.5,
            delay: 0.2,
            y: {
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: 0.5,
            },
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-600/10">
              <MousePointer className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-sm font-medium">Interactive Learning</div>
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    id: "aim",
    title: "Our Aim",
    description:
      "To revolutionize education by making personalized, adaptive learning accessible to everyone, regardless of their background or learning challenges.",
    icon: Target,
    color: "from-purple-600/20 to-purple-600/5",
    accentColor: "bg-purple-600",
    textColor: "text-purple-600 dark:text-purple-400",
    visual: (isActive) => (
      <div className="relative h-full w-full flex items-center justify-center">
        <motion.div
          className="absolute w-40 h-40 md:w-48 md:h-48 rounded-full bg-purple-600/10 flex items-center justify-center"
          animate={
            isActive
              ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0, -5, 0],
                }
              : { scale: 1, rotate: 0 }
          }
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <motion.div
            className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-purple-600/20 flex items-center justify-center"
            animate={
              isActive
                ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 0, 5, 0],
                  }
                : { scale: 1, rotate: 0 }
            }
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: 0.5,
            }}
          >
            <motion.div
              className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-purple-600/30 flex items-center justify-center"
              animate={
                isActive
                  ? {
                      scale: [1, 1.1, 1],
                    }
                  : { scale: 1 }
              }
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                delay: 1,
              }}
            >
              <motion.div
                className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-purple-600 flex items-center justify-center"
                animate={
                  isActive
                    ? {
                        scale: [1, 1.2, 1],
                      }
                    : { scale: 1 }
                }
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  delay: 1.5,
                }}
              >
                <Target className="h-6 w-6 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    ),
  },
  {
    id: "why",
    title: "Why Choose Grivax?",
    description:
      "Our platform adapts to your learning style, identifies knowledge gaps, and creates custom learning paths that make education more effective and enjoyable.",
    icon: Award,
    color: "from-green-500/20 to-green-500/5",
    accentColor: "bg-green-500",
    textColor: "text-green-500",
    visual: (isActive) => (
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          {[
            { title: "Personalized", icon: "👤", delay: 0 },
            { title: "Adaptive", icon: "🧠", delay: 0.2 },
            { title: "Interactive", icon: "👆", delay: 0.4 },
            { title: "Effective", icon: "🚀", delay: 0.6 },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-background rounded-xl p-3 shadow-lg border border-green-500/20 flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={
                isActive
                  ? {
                      scale: 1,
                      opacity: 1,
                      y: 0,
                    }
                  : { scale: 0.8, opacity: 0, y: 20 }
              }
              transition={{
                duration: 0.5,
                delay: item.delay,
              }}
              whileHover={isActive ? { scale: 1.05, y: -5 } : {}}
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs font-medium">{item.title}</div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "join",
    title: "Join Grivax Today",
    description:
      "Start your personalized learning journey now. Create an account in seconds and experience the future of education.",
    icon: UserPlus,
    color: "from-amber-500/20 to-amber-500/5",
    accentColor: "bg-amber-500",
    textColor: "text-amber-500",
    visual: (isActive) => (
      <div className="relative h-full w-full flex items-center justify-center">
        <motion.div
          className="bg-background rounded-xl p-6 shadow-lg border border-amber-500/20 w-full max-w-xs"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={
            isActive
              ? {
                  scale: 1,
                  opacity: 1,
                }
              : { scale: 0.9, opacity: 0 }
          }
          transition={{
            duration: 0.5,
          }}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-amber-500/10">
                <UserPlus className="h-8 w-8 text-amber-500" />
              </div>
            </div>
            <h3 className="text-center font-bold text-lg">Create Your Account</h3>
            <div className="space-y-2">
              <motion.div
                className="h-8 w-full rounded-md bg-muted/50"
                animate={
                  isActive
                    ? {
                        opacity: [0.5, 0.8, 0.5],
                      }
                    : { opacity: 0.5 }
                }
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                className="h-8 w-full rounded-md bg-muted/50"
                animate={
                  isActive
                    ? {
                        opacity: [0.5, 0.8, 0.5],
                      }
                    : { opacity: 0.5 }
                }
                transition={{
                  duration: 2,
                  delay: 0.3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                className="h-8 w-full rounded-md bg-amber-500"
                whileHover={isActive ? { scale: 1.03 } : {}}
                whileTap={isActive ? { scale: 0.97 } : {}}
              >
                <Link href="/login" className="h-full w-full flex items-center justify-center text-white font-medium">
                  Get Started
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    ),
  },
]

export default function InteractiveCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const autoplayRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)

  const currentItem = carouselItems[currentIndex]
  const IconComponent = currentItem.icon

  // Handle autoplay
  useEffect(() => {
    if (!autoplay || isHovering) return

    autoplayRef.current = setTimeout(() => {
      handleNext()
    }, 6000)

    return () => {
      if (autoplayRef.current) {
        clearTimeout(autoplayRef.current)
      }
    }
  }, [currentIndex, autoplay, isHovering])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselItems.length)
  }

  const handleDotClick = (index) => {
    setCurrentIndex(index)
  }

  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden border border-primary/10 shadow-xl"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background gradient */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          className={`absolute inset-0 bg-gradient-to-br ${currentItem.color}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col">
        {/* Top navigation - Removed arrow buttons from here */}
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${currentItem.accentColor}/10`}>
              <IconComponent className={`h-5 w-5 ${currentItem.textColor}`} />
            </div>
            <span className={`font-medium ${currentItem.textColor}`}>{currentItem.id.toUpperCase()}</span>
          </div>
          {/* Removed arrow buttons from here */}
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-6">
          {/* Text content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${currentIndex}`}
              className="flex flex-col justify-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{currentItem.title}</h2>
              <p className="text-muted-foreground mb-6">{currentItem.description}</p>
              {currentItem.id === "join" && (
                <Button asChild className="w-fit">
                  <Link href="/login">Create Account</Link>
                </Button>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Visual content */}
          <div className="flex items-center justify-center h-[200px] md:h-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`visual-${currentIndex}`}
                className="w-full h-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                {currentItem.visual(true)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom navigation with arrows on either side of dots */}
        <div className="flex justify-center items-center gap-4 p-4 mb-2">
          {/* Left arrow button */}
          <button
            onClick={handlePrev}
            className={`transition-transform hover:scale-110 ${currentItem.textColor}`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2">
            {carouselItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? `${currentItem.accentColor} scale-125`
                    : `${currentItem.accentColor}/30 hover:${currentItem.accentColor}/50`
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Right arrow button */}
          <button
            onClick={handleNext}
            className={`transition-transform hover:scale-110 ${currentItem.textColor}`}
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Interactive hover effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}
