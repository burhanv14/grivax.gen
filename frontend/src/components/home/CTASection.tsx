import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CTASection = () => {
  return (
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
  );
};

export default CTASection;