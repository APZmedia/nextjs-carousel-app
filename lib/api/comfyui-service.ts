// lib/api/comfyui-service.ts

// Fix the URL format to include http:// protocol
const COMFYUI_API_URL = process.env.COMFYUI_API_URL?.startsWith("http")
  ? process.env.COMFYUI_API_URL
  : `http://${process.env.COMFYUI_API_URL || "127.0.0.1:8188"}`

// Enable debug mode for verbose logging
const DEBUG_MODE = true

/** Delay helper */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Log helper that only logs in debug mode */
function debugLog(...args: any[]) {
  if (DEBUG_MODE) {
    console.log(...args)
  }
}

/** Fetch from ComfyUI */
export async function fetchFromComfyUI(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.substring(1) : endpoint
    const url = `${COMFYUI_API_URL}/${cleanEndpoint}`
    debugLog(`Fetching from ComfyUI: ${url}`)

    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error text available")
      throw new Error(`ComfyUI API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return await response.json()
  } catch (error: any) {
    console.error("Error fetching from ComfyUI:", error)
    throw error
  }
}

/** Check if ComfyUI is available */
export async function checkComfyUIStatus(): Promise<boolean> {
  try {
    // Use system_stats endpoint for status check
    await fetchFromComfyUI("system_stats")
    return true
  } catch (error) {
    console.error("ComfyUI status check failed:", error)
    return false
  }
}

/**
 * Convert the workflow nodes array into an object keyed by node ID.
 * This handles the Impact Pack issue by ensuring proper object structure.
 */
function flattenWorkflow(workflow: any): Record<string, any> {
  const flat: Record<string, any> = {}

  if (!Array.isArray(workflow.nodes)) {
    throw new Error("Invalid workflow format: 'nodes' must be an array.")
  }

  workflow.nodes.forEach((node: any) => {
    // Skip invalid nodes
    if (typeof node !== "object" || node === null) return

    // Create a clean copy of the node to avoid reference issues
    const cleanNode = { ...node }

    // Ensure node has a class_type
    cleanNode.class_type = cleanNode.class_type || cleanNode.type || "default"

    // Fix potential issues with Impact Pack nodes
    if (cleanNode.inputs) {
      // Ensure inputs is an object, not an array
      if (Array.isArray(cleanNode.inputs)) {
        const inputsObj: Record<string, any> = {}
        cleanNode.inputs.forEach((input: any, index: number) => {
          if (typeof input === "object" && input !== null) {
            inputsObj[input.name || `input_${index}`] = input.value || input
          }
        })
        cleanNode.inputs = inputsObj
      }
    }

    flat[String(node.id)] = cleanNode
  })

  return flat
}

/** Queue a workflow in ComfyUI */
export async function queuePrompt(workflow: any, inputs: Record<string, any> = {}): Promise<any> {
  debugLog("Queueing workflow with inputs:", inputs)

  // Create a deep copy of the workflow to avoid modifying the original
  const workflowCopy = JSON.parse(JSON.stringify(workflow))

  // Insert the prompt into node 1's String input
  if (workflowCopy["1"] && workflowCopy["1"].inputs) {
    workflowCopy["1"].inputs.String = inputs.prompt
  }

  debugLog("Modified workflow:", JSON.stringify(workflowCopy, null, 2))

  const result = await fetchFromComfyUI("prompt", {
    method: "POST",
    body: JSON.stringify({ prompt: workflowCopy }),
  })

  if (!result.prompt_id) {
    throw new Error("Invalid response from ComfyUI: No prompt_id received")
  }

  debugLog("Queued successfully with prompt ID:", result.prompt_id)
  return result
}

/** Get the workflow result from ComfyUI history */
export async function getPromptResult(promptId: string, maxRetries = 5): Promise<any> {
  debugLog(`Fetching result for prompt ID: ${promptId}`)

  // Add retries since the history endpoint might not be immediately available
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fetchFromComfyUI(`history/${promptId}`)
      debugLog(`History result (attempt ${i + 1}):`, JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      if (i === maxRetries - 1) throw error
      debugLog(`Retry ${i + 1}/${maxRetries} after error:`, error)
      await delay(1000) // Wait 1 second between retries
    }
  }

  throw new Error(`Failed to get result after ${maxRetries} attempts`)
}

/** Extract the generated content from the ComfyUI result */
export function extractGeneratedContent(result: any): string {
  debugLog("Extracting content from result:", JSON.stringify(result, null, 2))

  // First, check if we have a valid result object
  if (!result) {
    throw new Error("Result is null or undefined")
  }

  // Try to find the output in various locations
  let content = null

  // Check if we have node 4 with STRING property (direct format)
  if (result["4"] && result["4"].inputs && result["4"].inputs.STRING) {
    content = result["4"].inputs.STRING
  }
  // Check if we have node 4 in outputs
  else if (result.outputs && result.outputs["4"]) {
    const node4 = result.outputs["4"]
    content = node4.inputs?.STRING || (Array.isArray(node4.widgets_values) ? node4.widgets_values[0] : null)
  }
  // Check if we have a nested structure
  else if (result.prompt && result.prompt.outputs && result.prompt.outputs["4"]) {
    const node4 = result.prompt.outputs["4"]
    content = node4.inputs?.STRING || (Array.isArray(node4.widgets_values) ? node4.widgets_values[0] : null)
  }
  // Check if we have a direct text property
  else if (typeof result.text === "string") {
    content = result.text
  }

  // If we still don't have content, look for any node with a STRING property
  if (!content) {
    // Look through all nodes in the result
    for (const key in result) {
      const node = result[key]
      if (node && node.inputs && node.inputs.STRING) {
        content = node.inputs.STRING
        break
      }
      if (node && Array.isArray(node.widgets_values) && node.widgets_values.length > 0) {
        content = node.widgets_values[0]
        break
      }
    }
  }

  // If we still don't have content, check if the result itself is a string
  if (!content && typeof result === "string") {
    content = result
  }

  // If we still don't have content, return a fallback message with the raw result
  if (!content) {
    debugLog("Could not extract content from result")
    return "**Could not extract content from ComfyUI result**\n\nRaw result: " + JSON.stringify(result, null, 2)
  }

  return content
}

