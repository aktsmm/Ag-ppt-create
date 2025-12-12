# Template Instructions

テンプレートベースの PPTX 生成ルール。

> ✅ **推奨方式**: 統一感のあるプレゼンを高速に作成できる。特別な理由がない限りこの方式を使用。

---

## 方式の選択

| 方式               | 用途                                            | スクリプト                     |
| ------------------ | ----------------------------------------------- | ------------------------------ |
| **Localizer 方式** | 既存テンプレートのテキストを置換（翻訳/編集）   | reorder → extract → apply      |
| **新規生成方式**   | content.json からテンプレートデザインで新規作成 | analyze → create_from_template |

---

## クイックスタート（新規生成方式）★ 推奨

> 📛 **ファイル命名規則**: `.github/instructions/common.instructions.md` を参照
> 全てのファイルは `{YYYYMMDD}_{keyword}_{purpose}` 形式で統一

```powershell
# 変数定義（例）
$template = "mytemplate"  # templates/ 内のファイル名（拡張子なし）
$base = "20241212_project_presentation"

# 1. レイアウト設定ファイルがなければ分析（初回のみ）
if (-not (Test-Path "templates/${template}_layouts.json")) {
    python scripts/analyze_template.py "templates/${template}.pptx"
}

# 2. content.json からテンプレートデザインで PPTX 生成
python scripts/create_from_template.py "templates/${template}.pptx" "output_manifest/${base}_content.json" "output_ppt/${base}.pptx" --config "templates/${template}_layouts.json"

# 3. 確認
Start-Process "output_ppt/${base}.pptx"
```

### content.json のフォーマット

```json
{
  "slides": [
    { "type": "title", "title": "タイトル", "subtitle": "サブタイトル" },
    {
      "type": "agenda",
      "title": "今日のアジェンダ",
      "items": ["項目1", "項目2"]
    },
    { "type": "content", "title": "本文", "items": ["箇条書き1", "箇条書き2"] },
    { "type": "summary", "title": "まとめ", "items": ["要点1", "要点2"] },
    { "type": "closing", "title": "Thank You" }
  ]
}
```

### スライドタイプの使い分け

| タイプ    | 用途                               | items の有無 |
| --------- | ---------------------------------- | ------------ |
| `title`   | タイトルスライド                   | 通常なし     |
| `agenda`  | 目次・アジェンダ                   | あり         |
| `content` | 本文（箇条書き）                   | あり         |
| `section` | セクション区切り                   | 通常なし     |
| `summary` | まとめ（箇条書きあり）             | あり         |
| `closing` | エンディング（Thank You など短文） | **なし推奨** |

> ⚠️ **注意**: `closing` タイプは短いエンディング専用です。箇条書き（items）がある「まとめ」スライドには `content` または `summary` を使用してください。
>
> スクリプトは自動で `closing` + 複数 items を検出し、`content` に変換します：
>
> ```
> ⚠️  Warning: Slide 12 'まとめ...' has type='closing' with 5 items
>     → Auto-converting to type='content' (closing is for short endings only)
> ✅ Auto-fixed 1 slide(s)
> ```

### 画像の埋め込み

スライドに画像を埋め込むには、`image` フィールドを使用します。

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

#### 画像オプション

| プロパティ       | 説明                               | 値の例                            |
| ---------------- | ---------------------------------- | --------------------------------- |
| `path`           | ローカル画像パス（相対/絶対）      | `"images/diagram.png"`            |
| `url`            | 画像 URL（自動ダウンロード）       | `"https://example.com/image.png"` |
| `position`       | 画像の配置位置                     | `"right"` / `"bottom"` / `"full"` |
| `width_percent`  | 画像幅（スライド幅に対する %）     | `45`                              |
| `height_percent` | 画像高さ（position=bottom 時使用） | `50`                              |

#### position の動作

| position | 動作                                     |
| -------- | ---------------------------------------- |
| `right`  | 画像を右側、テキストを左側に配置         |
| `bottom` | 画像を下部、テキストを上部に配置         |
| `full`   | 画像をスライド全体に配置（テキストなし） |

---

### Web ページからの画像取得ワークフロー ★ 推奨

ブログ記事や技術ドキュメントから PPTX を生成する際、画像を自動取得して適切な位置に配置します。

#### 1. 画像 URL を抽出

