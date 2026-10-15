"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { GraduationCap, Users, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<string>("STUDENT")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Redirect if already has a role (not STUDENT by default)
  useEffect(() => {
    if (session?.user?.role && session.user.role !== "STUDENT") {
      router.push("/dashboard")
    }
  }, [session, router])

  // Get role from sessionStorage if available
  useEffect(() => {
    const storedRole = sessionStorage.getItem('selectedRole')
    if (storedRole && ["STUDENT", "TEACHER"].includes(storedRole)) {
      setSelectedRole(storedRole)
      // Clear the stored role after using it
      sessionStorage.removeItem('selectedRole')
    }
  }, [])

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError("Please select a role")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess("Role updated successfully! Redirecting...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        setError(data.error || "Failed to update role. Please try again.")
      }
    } catch (error) {
      console.error("Role update error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-xl border border-border/40 bg-card/30 p-8 shadow-sm backdrop-blur-sm"
      >
        <div className="space-y-2 text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="font-poppins text-base font-bold text-primary-foreground">G</span>
            </div>
          </div>
          <h1 className="font-poppins text-2xl font-bold tracking-tight">Choose Your Role</h1>
          <p className="text-sm text-muted-foreground">
            How would you like to use Grivax?
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Alert variant="default">
              <Check className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="space-y-4">
          <RadioGroup
            value={selectedRole}
            onValueChange={setSelectedRole}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="STUDENT" id="student" />
              <Label
                htmlFor="student"
                className="flex items-center space-x-3 cursor-pointer flex-1 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <GraduationCap className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Student</div>
                  <div className="text-sm text-muted-foreground">
                    Learn from courses, take quizzes, and track your progress
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="TEACHER" id="teacher" />
              <Label
                htmlFor="teacher"
                className="flex items-center space-x-3 cursor-pointer flex-1 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Teacher</div>
                  <div className="text-sm text-muted-foreground">
                    Create courses, manage content, and teach students
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <Button 
            onClick={handleSubmit} 
            className="w-full h-11 transition-all duration-200" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating role...
              </div>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
