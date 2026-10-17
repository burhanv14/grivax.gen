"use client"

import type React from "react"
import Link from "next/link"
import { Facebook, Github, Instagram, Linkedin, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative border-t overflow-hidden bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Base background */}
        <div className="absolute inset-0 bg-white dark:bg-black" />

        {/* Dark Mode Stars */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage: `
              radial-gradient(white, rgba(255, 255, 255, 0.2) 2px, transparent 3px),
              radial-gradient(white, rgba(255, 255, 255, 0.15) 1px, transparent 2px),
              radial-gradient(white, rgba(255, 255, 255, 0.1) 2px, transparent 3px)
            `,
            backgroundSize: "550px 550px, 350px 350px, 250px 250px",
            backgroundPosition: "0 0, 40px 60px, 130px 270px",
            opacity: 0.7,
          }}
        />

        {/* Light Mode Stars */}
        <div
          className="absolute inset-0 block dark:hidden"
          style={{
            backgroundImage: `
              radial-gradient(#1f2937, rgba(31, 41, 55, 0.2) 2px, transparent 3px),
              radial-gradient(#1f2937, rgba(31, 41, 55, 0.15) 1px, transparent 2px),
              radial-gradient(#1f2937, rgba(31, 41, 55, 0.1) 2px, transparent 3px)
            `,
            backgroundSize: "550px 550px, 350px 350px, 250px 250px",
            backgroundPosition: "0 0, 40px 60px, 130px 270px",
            opacity: 0.3,
          }}
        />

        {/* Grid pattern - Dark */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            opacity: 0.5,
          }}
        />

        {/* Grid pattern - Light */}
        <div
          className="absolute inset-0 block dark:hidden"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(31, 41, 55, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(31, 41, 55, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            opacity: 0.7,
          }}
        />

        {/* Shooting stars (dark mode) */}
        <div className="hidden dark:block">
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
        </div>
      </div>

      {/* Main Content */}
      <div className="container relative mx-auto px-4 py-12 md:py-16 md:px-6 z-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="mb-6 flex items-center gap-2 group">
              <img
                src="/grivaxLogo.png"
                alt="Grivax Logo"
                className="h-14 w-14 transition-all duration-300 group-hover:scale-110"
              />
              <span className="font-poppins text-xl font-bold text-zinc-900 dark:text-white">
                Grivax
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-zinc-600 dark:text-zinc-400">
              Grivax is a dynamic education platform that generates personalized courses, unit tests, and assessments to help you
              master any subject.
            </p>
            <div className="flex space-x-5">
              <SocialIcon icon={<Github className="h-5 w-5" />} label="GitHub" link="https://github.com/burhanv14/grivax.gen" />
              <SocialIcon icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" link="https://www.linkedin.com/in/burhan-vora-b84817251/" />
            </div>
          </div>

          <FooterColumn title="Platform">
            <FooterLink href="/courses" label="Courses" />
            <FooterLink href="/assessments" label="Assessments" />
            <FooterLink href="/dashboard" label="Dashboard" />
          </FooterColumn>

          <FooterColumn title="Company">
            <FooterLink href="#" label="About" />
            <FooterLink href="#" label="Cookies" />
            <FooterLink href="#" label="Contact" />
            <FooterLink href="#" label="Privacy" />
          </FooterColumn>

        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 relative">
          <div className="absolute left-0 right-0 h-px bg-zinc-200 dark:bg-zinc-800" />
          <p className="text-center text-sm mt-8 text-zinc-500">
            &copy; {new Date().getFullYear()} Grivax. All rights reserved.
          </p>
        </div>
      </div>

    </footer>
  )
}

function SocialIcon({ icon, label, link }: { icon: React.ReactNode; label: string, link: string }) {
  return (
    <Link
      href={link}
      className="social-icon text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Link>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-4 bg-zinc-100/70 dark:bg-zinc-900/30">
      <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
        {title}
      </h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  )
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="footer-link text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors text-sm"
      >
        {label}
      </Link>
    </li>
  )
}