```powershell
$base = "20251212_example_blog"
$url = "https://example.com/blog-post"

# 画像 URL を抽出（Tech Community の場合）
$html = Invoke-WebRequest -Uri $url -UseBasicParsing
$html.Images | Select-Object -ExpandProperty src | Where-Object { $_ -match "image" }
```

#### 2. 画像をダウンロード

```powershell
# 保存先ディレクトリを作成
New-Item -ItemType Directory -Path "images/${base}" -Force

# 主要な画像をダウンロード
$images = @(
    @{url="https://example.com/image1.png"; name="01_architecture.png"},
    @{url="https://example.com/image2.png"; name="02_workflow.png"}
)
foreach ($img in $images) {
    $outPath = "images/${base}/$($img.name)"
    Invoke-WebRequest -Uri $img.url -OutFile $outPath -UseBasicParsing
    Write-Host "Downloaded: $($img.name)"
}
```

#### 3. content.json で画像を適切な位置に配置

```json
{
  "slides": [
    {
      "type": "title",
      "title": "ブログタイトル",
      "subtitle": "サブタイトル"
    },
    {
      "type": "photo",
      "title": "アーキテクチャ全体像",
      "items": ["ポイント1", "ポイント2"],
      "image": {
        "path": "images/20251212_example_blog/01_architecture.png",
        "position": "right",
        "width_percent": 55
      }
    },
    {
      "type": "photo",
      "title": "ワークフロー",
      "items": ["ステップ1", "ステップ2"],
      "image": {
        "path": "images/20251212_example_blog/02_workflow.png",
        "position": "right",
        "width_percent": 55
      }
    }
  ]
}
```

#### 画像配置のベストプラクティス

| 画像タイプ         | 推奨 position | width_percent | 備考               |
| ------------------ | ------------- | ------------- | ------------------ |
| アーキテクチャ図   | `right`       | 50-55         | テキストと並列表示 |
| スクリーンショット | `right`       | 55-60         | 詳細が見える大きさ |
| フローチャート     | `full`        | -             | 全画面表示         |
| アイコン/ロゴ      | `right`       | 25-30         | 控えめなサイズ     |

#### 画像取得時の注意事項

1. **命名規則**: `{連番}_{内容}.png` （例: `01_auth_flow.png`）
2. **保存先**: `images/{base}/` 配下に統一
3. **適切な位置に配置**: Appendix にまとめるのではなく、関連するスライドに直接配置
4. **type は `photo`**: 画像を含むスライドは `type: "photo"` を使用（layout が 50/50 Image and Text になる）

---

#### 使用例（従来）

```json
// URL から画像を取得して右側に配置
{
  "type": "content",
  "title": "GitHub 連携",
  "items": ["リポジトリ管理", "CI/CD パイプライン"],
  "image": {
    "url": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    "position": "right",
    "width_percent": 30
  }
}
```

> 💡 対応スクリプト: `create_from_template.py`、`create_ja_pptx.py`、`create_pptx.js`

---

## クイックスタート（Localizer 方式）

```powershell
# 変数定義（例）
$template = "mytemplate"
$base = "20241211_git_branch_cli_blog"

# 1. テンプレート選定 & スライド構成
python scripts/reorder_slides.py "templates/${template}.pptx" "output_manifest/${base}_working.pptx" 0,1,2,3

# 2. テキスト構造を抽出
python scripts/extract_shapes.py "output_manifest/${base}_working.pptx" "output_manifest/${base}_inventory.json"

# 3. replacements.json を作成（Content Writer が実施）
# 出力先: output_manifest/${base}_replacements.json

# 4. テキスト置換実行
python scripts/apply_content.py "output_manifest/${base}_working.pptx" "output_manifest/${base}_replacements.json" "output_ppt/${base}.pptx"

# 5. 確認
Start-Process "output_ppt/${base}.pptx"
```

---

## 基本フロー

### 新規生成方式（content.json → PPTX）

```
templates/*.pptx
    ↓
analyze_template.py (レイアウト分析 → layouts.json 生成)
    ↓  ※初回のみ、2回目以降はスキップ
templates/{template}_layouts.json
    ↓
create_from_template.py --config (テンプレートデザインで新規作成)
    ↓
output_ppt/{base}.pptx
```

### Localizer 方式（テキスト置換）

