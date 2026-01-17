# スクリプト依存関係

**このファイルがスクリプト間の依存関係に関する SSOT（Single Source of Truth）です。**

> 📖 参照元: AGENTS.md, tools-reference.instructions.md

---

## EXTRACT フェーズの依存グラフ

```
                    ┌─────────────────────────┐
                    │    classify_input.py    │
                    │   (classification.json) │
                    └───────────┬─────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────┐
│extract_images.py│   │analyze_template │   │diagnose_template.py │
│  (images/*.png) │   │   (.py)         │   │ (テンプレート診断)   │
└────────┬────────┘   │ (layouts.json)  │   └──────────┬──────────┘
         │            └────────┬────────┘              │
         │                     │                       ▼
         │                     │            ┌─────────────────────┐
         │                     │            │  clean_template.py  │
         │                     │            │ (クリーン済み.pptx)  │
         │                     │            └──────────┬──────────┘
         │                     │                       │
         └─────────────────────┼───────────────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │ reconstruct_analyzer.py │
                    │     (content.json)      │
                    │ ※画像パス参照のため      │
                    │   extract_images 後必須　│
                    └─────────────────────────┘
```

---

## 依存関係マトリクス

| スクリプト                | 依存先                                           | 依存理由                       |
| ------------------------- | ------------------------------------------------ | ------------------------------ |
| `extract_images.py`       | （なし）                                         | 単独実行可能                   |
| `analyze_template.py`     | （なし）                                         | 単独実行可能                   |
| `diagnose_template.py`    | （なし）                                         | 単独実行可能                   |
| `clean_template.py`       | `diagnose_template.py`                           | 診断結果を基にクリーニング     |
| `reconstruct_analyzer.py` | `extract_images.py`                              | 画像パスを content.json に記載 |
| `create_from_template.py` | `analyze_template.py`, `validate_content.py`     | layouts.json + 検証済み IR     |
| `validate_content.py`     | `reconstruct_analyzer.py` or Localizer           | content.json 必須              |
| `validate_pptx.py`        | `create_from_template.py`, `validate_content.py` | PPTX + content.json 必須       |

---

## 並列実行可能なスクリプト

以下のスクリプトは EXTRACT フェーズで**並列実行可能**:

- `extract_images.py`
- `analyze_template.py`
- `diagnose_template.py`

```powershell
# 並列実行例
Start-Job { python scripts/extract_images.py $input "images" }
Start-Job { python scripts/analyze_template.py $template }
Start-Job { python scripts/diagnose_template.py $template }
Get-Job | Wait-Job

# ↑の完了後に実行（依存関係あり）
python scripts/reconstruct_analyzer.py $input "output_manifest/${base}_content.json"
```

---

## 実行順序の制約

### 必ず順番に実行が必要なケース

1. **画像抽出 → コンテンツ抽出**

   ```powershell
   python scripts/extract_images.py $input "images"
   python scripts/reconstruct_analyzer.py $input "output_manifest/${base}_content.json"
   ```

2. **テンプレート診断 → クリーニング**

   ```powershell
   python scripts/diagnose_template.py $template
   python scripts/clean_template.py $template "output_manifest/${base}_clean.pptx"
   ```

3. **コンテンツ検証 → PPTX 生成**
   ```powershell
   python scripts/validate_content.py "output_manifest/${base}_content_ja.json"
   python scripts/create_from_template.py $template "output_manifest/${base}_content_ja.json" "output_ppt/${base}.pptx"
   ```

---

## スクリプト一覧（クイックリファレンス）

| スクリプト                | 入力                   | 出力                  |
| ------------------------- | ---------------------- | --------------------- |
| `classify_input.py`       | ファイル/URL           | classification.json   |
| `extract_images.py`       | PPTX                   | images/\*.png         |
| `analyze_template.py`     | PPTX                   | layouts.json          |
| `diagnose_template.py`    | PPTX                   | 診断結果（stdout）    |
| `clean_template.py`       | PPTX                   | クリーン済み PPTX     |
| `reconstruct_analyzer.py` | PPTX                   | content.json          |
| `validate_content.py`     | content.json           | 検証結果（exit code） |
| `create_from_template.py` | PPTX + content.json    | 出力 PPTX             |
| `validate_pptx.py`        | PPTX + content.json    | 検証結果（exit code） |
| `workflow_tracer.py`      | （ライブラリとして）   | trace.jsonl           |
| `resume_workflow.py`      | base_name + phase 指定 | ワークフロー再開      |
