"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

// Mock data for generated images
const mockImages = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  title: `Generated Image ${i + 1}`,
  url: `/placeholder.svg?height=400&width=400&text=Image+${i + 1}`,
  date: new Date(2025, 2, Math.floor(Math.random() * 30) + 1),
}))

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedImage, setSelectedImage] = useState<(typeof mockImages)[0] | null>(null)
  const imagesPerPage = 12

  // Filter images based on search query
  const filteredImages = mockImages.filter((image) => image.title.toLowerCase().includes(searchQuery.toLowerCase()))

  // Calculate pagination
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage)
  const currentImages = filteredImages.slice((currentPage - 1) * imagesPerPage, currentPage * imagesPerPage)

  const handleDownload = (image: (typeof mockImages)[0]) => {
    // In a real app, this would trigger a download
    toast.success("Download started", {
      description: `Downloading ${image.title}`,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-slide-down">
        <h1 className="text-4xl font-bold tracking-tight">Image Library</h1>
        <p className="mt-2 text-lg text-muted-foreground">Browse and download your generated images</p>
      </div>

      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Images</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search images..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1) // Reset to first page on search
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredImages.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentImages.map((image) => (
                  <div
                    key={image.id}
                    className="group relative aspect-square overflow-hidden rounded-lg border cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="mr-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(image)
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No images found in your library</p>
              <p className="text-sm text-muted-foreground mt-2">Create carousels to generate images</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedImage} onOpenChange={(open: any) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="overflow-hidden rounded-lg">
              <img
                src={selectedImage?.url || "/placeholder.svg"}
                alt={selectedImage?.title}
                className="w-full object-contain"
              />
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Created on {selectedImage?.date.toLocaleDateString()}</p>
              <Button onClick={() => selectedImage && handleDownload(selectedImage)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}