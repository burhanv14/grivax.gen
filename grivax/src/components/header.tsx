"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, User, Settings, LogOut, ChevronRight, CreditCard, HelpCircle, Bell, Sun, Moon } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"
import { useMobile } from "../hooks/use-mobile"
import { useSession, signOut } from "next-auth/react"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Separator } from "./ui/separator"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

export default function Header() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated" && session?.user
  const [userId, setUserId] = useState<string>("")
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false)
    setIsSideMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    // Fetch user ID when authenticated
    const fetchUserId = async () => {
      if (isAuthenticated && session?.user?.email) {
        try {
          const response = await fetch(`/api/user?email=${encodeURIComponent(session.user.email)}`)
          if (response.ok) {
            const data = await response.json()
            if (data.user_id) {
              setUserId(data.user_id)
            }
          }
        } catch (error) {
          console.error("Error fetching user ID:", error)
        }
      }
    }

    fetchUserId()
  }, [isAuthenticated, session?.user?.email])

  // Define navigation items with dynamic courses link
  const navItems = [
    { name: "Home", href: "/" },
    {
      name: "Courses",
      href: isAuthenticated && userId ? `/courses/${userId}` : "/login",
    },
    { name: "Assessments", href: isAuthenticated && userId ? `/assessments/${userId}` : "/login" },
    { name: "Dashboard", href: isAuthenticated && userId ? `/dasboard/${userId}` : "/login" },
  ]

  const menuItems = [
    {
      title: "Account",
      items: [
        {
          name: "Dashboard",
          href: isAuthenticated && userId ? `/dashboard/${userId}` : "/login",
          icon: <User className="h-4 w-4" />,
        },
        {
          name: "Account Settings",
          href: "/account",
          icon: <Settings className="h-4 w-4" />,
        },
        {
          name: "Billing",
          href: "/billing",
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          name: "Notifications",
          href: "/notifications",
          icon: <Bell className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          name: "Help Center",
          href: "/help",
          icon: <HelpCircle className="h-4 w-4" />,
        },
      ],
    },
  ]

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!session?.user?.name) return "U"

    const nameParts = session.user.name.split(" ")
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase()

    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <>
      {/* Backdrop blur when side menu is open */}
      {isSideMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsSideMenuOpen(false)}
        />
      )}

      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md transition-all duration-300",
          isScrolled ? "shadow-md dark:shadow-primary/5" : "",
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md group-hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]"></div>
                <span className="font-poppins text-lg font-bold text-primary-foreground relative z-10">G</span>
              </div>
              <span className="font-poppins text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 dark:from-primary dark:to-primary/90">
                Grivax
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md hover:bg-accent/50",
                  pathname === item.href
                    ? "text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-0.5 after:bg-primary after:rounded-full"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="relative h-9 w-9 rounded-full border border-input bg-background shadow-sm transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
                  >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle theme</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* User Menu - Desktop */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <Sheet open={isSideMenuOpen} onOpenChange={setIsSideMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="relative z-50 gap-2 pl-3 pr-4 transition-all duration-200 hover:bg-accent border border-input shadow-sm hover:shadow-md"
                    >
                      <Avatar className="h-6 w-6 ring-2 ring-background">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{session.user.name?.split(" ")[0]}</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[320px] sm:w-[380px] border-l p-0 overflow-y-auto" side="right">
                    <div className="p-6 bg-gradient-to-b from-primary/10 to-background dark:from-primary/5">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-background shadow-lg ring-2 ring-primary/10">
                          <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <h3 className="font-semibold text-lg tracking-tight">{session.user.name}</h3>
                          {session.user.email && (
                            <p className="text-sm text-muted-foreground mt-0.5">{session.user.email}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-2">
                      {menuItems.map((section, index) => (
                        <div key={section.title} className={cn(index > 0 && "mt-6")}>
                          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                            {section.title}
                          </h3>
                          <div className="space-y-1">
                            {section.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                  "flex items-center justify-between rounded-md px-3 py-2.5 text-sm transition-all duration-200",
                                  pathname === item.href
                                    ? "bg-accent font-medium text-accent-foreground"
                                    : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                                )}
                                onClick={() => setIsSideMenuOpen(false)}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-background text-muted-foreground shadow-sm">
                                    {item.icon}
                                  </span>
                                  <span>{item.name}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto">
                      <Separator />
                      <div className="p-4">
                        <Button
                          onClick={() => {
                            setIsSideMenuOpen(false)
                            signOut()
                          }}
                          variant="outline"
                          className="w-full justify-start gap-3 text-destructive hover:text-destructive-foreground hover:bg-destructive/90 transition-all duration-200"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Log out</span>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <Button asChild className="relative overflow-hidden group">
                  <Link href="/login">
                    <span className="relative z-10">Get Started</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobile && isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="container mx-auto px-4 pb-4 md:hidden"
          >
            <nav className="flex flex-col space-y-2 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {item.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7 ring-2 ring-background">
                          <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{session.user.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </SheetTrigger>
                  <SheetContent className="w-[320px] sm:w-[380px] border-l p-0 overflow-y-auto" side="right">
                    <div className="p-6 bg-gradient-to-b from-primary/10 to-background dark:from-primary/5">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-background shadow-lg ring-2 ring-primary/10">
                          <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <h3 className="font-semibold text-lg tracking-tight">{session.user.name}</h3>
                          {session.user.email && (
                            <p className="text-sm text-muted-foreground mt-0.5">{session.user.email}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-2">
                      {menuItems.map((section, index) => (
                        <div key={section.title} className={cn(index > 0 && "mt-6")}>
                          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                            {section.title}
                          </h3>
                          <div className="space-y-1">
                            {section.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                  "flex items-center justify-between rounded-md px-3 py-2.5 text-sm transition-all duration-200",
                                  pathname === item.href
                                    ? "bg-accent font-medium text-accent-foreground"
                                    : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-background text-muted-foreground shadow-sm">
                                    {item.icon}
                                  </span>
                                  <span>{item.name}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto">
                      <Separator />
                      <div className="p-4">
                        <Button
                          onClick={() => signOut()}
                          variant="outline"
                          className="w-full justify-start gap-3 text-destructive hover:text-destructive-foreground hover:bg-destructive/90 transition-all duration-200"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Log out</span>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <Button asChild className="mt-2 w-full relative overflow-hidden group">
                  <Link href="/login">
                    <span className="relative z-10">Get Started</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </header>
    </>
  )
}
