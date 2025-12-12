# HTML to PPTX Instructions

HTML/CSS から PPTX を生成するルール。

> ⚠️ **非推奨方式**: この方式は IR 原則に基づく二段階パイプラインを迂回します。
> 通常は `content.json` → `create_from_template.py` を使用してください。

---

## 方式の位置づけ

```
┌────────────────────────────────────────────────────────────┐
│ 推奨パイプライン（IR原則準拠）                              │
│   入力 → content.json(IR) → create_from_template.py → PPTX │
├────────────────────────────────────────────────────────────┤
│ HTML方式（低レベルAPI）                                     │
│   入力 → HTML(構造+見た目) → convert_html_multi.js → PPTX  │
│   ※ IR原則違反：構造と見た目が分離されていない              │
└────────────────────────────────────────────────────────────┘
```

### 使用判断基準

| 状況                  | 推奨方式                          |
| --------------------- | --------------------------------- |
| 既存テンプレートで OK | `create_from_template.py` ⭐ 推奨 |
| コードブロック多め    | `pptxgenjs`                       |
| 完全カスタムデザイン  | **この方式（HTML）**              |

> 💡 HTML 方式は「最終手段」です。IR 原則に従えない特殊ケースのみ使用。

---

## 変換成功の 3 原則

1. **`position: absolute`** — flex/grid/relative は使用禁止
2. **テキストは `<p>` で囲む** — 生テキストは消える
3. **単色背景のみ** — gradient/rgba は白になる

---

## NG/OK 早見表

| 項目     | ❌ NG                         | ✅ OK                            |
| -------- | ----------------------------- | -------------------------------- |
| 配置     | `display: flex`               | `position: absolute; top: 30pt;` |
| テキスト | `<div>文字</div>`             | `<div><p>文字</p></div>`         |
| 背景     | `linear-gradient()`, `rgba()` | `background: #0078D4;`           |
| 装飾     | `<p style="border:...">`      | `<div style="border:..."><p>`    |
| 箇条書き | `<p>• 項目</p>`               | `<ul><li>項目</li></ul>`         |
| 絵文字   | `📎 ✅ 🚀`                    | `[参考]` `[完了]`                |

---

## クイックスタート

```powershell
$base = "20241211_example_blog"
node scripts/convert_html_multi.js "output_manifest/${base}_slides/" "output_ppt/${base}.pptx"
Start-Process "output_ppt/${base}.pptx"
```

---

## 良いスライドの原則

| 原則                    | 具体的な数値                    |
| ----------------------- | ------------------------------- |
| 1 スライド 1 メッセージ | タイトルで結論が分かる          |
| 文字数制限              | 全体 150 字以内、1 行 50 字以内 |
| 箇条書き                | 4 項目まで（超えたら分割）      |
| 余白                    | 左右 40pt、下端 36pt 以上       |
| フォント                | タイトル 28pt、本文 16pt        |
| スライドサイズ          | 720pt × 405pt（16:9 固定）      |

---

## IR からの自動生成（推奨）

HTML を手書きする代わりに、content.json から HTML を自動生成するフローを推奨します。

```
content.json (IR)
    ↓ [将来: html_generator.js]
output_manifest/{base}_slides/*.html
    ↓ convert_html_multi.js
output_ppt/{base}.pptx
```

### content.json (IR) の例

```json
{
  "slides": [
    {
      "type": "title",
      "title": "プレゼンタイトル",
      "subtitle": "2024年12月"
    },
    {
      "type": "content",
      "title": "ポイント",
      "items": ["項目1", "項目2", "項目3"]
    }
  ],
  "style": {
    "theme": "blue",
    "font": "BIZ UDGothic"
  }
}
```

> **目標**: AI は IR(content.json)だけを生成し、HTML は自動生成ツールが担当する。

---

## 手動 HTML 作成時のテンプレート集

### 基本スライド

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        width: 720pt;
        height: 405pt;
        margin: 0;
        background: #fff;
        font-family: "BIZ UDGothic", Arial, sans-serif;
      }
      h1,
      p {
        position: absolute;
        margin: 0;
        white-space: nowrap;
        left: 40pt;
        width: 640pt;
      }
      h1 {
        top: 30pt;
        font-size: 28pt;
        color: #0078d4;
        font-weight: bold;
      }
      p {
        font-size: 16pt;
        color: #333;
      }
      ul {
        position: absolute;
        left: 40pt;
        width: 640pt;
        margin: 0;
        padding-left: 24pt;
      }
      li {
        font-size: 16pt;
        color: #333;
        margin-bottom: 10pt;
      }
    </style>
  </head>
  <body>
    <h1>スライドタイトル</h1>
    <ul style="top: 90pt;">
      <li>ポイント1</li>
      <li>ポイント2</li>
      <li>ポイント3</li>
    </ul>
  </body>