```
templates/*.pptx
    ↓
reorder_slides.py (並び替え・複製)
    ↓
output_manifest/{base}_working.pptx
    ↓
extract_shapes.py (構造抽出)
    ↓
output_manifest/{base}_inventory.json (参照のみ)
    ↓
[Content Writer が {base}_replacements.json 作成]
    ↓
apply_content.py (テキスト置換)
    ↓
output_ppt/{base}.pptx

※ {base} = {YYYYMMDD}_{keyword}_{purpose}
```

---

## create_master_set.ps1（スライドマスター自動生成）

テンプレートに必要なレイアウトが不足している場合、既存レイアウトを参考に自動生成します。

### 必要なレイアウト一覧

| タイプ        | 用途                   | プレースホルダー構成           |
| ------------- | ---------------------- | ------------------------------ |
| `title`       | タイトルスライド       | CenterTitle + Subtitle         |
| `content`     | 本文スライド           | Title + Body                   |
| `section`     | セクション区切り       | Title（中央）                  |
| `two_content` | 2 カラムレイアウト     | Title + Body(左) + Body(右)    |
| `blank`       | 白紙                   | なし                           |
| `agenda`      | アジェンダ・目次       | Title + Body                   |
| `closing`     | エンディング（END 等） | CenterTitle（デフォルト: END） |

### コマンド

```powershell
# 分析のみ（不足レイアウトの確認）
.\scripts\ensure_layouts.ps1 -InputPath "templates\mytemplate.pptx"

# 不足レイアウトを自動生成（別ファイルに出力）
.\scripts\create_master_set.ps1 -InputPath "templates\mytemplate.pptx" -OutputPath "templates\mytemplate_complete.pptx"

# 元ファイルを直接更新
.\scripts\create_master_set.ps1 -InputPath "templates\mytemplate.pptx"
```

### 動作

1. 既存のスライドマスターを全て分析
2. 必要なレイアウトタイプ（title, content, section 等）の有無をチェック
3. 不足があれば、最適な既存レイアウトを複製
4. プレースホルダーを用途に合わせて再構成
5. `closing` レイアウトには「END」をデフォルトセット

### 出力例

```
--- Checking Required Layouts ---
  [OK] content: タイトルとコンテンツ
  [OK] title: タイトル スライド
  [MISSING] closing
  [OK] section: セクション見出し
  [MISSING] two_content

--- Creating Missing Layouts ---
  Creating: two_content
    Base: タイトルとコンテンツ (from Office テーマ)
    Created: Two Content (auto)
  Creating: closing
    Base: タイトルとコンテンツ (from Office テーマ)
    Set default text: END
    Created: closing (auto)
```

### 統合ワークフロー

テンプレートを使う前にレイアウトを補完：

```powershell
$template = "mytemplate"
$base = "20241212_project_presentation"

# 0. レイアウト不足を補完（初回のみ）
.\scripts\create_master_set.ps1 -InputPath "templates/${template}.pptx"

# 1. レイアウト設定ファイル生成（初回のみ）
if (-not (Test-Path "templates/${template}_layouts.json")) {
    python scripts/analyze_template.py "templates/${template}.pptx"
}

# 2. PPTX 生成
python scripts/create_from_template.py "templates/${template}.pptx" "output_manifest/${base}_content.json" "output_ppt/${base}.pptx"
```

> ⚠️ **注意**: PowerPoint COM を使用するため、PowerPoint がインストールされている必要があります。

---

## analyze_template.py（レイアウト分析）

テンプレートのスライドマスターを分析し、スライドタイプ → レイアウト番号のマッピングを生成。

### コマンド

```powershell
python scripts/analyze_template.py <template.pptx> [output.json]
```

### 出力例

```json
{
  "template": "mytemplate.pptx",
  "aspect_ratio": "16:9",
  "layout_mapping": {
    "title": 0,
    "content": 1,
    "section": 2,
    "agenda": 1,
    "summary": 1,
    "closing": 2,
    "two_column": 3,
    "blank": 4
  }
}
```

### 自動検出されるスライドタイプ

| タイプ       | 検出キーワード                    | 用途             |
| ------------ | --------------------------------- | ---------------- |
| `title`      | "title slide", "タイトルスライド" | 最初のスライド   |
| `content`    | "title and content"               | 本文/箇条書き    |
| `section`    | "section"                         | セクション区切り |
| `agenda`     | "agenda"                          | 目次             |
| `closing`    | "closing"                         | 最終スライド     |
| `two_column` | "two column"                      | 2 列レイアウト   |
| `code`       | "code", "developer"               | コード表示       |
| `photo`      | "photo", "image", "50/50"         | 画像付き         |
| `blank`      | "blank"                           | 白紙             |

