export type SkillArea = "conversation" | "vocabulary" | "grammar" | "listening";

export type Weakness = {
  area: SkillArea;
  score: number;
  reason: string;
  nextAction: string;
};

export type Lesson = {
  id: string;
  title: string;
  area: SkillArea;
  level: "easy" | "medium" | "hard";
  duration: string;
  goal: string;
};

export type WordCard = {
  word: string;
  meaning: string;
  example: string;
  nuance: string;
};

export type ConversationMessage = {
  role: "ai" | "user";
  text: string;
};

export type DiagnosisInput = {
  confidence: number;
  speakingMinutes: number;
  grammarMistakes: number;
  missedWords: number;
  listeningDifficulty: number;
};

export type ChallengeChoice = {
  id: string;
  text: string;
  correct?: boolean;
  hint?: string;
};

export type Challenge = {
  id: string;
  type: "choice" | "order" | "listen";
  area: SkillArea;
  prompt: string;
  support: string;
  explanation: string;
  xp: number;
  choices: ChallengeChoice[];
  answer: string[];
};

export type GameLesson = {
  id: string;
  title: string;
  emoji: string;
  area: SkillArea;
  summary: string;
  rewardXp: number;
  difficulty: "easy" | "medium" | "hard";
  challenges: Challenge[];
};
