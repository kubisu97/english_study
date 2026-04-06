import { GameLesson, Weakness, WordCard } from "@/lib/types";

export const starterWeaknesses: Weakness[] = [
  {
    area: "conversation",
    score: 76,
    reason: "言いたいことは浮かぶけど、最初の一文がすぐ出ない。",
    nextAction: "短い自己紹介と質問返しをテンポよく練習する。"
  },
  {
    area: "grammar",
    score: 68,
    reason: "時制と語順は通じるが、冠詞と前置詞で止まりやすい。",
    nextAction: "会話でよく使う短文を並び替えで定着させる。"
  },
  {
    area: "vocabulary",
    score: 57,
    reason: "仕事・家探し・友達作りの単語がまだ少ない。",
    nextAction: "場面ごとの頻出単語を音とセットで覚える。"
  }
];

export const starterWords: WordCard[] = [
  {
    word: "shift",
    meaning: "シフト、勤務時間帯",
    example: "Can I swap my shift on Friday?",
    nuance: "ワーホリでアルバイトをするとかなり高頻度で出る。"
  },
  {
    word: "bond",
    meaning: "保証金、敷金",
    example: "Do I need to pay the bond before moving in?",
    nuance: "部屋探しでよく出る実用単語。"
  },
  {
    word: "hang out",
    meaning: "遊ぶ、一緒に過ごす",
    example: "Do you want to hang out after work?",
    nuance: "友達作りで自然に使いやすい。"
  }
];

export const starterPrompts = [
  "カフェで初出勤の日に自己紹介する",
  "シェアハウスで洗濯ルールを確認する",
  "休みの日に友達を遊びへ誘う"
];