</html>
```

### タイトルスライド（青背景）

```html
<body style="background: #0078D4;">
  <h1 style="top: 150pt; text-align: center; color: #fff; font-size: 36pt;">
    プレゼンタイトル
  </h1>
  <p style="top: 220pt; text-align: center; color: rgba(255,255,255,0.9);">
    サブタイトル | 2024年12月
  </p>
</body>
```

> ⚠️ 青背景の場合、文字色は必ず `#fff` または明るい色に。

### 2 カラム比較

```html
<h1>Before / After</h1>
<div
  style="position: absolute; top: 80pt; left: 40pt; width: 300pt; height: 280pt; background: #fff5f5; border-radius: 8pt; padding: 16pt;"
>
  <h2
    style="position: absolute; top: 0; left: 16pt; font-size: 18pt; color: #c62828;"
  >
    Before
  </h2>
  <p
    style="position: absolute; top: 50pt; left: 16pt; width: 268pt; font-size: 14pt;"
  >
    課題や問題点を記載
  </p>
</div>
<div
  style="position: absolute; top: 80pt; left: 380pt; width: 300pt; height: 280pt; background: #e8f5e9; border-radius: 8pt; padding: 16pt;"
>
  <h2
    style="position: absolute; top: 0; left: 16pt; font-size: 18pt; color: #2e7d32;"
  >
    After
  </h2>
  <p
    style="position: absolute; top: 50pt; left: 16pt; width: 268pt; font-size: 14pt;"
  >
    解決策や改善点を記載
  </p>
</div>
```

### まとめスライド

```html
<body style="background: #0078D4;">
  <h1 style="top: 30pt; text-align: center; color: #fff;">まとめ</h1>
  <div
    style="position: absolute; top: 90pt; left: 60pt; width: 600pt; background: #fff; border-radius: 12pt; padding: 24pt;"
  >
    <p
      style="position: absolute; top: 0; left: 24pt; width: 552pt; font-size: 18pt; color: #333;"
    >
      ✓ ポイント1: 最も伝えたいこと
    </p>
    <p
      style="position: absolute; top: 50pt; left: 24pt; width: 552pt; font-size: 18pt; color: #333;"
    >
      ✓ ポイント2: 次に伝えたいこと
    </p>
    <p
      style="position: absolute; top: 100pt; left: 24pt; width: 552pt; font-size: 18pt; color: #333;"
    >
      ✓ ポイント3: 行動を促すメッセージ
    </p>
  </div>
</body>
```

### 図+説明（左図右文）

```html
<h1>アーキテクチャ概要</h1>
<div
  style="position: absolute; top: 80pt; left: 40pt; width: 320pt; height: 280pt; background: #f5f5f5; border-radius: 8pt;"
>
  <p
    style="position: absolute; top: 120pt; left: 0; width: 320pt; text-align: center; color: #999;"
  >
    [図を挿入]
  </p>
</div>
<div style="position: absolute; top: 80pt; left: 380pt; width: 300pt;">
  <p style="position: absolute; top: 0; font-size: 14pt;">
    図の説明文をここに記載。
  </p>
  <ul style="position: absolute; top: 40pt; padding-left: 20pt;">
    <li style="font-size: 14pt; margin-bottom: 8pt;">要点1</li>
    <li style="font-size: 14pt; margin-bottom: 8pt;">要点2</li>
    <li style="font-size: 14pt;">要点3</li>
  </ul>
</div>
```

---

## 変換前チェック（必須）

```powershell
# 禁止パターン検出（何か出たら修正）
Get-ChildItem "output_manifest/${base}_slides/*.html" | Select-String "linear-gradient|rgba\(|position:\s*relative|display:\s*flex"
```

---

## トラブルシューティング

| 症状           | 原因                   | 対処                           |
| -------------- | ---------------------- | ------------------------------ |
| 全スライド空白 | `convert_html.js` 使用 | `convert_html_multi.js` に変更 |
| テキスト消失   | `<div>文字</div>`      | `<p>` で囲む                   |
| 背景が白       | gradient/rgba          | 単色に変更                     |
| 文字見えない   | 背景と文字色が近い     | コントラスト確保               |
| 改行おかしい   | width/nowrap なし      | CSS 追加                       |

---

## ファイル構成

```
output_manifest/{base}_slides/
├── slide-00-title.html    # 表紙
├── slide-01-agenda.html   # 目次
├── slide-02-xxx.html      # 本編
├── slide-NN-summary.html  # まとめ
└── slide-99-appendix.html # 補足
```

---

## 参照

- `scripts/convert_html_multi.js` — 複数 HTML 変換（必須）
- `scripts/create_from_template.py` — テンプレート方式（推奨）
- `.github/instructions/template.instructions.md` — IR 原則準拠の推奨方式
