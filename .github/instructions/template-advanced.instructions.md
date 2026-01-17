# Template: 高度な操作

テンプレート分析・クリーニング・スライドマスター生成の詳細手順。

> 📖 基本フローは [template.instructions.md](template.instructions.md) を参照。

---

## analyze_template.py

テンプレートのレイアウト構成を分析し、layouts.json を生成。

### 使用法

```powershell
python scripts/analyze_template.py templates/sample.pptx
# → output_manifest/sample_layouts.json 生成
```

### 出力例

```json
{
  "template": "sample.pptx",
  "layouts": [
    {
      "index": 0,
      "name": "Title Slide",
      "placeholders": ["TITLE", "SUBTITLE"]
    },
    {
      "index": 1,
      "name": "Title and Content",
      "placeholders": ["TITLE", "BODY"]
    },
    { "index": 2, "name": "Section Header", "placeholders": ["TITLE", "BODY"] },
    {
      "index": 3,
      "name": "Two Content",
      "placeholders": ["TITLE", "BODY", "CONTENT"]
    }
  ],
  "layout_mapping": {
    "title": 0,
    "content": 1,
    "section": 2,
    "two_column": 3,
    "content_with_image": 3
  }
}
```

### ★ content_with_image マッピング追加

`type: "content"` + `image` のスライドで画像重なりを防ぐため、Two Column レイアウトをマッピング：

```json
"layout_mapping": {
  "content_with_image": 3  // Two Content レイアウト
}
```

---

## diagnose_template.py

テンプレートの品質問題を診断。

```powershell
python scripts/diagnose_template.py templates/sample.pptx
```

### 検出項目

| 問題               | 説明                       | 対処             |
| ------------------ | -------------------------- | ---------------- |
| 背景画像           | マスター内に画像あり       | clean_template   |
| 壊れた参照         | blip 参照が無効            | clean_template   |
| 外部リンク         | リンク切れ                 | 手動削除         |
| 狭いプレースホルダ | タイトル幅が狭い           | 自動修正 or 別 T |
| 暗い背景           | コントラスト不足           | 別テンプレート   |
| viewProps 設定     | マスター表示で開く問題     | 自動正規化       |
| 埋め込みフォント   | フォント欠落警告が出る可能 | 代替フォント指定 |

---

## clean_template.py

テンプレートから問題要素を削除してクリーニング。

```powershell
python scripts/clean_template.py templates/sample.pptx "output_manifest/${base}_clean.pptx"
```

### 処理内容

- マスター/レイアウト内の PICTURE シェイプを削除
- Picture Placeholder の blip 参照を削除
- 壊れた外部リンクを削除
- viewProps.xml を正規化

---

## create_clean_template.py

元 PPTX からクリーンなテンプレートを新規作成。

```powershell
# 分析のみ（変更なし）
python scripts/create_clean_template.py input/presentation.pptx --analyze

# 全処理適用
python scripts/create_clean_template.py input/presentation.pptx "templates/${base}_clean.pptx" --all
```

### オプション

| オプション             | 効果                             |
| ---------------------- | -------------------------------- |
| `--remove-backgrounds` | 背景画像削除                     |
| `--remove-decorations` | 装飾シェイプ削除（縦バー等）     |
| `--fix-placeholders`   | プレースホルダー位置最適化       |
| `--all`                | 上記すべて適用（デフォルト推奨） |
| `--analyze`            | 分析のみ、ファイル変更なし       |

---

## スライドマスター生成

標準マスターセットを生成するスクリプト（開発中）。

### 目的

- 各レイアウトを 1 枚ずつ含むテンプレートを生成
- 名前の統一（Title Slide, Title and Content, Section Header, ...）
- 用途別に最適化（コード向け、ビジネス向け等）

### create_master_set.ps1（計画中）

```powershell
# 標準マスターセット生成
.\scripts\create_master_set.ps1 -Output templates/standard_master.pptx -Style Minimal
```

---

## 用途別テンプレート選定

| 用途            | 推奨テンプレート         | 理由                   |
| --------------- | ------------------------ | ---------------------- |
| 社内報告        | シンプル系               | 派手な装飾不要         |
| 顧客向け提案    | 企業ロゴ入りテンプレート | ブランディング         |
| 技術勉強会      | コード向けテンプレート   | コードブロック対応     |
| カンファレンス  | イベント公式テンプレート | スポンサー表示対応     |
| 英語→日本語翻訳 | 元 PPTX 継承             | デザイン維持（方式 A） |

---

## PREPARE_TEMPLATE フェーズ（必須）

外部テンプレート使用時は以下を必ず実行：

```powershell
$base = "20251214_example"
$input = "input/external_template.pptx"

# 1. 診断
python scripts/diagnose_template.py $input

# 2. クリーニング（問題があれば）
python scripts/clean_template.py $input "output_manifest/${base}_clean.pptx"
$template = "output_manifest/${base}_clean.pptx"

# 3. レイアウト分析
python scripts/analyze_template.py $template

# 4. layouts.json に content_with_image を追加（必要に応じて手動）
```

> ⚠️ スキップすると背景画像重複やレイアウト崩れが発生します。

---

## 参照

- 基本フロー: [template.instructions.md](template.instructions.md)
- content.json 形式: [template-content-json.instructions.md](template-content-json.instructions.md)
- replacements.json 形式: [template-replacements.instructions.md](template-replacements.instructions.md)
- 品質ガイドライン: [quality-guidelines.instructions.md](quality-guidelines.instructions.md)
