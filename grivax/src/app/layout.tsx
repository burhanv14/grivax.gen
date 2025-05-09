import type React from "react"
import { Inter, Poppins } from "next/font/google"
import { ThemeProvider } from "../components/theme-provider"
import { ThemeScript } from "../components/theme-script"
import Header from "../components/header"
import Footer from "../components/footer"
import "../styles/globals.css"
import NextAuthProvider from "@/components/NextAuthProvider"
import { Toaster } from 'sonner'
import ChatbotButton from "@/components/chatbot/ChatbotButton"
import NextTopLoader from 'nextjs-toploader'

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
  title: "Grivax | Dynamic Education Platform",
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
            <NextTopLoader 
              color="#7c3aed"
              initialPosition={0.08}
              crawlSpeed={200}
              height={2}
              crawl={true}
              easing="ease"
              speed={200}
              zIndex={1600}
              shadow="0 0 20px #7c3aed,0 0 40px #3b82f6"
              template='<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
              showAtBottom={false}
            />

            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <ChatbotButton />
            </div>
          </ThemeProvider>
        </NextAuthProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
