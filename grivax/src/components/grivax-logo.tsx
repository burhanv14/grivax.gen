import { cn } from "../lib/utils"

interface GrivaxLogoProps {
  className?: string
}

export default function GrivaxLogo({ className }: GrivaxLogoProps) {
  return (
    <div className={cn("relative", className)}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Base hexagon shape */}
        <path d="M20 0L37.3205 10V30L20 40L2.67949 30V10L20 0Z" className="fill-primary" />

        {/* Inner hexagon cutout */}
        <path
          d="M20 8L30.6603 14V26L20 32L9.33975 26V14L20 8Z"
          className="fill-primary-foreground"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.1"
        />

        {/* Simple, readable G letter */}
        <path
          d="M16 16C14.9 16 14 16.9 14 18V22C14 23.1 14.9 24 16 24H24C25.1 24 26 23.1 26 22V20H22V22H18V18H24V16H16Z"
          className="fill-primary"
        />

        {/* Decorative elements */}
        <circle cx="12" cy="20" r="2" className="fill-primary-foreground opacity-80" />
        <circle cx="28" cy="20" r="2" className="fill-primary-foreground opacity-80" />

        {/* Animated accent */}
        <path
          d="M20 4L22.5 8L20 12L17.5 8L20 4Z"
          className="fill-primary-foreground animate-pulse"
          style={{ animationDuration: "2s" }}
        />
      </svg>
    </div>
  )
}
