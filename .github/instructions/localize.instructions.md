# Localize Instructions

英語 PPTX の日本語化（ローカライズ）ルール。

> ✅ **目的**: 英語プレゼンテーションを日本語話者向けに最適化

---

## 出力方式の選択

> 📖 方式選定の詳細は [tools-reference.instructions.md](tools-reference.instructions.md) を参照（SSOT）。

### クイックリファレンス

| 用途               | 推奨方式    |
| ------------------ | ----------- |
| 英語 PPTX → 日本語 | reconstruct |
| コード/技術内容多  | pptxgenjs   |
| シンプルテキスト   | template    |

> ⚠️ **html/preserve は非推奨**: IR 原則に基づき、reconstruct または template 方式を使用してください。

---

## クイックスタート

> ⚠️ **注意**: 以下の例は **preserve 方式（experimental）** のフローです。推奨は **reconstruct 方式**（`reconstruct_analyzer.py` + `create_from_template.py`）です。
> 📖 reconstruct 方式の詳細は [tools-reference.instructions.md](tools-reference.instructions.md) を参照（SSOT）。

```powershell
# 変数定義
$base = "20251211_azure_overview_ja"
$source = "input/azure_overview.pptx"

# 1. シェイプ抽出（構造分析用）
python scripts/extract_shapes.py "$source" "output_manifest/${base}_inventory.json"

# 2. スピーカーノート抽出
python scripts/translate_notes.py extract "$source" "output_manifest/${base}_notes.json"

# 3. replacements.json 作成（AI が実施）
#    - スライドテキストの翻訳
#    - slides_to_keep でサマリ用スライド選定
#    - add_summary_slide: true でアジェンダ追加
#    - summary_slide.color: "auto" で背景色自動判定

# 4. notes_ja.json 作成（AI が実施）
#    - スピーカーノートの翻訳

# 5. テキスト置換 + スライド削除 + サマリ追加
python scripts/apply_content.py "$source" "output_manifest/${base}_replacements.json" "output_ppt/${base}.pptx"

# 6. スピーカーノート適用
python scripts/translate_notes.py apply "output_ppt/${base}.pptx" "output_manifest/${base}_notes_ja.json" "output_ppt/${base}.pptx"

# 7. 確認
Start-Process "output_ppt/${base}.pptx"
```

---

## ⚠️ 重要: オーバーフロー対策

日本語は英語より文字幅が広いため、必ずフォントサイズを調整する。

### 必須ルール

| 元の font_size | 日本語 font_size | 備考           |
| -------------- | ---------------- | -------------- |
| 72pt 以上      | そのまま         | 数字のみの場合 |
| 36-72pt        | 30-36pt          | タイトル系     |
| 22-36pt        | 18-22pt          | 本文・説明     |
| 18pt 以下      | 14-16pt          | 注釈・出典     |

### 複数 paragraph 対応

元のシェイプに複数 paragraph がある場合、**すべての paragraph を含める**:

```json
// ❌ NG: paragraphが不足
"shape-4": {
  "paragraphs": [
    {"text": "73%", "font_size": 72.0}
  ]
}

// ✅ OK: 元と同じ数のparagraph
"shape-4": {
  "paragraphs": [
    {"text": "73%", "font_size": 72.0, "color": "FFFFFF"},
    {"text": "AI 固有のデータセキュリティ対策に投資", "font_size": 18.0, "color": "FFFFFF"}
  ]
}
```

---

## 構造分析ルール

### スライド分類

| 分類    | 条件                                     | 処理         |
| ------- | ---------------------------------------- | ------------ |
| SIMPLE  | タイトル + 本文のみ（shape 数 ≤ 5）      | **翻訳可**   |
| COMPLEX | 装飾テキスト/多層レイアウト/アイコン重複 | **英語保持** |
| CHART   | グラフ/ダイアグラム/図表                 | **英語保持** |

### 除外シェイプ

| 条件                   | 理由                                 |
| ---------------------- | ------------------------------------ |
| `left > 13.0` インチ   | スライド外（装飾・ウォーターマーク） |
| `font_size > 80pt`     | 装飾テキスト（背景グラデーション）   |
| 同一座標に複数シェイプ | アイコン重複の可能性                 |

