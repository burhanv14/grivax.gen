import { cn } from "../lib/utils"

interface GrivaxLogoProps {
  className?: string
}

export function GrivaxLogo({ className }: GrivaxLogoProps) {
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

        {/* Clear, recognizable G letter */}
        <path
          d="M24 16H16C14.895 16 14 16.895 14 18V22C14 23.105 14.895 24 16 24H22C23.105 24 24 23.105 24 22V20H20V21C20 21.552 19.552 22 19 22H17C16.448 22 16 21.552 16 21V19C16 18.448 16.448 18 17 18H23C23.552 18 24 18.448 24 19V16Z"
          className="fill-primary"
        />
        <path
          d="M24 19H26V18C26 16.895 25.105 16 24 16V19Z"
          className="fill-primary"
        />

        {/* Decorative elements */}
        <circle cx="12" cy="20" r="2" className="fill-primary-foreground opacity-80" />
        <circle cx="28" cy="20" r="2" className="fill-primary-foreground opacity-80" />

        {/* Animated accent */}
        <path 
          d="M20 4L22.5 8L20 12L17.5 8L20 4Z"
          className="fill-primary-foreground animate-pulse"
          style={{ animationDuration: '2s' }}
        />
      </svg>
    </div>
  )
}