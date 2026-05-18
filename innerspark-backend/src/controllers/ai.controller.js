import { groq, GROQ_MODEL } from "../config/groq.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/ApiResponse.js";

const SYSTEM_PROMPT = `You are InnerSpark AI — a compassionate storyteller who writes powerful, emotionally resonant motivational stories.

Your stories:
- Are 250-400 words, written in first person
- Start with a gripping scene or raw emotion — never a cliché opener
- Include a real struggle, a turning point, and a hopeful resolution
- Feel human and authentic, never preachy
- End with a one-line insight that hits deep

Always return a JSON object with: { "title": string, "content": string, "mood": string, "category": string }
Mood must be one of: growth, courage, love, sad, happy, driven
Category must be one of: Success, Mental Health, Discipline, Self Growth, Relationships, Courage, Comeback, Love Stories`;

export const generateStory = asyncHandler(async (req, res) => {
  const { prompt, mood, category } = req.body;
  if (!prompt?.trim()) throw new ApiError(400, "Prompt is required");

  const userMessage = `Write a motivational story based on this feeling/situation: "${prompt}"${mood ? `. The mood should be: ${mood}` : ""}${category ? `. Category: ${category}` : ""}`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.85,
    max_tokens: 800,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new ApiError(500, "AI failed to generate story");

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ApiError(500, "AI returned invalid format");
  }

  res.json(new ApiResponse(200, {
    title: parsed.title,
    content: parsed.content,
    mood: parsed.mood || mood || "growth",
    category: parsed.category || category || "Self Growth",
    tokens_used: completion.usage?.total_tokens || 0,
  }, "Story generated"));
});

export const generateQuote = asyncHandler(async (req, res) => {
  const { mood } = req.query;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: "You generate short, powerful motivational quotes (1-2 sentences). Return JSON: { \"quote\": string, \"author\": string }. Use 'InnerSpark' as author if you made it up." },
      { role: "user", content: `Generate a quote for someone feeling: ${mood || "motivated"}` },
    ],
    temperature: 0.9,
    max_tokens: 100,
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
  res.json(new ApiResponse(200, parsed));
});
