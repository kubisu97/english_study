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
  },
  {
    id: "apply",
    word: "apply",
    meaning: "応募する、申し込む",
    sample: "I’d like to apply for this job.",
    tip: "仕事探しでもビザや手続きでも使いやすい基本単語です。"
  },
  {
    id: "resume",
    word: "resume",
    meaning: "履歴書",
    sample: "Should I bring my resume to the interview?",
    tip: "オーストラリアやNZでは CV と言うことも多いです。"
  },
  {
    id: "interview",
    word: "interview",
    meaning: "面接",
    sample: "I have a job interview tomorrow morning.",
    tip: "仕事探しでは超頻出です。"
  },
  {
    id: "shared-house",
    word: "shared house",
    meaning: "シェアハウス",
    sample: "I’m looking for a shared house near the station.",
    tip: "flat や house share という言い方もあります。"
  },
  {
    id: "chores",
    word: "chores",
    meaning: "家事、当番",
    sample: "How do you divide the chores here?",
    tip: "シェアハウス生活でかなり実用的です。"
  },
  {
    id: "cover",
    word: "cover",
    meaning: "代わりに入る、補う",
    sample: "Can you cover my shift next Tuesday?",
    tip: "シフト交代の会話でよく出ます。"
  },
  {
    id: "friendly",
    word: "friendly",
    meaning: "親しみやすい",
    sample: "Everyone at work has been really friendly.",
    tip: "職場や住まいの雰囲気を話すときに便利です。"
  },
  {
    id: "cashier",
    word: "cashier",
    meaning: "レジ担当",
    sample: "I worked as a cashier at a cafe in Japan.",
    tip: "職歴を説明するときに使えます。"
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
  },
  {
    id: "experience",
    title: "経験を伝える型",
    pattern: "I have worked ... / I have experience in ...",
    explanation: "職歴や経験を話すときにかなり使える型です。",
    goodExample: "I have experience in customer service.",
    commonMistake: "I have customer service experience before.",
    quizPrompt: "接客経験があると自然に言うなら？",
    quizOptions: [
      "I have experience in customer service.",
      "I have customer service experience before."
    ],
    answer: "I have experience in customer service."
  },
  {
    id: "future-plan",
    title: "これからしたいことを言う型",
    pattern: "I’m hoping to ... / I’d like to ...",
    explanation: "希望をやわらかく言うならこの型が便利です。",
    goodExample: "I’m hoping to find part-time work soon.",
    commonMistake: "I hope find part-time job soon.",
    quizPrompt: "近いうちに仕事を見つけたいなら？",
    quizOptions: [
      "I’m hoping to find part-time work soon.",
      "I hope find part-time job soon."
    ],
    answer: "I’m hoping to find part-time work soon."
  },
  {
    id: "clarify",
    title: "聞き返すときの型",
    pattern: "Could you say that again? / What do you mean by ... ?",
    explanation: "分からないときは止まるより、聞き返す方がずっと自然です。",
    goodExample: "Sorry, could you say that again a little more slowly?",
    commonMistake: "Again please slow.",
    quizPrompt: "もう少しゆっくり言ってほしいときは？",
    quizOptions: [
      "Sorry, could you say that again a little more slowly?",
      "Again please slow."
    ],
    answer: "Sorry, could you say that again a little more slowly?"
  },
  {
    id: "preposition-work",
    title: "work の前置詞",
    pattern: "work at / work in / work as",
    explanation: "`at` は場所、`in` は業界、`as` は役割です。",
    goodExample: "I work at a cafe as a cashier.",
    commonMistake: "I work in a cafe as cashier staff.",
    quizPrompt: "一番自然なのはどっち？",
    quizOptions: [
      "I work at a cafe as a cashier.",
      "I work in a cafe as cashier staff."
    ],
    answer: "I work at a cafe as a cashier."
  },
  {
    id: "room-search",
    title: "部屋探しの質問",
    pattern: "Is ... included? / How much is ... ?",
    explanation: "家賃や光熱費の確認はこの型だけでかなりできます。",
    goodExample: "Are bills included in the rent?",
    commonMistake: "Bills include rent?",
    quizPrompt: "光熱費込みか聞くなら？",
    quizOptions: [
      "Are bills included in the rent?",
      "Bills include rent?"
    ],
    answer: "Are bills included in the rent?"
  },
  {
    id: "schedule",
    title: "予定が空いているか聞く型",
    pattern: "Are you free ... ? / Are you available ... ?",
    explanation: "友達を誘ったりシフトを相談したりするときに便利です。",
    goodExample: "Are you available this Saturday afternoon?",
    commonMistake: "You free on Saturday afternoon?",
    quizPrompt: "土曜の午後空いてる？を丁寧に言うなら？",
    quizOptions: [
      "Are you available this Saturday afternoon?",
      "You free on Saturday afternoon?"
    ],
    answer: "Are you available this Saturday afternoon?"
  },
  {
    id: "small-talk",
    title: "会話を広げる型",
    pattern: "How about you? / What about ... ?",
    explanation: "自分の話で終わらせず、相手に返すだけで会話が続きます。",
    goodExample: "I’m from Osaka. How about you?",
    commonMistake: "I’m from Osaka. And you where?",
    quizPrompt: "相手にも聞き返す自然な形は？",
    quizOptions: [
      "I’m from Osaka. How about you?",
      "I’m from Osaka. And you where?"
    ],
    answer: "I’m from Osaka. How about you?"
  }
];

export const coachSuggestions = [
  "I want to improve my English for my working holiday.",
  "Can I work at a cafe if my English is not perfect yet?",
  "How can I make friends at work?",
  "I have customer service experience in Japan.",
  "I’m looking for a shared house near my workplace.",
  "Could you say that again more slowly?",
  "I’d like to apply for this job.",
  "Maybe we can hang out this weekend."
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
