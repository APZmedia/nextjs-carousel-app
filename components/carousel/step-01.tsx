"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertTriangle } from "lucide-react"
import { generateTextAnalysis } from "@/app/actions/carousel-actions"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Example type if you pass structured text analysis back to the parent.
interface TextAnalysisData {
  mainTitle: string
  author: string
  importantFacts: string[]
  opposingForces: string[]
  notableQuotes: string[]
}

interface Step01Props {
  /**
   * Called when we have new text analysis data
   * we want to save in the parent.
   */
  onTextAnalysisGenerated?: (data: TextAnalysisData) => void

  /**
   * Called when user explicitly clicks the "Go to Step02" button
   */
  goToStep02?: () => void
}

export function Step01({ onTextAnalysisGenerated, goToStep02 }: Step01Props) {
  const [prompt, setPrompt] = useState("")
  const [loadingState, setLoadingState] = useState<"idle" | "submitting" | "processing">("idle")
  const [error, setError] = useState<string | null>(null)

  // Text lines returned from ComfyUI
  const [result, setResult] = useState<string[] | null>(null)

  // Parsed JSON from ComfyUI
  const [rawResponse, setRawResponse] = useState<Record<string, any> | null>(null)

  // Debug info toggle
  const [debugInfo, setDebugInfo] = useState<any | null>(null)
  const isLoading = loadingState !== "idle"

  // -----------------------------
  // LOAD from localStorage on mount
  // -----------------------------
  useEffect(() => {
    const savedPrompt = localStorage.getItem("step01_prompt")
    const savedResult = localStorage.getItem("step01_result")
    const savedRaw = localStorage.getItem("step01_raw")

    if (savedPrompt) {
      setPrompt(savedPrompt)
    }
    if (savedResult) {
      try {
        const arr = JSON.parse(savedResult)
        if (Array.isArray(arr)) {
          setResult(arr)
        }
      } catch {
        // ignore parse errors
      }
    }
    if (savedRaw) {
      try {
        const parsed = JSON.parse(savedRaw)
        if (parsed && typeof parsed === "object") {
          setRawResponse(parsed)
        }
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  // -----------------------------
  // SAVE to localStorage on change
  // -----------------------------
  useEffect(() => {
    localStorage.setItem("step01_prompt", prompt || "")
    localStorage.setItem("step01_result", JSON.stringify(result || []))
    localStorage.setItem("step01_raw", JSON.stringify(rawResponse || {}))
  }, [prompt, result, rawResponse])

  const handleGenerateContent = async () => {
    if (!prompt.trim()) return

    setLoadingState("submitting")
    setError(null)
    setDebugInfo(null)
    setRawResponse(null)
    setResult(null)

    try {
      setLoadingState("processing")
      const data = await generateTextAnalysis(prompt)

      // Look for line "Raw result: {...}"
      const rawResultIndex = data.findIndex((item) => item.startsWith?.("Raw result:"))
      if (rawResultIndex !== -1) {
        const rawJsonString = data[rawResultIndex].replace("Raw result:", "").trim()
        try {
          const parsed = JSON.parse(rawJsonString)
          setRawResponse(parsed)
        } catch (e) {
          console.error("Failed to parse raw result:", e)
          setRawResponse({})
        }
      }

      // Filter out empty lines
      const filteredData = data.filter((item) => item && typeof item === "string" && item.trim() !== "")
      setResult(filteredData)

      // If you want a structured object for step-02, build it here:
      if (onTextAnalysisGenerated) {
        // parse the result or rawResponse to fill these fields
        const finalData: TextAnalysisData = {
          mainTitle: "Placeholder Title",
          author: "Placeholder Author",
          importantFacts: [],
          opposingForces: [],
          notableQuotes: [],
        }
        onTextAnalysisGenerated(finalData)
      }

      toast.success("Text analysis generated", {
        description: "Your text has been successfully analyzed.",
      })
    } catch (err) {
      console.error("Error generating text analysis:", err)
      const message = err instanceof Error ? err.message : "Failed to generate text analysis"
      setError(message)
      toast.error("Error", {
        description: message,
      })
    } finally {
      setLoadingState("idle")
    }
  }

  const handleCancel = () => {
    setLoadingState("idle")
    toast.info("Operation cancelled", {
      description: "The text analysis request was cancelled.",
    })
  }

  const toggleDebugInfo = () => {
    if (debugInfo) {
      setDebugInfo(null)
    } else {
      setDebugInfo({
        prompt: prompt.substring(0, 100) + "...",
        result,
        rawResponse,
      })
    }
  }

  // Helper to format textual lines
  const formatResult = (text: string) => {
    if (text.includes("**")) {
      return text.split("\n").map((line, i) => {
        if (line.startsWith("**") && line.includes(":**")) {
          const [title, content] = line.split(":**")
          return (
            <div key={i} className="mb-2">
              <span className="font-bold">{title.replace(/^\*\*/, "")}:</span>
              {content}
            </div>
          )
        }
        if (line.startsWith("* ")) {
          return (
            <li key={i} className="ml-5">
              {line.substring(2)}
            </li>
          )
        }
        return <div key={i}>{line}</div>
      })
    }
    // Otherwise, just split lines
    return text.split("\n").map((line, i) => <div key={i}>{line}</div>)
  }

  // Create a "content only" version of the JSON by removing braces & quotes
  const strippedJson = rawResponse
    ? JSON.stringify(rawResponse, null, 2).replace(/[{}"]/g, "")
    : ""

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ERROR ALERT */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT CARD: INPUT + BUTTON */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Input</h3>
            <Textarea
              placeholder="Paste your text content here..."
              className="min-h-[300px] resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleGenerateContent}
                className="flex-1 transition-all duration-300 hover:scale-[1.02]"
                disabled={isLoading || !prompt.trim()}
              >
                {loadingState === "submitting" && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting to ComfyUI...
                  </>
                )}
                {loadingState === "processing" && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing with AI...
                  </>
                )}
                {loadingState === "idle" && "Generate content"}
              </Button>
              {isLoading && (
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT CARD: OUTPUT + "GO TO STEP02" BUTTON */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Output</h3>
              <Button variant="ghost" size="sm" onClick={toggleDebugInfo}>
                {debugInfo ? "Hide Debug" : "Show Debug"}
              </Button>
            </div>

            {/* Debug info (optional) */}
            {debugInfo && (
              <div className="mb-4 p-2 bg-muted rounded-md overflow-x-auto">
                <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}

            {/* If you want to display the entire JSON unmodified (for debugging) */}
            {rawResponse && Object.keys(rawResponse).length > 0 && (
              <div className="mb-4 p-2 bg-muted rounded-md overflow-x-auto">
                <p className="text-sm font-semibold">Full JSON (debug):</p>
                <pre className="text-xs mt-2">
                  {JSON.stringify(rawResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* Display only the stripped text from JSON (no braces/quotes) */}
            {rawResponse && Object.keys(rawResponse).length > 0 && (
              <div className="mb-4 p-2 bg-muted rounded-md overflow-x-auto">
                <p className="text-sm font-semibold">Content Only (Stripped):</p>
                <pre className="text-xs mt-2">{strippedJson}</pre>
              </div>
            )}

            {/* The textual lines from the ComfyUI result array */}
            {result && result.length > 0 ? (
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                {result.map((line, index) => (
                  <div key={index} className="whitespace-pre-wrap break-words">
                    {formatResult(line)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                {loadingState === "submitting" && (
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                    <p>Submitting to ComfyUI...</p>
                  </div>
                )}
                {loadingState === "processing" && (
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                    <p>AI is analyzing your text...</p>
                    <p className="text-xs mt-2">This may take a minute or two</p>
                  </div>
                )}
                {loadingState === "idle" && <p>Generated content will appear here</p>}
              </div>
            )}

            {/* "GO TO STEP 2" BUTTON BELOW THE OUTPUT FIELD */}
            {goToStep02 && rawResponse && Object.keys(rawResponse).length > 0 && (
              <div className="mt-4 flex">
                <Button
                  variant="default"
                  onClick={() => goToStep02()}
                  className="flex-1"
                >
                  Go to Step02
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
