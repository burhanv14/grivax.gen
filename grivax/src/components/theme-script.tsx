"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

export function ThemeScript() {
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    // Check if there's a theme in localStorage
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme) {
      setTheme(storedTheme)
    } else {
      // Default to light theme
      setTheme("light")
    }
  }, [setTheme])

  return null
}

