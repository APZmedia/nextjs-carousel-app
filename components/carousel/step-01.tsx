"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { generateTextAnalysis } from "@/app/actions/carousel-actions";
import { toast } from "sonner";

interface Step01Props {
  onTextAnalysisGenerated: (data: string[]) => void;
}

export function Step01({ onTextAnalysisGenerated }: Step01Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string[] | null>(null);

  const handleGenerateContent = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      // Generate text analysis and receive an array of dynamic data
      const data = await generateTextAnalysis(prompt);
      setResult(data);
      onTextAnalysisGenerated(data);
      toast.success("Text analysis generated", {
        description: "Your text has been successfully analyzed.",
      });
    } catch (error) {
      console.error("Error generating text analysis:", error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to generate text analysis",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Input</h3>
            <Textarea
              placeholder="Paste your article, news, or any text content here..."
              className="min-h-[300px] resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button
              onClick={handleGenerateContent}
              className="mt-4 w-full transition-all duration-300 hover:scale-[1.02]"
              disabled={loading || !prompt.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating content...
                </>
              ) : (
                "Generate content"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Output</h3>
            {result ? (
              <div className="space-y-2 overflow-y-auto max-h-[500px] pr-2">
                {result.map((line, index) => (
                  <p key={index} className="whitespace-pre-wrap break-words">
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                {loading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                    <p>Analyzing text...</p>
                  </div>
                ) : (
                  <p>Generated content will appear here</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

