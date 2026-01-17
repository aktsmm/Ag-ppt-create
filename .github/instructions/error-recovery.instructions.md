# エラーリカバリ戦略

**このファイルがエラーリカバリに関するルールの SSOT（Single Source of Truth）です。**

> 📖 参照元: AGENTS.md, orchestrator.agent.md, json-reviewer.agent.md, pptx-reviewer.agent.md

---

## リトライポリシー

| 項目         | 値                                           |
| ------------ | -------------------------------------------- |
| 最大リトライ | **3 回**                                     |
| リトライ対象 | 同一フェーズでの失敗                         |
| リトライ間隔 | 即時（人間介入なし）                         |
| リトライ単位 | フェーズ単位（EXTRACT, TRANSLATE, BUILD 等） |

---

## 差し戻しマトリクス

| フェーズ     | 失敗種別               | 差し戻し先       | アクション                       |
| ------------ | ---------------------- | ---------------- | -------------------------------- |
| REVIEW(JSON) | スキーマ違反           | EXTRACT          | `reconstruct_analyzer.py` 再実行 |
| REVIEW(JSON) | 空スライド             | EXTRACT          | content.json 修正                |
| REVIEW(JSON) | 画像パス不在           | EXTRACT          | `extract_images.py` 再実行       |
| REVIEW(JSON) | 翻訳エラー             | TRANSLATE        | Localizer 再実行                 |
| REVIEW(PPTX) | スライド数不一致       | BUILD            | `create_from_template.py` 再実行 |
| REVIEW(PPTX) | レイアウト崩れ         | PREPARE_TEMPLATE | テンプレート再診断               |
| BUILD        | テンプレート読込エラー | PREPARE_TEMPLATE | `diagnose_template.py` 実行      |
| **3 回失敗** | 任意                   | **ESCALATE**     | 人間介入待ち                     |

---

## エスカレーション条件

以下の条件で **ESCALATE** フェーズに移行し、人間介入を待つ:

1. **同一フェーズで 3 回連続失敗**
2. **解決不能なエラー**
   - API レート制限
   - ファイル破損
   - 権限エラー
3. **AI 判断で修正困難と判定**
   - 構造的な問題
   - 元データの品質問題

---

## エスカレーション時の出力

```json
{
  "status": "escalated",
  "phase": "REVIEW_JSON",
  "base_name": "20251214_example_report",
  "failure_count": 3,
  "failures": [
    { "attempt": 1, "error": "Empty slide at index 5", "timestamp": "..." },
    { "attempt": 2, "error": "Empty slide at index 5", "timestamp": "..." },
    { "attempt": 3, "error": "Empty slide at index 5", "timestamp": "..." }
  ],
  "reason": "Empty slides detected in slides[5], [8], [12]",
  "suggested_action": "Manual review of content.json required",
  "files": {
    "content": "output_manifest/xxx_content_ja.json",
    "trace": "output_manifest/xxx_trace.jsonl"
  },
  "escalated_at": "2025-12-14T10:30:00+09:00"
}
```

---

## ワークフロー再開

```powershell
# エスカレーション後、手動修正してから再開
python scripts/resume_workflow.py 20251214_example_report --from REVIEW_JSON

# 特定フェーズから強制再開（リトライカウントリセット）
python scripts/resume_workflow.py 20251214_example_report --from EXTRACT --reset-retry
```

---

## レビュー合否基準

| 判定    | 条件              | アクション            |
| ------- | ----------------- | --------------------- |
| ✅ PASS | エラー 0、警告 0  | 次フェーズへ          |
| ⚠️ WARN | エラー 0、警告 1+ | ユーザー確認後続行    |
| ❌ FAIL | エラー 1+         | 差し戻し（最大 3 回） |