export const gameLessons: GameLesson[] = [
  {
    id: "lesson-intro",
    title: "はじめての自己紹介",
    emoji: "1",
    area: "conversation",
    summary: "ワーホリ初日に自然な自己紹介を言えるようになる。",
    rewardXp: 30,
    difficulty: "easy",
    challenges: [
      {
        id: "intro-choice",
        type: "choice",
        area: "conversation",
        prompt: "職場での最初の一言として、一番自然なのはどれ？",
        support: "場面: 新しいカフェのスタッフルームに入った瞬間",
        explanation: "あいさつ + 名前 + はじめまして の流れがいちばん自然です。",
        xp: 10,
        choices: [
          { id: "a", text: "Hello, I am want work today.", hint: "文法が少し不自然。" },
          { id: "b", text: "Hi, I’m Yuki. Nice to meet you all!", correct: true },
          { id: "c", text: "My hobby is music and coffee.", hint: "いきなり趣味は少し飛びます。" }
        ],
        answer: ["b"]
      },
      {
        id: "intro-order",
        type: "order",
        area: "grammar",
        prompt: "単語を自然な順番に並べよう",
        support: "I / from / am / Japan / originally",
        explanation: "`I’m originally from Japan.` の語順で覚えると自己紹介でそのまま使えます。",
        xp: 10,
        choices: [
          { id: "i", text: "I’m" },
          { id: "originally", text: "originally" },
          { id: "from", text: "from" },
          { id: "japan", text: "Japan" }
        ],
        answer: ["I’m", "originally", "from", "Japan"]
      },
      {
        id: "intro-listen",
        type: "listen",
        area: "listening",
        prompt: "相手にこう聞かれたら、意味はどれ？",
        support: "What kind of work are you hoping to do here?",
        explanation: "`What kind of work` は『どんな仕事』をやりたいかを聞く定番表現です。",
        xp: 10,
        choices: [
          { id: "a", text: "ここでどんな仕事をしたいの？", correct: true },
          { id: "b", text: "今日は何時まで働くの？" },
          { id: "c", text: "前の仕事は何だったの？" }
        ],
        answer: ["a"]
      }
    ]
  },
  {
    id: "lesson-house",
    title: "シェアハウス会話",
    emoji: "2",
    area: "vocabulary",
    summary: "生活ルールを確認するための単語と質問を覚える。",
    rewardXp: 35,
    difficulty: "medium",
    challenges: [
      {
        id: "house-choice",
        type: "choice",
        area: "vocabulary",
        prompt: "洗濯ルールを聞くときに自然なのはどれ？",
        support: "場面: シェアハウス初日",
        explanation: "`How does ... work here?` はルールを聞くのに便利です。",
        xp: 12,
        choices: [
          { id: "a", text: "How does laundry work here?", correct: true },
          { id: "b", text: "Where laundry is rule?" },
          { id: "c", text: "I laundry tonight okay?" }
        ],
        answer: ["a"]
      },
      {
        id: "house-order",
        type: "order",
        area: "grammar",
        prompt: "自然な質問に並べよう",
        support: "use / Can / machine / washing / I / the / now ?",
        explanation: "`Can I use the washing machine now?` はそのまま実戦で使えます。",
        xp: 11,
        choices: [
          { id: "can", text: "Can" },
          { id: "i", text: "I" },
          { id: "use", text: "use" },
          { id: "the", text: "the" },
          { id: "washing", text: "washing" },
          { id: "machine", text: "machine" },
          { id: "now", text: "now?" }
        ],
        answer: ["Can", "I", "use", "the", "washing", "machine", "now?"]
      },
      {
        id: "house-listen",
        type: "listen",
        area: "listening",
        prompt: "この返答の意味として一番近いものを選ぼう",
        support: "Yeah, just avoid using it after ten.",
        explanation: "`avoid using it after ten` は『10時以降は使わないで』という意味です。",
        xp: 12,
        choices: [
          { id: "a", text: "10時までは絶対使えないよ" },
          { id: "b", text: "うん、ただ10時以降は使わないでね", correct: true },
          { id: "c", text: "10分だけなら使っていいよ" }
        ],
        answer: ["b"]
      }
    ]
  },
  {
    id: "lesson-friends",
    title: "友達を誘う英語",
    emoji: "3",
    area: "conversation",
    summary: "堅すぎず軽すぎない、自然な誘い方を身につける。",
    rewardXp: 40,
    difficulty: "medium",
    challenges: [
      {
        id: "friend-choice",
        type: "choice",
        area: "conversation",
        prompt: "仕事終わりに友達を誘う自然な一言はどれ？",
        support: "場面: 同僚と仲良くなってきたタイミング",
        explanation: "`Do you want to ...` や `Would you like to ...` は定番です。",
        xp: 14,
        choices: [
          { id: "a", text: "Do you want to grab dinner after work?", correct: true },
          { id: "b", text: "You eat with me after working?" },
          { id: "c", text: "Please go dinner now." }
        ],
        answer: ["a"]
      },
      {
        id: "friend-order",
        type: "order",
        area: "grammar",
        prompt: "自然な誘い文を作ろう",
        support: "hang out / this weekend / Maybe / we can",
        explanation: "`Maybe we can hang out this weekend.` は柔らかい誘い方です。",
        xp: 13,
        choices: [
          { id: "maybe", text: "Maybe" },
          { id: "we", text: "we" },
          { id: "can", text: "can" },
          { id: "hang", text: "hang out" },
          { id: "weekend", text: "this weekend." }
        ],
        answer: ["Maybe", "we", "can", "hang out", "this weekend."]
      },
      {
        id: "friend-listen",
        type: "listen",
        area: "listening",
        prompt: "相手の返事として一番近い意味は？",
        support: "I’m keen, but I finish pretty late tonight.",
        explanation: "`I’m keen` はオーストラリア英語圏で『いいね、乗り気だよ』の感じで使われます。",
        xp: 13,
        choices: [
          { id: "a", text: "行きたくないけど今夜は暇だよ" },
          { id: "b", text: "いいね、でも今夜は終わるのが遅いんだ", correct: true },
          { id: "c", text: "たぶん行けるけど朝が早いよ" }
        ],
        answer: ["b"]
      }
    ]
  }
];