### ルール

- **初回のみ実行**: `templates/{template}_layouts.json` が存在しなければ実行
- **手動編集可能**: 生成された JSON を編集してマッピングを調整可能
- **自動検出**: `create_from_template.py` は設定ファイルを自動検出

---

## create_from_template.py（テンプレートから新規生成）

content.json とテンプレートから PPTX を生成。レイアウト設定ファイルを自動検出。

### コマンド

```powershell
python scripts/create_from_template.py <template.pptx> <content.json> <output.pptx> [--config layouts.json]
```

### オプション

| オプション       | 説明                                       |
| ---------------- | ------------------------------------------ |
| `--config`, `-c` | レイアウト設定ファイル（省略時は自動検出） |
| `--list-layouts` | レイアウト一覧を表示して終了               |

### レイアウト選択の優先順位

1. `slide.layout`: content.json で明示指定（数値）
2. `layout_mapping[slide.type]`: 設定ファイルのマッピング
3. 自動検出: 設定ファイルがなければテンプレート名から推定

---

## テンプレートの準備

### テンプレートを追加する手順

1. PPTX ファイルを `templates/` に配置
2. `analyze_template.py` を実行してレイアウト設定を生成
3. 必要に応じて `{template}_layouts.json` を手動編集

```powershell
# 新しいテンプレートを追加
cp "path/to/corporate_template.pptx" "templates/"

# レイアウト分析（設定ファイル自動生成）
python scripts/analyze_template.py templates/corporate_template.pptx

# 結果を確認
cat templates/corporate_template_layouts.json
```

### 推奨テンプレート要件

| 要件               | 説明                                              |
| ------------------ | ------------------------------------------------- |
| **スライドサイズ** | 16:9（13.33" × 7.5"）推奨                         |
| **必須レイアウト** | Title Slide, Title and Content（最低限）          |
| **推奨レイアウト** | Section Header, Two Content, Blank                |
| **プレースホルダ** | TITLE, BODY, CONTENT など標準プレースホルダを使用 |
| **フォント**       | 環境依存しないフォント（Arial, Segoe UI など）    |

### 用途別の選定基準

| 用途           | 推奨レイアウト数 | ポイント                         |
| -------------- | ---------------- | -------------------------------- |
| シンプルな報告 | 4-6              | Title, Content, Section, Blank   |
| 企業プレゼン   | 10-20            | 多様なレイアウト、ブランドカラー |
| 技術発表       | 6-10             | Code, Two Column があると便利    |
| LT/カジュアル  | 4-6              | シンプルで見やすいもの           |

---

## reorder_slides.py

スライドの並び替え・複製・削除を行う。

### コマンド

```powershell
python scripts/reorder_slides.py <template> <output> <indices>
```

### パラメータ

| パラメータ | 説明                       | 例                           |
| ---------- | -------------------------- | ---------------------------- |
| template   | 元テンプレート（絶対パス） | templates/mytemplate.pptx    |
| output     | 出力先（絶対パス）         | output_manifest/working.pptx |
| indices    | スライドインデックス       | 0,1,2,2,3（カンマ区切り）    |

### 使用例

```powershell
# スライド 0, 1, 2, 2, 3 の順で構成（スライド 2 を複製）
python scripts/reorder_slides.py templates/mytemplate.pptx output_manifest/working.pptx 0,1,2,2,3

# タイトル(0) + 本文(2)を3回 + 最終(4)
python scripts/reorder_slides.py templates/mytemplate.pptx output_manifest/working.pptx 0,2,2,2,4
```

### ルール

| ルール                      | 説明                  |
| --------------------------- | --------------------- |
| インデックスは **0 始まり** | 最初のスライドは 0    |
| 同じインデックス複数指定可  | 複製される            |
| 指定しないスライドは削除    | 出力に含まれない      |
| 順序は指定順                | 0,2,1 なら 0→2→1 の順 |

### エラー対処

| エラー              | 原因                       | 対処                |
| ------------------- | -------------------------- | ------------------- |
| `IndexError`        | 存在しないスライド番号     | テンプレート確認    |
| `FileNotFoundError` | テンプレートが見つからない | パス確認            |
| `PermissionError`   | ファイルが開かれている     | PowerPoint を閉じる |

---

## extract_shapes.py

