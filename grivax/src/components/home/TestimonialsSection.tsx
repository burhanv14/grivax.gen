import { motion } from "framer-motion";
import { TestimonialSlider1 } from "@/components/testimonial-slider1";
import { Star, Award, Heart } from "lucide-react";

const testimonials = [
	{
		id: 1,
		name: "John Doe",
		title: "Software Engineer",
		text: "This platform has transformed my learning experience. The personalized courses are exactly what I needed.",
		image: "/placeholder.svg",
		color: "from-primary/20 to-primary/5",
		rating: 5,
		icon: Star,
		iconBg: "bg-amber-500/10",
		iconColor: "text-amber-500",
		achievement: "Completed 10 courses",
	},
	{
		id: 2,
		name: "Jane Smith",
		title: "Data Scientist",
		text: "The interactive learning modules are engaging and effective. I've learned more in a month than I did in a year of traditional courses.",
		image: "/placeholder.svg",
		color: "from-purple-600/20 to-purple-600/5",
		rating: 4.5,
		icon: Award,
		iconBg: "bg-purple-600/10",
		iconColor: "text-purple-600 dark:text-purple-400",
		achievement: "Improved skills by 40%",
	},
	{
		id: 3,
		name: "Mike Johnson",
		title: "Web Developer",
		text: "The platform's adaptive learning technology is revolutionary. It understands my learning style and adjusts accordingly.",
		image: "/placeholder.svg",
		color: "from-green-500/20 to-green-500/5",
		rating: 5,
		icon: Heart,
		iconBg: "bg-green-500/10",
		iconColor: "text-green-500",
		achievement: "Mastered 5 new technologies",
	},
];

const TestimonialsSection = () => {
	return (
		<section className="py-16 md:py-24 relative">
			<div className="absolute inset-0 bg-grid-pattern opacity-10" />
			<div className="container mx-auto px-4 md:px-6 relative z-10">
				<motion.div
					className="mb-12 text-center"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.8 }}
				>
					<h2 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl">
						What Our Students Say
					</h2>
					<p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
						Hear from students who have transformed their learning experience with
						Grivax.
					</p>
				</motion.div>
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 1 }}
				>
					<TestimonialSlider1 testimonials={testimonials} />
				</motion.div>
			</div>
		</section>
	);
};

export default TestimonialsSection;