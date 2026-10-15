import { motion } from "framer-motion";
import { BookOpen, Brain, Lightbulb } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 relative">
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
  );
};

export default FeaturesSection;