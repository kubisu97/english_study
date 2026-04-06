"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { coachSuggestions, defaultUsers, grammarDeck, speakingHints, starterWeaknesses, vocabularyDeck } from "@/lib/mock-data";
import { AppUser, ConversationMessage, GrammarCard, UserProgress, Weakness } from "@/lib/types";

type Tab = "vocabulary" | "grammar" | "conversation" | "profile";

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type WindowWithSpeech = Window & {
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  SpeechRecognition?: new () => SpeechRecognitionInstance;
};

const usersStorageKey = "english-quest-users";
const activeUserStorageKey = "english-quest-active-user";

function progressStorageKey(userId: string) {
  return `english-quest-progress-${userId}`;
}

function defaultProgress(): UserProgress {
  return {
    vocabularyIndex: 0,
    grammarIndex: 0,
    grammarScore: 0,
    conversationHistory: [
      {
        role: "ai",
        text:
          "Hi! Press the mic and answer in simple English. I will help you say it more naturally."
      }
    ]
  };
}

export function StudyDashboard() {
  const [users, setUsers] = useState<AppUser[]>(defaultUsers);
  const [selectedUserId, setSelectedUserId] = useState<AppUser["id"]>("takuro");
  const [loggedInUserId, setLoggedInUserId] = useState<AppUser["id"] | null>(null);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("vocabulary");
  const [progress, setProgress] = useState<UserProgress>(defaultProgress());
  const [grammarFeedback, setGrammarFeedback] = useState<string>("");
  const [changePasswordForm, setChangePasswordForm] = useState({
    current: "",
    next: "",
    confirm: ""
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [micSupported, setMicSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);
  const [manualMessage, setManualMessage] = useState("");
  const [speechError, setSpeechError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const weaknesses = starterWeaknesses;
  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? users[0],
    [selectedUserId, users]
  );
  const loggedInUser = useMemo(
    () => users.find((user) => user.id === loggedInUserId) ?? null,
    [loggedInUserId, users]
  );

  const currentWord = vocabularyDeck[progress.vocabularyIndex] ?? vocabularyDeck[0];
  const currentGrammar = grammarDeck[progress.grammarIndex] ?? grammarDeck[0];

  useEffect(() => {
    const storedUsers = window.localStorage.getItem(usersStorageKey);
    const storedActiveUser = window.localStorage.getItem(activeUserStorageKey) as AppUser["id"] | null;
    const speechWindow = window as WindowWithSpeech;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (storedUsers) {
      const parsed = JSON.parse(storedUsers) as AppUser[];
      setUsers(parsed);
    } else {
      window.localStorage.setItem(usersStorageKey, JSON.stringify(defaultUsers));
    }

    if (storedActiveUser) {
      setLoggedInUserId(storedActiveUser);
      setSelectedUserId(storedActiveUser);
      loadProgress(storedActiveUser);
    }

    if (Recognition) {
      setMicSupported(true);
      const recognition = new Recognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript?.trim();

        if (transcript) {
          void submitConversation(transcript);
        }
      };
      recognition.onerror = (event) => {
        setSpeechError(event.error === "not-allowed" ? "マイクの許可が必要です。" : "音声認識に失敗しました。");
        setListening(false);
      };
      recognition.onend = () => {
        setListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(usersStorageKey, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (!loggedInUserId) {
      return;
    }

    window.localStorage.setItem(activeUserStorageKey, loggedInUserId);
    window.localStorage.setItem(progressStorageKey(loggedInUserId), JSON.stringify(progress));
  }, [loggedInUserId, progress]);

  function loadProgress(userId: AppUser["id"]) {
    const saved = window.localStorage.getItem(progressStorageKey(userId));

    if (!saved) {
      setProgress(defaultProgress());
      return;
    }

    setProgress(JSON.parse(saved) as UserProgress);
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedUser.password !== loginPassword) {
      setLoginError("パスワードが違います。");
      return;
    }

    setLoggedInUserId(selectedUser.id);
    setLoginPassword("");
    setLoginError("");
    setProfileMessage("");
    loadProgress(selectedUser.id);
  }

  function handleLogout() {
    setLoggedInUserId(null);
    window.localStorage.removeItem(activeUserStorageKey);
  }

  function goToNextWord() {
    setProgress((current) => ({
      ...current,
      vocabularyIndex: (current.vocabularyIndex + 1) % vocabularyDeck.length
    }));
  }

  function goToPrevWord() {
    setProgress((current) => ({
      ...current,
      vocabularyIndex:
        current.vocabularyIndex === 0 ? vocabularyDeck.length - 1 : current.vocabularyIndex - 1
    }));
  }

  function answerGrammar(option: string, card: GrammarCard) {
    const correct = option === card.answer;
    setProgress((current) => ({
      ...current,
      grammarScore: correct ? current.grammarScore + 1 : current.grammarScore
    }));
    setGrammarFeedback(
      correct
        ? `正解です。${card.explanation}`
        : `今回はこっちが自然です: "${card.answer}"。${card.explanation}`
    );
  }

  function nextGrammar() {
    setProgress((current) => ({
      ...current,
      grammarIndex: (current.grammarIndex + 1) % grammarDeck.length
    }));
    setGrammarFeedback("");
  }

  function startListening() {
    if (!recognitionRef.current) {
      setSpeechError("このブラウザではマイク会話が使えません。");
      return;
    }

    setSpeechError("");
    setListening(true);
    recognitionRef.current.start();
  }

  async function submitConversation(text: string) {
    if (!loggedInUser) {
      return;
    }

    setCoachLoading(true);
    setProgress((current) => ({
      ...current,
      conversationHistory: [...current.conversationHistory, { role: "user", text }]
    }));

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          focusArea: "conversation",
          learnerProfile: `${loggedInUser.name} is practicing spoken English for a working holiday. Keep advice easy and practical.`
        })
      });

      const data = (await response.json()) as { reply: string };
      setProgress((current) => ({
        ...current,
        conversationHistory: [...current.conversationHistory, { role: "ai", text: data.reply }]
      }));
      speakText(data.reply);
    } finally {
      setCoachLoading(false);
    }
  }

  function speakText(text: string) {
    if (!("speechSynthesis" in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  async function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = manualMessage.trim();

    if (!text) {
      return;
    }

    setManualMessage("");
    await submitConversation(text);
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !loggedInUser) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const avatar = typeof reader.result === "string" ? reader.result : "";
      setUsers((current) =>
        current.map((user) => (user.id === loggedInUser.id ? { ...user, avatar } : user))
      );
      setProfileMessage("プロフィール画像を更新しました。");
    };
    reader.readAsDataURL(file);
  }

  function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!loggedInUser) {
      return;
    }

    if (changePasswordForm.current !== loggedInUser.password) {
      setProfileMessage("現在のパスワードが違います。");
      return;
    }

    if (changePasswordForm.next.length < 4) {
      setProfileMessage("新しいパスワードは4文字以上にしてください。");
      return;
    }

    if (changePasswordForm.next !== changePasswordForm.confirm) {
      setProfileMessage("新しいパスワードの確認が一致しません。");
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === loggedInUser.id ? { ...user, password: changePasswordForm.next } : user
      )
    );
    setChangePasswordForm({ current: "", next: "", confirm: "" });
    setProfileMessage("パスワードを変更しました。");
  }

  if (!loggedInUser) {
    return (
      <main className="simple-shell">
        <section className="login-panel">
          <div className="login-copy">
            <span className="simple-badge">English Partner</span>
            <h1>単語・文法・英会話を、2人それぞれで学べる。</h1>
            <p>
              ブラウザですぐ使える英語勉強アプリです。拓郎用・和美用の2ユーザーを切り替えて、それぞれ別のプロフィールで使えます。
            </p>
          </div>

          <div className="panel stack">
            <h2>ユーザーを選ぶ</h2>
            <div className="user-grid">
              {users.map((user) => (
                <button
                  className={selectedUserId === user.id ? "user-card active" : "user-card"}
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  type="button"
                >
                  <Avatar user={user} />
                  <strong>{user.name}</strong>
                </button>
              ))}
            </div>

            <form className="stack" onSubmit={handleLogin}>
              <label className="field">
                <span>パスワード</span>
                <input
                  className="text-input"
                  placeholder="パスワードを入力"
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                />
              </label>
              {loginError ? <div className="inline-message error">{loginError}</div> : null}
              <button className="primary-button" type="submit">
                {selectedUser?.name}としてログイン
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="simple-shell">
      <header className="app-header">
        <div className="header-user">
          <Avatar user={loggedInUser} />
          <div>
            <span className="simple-badge">Logged in</span>
            <h1>{loggedInUser.name}さんの英語ルーム</h1>
          </div>
        </div>
        <div className="header-actions">
          <div className="mini-pill">単語 {progress.vocabularyIndex + 1}/{vocabularyDeck.length}</div>
          <div className="mini-pill">文法スコア {progress.grammarScore}</div>
          <button className="ghost-button" onClick={handleLogout} type="button">
            ログアウト
          </button>
        </div>
      </header>

      <nav className="simple-tabs">
        <button className={activeTab === "vocabulary" ? "tab active" : "tab"} onClick={() => setActiveTab("vocabulary")} type="button">
          単語
        </button>
        <button className={activeTab === "grammar" ? "tab active" : "tab"} onClick={() => setActiveTab("grammar")} type="button">
          文法
        </button>
        <button className={activeTab === "conversation" ? "tab active" : "tab"} onClick={() => setActiveTab("conversation")} type="button">
          英会話
        </button>
        <button className={activeTab === "profile" ? "tab active" : "tab"} onClick={() => setActiveTab("profile")} type="button">
          プロフィール
        </button>
      </nav>

      {activeTab === "vocabulary" ? (
        <section className="content-grid">
          <div className="panel big-card">
            <span className="section-label">Vocabulary</span>
            <h2>{currentWord.word}</h2>
            <div className="meaning-box">{currentWord.meaning}</div>
            <p className="support-copy">{currentWord.sample}</p>
            <div className="tip-box">
              <strong>覚え方のコツ</strong>
              <p>{currentWord.tip}</p>
            </div>
            <div className="button-row">
              <button className="ghost-button" onClick={goToPrevWord} type="button">
                前の単語
              </button>
              <button className="primary-button" onClick={goToNextWord} type="button">
                次の単語
              </button>
            </div>
          </div>

          <aside className="panel">
            <span className="section-label">Today&apos;s Focus</span>
            <div className="weak-list">
              {weaknesses.map((weakness: Weakness) => (
                <div className="weak-card" key={weakness.area}>
                  <strong>{labelForArea(weakness.area)}</strong>
                  <p>{weakness.nextAction}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      ) : null}

      {activeTab === "grammar" ? (
        <section className="content-grid">
          <div className="panel big-card">
            <span className="section-label">Grammar</span>
            <h2>{currentGrammar.title}</h2>
            <div className="pattern-box">{currentGrammar.pattern}</div>
            <p className="support-copy">{currentGrammar.explanation}</p>
            <div className="example-stack">
              <div className="example-card good">
                <strong>自然な言い方</strong>
                <p>{currentGrammar.goodExample}</p>
              </div>
              <div className="example-card bad">
                <strong>崩れやすい言い方</strong>
                <p>{currentGrammar.commonMistake}</p>
              </div>
            </div>
          </div>

          <aside className="panel stack">
            <span className="section-label">Quick Quiz</span>
            <h3>{currentGrammar.quizPrompt}</h3>
            <div className="option-list">
              {currentGrammar.quizOptions.map((option) => (
                <button
                  className="option-button"
                  key={option}
                  onClick={() => answerGrammar(option, currentGrammar)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
            {grammarFeedback ? <div className="inline-message">{grammarFeedback}</div> : null}
            <button className="secondary-button" onClick={nextGrammar} type="button">
              次の文法へ
            </button>
          </aside>
        </section>
      ) : null}

      {activeTab === "conversation" ? (
        <section className="content-grid conversation-grid">
          <div className="panel big-card">
            <span className="section-label">Speaking</span>
            <h2>マイクで話しかける英会話</h2>
            <p className="support-copy">
              ボタンを押して英語で話すと、AIが自然な言い方と次に言うといい表現を返します。
            </p>

            <div className="mic-area">
              <button className={listening ? "mic-button live" : "mic-button"} onClick={startListening} type="button">
                {listening ? "Listening..." : "マイクを起動"}
              </button>
              <div className="mic-note">
                {micSupported ? "英語でそのまま話してください。" : "このブラウザでは音声入力が使えません。"}
              </div>
              {coachLoading ? <div className="inline-message">AIが返答を作っています...</div> : null}
              {speechError ? <div className="inline-message error">{speechError}</div> : null}
            </div>

            <div className="chat-column">
              {progress.conversationHistory.map((item, index) => (
                <div className={item.role === "ai" ? "chat-item ai" : "chat-item user"} key={`${item.role}-${index}`}>
                  <span>{item.role === "ai" ? "AI Coach" : loggedInUser.name}</span>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>

            <form className="manual-form" onSubmit={handleManualSubmit}>
              <input
                className="text-input"
                placeholder="マイクが難しいときだけここに入力"
                value={manualMessage}
                onChange={(event) => setManualMessage(event.target.value)}
              />
              <button className="ghost-button" type="submit">
                テキストで送る
              </button>
            </form>
          </div>

          <aside className="panel stack">
            <span className="section-label">話す補助</span>
            <div className="tip-box">
              <strong>こう話すと楽です</strong>
              <ul className="flat-list">
                {speakingHints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            </div>
            <div className="tip-box">
              <strong>そのまま使える例</strong>
              <div className="suggestion-list">
                {coachSuggestions.map((suggestion) => (
                  <button className="suggestion-chip" key={suggestion} onClick={() => setManualMessage(suggestion)} type="button">
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </section>
      ) : null}

      {activeTab === "profile" ? (
        <section className="content-grid">
          <div className="panel big-card">
            <span className="section-label">Profile</span>
            <h2>{loggedInUser.name}さんの設定</h2>
            <div className="profile-block">
              <Avatar large user={loggedInUser} />
              <div className="stack">
                <label className="field">
                  <span>プロフィール画像</span>
                  <input accept="image/*" className="text-input" type="file" onChange={handleAvatarChange} />
                </label>
              </div>
            </div>
          </div>

          <aside className="panel stack">
            <span className="section-label">Security</span>
            <form className="stack" onSubmit={handlePasswordChange}>
              <label className="field">
                <span>現在のパスワード</span>
                <input
                  className="text-input"
                  type="password"
                  value={changePasswordForm.current}
                  onChange={(event) =>
                    setChangePasswordForm((current) => ({ ...current, current: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>新しいパスワード</span>
                <input
                  className="text-input"
                  type="password"
                  value={changePasswordForm.next}
                  onChange={(event) =>
                    setChangePasswordForm((current) => ({ ...current, next: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>新しいパスワード確認</span>
                <input
                  className="text-input"
                  type="password"
                  value={changePasswordForm.confirm}
                  onChange={(event) =>
                    setChangePasswordForm((current) => ({ ...current, confirm: event.target.value }))
                  }
                />
              </label>
              <button className="primary-button" type="submit">
                パスワードを変更
              </button>
            </form>
            {profileMessage ? <div className="inline-message">{profileMessage}</div> : null}
          </aside>
        </section>
      ) : null}
    </main>
  );
}

function Avatar({ user, large = false }: { user: AppUser; large?: boolean }) {
  return user.avatar ? (
    <img alt={`${user.name} avatar`} className={large ? "avatar large" : "avatar"} src={user.avatar} />
  ) : (
    <div className={large ? "avatar fallback large" : "avatar fallback"}>{user.name.slice(0, 1)}</div>
  );
}

function labelForArea(area: Weakness["area"]) {
  switch (area) {
    case "conversation":
      return "英会話";
    case "grammar":
      return "文法";
    case "vocabulary":
      return "単語";
    case "listening":
      return "リスニング";
    default:
      return area;
  }
}
