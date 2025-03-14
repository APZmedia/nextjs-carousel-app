"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

/**
 * EXAMPLE STEP-02: If there's no raw data from step-01, we immediately
 * redirect the user back to /step-01. This ensures "step-02" is
 * inaccessible if the content is not generated.
 */
export default function Step02() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [rawData, setRawData] = useState<any>(null)

  useEffect(() => {
    // On mount, check localStorage for "step01_raw"
    const savedRaw = localStorage.getItem("step01_raw")
    if (!savedRaw) {
      // If no data at all, redirect
      router.push("/step-01")
    } else {
      // Attempt to parse
      try {
        const parsed = JSON.parse(savedRaw)
        // If empty or invalid, also go back
        if (!parsed || !Object.keys(parsed).length) {
          router.push("/step-01")
        } else {
          setRawData(parsed)
        }
      } catch {
        router.push("/step-01")
      }
    }
  }, [router])

  // This is just a placeholder function to show how you might do something
  // else on step-02 with the data from step-01
  const handleSomeAction = async () => {
    setLoading(true)
    try {
      // Do some next step with the data
      toast.success("Step02 is handling the data now...")
    } catch (error) {
      toast.error("Error in step-02 action")
    } finally {
      setLoading(false)
    }
  }

  if (!rawData) {
    // Optionally show a loader while we check localStorage
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Checking data...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-2">Step-02: Next Step</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Data from step-01</h3>
            <p className="text-sm text-muted-foreground mb-2">Raw JSON (for example):</p>
            <div className="bg-muted p-2 rounded-md overflow-x-auto">
              <pre className="text-xs">{JSON.stringify(rawData, null, 2)}</pre>
            </div>
            <Button
              onClick={handleSomeAction}
              className="mt-4 w-full transition-all duration-300 hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Doing Step02 action...
                </>
              ) : (
                "Do Step02 Action"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Your Next UI / Steps</h3>
            <p>Perform your additional logic here, or display content derived from step-01 data.</p>
            <p className="text-sm mt-2 text-muted-foreground">
              This entire page is only accessible if there was valid data from step-01 stored in localStorage.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
