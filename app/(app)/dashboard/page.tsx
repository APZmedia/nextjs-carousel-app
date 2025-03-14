import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Image, Calendar, Library } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-slide-down">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to AI Carousel</h1>
        <p className="mt-2 text-lg text-muted-foreground">Generate beautiful carousels with AI-powered content</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Carousel Generator
            </CardTitle>
            <CardDescription>Create engaging carousels with AI-generated content</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate text analysis, carousel content, and images in three simple steps.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/carousel" className="flex items-center justify-center gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule
            </CardTitle>
            <CardDescription>Plan and schedule your carousel posts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Schedule your carousels for publication and manage your content calendar.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/schedule">View Schedule</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Library className="h-5 w-5 text-primary" />
              Library
            </CardTitle>
            <CardDescription>Browse your generated images</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access and download all your AI-generated images in one place.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/library">Browse Library</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}