"use client"

import { ArrowRight, BookOpen, Brain, Lightbulb, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "../components/ui/button"
import TestimonialSlider from "../components/testimonial-slider1"
import InteractiveCarousel from "../components/interactive-carousel"
import { useEffect, useState, useRef, RefObject } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const testimonialsRef = useRef<HTMLElement>(null)

  // Handle theme mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleExploreClick = async () => {
    if (status === "loading") return // Prevent action while session is loading

    if (session?.user?.id) {
      // Route to user-specific courses page
      router.push(`/courses/${session.user.id}`)
    } else {
      // Redirect to login if not authenticated
      router.push("/login?callbackUrl=" + encodeURIComponent("/courses"))
    }
  }

  const scrollToSection = (ref: RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Particle animation component
  const Particles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/20 dark:bg-primary/30 animate-particle-float"
            style={{
              width: `${Math.random() * 8 + 3}px`,
              height: `${Math.random() * 8 + 3}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col relative">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 pt-16 md:pt-24 lg:pt-16 md:pb-14 min-h-[90vh] flex items-center"
      >
        <Particles />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col justify-center space-y-6"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
                >
                  Revolutionizing Education
                </motion.div>
                <motion.h1
                  className="font-poppins text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  Learn Smarter with{" "}
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
                    Dynamic Education
                  </span>
                </motion.h1>
                <motion.p
                  className="max-w-[600px] text-muted-foreground md:text-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                >
                  Grivax generates personalized courses and quizzes to help you master any subject with adaptive
                  learning technology.
                </motion.p>
              </div>
              <motion.div
                className="flex flex-col gap-3 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.8 }}
              >
                <Button size="lg" onClick={handleExploreClick} className="group relative overflow-hidden">
                  <span className="relative z-10">Explore Courses</span>
                  <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  <ArrowRight className="ml-2 h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                <Button size="lg" variant="outline" asChild className="group relative overflow-hidden">
                  <Link href="/quizzes">
                    <span className="relative z-10">Try a Quiz</span>
                    <span className="absolute inset-0 bg-primary/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Interactive Carousel - Replacing the static image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="relative mt-8 flex items-center justify-center lg:mt-0 perspective-1000"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-purple-600/20 blur-3xl animate-pulse" />
              <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] md:h-[450px] md:w-[450px] lg:h-[500px] lg:w-[500px]">
                <InteractiveCarousel />
              </div>
              <motion.div
                className="absolute -right-4 -top-4 z-20 rounded-lg bg-background p-3 shadow-lg md:-right-8 md:-top-8"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.8 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="flex items-center gap-2 rounded-md bg-primary/10 p-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">AI-Powered Learning</span>
                </div>
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -left-4 z-20 rounded-lg bg-background p-3 shadow-lg md:-bottom-8 md:-left-8"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                whileHover={{ scale: 1.1, rotate: -5 }}
              >
                <div className="flex items-center gap-2 rounded-md bg-purple-600/10 p-2 text-purple-600 dark:text-purple-400">
                  <Brain className="h-5 w-5" />
                  <span className="text-sm font-medium">Adaptive Quizzes</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_30%,rgba(var(--primary-rgb),0.1),transparent_40%)]" />
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-70 dark:opacity-30" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Why Choose Grivax?
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
              Our platform combines cutting-edge technology with proven educational methods to deliver a superior
              learning experience.
            </p>
          </motion.div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <motion.div
              className="group rounded-xl border bg-background/80 backdrop-blur-sm p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 dark:border-muted dark:bg-muted/50"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-poppins text-xl font-semibold">Dynamic Courses</h3>
              <p className="text-muted-foreground">
                Courses that adapt to your learning style and pace, ensuring you master every concept effectively.
              </p>
            </motion.div>
            {/* Feature 2 */}
            <motion.div
              className="group rounded-xl border bg-background/80 backdrop-blur-sm p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 dark:border-muted dark:bg-muted/50"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-poppins text-xl font-semibold">Intelligent Quizzes</h3>
              <p className="text-muted-foreground">
                AI-generated quizzes that identify your knowledge gaps and help you focus on areas that need
                improvement.
              </p>
            </motion.div>
            {/* Feature 3 */}
            <motion.div
              className="group rounded-xl border bg-background/80 backdrop-blur-sm p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 dark:border-muted dark:bg-muted/50"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-poppins text-xl font-semibold">Personalized Learning</h3>
              <p className="text-muted-foreground">
                Custom learning paths designed specifically for your goals, schedule, and preferred learning methods.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl">What Our Students Say</h2>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
              Hear from students who have transformed their learning experience with Grivax.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <TestimonialSlider />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-600/10" />
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            duration: 20,
            ease: "linear",
          }}
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, rgba(var(--primary-rgb), 0.15), transparent 20%), radial-gradient(circle at 70% 70%, rgba(var(--primary-rgb), 0.1), transparent 20%)",
            backgroundSize: "60vw 60vw",
          }}
        />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            className="flex flex-col items-center justify-between gap-8 rounded-2xl bg-background/80 backdrop-blur-md p-8 shadow-lg dark:bg-muted/50 md:flex-row md:p-12 border border-primary/10"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            whileHover={{ boxShadow: "0 20px 40px rgba(var(--primary-rgb), 0.2)" }}
          >
            <div className="max-w-md">
              <h2 className="font-poppins text-3xl font-bold tracking-tight">Ready to Transform Your Learning?</h2>
              <p className="mt-4 text-muted-foreground">
                Join thousands of students who are already experiencing the future of education with Grivax.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="group relative overflow-hidden">
                <Link href="/login">
                  <span className="relative z-10">Get Started</span>
                  <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  <ArrowRight className="ml-2 h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="group relative overflow-hidden">
                <Link href="/about">
                  <span className="relative z-10">Learn More</span>
                  <span className="absolute inset-0 bg-primary/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}