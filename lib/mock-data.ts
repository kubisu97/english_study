import { AppUser, GrammarCard, PersonalizedStudyPack, VocabularyCard, Weakness } from "@/lib/types";

export const defaultUsers: AppUser[] = [
  {
    id: "takuro",
    name: "拓郎",
    password: "takuro123"
  },
  {
    id: "kazumi",
    name: "和美",
    password: "kazumi123"
  }
];

export const starterWeaknesses: Weakness[] = [
  {
    area: "conversation",
    score: 76,
    reason: "言いたい内容はあるのに、最初の一言が止まりやすい。",
    nextAction: "短く返す練習を最優先で増やす。"
  },
  {
    area: "grammar",
    score: 63,
    reason: "時制と語順は伝わるが、自然さで崩れやすい。",
    nextAction: "よく使う型を丸ごと覚える。"
  },
  {
    area: "vocabulary",
    score: 58,
    reason: "仕事と生活に直結する語彙がまだ足りない。",
    nextAction: "単語を例文ごと音で覚える。"
  }
];

export const vocabularyDeck: VocabularyCard[] = [
  {
    id: "shift",
    word: "shift",
    meaning: "シフト、勤務時間帯",
    sample: "Can I swap my shift on Friday?",
    tip: "仕事の会話でかなりよく出ます。`work` より具体的です。"
  },
  {
    id: "bond",
    word: "bond",
    meaning: "保証金、敷金",
    sample: "How much is the bond for this room?",
    tip: "部屋探しでよく出るので、`rent` とセットで覚えると強いです。"
  },
  {
    id: "hang-out",
    word: "hang out",
    meaning: "一緒に過ごす、遊ぶ",
    sample: "Do you want to hang out after work?",
    tip: "友達作りで自然に使えるカジュアル表現です。"
  },
  {
    id: "available",
    word: "available",
    meaning: "空いている、対応できる",
    sample: "I’m available on weekends.",
    tip: "仕事・予定・部屋の空き確認まで幅広く使えます。"
  }
];

export const grammarDeck: GrammarCard[] = [
  {
    id: "intro",
    title: "自己紹介の基本形",
    pattern: "I’m ... / I’m from ... / I work as ...",
    explanation: "自己紹介は短い文を3つ並べるだけで十分自然に聞こえます。",
    goodExample: "Hi, I’m Takuro. I’m from Japan, and I’m looking for cafe work.",
    commonMistake: "I from Japan. I want work cafe.",
    quizPrompt: "より自然なのはどっち？",
    quizOptions: [
      "I’m from Japan and I’m looking for cafe work.",
      "I from Japan and I want work cafe."
    ],
    answer: "I’m from Japan and I’m looking for cafe work."
  },
  {
    id: "request",
    title: "お願いするときの型",
    pattern: "Can I ... ? / Could I ... ?",
    explanation: "生活や仕事のお願いは `Can I ... ?` だけでかなり戦えます。",
    goodExample: "Can I use the washing machine now?",
    commonMistake: "I use washing machine now okay?",
    quizPrompt: "洗濯機を使っていいか自然に聞くなら？",
    quizOptions: [
      "Can I use the washing machine now?",
      "I use washing machine now okay?"
    ],
    answer: "Can I use the washing machine now?"
  },
  {
    id: "invite",
    title: "友達を誘うときの型",
    pattern: "Do you want to ... ? / Maybe we can ...",
    explanation: "軽く誘いたいときは `Maybe we can ...` がちょうどいいです。",
    goodExample: "Maybe we can grab dinner after work.",
    commonMistake: "Please go dinner with me now.",
    quizPrompt: "仕事終わりにご飯へ誘うなら？",
    quizOptions: [
      "Maybe we can grab dinner after work.",
      "Please go dinner with me now."
    ],
    answer: "Maybe we can grab dinner after work."
  }
];

export const coachSuggestions = [
  "I want to improve my English for my working holiday.",
  "Can I work at a cafe if my English is not perfect yet?",
  "How can I make friends at work?"
];

export const fallbackStudyPack: PersonalizedStudyPack = {
  focusSummary: "まずは仕事・生活・友達作りに直結する英語を、短く自然に言える状態を目指します。",
  vocabulary: vocabularyDeck,
  grammar: grammarDeck,
  conversationPrompts: coachSuggestions
};

export const speakingHints = [
  "まずは短く1文で答える",
  "知らない単語は簡単な言い換えでOK",
  "止まっても言い直せば大丈夫",
  "完璧さより通じることを優先する"
];
