```markdown
# レビューワークフロー

PPTX 生成パイプラインにおける品質レビューの自動化ワークフロー。

> **責務分離**:
>
> - JSON レビュー → `json-reviewer.agent.md`
> - PPTX レビュー → `pptx-reviewer.agent.md`

## 概要
```

TRANSLATE 完了
↓
┌─────────────────────────────────────────────────────────────┐
│ JSON Review (REVIEW_JSON) │
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │validate_content │ → │ JSON Reviewer │ → PASS/WARN/FAIL│
│ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
↓ PASS/WARN(確認後)
BUILD (create_from_template.py)
↓
┌─────────────────────────────────────────────────────────────┐
│ PPTX Review (REVIEW_PPTX) │
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │ validate_pptx │ → │ PPTX Reviewer │ → PASS/WARN/FAIL│
│ └─────────────────┘ └─────────────────┘ │
│ ↓ FAIL ↓ issues found │
│ 即時差し戻し 修正提案生成 │
└─────────────────────────────────────────────────────────────┘
↓
DONE または 差し戻し（最大 3 回）→ ESCALATE

````

---

## Phase 1: JSON Review (REVIEW_JSON)

BUILD 前に content.json の品質を検証する。

### Step 1-1: 自動検証 (validate_content.py)

**入力**:
- `output_manifest/{base}_content_ja.json`

**チェック項目**:
| 項目 | 検出方法 | 判定 |
|------|---------|------|
| スキーマ準拠 | JSON Schema | FAIL if 不一致 |
| 空スライド | items/image 有無 | FAIL if 無し |
| 画像パス存在 | ファイル存在確認 | FAIL if 無し |
| アジェンダ有無 | type: agenda 検索 | WARN if 無し |

**コマンド**:
```powershell
python scripts/validate_content.py "output_manifest/${base}_content_ja.json"
# exit code: 0=PASS, 1=FAIL, 2=WARN
````

### Step 1-2: AI レビュー (JSON Reviewer Agent)

**入力**:

- Step 1-1 の検証結果
- `output_manifest/{base}_content_ja.json`

**チェック項目**:
| カテゴリ | 項目 | 判定 |
|---------|------|------|
| 翻訳 | 英語残存 | FAIL |
| 翻訳 | 不自然な日本語 | WARN |
| 用語 | 技術用語の適切さ | WARN |
| ノート | 出典のみで内容不足 | WARN |
| 一貫性 | 前後スライドの矛盾 | WARN |

**担当エージェント**: `.github/agents/json-reviewer.agent.md`

---

## Phase 2: BUILD

JSON Review が PASS（または WARN 確認後続行）の場合に実行。

**コマンド**:

```powershell
python scripts/create_from_template.py $template "output_manifest/${base}_content_ja.json" "output_ppt/${base}.pptx"
```

---

## Phase 3: PPTX Review (REVIEW_PPTX)

BUILD 完了後に生成された PPTX の品質を検証する。

### Step 3-1: 自動検証 (validate_pptx.py)

**入力**:

- `output_ppt/{base}.pptx`
- `output_manifest/{base}_content_ja.json`

**チェック項目**:
| 項目 | 検出方法 | 判定 |
|------|---------|------|
| スライド数一致 | JSON vs PPTX | FAIL if 不一致 |
| ノート欠落 | notes_slide 確認 | WARN |
| オーバーフロー | 文字数/段落数 | WARN |
| 出典のみノート | パターン検出 | WARN |
| 署名有無 | 先頭/末尾ノート | INFO |

**コマンド**:

```powershell
python scripts/validate_pptx.py "output_ppt/${base}.pptx" "output_manifest/${base}_content_ja.json"
# exit code: 0=PASS, 1=FAIL, 2=WARN
```

### Step 3-2: コンテンツ抽出 (review_pptx.py)

AI レビュー用に PPTX 内容をテキスト化。

**コマンド**:

```powershell
python scripts/review_pptx.py "output_ppt/${base}.pptx"
```

**出力**: スライドごとのタイトル・本文・ノートの一覧

### Step 3-3: AI レビュー (PPTX Reviewer Agent)

**入力**:

- Step 3-1 の検証結果
- Step 3-2 のコンテンツ抽出結果

**チェック項目**:
| カテゴリ | 項目 | 判定 |
|---------|------|------|
| 視覚 | レイアウト崩れ | WARN/FAIL |
| 視覚 | 画像/テキスト重なり | FAIL |
| 内容 | 空スライド | FAIL |
| 内容 | 1 スライド複数トピック | WARN |
| ノート | 内容不足 | WARN |
| 構成 | アジェンダ/まとめ欠落 | WARN |
| CTA | 次のアクションの明確さ | WARN |

**担当エージェント**: `.github/agents/pptx-reviewer.agent.md`

---

## Phase 4: 判定・レポート出力

### 判定ロジック

```
if (FAILあり):
    → 差し戻し（最大3回、その後 ESCALATE）
