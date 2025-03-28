"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Github } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import PlaceholderImage from "../../components/placeholder-image";
import ReCaptchaElement from "@/components/ReCaptchaElement";
import ReCaptchaProvider from "@/components/ReCaptchaProvider";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecaptchaDone, setIsRecaptchaDone] = useState(true);
  const router = useRouter();

  const handleClickGoog = () => {
    signIn("google");
  };

  const handleClickGit = () => {
    signIn("github");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if(!isRecaptchaDone){
      console.warn("Please complete the Recaptcha Verification");
    }
    else{
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // No need to hash on client side; backend compares plain password
      const signInResponse = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      // Check for errors based on backend error messages
      if (signInResponse?.error) {
        if (signInResponse.error === "User not found") {
          setError("Account not created, try signing up or check the entered credentials.");
        } else if (signInResponse.error === "Invalid password") {
          setError("The credentials entered are incorrect.");
        } else {
          setError("Your email or password is incorrect.");
        }
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  };

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

          <div className="mx-auto mt-4 w-full max-w-md sm:mt-6 md:mt-8">
            <div className="space-y-2 text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 sm:h-12 sm:w-12 sm:mb-6">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary sm:h-8 sm:w-8">
                  <span className="font-poppins text-base font-bold text-primary-foreground sm:text-lg">G</span>
                </div>
              </div>
              <h1 className="font-poppins text-2xl font-bold sm:text-3xl">Welcome back!</h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Enter your credentials to access your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="h-10 sm:h-12"
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-10 sm:h-12"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="remember"/>
                  <Label
                    htmlFor="remember"
                    className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me for 30 days
                  </Label>
                </div>
              </div>

              <ReCaptchaElement/>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button type="submit" className="h-10 w-full sm:h-12" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
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
                    Signing in...
                  </div>
                ) : (
                  <span>Sign in</span>
                )}
              </Button>
            </form>

            <div className="mt-4 sm:mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6">
                <Button variant="outline" className="h-10 w-full sm:h-11" type="button" onClick={handleClickGoog}>
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
                <Button variant="outline" className="h-10 w-full sm:h-11" type="button" onClick={handleClickGit}>
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </div>

            <p className="mt-4 text-center text-xs sm:text-sm sm:mt-6 text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground sm:mt-8">
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
                <PlaceholderImage
                  width={300}
                  height={200}
                  alt="Learning illustration"
                  className="rounded-lg shadow-lg"
                />
              </div>
              <h2 className="font-poppins text-2xl font-bold">Unlock Your Learning Potential</h2>
              <p className="mt-4 text-muted-foreground">
                Access personalized courses, adaptive quizzes, and track your progress with Grivax.gen's intelligent
                learning platform.
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
                    <span>Explore our courses</span>
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReCaptchaProvider>
  );
}