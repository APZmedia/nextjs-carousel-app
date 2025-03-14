"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Step01 } from "@/components/carousel/step-01"
import Step02 from "@/components/carousel/step-02"
import { Step03 } from "@/components/carousel/step-03"
import type { CarouselData, TextAnalysisData } from "@/types/carousel"

export default function CarouselPage() {
  // Controls the currently active tab
  const [activeTab, setActiveTab] = useState("step01")

  // Each step’s data
  const [textAnalysis, setTextAnalysis] = useState<TextAnalysisData | null>(null)
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  /**
   * Called by step-01 AFTER user generates text analysis.
   * We do NOT immediately switch to step-02 here. We only store the data.
   */
  const handleTextAnalysisGenerated = (data: TextAnalysisData) => {
    setTextAnalysis(data)
    // No setActiveTab("step02") => no auto-jump
  }

  /**
   * Called by step-02 AFTER user generates carousel text, storing it for step-03.
   * We do NOT immediately switch to step-03 here. We only store the data.
   */
  const handleCarouselDataGenerated = (data: CarouselData) => {
    setCarouselData(data)
    // No setActiveTab("step03")
  }

  /**
   * Called by step-03 after generating images
   */
  const handleImagesGenerated = (imageUrls: string[]) => {
    setGeneratedImages(imageUrls)
  }

  /**
   * We define helper functions that step-01 or step-02 can call
   * if they want to programmatically move to the next tab.
   * Because we keep the actual tab triggers disabled (so user can't click them).
   */
  const goToStep02 = () => {
    setActiveTab("step02")
  }

  const goToStep03 = () => {
    setActiveTab("step03")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-slide-down">
        <h1 className="text-4xl font-bold tracking-tight">Carousel Generator</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Create engaging carousels in three simple steps
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
        <TabsList className="grid w-full grid-cols-3">
          {/* Step-01 tab is enabled */}
          <TabsTrigger value="step01">
            Step 1 <span className="hidden md:flex">: Text Analysis</span>
          </TabsTrigger>

          {/* Step-02 tab is ALWAYS disabled => user cannot click it */}
          <TabsTrigger value="step02" disabled>
            Step 2 <span className="hidden md:flex">: Carousel Text</span>
          </TabsTrigger>

          {/* Step-03 tab is ALWAYS disabled => user cannot click it */}
          <TabsTrigger value="step03" disabled>
            Step 3 <span className="hidden md:flex">: Generate Images</span>
          </TabsTrigger>
        </TabsList>

        {/* ------------- STEP 1 CONTENT ------------- */}
        <TabsContent value="step01">
          <Step01
            onTextAnalysisGenerated={handleTextAnalysisGenerated}
            goToStep02={goToStep02}
          />
        </TabsContent>

        {/* ------------- STEP 2 CONTENT ------------- */}
        <TabsContent value="step02">
          <Step02
            textAnalysis={textAnalysis}
            onCarouselDataGenerated={handleCarouselDataGenerated}
            goToStep03={goToStep03}
          />
        </TabsContent>

        {/* ------------- STEP 3 CONTENT ------------- */}
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
