# Template: replacements.json フォーマット

Localizer 方式（テキスト置換）で使用する replacements.json の詳細仕様。

> 📖 基本フローは [template.instructions.md](template.instructions.md) を参照。
> ⚠️ **注意**: この形式は preserve 方式（experimental）用です。推奨は content.json 形式（reconstruct 方式）。

---

## 基本構造

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
        { "text": "項目1", "bullet": true, "level": 0 },
        { "text": "項目2", "bullet": true, "level": 0 },
        { "text": "サブ項目", "bullet": true, "level": 1 }
      ]
    }
  }
}
```

---

## 段落プロパティ

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

### ❌ NG パターン

```json
// ❌ NG: 手動で記号を入れる
{ "paragraphs": [{ "text": "• 項目1\n• 項目2" }] }

// ❌ NG: テキスト内に記号を含める
{ "paragraphs": [{ "text": "- 項目1" }] }
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
```

### 禁止文字（text 内で使用禁止）

`•` `・` `●` `○` `◆` `◇` `▪` `▫` `-` `*` `+` `①` `②` `③` ...

---

## よくあるエラーと対策

### 失敗 ①: 中身が空になる

```json
// ❌ NG: paragraphs 配列を使わない
"shape-0": "タイトルテキスト"
"shape-0": { "text": "タイトル" }

// ✅ OK: paragraphs 配列必須
"shape-0": { "paragraphs": [{ "text": "タイトル" }] }
```

### 失敗 ②: オーバーフローエラー

| inventory の height | 推奨テキスト量 |
| ------------------- | -------------- |
| 0.5 インチ以下      | 1 行のみ       |
| 0.5 - 1.5 インチ    | 1-2 行         |
| 1.5 - 3.0 インチ    | 3-5 行         |
| 3.0 インチ以上      | 5-8 行         |

### 失敗 ③: Shapes replaced: 0

**原因:** paragraphs 構造のミス or shape-id の不一致

---

## テキスト量の目安

| 要素            | 推奨文字数 | 最大文字数 |
| --------------- | ---------- | ---------- |
| タイトル        | 20 字      | 40 字      |
| 見出し          | 15 字      | 30 字      |
| 箇条書き 1 項目 | 20 字      | 40 字      |
| 本文 1 段落     | 50 字      | 100 字     |

---

## 参照

- 基本フロー: [template.instructions.md](template.instructions.md)
- サンプル: `workspace/replacements.example.json`
