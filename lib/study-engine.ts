import { DiagnosisInput, SkillArea, Weakness } from "@/lib/types";

const areaLabels: Record<SkillArea, string> = {
  conversation: "英会話",
  vocabulary: "単語",
  grammar: "文法",
  listening: "リスニング"
} as const;

export function buildAdaptiveDiagnosis(input: DiagnosisInput): {
  overallLevel: string;
  nextFocus: Weakness[];
  dailyPlan: string[];
} {
  const weaknesses = [
    {
      area: "conversation",
      score: clamp(100 - input.confidence * 10 - input.speakingMinutes * 2, 25, 95),
      reason:
        input.confidence < 6
          ? "話す自信が低く、英語を口に出す前に止まりやすい。"
          : "会話はできるが、とっさの切り返しで詰まりやすい。",
      nextAction: "30秒で答える口頭練習を毎日3本。"
    },
    {
      area: "vocabulary",
      score: clamp(48 + input.missedWords * 9, 25, 95),
      reason:
        input.missedWords > 4
          ? "必要単語が不足して言い換えに頼りすぎている。"
          : "基礎はあるが場面別語彙がまだ弱い。",
      nextAction: "生活・仕事・手続きの3ジャンルを優先反復。"
    },
    {
      area: "grammar",
      score: clamp(42 + input.grammarMistakes * 11, 25, 95),
      reason:
        input.grammarMistakes > 3
          ? "時制・冠詞・前置詞のミスが意味の明瞭さを落としている。"
          : "意味は通るが細部が崩れて減点されやすい。",
      nextAction: "短文修正ドリルを1日5問。"
    },
    {
      area: "listening",
      score: clamp(30 + input.listeningDifficulty * 12, 25, 95),
      reason:
        input.listeningDifficulty > 4
          ? "相手の速度変化に対応できず、聞き返しが増えやすい。"
          : "要点は聞けるが細かい情報で抜けやすい。",
      nextAction: "1分音声のシャドーイングを毎日。"
    }
  ] satisfies Weakness[];

  const sortedWeaknesses = [...weaknesses].sort((a, b) => b.score - a.score);

  const overall =
    sortedWeaknesses[0].score > 70
      ? "基礎固め期"
      : sortedWeaknesses[0].score > 55
        ? "伸びる直前期"
        : "会話実戦期";

  const dailyPlan = sortedWeaknesses.slice(0, 3).map((weakness, index) => {
    return `${index + 1}. ${areaLabels[weakness.area]}を優先: ${weakness.nextAction}`;
  });

  return {
    overallLevel: overall,
    nextFocus: sortedWeaknesses,
    dailyPlan
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
