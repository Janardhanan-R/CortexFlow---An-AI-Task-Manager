import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractJson, LLM_SYSTEM_PROMPT } from "./planner";

export async function getStructuredPlanFromGemini(inputText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY in .env");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const fullPrompt = `${LLM_SYSTEM_PROMPT}\n\nInput:\n${inputText}`;
  const candidateModels = await getGenerateContentModels(apiKey);
  if (candidateModels.length === 0) {
    throw new Error(
      "No Gemini models available for generateContent. Check API key/project permissions.",
    );
  }

  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(fullPrompt);
      const raw = response.response.text();
      const jsonText = extractJson(raw);
      return JSON.parse(jsonText);
    } catch (err) {
      lastError = err;
      console.warn(`[DEBUG] Gemini model failed: ${modelName}`, err);
    }
  }

  throw new Error(
    `All configured Gemini models failed. Last error: ${lastError?.message || "Unknown error"}`,
  );
}

export async function explainWorkflowFromGemini(planSummaryText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY in .env");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = `You are a project planning coach. Explain the workflow below in plain language.

Rules:
* Use simple steps and short sentences.
* Human-readable only — do not repeat raw JSON.
* Cover: what happens first, what can run in parallel, and why the critical path matters.
* At most 6 short bullet points if you use bullets; otherwise use short paragraphs.

Plan data:
${planSummaryText}`;

  const candidateModels = await getGenerateContentModels(apiKey);
  if (candidateModels.length === 0) {
    throw new Error("No Gemini models available for generateContent.");
  }

  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return text.trim();
    } catch (err) {
      lastError = err;
      console.warn(`[DEBUG] Explain plan failed: ${modelName}`, err);
    }
  }

  throw new Error(lastError?.message || "Could not explain plan.");
}

export async function improvePlanFromGemini(planJsonText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY in .env");

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = `You are a senior project manager. Analyze this workflow JSON and suggest improvements.

Return plain text (no JSON) with short sections:
1) Missing tasks or gaps
2) Ordering / dependency improvements  
3) Quick wins

Keep under 250 words.

Workflow:
${planJsonText}`;

  const candidateModels = await getGenerateContentModels(apiKey);
  if (candidateModels.length === 0) {
    throw new Error("No Gemini models available for generateContent.");
  }
  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);
      return response.response.text().trim();
    } catch (err) {
      lastError = err;
      console.warn(`[DEBUG] Improve plan failed: ${modelName}`, err);
    }
  }
  throw new Error(lastError?.message || "Could not improve plan.");
}

export async function planChatFromGemini(question, contextText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY in .env");

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = `You are a planning assistant for the CortexFlow app. Answer briefly using the workflow context. If unsure, say so.

Context:
${contextText}

Question: ${question}`;

  const candidateModels = await getGenerateContentModels(apiKey);
  if (candidateModels.length === 0) {
    throw new Error("No Gemini models available for generateContent.");
  }
  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);
      return response.response.text().trim();
    } catch (err) {
      lastError = err;
      console.warn(`[DEBUG] Plan chat failed: ${modelName}`, err);
    }
  }
  throw new Error(lastError?.message || "Could not answer.");
}

async function getGenerateContentModels(apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`Failed to list models (${res.status}).`);
  }

  const data = await res.json();
  const models = Array.isArray(data.models) ? data.models : [];
  const allowed = models
    .filter((model) => Array.isArray(model.supportedGenerationMethods))
    .filter((model) => model.supportedGenerationMethods.includes("generateContent"))
    .map((model) => (model.name || "").replace(/^models\//, ""))
    .filter(Boolean)
    .filter((name) => name.startsWith("gemini"));

  // Prefer flash variants first for latency/cost.
  const flash = allowed.filter((name) => name.includes("flash"));
  const others = allowed.filter((name) => !name.includes("flash"));
  const ordered = [...flash, ...others];

  return ordered;
}
