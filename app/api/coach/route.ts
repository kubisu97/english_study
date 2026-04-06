import { NextResponse } from "next/server";

const fallbackReply = `Nice try. I understood your message, and here is a more natural version:

"I want to get better at everyday English before my working holiday."

Try answering this next:
What kind of job do you want to do when you arrive?`;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    focusArea?: string;
    learnerProfile?: string;
  };

  const apiKey = process.env.OPENAI_API_KEY;
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  if (!apiKey) {
    return NextResponse.json({
      reply: fallbackReply,
      source: "fallback"
    });
  }

  const prompt = `
You are an English speaking coach for a Japanese learner preparing for a working holiday next year.
Your job:
- Keep replies short and supportive.
- Focus on natural everyday English.
- Correct mistakes gently.
- Give one corrected version, one short explanation in Japanese, and one follow-up question in English.
- Tune the conversation toward this focus area: ${body.focusArea ?? "conversation"}.
- Learner profile: ${body.learnerProfile ?? "Wants practical daily English for work, housing, and making friends."}

User message:
${message}
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
      reply: fallbackReply,
      source: "fallback"
    });
  }

  const data = (await response.json()) as {
    output_text?: string;
  };

  return NextResponse.json({
    reply: data.output_text ?? fallbackReply,
    source: "openai"
  });
}
