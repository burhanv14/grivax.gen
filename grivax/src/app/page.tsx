"use client"

import { ArrowRight, BookOpen, Brain, Lightbulb, Sparkles, Star, Award, Heart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState, useRef, RefObject } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"

const HeroSection = dynamic(() => import("../components/home/HeroSection"), { ssr: false })
const FeaturesSection = dynamic(() => import("../components/home/FeaturesSection"), { ssr: false })
const TestimonialsSection = dynamic(() => import("../components/home/TestimonialsSection"), { ssr: false })
const CTASection = dynamic(() => import("../components/home/CTASection"), { ssr: false })

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
]

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
			<HeroSection />
			{/* Features Section */}
			<FeaturesSection />
			{/* Testimonials Section */}
			<TestimonialsSection />
			{/* CTA Section */}
			<CTASection />
		</div>
	)
}