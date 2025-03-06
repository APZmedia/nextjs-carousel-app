// lib/api/comfyui-service.ts

const COMFYUI_API_URL = process.env.COMFYUI_API_URL || "127.0.0.1:8188/";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/** Delay helper */
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Fetch from ComfyUI with retries */
export async function fetchFromComfyUI(endpoint: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<any> {
  try {
    const url = `${COMFYUI_API_URL}/${endpoint}`;
    console.log(`Fetching from ComfyUI: ${url}`);
    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error text available");
      throw new Error(`ComfyUI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`Retrying request to ${endpoint}. Attempts remaining: ${retries}`);
      await delay(RETRY_DELAY);
      return fetchFromComfyUI(endpoint, options, retries - 1);
    }
    throw new Error(`Failed to fetch from ComfyUI: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/** Check if ComfyUI is available */
export async function checkComfyUIStatus(): Promise<boolean> {
  try {
    await fetchFromComfyUI("prompt");
    return true;
  } catch (error) {
    console.error("ComfyUI status check failed:", error);
    return false;
  }
}

/**
 * Convert the workflow nodes array into an object keyed by node ID.
 */
function flattenWorkflow(workflow: any): Record<string, any> {
  const flat: Record<string, any> = {};
  if (!Array.isArray(workflow.nodes)) {
    throw new Error("Invalid workflow format: 'nodes' must be an array.");
  }
  workflow.nodes.forEach((node: any) => {
    // Skip invalid nodes
    if (typeof node !== "object" || node === null) return;
    // Ensure node has a class_type
    node.class_type = node.class_type || node.type || "default";
    // (Optionally convert inputs from array to object)
    if (Array.isArray(node.inputs)) {
      const inputsObj: Record<string, any> = {};
      node.inputs.forEach((inp: any) => {
        if (inp && inp.name) {
          inputsObj[inp.name] = inp;
        }
      });
      node.inputs = inputsObj;
    }
    flat[String(node.id)] = node;
  });
  return flat;
}

/** Queue a workflow in ComfyUI.
 *  - Inserts the user prompt into Node 1’s widget values.
 *  - Flattens the workflow.
 *  - Sends the payload to ComfyUI.
 */
export async function queueWorkflow(workflow: any, inputs: Record<string, any> = {}) {
  if (!(await checkComfyUIStatus())) {
    throw new Error("ComfyUI service is not available. Please check your connection and try again.");
  }
  // Deep copy the workflow to avoid modifying the original
  const clonedWorkflow = JSON.parse(JSON.stringify(workflow));
  if (!Array.isArray(clonedWorkflow.nodes)) {
    throw new Error("Invalid workflow format: 'nodes' must be an array.");
  }
  // Insert the prompt into node with id === 1
  const node1 = clonedWorkflow.nodes.find((n: any) => n.id === 1);
  if (node1 && Array.isArray(node1.widgets_values)) {
    node1.widgets_values[0] = inputs.prompt;
  } else {
    console.warn("Node 1 not found or missing widgets_values.");
  }
  // Flatten the workflow
  const flatWorkflow = flattenWorkflow(clonedWorkflow);
  const payload = { prompt: flatWorkflow };
  console.log("Queueing workflow with payload:", JSON.stringify(payload, null, 2));
  const result = await fetchFromComfyUI("prompt", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!result.prompt_id) {
    throw new Error("Invalid response from ComfyUI: No prompt_id received");
  }
  console.log("Workflow queued successfully with prompt ID:", result.prompt_id);
  return result;
}

/** Get the workflow result from ComfyUI history */
export async function getWorkflowResult(promptId: string): Promise<any> {
  console.log(`Fetching workflow result for prompt ID: ${promptId}`);
  const result = await fetchFromComfyUI(`history/${promptId}`);
  if (!result || typeof result !== "object") {
    throw new Error("Invalid response from ComfyUI: Expected a JSON object.");
  }
  console.log("Workflow result:", JSON.stringify(result, null, 2));
  return result;
}
