# 📒 AI自動仕訳システム

領収書を撮影・スキャンするだけで、AIが自動で勘定科目を判定し、仕訳帳を作成するWebアプリです。

## 🚀 公開するまでの手順（所要時間：約15分）

### 手順① GitHubにリポジトリを作る

1. https://github.com/new にアクセス
2. Repository name に `shiwake-ai` と入力
3. 「Public」を選択
4. 「Create repository」ボタンをクリック

### 手順② コードをアップロードする

**方法A：Cursor からプッシュする場合**

Cursorでこのフォルダを開き、ターミナルで以下を実行：

```bash
cd shiwake-ai
git init
git add .
git commit -m "初回コミット"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/shiwake-ai.git
git push -u origin main
```

**方法B：GitHubの画面からアップロードする場合**

1. 作成したリポジトリのページで「uploading an existing file」リンクをクリック
2. このフォルダの中身をすべてドラッグ＆ドロップ
3. 「Commit changes」をクリック

### 手順③ Vercelにデプロイする

1. https://vercel.com にログイン（GitHubアカウントで）
2. 「Add New... → Project」をクリック
3. 「Import Git Repository」で `shiwake-ai` を選択
4. 「Framework Preset」が「Vite」になっていることを確認
5. **★重要★**「Environment Variables」セクションで以下を追加：
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-api03-...`（あなたのAnthropicのAPIキー）
6. 「Deploy」ボタンをクリック

### 手順④ 完成！URLを共有する

デプロイが完了すると、以下のようなURLが発行されます：

```
https://shiwake-ai.vercel.app
```

このURLをスマホやPCのブラウザで開くだけで、誰でも使えます。

---

## 📱 使ってもらう人への案内文（コピペ用）

```
【AI自動仕訳システムのご案内】

領収書をスマホで撮影するだけで、AIが自動で仕訳帳を作成します。

▼ 使い方（かんたん4ステップ）
① 下のURLをスマホまたはPCで開く
② お客様の業種を選ぶ
③ 領収書をカメラで撮影、またはファイル選択
④ AIが自動で仕訳を作成 → CSV保存

▼ アクセスURL
https://shiwake-ai.vercel.app

※ アプリのインストールは不要です
※ スマホのブラウザ（Safari/Chrome）からそのまま使えます
```

---

## 🔒 セキュリティについて

- Anthropic APIキーは **サーバー側（Vercel環境変数）** に保管されます
- ブラウザ（ユーザー側）からはAPIキーが **一切見えません**
- 領収書画像はAIの解析にのみ使用され、サーバーに保存されません

---

## ⚙️ 技術構成

| 項目 | 内容 |
|------|------|
| フロントエンド | React + Vite |
| AI解析 | Claude API (claude-sonnet-4) |
| APIプロキシ | Vercel Serverless Functions |
| ホスティング | Vercel |
| 対応業種 | 9業種 + カスタム追加可能 |
| 出力形式 | CSV（弥生・freee・マネーフォワード対応）|

---

## 📁 ファイル構成

```
shiwake-ai/
├── api/
│   └── chat.js          ← APIキーを安全に管理するサーバー関数
├── src/
│   ├── App.jsx          ← メインアプリ（UI全体）
│   └── main.jsx         ← エントリーポイント
├── public/
├── index.html           ← HTMLテンプレート
├── package.json
├── vite.config.js
├── vercel.json          ← Vercel設定
├── .env.example         ← 環境変数の見本
└── .gitignore
```
