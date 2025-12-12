# Repository Copilot Instructions (Revised)

PPTX 自動生成プロジェクト向けの共通ガードレール。エージェント固有の指示は `.github/agents/*.agent.md` を参照。

## コミュニケーション

- 日本語で簡潔に回答。コードコメントは英語。
- ブロッカーは最初に共有。
- ファイル参照はパスを明記（例: scripts/extract_shapes.py）。

## コーディング規約

- PowerShell コマンドは `;` で連結（`&&` 禁止）。UTF-8 BOM が必要な場合は `[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($true))` を使用。
- Python: 型ヒント必須、Google スタイル docstring。
- JavaScript/Node: ES Modules、async/await。
- 生成物は ASCII 優先。非 ASCII は既存利用時のみ。

## エージェント原則

- 単一責務。Router=分類、Orchestrator=状態管理、Template Analyzer=inventory 生成、Content Writer=content.json(IR)生成/画像取得、Localizer=翻訳、Notes Translator=ノート翻訳、Validator=検証、Builder=適用、QA=人間判断。
- I/O 契約を遵守: context/inventory/analysis/slides_to_keep/replacements/notes/notes_ja/output_ppt。
- すべての中間ファイルに `{base}_` プレフィックスを付け `output_manifest/` に保存。
- **画像は `images/{base}/` に保存**し、content.json で `image.path` を指定。

## PLAN フェーズ確認プロセス（★ 必須）

**PPTX 生成を始める前に、必ずユーザーに確認を取る。勝手に進めない。**

### 確認すべき項目

1. **方式**: `create_from_template`（推奨）/ `create_ja_pptx` / `pptxgenjs`
2. **詳しさ**: 詳細版（推奨）/ 標準版 / 要約版
3. **目標枚数**: 記事長に応じて複数提案
4. **テンプレート**: sample-ppf / template / カスタム
5. **画像取り込み**: 全て（推奨）/ 主要のみ / なし

### デフォルト動作（★ 重要）

**ユーザーが「お任せ」または特に指定しない場合は、B + D パターンを同時生成。**

- **B パターン**: `create_from_template` + 詳細版（テンプレートデザイン継承）
- **D パターン**: `pptxgenjs` + 詳細版（コードブロック対応、カスタムデザイン）
- 両方を生成してユーザーが好みを選べるようにする
- 画像は全て取得・配置
- スライド枚数は多めに（15-20 枚目安）

### 提案フォーマット例

```
## 📋 生成プラン確認

**入力**: [記事タイトル]

### 提案A: 標準版
- 方式: create_from_template
- 枚数: 12枚
- 詳しさ: 標準
- 画像: 主要5枚

### 提案B（推奨）: 詳細版（テンプレート）
- 方式: create_from_template
- 枚数: 18枚、画像: 全て
- 各手順を個別スライドに

### 提案C: 要約版
- 枚数: 7枚、画像2枚

### 提案D: 詳細版（pptxgenjs）
- 方式: pptxgenjs
- 枚数: 18枚、画像: 全て
- コードブロック対応、カスタムデザイン

どの提案で進めますか？（指定なし/お任せの場合は B + D を同時生成）
```

**確認なしに BUILD まで進めることは禁止。**

## PPTX 操作原則

1. テンプレート優先。rearrange → inventory → replace の順で冪等に。
2. JSON 中間形式で置換。箇条書きは禁止記号を使わず bullet フラグで指定。
3. 狭小シェイプは英語維持または短縮。80% 文字数ルールを適用。
4. **PPTX 生成完了後は必ず PowerPoint で開く（★ 必須）**
   ```powershell
   Start-Process "output_ppt/{base}.pptx"
   ```

## 方式選定

| 用途              | 推奨方式                                          | 推奨度     | 備考                 |
| ----------------- | ------------------------------------------------- | ---------- | -------------------- |
| テンプレート利用  | `analyze_template.py` + `create_from_template.py` | ⭐⭐⭐⭐⭐ | 最推奨、デザイン継承 |
| 白紙から新規作成  | `create_ja_pptx.py`                               | ⭐⭐⭐⭐   | シンプルできれい     |
| コード/技術内容多 | カスタム JS (pptxgenjs)                           | ⭐⭐⭐⭐   | コードブロック向け   |
| HTML ベース       | `convert_html_multi.js`                           | ⭐⭐       | 非推奨（IR 迂回）    |

## ツール使用ルール