elif (WARN 4+):
    → ユーザー確認必須
elif (WARN 1-3):
    → 警告付きでDONE可
else:
    → PASS → DONE
```

### 判定マトリクス

| エラー数 | 警告数 | 判定            | アクション             |
| -------- | ------ | --------------- | ---------------------- |
| 0        | 0      | ✅ PASS         | DONE へ進む            |
| 0        | 1-3    | ⚠️ WARN (minor) | ユーザー確認後 DONE    |
| 0        | 4+     | ⚠️ WARN (major) | 修正推奨、ユーザー確認 |
| 1+       | -      | ❌ FAIL         | 差し戻し（最大 3 回）  |

### レポート保存

```powershell
# レビュー結果を保存
output_manifest/{base}_review_report.md
```

---

## 差し戻しポリシー

| フェーズ     | 問題の種類       | 差し戻し先       | アクション                  |
| ------------ | ---------------- | ---------------- | --------------------------- |
| REVIEW_JSON  | スキーマ違反     | EXTRACT          | reconstruct_analyzer 再実行 |
| REVIEW_JSON  | 翻訳エラー       | TRANSLATE        | Localizer 再実行            |
| REVIEW_JSON  | ノート不足       | TRANSLATE        | Localizer にノート充実依頼  |
| REVIEW_PPTX  | スライド数不一致 | BUILD            | 再生成                      |
| REVIEW_PPTX  | レイアウト崩れ   | PREPARE_TEMPLATE | テンプレート再診断          |
| **3 回失敗** | 任意             | **ESCALATE**     | 人間介入待ち                |

> 詳細: `.github/instructions/error-recovery.instructions.md`

---

## 呼び出し例

### Orchestrator からの呼び出し

```powershell
$base = "20251215_copilot_sier"

Write-Host "=== Review Workflow ===" -ForegroundColor Cyan

# Phase 1: JSON Review
Write-Host "Phase 1: JSON Review..." -ForegroundColor Yellow
python scripts/validate_content.py "output_manifest/${base}_content_ja.json"
if ($LASTEXITCODE -eq 1) {
    Write-Host "❌ JSON FAIL - 差し戻し" -ForegroundColor Red
    exit 1
}
# → JSON Reviewer Agent を呼び出し

# Phase 2: BUILD
Write-Host "Phase 2: BUILD..." -ForegroundColor Yellow
python scripts/create_from_template.py $template "output_manifest/${base}_content_ja.json" "output_ppt/${base}.pptx"

# Phase 3: PPTX Review
Write-Host "Phase 3: PPTX Review..." -ForegroundColor Yellow
python scripts/validate_pptx.py "output_ppt/${base}.pptx" "output_manifest/${base}_content_ja.json"
if ($LASTEXITCODE -eq 1) {
    Write-Host "❌ PPTX FAIL - 差し戻し" -ForegroundColor Red
    exit 1
}
python scripts/review_pptx.py "output_ppt/${base}.pptx"
# → PPTX Reviewer Agent を呼び出し

# Phase 4: DONE
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PASS - PowerPointで確認" -ForegroundColor Green
    Start-Process "output_ppt/${base}.pptx"
}
```

---

## エージェント連携

```
┌─────────────────┐
│  Orchestrator   │
│  (状態管理)      │
└────────┬────────┘
         │ TRANSLATE完了
         ▼
┌─────────────────┐
│  JSON Reviewer  │
│ (content.json)  │
└────────┬────────┘
    ┌────┴────┐
    ▼         ▼
  PASS      FAIL
    │         │
    ▼         ▼
  BUILD    差し戻し
    │      (Localizer)
    ▼
┌─────────────────┐
│  PPTX Reviewer  │
│ (生成済みPPTX)   │
└────────┬────────┘
    ┌────┴────┐
    ▼         ▼
  PASS      FAIL
    │         │
    ▼         ▼
  DONE    差し戻し
         (BUILD or
          PREPARE)
```

---

## 参照

- JSON Reviewer: `.github/agents/json-reviewer.agent.md`
- PPTX Reviewer: `.github/agents/pptx-reviewer.agent.md`
- 自動検証(JSON): `scripts/validate_content.py`
- 自動検証(PPTX): `scripts/validate_pptx.py`
- コンテンツ抽出: `scripts/review_pptx.py`
- エラーリカバリ: `.github/instructions/error-recovery.instructions.md`

```

```
