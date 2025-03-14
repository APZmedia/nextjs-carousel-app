"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (typeof window !== "undefined") {
      const media = window.matchMedia(query)
      setMatches(media.matches)

      const listener = () => setMatches(media.matches)

      // Use the modern API if available
      if (media.addEventListener) {
        media.addEventListener("change", listener)
        return () => media.removeEventListener("change", listener)
      } else {
        // Fallback for older browsers
        media.addListener(listener)
        return () => media.removeListener(listener)
      }
    }
  }, [query])

  // Return false on the server and during first mount
  if (!mounted) return false

  return matches
}