### ⚠️ 狭小シェイプルール【重要】

> **幅の狭いボックスには長い日本語を入れない**

| シェイプ幅   | 最大日本語文字数 | 推奨対応             |
| ------------ | ---------------- | -------------------- |
| 〜2 インチ   | 4 文字以下       | **英語維持** or 略語 |
| 2〜3 インチ  | 6 文字以下       | 短縮必須             |
| 3〜4 インチ  | 10 文字以下      | 短縮推奨             |
| 4 インチ以上 | 制限なし         | 通常翻訳             |

**狭小シェイプの判定方法**:

1. `extract_shapes.py` 出力の `width` を確認（単位: インチ or EMU）
2. 幅 < 3 インチ の場合 → 英語維持を検討
3. カード型 UI/ラベル型 → 特に注意

**英語維持すべきパターン**:

- Knowledge Sources → そのまま（日本語:「知識源」でも縦崩れする狭さ）
- AI Growth → そのまま（縦長ボックス）
- Platform → そのまま
- 数値 + 短いラベル（例: "90% of data"）→ 数字のみ維持、説明は削除 or 別シェイプ

**対処例**:

```json
// ❌ NG: 狭いボックスに長い日本語
{"text": "ナレッジソース"}
{"text": "AIの成長コラボレーションとイノベーション"}

// ✅ OK: 英語維持 or 極短縮
{"text": "Knowledge Sources"}
{"text": "AI Growth"}
```

### 複雑なレイアウトの判定

```
以下のいずれかに該当 → 英語保持:

1. shape 数 > 10
2. 装飾テキスト（大きなグラデーション文字）
3. タイムライン/ロードマップ構造
4. 複雑なマトリクス/表
5. フローチャート/ダイアグラム
```

---

## ⚠️ スライド統合ルール【重要】

> **類似・連続するスライドは 1 枚にまとめる**

### 統合対象パターン

| パターン               | 例                                  | 統合方法                               |
| ---------------------- | ----------------------------------- | -------------------------------------- |
| **ラベル + タイトル**  | 「新登場」→「機能名」の連続         | 1 枚に統合（ラベルを装飾として含める） |
| **セクション区切り**   | 同じタイトルの導入/詳細スライド     | 代表 1 枚のみ残す                      |
| **ステップ説明**       | Step 1, Step 2, Step 3 が別スライド | 1 枚にまとめるか代表を選ぶ             |
| **Before/After**       | 変更前/変更後の比較                 | 1 枚に並べる or 代表のみ               |
| **アニメーション分割** | 段階表示用の複製スライド            | 最終状態のみ残す                       |

### 統合判定基準

```
以下のすべてに該当 → 統合候補:

1. 連続する 2〜3 枚のスライド
2. 類似のレイアウト（同じテンプレート）
3. 内容が補完関係（単独では情報不足）
4. shape 数が少ない（≤ 3）
```

### 具体例: 「新登場」パターン

**統合前（2 枚）:**

```
スライド 163: 「新登場」（ラベルのみ）
スライド 164: 「Data Security Posture Agent」（機能名のみ）
```

**統合後（1 枚）:**

```
スライド: 「新登場: Data Security Posture Agent」
  - または機能名のみ残し、「新登場」はスピーカーノートに移動
```

### slides_to_keep での対応

```json
{
  // ❌ NG: 両方残す（冗長）
  "slides_to_keep": [163, 164, 167, 168, 170, 171],

  // ✅ OK: 機能名スライドのみ残す
  "slides_to_keep": [164, 168, 171],

  // スピーカーノートに補足
  "164": "【新登場】Data Security Posture Agent の紹介"
}
```

### 統合チェックリスト

- [ ] 「新登場」「New」「Coming soon」の後に機能名スライドがあるか？
- [ ] セクションタイトル + 詳細が分割されていないか？
- [ ] アニメーション用の重複スライドがないか？
- [ ] Before/After が別スライドになっていないか？

### ⚠️ 同一スライド内の「ラベル + 機能名」パターン

> **「Introducing」と機能名が同じスライド内にある場合は統合不要**

