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
import { Moon, Search } from "lucide-react"

export default function NavBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-HcD80hnqz97ixUoLgiaw2DTQYXKe5o.png"
              alt="LearnWeb3 Logo"
              className="h-8 w-8"
            />
            <span className="text-white font-semibold text-lg">LearnWeb3</span>
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-gray-300 hover:text-white">Learn</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[400px] p-4">
                    <NavigationMenuLink>Menu content</NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-gray-300 hover:text-white">Opportunities</NavigationMenuTrigger>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-gray-300 hover:text-white">Community</NavigationMenuTrigger>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-gray-300 hover:text-white">Resources</NavigationMenuTrigger>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search"
              className="w-64 pl-9 bg-gray-900 border-gray-800 text-gray-300 placeholder:text-gray-500"
            />
          </div>
          <Button variant="ghost" size="icon" className="text-gray-300">
            <Moon className="h-5 w-5" />
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white">Sign In</Button>
        </div>
      </div>
    </header>
  )
}

