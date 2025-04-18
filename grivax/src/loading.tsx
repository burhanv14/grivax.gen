"use client"

import { useState, useEffect, useRef } from "react"
import { BookOpen, Sparkles, Brain, GraduationCap, School } from "lucide-react"
import { useTheme } from "next-themes"

export default function Loading() {
  const [progress, setProgress] = useState(0)
  const [factIndex, setFactIndex] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cursorPoints, setCursorPoints] = useState<Array<{ x: number; y: number; age: number }>>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { setTheme } = useTheme()

  const educationalFacts = [
    "Expanding your knowledge creates new neural pathways in your brain.",
    "The most effective learning happens when connecting new ideas to existing knowledge.",
    "Spaced repetition can improve long-term retention by up to 200%.",
    "Visual learning can improve comprehension by up to 400%.",
    "The human brain processes visual information 60,000 times faster than text.",
    "Learning a new skill changes your brain's physical structure.",
    "Curiosity triggers chemical changes in the brain that enhance learning.",
    "Teaching others what you've learned improves your own understanding by 90%.",
  ]

  // Set dark theme on load
  useEffect(() => {
    setTheme("dark")
  }, [setTheme])

  useEffect(() => {
    // Simulate loading progress
    const timer = setTimeout(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          return 100
        }
        return prevProgress + Math.random() * 3 + 1
      })
    }, 200)

    return () => clearTimeout(timer)
  }, [progress])

  useEffect(() => {
    // Change fact every few seconds
    const factTimer = setInterval(() => {
      setFactIndex((prevIndex) => (prevIndex + 1) % educationalFacts.length)
    }, 4000)

    return () => clearInterval(factTimer)
  }, [])

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setMousePosition({ x, y })

      // Add point to trail with age 0
      setCursorPoints((prev) => [...prev, { x, y, age: 0 }].slice(-50))

      // Logo movement effect
      if (logoRef.current) {
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const moveX = (e.clientX - rect.left - centerX) / 30
        const moveY = (e.clientY - rect.top - centerY) / 30
        logoRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${-moveY}deg) rotateY(${moveX}deg)`
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Age cursor points and remove old ones
  useEffect(() => {
    const ageInterval = setInterval(() => {
      setCursorPoints((prev) =>
        prev.map((point) => ({ ...point, age: point.age + 1 })).filter((point) => point.age < 50),
      )
    }, 50)

    return () => clearInterval(ageInterval)
  }, [])

  // Neural network canvas effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const updateCanvasSize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.offsetWidth
        canvas.height = containerRef.current.offsetHeight
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    // Animation loop
    let animationFrame: number

    const animate = () => {
      if (!ctx || !canvas) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw neural network nodes
      const nodes: Array<{ x: number; y: number }> = []

      // Fixed nodes in a grid pattern
      const gridSize = 150
      for (let x = gridSize; x < canvas.width; x += gridSize) {
        for (let y = gridSize; y < canvas.height; y += gridSize) {
          // Add some randomness to positions
          const offsetX = Math.sin(Date.now() * 0.001 + x * 0.1) * 10
          const offsetY = Math.cos(Date.now() * 0.001 + y * 0.1) * 10
          nodes.push({ x: x + offsetX, y: y + offsetY })
        }
      }

      // Add cursor position as a special node
      if (mousePosition.x && mousePosition.y) {
        nodes.push(mousePosition)
      }

      // Add cursor trail points as nodes
      cursorPoints.forEach((point) => {
        if (point.age < 20) {
          nodes.push(point)
        }
      })

      // Draw connections between nodes
      ctx.lineWidth = 0.5
      ctx.strokeStyle = "rgba(139, 92, 246, 0.2)" // Using primary color from your CSS

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Only connect nearby nodes
          if (distance < 200) {
            // Fade based on distance
            const opacity = 0.2 * (1 - distance / 200)

            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)

            // Special effect for cursor connections
            if (
              i === nodes.length - 1 ||
              j === nodes.length - 1 ||
              nodes[i] === mousePosition ||
              nodes[j] === mousePosition ||
              cursorPoints.includes(nodes[i] as any) ||
              cursorPoints.includes(nodes[j] as any)
            ) {
              ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 2})`
              ctx.lineWidth = 1
            } else {
              ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`
              ctx.lineWidth = 0.5
            }

            ctx.stroke()
          }
        }
      }

      // Draw nodes
      nodes.forEach((node, index) => {
        ctx.beginPath()

        // Special styling for cursor and its trail
        if (node === mousePosition) {
          ctx.fillStyle = "rgba(139, 92, 246, 0.8)"
          ctx.arc(node.x, node.y, 4, 0, Math.PI * 2)
        } else if (cursorPoints.some((p) => p.x === node.x && p.y === node.y)) {
          const point = cursorPoints.find((p) => p.x === node.x && p.y === node.y)
          const opacity = point ? (1 - point.age / 50) * 0.8 : 0.3
          const size = point ? 4 * (1 - point.age / 50) : 2
          ctx.fillStyle = `rgba(139, 92, 246, ${opacity})`
          ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
        } else {
          // Pulse effect for grid nodes
          const pulse = Math.sin(Date.now() * 0.003 + index * 0.1) * 0.5 + 0.5
          ctx.fillStyle = `rgba(139, 92, 246, ${0.1 + pulse * 0.2})`
          ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
        }

        ctx.fill()
      })

      // Draw cursor glow
      if (mousePosition.x && mousePosition.y) {
        const gradient = ctx.createRadialGradient(
          mousePosition.x,
          mousePosition.y,
          5,
          mousePosition.x,
          mousePosition.y,
          60,
        )
        gradient.addColorStop(0, "rgba(139, 92, 246, 0.3)")
        gradient.addColorStop(1, "rgba(139, 92, 246, 0)")

        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(mousePosition.x, mousePosition.y, 60, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [mousePosition, cursorPoints])

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative bg-gradient-to-b from-gray-950 to-gray-900"
    >
      {/* Neural network canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }} />

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/10"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}

        {/* Connection lines */}
        {/* <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--primary-rgb))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(var(--primary-rgb))" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <path
            d="M0,50 Q250,0 500,50 T1000,50"
            stroke="url(#gradient)"
            strokeWidth="1"
            fill="none"
            style={{
              animation: "pathAnimate 15s linear infinite",
            }}
          />
          <path
            d="M0,150 Q250,100 500,150 T1000,150"
            stroke="url(#gradient)"
            strokeWidth="1"
            fill="none"
            style={{
              animation: "pathAnimate 20s linear infinite",
              animationDelay: "2s",
            }}
          />
          <path
            d="M0,250 Q250,200 500,250 T1000,250"
            stroke="url(#gradient)"
            strokeWidth="1"
            fill="none"
            style={{
              animation: "pathAnimate 18s linear infinite",
              animationDelay: "1s",
            }}
          />
        </svg> */}
      </div>

      <div className="max-w-md w-full space-y-12 text-center z-10">
        {/* 3D Logo */}
        <div ref={logoRef} className="perspective-1000 preserve-3d mx-auto transition-transform duration-300 ease-out">
          <div className="text-5xl font-bold tracking-tight font-poppins bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary pb-2">
            Grivax
          </div>
          <div className="flex justify-center mt-2">
            <Sparkles className="text-primary h-6 w-6 animate-pulse" />
          </div>
        </div>

        {/* Tagline */}
        <div className="text-lg text-muted-foreground font-poppins">Transforming education through innovation</div>

        {/* Educational facts with elegant transition */}
        <div className="h-24 flex items-center justify-center perspective-1000">
          <div className="preserve-3d relative w-full h-full">
            {educationalFacts.map((fact, idx) => (
              <p
                key={idx}
                className="absolute inset-0 flex items-center justify-center text-muted-foreground px-6"
                style={{
                  opacity: factIndex === idx ? 1 : 0,
                  transform: factIndex === idx ? "translateZ(0) rotateX(0)" : "translateZ(-40px) rotateX(90deg)",
                  transition: "opacity 0.8s ease, transform 0.8s ease",
                }}
              >
                {fact}
              </p>
            ))}
          </div>
        </div>

        {/* Interactive progress indicator */}
        <div className="space-y-4">
          <div className="relative h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
              style={{
                width: `${progress}%`,
                transition: "width 0.3s ease-out",
                boxShadow: "0 0 12px rgba(var(--primary-rgb), 0.7)",
              }}
            />
          </div>

          {/* Knowledge icons that appear as progress increases */}
          <div className="flex justify-between items-center mt-8 px-2">
            {[20, 40, 60, 80, 100].map((threshold, i) => {
              const icons = [
                <BookOpen key="book" />,
                <Brain key="brain" />,
                <GraduationCap key="graduation" />,
                <School key="school" />,
                <Sparkles key="sparkles" />,
              ]

              return (
                <div key={i} className="relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      progress >= threshold
                        ? "text-primary-foreground bg-primary scale-100"
                        : "text-gray-600 bg-gray-800 scale-75 opacity-50"
                    }`}
                  >
                    {icons[i]}
                  </div>
                  {progress >= threshold && (
                    <div
                      className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                      style={{
                        animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Custom cursor */}
      <div
        className="fixed w-8 h-8 pointer-events-none z-50 mix-blend-screen"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: "translate(-50%, -50%)",
          display: mousePosition.x ? "block" : "none",
        }}
      >
        <div className="w-full h-full rounded-full border border-primary opacity-70 animate-ping-slow" />
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(20px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes ping-slow {
          0% {
            transform: scale(0.2);
            opacity: 0.7;
          }
          70% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
