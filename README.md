# English Quest

ワーキングホリデーに向けて、`単語 / 文法 / 英会話` を2人それぞれで学べるブラウザアプリです。

## 今の構成

- ユーザー選択: `拓郎` / `和美`
- ログイン: パスワード式
- 学習画面: `単語` `文法` `英会話` `プロフィール`
- 英会話: マイク起動 + AIサポート
- プロフィール: 画像変更 / パスワード変更
- 保存: Supabase Auth / DB / Storage

## 公開URL

Vercel に公開して使う前提です。

## ローカル確認

```bash
npm install
cp .env.example .env.local
npm run dev
```

ブラウザで `http://localhost:3000`

## 必須環境変数

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_TAKURO_LOGIN_EMAIL=takuro@english-quest.app
NEXT_PUBLIC_KAZUMI_LOGIN_EMAIL=kazumi@english-quest.app
TAKURO_LOGIN_EMAIL=takuro@english-quest.app
KAZUMI_LOGIN_EMAIL=kazumi@english-quest.app
TAKURO_INITIAL_PASSWORD=takuro123
KAZUMI_INITIAL_PASSWORD=kazumi123
```

## Supabase セットアップ

### 1. Supabase プロジェクトを作る

Free Plan でOKです。

### 2. SQLを流す

`supabase/schema.sql` を Supabase の SQL Editor で実行します。

これで以下が作られます。

- `profiles` テーブル
- `study_progress` テーブル
- `avatars` バケット
- RLS ポリシー

### 3. Vercel に環境変数を入れる

Vercel に以下を設定します。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `NEXT_PUBLIC_TAKURO_LOGIN_EMAIL`
- `NEXT_PUBLIC_KAZUMI_LOGIN_EMAIL`
- `TAKURO_LOGIN_EMAIL`
- `KAZUMI_LOGIN_EMAIL`
- `TAKURO_INITIAL_PASSWORD`
- `KAZUMI_INITIAL_PASSWORD`

### 4. 初回アクセス時にユーザーを自動作成

アプリは `/api/setup-users` を通して、初回アクセス時に以下の2ユーザーを自動で用意します。

- 拓郎
- 和美

## 使い方

### 単語

- 1語ずつ確認
- 意味と例文と覚え方を見る

### 文法

- よく使う型を覚える
- すぐ下でミニクイズ

### 英会話

- マイクを起動
- 英語で話す
- AIが自然な言い方と次に言う文を返す

### プロフィール

- 画像を登録
- パスワードを変更

## 主なファイル

- `components/study-dashboard.tsx`
- `app/api/coach/route.ts`
- `app/api/setup-users/route.ts`
- `lib/supabase.ts`
- `supabase/schema.sql`
