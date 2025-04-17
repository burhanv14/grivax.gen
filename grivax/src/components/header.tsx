"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, User, Settings, LogOut, ChevronRight, CreditCard, HelpCircle, Bell } from "lucide-react"
import { Button } from "./ui/button"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "../lib/utils"
import { useMobile } from "../hooks/use-mobile"
import { useSession, signOut } from "next-auth/react"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Separator } from "./ui/separator"

export default function Header() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated" && session?.user
  const [userId, setUserId] = useState<string>("")

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
      href: isAuthenticated && userId ? `/courses/${userId}` : "/login" 
    },
    { name: "Assessments", href: "/assessments" },
    { name: "Dashboard", href: "/dashboard" },
  ]

  const menuItems = [
    {
      title: "Account",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
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
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsSideMenuOpen(false)}
        />
      )}

      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur transition-all duration-200",
          isScrolled ? "shadow-sm" : "",
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="font-poppins text-lg font-bold text-primary-foreground">G</span>
              </div>
              <span className="font-poppins text-xl font-bold">Grivax.gen</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="hidden md:block">
              {isAuthenticated ? (
                <Sheet open={isSideMenuOpen} onOpenChange={setIsSideMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="relative z-50 gap-2 pl-3 pr-4 transition-all duration-200 hover:bg-accent"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{session.user.name}</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[320px] sm:w-[380px] border-l p-0 overflow-y-auto" side="right">
                    <div className="p-6 bg-gradient-to-b from-primary/10 to-background dark:from-primary/5">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
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
                                  "flex items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors",
                                  pathname === item.href
                                    ? "bg-accent font-medium text-accent-foreground"
                                    : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                                )}
                                onClick={() => setIsSideMenuOpen(false)}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-background text-muted-foreground">
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
                          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Log out</span>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <Button asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
              )}
            </div>
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
          <div className="container mx-auto px-4 pb-4 md:hidden">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
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
                    <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7">
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
                        <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
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
                                  "flex items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors",
                                  pathname === item.href
                                    ? "bg-accent font-medium text-accent-foreground"
                                    : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-background text-muted-foreground">
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
                          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Log out</span>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <Button asChild className="mt-2 w-full">
                  <Link href="/login">Get Started</Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}

