import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import InteractiveCarousel from "@/components/interactive-carousel";
import { Sparkles, Brain } from "lucide-react";

const HeroSection = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleExploreClick = async () => {
    if (status === "loading") return;

    if (session?.user?.id) {
      router.push(`/courses/${session.user.id}`);
    } else {
      router.push("/login?callbackUrl=" + encodeURIComponent("/courses"));
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 pt-16 md:pt-24 lg:pt-16 md:pb-14 min-h-[90vh] flex items-center">
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
                Learn Smarter with
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
                Grivax generates personalized courses and quizzes to help you master any subject with adaptive learning technology.
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
                <a href="/quizzes">
                  <span className="relative z-10">Try a Quiz</span>
                  <span className="absolute inset-0 bg-primary/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                </a>
              </Button>
            </motion.div>
          </motion.div>

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
    </section>
  );
};

export default HeroSection;