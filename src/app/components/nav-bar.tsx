"use client"
import { useState } from "react"
import { ThemeToggle } from "../utils/themetoggle"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Input } from "@/components/ui/input"
import { Menu, Search, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function NavBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 dark:bg-gray-950/95 bg-white backdrop-blur-sm dark:border-gray-800 border-gray-200 border-b">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-2">
            <img src="/homepagelogo.png" alt="LearnWeb3 Logo" className="h-26 w-26 lg:h-44 lg:w-44" />
          </Link>

          <NavigationMenu className="hidden lg:flex dark:bg-gray-950 bg-white/95">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:bg-gray-950 bg-white/95">
                  Learn
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[400px] p-4">
                    <NavigationMenuLink>Menu content</NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:bg-gray-950 bg-white/95">
                  Opportunities
                </NavigationMenuTrigger>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:bg-gray-950 bg-white/95">
                  Community
                </NavigationMenuTrigger>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:bg-gray-950 bg-white/95">
                  Resources
                </NavigationMenuTrigger>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <div className={`relative ${isSearchOpen ? "flex" : "hidden md:flex"}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 dark:text-gray-400 text-gray-500" />
            <Input
              placeholder="Search"
              className="w-full md:w-64 pl-9 dark:bg-gray-900 bg-gray-50 dark:border-gray-800 border-gray-200 dark:text-gray-300 text-gray-700 dark:placeholder:text-gray-500 placeholder:text-gray-400"
            />
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <Link href="/login" legacyBehavior passHref>
            <Button className="bg-red-600 hover:bg-red-700 text-white hidden md:inline-flex">Login / SignUp</Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                <Link href="/" className="text-lg font-semibold">
                  Learn
                </Link>
                <Link href="/" className="text-lg font-semibold">
                  Opportunities
                </Link>
                <Link href="/" className="text-lg font-semibold">
                  Community
                </Link>
                <Link href="/" className="text-lg font-semibold">
                  Resources
                </Link>
                <div className="mt-4">
                  <ThemeToggle />
                </div>
                <Link href="/login" legacyBehavior passHref>
                  <Button className="bg-red-600 hover:bg-red-700 text-white w-full mt-4">Login / SignUp</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

