# Common Instructions

全エージェント・全方式で共通するルール。

> **Single Source of Truth**: 本ファイルが共通ルールの定義元。他のファイルは参照のみ。

---

## 設計原則

AGENTS.md で定義された設計原則の詳細実装ガイド。

### Dynamic Context（動的コンテキスト）

出力先（テンプレート）の特性をハードコードせず、処理開始時に取得して全ステップに伝播する。

```python
# ❌ NG: ハードコード
slide_width = 13.333  # 標準サイズのみ想定

# ✅ OK: 動的取得
slide_width = prs.slide_width.inches  # 任意のテンプレートに対応
```

**適用箇所:**

- 画像配置計算（`add_image_to_slide()`）
- コードブロック配置（`add_slide_from_layout()`）
- オーバーフロー検証（`validate_pptx.py`）
- pptxgenjs での図形生成（下記参照）

### pptxgenjs のスライドサイズ（★ 重要）

**重要**: pptxgenjs の `LAYOUT_16x9` は **10" × 5.625"** であり、PowerPoint 標準ワイドスクリーン（13.33" × 7.5"）とは異なる。

```javascript
// ❌ NG: 13.33インチ幅を想定したハードコード
const x = 12.0; // 10インチスライドではみ出す

// ✅ OK: defineLayout でテンプレートサイズに合わせる
pptx.defineLayout({ name: "TEMPLATE", width: 13.33, height: 7.5 });
pptx.layout = "TEMPLATE";
const SLIDE_WIDTH = 13.33; // 変数で管理
```

**サイズ確認方法**:

```javascript
console.log(
  `Actual size: ${pptx.presLayout.width}" x ${pptx.presLayout.height}"`
);
```

> 📖 詳細なワークフローは [tools-reference.instructions.md](tools-reference.instructions.md) を参照。

### Complete Extraction（完全抽出）

Web ソースからの抽出時、以下の全要素を明示的にリストアップして取得する：

| 要素           | 取得方法                | 格納先                          |
| -------------- | ----------------------- | ------------------------------- |
| タイトル       | `<title>` or `<h1>`     | `metadata.title`                |
| 本文テキスト   | `<article>` or `<main>` | `slides[].items`                |
| 画像 URL       | `<img src>`             | `images/{base}/` にダウンロード |
| コードブロック | `<pre><code>`           | `slides[].code`                 |
| メタデータ     | `<meta>` tags           | `metadata.*`                    |

**重要**: `fetch_webpage` は画像 URL を返さない場合があるため、別途 `curl` + 正規表現で抽出すること。

---

## スクリプト配置ルール

| フォルダ        | 用途                               |
| --------------- | ---------------------------------- |
| `scripts/`      | 汎用的なパイプラインスクリプト     |
| `scripts_temp/` | 一時的なプロジェクト固有スクリプト |

**ルール**:

- 汎用スクリプト → `scripts/`
- 特定プロジェクト用の一時スクリプト → `scripts_temp/`
- 汎用化したら `scripts/` に移動し、AGENTS.md に追記

---

## ファイル命名規則

### 共通フォーマット

```
{YYYYMMDD}_{keyword}_{purpose}.{ext}
```

| 要素       | 説明                                       | 例                                 |
| ---------- | ------------------------------------------ | ---------------------------------- |
| `YYYYMMDD` | 生成日（必須）                             | `20241211`                         |
| `keyword`  | 内容を表す英語キーワード（スネークケース） | `q3_sales`, `git_cleanup`          |
| `purpose`  | 用途                                       | `report`, `lt`, `incident`, `blog` |
| `ext`      | 拡張子                                     | `pptx`, `json`                     |

### ファイル種別と出力先

| ファイル種別        | 出力先             | ファイル名パターン          |
| ------------------- | ------------------ | --------------------------- |
| **最終 PPTX**       | `output_ppt/`      | `{base}.pptx`               |
| 作業用 PPTX         | `output_manifest/` | `{base}_working.pptx`       |
| pptxgenjs 図形 PPTX | `output_manifest/` | `{base}_diagrams.pptx`      |
| 挿入設定 JSON       | `output_manifest/` | `{base}_insert_config.json` |
| inventory           | `output_manifest/` | `{base}_inventory.json`     |
| replacements        | `output_manifest/` | `{base}_replacements.json`  |
| slides フォルダ     | `output_manifest/` | `{base}_slides/`            |

※ `{base}` = `{YYYYMMDD}_{keyword}_{purpose}`

### キーワード生成ルール

1. `metadata.title` または `slide-0` のタイトルから生成
2. 日本語 → 英語に意訳（スネークケース）
3. **30 文字以内**
4. 使用可能文字: `a-z`, `0-9`, `_` のみ

### 日本語 → 英語 変換ガイド

