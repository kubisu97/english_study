import { NextResponse } from "next/server";
import { buildAdaptiveDiagnosis } from "@/lib/study-engine";
import { DiagnosisInput } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<DiagnosisInput>;

  const input: DiagnosisInput = {
    confidence: Number(body.confidence ?? 5),
    speakingMinutes: Number(body.speakingMinutes ?? 5),
    grammarMistakes: Number(body.grammarMistakes ?? 2),
    missedWords: Number(body.missedWords ?? 2),
    listeningDifficulty: Number(body.listeningDifficulty ?? 3)
  };

  const diagnosis = buildAdaptiveDiagnosis(input);
  return NextResponse.json(diagnosis);
}
