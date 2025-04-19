"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Github, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Checkbox } from "../../components/ui/checkbox"
import { Label } from "../../components/ui/label"
import { Separator } from "../../components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import ReCaptchaElement from "@/components/ReCaptchaElement"
import ReCaptchaProvider from "@/components/ReCaptchaProvider"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isRecaptchaDone, setIsRecaptchaDone] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [authMethod, setAuthMethod] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  // Handle OAuth errors
  const error_param = searchParams.get("error")
  if (error_param) {
    switch (error_param) {
      case "OAuthSignin":
        setError("Error occurred during OAuth sign-in.")
        break
      case "OAuthCallback":
        setError("Error occurred during OAuth callback.")
        break
      case "OAuthCreateAccount":
        setError("Could not create OAuth account.")
        break
      case "EmailCreateAccount":
        setError("Could not create email account.")
        break
      case "Callback":
        setError("Error occurred during callback.")
        break
      default:
        setError("An error occurred during authentication.")
    }
  }

  const handleClickGoog = async () => {
    try {
      setIsLoading(true)
      setAuthMethod("google")
      setError(null)
      const result = await signIn("google", {
        callbackUrl,
        redirect: false,
      })
      if (result?.error) {
        setError("Failed to sign in with Google. Please try again.")
      } else if (result?.ok) {
        setSuccess("Successfully signed in with Google!")
        setTimeout(() => {
          router.push(callbackUrl)
        }, 500)
      }
    } catch (error) {
      console.error("Google login error:", error)
      setError("Failed to sign in with Google. Please try again.")
    } finally {
      setIsLoading(false)
      setAuthMethod(null)
    }
  }

  const handleClickGit = async () => {
    try {
      setIsLoading(true)
      setAuthMethod("github")
      setError(null)
      const result = await signIn("github", {
        callbackUrl,
        redirect: false,
      })
      if (result?.error) {
        setError("Failed to sign in with GitHub. Please try again.")
      } else if (result?.ok) {
        setSuccess("Successfully signed in with GitHub!")
        setTimeout(() => {
          router.push(callbackUrl)
        }, 500)
      }
    } catch (error) {
      console.error("GitHub login error:", error)
      setError("Failed to sign in with GitHub. Please try again.")
    } finally {
      setIsLoading(false)
      setAuthMethod(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isRecaptchaDone) {
      setError("Please complete the reCAPTCHA verification first.")
      return
    }

    setIsLoading(true)
    setAuthMethod("credentials")
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const remember = formData.get("remember") === "on"

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        switch (result.error) {
          case "User not found":
            setError("No account found with this email. Please sign up first.")
            break
          case "Invalid password":
            setError("Invalid password. Please try again.")
            break
          case "Invalid credentials":
            setError("Invalid email or password. Please check your credentials.")
            break
          default:
            setError("An error occurred during sign in. Please try again.")
        }
      } else if (result?.ok) {
        setSuccess("Successfully signed in!")
        setTimeout(() => {
          router.push(callbackUrl)
        }, 500)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
      setAuthMethod(null)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  return (
    <ReCaptchaProvider>
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left side - Login Form */}
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

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mx-auto mt-4 w-full max-w-md rounded-xl border border-border/40 bg-card/30 p-6 shadow-sm backdrop-blur-sm sm:mt-6 md:mt-8 sm:p-8"
          >
            <div className="space-y-2 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 sm:h-14 sm:w-14 sm:mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary sm:h-9 sm:w-9">
                  <span className="font-poppins text-base font-bold text-primary-foreground sm:text-lg">G</span>
                </div>
              </div>
              <h1 className="font-poppins text-2xl font-bold sm:text-3xl">Welcome back!</h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Enter your credentials to access your account
              </p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <Alert variant="success" className="mb-6 bg-green-50 text-green-800 border-green-200">
                  <AlertDescription className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {success}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
              <div className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="h-11 sm:h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="h-11 sm:h-12 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" disabled={isLoading} />
                  <Label
                    htmlFor="remember"
                    className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me for 30 days
                  </Label>
                </div>
              </div>

              <ReCaptchaElement setIsRecaptchaDone={setIsRecaptchaDone} />

              <Button type="submit" className="h-11 w-full sm:h-12 transition-all duration-200" disabled={isLoading}>
                {isLoading && authMethod === "credentials" ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <span>Sign in</span>
                )}
              </Button>
            </form>

            <div className="mt-6 sm:mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 sm:mt-6">
                <Button
                  variant="outline"
                  className="h-11 w-full sm:h-12 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  type="button"
                  onClick={handleClickGoog}
                  disabled={isLoading}
                >
                  {isLoading && authMethod === "google" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
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
                  )}
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="h-11 w-full sm:h-12 transition-all duration-200 hover:bg-gray-900 hover:text-white hover:border-gray-800"
                  type="button"
                  onClick={handleClickGit}
                  disabled={isLoading}
                >
                  {isLoading && authMethod === "github" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Github className="mr-2 h-4 w-4" />
                  )}
                  GitHub
                </Button>
              </div>
            </div>

            <p className="mt-6 text-center text-xs sm:text-sm sm:mt-8 text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </motion.div>

          <div className="mt-4 text-center text-xs text-muted-foreground sm:mt-8">
            &copy; {new Date().getFullYear()} Grivax. All rights reserved.
          </div>
        </div>

        {/* Right side - Decorative */}
        <div className="hidden bg-muted lg:block lg:w-1/2">
          <div className="relative flex h-full items-center justify-center overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-background"></div>
            <div className="absolute inset-0 opacity-30">
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(107, 70, 193, 0.2)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>

            {/* Decorative elements */}
            <div className="absolute left-1/4 top-1/4 h-40 w-40 rounded-full bg-primary/20 blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl"></div>
            <div className="absolute top-1/3 right-1/3 h-32 w-32 rounded-full bg-pink-500/20 blur-3xl"></div>

            <div className="relative z-10 max-w-md p-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8 flex justify-center"
              >
                <div className="relative">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/30 to-purple-500/30 blur-md"></div>
                  <Image
                    src="/images/learning-illustration.svg"
                    alt="Learning illustration"
                    width={320}
                    height={220}
                    className="relative rounded-lg shadow-lg bg-white/90 p-2"
                    priority
                  />
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
                <h2 className="font-poppins text-2xl font-bold">Unlock Your Learning Potential</h2>
                <p className="mt-4 text-muted-foreground">
                  Access personalized courses, adaptive quizzes, and track your progress with Grivax's intelligent
                  learning platform.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start space-x-3 rounded-lg bg-white/80 p-3 shadow-sm text-left">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Personalized Learning Path</h3>
                      <p className="text-xs text-muted-foreground">Courses tailored to your skill level and goals</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rounded-lg bg-white/80 p-3 shadow-sm text-left">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Interactive Exercises</h3>
                      <p className="text-xs text-muted-foreground">Learn by doing with hands-on practice sessions</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-center">
                  {/* <Button variant="outline" className="group" asChild>
                    <Link href="/courses">
                      <span>Explore our courses</span>
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button> */}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ReCaptchaProvider>
  )
}
