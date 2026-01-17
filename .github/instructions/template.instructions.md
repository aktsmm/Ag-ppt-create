# Template Instructions

テンプレートベースの PPTX 生成ルール。

> ✅ **推奨方式**: 統一感のあるプレゼンを高速に作成できる。

---

## 分割ドキュメント

| ドキュメント                                                                   | 内容                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| [template-content-json.instructions.md](template-content-json.instructions.md) | content.json フォーマット、スライドタイプ、画像埋め込み |
| [template-replacements.instructions.md](template-replacements.instructions.md) | replacements.json フォーマット（Localizer 方式用）      |
| [template-advanced.instructions.md](template-advanced.instructions.md)         | analyze_template, diagnose, clean, マスター生成         |

---

## 方式の選択

| 方式             | 用途                                            | 推奨度          |
| ---------------- | ----------------------------------------------- | --------------- |
| **新規生成方式** | content.json からテンプレートデザインで新規作成 | ⭐⭐⭐⭐⭐      |
| Localizer 方式   | 既存テンプレートのテキスト置換（preserve 方式） | ⚠️ experimental |

> 📖 方式選定の詳細は [tools-reference.instructions.md](tools-reference.instructions.md) を参照。

---

## クイックスタート（新規生成方式）★ 推奨

> 📛 **ファイル命名規則**: [common.instructions.md](common.instructions.md) を参照

```powershell
$template = "mytemplate"  # templates/ 内のファイル名（拡張子なし）
$base = "20241212_project_presentation"

# 1. レイアウト設定ファイルがなければ分析（初回のみ）
if (-not (Test-Path "output_manifest/${template}_layouts.json")) {
    python scripts/analyze_template.py "templates/${template}.pptx"
}

# 2. content.json からテンプレートデザインで PPTX 生成
python scripts/create_from_template.py "templates/${template}.pptx" `
    "output_manifest/${base}_content.json" "output_ppt/${base}.pptx" `
    --config "output_manifest/${template}_layouts.json"

# 3. 確認
Start-Process "output_ppt/${base}.pptx"
```

---

## 基本フロー

### 新規生成方式（content.json → PPTX）

```
templates/*.pptx
    ↓
analyze_template.py (レイアウト分析 → layouts.json 生成)
    ↓  ※初回のみ
output_manifest/{template}_layouts.json
    ↓
create_from_template.py --config
    ↓
output_ppt/{base}.pptx
```

### Localizer 方式（テキスト置換）※ experimental

```
templates/*.pptx
    ↓
reorder_slides.py (並び替え・複製)
    ↓
extract_shapes.py (構造抽出 → inventory.json)
    ↓
[replacements.json 作成]
    ↓
apply_content.py (テキスト置換)
    ↓
output_ppt/{base}.pptx
```

> 📖 詳細は [template-replacements.instructions.md](template-replacements.instructions.md) を参照。

---

## content.json 簡易リファレンス

```json
{
  "slides": [
    { "type": "title", "title": "タイトル", "subtitle": "サブタイトル" },
    { "type": "agenda", "title": "アジェンダ", "items": ["項目1", "項目2"] },
    { "type": "content", "title": "本文", "items": ["箇条書き1", "箇条書き2"] },
    { "type": "section", "title": "セクション", "subtitle": "概要" },
    { "type": "summary", "title": "まとめ", "items": ["要点1", "要点2"] },
    { "type": "closing", "title": "Thank You" }
  ]
}
```

> 📖 完全なフォーマットは [template-content-json.instructions.md](template-content-json.instructions.md) を参照。

### スライドタイプ早見表