テンプレート内のテキスト構造を JSON 抽出。

### コマンド

```powershell
python scripts/extract_shapes.py <pptx> <output.json>
```

### 出力構造

```json
{
  "slide-0": {
    "shape-0": {
      "left": 0.88,
      "top": 1.14,
      "width": 11.08,
      "height": 4.51,
      "placeholder_type": "CENTER_TITLE",
      "default_font_size": 60.0,
      "paragraphs": [
        {
          "text": "タイトルテキスト",
          "font_size": 52.0
        }
      ]
    },
    "shape-1": {
      "placeholder_type": "SUBTITLE",
      "paragraphs": [
        {
          "text": "サブタイトル"
        }
      ]
    }
  },
  "slide-1": {
    "shape-0": {
      "placeholder_type": "TITLE",
      "paragraphs": [
        {
          "text": "見出し"
        }
      ]
    },
    "shape-1": {
      "placeholder_type": "BODY",
      "paragraphs": [
        {
          "text": "本文項目1",
          "bullet": true,
          "level": 0
        },
        {
          "text": "本文項目2",
          "bullet": true,
          "level": 0
        }
      ]
    }
  }
}
```

### 出力フィールド説明

| フィールド          | 型     | 説明                          |
| ------------------- | ------ | ----------------------------- |
| `slide-N`           | object | スライド番号（0 始まり）      |
| `shape-N`           | object | シェイプ番号（位置順）        |
| `left`, `top`       | float  | 位置（インチ）                |
| `width`, `height`   | float  | サイズ（インチ）              |
| `placeholder_type`  | string | プレースホルダー種別          |
| `default_font_size` | float  | デフォルトフォントサイズ (pt) |
| `paragraphs`        | array  | 段落配列                      |
| `text`              | string | テキスト内容                  |
| `bullet`            | bool   | 箇条書きフラグ                |
| `level`             | int    | インデント階層（0-8）         |

### 重要

- ⚠️ shape-id は位置順（上 → 下、左 → 右）で自動採番
- ⚠️ この JSON は **編集しない**（参照のみ）
- ⚠️ replacements.json 作成時の参照用

---

## apply_content.py

inventory の shape-id を使ってテキストを置換。

### コマンド

```powershell
python scripts/apply_content.py <pptx> <replacements.json> <output>
```

### パラメータ

| パラメータ        | 説明        | 例                                         |
| ----------------- | ----------- | ------------------------------------------ |
| pptx              | 作業用 PPTX | `output_manifest/{base}_working.pptx`      |
| replacements.json | 置換データ  | `output_manifest/{base}_replacements.json` |
| output            | 出力先      | `output_ppt/{base}.pptx`                   |

※ `{base}` = `{YYYYMMDD}_{keyword}_{purpose}`

---

## replacements.json 形式

### 基本構造

```json
{
  "slide-0": {
    "shape-0": {
      "paragraphs": [
        {
          "text": "新しいタイトル",
          "font_size": 52.0,
          "bold": true
        }
      ]
    }
  },
  "slide-1": {
    "shape-0": {
      "paragraphs": [
        {
          "text": "新しい見出し"
        }
      ]
    },
    "shape-1": {
      "paragraphs": [
        {
          "text": "項目1",
          "bullet": true,
          "level": 0
        },
        {
          "text": "項目2",
          "bullet": true,
          "level": 0
        },
        {
          "text": "サブ項目",
          "bullet": true,
          "level": 1
        }
      ]
    }
  }
}
```

### 段落プロパティ

| プロパティ  | 型     | 必須 | 説明                  | 例       |
| ----------- | ------ | ---- | --------------------- | -------- |
| `text`      | string | ✅   | テキスト内容          | "見出し" |
| `bullet`    | bool   | -    | 箇条書きフラグ        | true     |
| `level`     | int    | -    | インデント階層（0-8） | 0        |
| `bold`      | bool   | -    | 太字                  | true     |
| `italic`    | bool   | -    | 斜体                  | false    |
| `alignment` | string | -    | 配置                  | "CENTER" |
| `font_size` | float  | -    | フォントサイズ (pt)   | 24.0     |
| `font_name` | string | -    | フォント名            | "Arial"  |

---

## 🚨 TIPS: よくある失敗と対策

### 失敗 ①: 中身が空になる

**原因:** `paragraphs` 配列を使わず直接テキストを指定

