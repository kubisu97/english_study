"use client";

import { FormEvent, useEffect, useState } from "react";
import { starterLessons, starterPrompts, starterWeaknesses, starterWords } from "@/lib/mock-data";
import { ConversationMessage, DiagnosisInput, Weakness } from "@/lib/types";

type DiagnosisResponse = {
  overallLevel: string;
  nextFocus: Weakness[];
  dailyPlan: string[];
};

const defaultDiagnosisInputs: DiagnosisInput = {
  confidence: 4,
  speakingMinutes: 6,
  grammarMistakes: 3,
  missedWords: 4,
  listeningDifficulty: 4
};

const storageKey = "english-study-coach-state";

export function StudyDashboard() {
  const [diagnosisInputs, setDiagnosisInputs] = useState(defaultDiagnosisInputs);
  const [weaknesses, setWeaknesses] = useState(starterWeaknesses);
  const [overallLevel, setOverallLevel] = useState("伸びる直前期");
  const [dailyPlan, setDailyPlan] = useState<string[]>([
    "1. 英会話を優先: 30秒スピーキングを3本",
    "2. 単語を優先: 仕事と生活の語彙を反復",
    "3. 文法を優先: 短文修正ドリルを5問"
  ]);
  const [focusArea, setFocusArea] = useState("conversation");
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([
    {
      role: "ai",
      text: "Hi! I’m your coach. Tell me about your plan for the working holiday in simple English."
    }
  ]);
  const [coachLoading, setCoachLoading] = useState(false);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);

    if (!saved) {
      return;
    }

    const parsed = JSON.parse(saved) as {
      diagnosisInputs: DiagnosisInput;
      weaknesses: Weakness[];
      overallLevel: string;
      dailyPlan: string[];
      conversation: ConversationMessage[];
      focusArea: string;
    };

    setDiagnosisInputs(parsed.diagnosisInputs);
    setWeaknesses(parsed.weaknesses);
    setOverallLevel(parsed.overallLevel);
    setDailyPlan(parsed.dailyPlan);
    setConversation(parsed.conversation);
    setFocusArea(parsed.focusArea);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        diagnosisInputs,
        weaknesses,
        overallLevel,
        dailyPlan,
        conversation,
        focusArea
      })
    );
  }, [conversation, dailyPlan, diagnosisInputs, focusArea, overallLevel, weaknesses]);

  async function runDiagnosis() {
    setDiagnosisLoading(true);

    try {
      const response = await fetch("/api/diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(diagnosisInputs)
      });

      const data = (await response.json()) as DiagnosisResponse;
      setWeaknesses(data.nextFocus);
      setOverallLevel(data.overallLevel);
      setDailyPlan(data.dailyPlan);
    } finally {
      setDiagnosisLoading(false);
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    setCoachLoading(true);
    setConversation((current) => [...current, { role: "user", text: trimmedMessage }]);
    setMessage("");

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmedMessage,
          focusArea,
          learnerProfile:
            "Japanese learner preparing for a working holiday next year. Wants practical daily conversation."
        })
      });

      const data = (await response.json()) as { reply: string };

      setConversation((current) => [
        ...current,
        {
          role: "ai",
          text: data.reply
        }
      ]);
    } finally {
      setCoachLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <span className="eyebrow">Working Holiday English Coach</span>
        <div className="hero-grid">
          <div>
            <h1>日常英会話を、最短で話せる自分へ。</h1>
            <p>
              PCでもスマホでも使える、自分専用の英語勉強ソフトです。英会話、単語、文法、弱点分析を1つにまとめて、
              AIが「今のあなたに必要な練習」を毎日出し分けます。
            </p>
            <div className="stats">
              <div className="stat">
                <span className="muted">今の学習フェーズ</span>
                <span className="stat-value">{overallLevel}</span>
              </div>
              <div className="stat">
                <span className="muted">今日の優先テーマ</span>
                <span className="stat-value">
                  {weaknesses[0]?.area === "conversation"
                    ? "英会話"
                    : weaknesses[0]?.area === "vocabulary"
                      ? "単語"
                      : weaknesses[0]?.area === "grammar"
                        ? "文法"
                        : "リスニング"}
                </span>
              </div>
              <div className="stat">
                <span className="muted">想定スタイル</span>
                <span className="stat-value">5-15分学習</span>
              </div>
            </div>
          </div>

          <div className="panel stack">
            <div className="section-title">
              <h2>今日の学習プラン</h2>
              <span className="chip">AIが弱点から再計算</span>
            </div>
            <div className="mini-list">
              {dailyPlan.map((item) => (
                <div className="mini-item" key={item}>
                  {item}
                </div>
              ))}
            </div>
            <div className="chip-row">
              {starterPrompts.map((prompt) => (
                <span className="chip" key={prompt}>
                  {prompt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cards">
        {starterLessons.map((lesson) => (
          <article className="card" key={lesson.id}>
            <span className="lesson-title">{lesson.title}</span>
            <p className="muted">{lesson.goal}</p>
            <div className="lesson-meta">
              <span className="pill">{lesson.area}</span>
              <span className="pill">{lesson.level}</span>
              <span className="pill">{lesson.duration}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="study-grid">
        <div className="panel stack">
          <div className="section-title">
            <h2>弱点診断</h2>
            <button className="button-secondary" onClick={runDiagnosis} type="button">
              {diagnosisLoading ? "分析中..." : "弱点を再分析"}
            </button>
          </div>

          <div className="focus-grid">
            <label className="focus-item">
              <strong>話す自信</strong>
              <input
                className="input"
                max={10}
                min={1}
                type="number"
                value={diagnosisInputs.confidence}
                onChange={(event) =>
                  setDiagnosisInputs((current) => ({
                    ...current,
                    confidence: Number(event.target.value)
                  }))
                }
              />
            </label>

            <label className="focus-item">
              <strong>1日の発話時間(分)</strong>
              <input
                className="input"
                max={60}
                min={0}
                type="number"
                value={diagnosisInputs.speakingMinutes}
                onChange={(event) =>
                  setDiagnosisInputs((current) => ({
                    ...current,
                    speakingMinutes: Number(event.target.value)
                  }))
                }
              />
            </label>

            <label className="focus-item">
              <strong>文法ミス回数</strong>
              <input
                className="input"
                max={10}
                min={0}
                type="number"
                value={diagnosisInputs.grammarMistakes}
                onChange={(event) =>
                  setDiagnosisInputs((current) => ({
                    ...current,
                    grammarMistakes: Number(event.target.value)
                  }))
                }
              />
            </label>

            <label className="focus-item">
              <strong>出てこない単語数</strong>
              <input
                className="input"
                max={10}
                min={0}
                type="number"
                value={diagnosisInputs.missedWords}
                onChange={(event) =>
                  setDiagnosisInputs((current) => ({
                    ...current,
                    missedWords: Number(event.target.value)
                  }))
                }
              />
            </label>

            <label className="focus-item">
              <strong>聞き取りの難しさ</strong>
              <input
                className="input"
                max={10}
                min={1}
                type="number"
                value={diagnosisInputs.listeningDifficulty}
                onChange={(event) =>
                  setDiagnosisInputs((current) => ({
                    ...current,
                    listeningDifficulty: Number(event.target.value)
                  }))
                }
              />
            </label>
          </div>

          <div className="mini-list">
            {weaknesses.map((weakness) => (
              <div className="lesson-card" key={weakness.area}>
                <div className="section-title">
                  <h3>{areaName(weakness.area)}</h3>
                  <span className="tag">要改善度 {weakness.score}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${weakness.score}%` }} />
                </div>
                <p className="muted">{weakness.reason}</p>
                <div className="mini-item">{weakness.nextAction}</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="panel stack">
          <div className="section-title">
            <h2>今日の単語カード</h2>
            <span className="chip">ワーホリ特化</span>
          </div>
          {starterWords.map((word) => (
            <article className="word-card" key={word.word}>
              <div>
                <h4>{word.word}</h4>
                <div className="muted">{word.meaning}</div>
              </div>
              <div className="example">{word.example}</div>
              <div className="muted">{word.nuance}</div>
            </article>
          ))}
        </aside>
      </section>

      <section className="chat-layout">
        <div className="panel stack">
          <div className="section-title">
            <h2>AI英会話コーチ</h2>
            <select
              className="input"
              value={focusArea}
              onChange={(event) => setFocusArea(event.target.value)}
            >
              <option value="conversation">日常英会話</option>
              <option value="vocabulary">単語</option>
              <option value="grammar">文法</option>
              <option value="listening">リスニング</option>
            </select>
          </div>

          <div className="conversation">
            {conversation.map((item, index) => (
              <div className={`chat-bubble ${item.role}`} key={`${item.role}-${index}`}>
                <span className="chat-role">{item.role === "ai" ? "coach" : "you"}</span>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel stack">
          <div className="section-title">
            <h2>話してみる</h2>
            <span className="chip">まずは短文でOK</span>
          </div>
          <form className="stack" onSubmit={sendMessage}>
            <textarea
              className="textarea"
              placeholder="例: I want to improve my English before I go to Australia."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <div className="button-row">
              <button className="button" disabled={coachLoading} type="submit">
                {coachLoading ? "コーチが返信中..." : "AIに送る"}
              </button>
              <button
                className="button-ghost"
                type="button"
                onClick={() =>
                  setMessage("I want to work at cafe and make many foreigner friends.")
                }
              >
                例文を入れる
              </button>
            </div>
          </form>

          <div className="empty">
            OpenAI APIキーが未設定でも、まずはフォールバック返信でUI確認できます。設定すると本物のAI英会話コーチとして動きます。
          </div>
        </div>
      </section>

      <p className="footer-note">
        次の発展案: 音声入力、学習履歴、苦手文法の自動出題、単語の忘却曲線レビュー、週ごとの成長レポート。
      </p>
    </main>
  );
}

function areaName(area: Weakness["area"]) {
  switch (area) {
    case "conversation":
      return "英会話";
    case "vocabulary":
      return "単語";
    case "grammar":
      return "文法";
    case "listening":
      return "リスニング";
    default:
      return area;
  }
}