| 日本語       | 英語キーワード    |
| ------------ | ----------------- |
| 売上報告     | `sales_report`    |
| 進捗報告     | `progress_report` |
| 企画提案     | `proposal`        |
| 障害報告     | `incident_report` |
| ブランチ整理 | `branch_cleanup`  |
| ツール紹介   | `tool_intro`      |
| 新機能説明   | `new_feature`     |
| 〜やってみた | `trying_xxx`      |
| 〜入門       | `intro_to_xxx`    |
| 比較         | `comparison`      |

### 重複時の対応

同名ファイルが存在する場合、末尾に連番を付与:

```
20241211_q3_sales_report.pptx
20241211_q3_sales_report_01.pptx
20241211_q3_sales_report_02.pptx
```

### 命名例

| 入力内容（日本語）           | 出力ファイル名                          |
| ---------------------------- | --------------------------------------- |
| Q3 売上報告（報告用途）      | `20241211_q3_sales_report.pptx`         |
| Git ブランチ整理術（LT）     | `20241211_git_branch_cleanup_lt.pptx`   |
| 決済システム障害（障害報告） | `20241211_payment_system_incident.pptx` |
| Zenn 記事変換（ブログ）      | `20241211_zenn_article_blog.pptx`       |

### 🚨 TIPS: 命名規則の徹底

> **すべての中間ファイルに `{base}_` プレフィックスを付ける**

#### よくあるミス

```powershell
# ❌ NG: プレフィックスなし
output_manifest/replacements.json
output_manifest/inventory.json
output_manifest/working.pptx

# ✅ OK: プレフィックス付き
$base = "20251211_git_branch_cli_blog"
output_manifest/${base}_replacements.json
output_manifest/${base}_inventory.json
output_manifest/${base}_working.pptx
```

#### 理由

1. **複数プロジェクトの並行作業**: 同じフォルダに複数の作業ファイルが混在しても区別可能
2. **履歴管理**: いつ、何のために作ったかが一目でわかる
3. **クリーンアップ**: 古いファイルを日付で一括削除可能

#### 変数定義の推奨

```powershell
# スクリプト冒頭で定義
$base = "{YYYYMMDD}_{keyword}_{purpose}"

# 以降は変数を使用
python scripts/reorder_slides.py ... "output_manifest/${base}_working.pptx" ...
python scripts/extract_shapes.py ... "output_manifest/${base}_inventory.json"
python scripts/apply_content.py ... "output_manifest/${base}_replacements.json" "output_ppt/${base}.pptx"
```

---

## 箇条書きフォーマット

> **⚠️ 致命的ルール**: 手動の箇条書き記号は禁止。必ず構造化された形式を使用。

### 禁止文字（text 先頭で使用禁止）

`•` `・` `●` `○` `-` `*` `+`

---

## 🚨 IR スキーマの使い分け（★ 重要）

**2 つの異なる JSON 形式が存在します。混同しないでください。**

| 形式                  | 用途                         | スキーマ                        | items の型                |
| --------------------- | ---------------------------- | ------------------------------- | ------------------------- |
| **content.json**      | reconstruct / summarize 方式 | `workspace/content.schema.json` | `string[]` 文字列配列     |
| **replacements.json** | preserve 方式（実験的）      | なし（非推奨）                  | `{text, bullet, level}[]` |

```json
// ✅ content.json: 文字列配列
{ "items": ["項目1", "項目2"] }

// ❌ スキーマエラー（validate_content.py が検出）
{ "items": [{"text": "項目1", "bullet": true}] }
```

> `validate_content.py` が items 形式を自動検証します。

---

## 🚨 two_column タイプの使い方（★ 重要）

比較スライドを作成する場合は `type: "two_column"` を使用します。

### 必須フィールド

| フィールド    | 型         | 説明                   |
| ------------- | ---------- | ---------------------- |
| `type`        | `string`   | `"two_column"` 固定    |
| `title`       | `string`   | スライドタイトル       |
| `left_title`  | `string`   | 左カラムのタイトル     |
| `left_items`  | `string[]` | 左カラムの箇条書き項目 |
| `right_title` | `string`   | 右カラムのタイトル     |
| `right_items` | `string[]` | 右カラムの箇条書き項目 |

### 正しい形式

```json
{
  "type": "two_column",
  "title": "2つのスタイル比較",
  "left_title": "Sentry",
  "left_items": ["約800行 / 26KB", "詳細・網羅的", "リファレンス型"],
  "right_title": "Temporal",
  "right_items": ["約100行", "シンプル・構造化", "指示型"],
  "notes": "SentryとTemporalで対照的なアプローチ。"
}
```

### ⚠️ よくある間違い

```json
// ❌ NG: items を使用（two_column では無視される）
{
  "type": "two_column",
  "title": "比較",
  "items": ["項目1", "項目2"]
}

// ❌ NG: left_items / right_items がない（空のスライドになる）
{
  "type": "two_column",
  "title": "比較"
}
```

> 📖 詳細: `workspace/content.example.json` を参照

---

## 🚨 TIPS: テキスト表示の注意事項

### 改行コードの取り扱い