```json
// ❌ NG: apply_content.py で無視される
"shape-0": "タイトルテキスト"
"shape-0": { "text": "タイトル" }

// ✅ OK: paragraphs 配列必須
"shape-0": { "paragraphs": [{ "text": "タイトル" }] }
```

### 失敗 ②: オーバーフローエラー

**原因:** テキストボックスのサイズを超えるテキスト量

```
ERROR: Text overflow worsened:
  - slide-16/shape-1: overflow worsened by 3.06"
```

**対策:**

1. inventory.json の `height` を確認
2. height が小さい shape（特に SUBTITLE, END）は 1-2 行に抑える
3. 長文は本文スライドか Appendix に移動

| inventory の height | 推奨テキスト量 |
| ------------------- | -------------- |
| 0.5 インチ以下      | 1 行のみ       |
| 0.5 - 1.5 インチ    | 1-2 行         |
| 1.5 - 3.0 インチ    | 3-5 行         |
| 3.0 インチ以上      | 5-8 行         |

### 失敗 ③: Shapes replaced: 0

**原因:** 上記 ① の構造ミス or shape-id の不一致

**チェック方法:**

```powershell
# apply_content.py の出力を確認
# "Shapes replaced: 0" なら JSON 形式を確認
```

### 失敗 ④: タイトルが置換されない / 別のシェイプが置換される

**原因:** `extract_shapes.py` と `apply_content.py` でシェイプの識別ロジックが一致していなかった

**症状:**

- タイトル（slide-0/shape-0）を置換したつもりが、元のまま
- 意図しないシェイプが置換される
- 右上や隅に謎のテキストが残る

**修正済み（2025/12/11）:**
`apply_content.py` の `extract_shapes_from_slide()` を `extract_shapes.py` と同じロジックに統一済み。

**シェイプ識別の重要ルール:**

| 項目     | 共通ルール                                      |
| -------- | ----------------------------------------------- |
| 抽出対象 | `has_text_frame` かつテキストが空でないシェイプ |
| 除外対象 | SLIDE_NUMBER, FOOTER, DATE プレースホルダー     |
| ソート順 | 位置順（上 → 下、左 → 右）で shape-id を採番    |
| 座標単位 | EMU をインチに変換してからソート                |

**開発者向け:**
`extract_shapes.py` を変更した場合、`apply_content.py` の `extract_shapes_from_slide()` も必ず同期すること。

### alignment の値

| 値      | 説明     |
| ------- | -------- |
| LEFT    | 左揃え   |
| CENTER  | 中央揃え |
| RIGHT   | 右揃え   |
| JUSTIFY | 両端揃え |

---

## 🚨 箇条書きフォーマット（最重要）

> **手動の箇条書き記号は禁止。必ず `bullet: true` を使用する。**

### ❌ NG パターン（apply_content.py でエラーになる）

```json
// ❌ NG: 手動で記号を入れる
{
  "paragraphs": [
    { "text": "• 項目1\n• 項目2\n• 項目3" }
  ]
}

// ❌ NG: テキスト内に記号を含める
{
  "paragraphs": [
    { "text": "- 項目1" },
    { "text": "- 項目2" }
  ]
}

// ❌ NG: 丸数字で番号リスト
{
  "paragraphs": [
    { "text": "① 手順1" },
    { "text": "② 手順2" }
  ]
}
```

### ✅ OK パターン

```json
// ✅ OK: bullet プロパティを使用
{
  "paragraphs": [
    { "text": "項目1", "bullet": true, "level": 0 },
    { "text": "項目2", "bullet": true, "level": 0 },
    { "text": "サブ項目", "bullet": true, "level": 1 }
  ]
}

// ✅ OK: 階層構造
{
  "paragraphs": [
    { "text": "大項目1", "bullet": true, "level": 0 },
    { "text": "中項目1-1", "bullet": true, "level": 1 },
    { "text": "小項目1-1-1", "bullet": true, "level": 2 },
    { "text": "大項目2", "bullet": true, "level": 0 }
  ]
}

// ✅ OK: 箇条書きなしのテキスト
{
  "paragraphs": [
    { "text": "これは普通のテキストです。" }
  ]
}
```

### 禁止文字（text 内で使用禁止）

| 文字             | 理由                   |
| ---------------- | ---------------------- |
| `•` `・` `●` `○` | 箇条書き記号           |
| `◆` `◇` `▪` `▫`  | 箇条書き記号           |
| `-` `*` `+`      | 行頭のマークダウン記号 |
| `①` `②` `③` ...  | 番号は level で表現    |

