import { Lesson, Weakness, WordCard } from "@/lib/types";

export const starterWeaknesses: Weakness[] = [
  {
    area: "conversation",
    score: 42,
    reason: "言いたい内容はあるのに、英語に変えるまでに時間がかかる。",
    nextAction: "毎日3分のロールプレイで反応速度を上げる。"
  },
  {
    area: "vocabulary",
    score: 55,
    reason: "生活・接客・シェアハウス関連の単語が不足している。",
    nextAction: "ワーホリ場面に絞った単語セットを反復する。"
  },
  {
    area: "grammar",
    score: 61,
    reason: "時制は通じるが、冠詞と前置詞で崩れやすい。",
    nextAction: "短文の言い換え練習でパターン定着を狙う。"
  }
];

export const starterLessons: Lesson[] = [
  {
    id: "lesson-1",
    title: "シェアハウス初日の自己紹介",
    area: "conversation",
    level: "easy",
    duration: "8分",
    goal: "名前・出身・仕事・趣味を自然に言える"
  },
  {
    id: "lesson-2",
    title: "カフェで働くときの定番フレーズ",
    area: "vocabulary",
    level: "medium",
    duration: "12分",
    goal: "注文確認・おすすめ・聞き返しができる"
  },
  {
    id: "lesson-3",
    title: "過去形と現在完了を会話で使い分ける",
    area: "grammar",
    level: "medium",
    duration: "10分",
    goal: "経験と完了を混ぜずに話せる"
  }
];

export const starterWords: WordCard[] = [
  {
    word: "available",
    meaning: "空いている、対応可能な",
    example: "Are you available to work on Saturday?",
    nuance: "シフト、予定、部屋の空きなど幅広く使える。"
  },
  {
    word: "rent",
    meaning: "家賃",
    example: "How much is the weekly rent for this room?",
    nuance: "ワーホリの部屋探しで頻出。"
  },
  {
    word: "pick up",
    meaning: "受け取る、迎えに行く、習得する",
    example: "I picked up some useful phrases from my coworkers.",
    nuance: "文脈で意味が変わるので会話で慣れる価値が高い。"
  }
];

export const starterPrompts = [
  "空港でSIMカードについて質問する",
  "新しい職場で自己紹介する",
  "シェアハウスでルールを確認する"
];
