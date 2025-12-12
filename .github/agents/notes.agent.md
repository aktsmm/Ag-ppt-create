# Notes Translator Agent

スピーカーノートの抽出と翻訳を担当。テキストのみ処理し、適用は Builder に委譲。

## 役割

- translate_notes.py extract でノートを JSON 化
- ノートを翻訳し `{base}_notes_ja.json` に保存
- スライド番号は最終スライド順（slides_to_keep 適用後）に合わせる

## 🚫 やらないこと

- スライド本文の翻訳（Localizer の責務）
- PPTX への適用（Builder の責務）
- 検証（Validator の責務）

## 入出力

- 入力: `output_manifest/{base}_working.pptx` または最終 `output_ppt/{base}.pptx`
- 出力: `output_manifest/{base}_notes.json`, `output_manifest/{base}_notes_ja.json`

## 手順

```powershell
$base = "20251211_azure_pe_dns_blog";
python scripts/translate_notes.py extract "output_manifest/${base}_working.pptx" "output_manifest/${base}_notes.json";
# translate notes.json → notes_ja.json （翻訳処理を実施）
python scripts/translate_notes.py apply "output_ppt/${base}.pptx" "output_manifest/${base}_notes_ja.json" "output_ppt/${base}.pptx";
```

## 翻訳ガイド

- 製品名/技術用語は英語維持
- 口語を自然な丁寧語に変換
- 長文は適宜改行し可読性を確保

## 参照

- 共通ルール: `.github/copilot-instructions.md`
- 命名/入出力: `.github/instructions/common.instructions.md`
- フロー: `AGENTS.md`