### 改行の扱い

| 改行タイプ | 使い方           | 例                    |
| ---------- | ---------------- | --------------------- |
| `\u000b`   | 同一段落内の改行 | `"1行目\u000b2行目"`  |
| 別段落     | 項目を分ける     | paragraphs 配列で分割 |

```json
// 同一段落内で改行（箇条書き1つの中で2行）
{
  "paragraphs": [
    { "text": "1行目の説明\u000b2行目の補足", "bullet": true, "level": 0 }
  ]
}

// 別々の箇条書き項目
{
  "paragraphs": [
    { "text": "項目1", "bullet": true, "level": 0 },
    { "text": "項目2", "bullet": true, "level": 0 }
  ]
}
```

---

## テキスト量の目安

### 文字数制限

| 要素            | 推奨文字数 | 最大文字数 | 超過時             |
| --------------- | ---------- | ---------- | ------------------ |
| タイトル        | 20 字      | 40 字      | サブタイトルに分割 |
| 見出し          | 15 字      | 30 字      | キーワードに絞る   |
| 箇条書き 1 項目 | 20 字      | 40 字      | level 1 で補足     |
| 本文 1 段落     | 50 字      | 100 字     | 複数段落に分割     |
| スライド全体    | 100 字     | 200 字     | Appendix へ移動    |

### 箇条書き項目数

| level | 推奨数 | 最大数 | 超過時             |
| ----- | ------ | ------ | ------------------ |
| 0     | 3-5 個 | 7 個   | グループ化 or 分割 |
| 1     | 2-3 個 | 5 個   | 次スライドへ       |
| 2     | 1-2 個 | 3 個   | Appendix へ        |

---

## エラー対処

### よくあるエラーと対処法

| エラー                     | 原因                    | 対処                |
| -------------------------- | ----------------------- | ------------------- |
| `KeyError: slide-N`        | 存在しないスライド指定  | inventory.json 確認 |
| `KeyError: shape-N`        | 存在しないシェイプ指定  | inventory.json 確認 |
| `JSONDecodeError`          | JSON 構文エラー         | JSON Lint で検証    |
| `FileNotFoundError`        | ファイルパス誤り        | 絶対パスで指定      |
| `テキストがはみ出す`       | 文字数超過              | 文字数制限を確認    |
| `箇条書き記号が二重になる` | 手動記号 + bullet: true | 手動記号を削除      |

### デバッグ手順

```powershell
# 変数定義
$base = "20241211_git_branch_cli_blog"

# 1. inventory.json で構造確認
Get-Content "output_manifest/${base}_inventory.json" | ConvertFrom-Json | ConvertTo-Json -Depth 10

# 2. replacements.json の構文チェック
Get-Content "output_manifest/${base}_replacements.json" | ConvertFrom-Json

# 3. apply_content.py 実行
python scripts/apply_content.py "output_manifest/${base}_working.pptx" "output_manifest/${base}_replacements.json" "output_ppt/${base}.pptx"

# 4. 出力確認
Start-Process "output_ppt/${base}.pptx"
```

---

## 検証チェックリスト

### 必須チェック（MUST）

- [ ] slide-N / shape-N が inventory.json と一致
- [ ] 箇条書きに手動記号がない（`bullet: true` 使用）
- [ ] JSON 構文エラーがない
- [ ] テキストがはみ出していない

### 推奨チェック（SHOULD）

- [ ] 文字数が制限内
- [ ] 箇条書き項目数が適切
- [ ] フォントサイズが指定されている（必要な場合）
- [ ] 階層構造が 3 レベル以内

---

## 出力確認

```powershell
# PowerPoint で直接開いて確認
Start-Process "output_ppt/${base}.pptx"
```

### 確認ポイント

1. **テキスト表示**: 内容が正しく表示されているか
2. **レイアウト**: はみ出し・重なりがないか
3. **箇条書き**: 記号・インデントが正しいか
4. **フォント**: サイズ・スタイルが適切か

---

## 参照

- `scripts/reorder_slides.py` - スライド並び替えスクリプト
- `scripts/extract_shapes.py` - 構造抽出スクリプト
- `scripts/apply_content.py` - テキスト置換スクリプト
- `output_manifest/inventory.json` - 構造情報（サンプル）
- `workspace/replacements.example.json` - replacements サンプル
