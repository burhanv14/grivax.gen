interface PlaceholderImageProps {
  width: number
  height: number
  alt: string
  className?: string
}

export default function PlaceholderImage({ width, height, alt, className }: PlaceholderImageProps) {
  // Generate a placeholder with the requested dimensions
  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br from-muted to-muted/70 overflow-hidden ${className || ""}`}
      style={{ width, height }}
    >
      <svg
        width={Math.min(width * 0.5, 100)}
        height={Math.min(height * 0.5, 100)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground/60"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span className="sr-only">{alt}</span>
    </div>
  )
}