```json
// inventory で確認:
"slide-163": {
  "shape-0": { "text": "Introducing" },     // ラベル
  "shape-1": { "text": "Data Security..." }  // 機能名
}

// この場合は両方維持:
"slide-163": {
  "shape-0": { "paragraphs": [{"text": "新登場", "color": "FFFFFF"}] },
  "shape-1": { "paragraphs": [{"text": "Data Security Posture Agent", "color": "FFFFFF"}] }
}
```

**ポイント**: 機能名（製品名）は英語維持、ラベルのみ翻訳

---

## 翻訳ルール

### 1. 製品名・技術用語【英語維持】

> **⚠️ 絶対に日本語化しない**

| カテゴリ         | 例                                              |
| ---------------- | ----------------------------------------------- |
| Microsoft 製品   | Azure, Microsoft Purview, Copilot, Sentinel     |
| 機能名           | DLP, DSPM, Insider Risk, Information Protection |
| 技術略語         | API, SDK, DNS, AI, ML, LLM, RAG                 |
| プロトコル       | HTTP, HTTPS, TLS, OAuth                         |
| クラウドサービス | SaaS, PaaS, IaaS                                |

### 2. カタカナ化するもの

| 英語       | 日本語           |
| ---------- | ---------------- |
| Cloud      | クラウド         |
| Security   | セキュリティ     |
| Data       | データ           |
| Platform   | プラットフォーム |
| Solution   | ソリューション   |
| Governance | ガバナンス       |

### 3. 日本語化するもの

| 英語           | 日本語             |
| -------------- | ------------------ |
| Overview       | 概要               |
| Summary        | まとめ             |
| Introduction   | はじめに           |
| Conclusion     | 結論               |
| Problem        | 課題               |
| Solution       | 解決策             |
| Best Practices | ベストプラクティス |

---

## 文字数調整ルール

### 基準

> **日本語は英語より幅を取る。元のボックスに収まるよう調整必須。**

| 元の文字数 | 日本語目標 | フォント調整           |
| ---------- | ---------- | ---------------------- |
| 〜20 字    | 同等       | そのまま               |
| 20〜50 字  | 80%        | 必要なら font_size: 24 |
| 50 字〜    | 70%        | font_size: 20-24       |

### オーバーフロー対策

1. **テキストを短縮**
   - 冗長な表現を削除
   - 主語を省略（日本語では可能）

2. **フォントサイズを縮小**
   - 最小 20pt まで
   - `font_size` プロパティで指定

3. **改行を追加**
   - `\n` で明示的に改行
   - ただし高さ制限に注意

### 例

```json
// ❌ NG: 長すぎる
{ "text": "Microsoft Purview を使用して、Microsoft 365 Copilot のデータを検出、保護、ガバナンスします" }

// ✅ OK: 短縮 + フォントサイズ指定
{ "text": "M365 Copilot の検出・保護・ガバナンス", "font_size": 24 }
```

---

## コントラスト対策

### 暗い背景の検出

inventory.json で以下を確認:

- `theme_color` が `"TEXT_1"` または暗い系
- 元のテキストが白系（`color: "FFFFFF"` など）
- 背景画像/グラデーションがある

### 対策

```json
// 暗い背景のスライド
{
  "slide-4": {
    "shape-1": {
      "paragraphs": [
        { "text": "翻訳テキスト", "color": "FFFFFF", "font_size": 24 }
      ]
    }
  }
}
```

### 暗い背景が多いテンプレート

Microsoft Ignite 系のテンプレートは**ほぼ全スライドが暗い背景**。
以下のスライドタイプには `color: "FFFFFF"` を付与:

- 統計スライド（大きな数字）
- 引用スライド
- セクション区切り
- アナウンスメント

---

## replacements.json 形式

### 基本構造

```json
{
  "slide-0": {
    "shape-0": {
      "paragraphs": [
        {
          "text": "タイトル",
          "font_size": 36,
          "color": "FFFFFF"
        }
      ]
    }
  },
  "slide-7": {
    "_skip": true,
    "_reason": "english_keep - complex diagram"
  }
}
```

### 必須/推奨プロパティ

