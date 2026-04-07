"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Session } from "@supabase/supabase-js";
import {
  defaultUsers,
  fallbackStudyPack,
  grammarDeck,
  speakingHints,
  starterWeaknesses,
  vocabularyDeck
} from "@/lib/mock-data";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { AppUser, ConversationMessage, PersonalizedStudyPack, UserProgress, Weakness } from "@/lib/types";

type Tab = "vocabulary" | "grammar" | "conversation" | "profile";
type ProfileRow = {
  slot: "takuro" | "kazumi";
  display_name: string;
  avatar_url: string | null;
};
type ProgressRow = {
  vocabulary_index: number;
  grammar_index: number;
  grammar_score: number;
  conversation_history: ConversationMessage[];
};

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

const fallbackUsersKey = "english-quest-fallback-users";
const fallbackSessionKey = "english-quest-fallback-session";

function fallbackProgressKey(userId: string) {
  return `english-quest-fallback-progress-${userId}`;
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

function loginEmailForSlot(slot: AppUser["id"]) {
  if (slot === "takuro") {
    return process.env.NEXT_PUBLIC_TAKURO_LOGIN_EMAIL ?? "takuro@english-quest.app";
  }

  return process.env.NEXT_PUBLIC_KAZUMI_LOGIN_EMAIL ?? "kazumi@english-quest.app";
}

export function StudyDashboard() {
  const supabase = getSupabaseBrowserClient();
  const supabaseEnabled = isSupabaseConfigured() && Boolean(supabase);
  const [users, setUsers] = useState<AppUser[]>(defaultUsers);
  const [selectedUserId, setSelectedUserId] = useState<AppUser["id"]>("takuro");
  const [loggedInUserId, setLoggedInUserId] = useState<AppUser["id"] | null>(null);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("vocabulary");
  const [progress, setProgress] = useState<UserProgress>(defaultProgress());
  const [grammarFeedback, setGrammarFeedback] = useState("");
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
  const [bootstrapped, setBootstrapped] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [studyPack, setStudyPack] = useState<PersonalizedStudyPack>(fallbackStudyPack);
  const [packLoading, setPackLoading] = useState(false);
  const autoExpandRef = useRef("");
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
  const currentWord =
    studyPack.vocabulary[progress.vocabularyIndex % studyPack.vocabulary.length] ??
    vocabularyDeck[0];
  const currentGrammar =
    studyPack.grammar[progress.grammarIndex % studyPack.grammar.length] ??
    grammarDeck[0];

  useEffect(() => {
    const speechWindow = window as WindowWithSpeech;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (Recognition) {
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
      setMicSupported(true);
    }
  }, []);

  useEffect(() => {
    if (!supabaseEnabled || !supabase) {
      loadFallbackUsers();
      return;
    }

    void fetch("/api/setup-users", { method: "POST" }).finally(() => {
      setBootstrapped(true);
    });

    void loadSupabaseProfiles();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        void restoreSupabaseUser(data.session.user.id);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        void restoreSupabaseUser(nextSession.user.id);
      } else {
        setLoggedInUserId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, supabaseEnabled]);

  useEffect(() => {
    if (supabaseEnabled || !loggedInUserId) {
      return;
    }

    window.localStorage.setItem(fallbackProgressKey(loggedInUserId), JSON.stringify(progress));
  }, [loggedInUserId, progress, supabaseEnabled]);

  useEffect(() => {
    if (!loggedInUser) {
      return;
    }

    const vocabularyRemaining = studyPack.vocabulary.length - (progress.vocabularyIndex + 1);
    const grammarRemaining = studyPack.grammar.length - (progress.grammarIndex + 1);
    const shouldExpand = vocabularyRemaining <= 3 || grammarRemaining <= 2;
    const autoKey = `${loggedInUser.id}-${progress.vocabularyIndex}-${progress.grammarIndex}-${studyPack.vocabulary.length}-${studyPack.grammar.length}`;

    if (!shouldExpand || packLoading || autoExpandRef.current === autoKey) {
      return;
    }

    autoExpandRef.current = autoKey;
    void loadPersonalizedPack(loggedInUser.name, progress, "append");
  }, [
    loggedInUser,
    packLoading,
    progress,
    studyPack.grammar.length,
    studyPack.vocabulary.length
  ]);

  async function loadSupabaseProfiles() {
    if (!supabase) {
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("slot, display_name, avatar_url")
      .order("display_name");

    if (!data?.length) {
      return;
    }

    const rows = data as unknown as ProfileRow[];
    const mapped = rows
      .filter((row) => row.slot === "takuro" || row.slot === "kazumi")
      .map((row) => ({
        id: row.slot as AppUser["id"],
        name: row.display_name,
        password: "",
        avatar: row.avatar_url ?? undefined
      }));

    if (mapped.length) {
      setUsers((current) =>
        current.map((user) => mapped.find((item) => item.id === user.id) ?? user)
      );
    }
  }

  async function restoreSupabaseUser(authUserId: string) {
    if (!supabase) {
      return;
    }

    const [{ data: profile }, { data: savedProgress }] = await Promise.all([
      supabase
        .from("profiles")
        .select("slot, display_name, avatar_url")
        .eq("id", authUserId)
        .single(),
      supabase
        .from("study_progress")
        .select("vocabulary_index, grammar_index, grammar_score, conversation_history")
        .eq("user_id", authUserId)
        .single()
    ]);

    const profileRow = profile as unknown as ProfileRow | null;
    const progressRow = savedProgress as unknown as ProgressRow | null;

    if (profileRow?.slot === "takuro" || profileRow?.slot === "kazumi") {
      const appUserId = profileRow.slot as AppUser["id"];
      setLoggedInUserId(appUserId);
      setSelectedUserId(appUserId);
      setUsers((current) =>
        current.map((user) =>
          user.id === appUserId
            ? {
                ...user,
                name: profileRow.display_name,
                avatar: profileRow.avatar_url ?? undefined
              }
            : user
        )
      );
    }

    if (progressRow) {
      const nextProgress = {
        vocabularyIndex: progressRow.vocabulary_index ?? 0,
        grammarIndex: progressRow.grammar_index ?? 0,
        grammarScore: progressRow.grammar_score ?? 0,
        conversationHistory:
          progressRow.conversation_history ?? defaultProgress().conversationHistory
      };
      setProgress(nextProgress);
      await loadPersonalizedPack(profileRow?.display_name ?? "Learner", nextProgress, "replace");
    } else {
      setProgress(defaultProgress());
      await loadPersonalizedPack(profileRow?.display_name ?? "Learner", defaultProgress(), "replace");
    }
  }

  function loadFallbackUsers() {
    const storedUsers = window.localStorage.getItem(fallbackUsersKey);
    const storedSession = window.localStorage.getItem(fallbackSessionKey) as AppUser["id"] | null;

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers) as AppUser[]);
    } else {
      window.localStorage.setItem(fallbackUsersKey, JSON.stringify(defaultUsers));
    }

    if (storedSession) {
      setLoggedInUserId(storedSession);
      setSelectedUserId(storedSession);
      const savedProgress = window.localStorage.getItem(fallbackProgressKey(storedSession));
      const nextProgress = savedProgress ? (JSON.parse(savedProgress) as UserProgress) : defaultProgress();
      setProgress(nextProgress);
      const localUser = (storedUsers ? (JSON.parse(storedUsers) as AppUser[]) : defaultUsers).find(
        (user) => user.id === storedSession
      );
      void loadPersonalizedPack(localUser?.name ?? "Learner", nextProgress, "replace");
    }
  }

  async function persistProgress(nextProgress: UserProgress) {
    setProgress(nextProgress);

    if (supabaseEnabled && supabase && session?.user) {
      await (supabase.from("study_progress") as any).upsert({
        user_id: session.user.id,
        vocabulary_index: nextProgress.vocabularyIndex,
        grammar_index: nextProgress.grammarIndex,
        grammar_score: nextProgress.grammarScore,
        conversation_history: nextProgress.conversationHistory
      });
      return;
    }

    if (loggedInUserId) {
      window.localStorage.setItem(fallbackProgressKey(loggedInUserId), JSON.stringify(nextProgress));
    }
  }

  async function loadPersonalizedPack(
    userName: string,
    currentProgress: UserProgress,
    mode: "replace" | "append" = "replace"
  ) {
    setPackLoading(true);

    try {
      const response = await fetch("/api/personalize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userName,
          progress: currentProgress,
          mode,
          existingPack: studyPack
        })
      });

      const data = (await response.json()) as { pack?: PersonalizedStudyPack };

      if (data.pack) {
        const nextPack = data.pack;
        setStudyPack((current) =>
          mode === "append" ? mergeStudyPacks(current, nextPack) : nextPack
        );
      }
    } finally {
      setPackLoading(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    if (supabaseEnabled && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmailForSlot(selectedUserId),
        password: loginPassword
      });

      if (error) {
        setLoginError("ログインに失敗しました。パスワードを確認してください。");
        return;
      }

      setLoginPassword("");
      return;
    }

    if (selectedUser.password !== loginPassword) {
      setLoginError("パスワードが違います。");
      return;
    }

    setLoggedInUserId(selectedUser.id);
    setLoginPassword("");
    window.localStorage.setItem(fallbackSessionKey, selectedUser.id);
    const savedProgress = window.localStorage.getItem(fallbackProgressKey(selectedUser.id));
    const nextProgress = savedProgress ? (JSON.parse(savedProgress) as UserProgress) : defaultProgress();
    setProgress(nextProgress);
    await loadPersonalizedPack(selectedUser.name, nextProgress, "replace");
  }

  async function handleLogout() {
    if (supabaseEnabled && supabase) {
      await supabase.auth.signOut();
      return;
    }

    setLoggedInUserId(null);
    window.localStorage.removeItem(fallbackSessionKey);
  }

  async function goToNextWord() {
    const nextProgress = {
      ...progress,
      vocabularyIndex: (progress.vocabularyIndex + 1) % studyPack.vocabulary.length
    };
    await persistProgress(nextProgress);
  }

  async function goToPrevWord() {
    const nextProgress = {
      ...progress,
      vocabularyIndex:
        progress.vocabularyIndex === 0 ? studyPack.vocabulary.length - 1 : progress.vocabularyIndex - 1
    };
    await persistProgress(nextProgress);
  }

  async function answerGrammar(option: string) {
    const correct = option === currentGrammar.answer;
    const nextProgress = {
      ...progress,
      grammarScore: correct ? progress.grammarScore + 1 : progress.grammarScore
    };
    await persistProgress(nextProgress);
    setGrammarFeedback(
      correct
        ? `正解です。${currentGrammar.explanation}`
        : `今回はこっちが自然です: "${currentGrammar.answer}"。${currentGrammar.explanation}`
    );
  }

  async function nextGrammar() {
    await persistProgress({
      ...progress,
      grammarIndex: (progress.grammarIndex + 1) % studyPack.grammar.length
    });
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
    const withUserMessage: UserProgress = {
      ...progress,
      conversationHistory: [...progress.conversationHistory, { role: "user", text } as const]
    };
    await persistProgress(withUserMessage);

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
      const nextProgress: UserProgress = {
        ...withUserMessage,
        conversationHistory: [
          ...withUserMessage.conversationHistory,
          { role: "ai", text: data.reply } as const
        ]
      };
      await persistProgress(nextProgress);
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

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !loggedInUser) {
      return;
    }

    if (supabaseEnabled && supabase && session?.user) {
      const filePath = `${session.user.id}/avatar-${Date.now()}`;
      const { error } = await supabase.storage.from("avatars").upload(filePath, file, {
        upsert: true
      });

      if (error) {
        setProfileMessage("画像の保存に失敗しました。");
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await (supabase.from("profiles") as any)
        .update({ avatar_url: data.publicUrl })
        .eq("id", session.user.id);

      setUsers((current) =>
        current.map((user) =>
          user.id === loggedInUser.id ? { ...user, avatar: data.publicUrl } : user
        )
      );
      setProfileMessage("プロフィール画像を更新しました。");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const avatar = typeof reader.result === "string" ? reader.result : "";
      const nextUsers = users.map((user) =>
        user.id === loggedInUser.id ? { ...user, avatar } : user
      );
      setUsers(nextUsers);
      window.localStorage.setItem(fallbackUsersKey, JSON.stringify(nextUsers));
      setProfileMessage("プロフィール画像を更新しました。");
    };
    reader.readAsDataURL(file);
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!loggedInUser) {
      return;
    }

    if (changePasswordForm.next.length < 4) {
      setProfileMessage("新しいパスワードは4文字以上にしてください。");
      return;
    }

    if (changePasswordForm.next !== changePasswordForm.confirm) {
      setProfileMessage("新しいパスワード確認が一致しません。");
      return;
    }

    if (supabaseEnabled && supabase) {
      const { error } = await supabase.auth.updateUser({
        password: changePasswordForm.next
      });

      if (error) {
        setProfileMessage("パスワード変更に失敗しました。");
        return;
      }

      setChangePasswordForm({ current: "", next: "", confirm: "" });
      setProfileMessage("パスワードを変更しました。");
      return;
    }

    if (changePasswordForm.current !== loggedInUser.password) {
      setProfileMessage("現在のパスワードが違います。");
      return;
    }

    const nextUsers = users.map((user) =>
      user.id === loggedInUser.id ? { ...user, password: changePasswordForm.next } : user
    );
    setUsers(nextUsers);
    window.localStorage.setItem(fallbackUsersKey, JSON.stringify(nextUsers));
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
          <div className="inline-message">
              {supabaseEnabled
                ? bootstrapped
                  ? "Supabase 本番ログインが有効です。"
                  : "Supabase 初期化中..."
                : "今はローカル保存モードです。Supabase を設定すると本物のログインになります。"}
            </div>
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
          <div className="mini-pill">単語 {progress.vocabularyIndex + 1}/{studyPack.vocabulary.length}</div>
          <div className="mini-pill">文法スコア {progress.grammarScore}</div>
          <button className="ghost-button" onClick={() => void handleLogout()} type="button">
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
            <div className="inline-message">{packLoading ? "AIがあなた向けの単語を更新中..." : studyPack.focusSummary}</div>
            <div className="meaning-box">{currentWord.meaning}</div>
            <p className="support-copy">{currentWord.sample}</p>
            <div className="tip-box">
              <strong>覚え方のコツ</strong>
              <p>{currentWord.tip}</p>
            </div>
            <div className="button-row">
              <button className="ghost-button" onClick={() => void goToPrevWord()} type="button">
                前の単語
              </button>
              <button className="primary-button" onClick={() => void goToNextWord()} type="button">
                次の単語
              </button>
              <button className="secondary-button" onClick={() => void loadPersonalizedPack(loggedInUser.name, progress, "append")} type="button">
                もっと生成
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
                  onClick={() => void answerGrammar(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
            {grammarFeedback ? <div className="inline-message">{grammarFeedback}</div> : null}
            <button className="secondary-button" onClick={() => void nextGrammar()} type="button">
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
                {studyPack.conversationPrompts.map((suggestion) => (
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
                  <input accept="image/*" className="text-input" type="file" onChange={(event) => void handleAvatarChange(event)} />
                </label>
              </div>
            </div>
          </div>

          <aside className="panel stack">
            <span className="section-label">Security</span>
            <form className="stack" onSubmit={(event) => void handlePasswordChange(event)}>
              {!supabaseEnabled ? (
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
              ) : null}
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

function mergeStudyPacks(
  current: PersonalizedStudyPack,
  incoming: PersonalizedStudyPack
): PersonalizedStudyPack {
  const vocabulary = dedupeByKey(
    [...current.vocabulary, ...incoming.vocabulary],
    (item) => `${item.word}-${item.meaning}`
  );
  const grammar = dedupeByKey(
    [...current.grammar, ...incoming.grammar],
    (item) => `${item.title}-${item.pattern}`
  );
  const conversationPrompts = Array.from(
    new Set([...current.conversationPrompts, ...incoming.conversationPrompts])
  );

  return {
    focusSummary: incoming.focusSummary || current.focusSummary,
    vocabulary,
    grammar,
    conversationPrompts
  };
}

function dedupeByKey<T>(items: T[], getKey: (item: T) => string) {
  const map = new Map<string, T>();

  for (const item of items) {
    map.set(getKey(item), item);
  }

  return Array.from(map.values());
}
