"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { CarouselData, TextAnalysisData } from "@/types/carousel"
import { Loader2 } from "lucide-react"
// import { generateCarouselText } from "@/app/actions/carousel-actions"
import { toast } from "sonner"

interface Step02Props {
  textAnalysis: TextAnalysisData | null
  onCarouselDataGenerated: (data: CarouselData) => void
}

export function Step02({ textAnalysis, onCarouselDataGenerated }: Step02Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CarouselData | null>(null)

  const formatTextAnalysis = (data: TextAnalysisData | null): string => {
    if (!data) return ""

    return `
Main Title: ${data.mainTitle}

Author: ${data.author}

Important Facts:
${data.importantFacts.map((fact, index) => `${index + 1}. ${fact}`).join("\n")}

Opposing Forces:
${data.opposingForces.map((force, index) => `${index + 1}. ${force}`).join("\n")}

Notable Quotes:
${data.notableQuotes.map((quote, index) => `${index + 1}. ${quote}`).join("\n")}
  `
  }

  const handleGenerateCarouselText = async () => {
    if (!textAnalysis) return

    setLoading(true)

/*     try {
      // Call the server action to generate carousel text
      const data = await generateCarouselText(textAnalysis)

      setResult(data)
      onCarouselDataGenerated(data)
      toast.success("Carousel text generated", {
        description: "Your carousel text has been successfully generated.",
      })
    } catch (error) {
      console.error("Error generating carousel text:", error)
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to generate carousel text",
      })
    } finally {
      setLoading(false)
    }
  } */

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Input</h3>
            <Textarea className="min-h-[300px] resize-none" value={formatTextAnalysis(textAnalysis)} readOnly />
            <Button
              onClick={handleGenerateCarouselText}
              className="mt-4 w-full transition-all duration-300 hover:scale-[1.02]"
              disabled={loading || !textAnalysis}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating carousel text...
                </>
              ) : (
                "Generate text for the carousel"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Output</h3>
            {result ? (
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                <div>
                  <h4 className="font-medium">Title:</h4>
                  <p>{result.Title}</p>
                </div>

                <div>
                  <h4 className="font-medium">Subtitle:</h4>
                  <p>{result.Subtitle}</p>
                </div>

                <div>
                  <h4 className="font-medium">Text 01:</h4>
                  <p>{result.Text01}</p>
                </div>

                <div>
                  <h4 className="font-medium">Text 02:</h4>
                  <p>{result.Text02}</p>
                </div>

                <div>
                  <h4 className="font-medium">Text 03:</h4>
                  <p>{result.Text03}</p>
                </div>

                <div>
                  <h4 className="font-medium">Hashtag:</h4>
                  <p>{result.Hashtag}</p>
                </div>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                {loading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                    <p>Generating carousel text...</p>
                  </div>
                ) : (
                  <p>Generated carousel text will appear here</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
}