| プロパティ  | 必須   | 説明               |
| ----------- | ------ | ------------------ |
| `text`      | ✅     | テキスト内容       |
| `font_size` | ★ 推奨 | オーバーフロー対策 |
| `color`     | ★ 推奨 | コントラスト対策   |
| `bold`      | -      | 太字               |
| `bullet`    | -      | 箇条書き           |

---

## スピーカーノートの翻訳

> **✅ 必須ステップ**: スピーカーノートも翻訳対象に含める

### ワークフロー

```powershell
# 1. ノートを JSON に抽出
python scripts/translate_notes.py extract "output_manifest/${base}_working.pptx" "output_manifest/${base}_notes.json"

# 2. notes.json を編集して日本語翻訳を追加
# → "translated" フィールドに翻訳を入力

# 3. 翻訳済みノートを適用
python scripts/translate_notes.py apply "output_ppt/${base}.pptx" "output_manifest/${base}_notes_ja.json" "output_ppt/${base}_final.pptx"
```

### notes.json 形式

```json
{
  "0": {
    "original": "My name is John. I'm the GM of Azure.",
    "translated": "私の名前は John です。Azure のゼネラルマネージャーを務めています。"
  },
  "1": {
    "original": "Today we'll cover three topics.",
    "translated": "本日は 3 つのトピックをカバーします。"
  }
}
```

### 翻訳ルール（ノート用）

| カテゴリ   | ルール                         |
| ---------- | ------------------------------ |
| 製品名     | スライド同様、英語維持         |
| 口語表現   | 自然な日本語（丁寧語推奨）     |
| 数字・統計 | 原文のまま維持                 |
| 長文       | 適宜改行を入れて可読性を向上   |
| デモ指示   | 「デモを見せましょう」等に翻訳 |

### スクリプト詳細 (`scripts/translate_notes.py`)

```bash
# コマンド一覧
python translate_notes.py extract <input.pptx> <output.json>   # 抽出
python translate_notes.py apply <input.pptx> <notes.json> <output.pptx>  # 適用
python translate_notes.py legacy <input.pptx> <output.pptx>    # ハードコード翻訳
```

### 簡易ワークフロー（1 ステップ）

AI にノート翻訳を依頼する場合:

```python
from pptx import Presentation

# 翻訳済みノートを直接適用
NOTES_JA = {
    0: "日本語ノート 1",
    1: "日本語ノート 2",
}

prs = Presentation("output_ppt/output.pptx")
for slide_idx, note_text in NOTES_JA.items():
    if slide_idx < len(prs.slides):
        slide = prs.slides[slide_idx]
        notes_frame = slide.notes_slide.notes_text_frame
        notes_frame.text = note_text

prs.save("output_ppt/output_with_notes.pptx")
```

```

---

## チェックリスト

### 翻訳前

- [ ] inventory.json を確認し、複雑なスライドを特定
- [ ] 英語保持リスト（english_keep_slides）を作成
- [ ] off-slide シェイプ（left > 13"）を除外リストに追加
- [ ] 暗い背景のスライドを特定

### 翻訳後

- [ ] 製品名・技術用語が英語のまま維持されているか
- [ ] 文字数が元の 80% 以内に収まっているか
- [ ] フォントサイズが適切に指定されているか（24pt 以上推奨）
- [ ] 暗い背景のスライドに `color: "FFFFFF"` が指定されているか
- [ ] 英語保持スライドが replacements.json から除外されているか

---

## よくある問題と対処

| 問題                     | 原因                   | 対処                           |
| ------------------------ | ---------------------- | ------------------------------ |
| テキストが切れる         | 日本語が長い           | font_size 縮小 or テキスト短縮 |
| テキストが見えない       | 暗い背景で黒文字       | color: "FFFFFF" を追加         |
| 装飾とテキストが重複     | 複雑なレイアウト       | スライド全体を英語保持         |
| 製品名が日本語化された   | 翻訳ルール違反         | 英語に戻す                     |
| インデックスがずれている | reorder 後の番号不一致 | working.pptx の番号を使用      |

---

## 参照

| ルール       | 参照先                                          |
| ------------ | ----------------------------------------------- |
| JSON 形式    | `.github/instructions/template.instructions.md` |
| 命名規則     | `.github/instructions/common.instructions.md`   |
| エージェント | `.github/agents/localizer.agent.md`             |
```
