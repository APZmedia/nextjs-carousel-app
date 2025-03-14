"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, isSameDay } from "date-fns"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock data for carousel posts
const mockCarouselPosts = [
  {
    id: 1,
    title: "Atoms for Peace: Warheads to Watts",
    thumbnail: "/placeholder.svg?height=200&width=200&text=Nuclear",
  },
  { id: 2, title: "The Future of AI in Healthcare", thumbnail: "/placeholder.svg?height=200&width=200&text=AI+Health" },
  {
    id: 3,
    title: "Climate Change: The Tipping Point",
    thumbnail: "/placeholder.svg?height=200&width=200&text=Climate",
  },
  { id: 4, title: "Space Exploration in 2025", thumbnail: "/placeholder.svg?height=200&width=200&text=Space" },
]

// Mock data for scheduled posts
const initialScheduledPosts = [
  {
    id: 1,
    title: "Atoms for Peace: Warheads to Watts",
    date: new Date(2025, 2, 15),
    thumbnail: "/placeholder.svg?height=200&width=200&text=Nuclear",
  },
  {
    id: 2,
    title: "The Future of AI in Healthcare",
    date: new Date(2025, 2, 20),
    thumbnail: "/placeholder.svg?height=200&width=200&text=AI+Health",
  },
]

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedPost, setSelectedPost] = useState<number | null>(null)
  const [scheduledPosts, setScheduledPosts] = useState(initialScheduledPosts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handleSchedulePost = () => {
    if (!selectedPost || !selectedDate) return

    const postToSchedule = mockCarouselPosts.find((post) => post.id === selectedPost)
    if (!postToSchedule) return

    const newScheduledPost = {
      id: postToSchedule.id,
      title: postToSchedule.title,
      date: selectedDate,
      thumbnail: postToSchedule.thumbnail,
    }

    setScheduledPosts([...scheduledPosts, newScheduledPost])
    toast.success("Post scheduled", {
      description: `"${postToSchedule.title}" scheduled for ${format(selectedDate, "PPP")}`,
    })
    setSelectedPost(null)
    setIsDialogOpen(false)
  }

  // Function to get posts for a specific date
  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter((post) => date && post.date && isSameDay(post.date, date))
  }

  // Function to navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  // Function to navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-slide-down">
        <h1 className="text-4xl font-bold tracking-tight">Schedule</h1>
        <p className="mt-2 text-lg text-muted-foreground">Plan and schedule your carousel posts</p>
      </div>

      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Content Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium min-w-[120px] text-center">{format(currentMonth, "MMMM yyyy")}</div>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="custom-calendar">
            {/* Calendar header - Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 42 }, (_, i) => {
                const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
                const startingDayOfWeek = firstDayOfMonth.getDay()
                const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i - startingDayOfWeek + 1)
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
                const isToday = isSameDay(day, new Date())
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const posts = getPostsForDate(day)

                return (
                  <div
                    key={i}
                    className={`
                      relative min-h-[80px] p-1 border rounded-md transition-all
                      ${isCurrentMonth ? "bg-card" : "bg-muted/30 text-muted-foreground"}
                      ${isToday ? "border-primary/50" : "border-border"}
                      ${isSelected ? "ring-2 ring-primary" : ""}
                      ${posts.length > 0 ? "hover:bg-primary/5" : "hover:bg-muted/50"}
                      cursor-pointer
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div
                      className={`
                      text-right text-sm p-1
                      ${isToday ? "font-bold text-primary" : ""}
                    `}
                    >
                      {day.getDate()}
                    </div>

                    {posts.length > 0 && (
                      <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-1">
                        {posts.map((post, index) => (
                          <div key={index} className="w-full" title={post.title}>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full overflow-hidden">
                                <img
                                  src={post.thumbnail || "/placeholder.svg"}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-xs truncate">{post.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected date details */}
          {selectedDate && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{format(selectedDate, "PPPP")}</h3>
                <Button size="sm" className="flex items-center gap-1" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-3 w-3" />
                  <span>Add Post</span>
                </Button>
              </div>

              {getPostsForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getPostsForDate(selectedDate).map((post) => (
                    <div key={post.id} className="flex items-center gap-4 border rounded-lg p-4">
                      <div className="h-16 w-16 overflow-hidden rounded-md shrink-0">
                        <img
                          src={post.thumbnail || "/placeholder.svg"}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{post.title}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setScheduledPosts(
                            scheduledPosts.filter((p) => !(p.id === post.id && isSameDay(p.date, post.date))),
                          )
                          toast.success("Post removed from schedule")
                        }}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground border rounded-lg">
                  <p>No posts scheduled for this date</p>
                </div>
              )}
            </div>
          )}

          {/* Upcoming posts section */}
          <div className="mt-8 space-y-4">
            <h3 className="font-medium">Upcoming Posts</h3>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              {scheduledPosts.length > 0 ? (
                <div className="space-y-4">
                  {scheduledPosts
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map((post) => (
                      <div key={post.id} className="flex items-center gap-4 border rounded-lg p-3">
                        <div className="h-12 w-12 overflow-hidden rounded-md shrink-0">
                          <img
                            src={post.thumbnail || "/placeholder.svg"}
                            alt={post.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{post.title}</h4>
                          <p className="text-xs text-muted-foreground">{format(post.date, "PPP")}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setScheduledPosts(
                              scheduledPosts.filter((p) => !(p.id === post.id && isSameDay(p.date, post.date))),
                            )
                            toast.success("Post removed from schedule")
                          }}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <p>No upcoming posts</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Dialog for selecting a post */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Carousel Post</DialogTitle>
            <DialogDescription>
              Choose a post from your carousel library to schedule for{" "}
              {selectedDate ? format(selectedDate, "PPP") : "the selected date"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {mockCarouselPosts.map((post) => (
              <div
                key={post.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPost === post.id ? "border-primary bg-primary/10" : "hover:border-primary/50"}`}
                onClick={() => setSelectedPost(post.id)}
              >
                <div className="aspect-square w-full overflow-hidden rounded-md mb-2">
                  <img
                    src={post.thumbnail || "/placeholder.svg"}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium truncate">{post.title}</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedulePost} disabled={!selectedPost}>
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}