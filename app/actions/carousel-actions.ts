"use server"

import fs from "fs"
import path from "path"
import { checkComfyUIStatus, queuePrompt, getPromptResult, extractGeneratedContent } from "@/lib/api/comfyui-service"

/** Load the workflow JSON file */
function loadWorkflow(filename = "2-Text Analysis.json"): any {
  try {
    const filePath = path.join(process.cwd(), "lib", "workflows", filename)
    console.log(`Loading workflow from: ${filePath}`)

    if (!fs.existsSync(filePath)) {
      throw new Error(`Workflow file not found: ${filePath}`)
    }

    const workflow = JSON.parse(fs.readFileSync(filePath, "utf8"))
    console.log("Workflow loaded successfully")
    return workflow
  } catch (error) {
    console.error("Error loading workflow:", error)
    throw error
  }
}

/** Generate text analysis using ComfyUI */
export async function generateTextAnalysis(prompt: string): Promise<string[]> {
  console.log("Generating text analysis with prompt:", prompt)

  try {
    // Check if ComfyUI is available
    if (!(await checkComfyUIStatus())) {
      throw new Error("ComfyUI service is not available. Please check your connection and try again.")
    }

    // Load the workflow
    const workflow = loadWorkflow()
    console.log("Workflow loaded")

    // Queue the prompt
    console.log("Queueing prompt...")
    const queueResult = await queuePrompt(workflow, { prompt })
    console.log("Queue result:", queueResult)

    // Wait a moment to ensure the workflow has time to process
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Get the result
    console.log("Fetching result...")
    const result = await getPromptResult(queueResult.prompt_id)

    // Log the raw result for debugging
    console.log("Raw result structure:", JSON.stringify(result, null, 2))

    // Extract the generated content
    try {
      const content = extractGeneratedContent(result)
      console.log("Extracted content:", content)

      // Return the content as an array with a single item
      return [content]
    } catch (extractError: any) {
      console.error("Error extracting content:", extractError)

      // If extraction fails, return the error message and raw result
      return [`Error extracting content: ${extractError.message}`, `Raw result: ${JSON.stringify(result, null, 2)}`]
    }
  } catch (error: any) {
    console.error("Error in generateTextAnalysis:", error)
    return [`Error: ${error.message}`]
  }
}