| タイプ       | 用途             | items    | 備考                  |
| ------------ | ---------------- | -------- | --------------------- |
| `title`      | タイトル         | 通常なし | 最初のスライド        |
| `agenda`     | 目次             | あり     | タイトル直後          |
| `content`    | 本文             | あり     | 標準スライド          |
| `section`    | セクション区切り | 通常なし | subtitle 推奨         |
| `photo`      | 画像付き         | あり     | image フィールド必須  |
| `two_column` | 2列比較          | なし     | left/right_items 使用 |
| `summary`    | まとめ           | あり     | クロージング前        |
| `closing`    | エンディング     | **なし** | 短文のみ              |

---

## 画像埋め込み（簡易）

```json
{
  "type": "content",
  "title": "アーキテクチャ図",
  "items": ["ポイント1", "ポイント2"],
  "image": {
    "path": "images/architecture.png",
    "position": "right",
    "width_percent": 45
  }
}
```

| position | 動作                   |
| -------- | ---------------------- |
| `right`  | 右側配置、テキスト左   |
| `bottom` | 下部配置、テキスト上   |
| `center` | 中央配置               |
| `full`   | 全画面（テキストなし） |

> 📖 詳細は [template-content-json.instructions.md](template-content-json.instructions.md) を参照。

---

## スクリプト一覧

| スクリプト                | 用途                     | 詳細                                                           |
| ------------------------- | ------------------------ | -------------------------------------------------------------- |
| `analyze_template.py`     | レイアウト分析           | [template-advanced](template-advanced.instructions.md)         |
| `create_from_template.py` | PPTX 生成                | 本ファイル                                                     |
| `diagnose_template.py`    | テンプレート診断         | [template-advanced](template-advanced.instructions.md)         |
| `clean_template.py`       | テンプレートクリーニング | [template-advanced](template-advanced.instructions.md)         |
| `reorder_slides.py`       | スライド並び替え         | [template-replacements](template-replacements.instructions.md) |
| `extract_shapes.py`       | 構造抽出                 | [template-replacements](template-replacements.instructions.md) |
| `apply_content.py`        | テキスト置換             | [template-replacements](template-replacements.instructions.md) |

---

## テンプレート準備

### 追加手順

```powershell
# 1. テンプレートを配置
cp "path/to/template.pptx" "templates/"

# 2. レイアウト分析
python scripts/analyze_template.py templates/template.pptx

# 3. 結果確認
cat output_manifest/template_layouts.json
```

### 推奨要件

| 要件           | 説明                                  |
| -------------- | ------------------------------------- |
| サイズ         | 16:9（13.33" × 7.5"）推奨             |
| 必須レイアウト | Title Slide, Title and Content        |
| 推奨レイアウト | Section Header, Two Content, Blank    |
| フォント       | 環境依存しないもの（Arial, Segoe UI） |

### PREPARE_TEMPLATE フェーズ（外部テンプレート使用時）

```powershell
$input = "input/external.pptx"
$base = "20251214_example"

# 1. 診断
python scripts/diagnose_template.py $input

# 2. クリーニング（問題があれば）
python scripts/clean_template.py $input "output_manifest/${base}_clean.pptx"

# 3. レイアウト分析
python scripts/analyze_template.py "output_manifest/${base}_clean.pptx"
```

> 📖 詳細は [template-advanced.instructions.md](template-advanced.instructions.md) を参照。

---

## よくあるエラー

| エラー           | 原因                                          | 対処                   |
| ---------------- | --------------------------------------------- | ---------------------- |
| スライド数不一致 | content.json のスライド数とテンプレート不整合 | layouts.json 確認      |
| 画像が重なる     | content_with_image マッピングなし             | layouts.json に追加    |
| テキストはみ出し | 文字数超過                                    | 文字数制限確認         |
| 背景画像重複     | テンプレート未クリーニング                    | clean_template.py 実行 |

---

## 参照

- 品質ガイドライン: [quality-guidelines.instructions.md](quality-guidelines.instructions.md)
- 命名規則: [common.instructions.md](common.instructions.md)
- ツールフロー: [tools-reference.instructions.md](tools-reference.instructions.md)
- サンプル: `workspace/content.example.json`
