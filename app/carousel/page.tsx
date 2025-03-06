"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Step01 } from "@/components/carousel/step-01"
import { Step02 } from "@/components/carousel/step-02"
import { Step03 } from "@/components/carousel/step-03"
import type { CarouselData, TextAnalysisData } from "@/types/carousel"

export default function CarouselPage() {
  const [activeTab, setActiveTab] = useState("step01")
  const [textAnalysis, setTextAnalysis] = useState<TextAnalysisData | null>(null)
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  const handleTextAnalysisGenerated = (data: TextAnalysisData) => {
    setTextAnalysis(data)
    setActiveTab("step02")
  }

  const handleCarouselDataGenerated = (data: CarouselData) => {
    setCarouselData(data)
    setActiveTab("step03")
  }

  const handleImagesGenerated = (imageUrls: string[]) => {
    setGeneratedImages(imageUrls)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-slide-down">
        <h1 className="text-4xl font-bold tracking-tight">Carousel Generator</h1>
        <p className="mt-2 text-lg text-muted-foreground">Create engaging carousels in three simple steps</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="step01">Step 1: Text Analysis</TabsTrigger>
          <TabsTrigger value="step02" disabled={!textAnalysis}>
            Step 2: Carousel Text
          </TabsTrigger>
          <TabsTrigger value="step03" disabled={!carouselData}>
            Step 3: Generate Images
          </TabsTrigger>
        </TabsList>
        <TabsContent value="step01">
          <Step01 onTextAnalysisGenerated={handleTextAnalysisGenerated} />
        </TabsContent>
        <TabsContent value="step02">
          <Step02 textAnalysis={textAnalysis} onCarouselDataGenerated={handleCarouselDataGenerated} />
        </TabsContent>
        <TabsContent value="step03">
          <Step03
            carouselData={carouselData}
            onImagesGenerated={handleImagesGenerated}
            generatedImages={generatedImages}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

