"use client"

import { Calendar, Image, Home, User, LogOut, Menu, Library } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, toggleSidebar, setOpen } = useSidebar()
  const isSmallScreen = useMediaQuery("(max-width: 768px)")

  // Add this useEffect to ensure sidebar is always open on medium and large screens
  useEffect(() => {
    if (!isSmallScreen) {
      setOpen(true)
    }
  }, [isSmallScreen, setOpen])

  const routes = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "Schedule",
      icon: Calendar,
      href: "/schedule",
    },
    {
      title: "Carousel",
      icon: Image,
      href: "/carousel",
    },
    {
      title: "Library",
      icon: Library,
      href: "/library",
    },
    {
      title: "Profile",
      icon: User,
      href: "/profile",
    },
  ]

  const handleLogout = () => {
    // Simulate logout
    toast.success("Logged out successfully")
    router.push("/login")
  }

  return (
    <>
      {/* Mobile Sidebar Trigger - Fixed to the bottom of the screen */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button onClick={toggleSidebar} size="icon" className="h-12 w-12 rounded-full shadow-lg">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-primary">
                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-primary-foreground">
                  A
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold">AI-Powered Carousel</span>
                <span className="text-xs text-muted-foreground">Content Generator</span>
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="space-y-1">
            {routes.map((route) => (
              <SidebarMenuItem key={route.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === route.href}
                  tooltip={route.title}
                  className="w-10 h-10"
                >
                  <Link
                    href={route.href}
                    className="flex items-center gap-2"
                    onClick={(e) => {
                      const isMediumOrLargeScreen = window.matchMedia("(min-width: 768px)").matches
                      if (isMediumOrLargeScreen && state === "collapsed") {
                        e.preventDefault()
                        toggleSidebar()
                      } else if (!isMediumOrLargeScreen && pathname !== route.href) {
                        toggleSidebar()
                      }
                    }}
                  >
                    <route.icon className="h-6 w-6 shrink-0 " />
                    <span>{route.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">John Doe</span>
                <span className="text-xs text-muted-foreground truncate">john@example.com</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <ModeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}