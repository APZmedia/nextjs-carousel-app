"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Simple auth check - redirect to login if not on auth pages
  useEffect(() => {
    setMounted(true)

    // This is a simplified check - in a real app, you'd check for a valid session
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

      // For demo purposes, let's set this to true so we can see the app
      localStorage.setItem("isLoggedIn", "true")

      if (!isLoggedIn && !pathname.includes("/login") && !pathname.includes("/signup")) {
        router.push("/login")
      }
    }
  }, [pathname, router])

  if (!mounted) {
    return null
  }

  // Default to collapsed on mobile, expanded on desktop
  const defaultOpen = !isMobile

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6 md:pt-16">{children}</main>
      </div>
    </SidebarProvider>
  )
}