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
        <path d="M20 8L30.6603 14V26L20 32L9.33975 26V14L20 8Z" className="fill-primary-foreground" />

        {/* G letter */}
        <path
          d="M16.5 16C15.1193 16 14 17.1193 14 18.5V21.5C14 22.8807 15.1193 24 16.5 24H23.5C24.8807 24 26 22.8807 26 21.5V20H22V21.5C22 21.7761 21.7761 22 21.5 22H18.5C18.2239 22 18 21.7761 18 21.5V18.5C18 18.2239 18.2239 18 18.5 18H23.5C23.7761 18 24 18.2239 24 18.5V19H26V18.5C26 17.1193 24.8807 16 23.5 16H16.5Z"
          className="fill-primary"
        />

        {/* Decorative elements */}
        <circle cx="10" cy="20" r="2" className="fill-primary-foreground" />
        <circle cx="30" cy="20" r="2" className="fill-primary-foreground" />

        {/* Dynamic element */}
        <path d="M20 4L22 7L20 10L18 7L20 4Z" className="fill-primary-foreground animate-pulse" />
      </svg>
    </div>
  )
}
