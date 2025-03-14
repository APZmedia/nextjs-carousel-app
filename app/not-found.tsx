import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="container flex max-w-md flex-col items-center justify-center space-y-6 text-center">
        <div className="relative h-40 w-40">
          <div className="absolute inset-0 flex items-center justify-center text-9xl font-bold text-primary/10">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-primary">404</div>
        </div>

        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Page not found</h1>

        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Button asChild size="lg">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}