import { Button } from "@/components/ui/button"
import { ArrowRight, Flame } from "lucide-react"

export default function HeroSection() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-4">
      <div className="space-y-4 max-w-4xl mx-auto pt-16">
        {/* Announcement Banners */}
        <div className="flex flex-col gap-2 mb-12">
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-gray-900/50 text-white px-4 py-2 rounded-full mx-auto hover:bg-gray-900/70 transition-colors"
          >
            <span className="font-medium">₿ Build on Bitcoin - Stacks Developer Degree out now!</span>
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-gray-900/50 text-white px-4 py-2 rounded-full mx-auto hover:bg-gray-900/70 transition-colors"
          >
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-medium">Announcing: Uniswap Hook Incubator - do you have what it takes?</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Hero Content */}
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-500 font-medium text-lg">
          Lead the charge to new frontiers
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white mt-4">Become a next gen developer</h1>
        <p className="text-xl text-gray-400 mt-6 max-w-2xl mx-auto">
          Access free, full stack, high quality education to become a Web3 expert!
        </p>
        <Button size="lg" className="mt-8 bg-red-600 hover:bg-red-700 text-lg px-8">
          Start Learning
        </Button>
      </div>
    </div>
  )
}

