# Ag-ppt-create

> 🤖 AI エージェントが PowerPoint を自動生成するためのツールキット

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)

[python-pptx](https://python-pptx.readthedocs.io/) と [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) を使用した PPTX 自動生成ツールキットです。

---

## ⚖️ ライセンスと使用条件

本プロジェクトは **CC BY-NC-SA 4.0** ライセンスの下で提供されています。

- ✅ 非営利目的での使用・共有・翻案は自由、商用利用は NG
- ✅ クレジット表示が必要
- ⚠️ AI 学習データとしての使用は禁止
  詳細は [LICENSE](LICENSE) をご確認ください。

---

## � リポジトリ

| リポジトリ  | 用途                 | URL                                             |
| ----------- | -------------------- | ----------------------------------------------- |
| **Public**  | 公開版（安定版）     | https://github.com/aktsmm/Ag-ppt-create         |
| **Private** | 開発版（実験的機能） | https://github.com/aktsmm/Ag-ppt-create-private |

> 💡 **開発の流れ**: Private で開発・テスト → 安定したら Public にマージ

---

## �🚀 クイックスタート

### 1. セットアップ（初回のみ）

```powershell
git clone https://github.com/aktsmm/Ag-ppt-create.git
cd Ag-ppt-create

# Python 環境
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Node.js 環境
npm install
```

👉 **[詳細なセットアップ手順](docs/SETUP.md)**

### 2. テンプレートを準備

`templates/` フォルダに**普段使っている PowerPoint テンプレート**を入れてください。

> 💡 **ポイント**: よく使う PowerPoint をテンプレートとして入れておくと、そのデザイン（配色・フォント・レイアウト）を継承した PPTX が生成されます。
>
> 📖 **しっかり作りたい場合**: スライドマスターやプレースホルダーの設計については **[テンプレート設計ガイド](docs/TEMPLATE-DESIGN.md)** を参照してください。

### 3. 使う

VS Code で GitHub Copilot の **Agent モード** → **Orchestrator** を選択して話しかけるだけ。

```
この記事から PowerPoint 作って
https://example.com/article

このPPTXを日本語化して
[英語版PPTX を input/ に配置]
```

> ⚠️ **PPTX ファイルの入力**: VS Code のチャットには PPTX をドラッグ＆ドロップできません。`input/` フォルダにファイルを配置してください。

Orchestrator が方式・枚数を提案し、**あなたの承認後**に生成を開始します。

---

## 📥 対応する入力

| 入力タイプ   | 例                                            |
| ------------ | --------------------------------------------- |
| **URL**      | ブログ記事、ドキュメント、Qiita、Zenn 等      |
| **PPTX**     | 英語版 PowerPoint（日本語化）                 |
| **テキスト** | 箇条書きメモ、議事録、要件定義                |
| **画像**     | スクリーンショット、手書きメモ、図解          |
| **ファイル** | Markdown、Word、PDF（テキスト抽出可能なもの） |

---

## 🤖 エージェントワークフロー

本リポジトリは **4 つのエージェント** と **決定論的スクリプト群** がチームで PPTX を生成します。

### 前提条件

- **VS Code** + **GitHub Copilot 拡張機能**
- **Agent モード対応モデル**が必須（非対応モデルでは動作しません）
- **推奨モデル**: Claude Opus 4（エージェントワークフロー互換）

### エージェント構成

| エージェント      | 役割                                     | 種別   |
| ----------------- | ---------------------------------------- | ------ |
| **Orchestrator**  | 状態管理・計画・ヒアリング・リトライ制御 | Agent  |
| **Brainstormer**  | 壁打ち対話でインプット収集               | Agent  |
| **Localizer**     | 翻訳のみ（AI 判断必須）                  | Agent  |
| **Summarizer**    | 要約・再構成（AI 判断必須）              | Agent  |
| **JSON Reviewer** | content.json 品質レビュー（翻訳・構造）  | Agent  |
| **PPTX Reviewer** | PPTX 品質レビュー（視覚・ノート・CTA）   | Agent  |
| Classifier        | 入力分類・方式判定                       | Script |
| Validator         | IR スキーマ検証・空コンテンツ検出        | Script |
| Builder           | PPTX 生成（決定論的処理）                | Script |

### ワークフロー図

```
[ユーザー入力]
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  TRIAGE: [Orchestrator] 入力判断・フロー分岐                  │
│    A: 壁打ち必要 → BRAINSTORM                                │
│    B: 入力あり → INIT                                        │
│    C: 途中再開 → 該当フェーズ                                 │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  INIT: [classify_input.py] 入力分類・方式判定             　  │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  PLAN: [Orchestrator] ユーザー確認（★必須）           　     │
│    方式・枚数・詳しさを提示し承認を得る                 　     │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  EXTRACT: [スクリプト群] 並列抽出                             │
│    → {base}_content.json                                    │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  TRANSLATE: [Localizer] AI 翻訳                             │
│    → {base}_content_ja.json                                 │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  REVIEW(JSON): [JSON Reviewer] content.json 品質チェック     │
│    → 翻訳品質・技術用語・ノート充実度を検証                   │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  BUILD: [create_from_template.py] PPTX 生成                  │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  REVIEW(PPTX): [PPTX Reviewer] 視覚・ノート・CTA 品質確認     │
│    FAIL時は差し戻し（最大3回）→ ESCALATE                      │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  DONE: 最終出力 output_ppt/{base}.pptx                       │
│    PowerPoint で確認                                        │
└─────────────────────────────────────────────────────────────┘
```

> 💡 **Brainstormer**: 入力が曖昧な場合、TRIAGE で壁打ちエージェントを呼び出し、対話的に要件を整理してから INIT に進みます。

詳細は [AGENTS.md](AGENTS.md) を参照。

### 4 つの生成方式

| 方式            | 説明                                  | 推奨度            |
| --------------- | ------------------------------------- | ----------------- |
| **template** ⭐ | テンプレート継承で任意枚数生成        | ⭐⭐⭐⭐⭐ 最推奨 |
| **reconstruct** | 英語 PPTX → 日本語化（マスター継承）  | ⭐⭐⭐⭐⭐ 最推奨 |
| **python-pptx** | JSON からシンプルできれいに新規作成   | ⭐⭐⭐⭐ オススメ |
| **pptxgenjs**   | JS スクリプトで直接生成（コード向け） | ⭐⭐⭐⭐ オススメ |

> 💡 Orchestrator が入力タイプに応じて最適な方式を自動提案します。

---

## 📚 ドキュメント

| ドキュメント                                           | 説明                     |
| ------------------------------------------------------ | ------------------------ |
| **[AGENTS.md](AGENTS.md)**                             | エージェント設計とフロー |
| **[docs/SETUP.md](docs/SETUP.md)**                     | セットアップ手順         |
| **[docs/TEMPLATE-DESIGN.md](docs/TEMPLATE-DESIGN.md)** | テンプレート設計ガイド   |
| **[CONTRIBUTING.md](CONTRIBUTING.md)**                 | 貢献ガイド               |
| **[ATTRIBUTION.md](ATTRIBUTION.md)**                   | 帰属表示ガイドライン     |

---

## 📁 ディレクトリ構成

```
Ag-ppt-create/
├── input/             # 📥 入力ソース（PPTX、Markdown 等）
├── output_ppt/        # 📤 生成された PPTX 出力先
├── output_manifest/   # 🔧 中間生成物（content.json 等）
├── images/            # 🖼️ 抽出・ダウンロード画像
├── templates/         # 📋 PPTX テンプレート
├── scripts/           # ⚙️ 汎用 PPTX 操作スクリプト
├── scripts_temp/      # 🧪 一時スクリプト（Git 除外）
├── workspace/         # 🗂️ スキーマ定義
├── docs/              # 📚 ドキュメント
└── .github/           # 🤖 Copilot 設定・エージェント定義
```

---

## ⚙️ 機能

### 主要スクリプト

| スクリプト                 | 用途                                    |
| -------------------------- | --------------------------------------- |
| `classify_input.py`        | ★ 入力分類・方式判定                    |
| `reconstruct_analyzer.py`  | ★ 英語版 PPTX → content.json 抽出       |
| `create_from_template.py`  | ★ テンプレート継承で PPTX 生成          |
| `validate_content.py`      | ★ IR スキーマ検証・空コンテンツ検出     |
| `validate_pptx.py`         | ★ PPTX 検証（スライド数・ノート・画像） |
| `review_pptx.py`           | ★ PPTX コンテンツ抽出・レビュー用       |
| `analyze_template.py`      | テンプレートのレイアウト分析            |
| `create_ja_pptx.py`        | 白紙から新規 PPTX 作成                  |
| `create_pptx.js`           | pptxgenjs で PPTX 作成                  |
| `insert_diagram_slides.py` | 図形スライドを任意位置に挿入            |
| `merge_slides.py`          | 構成図スライドをテンプレートにマージ    |

### 補助スクリプト

| スクリプト                 | 用途                                 |
| -------------------------- | ------------------------------------ |
| `extract_images.py`        | PPTX から画像を抽出                  |
| `diagnose_template.py`     | テンプレート品質診断                 |
| `clean_template.py`        | テンプレートから不要要素を削除       |
| `create_clean_template.py` | 元 PPTX からクリーンテンプレート生成 |
| `summarize_content.py`     | コンテンツ要約・再構成               |
| `workflow_tracer.py`       | ワークフロー観測・トレースログ       |
| `resume_workflow.py`       | エスカレーション後の再開             |

> 💡 **画像埋め込み対応**: `create_from_template.py`、`create_ja_pptx.py`、`create_pptx.js` は content.json 内の `image` フィールドで画像埋め込みに対応しています。

> 📝 **スピーカーノート対応**: content.json の各スライドに `notes` フィールドを記載すると、生成された PPTX のスピーカーノートに反映されます。

---

## 🔍 方式選択ガイド

### 選択フローチャート

```
英語版 PPTX を日本語化したい？
├─ YES → reconstruct（最推奨）⭐⭐⭐⭐⭐
│
└─ NO
    ├─ テンプレートがある？
    │   └─ YES → template（最推奨）⭐⭐⭐⭐⭐
    │
    ├─ コード/技術内容が多い？
    │   └─ YES → pptxgenjs ⭐⭐⭐⭐
    │
    └─ 一般的な内容
        └─ python-pptx ⭐⭐⭐⭐
```

### 各方式の特徴

| 方式        | メリット                         | デメリット                 | 推奨用途                   |
| ----------- | -------------------------------- | -------------------------- | -------------------------- |
| template    | 企業テンプレートのデザイン継承   | テンプレート設計が必要     | 社内標準テンプレートがある |
| reconstruct | 元 PPTX のマスターを完璧に継承   | 英語版 PPTX 入力が必要     | 英語版 PPTX を日本語化     |
| python-pptx | シンプル、依存少ない、安定性高い | デザインカスタマイズ限定的 | テンプレートがない場合     |
| pptxgenjs   | コードブロック表示に強い         | Node.js 必要               | 技術内容・コードが多い     |

> ⚠️ **preserve 方式**は experimental です。図・グラフで崩れやすいため、現在は reconstruct 方式を推奨しています。

---

## 📋 テンプレートチェックリスト

テンプレートを作成・選定する際の確認事項：

| 項目               | 推奨                                            |
| ------------------ | ----------------------------------------------- |
| **スライドサイズ** | 16:9（13.33" × 7.5"）                           |
| **必須レイアウト** | Title / Content / Section / Blank の 4 種類以上 |
| **プレースホルダ** | 固定テキストボックスではなく TITLE/BODY を使用  |
| **フォント**       | Windows 標準（Segoe UI, Yu Gothic UI）推奨      |

詳細は **[テンプレート設計ガイド](docs/TEMPLATE-DESIGN.md)** を参照。

---

## ⚠️ セキュリティ

本プロジェクトは外部モジュールに依存しています。サプライチェーンリスクや脆弱性報告については **[SECURITY.md](.github/SECURITY.md)** を参照してください。

---

## 参考

- [python-pptx](https://python-pptx.readthedocs.io/) - Python PPTX ライブラリ
- [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) - JavaScript PPTX ライブラリ

## このリポジトリの作り方

このリポジトリは GitHub Copilot（Claude）との対話で構築しました。

👉 **[作成手順・指示例を見る](docs/HOW-I-BUILT-THIS.md)**

## コントリビュート

プルリクエスト歓迎です！詳細は [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

## ライセンス

[CC BY-NC-SA 4.0](LICENSE)（非商用・継承）
