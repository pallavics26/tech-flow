import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function suggestCardPriority(
  title: string,
  description: string | null
): Promise<{ priority: string; reason: string }> {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const prompt = `You are a task prioritization assistant. Given a task title and description, suggest a priority level.

Task Title: ${title}
Task Description: ${description || "No description provided"}

Respond ONLY with valid JSON in this exact format, no markdown, no extra text:
{"priority": "High" | "Medium" | "Low", "reason": "one short sentence explaining why"}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown code fences if Gemini adds them despite instructions
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!["High", "Medium", "Low"].includes(parsed.priority)) {
      throw new Error("Invalid priority value");
    }
    return parsed;
  } catch (err) {
    throw new Error("Failed to parse AI response");
  }
}