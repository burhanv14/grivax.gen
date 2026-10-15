"use client"
import dynamic from "next/dynamic"

const HeroSection = dynamic(() => import("../components/home/HeroSection"))
const FeaturesSection = dynamic(() => import("../components/home/FeaturesSection"))
const TestimonialsSection = dynamic(() => import("../components/home/TestimonialsSection"))
const CTASection = dynamic(() => import("../components/home/CTASection"))

export default function Home() {
	return (
		<div className="flex flex-col relative">
			<HeroSection />
			<FeaturesSection />
			<TestimonialsSection />
			<CTASection />
		</div>
	)
}