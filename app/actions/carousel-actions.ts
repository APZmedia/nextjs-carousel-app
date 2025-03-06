// app/actions/carousel-actions.ts

"use server";

import fs from "fs";
import path from "path";
import { queueWorkflow, getWorkflowResult, checkComfyUIStatus } from "@/lib/api/comfyui-service";

/** Helper function to load a JSON workflow from disk */
function loadWorkflow(filename: string): any {
  try {
    const filePath = path.join(process.cwd(), "lib", "workflows", filename);
    const rawData = fs.readFileSync(filePath, "utf8");
    const workflow = JSON.parse(rawData);
    if (!workflow || !Array.isArray(workflow.nodes)) {
      throw new Error("Invalid workflow file: 'nodes' array is missing.");
    }
    return workflow;
  } catch (error) {
    console.error(`Error loading workflow file ${filename}:`, error);
    throw new Error(`Failed to load workflow file: ${filename}`);
  }
}

/** Minimal error handler */
async function handleApiError(error: unknown, context: string): Promise<never> {
  console.error(`Error in ${context}:`, error);
  if (!(await checkComfyUIStatus())) {
    throw new Error("ComfyUI service is not available. Please check your connection and try again.");
  }
  throw new Error(`Failed to ${context}. Please try again later.`);
}

/**
 * generateTextAnalysis:
 * 1. Loads the workflow ("1-Text Analysis.json").
 * 2. Inserts the user prompt into Node 1.
 * 3. Queues the workflow to ComfyUI.
 * 4. Waits for the result.
 * 5. Extracts the raw output (the widget_values array from Node 4)
 * 6. Returns that array.
 */
export async function generateTextAnalysis(prompt: string): Promise<string[]> {
  try {
    console.log("Generating text analysis with prompt:", prompt);
    if (!(await checkComfyUIStatus())) {
      throw new Error("ComfyUI service is not available. Please check your connection and try again.");
    }
    const workflow = loadWorkflow("1-Text Analysis.json");
    const queueResult = await queueWorkflow(workflow, { prompt });
    const promptId = queueResult.prompt_id;
    console.log("Prompt ID:", promptId);

    // Fetch workflow result from history
    const history = await getWorkflowResult(promptId);

    // In the flattened workflow, we expect Node 4's output under key "4"
    const node4 = history.outputs?.["4"] || history.outputs?.[4];
    if (!node4 || !node4.widgets_values || !Array.isArray(node4.widgets_values)) {
      console.error("Outputs from node 4:", history.outputs);
      throw new Error("No valid output found from node 4");
    }

    console.log("Extracted widget_values from node 4:", JSON.stringify(node4.widgets_values, null, 2));
    // Return the widget_values array as the final dynamic output.
    return node4.widgets_values;
  } catch (error: any) {
    return handleApiError(error, "generate text analysis");
  }
}
