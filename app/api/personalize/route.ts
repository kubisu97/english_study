import { NextResponse } from "next/server";
import { fallbackStudyPack } from "@/lib/mock-data";
import { PersonalizedStudyPack, UserProgress } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userName?: string;
    progress?: UserProgress;
    mode?: "replace" | "append";
    existingPack?: PersonalizedStudyPack;
  };

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      pack: fallbackStudyPack,
      source: "fallback"
    });
  }

  const recentConversation = body.progress?.conversationHistory
    ?.slice(-4)
    .map((item) => `${item.role}: ${item.text}`)
    .join("\n");

  const prompt = `
You are building a personalized English study pack for a Japanese learner preparing for a working holiday.

Learner name: ${body.userName ?? "Learner"}
Vocabulary index: ${body.progress?.vocabularyIndex ?? 0}
Grammar index: ${body.progress?.grammarIndex ?? 0}
Grammar score: ${body.progress?.grammarScore ?? 0}
Recent conversation:
${recentConversation || "No recent conversation."}
Generation mode: ${body.mode ?? "replace"}
Existing vocabulary words:
${body.existingPack?.vocabulary.map((item) => item.word).join(", ") || "None"}
Existing grammar titles:
${body.existingPack?.grammar.map((item) => item.title).join(", ") || "None"}
Existing conversation prompts:
${body.existingPack?.conversationPrompts.join(" | ") || "None"}

Return JSON only with this shape:
{
  "focusSummary": "short Japanese summary",
  "vocabulary": [
    { "id": "slug", "word": "word", "meaning": "Japanese meaning", "sample": "short natural sentence", "tip": "short Japanese tip" }
  ],
  "grammar": [
    {
      "id": "slug",
      "title": "Japanese title",
      "pattern": "short pattern",
      "explanation": "short Japanese explanation",
      "goodExample": "natural example",
      "commonMistake": "wrong example",
      "quizPrompt": "Japanese quiz prompt",
      "quizOptions": ["option1", "option2"],
      "answer": "correct option"
    }
  ],
  "conversationPrompts": ["prompt1", "prompt2", "prompt3"]
}

Rules:
- If mode is replace, generate exactly 12 vocabulary items, 10 grammar items, and 8 conversation prompts.
- If mode is append, generate exactly 8 new vocabulary items, 6 new grammar items, and 5 new conversation prompts.
- Make everything practical for work, housing, or making friends.
- Keep the English simple and realistic.
- Keep Japanese explanations easy to understand.
- Avoid duplicates with existing content.
`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: prompt
    })
  });

  if (!response.ok) {
    return NextResponse.json({
      pack: fallbackStudyPack,
      source: "fallback"
    });
  }

  const data = (await response.json()) as { output_text?: string };

  try {
    const pack = JSON.parse(data.output_text ?? "") as PersonalizedStudyPack;
    return NextResponse.json({
      pack,
      source: "openai"
    });
  } catch {
    return NextResponse.json({
      pack: fallbackStudyPack,
      source: "fallback"
    });
  }
}
