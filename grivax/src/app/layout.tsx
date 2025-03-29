import type React from "react"
import { Inter, Poppins } from "next/font/google"
import { ThemeProvider } from "../components/theme-provider"
import { ThemeScript } from "../components/theme-script"
import Header from "../components/header"
import Footer from "../components/footer"
import "../styles/globals.css"
import NextAuthProvider from "@/components/NextAuthProvider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata = {
  title: "Grivax.gen | Dynamic Education Platform",
  description: "Generate automated, dynamic courses and quizzes for comprehensive exam preparation",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <NextAuthProvider>
          <ThemeProvider>
            <ThemeScript />

            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}

