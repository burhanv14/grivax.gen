import { ArrowRight, BookOpen, Brain, Lightbulb, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "../components/ui/button"
import FeaturedCourses from "../components/featured-courses"
import TestimonialSlider from "../components/testimonial-slider"
import PlaceholderImage from "../components/placeholder-image"
import ScrollToTop from "../components/scroll-to-top"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 pt-16 md:pt-24 lg:pt-32 md:pb-14">
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="font-poppins text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Learn Smarter with{" "}
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Dynamic Education
                  </span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Grivax.gen generates personalized courses and quizzes to help you master any subject with adaptive
                  learning technology.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/courses">
                    Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/quizzes">Try a Quiz</Link>
                </Button>
              </div>
            </div>
            <div className="relative mt-8 flex items-center justify-center lg:mt-0">
              <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] md:h-[450px] md:w-[450px] lg:h-[500px] lg:w-[500px]">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-purple-600/20 blur-3xl" />
                <PlaceholderImage
                  width={500}
                  height={500}
                  alt="Grivax.gen Learning Platform"
                  className="relative z-10 rounded-2xl object-cover shadow-xl"
                />
              </div>
              <div className="absolute -right-4 -top-4 z-20 rounded-lg bg-background p-3 shadow-lg transition-all duration-300 hover:scale-105 dark:bg-muted md:-right-8 md:-top-8">
                <div className="flex items-center gap-2 rounded-md bg-primary/10 p-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">AI-Powered Learning</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 z-20 rounded-lg bg-background p-3 shadow-lg transition-all duration-300 hover:scale-105 dark:bg-muted md:-bottom-8 md:-left-8">
                <div className="flex items-center gap-2 rounded-md bg-purple-600/10 p-2 text-purple-600 dark:text-purple-400">
                  <Brain className="h-5 w-5" />
                  <span className="text-sm font-medium">Adaptive Quizzes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_30%,rgba(var(--primary-rgb),0.1),transparent_40%)]" />
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Why Choose Grivax.gen?
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
              Our platform combines cutting-edge technology with proven educational methods to deliver a superior
              learning experience.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-xl border bg-background p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-muted dark:bg-muted/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-poppins text-xl font-semibold">Dynamic Courses</h3>
              <p className="text-muted-foreground">
                Courses that adapt to your learning style and pace, ensuring you master every concept effectively.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="group rounded-xl border bg-background p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-muted dark:bg-muted/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-poppins text-xl font-semibold">Intelligent Quizzes</h3>
              <p className="text-muted-foreground">
                AI-generated quizzes that identify your knowledge gaps and help you focus on areas that need
                improvement.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="group rounded-xl border bg-background p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-muted dark:bg-muted/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-poppins text-xl font-semibold">Personalized Learning</h3>
              <p className="text-muted-foreground">
                Custom learning paths designed specifically for your goals, schedule, and preferred learning methods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl">Featured Courses</h2>
              <p className="mt-2 text-muted-foreground">Explore our most popular courses designed to help you excel.</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/courses">
                View All Courses <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <FeaturedCourses />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl">What Our Students Say</h2>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
              Hear from students who have transformed their learning experience with Grivax.gen.
            </p>
          </div>
          <TestimonialSlider />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/10 to-purple-600/10 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-8 rounded-2xl bg-background p-8 shadow-lg dark:bg-muted/50 md:flex-row md:p-12">
            <div className="max-w-md">
              <h2 className="font-poppins text-3xl font-bold tracking-tight">Ready to Transform Your Learning?</h2>
              <p className="mt-4 text-muted-foreground">
                Join thousands of students who are already experiencing the future of education with Grivax.gen.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}

