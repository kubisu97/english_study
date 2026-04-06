# English Study Coach

来年のワーキングホリデーに向けて、日常英会話を話せるようになるための自分専用の英語学習アプリです。

このアプリは **ブラウザで動きます**。

- PCなら `Chrome` や `Safari`
- スマホなら `Safari` や `Chrome`

で開いて使うイメージです。

## このアプリでできること

- AI英会話コーチと英会話の練習
- 苦手の自動診断
- 今日やるべき学習内容の提案
- ワーホリ向け単語カードの確認
- PC / スマホ両対応の画面表示

## まず結論

このアプリを使う方法は2つあります。

### 1. 自分のPCだけで使う

自分のPCで起動して、ブラウザで開いて使います。

### 2. ネットに公開して、いつでもアクセスできるようにする

`GitHub` にコードを置いて、`Vercel` などにデプロイします。

注意:
`GitHub` はコードを置く場所です。  
**GitHub に上げるだけでは、このアプリは公開されません。**

このアプリは `Next.js` のAPI機能を使っているので、いつでもブラウザから使えるようにするには、
普通は **GitHub + Vercel** の組み合わせで公開します。

## ローカルで使う方法

### 1. このフォルダを開く

ターミナルでこのプロジェクトのフォルダに移動します。

```bash
cd /Users/kurisutakurou/codex/english_study
```

### 2. 必要なものをインストールする

最初の1回だけ、依存関係を入れます。

```bash
npm install
```

### 3. APIキーの設定をする

まず設定ファイルを作ります。

```bash
cp .env.example .env.local
```

そのあと `.env.local` を開いて、OpenAI の API キーを入れます。

例:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

補足:
APIキーがなくても画面の確認はできます。  
ただしその場合、AI英会話コーチは本物のAI返答ではなく、簡易のフォールバック返答になります。

### 4. アプリを起動する

```bash
npm run dev
```

### 5. ブラウザで開く

以下をブラウザで開きます。

```text
http://localhost:3000
```

これで使えます。

## 画面の使い方

### 弱点診断

画面の数値を自分に合わせて入れて、`弱点を再分析` を押します。

すると、

- 英会話
- 単語
- 文法
- リスニング

の中で何が弱いかを見て、今日の優先学習を出します。

### 単語カード

ワーホリで使いやすい単語を確認できます。

- 意味
- 例文
- ニュアンス

が見られます。

### AI英会話コーチ

右下の入力欄に英語を書いて、`AIに送る` を押します。

するとAIが、

- より自然な英文への修正
- 日本語での短い説明
- 次に答えるべき質問

を返す形になっています。

## スマホでも使える？

使えます。

このアプリはレスポンシブ対応しているので、スマホのブラウザでも画面に合わせて表示されます。

将来的には、PWA化してホーム画面追加しやすくすることもできます。

## 公開していつでもアクセスできるようにする方法

おすすめは **GitHub に保存して Vercel で公開** です。

流れは次の通りです。

### 1. GitHubにリポジトリを作る

GitHubで新しいリポジトリを作ります。

例:

- リポジトリ名: `english-study-coach`

### 2. このプロジェクトをGitHubへアップする

まだこのフォルダはGit管理されていないので、最初に `git init` から始めます。

基本の流れ:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

### 3. VercelでGitHub連携する

Vercelにログインして、GitHubのこのリポジトリを読み込みます。

### 4. 環境変数を設定する

Vercel の設定画面で次を入れます。

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

### 5. デプロイする

デプロイが終わるとURLが発行されます。

例:

```text
https://english-study-coach.vercel.app
```

このURLを開けば、PCでもスマホでもいつでもアクセスできます。

## 公開するときの大事な注意

- `.env.local` はGitHubに上げません
- APIキーはGitHubに直接書かないでください
- APIキーはVercelの環境変数に入れてください

このプロジェクトでは `.gitignore` に `.env.local` を入れてあるので、そのままなら公開されません。

## 今の構成

- フロント画面: `Next.js`
- API: `app/api/coach/route.ts`
- 弱点分析: `app/api/diagnosis/route.ts`
- UI本体: `components/study-dashboard.tsx`

## これから追加すると強い機能

1. 音声入力で英会話練習
2. AIが会話ログから苦手を自動分析
3. 学習履歴の保存
4. 自分専用の毎日カリキュラム自動生成
5. 単語の復習タイミング最適化

## もし次にやるなら

次はこの2つのどちらかがおすすめです。

### A. すぐ公開できる形にする

- GitHub用に整える
- Vercel公開まで進める

### B. まず機能を強くする

- 音声会話
- 学習履歴保存
- AIの苦手分析強化

## 今回の起動コマンドまとめ

```bash
cd /Users/kurisutakurou/codex/english_study
npm install
cp .env.example .env.local
npm run dev
```

ブラウザで:

```text
http://localhost:3000
```
