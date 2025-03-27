"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import PlaceholderImage from "@/components/placeholder-image"
import ReCaptchaElement from "@/components/ReCaptchaElement"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left side - Signup Form */}
      <div className="flex w-full flex-col justify-between p-4 sm:p-6 md:p-8 lg:w-1/2 lg:p-12">
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="mx-auto mt-4 w-full max-w-md sm:mt-6 md:mt-8">
          <div className="space-y-2 text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 sm:h-12 sm:w-12 sm:mb-6">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary sm:h-8 sm:w-8">
                <span className="font-poppins text-base font-bold text-primary-foreground sm:text-lg">G</span>
              </div>
            </div>
            <h1 className="font-poppins text-2xl font-bold tracking-tight sm:text-3xl">Create an account</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Sign up to get started with Grivax.gen</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" placeholder="John" required className="h-10 sm:h-12" />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" placeholder="Doe" required className="h-10 sm:h-12" />
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" required className="h-10 sm:h-12" />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" required className="h-10 sm:h-12" />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="terms" className="mt-1" />
                <Label htmlFor="terms" className="text-xs sm:text-sm font-medium leading-normal">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    privacy policy
                  </Link>
                </Label>
              </div>
            </div>

            {/* reCAPTCHA component */}
            <div className="my-4">
              <ReCaptchaElement />
            </div>

            <Button type="submit" className="h-10 w-full sm:h-12" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                <span>Create account</span>
              )}
            </Button>
          </form>

          <div className="mt-6 sm:mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:mt-6">
              <Button variant="outline" className="h-10 w-full sm:h-11" type="button">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="h-10 w-full sm:h-11" type="button">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>

            <p className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Grivax.gen. All rights reserved.
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden bg-muted lg:block lg:w-1/2">
        <div className="relative flex h-full items-center justify-center overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-background"></div>

          {/* Decorative elements */}
          <div className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl"></div>

          <div className="relative z-10 max-w-md p-8 text-center">
            <div className="mb-8 flex justify-center">
              <PlaceholderImage width={300} height={200} alt="Learning illustration" className="rounded-lg shadow-lg" />
            </div>
            <h2 className="font-poppins text-2xl font-bold">Join Our Learning Community</h2>
            <p className="mt-4 text-muted-foreground">
              Create your account to access personalized courses, track your progress, and connect with other learners.
            </p>
            <div className="mt-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div className="h-2 w-2 rounded-full bg-primary/60"></div>
                <div className="h-2 w-2 rounded-full bg-primary/30"></div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-center">
              <Button variant="outline" className="group" asChild>
                <Link href="/courses">
                  <span>Browse our courses</span>
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

