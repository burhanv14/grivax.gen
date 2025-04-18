import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16 flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div
  className="relative"
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
>
  <motion.div
    className="absolute inset-0 rounded-full bg-primary/20"
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.5, 0.2, 0.5],
    }}
    transition={{
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    }}
  />
  <motion.div
    className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"
    animate={{ rotate: 360 }}
    transition={{
      duration: 1.5,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    }}
  />
</motion.div>
<motion.p
  className="text-muted-foreground mt-6"
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3, duration: 0.5 }}
>
</motion.p>
</div>
)}