- `reorder_slides.py`: 0 始まり index
- `extract_shapes.py`: inventory/analysis 出力、編集不可
- `apply_content.py`: replacements + slides_to_keep を適用
- `convert_html.js/multi`: 16:9 推奨
- `translate_notes.py`: extract/apply の 2 ステップ
- `create_ja_pptx.py`: JSON→ 新規 PPTX（python-pptx）
- `check_overflow.py`: bbox 事前検証
- `analyze_template.py`: テンプレートのレイアウト分析 → layouts.json 生成（初回のみ）
- `create_from_template.py`: content.json + テンプレート → PPTX（layouts.json 自動検出、画像配置対応）
  - **検証機能**: `type='content'` に `items`/`bullets` がないスライドを検出し終了コード 1 で中断
  - Orchestrator は終了コードを見て Content Writer に差し戻し → 修正 → リトライ（最大 3 回）
  - `--force` で警告付き強制生成可

### 画像取得ルール（Web ソース時）★ 必須

Web ソース（Qiita, Zenn, ブログ等）からの PPTX 生成では、**画像取得を最初に行う**。

```powershell
# 1. 記事取得と画像URL抽出
$base = "20251212_example_blog"
curl -s "https://qiita.com/api/v2/items/{item_id}" -o "input/article.json"

# 2. 画像保存ディレクトリ作成
New-Item -ItemType Directory -Path "images/${base}" -Force

# 3. 画像URLを抽出してダウンロード（主要な図を選定）
# Qiita の場合: qiita-image-store.s3.ap-northeast-1.amazonaws.com
curl -s -o "images/${base}/01_architecture.png" "{image_url}"
```

- **保存先**: `images/{base}/` 配下に統一
- **命名規則**: `{連番}_{内容}.png`（例: `01_dns_flow.png`, `02_centralized.png`）
- **配置**: Appendix ではなく**関連スライドに直接配置**
- **type**: 画像スライドは `type: "photo"` を使用

### スライド枚数計算ロジック

```
基本枚数 = タイトル(1) + アジェンダ(1) + コンテンツ + まとめ(1)
画像枚数 = 取得した主要画像の数
─────────────────────────────────
合計枚数 = 基本枚数 + 画像枚数
```

| ソース種別   | 画像なし目安 | 画像あり目安 |
| ------------ | ------------ | ------------ |
| 短い記事     | 5-7 枚       | 8-12 枚      |
| 中程度の記事 | 8-10 枚      | 12-16 枚     |
| 長い技術記事 | 10-12 枚     | 15-20 枚     |

**重要**: 画像が記事に含まれている場合、コンテンツスライドを減らすのではなく、**画像スライドを追加**する。

> ⚠️ 重要: `extract_shapes.py` と `apply_content.py` は同じロジックでシェイプを識別すること。どちらかを修正した場合は双方を同期する。

### テンプレート新規生成の標準フロー

```powershell
$template = "sample-ppf"
$base = "20251212_example_blog"

# 1. layouts.json がなければ分析（初回のみ）
if (-not (Test-Path "templates/${template}_layouts.json")) {
    python scripts/analyze_template.py "templates/${template}.pptx"
}

# 2. ★ Web ソースの場合は画像取得を最初に行う
New-Item -ItemType Directory -Path "images/${base}" -Force
# 記事から画像URLを抽出してダウンロード
curl -s -o "images/${base}/01_diagram.png" "{extracted_image_url}"

# 3. content.json 作成（画像パスを含める）
# → type: "photo" で image.path を指定

# 4. PPTX 生成（--config は自動検出されるので省略可）
python scripts/create_from_template.py "templates/${template}.pptx" "output_manifest/${base}_content.json" "output_ppt/${base}.pptx"
```

### Web ソースからの PPTX 生成フロー（全方式共通）

```
1. 記事取得（API or fetch）
     ↓
2. ★ 画像URL抽出 & ダウンロード（images/{base}/）
     ↓
3. 枚数計算: 基本枚数 + 画像枚数
     ↓
4. content.json 作成（type: "photo" で画像配置）
     ↓
5. PPTX 生成
```

**フロー遵守**: 画像取得をスキップして後から追加するのは禁止。最初から画像を含めた content.json を作成する。

## 禁止事項

- PPTX バイナリの直接編集。
- 指定フォルダ外への出力（PPTX は `output_ppt/`、中間ファイルは `output_manifest/`）。
- ファイル削除 → 再作成（新規名 `_v2` などで作成）。
- 箇条書き記号の直接埋め込み。

## ファイルマップ

```
.github/
├── agents/
│   ├── orchestrator.agent.md
│   ├── router.agent.md
│   ├── template.agent.md
│   ├── content.agent.md
│   ├── localizer.agent.md
│   ├── notes.agent.md
│   ├── validator.agent.md
│   ├── builder.agent.md
│   └── qa.agent.md
├── instructions/
│   ├── core.instructions.md
│   ├── common.instructions.md
│   ├── convert_html.instructions.md
│   ├── template.instructions.md
│   ├── purpose-report.instructions.md
│   ├── purpose-incident.instructions.md
│   ├── purpose-lt.instructions.md
│   └── purpose-blog.instructions.md
├── copilot-chat-modes/
└── prompts/
```
