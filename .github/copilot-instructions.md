# Repository Copilot Instructions

PPTX 自動生成プロジェクト向けの共通ガードレール。

## 参照ドキュメント

| ドキュメント                                                                                       | 説明                                  |
| -------------------------------------------------------------------------------------------------- | ------------------------------------- |
| [AGENTS.md](../AGENTS.md)                                                                          | エージェント一覧とワークフロー        |
| [agents/brainstormer.agent.md](agents/brainstormer.agent.md)                                       | 壁打ちエージェント（インプット収集）  |
| [agents/json-reviewer.agent.md](agents/json-reviewer.agent.md)                                     | JSON レビューエージェント（翻訳品質） |
| [agents/pptx-reviewer.agent.md](agents/pptx-reviewer.agent.md)                                     | PPTX レビューエージェント             |
| [instructions/plan-phase.instructions.md](instructions/plan-phase.instructions.md)                 | PLAN フェーズ確認プロセス（★ 必須）   |
| [instructions/quality-guidelines.instructions.md](instructions/quality-guidelines.instructions.md) | 品質ガイドライン                      |
| [instructions/tools-reference.instructions.md](instructions/tools-reference.instructions.md)       | ツール使用ルール・フロー              |
| [instructions/common.instructions.md](instructions/common.instructions.md)                         | 命名規則・箇条書きルール              |
| [agents/\*.agent.md](agents/)                                                                      | 各エージェント定義                    |

> 📖 **設計原則（SSOT, Agent vs Script, IR, Fail Fast, Human in the Loop）** は [AGENTS.md](../AGENTS.md) を参照。

---

## コミュニケーション

- 日本語で簡潔に回答。コードコメントは英語。
- ブロッカーは最初に共有。
- ファイル参照はパスを明記（例: `scripts/extract_shapes.py`）。

## コーディング規約

- PowerShell: `;` で連結（`&&` 禁止）
- Python: 型ヒント必須、Google スタイル docstring
- JavaScript/Node: ES Modules、async/await
- 生成物は ASCII 優先

## ターミナル操作（★ 重要・必ず守ること）

> 🚨 **コマンド実行前に必ずカレントディレクトリを確認すること！**
> 間違ったディレクトリで実行すると、親フォルダの `.git` を参照したり、ファイルが見つからないエラーが発生します。

### 必須手順

1. **コマンド実行前にカレントディレクトリを確認**: `Get-Location` または `pwd`
2. **ワークスペースルートに移動してから実行**: `Set-Location "D:\03_github\Ag-ppt-create"`
3. 相対パスを使用するスクリプトは必ずプロジェクトルートから実行すること

### git コマンドの注意点

- **git コマンドは必ずリポジトリルートで実行**: `cd` が省略されると親ディレクトリの `.git` を参照する可能性あり
- **複合コマンドでは `Set-Location` を最初に**: `Set-Location "D:\03_github\Ag-ppt-create"; git status` のように明示的に移動

### リポジトリ構成

| リポジトリ  | 用途             | URL                                             |
| ----------- | ---------------- | ----------------------------------------------- |
| **Public**  | 公開版（安定版） | https://github.com/aktsmm/Ag-ppt-create         |
| **Private** | 開発版（実験的） | https://github.com/aktsmm/Ag-ppt-create-private |

> 💡 開発は Private → 安定したら Public にマージ

### 推奨パターン

```powershell
# ★ 必ずこの形式でコマンドを実行
Set-Location "D:\03_github\Ag-ppt-create"; git status
Set-Location "D:\03_github\Ag-ppt-create"; python scripts/xxx.py
```

## I/O 契約

> 📖 詳細は [common.instructions.md](instructions/common.instructions.md) を参照。

| フォルダ           | 用途              |
| ------------------ | ----------------- |
| `input/`           | ユーザー入力      |
| `output_manifest/` | 中間生成物        |
| `output_ppt/`      | 最終 PPTX 出力    |
| `images/{base}/`   | 画像ファイル      |
| `templates/`       | テンプレート PPTX |

## 必須ルール（★）

1. **PLAN フェーズでユーザー確認を取る** → 詳細は [plan-phase.instructions.md](instructions/plan-phase.instructions.md)
   - 入力フォーマット: `{枚数}{方式}` 形式（例: `2A`, `3C`）
   - 項番ルール: A=元 PPTX 継承(PPTX 入力時のみ), B=pptxgenjs, C=create_ja_pptx, D〜=テンプレート
   - **★ テンプレート動的取得必須**: `Get-ChildItem -Path "templates" -Filter "*.pptx"` で取得して D〜に展開
