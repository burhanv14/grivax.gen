"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProvider as ThemeProviderType } from "next-themes"

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof ThemeProviderType>) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={true} {...props}>
      {children}
    </NextThemesProvider>
  )
}

