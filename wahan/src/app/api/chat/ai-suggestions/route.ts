
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const geminiUrl = process.env.GEMINI_API_URL!;
const geminiApiKey = process.env.GEMINI_API_KEY!;

export const POST = async (req: NextRequest) => {
  try {
    const { lastMessage, role } = await req.json();

    if (!lastMessage || !role) {
      return NextResponse.json(
        { success: false, message: "lastMessage and role are required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an AI reply suggestion system for a vehicle booking chat app.

Generate short, smart, human-like quick reply suggestions based on:

ROLE: ${role}
RECENT_MESSAGE: ${JSON.stringify(lastMessage)}

Rules:
- Return exactly 3 suggestions.
- Keep each reply between 3 and 12 words.
- Match the conversation context and tone.
- Driver replies should sound professional and helpful.
- User replies should sound natural and realistic.
- Avoid repetition.
- Do not generate irrelevant replies.
- Do not invent any ride details.

Return ONLY valid JSON in this exact format:
{
  "suggestions": [
    "Reply 1",
    "Reply 2",
    "Reply 3"
  ]
}
`;

    const response = await axios.post(
      geminiUrl,
      {
        model: "gemini-3.5-flash-lite",
        input: prompt,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
      }
    );

    // Interactions API response se model output nikaalna
    const outputStep = response.data.steps?.find(
      (step: any) => step.type === "model_output"
    );

    const generatedText = Array.isArray(outputStep?.content)
      ? outputStep.content
          .filter((item: any) => item.type === "text")
          .map((item: any) => item.text)
          .join("\n")
      : typeof outputStep?.content === "string"
        ? outputStep.content
        : "";

    if (!generatedText) {
      console.error("Unexpected Gemini response:", response.data);

      return NextResponse.json(
        { success: false, message: "AI returned an empty response" },
        { status: 502 }
      );
    }

    // Agar model JSON ko markdown code fence mein bhej de
    const cleanedText = generatedText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsedResponse = JSON.parse(cleanedText);

    const suggestions = parsedResponse.suggestions;

    if (
      !Array.isArray(suggestions) ||
      suggestions.length !== 3 ||
      !suggestions.every((item: any) => typeof item === "string")
    ) {
      throw new Error("Invalid suggestions format received from Gemini");
    }

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error: any) {
    console.error(
      "AI Suggestions Error:",
      error.response?.data || error.message
    );

    return NextResponse.json(
      {
        success: false,
        message: "AI suggestions failed",
        error: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
};
