"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CarouselData } from "@/types/carousel"
import { Download, Loader2 } from "lucide-react"
// import { generateImages } from "@/app/actions/carousel-actions"
import { toast } from "sonner"

interface Step03Props {
  carouselData: CarouselData | null
  onImagesGenerated: (imageUrls: string[]) => void
  generatedImages: string[]
}

export function Step03({ carouselData, onImagesGenerated, generatedImages }: Step03Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CarouselData | null>(carouselData)

  const handleInputChange = (field: keyof CarouselData, value: string) => {
    if (!formData) return
    setFormData({ ...formData, [field]: value })
  }

  const handleGenerateImages = async () => {
    if (!formData) return

    setLoading(true)

/*     try {
      // Call the server action to generate images
      const imageUrls = await generateImages(formData)

      onImagesGenerated(imageUrls)
      toast.success("Images generated", {
        description: "Your carousel images have been successfully generated.",
      })
    } catch (error) {
      console.error("Error generating images:", error)
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to generate images",
      })
    } finally {
      setLoading(false)
    }
  } */

  const handleDownloadImage = async (imageUrl: string, index: number) => {
    try {
      // Create a link element
      const link = document.createElement("a")
      link.href = imageUrl
      link.download = `carousel-image-${index + 1}.jpg`

      // Append to the document
      document.body.appendChild(link)

      // Trigger the download
      link.click()

      // Clean up
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading image:", error)
      toast.error("Error", {
        description: "Failed to download image",
      })
    }
  }

  if (!formData) return null

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Edit Carousel Content</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={formData.Title} onChange={(e) => handleInputChange("Title", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.Subtitle}
                  onChange={(e) => handleInputChange("Subtitle", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text01">Text 01</Label>
                <Textarea
                  id="text01"
                  value={formData.Text01}
                  onChange={(e) => handleInputChange("Text01", e.target.value)}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text02">Text 02</Label>
                <Textarea
                  id="text02"
                  value={formData.Text02}
                  onChange={(e) => handleInputChange("Text02", e.target.value)}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text03">Text 03</Label>
                <Textarea
                  id="text03"
                  value={formData.Text03}
                  onChange={(e) => handleInputChange("Text03", e.target.value)}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtag">Hashtag</Label>
                <Input
                  id="hashtag"
                  value={formData.Hashtag}
                  onChange={(e) => handleInputChange("Hashtag", e.target.value)}
                />
              </div>

              <Button
                onClick={handleGenerateImages}
                className="w-full transition-all duration-300 hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating images...
                  </>
                ) : (
                  "Generate Images"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Generated Images</h3>
            {generatedImages.length > 0 ? (
              <div className="space-y-6">
                {generatedImages.map((imageUrl, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium">Image {index + 1}</h4>
                    <div className="relative overflow-hidden rounded-lg border">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={`Generated image ${index + 1}`}
                        className="w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 right-2 transition-all duration-300 hover:scale-105"
                        onClick={() => handleDownloadImage(imageUrl, index)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Image
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                {loading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                    <p>Generating images...</p>
                  </div>
                ) : (
                  <p>Generated images will appear here</p>
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