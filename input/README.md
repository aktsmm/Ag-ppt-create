# input/

**ユーザー入力専用フォルダ**。プレゼンテーション作成の入力ソースを配置する。

> ⚠️ 自動生成された中間ファイル（API 取得結果、分析結果等）は `output_manifest/` に保存されます。

## 用途

| ファイル種別       | 説明                               |
| ------------------ | ---------------------------------- |
| `*.pptx`           | 英語版 PowerPoint（日本語化対象）  |
| `*.txt`            | テキスト原稿、アウトライン         |
| `*.md`             | Markdown 形式の原稿                |
| `urls.txt`         | 変換したい URL リスト（1 行 1URL） |
| `*.pdf` / `*.docx` | 参照資料（markitdown で変換可能）  |

## 使用例

```powershell
# 英語版PPTXから日本語版を作成
# input/presentation_en.pptx を置いて、Orchestrator に依頼

# URL リストから一括変換
# input/urls.txt に URL を1行ずつ記載
```

## 注意事項

- **このフォルダにはユーザーが手動で配置したファイルのみ置く**
- API 取得結果や content.json などの中間ファイルは `output_manifest/` に自動保存される
- 処理後のファイルは自動削除されません（手動で整理してください）