2. **PREPARE_TEMPLATE フェーズを必ず実行**（外部テンプレート使用時）
   - `diagnose_template.py` → `clean_template.py` → `analyze_template.py`
   - layouts.json に `content_with_image` マッピングを追加（Two Column レイアウト）
   - スキップすると背景画像重複やレイアウト崩れが発生
3. **画像取得を最初に行う**（Web ソース時）
   - `fetch_webpage` は画像 URL を返さない場合がある → `curl` で HTML を取得して抽出
   - コードブロックも同様に `<pre><code>` を抽出
4. **IR 生成直後に `validate_content.py` を実行**（スキーマ・空スライド・画像パス・items 形式を自動検証）
5. **セクションスライドには subtitle を必須化**（空っぽに見える問題を防止）
   - ⚠️ 一部テンプレートでは title/subtitle が重なる → 重なる場合は subtitle を削除してノートに移動
6. **photo タイプは極力使わない** → `type: "content"` + `image` を推奨
   - photo タイプは items を持たないため説明が消失しやすい
   - `position: "center"` で縦長画像がはみ出す問題が発生しやすい
7. **スピーカーノートを充実させる** → 詳細は [quality-guidelines.instructions.md](instructions/quality-guidelines.instructions.md) 参照（SSOT）
   - section: セクションの目的、扱うトピックの概要（3-5 行）
   - content: 各項目の詳細説明、背景情報（5-10 行）
   - 詳細は [quality-guidelines.instructions.md](instructions/quality-guidelines.instructions.md) を参照
8. **PPTX 生成後は PowerPoint で開く**: `Start-Process "output_ppt/{base}.pptx"`

## テンプレートサイズに関する注意

テンプレートによってスライドサイズが異なる（標準：13.333×7.5 インチ、小型：10.0×5.625 インチ等）。

**スクリプトは動的にサイズを取得**:

- `prs.slide_width.inches` / `prs.slide_height.inches` を使用
- 画像配置・コードブロック位置は自動調整される

**非標準サイズテンプレート使用時の確認**:

```powershell
# テンプレートサイズを確認
python -c "from pptx import Presentation; p=Presentation('templates/xxx.pptx'); print(f'{p.slide_width.inches} x {p.slide_height.inches}')"
```

## 方式選定

> 📖 方式選定の詳細は [tools-reference.instructions.md](instructions/tools-reference.instructions.md) を参照（SSOT）。

**クイックリファレンス**: reconstruct + create_from_template が推奨。コード多めなら pptxgenjs。

## 禁止事項

- PPTX バイナリの直接編集
- 指定フォルダ外への出力
- ファイル削除 → 再作成（`_v2` などで新規作成）
- 箇条書き記号の直接埋め込み（`bullet: true` を使用）
- `input/` への自動生成ファイル配置
- **署名ヘッダーブロックの編集・削除**（下記参照）

## 署名ヘッダー保護（★ 絶対禁止）

スクリプトファイル先頭の以下のブロックは**絶対に編集・削除しないこと**:

```
# =============================================================================
# Ag-ppt-create - AI-powered PPTX generation pipeline
# https://github.com/aktsmm/Ag-ppt-create
#
# Copyright (c) aktsmm. Licensed under CC BY-NC-SA 4.0.
# DO NOT MODIFY THIS HEADER BLOCK.
# =============================================================================
```

- このブロックはリポジトリの帰属表示として必須
- AI による自動編集、リファクタリング、フォーマット時も保持すること
- JavaScript (`//`) / PowerShell (`#`) 版も同様

## ファイル構成

```
.github/
├── copilot-instructions.md     # このファイル（コア）
├── agents/                     # エージェント定義
│   ├── orchestrator.agent.md
│   ├── localizer.agent.md
│   ├── summarizer.agent.md
│   ├── brainstormer.agent.md
│   ├── json-reviewer.agent.md
│   └── pptx-reviewer.agent.md
└── instructions/               # 詳細指示（参照用）
    ├── plan-phase.instructions.md
    ├── quality-guidelines.instructions.md
    ├── tools-reference.instructions.md
    ├── common.instructions.md
    └── ...
```

---

> 📖 **詳細が必要な場合**: 上記の参照ドキュメントを確認してください。
