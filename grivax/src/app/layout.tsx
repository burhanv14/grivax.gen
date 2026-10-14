import type React from "react";
import { Inter, Poppins } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import { ThemeScript } from "../components/theme-script";
import Header from "../components/header";
import Footer from "../components/footer";
import "./globals.css";
import NextAuthProvider from "@/components/NextAuthProvider";
import { Toaster } from "sonner";
import ChatbotButton from "@/components/chatbot/ChatbotButton";
import HeaderLoader from "@/components/header-loader";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Grivax | Smart Learning",
  description:
    "Learn smarter, and better with AI-powered courses and assessments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans`}
      >
        <NextAuthProvider>
          <ThemeProvider>
            <ThemeScript />
            <HeaderLoader />
            <Header />
            <main>{children}</main>
            <Footer />
            <ChatbotButton />
          </ThemeProvider>
        </NextAuthProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
