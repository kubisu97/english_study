"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { gameLessons, starterPrompts, starterWeaknesses, starterWords } from "@/lib/mock-data";
import { Challenge, ConversationMessage, GameLesson, Weakness } from "@/lib/types";

type Mode = "path" | "sprint" | "coach";

const storageKey = "english-study-coach-game-state";

export function StudyDashboard() {
  const [mode, setMode] = useState<Mode>("path");
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [xp, setXp] = useState(120);
  const [streak, setStreak] = useState(4);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [typedOrder, setTypedOrder] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "correct" | "incorrect"; text: string } | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [weaknesses] = useState<Weakness[]>(starterWeaknesses);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([
    {
      role: "ai",
      text: "Hi! Let's keep it simple. Tell me one thing you want to do during your working holiday."
    }
  ]);
  const [coachLoading, setCoachLoading] = useState(false);

  const currentLesson = gameLessons[currentLessonIndex];
  const currentChallenge = currentLesson.challenges[currentChallengeIndex];

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);

    if (!saved) {
      return;
    }

    const parsed = JSON.parse(saved) as {
      mode: Mode;
      currentLessonIndex: number;
      currentChallengeIndex: number;
      hearts: number;
      xp: number;
      streak: number;
      completedLessons: string[];
      conversation: ConversationMessage[];
    };

    setMode(parsed.mode);
    setCurrentLessonIndex(parsed.currentLessonIndex);
    setCurrentChallengeIndex(parsed.currentChallengeIndex);
    setHearts(parsed.hearts);
    setXp(parsed.xp);
    setStreak(parsed.streak);
    setCompletedLessons(parsed.completedLessons);
    setConversation(parsed.conversation);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        mode,
        currentLessonIndex,
        currentChallengeIndex,
        hearts,
        xp,
        streak,
        completedLessons,
        conversation
      })
    );
  }, [completedLessons, conversation, currentChallengeIndex, currentLessonIndex, hearts, mode, streak, xp]);

  const progressPercent = useMemo(() => {
    return ((currentChallengeIndex + 1) / currentLesson.challenges.length) * 100;
  }, [currentChallengeIndex, currentLesson.challenges.length]);

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
          focusArea: "conversation",
          learnerProfile:
            "Japanese learner preparing for a working holiday next year. Wants practical daily conversation with easy explanations."
        })
      });

      const data = (await response.json()) as { reply: string };
      setConversation((current) => [...current, { role: "ai", text: data.reply }]);
    } finally {
      setCoachLoading(false);
    }
  }

  function startLesson(index: number) {
    setMode("sprint");
    setCurrentLessonIndex(index);
    setCurrentChallengeIndex(0);
    setSelectedChoice(null);
    setTypedOrder("");
    setFeedback(null);
  }

  function checkAnswer(challenge: Challenge) {
    const isCorrect =
      challenge.type === "order"
        ? normalizeAnswer(typedOrder) === normalizeAnswer(challenge.answer.join(" "))
        : selectedChoice !== null && challenge.answer.includes(selectedChoice);

    if (isCorrect) {
      setFeedback({ kind: "correct", text: challenge.explanation });
      setXp((current) => current + challenge.xp);
      return;
    }

    setHearts((current) => Math.max(0, current - 1));
    setFeedback({
      kind: "incorrect",
      text:
        challenge.type === "order"
          ? `正解は "${challenge.answer.join(" ")}" です。${challenge.explanation}`
          : `正解を見ながらでも大丈夫。${challenge.explanation}`
    });
  }

  function nextChallenge() {
    if (currentChallengeIndex < currentLesson.challenges.length - 1) {
      setCurrentChallengeIndex((current) => current + 1);
      resetChallengeUi();
      return;
    }

    if (!completedLessons.includes(currentLesson.id)) {
      setCompletedLessons((current) => [...current, currentLesson.id]);
      setXp((current) => current + currentLesson.rewardXp);
      setStreak((current) => current + 1);
    }

    setMode("path");
    resetChallengeUi();
  }

  function resetChallengeUi() {
    setSelectedChoice(null);
    setTypedOrder("");
    setFeedback(null);
  }

  return (
    <main className="game-shell">
      <section className="topbar">
        <div>
          <span className="brand-badge">English Quest</span>
          <h1>ゲーム感覚で、日常英会話を身につける。</h1>
          <p>
            ブラウザで開いたらすぐ始められる、ワーホリ向け英語トレーニングです。単語、文法、リスニング、会話を
            1問ずつ直感的に進めます。
          </p>
        </div>

        <div className="scoreboard">
          <div className="score-pill">
            <span>Streak</span>
            <strong>{streak} days</strong>
          </div>
          <div className="score-pill">
            <span>XP</span>
            <strong>{xp}</strong>
          </div>
          <div className="score-pill heart">
            <span>Hearts</span>
            <strong>{hearts}/5</strong>
          </div>
        </div>
      </section>

      <nav className="mode-tabs" aria-label="study modes">
        <button className={mode === "path" ? "tab active" : "tab"} onClick={() => setMode("path")} type="button">
          学習ルート
        </button>
        <button className={mode === "sprint" ? "tab active" : "tab"} onClick={() => setMode("sprint")} type="button">
          今のレッスン
        </button>
        <button className={mode === "coach" ? "tab active" : "tab"} onClick={() => setMode("coach")} type="button">
          AIコーチ
        </button>
      </nav>

      {mode === "path" ? (
        <section className="route-layout">
          <div className="panel hero-panel">
            <div className="section-head">
              <div>
                <span className="tiny-label">Today&apos;s Mission</span>
                <h2>{areaName(weaknesses[0].area)}を優先して進めよう</h2>
              </div>
              <button className="primary-button" onClick={() => startLesson(currentLessonIndex)} type="button">
                今すぐスタート
              </button>
            </div>
            <div className="mission-strip">
              <div className="mission-card strong">
                <span className="mission-kicker">最優先</span>
                <strong>{weaknesses[0].reason}</strong>
                <p>{weaknesses[0].nextAction}</p>
              </div>
              <div className="mission-card">
                <span className="mission-kicker">今日の単語</span>
                <strong>{starterWords[0].word}</strong>
                <p>{starterWords[0].meaning}</p>
              </div>
              <div className="mission-card">
                <span className="mission-kicker">会話テーマ</span>
                <strong>{starterPrompts[0]}</strong>
                <p>まずは短い1文で返せればOKです。</p>
              </div>
            </div>
          </div>

          <div className="lesson-map">
            {gameLessons.map((lesson, index) => {
              const completed = completedLessons.includes(lesson.id);
              const active = index === currentLessonIndex;

              return (
                <article className={active ? "lesson-node active" : "lesson-node"} key={lesson.id}>
                  <div className="node-index">{lesson.emoji}</div>
                  <div className="node-body">
                    <div className="node-topline">
                      <span className="node-area">{areaName(lesson.area)}</span>
                      <span className={completed ? "node-status clear" : "node-status"}>
                        {completed ? "Clear" : `+${lesson.rewardXp} XP`}
                      </span>
                    </div>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.summary}</p>
                    <div className="button-row">
                      <button className="secondary-button" onClick={() => startLesson(index)} type="button">
                        レッスン開始
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="side-stack">
            <aside className="panel">
              <div className="section-head compact">
                <div>
                  <span className="tiny-label">Weak Points</span>
                  <h2>あなたの苦手</h2>
                </div>
              </div>
              <div className="weak-list">
                {weaknesses.map((weakness) => (
                  <div className="weak-card" key={weakness.area}>
                    <div className="weak-line">
                      <strong>{areaName(weakness.area)}</strong>
                      <span>{weakness.score}</span>
                    </div>
                    <div className="meter">
                      <div className="meter-fill" style={{ width: `${weakness.score}%` }} />
                    </div>
                    <p>{weakness.reason}</p>
                  </div>
                ))}
              </div>
            </aside>

            <aside className="panel">
              <div className="section-head compact">
                <div>
                  <span className="tiny-label">Word Boost</span>
                  <h2>すぐ使える単語</h2>
                </div>
              </div>
              <div className="word-stack">
                {starterWords.map((word) => (
                  <div className="word-tile" key={word.word}>
                    <strong>{word.word}</strong>
                    <span>{word.meaning}</span>
                    <p>{word.example}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      ) : null}

      {mode === "sprint" ? (
        <section className="challenge-layout">
          <div className="challenge-main panel">
            <div className="challenge-head">
              <div>
                <span className="tiny-label">{currentLesson.title}</span>
                <h2>{currentChallenge.prompt}</h2>
                <p>{currentChallenge.support}</p>
              </div>
              <div className="xp-badge">+{currentChallenge.xp} XP</div>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>

            {currentChallenge.type === "order" ? (
              <div className="order-zone">
                <div className="token-row">
                  {currentChallenge.choices.map((choice) => (
                    <button
                      className="token"
                      key={choice.id}
                      onClick={() =>
                        setTypedOrder((current) =>
                          current ? `${current} ${choice.text}` : choice.text
                        )
                      }
                      type="button"
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
                <textarea
                  className="answer-box"
                  placeholder="タップして並べるか、自分で入力してもOK"
                  value={typedOrder}
                  onChange={(event) => setTypedOrder(event.target.value)}
                />
              </div>
            ) : (
              <div className="choice-grid">
                {currentChallenge.choices.map((choice) => {
                  const active = selectedChoice === choice.id;

                  return (
                    <button
                      className={active ? "choice-card active" : "choice-card"}
                      key={choice.id}
                      onClick={() => setSelectedChoice(choice.id)}
                      type="button"
                    >
                      <span className="choice-letter">{choice.id.toUpperCase()}</span>
                      <span>{choice.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {feedback ? (
              <div className={feedback.kind === "correct" ? "feedback success" : "feedback error"}>
                <strong>{feedback.kind === "correct" ? "Good!" : "惜しい!"}</strong>
                <p>{feedback.text}</p>
              </div>
            ) : (
              <div className="coach-note">
                正解しても間違えても大丈夫です。1問ずつ感覚で進めていく設計にしています。
              </div>
            )}

            <div className="button-row">
              <button className="primary-button" onClick={() => checkAnswer(currentChallenge)} type="button">
                答え合わせ
              </button>
              <button className="secondary-button" onClick={nextChallenge} type="button">
                次へ
              </button>
              <button className="ghost-button" onClick={() => setMode("path")} type="button">
                ルートに戻る
              </button>
            </div>
          </div>

          <aside className="challenge-side">
            <div className="panel">
              <div className="section-head compact">
                <div>
                  <span className="tiny-label">Quick Tips</span>
                  <h2>わかりやすい説明</h2>
                </div>
              </div>
              <div className="tip-card">
                <strong>{areaName(currentChallenge.area)}のコツ</strong>
                <p>{currentChallenge.explanation}</p>
              </div>
              <div className="tip-card">
                <strong>Duolingoっぽく進めるコツ</strong>
                <p>完璧よりテンポ重視。迷ったら選ぶ、間違えたらすぐ覚える、で前に進むのがコツです。</p>
              </div>
            </div>

            <div className="panel">
              <div className="section-head compact">
                <div>
                  <span className="tiny-label">Progress</span>
                  <h2>このレッスンの進み具合</h2>
                </div>
              </div>
              <div className="mini-stats">
                <div className="mini-stat">
                  <span>問題</span>
                  <strong>
                    {currentChallengeIndex + 1}/{currentLesson.challenges.length}
                  </strong>
                </div>
                <div className="mini-stat">
                  <span>報酬</span>
                  <strong>{currentLesson.rewardXp} XP</strong>
                </div>
                <div className="mini-stat">
                  <span>残りハート</span>
                  <strong>{hearts}</strong>
                </div>
              </div>
            </div>
          </aside>
        </section>
      ) : null}

      {mode === "coach" ? (
        <section className="coach-layout">
          <div className="panel">
            <div className="section-head">
              <div>
                <span className="tiny-label">AI Coach</span>
                <h2>短文で英会話練習</h2>
              </div>
            </div>
            <div className="prompt-pills">
              {starterPrompts.map((prompt) => (
                <button className="prompt-pill" key={prompt} onClick={() => setMessage(prompt)} type="button">
                  {prompt}
                </button>
              ))}
            </div>
            <div className="chat-feed">
              {conversation.map((item, index) => (
                <div className={item.role === "ai" ? "bubble ai" : "bubble user"} key={`${item.role}-${index}`}>
                  <span>{item.role === "ai" ? "Coach" : "You"}</span>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="section-head compact">
              <div>
                <span className="tiny-label">Speak</span>
                <h2>1文で送る</h2>
              </div>
            </div>
            <form className="coach-form" onSubmit={sendMessage}>
              <textarea
                className="answer-box"
                placeholder="例: I want to work at a cafe and make new friends."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <div className="button-row">
                <button className="primary-button" disabled={coachLoading} type="submit">
                  {coachLoading ? "返信中..." : "AIに送る"}
                </button>
              </div>
            </form>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function normalizeAnswer(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function areaName(area: GameLesson["area"] | Weakness["area"]) {
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
