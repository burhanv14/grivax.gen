"use client"

import type React from "react"

import { useTheme } from "next-themes"
import Link from "next/link"
import { Facebook, Github, Instagram, Linkedin, Twitter } from "lucide-react"
import { useEffect, useState } from "react"

export default function Footer() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only show the footer after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <footer
      className={`relative border-t overflow-hidden ${
        isDark ? "bg-black border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
      }`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Base background */}
        <div className={`absolute inset-0 ${isDark ? "bg-black" : "bg-white"}`}></div>

        {/* Stars - using direct background instead of pseudo-elements */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: isDark
              ? `
                radial-gradient(white, rgba(255, 255, 255, 0.2) 2px, transparent 3px),
                radial-gradient(white, rgba(255, 255, 255, 0.15) 1px, transparent 2px),
                radial-gradient(white, rgba(255, 255, 255, 0.1) 2px, transparent 3px)
              `
              : `
                radial-gradient(#1f2937, rgba(31, 41, 55, 0.2) 2px, transparent 3px),
                radial-gradient(#1f2937, rgba(31, 41, 55, 0.15) 1px, transparent 2px),
                radial-gradient(#1f2937, rgba(31, 41, 55, 0.1) 2px, transparent 3px)
              `,
            backgroundSize: "550px 550px, 350px 350px, 250px 250px",
            backgroundPosition: "0 0, 40px 60px, 130px 270px",
            opacity: isDark ? 0.7 : 0.3,
          }}
        ></div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: isDark
              ? `
                linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
              `
              : `
                linear-gradient(to right, rgba(31, 41, 55, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(31, 41, 55, 0.05) 1px, transparent 1px)
              `,
            backgroundSize: "20px 20px",
            opacity: isDark ? 0.5 : 0.7,
          }}
        ></div>

        {/* Shooting stars - using direct elements with inline styles */}
        {isDark && (
          <>
            {/* First shooting star */}
            <div
              className="absolute z-10"
              style={{
                top: "10%",
                right: "10%",
                width: "100px",
                height: "1px",
                background: "linear-gradient(to right, transparent, white, transparent)",
                animation: "shootingStar1 8s linear infinite",
                animationDelay: "0s",
              }}
            />

            {/* Second shooting star */}
            <div
              className="absolute z-10"
              style={{
                top: "30%",
                right: "20%",
                width: "100px",
                height: "1px",
                background: "linear-gradient(to right, transparent, white, transparent)",
                animation: "shootingStar2 12s linear infinite",
                animationDelay: "4s",
              }}
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="container relative mx-auto px-4 py-12 md:py-16 md:px-6 z-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="mb-6 flex items-center gap-2 group">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 ${
                  isDark ? "bg-zinc-900 border border-zinc-700" : "bg-indigo-100 border border-indigo-200"
                }`}
              >
                <span className={`font-poppins text-lg font-bold ${isDark ? "text-white" : "text-indigo-700"}`}>G</span>
              </div>
              <span className={`font-poppins text-xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                Grivax
              </span>
            </Link>
            <p className={`mb-6 max-w-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Grivax is a dynamic education platform that generates personalized courses and quizzes to help you
              master any subject.
            </p>
            <div className="flex space-x-5">
              <SocialIcon icon={<Twitter className="h-5 w-5" />} label="Twitter" isDark={isDark} />
              <SocialIcon icon={<Facebook className="h-5 w-5" />} label="Facebook" isDark={isDark} />
              <SocialIcon icon={<Instagram className="h-5 w-5" />} label="Instagram" isDark={isDark} />
              <SocialIcon icon={<Github className="h-5 w-5" />} label="GitHub" isDark={isDark} />
              <SocialIcon icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" isDark={isDark} />
            </div>
          </div>

          <FooterColumn title="Platform" isDark={isDark}>
            <FooterLink href="/courses" label="Courses" isDark={isDark} />
            <FooterLink href="/quizzes" label="Quizzes" isDark={isDark} />
            <FooterLink href="/dashboard" label="Dashboard" isDark={isDark} />
            <FooterLink href="#" label="Pricing" isDark={isDark} />
          </FooterColumn>

          <FooterColumn title="Company" isDark={isDark}>
            <FooterLink href="#" label="About" isDark={isDark} />
            <FooterLink href="#" label="Careers" isDark={isDark} />
            <FooterLink href="#" label="Blog" isDark={isDark} />
            <FooterLink href="#" label="Contact" isDark={isDark} />
          </FooterColumn>

          <FooterColumn title="Legal" isDark={isDark}>
            <FooterLink href="#" label="Terms" isDark={isDark} />
            <FooterLink href="#" label="Privacy" isDark={isDark} />
            <FooterLink href="#" label="Cookies" isDark={isDark} />
            <FooterLink href="#" label="Licenses" isDark={isDark} />
          </FooterColumn>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 relative">
          <div className={`absolute left-0 right-0 h-px ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}></div>
          <p className={`text-center text-sm mt-8 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            &copy; {new Date().getFullYear()} Grivax. All rights reserved.
          </p>
        </div>
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes shootingStar1 {
          0% {
            transform: translateX(0) translateY(0) rotate(45deg);
            opacity: 0;
          }
          5% {
            opacity: 0.7;
          }
          15% {
            transform: translateX(-200px) translateY(200px) rotate(45deg);
            opacity: 0;
          }
          100% {
            transform: translateX(-200px) translateY(200px) rotate(45deg);
            opacity: 0;
          }
        }
        
        @keyframes shootingStar2 {
          0% {
            transform: translateX(0) translateY(0) rotate(45deg);
            opacity: 0;
          }
          5% {
            opacity: 0.7;
          }
          15% {
            transform: translateX(-200px) translateY(200px) rotate(45deg);
            opacity: 0;
          }
          100% {
            transform: translateX(-200px) translateY(200px) rotate(45deg);
            opacity: 0;
          }
        }
        
        .footer-link {
          position: relative;
          display: inline-block;
          transition: color 0.2s ease;
        }
        
        .footer-link:after {
          content: "";
          position: absolute;
          width: 0;
          height: 1px;
          bottom: -2px;
          left: 0;
          transition: width 0.3s ease;
        }
        
        .footer-link:hover:after {
          width: 100%;
        }
        
        .social-icon {
          transition: all 0.3s ease;
        }
        
        .social-icon:hover {
          transform: scale(1.1);
        }
      `}</style>
    </footer>
  )
}

// Component for social icons
function SocialIcon({ icon, label, isDark }) {
  return (
    <Link
      href="#"
      className={`social-icon ${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900"}`}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Link>
  )
}

// Component for footer columns
function FooterColumn({ title, children, isDark }) {
  return (
    <div className={`rounded-lg p-4 ${isDark ? "bg-zinc-900/30" : "bg-zinc-100/70"}`}>
      <h3 className={`mb-5 text-sm font-semibold uppercase tracking-wider ${isDark ? "text-white" : "text-zinc-900"}`}>
        {title}
      </h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  )
}

// Component for footer links
function FooterLink({ href, label, isDark }) {
  return (
    <li>
      <Link
        href={href}
        className={`footer-link ${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"}`}
        style={
          {
            "--after-bg": isDark ? "#ffffff" : "#000000",
          } as React.CSSProperties
        }
      >
        {label}
        <style jsx>{`
          .footer-link:after {
            background: var(--after-bg);
          }
        `}</style>
      </Link>
    </li>
  )
}