| 文字     | 説明               | 結果             |
| -------- | ------------------ | ---------------- |
| `\n`     | 改行（推奨）       | 正常に改行される |
| `\u000b` | 垂直タブ           | **文字化けする** |
| `\r`     | キャリッジリターン | 環境依存         |

```json
// ❌ NG: 垂直タブは文字化けの原因
{ "text": "タイトル\u000bサブタイトル" }

// ✅ OK: 改行は \n を使用、または1行にまとめる
{ "text": "タイトル\nサブタイトル" }
{ "text": "タイトル サブタイトル" }
```

### エスケープシーケンスの表示

技術記事で `\x1b` などのエスケープコードを**表示したい**場合:

| 目的           | 記法      | 表示結果               |
| -------------- | --------- | ---------------------- |
| コードを実行   | `\x1b[A`  | （制御文字として解釈） |
| 文字として表示 | `ESC[A`   | `ESC[A`                |
| 文字として表示 | `<ESC>[A` | `<ESC>[A`              |

```json
// ❌ NG: バックスラッシュがエスケープされ文字化け
{ "text": "\\x1b[A → 上矢印キー" }

// ✅ OK: 読みやすい表記に変換
{ "text": "ESC[A → 上矢印キー" }
{ "text": "<ESC>[A → 上矢印キー" }
```

### スライド領域のオーバーフロー

| inventory.json の height | 推奨テキスト量 | 超えた場合   |
| ------------------------ | -------------- | ------------ |
| 0.5 インチ以下           | 1 行のみ       | 下に突き出る |
| 0.5 - 1.5 インチ         | 1-2 行         | 下に突き出る |
| 1.5 - 3.0 インチ         | 3-5 行         | はみ出し     |
| 3.0 インチ以上           | 5-8 行         | 分割推奨     |

**特に注意が必要なスライド:**

- SUBTITLE プレースホルダー（height が小さい）
- END / Thank You スライド
- セクションヘッダー

### コードブロックの取り扱い

> **技術記事のコードをそのままスライドに貼らない**

| 元記事のコード   | スライド用                   |
| ---------------- | ---------------------------- |
| 10 行以上        | 2-3 行に要約                 |
| import 文 + 本体 | 本体のみ（要点）             |
| コメント付き     | コメント削除 or 最小限       |
| 完全なコード     | 疑似コード or キーワードのみ |

```json
// ❌ NG: 元記事のコードをそのまま
{
  "text": "import { execSync } from \"child_process\";\n\nconst output = execSync(\"git branch\", { encoding: \"utf-8\" });\n\nexecSync(`git branch -d \"${branch}\"`);"
}

// ✅ OK: 要点のみ（2-3行）
{
  "text": "execSync(\"git branch\")  // 一覧取得\nexecSync(\"git branch -d branch名\")  // 削除"
}
```

**コードが多い場合の対処:**

1. **要点のみ**: 最重要の 1-2 行だけ残す
2. **疑似コード**: 実際のコードではなく概念を示す
3. **Appendix**: 完全なコードは後ろに移動
4. **URL**: 「詳細は元記事参照」とリンク

---

## 出力先パス規則

| 種別         | パス               | 用途                           |
| ------------ | ------------------ | ------------------------------ |
| 最終出力     | `output_ppt/`      | 完成した PPTX                  |
| 中間生成物   | `output_manifest/` | 作業用ファイル、JSON 等        |
| テンプレート | `templates/`       | 元テンプレート（読み取り専用） |

### 禁止事項

- ❌ テンプレートファイルの上書き保存
- ❌ 指定フォルダ外への出力
- ❌ PPTX バイナリの直接編集

---

## コンテンツ作成の大原則

### 🎯 「伝わる」が正義

> スライドは「読む」ものではなく「見る」もの。

- **1 スライド = 1 メッセージ**
- **結論ファースト**: 「で、結局なに？」を常に意識
- **スライド枚数は内容次第**: 伝わればそれが正解
- **Appendix は「詳しくはこちら」置き場**

### やりがちミスと対処

| ミス                     | 対処                       |
| ------------------------ | -------------------------- |
| 1 枚に詰め込みすぎ       | 分割するか Appendix へ     |
| 要約しすぎて意味不明     | 具体例を 1 つ残す          |
| コード全部省略           | 動くサンプルは Appendix へ |
| 出典書き忘れ             | URL があれば必ず記載       |
| テンション統一されてない | 最初に決めたトーンを維持   |

---

## 参照マップ

| 詳細ルール       | 参照先                             |
| ---------------- | ---------------------------------- |
| テンプレート操作 | `template.instructions.md`         |
| HTML 変換        | `convert_html.instructions.md`     |
| 報告・提案       | `purpose-report.instructions.md`   |
| 障害報告         | `purpose-incident.instructions.md` |
| LT               | `purpose-lt.instructions.md`       |
| ブログ変換       | `purpose-blog.instructions.md`     |
