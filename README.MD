# Ag-ppt-create

> 🤖 AI エージェントが PowerPoint を自動生成するためのツールキット

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)

[python-pptx](https://python-pptx.readthedocs.io/) と [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) を使用した PPTX 自動生成ツールキットです。

## ⚖️ ライセンスと使用条件

本プロジェクトは **CC BY-NC-SA 4.0** ライセンスの下で提供されています。
詳細は [LICENSE](LICENSE) をご確認ください。

## 機能

| スクリプト                | 用途                           |
| ------------------------- | ------------------------------ |
| `reorder_slides.py`       | スライドの並び替え・複製       |
| `extract_shapes.py`       | テキスト構造を JSON 抽出       |
| `apply_content.py`        | テンプレート内テキスト置換     |
| `create_from_template.py` | テンプレート継承で任意枚数生成 |
| `create_ja_pptx.py`       | 白紙から新規 PPTX 作成         |
| `create_pptx.js`          | pptxgenjs で PPTX 作成         |
| `convert_html.js`         | HTML/CSS → PPTX 変換           |
| `convert_html_multi.js`   | 複数 HTML の一括 PPTX 変換     |
| `gen_preview.py`          | PPTX からサムネイル画像を生成  |

> 💡 **画像埋め込み対応**: `create_from_template.py`、`create_ja_pptx.py`、`create_pptx.js` は content.json 内の `image` フィールドで画像埋め込みに対応しています。

## セットアップ

### 前提条件

- **PowerPoint** がインストールされていること（PPTX ファイルを開いて確認するため）
- **Python 3.10+**
- **Node.js 18+**

👉 **[詳細なセットアップ手順](docs/SETUP.md)**

## ⚠️ セキュリティ

本プロジェクトは外部モジュールに依存しています。サプライチェーンリスクや脆弱性報告については **[SECURITY.md](.github/SECURITY.md)** を参照してください。

---

## 使い方

VS Code で GitHub Copilot の **Agent モード** を使用します。

**推奨設定:**

| 項目         | 推奨                                                       |
| ------------ | ---------------------------------------------------------- |
| モード       | Agent モード                                               |
| エージェント | **Orchestrator**（`.github/agents/orchestrator.agent.md`） |
| モデル       | Claude Opus 4                                              |

### 📥 入力のバリエーション

| 入力タイプ   | 例                                            |
| ------------ | --------------------------------------------- |
| **URL**      | ブログ記事、ドキュメント、Qiita、Zenn 等      |
| **テキスト** | 箇条書きメモ、議事録、要件定義                |
| **画像**     | スクリーンショット、手書きメモ、図解          |
| **ファイル** | Markdown、Word、PDF（テキスト抽出可能なもの） |
| **口頭指示** | 「〇〇について説明するスライド作って」        |

### 🚀 お任せモード（推奨）

シンプルに依頼するだけ。**B + D パターンを同時生成**してユーザーが選べます：

- **B パターン**: `create_from_template` + 詳細版（テンプレートデザイン継承）
- **D パターン**: `pptxgenjs` + 詳細版（コードブロック対応、カスタムデザイン）

```
お任せモードでプレゼン作成して
https://example.com/article

この画像の内容をスライドにして（お任せで）
[画像を貼り付け]
```

### 🎨 カスタムモード

方式・枚数・トーンを細かく指定：

```
カスタムモードでプレゼン作成して
- 方式: template（テンプレート継承）
- 枚数: 10-15枚
- トーン: カジュアル
- 用途: 社内LT
- URL: https://example.com/article
```

> 💡 「お任せモードで」「カスタムでお願いします」など、モードを指定するだけで OK。
> お任せモードでは、**B（template）+ D（pptxgenjs）の両方を同時生成**し、好みを選べます。

### 手動で実行する場合

```powershell
# テンプレートからプレゼン作成
python scripts/reorder_slides.py templates/sample.pptx output_manifest/working.pptx 0,3,3,5
python scripts/extract_shapes.py output_manifest/working.pptx output_manifest/inventory.json
python scripts/apply_content.py output_manifest/working.pptx output_manifest/replacements.json output_ppt/output.pptx

# 確認
Start-Process output_ppt/output.pptx
```

## エージェントワークフロー

本リポジトリは **9 つの専門エージェント** がチームで PPTX を生成します。

### 前提条件

- **VS Code** + **GitHub Copilot 拡張機能**
- **Agent モード対応モデル**が必須（Agent モード非対応のモデルでは動作しません）

### モデル要件（重要）

- **前提**: 本リポジトリのエージェントワークフロー（`flow-orchestrator` → `manifest-gateway` → `svg-forge`）は、エージェントワークフローに対応した AI モデルが必要です。非対応モデルでは、分割実行・レビュー内蔵・保存前ゲートなどの段階的処理が動作しません。
- **推奨モデル**: Opus（エージェントワークフロー互換。複雑な図面生成に強く、レビュー反復の安定性が高い）
- **動作保証の範囲**: 上記モデルでの動作を前提に品質ゲート・チェックポイント設計を行っています。他モデルを使用する場合は、生成フェーズを単体実行に切り替えるか、手動レビューを前提にしてください。

### エージェント構成

| エージェント          | 役割                                          |
| --------------------- | --------------------------------------------- |
| **Router**            | 入力分類・方式判定（軽量）                    |
| **Orchestrator**      | 状態管理・エージェント呼び出し                |
| **Template Analyzer** | テンプレート選定・構造解析                    |
| **Content Writer**    | コンテンツ作成・JSON 生成・画像取得           |
| **Localizer**         | テキスト翻訳（ANALYZE/CONSOLIDATE/TRANSLATE） |
| **Notes Translator**  | スピーカーノート翻訳                          |
| **Validator**         | 自動検証（JSON/HTML 構造チェック）            |
| **Builder**           | PPTX 生成コマンド実行                         |
| **QA Agent**          | 最終品質レビュー（人間判断が必要な評価）      |

### 4 つの生成方式

| 方式            | 説明                                  | 使用ツール                                        | 推奨度            |
| --------------- | ------------------------------------- | ------------------------------------------------- | ----------------- |
| **template** ⭐ | テンプレート継承で任意枚数生成        | `analyze_template.py` + `create_from_template.py` | ⭐⭐⭐⭐⭐ 最推奨 |
| **python-pptx** | JSON からシンプルできれいに新規作成   | `create_ja_pptx.py`                               | ⭐⭐⭐⭐ オススメ |
| **pptxgenjs**   | JS スクリプトで直接生成（コード向け） | カスタム JS                                       | ⭐⭐⭐⭐ オススメ |
| **html**        | HTML/CSS → PPTX 変換                  | `convert_html_multi.js`                           | ⭐⭐ 改善中       |

> ⭐ **お任せモード**では **B（template）+ D（pptxgenjs）を同時生成**し、ユーザーが好みを選択

## 方式選択ガイド

### 選択フローチャート

```
テンプレートがある（正しく設計されている）？
├─ YES → template（最推奨）⭐⭐⭐⭐⭐
│         analyze_template.py + create_from_template.py
│
└─ NO
    ├─ コード/技術内容が多い？
    │   └─ YES → pptxgenjs ⭐⭐⭐⭐
    │
    └─ 一般的な内容
        └─ python-pptx ⭐⭐⭐⭐
            create_ja_pptx.py（シンプルできれい）

※ html 方式は現在改善中（⭐⭐）
```

### 各方式の特徴

#### template（テンプレート継承）⭐⭐⭐⭐⭐ 最推奨

- **メリット**: 企業テンプレートのデザインをそのまま継承、任意枚数生成可能
- **デメリット**: テンプレートが正しく設計されている必要あり
- **使用ツール**: `analyze_template.py` → `create_from_template.py`
- **推奨用途**: 社内標準テンプレートがある場合

#### python-pptx（白紙から新規）⭐⭐⭐⭐ オススメ

- **メリット**: シンプルできれい、依存少ない、安定性高い
- **デメリット**: デザインのカスタマイズは限定的
- **使用ツール**: `create_ja_pptx.py`
- **推奨用途**: テンプレートがない場合のデフォルト

#### pptxgenjs（JavaScript 直接）⭐⭐⭐⭐ オススメ

- **メリット**: シンプルできれい、コードブロック表示に強い
- **デメリット**: Node.js 必要
- **使用ツール**: カスタム JS スクリプト
- **推奨用途**: 技術内容・コードが多い場合

#### html（HTML ベース）⭐⭐ 改善中

- **メリット**: 自由度が高い、再構成が可能
- **デメリット**: 現状デザインが今ひとつ（改善予定）
- **使用ツール**: `convert_html_multi.js`
- **推奨用途**: 今後の改善に期待

### 非推奨・統合された方式

| 方式                         | 状態   | 理由                                                             |
| ---------------------------- | ------ | ---------------------------------------------------------------- |
| **preserve**                 | 非推奨 | 英語版 PPTX の日本語化で使用。図・グラフで崩れやすい（改善予定） |
| **テンプレートベース（旧）** | 統合   | `create_from_template.py` に統合                                 |

---

#

### クイックチェックリスト

テンプレートを作成・選定する際の最低限の確認事項：

| 項目               | 推奨                                                       |
| ------------------ | ---------------------------------------------------------- |
| **スライドサイズ** | 16:9（13.33" × 7.5"）                                      |
| **必須レイアウト** | Title / Content / Section / Blank の 4 種類以上            |
| **プレースホルダ** | 固定テキストボックスではなく、TITLE/BODY を使用            |
| **フォント**       | Windows 標準（Segoe UI, Yu Gothic UI）推奨                 |
| **コントラスト**   | WCAG 4.5:1 以上（黒 on 白、白 on 濃色）                    |
| **レイアウト名**   | 英語キーワード含む（"Title Slide", "Section Header" など） |

### レイアウト不足時の自動補完

テンプレートに必要なレイアウト（title, content, section, two_content, blank, agenda, closing）が不足している場合、PowerPoint COM で自動生成できます：

```powershell
# レイアウト確認
.\scripts\ensure_layouts.ps1 -InputPath "templates\mytemplate.pptx"

# 不足レイアウトを自動追加
.\scripts\create_master_set.ps1 -InputPath "templates\mytemplate.pptx" -OutputPath "templates\mytemplate_complete.pptx"
```

### 本ツールキットでの使い方

```powershell
# 1. テンプレートのレイアウトを分析（初回のみ）
python scripts/analyze_template.py templates/mytemplate.pptx
# → templates/mytemplate_layouts.json が生成される

# 2. PPTX 生成（レイアウト設定は自動検出）
python scripts/create_from_template.py templates/mytemplate.pptx content.json output.pptx
```

### content.json でのスライドタイプ指定

```json
{
  "slides": [
    { "type": "title", "title": "発表タイトル", "subtitle": "サブタイトル" },
    { "type": "agenda", "title": "目次", "items": ["項目1", "項目2"] },
    { "type": "content", "title": "本文", "items": ["箇条書き1", "箇条書き2"] },
    { "type": "closing", "title": "Thank You" }
  ]
}
```

`type` で指定すると `layouts.json` に従ってレイアウトが選択されます。直接指定する場合は `"layout": 9` のように番号を使用。

> 📖 スライドマスターの詳細、プレースホルダの設計、配色・フォントのベストプラクティスは **[テンプレート設計ガイド](docs/TEMPLATE-DESIGN.md)** を参照してください。

---

### ワークフロー図

```
[ユーザー入力]
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  [Orchestrator] 状態管理・計画・エージェント呼び出し        │
│    ※ パイプラインの起点                                    │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  [Router] 入力分類・方式判定                                 │
│    出力: { type, method, base_name }                        │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  [Template Analyzer] ※テンプレート方式のみ                  │
│    出力: {base}_working.pptx, {base}_inventory.json         │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  [Content Writer] コンテンツ作成                            │
│    出力: {base}_replacements.json / {base}_slides/          │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  [Validator] 自動検証（JSON/HTML構造チェック）              │
│    結果: PASS / FAIL → 修正ループ（最大3回）               │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  [Builder] PPTX生成                                         │
│    出力: output_ppt/{base}.pptx                             │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  [QA Agent] 最終品質レビュー                                │
│    結果: APPROVE / REJECT + スコア                          │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
最終出力: output_ppt/{base}.pptx

※ {base} = {YYYYMMDD}_{keyword}_{purpose}
```

詳細は [AGENTS.md](AGENTS.md) を参照。

## プロジェクト情報

### 📚 ドキュメント

- **[AGENTS.md](AGENTS.md)** — エージェント設計とワークフロー
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — 貢献ガイド
- **[ATTRIBUTION.md](ATTRIBUTION.md)** — 帰属表示ガイドライン
- **[LICENSE](LICENSE)** — ライセンス（CC BY-NC-SA 4.0）
- **[SECURITY.md](.github/SECURITY.md)** — セキュリティポリシー
- **[CODE_OF_CONDUCT.md](.github/CODE_OF_CONDUCT.md)** — 行動規範

### 🤝 Contributing

貢献を歓迎します！詳細は [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

### ⚖️ Commercial Use

商用利用をご希望の場合は、[@aktsmm](https://github.com/aktsmm) までお問い合わせください。

### 📄 Citation

本ソフトウェアを使用する場合は、以下の形式で引用してください：

```
Based on Ag-ppt-create by aktsmm
https://github.com/aktsmm/Ag-ppt-create
License: CC BY-NC-SA 4.0
```

詳細は [ATTRIBUTION.md](ATTRIBUTION.md) を参照。

## ディレクトリ構成

```
Ag-ppt-create/
├── input/             # 📥 入力ソース（テキスト、URL リスト、原稿など）
├── output_ppt/        # 📤 生成された PPTX 出力先
├── output_manifest/   # 🔧 中間生成物（JSON、作業用 PPTX）
├── templates/         # 📋 PPTX テンプレート
├── scripts/           # ⚙️ PPTX 操作ツール
├── workspace/         # 🗂️ 作業用ディレクトリ（HTML スライド等）
├── docs/              # 📚 ドキュメント
└── .github/           # 🤖 Copilot 設定・エージェント定義
```

## 参考

- [python-pptx](https://python-pptx.readthedocs.io/) - Python PPTX ライブラリ
- [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) - JavaScript PPTX ライブラリ

## このリポジトリの作り方

このリポジトリは GitHub Copilot（Claude）との対話で構築しました。
すべてのスクリプトは公式ドキュメントのみを参考に独自実装しています。

👉 **[作成手順・指示例を見る](docs/HOW-I-BUILT-THIS.md)**

## コントリビュート

プルリクエスト歓迎です！詳細は [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

## ライセンス

[CC BY-NC-SA 4.0](LICENSE)（非商用・継承）
