# 作成方法 - GitHub Copilot を使った PPTX 自動生成ツールキットの構築

このドキュメントでは、GitHub Copilot（Claude）との対話を通じて、このリポジトリをゼロから構築した手順を紹介します。

## 概要

**python-pptx** と **PptxGenJS** の公式ドキュメントのみを参考に、AI エージェントとの対話で PPTX 自動生成ツールキットを構築しました。

```
1. プロジェクト構造の設計
2. スクリプトの独自実装
3. 依存関係のセットアップ
4. 動作検証
5. 実際のユースケースで検証
6. 公開準備
```

---

## Step 1: プロジェクト構造の設計

### 指示例

```
READMEにこのレポジトリの目的を書いていきます
PPTX 自動生成プロジェクト、python-pptx と pptxgenjs を使用
```

### 結果

- `README.MD` - プロジェクト概要
- `AGENTS.md` - AI エージェント定義
- `.github/copilot-instructions.md` - Copilot 共通ルール
- `.github/agents/orchestrator.agent.md` - オーケストレーターエージェント定義

**ポイント**: 最初にドキュメント構造を決めることで、AI が一貫したコードを生成しやすくなります。

---

## Step 2: スクリプトの独自実装

### 指示例

```
python-pptx の公式ドキュメントを参考に、スライド操作スクリプトを作成して
```

### 実装されたスクリプト

以下のスクリプトを **公式ドキュメントのみ** を参考に独自実装しました：

| スクリプト                | 参考資料                          | 機能                              |
| ------------------------- | --------------------------------- | --------------------------------- |
| `create_from_template.py` | python-pptx 公式ドキュメント      | テンプレート →PPTX 生成（★ 推奨） |
| `reconstruct_analyzer.py` | python-pptx 公式ドキュメント      | 英語版 PPTX→content.json          |
| `create_ja_pptx.py`       | python-pptx 公式ドキュメント      | 新規 PPTX 生成                    |
| `create_pptx.js`          | PptxGenJS 公式ドキュメント        | JS で PPTX 生成                   |
| `reorder_slides.py`       | python-pptx 公式ドキュメント      | スライド並び替え・複製            |
| `extract_shapes.py`       | python-pptx 公式ドキュメント      | テキスト抽出（preserve 方式用）   |
| `apply_content.py`        | python-pptx 公式ドキュメント      | テキスト置換（preserve 方式用）   |
| `gen_preview.py`          | python-pptx + Pillow ドキュメント | サムネイル生成                    |

> 💡 **現在の推奨方式**: `reconstruct_analyzer.py` → `create_from_template.py` のフローです。`extract_shapes.py` / `apply_content.py` は preserve 方式（実験的）用です。

### 結果

```
scripts/
├── create_from_template.py # テンプレート→PPTX生成（★ 推奨）
├── reconstruct_analyzer.py # 英語版PPTX→content.json
├── analyze_template.py     # テンプレートレイアウト分析
├── validate_content.py     # content.json検証
├── create_ja_pptx.py       # 新規PPTX生成
├── create_pptx.js          # pptxgenjsでPPTX生成
├── extract_shapes.py       # テキスト抽出（preserve方式用）
├── apply_content.py        # テキスト置換（preserve方式用）
├── reorder_slides.py       # スライド並び替え
└── gen_preview.py          # サムネイル生成
```

---

## Step 3: 依存関係のセットアップ

### 使用ライブラリ

| 種類   | パッケージ  | 用途              |
| ------ | ----------- | ----------------- |
| Python | python-pptx | PPTX 操作         |
| Python | Pillow      | 画像処理          |
| Node   | pptxgenjs   | PPTX 生成         |
| Node   | playwright  | HTML レンダリング |
| Node   | sharp       | 画像処理          |

### 指示例

```
requirements.txt と package.json を作成して依存関係をインストール
```

### 実行された作業

1. `requirements.txt` 作成（python-pptx, Pillow 等）
2. `package.json` 作成（pptxgenjs, playwright, sharp）
3. `pip install -r requirements.txt`
4. `npm install`
5. `npx playwright install chromium`

---

## Step 4: 環境の分離

### 指示例

```
venvでローカルに環境作って
環境がかわるのあんまよくないなーって思ってる
```

### 実行された作業

1. `.venv/` に Python 仮想環境を作成
2. `.gitignore` に `.venv/` を追加
3. 以降のコマンドは `.venv\Scripts\python.exe` を使用

**ポイント**: グローバル環境を汚さないよう、早めに仮想環境を構築。

---

## Step 5: 動作検証（HTML→PPTX）

### 指示例

```
convert_html.js の動作確認をしたい
サンプル HTML を作って変換してみて
```

### 実行された作業

1. `workspace/slides/slide1.html` を作成
2. `node scripts/convert_html_cli.js` で変換
3. エラー発生 → CSS の `gradient` が未対応と判明
4. 背景を単色に修正して再変換 → 成功

**学び**: convert_html は CSS のサポートが限定的。シンプルな HTML を心がける。

---

## Step 6: 動作検証（テンプレート方式）

### 指示例

```
templates/ にある sample-ppf.pptx を使って
content.json から PPTX 生成の流れを検証して
```

### 実行された作業

1. `python scripts/analyze_template.py` でテンプレートレイアウトを分析
2. `workspace/content.example.json` を作成（AI が自動生成）
3. `python scripts/create_from_template.py` で PPTX 生成
4. 成功

**実装のポイント**:

- python-pptx の公式ドキュメントを参考に独自実装
- content.json はスキーマ (`workspace/content.schema.json`) で検証
- テンプレートのレイアウトを自動認識して最適なスライド構成を選択

---

## Step 7: 実際のユースケースで検証

### 指示例

```
https://zenn.dev/... の記事を PowerPoint にして
```

### 実行された作業

1. 記事の内容を取得・解析
2. スライド構成を設計
3. 最初は HTML スライドで試行 → バリデーションエラー多発
4. 方針転換：`pptxgenjs` を直接使用するスクリプトを作成
5. 実行 → PPTX 完成

**学び**: 複雑なレイアウトは HTML 経由より、pptxgenjs を直接使う方が確実。

---

## Step 8: 公開準備

### 指示例

```
これ github で公開しようと思うんだけど不要なファイルは消してほしいな
```

### 実行された作業

1. 生成されたサンプルファイルを削除
   - `workspace/` 内の出力ファイル
   - `workspace/slides/` 内のテスト HTML
   - 特定記事用のスクリプト
2. ユーザー固有のテンプレートを削除
3. `.gitignore` を更新
4. `workspace/slides/.gitkeep` を追加

### 最終的な .gitignore

```gitignore
.venv/
node_modules/
__pycache__/
workspace/*.pptx
workspace/*.json
workspace/slides/*
!workspace/slides/.gitkeep
!workspace/replacements.example.json
templates/*.pptx
!templates/sample.pptx
```

---

## Step 9: ドキュメント整備

### 指示例

```
READMEにセットアップ手順へのリンクをつくって
あらたにセットアップ手順のMarkdownをつくって
```

### 結果

- `docs/SETUP.md` - 詳細なセットアップ手順
- `README.MD` にリンク追加

---

## 使用した主な Copilot 指示パターン

| パターン       | 例                                                   |
| -------------- | ---------------------------------------------------- |
| **実装依頼**   | 「python-pptx でスライド並び替え機能を作って」       |
| **検証依頼**   | 「〇〇の動作確認をしたい」「サンプルを作って試して」 |
| **エラー対応** | （エラーメッセージを貼り付けるだけで自動修正）       |
| **変換依頼**   | 「この URL の内容を PowerPoint にして」              |
| **整理依頼**   | 「不要なファイルは消して」「README を整理して」      |

---

## Tips

1. **段階的に指示する**: 一度に全部頼むより、ステップごとに確認しながら進める
2. **エラーはそのまま貼る**: Copilot が自動で原因を特定して修正案を出す
3. **具体的なファイル名を指定**: 「scripts/ に」「workspace/ に」など場所を明示
4. **検証を依頼する**: 「動作確認して」と言えば実際にコマンドを実行してくれる
5. **方針転換も柔軟に**: うまくいかなければ別のアプローチを提案してくれる
6. **公式ドキュメントを参照**: ライセンス問題を避けるため、常に公式ドキュメントを参考に実装

---

## 所要時間

| フェーズ               | 時間            |
| ---------------------- | --------------- |
| 構造設計・README       | 15 分           |
| スクリプト独自実装     | 45 分           |
| 依存関係セットアップ   | 15 分           |
| 動作検証・デバッグ     | 30 分           |
| 実ユースケース検証     | 20 分           |
| 公開準備・ドキュメント | 15 分           |
| **合計**               | **約 2.5 時間** |

---

## python-pptx 使用時の注意点

開発中に遭遇した python-pptx 固有の問題と対策：

| 問題                                     | 原因                                                 | 対策                                             |
| ---------------------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| プレースホルダー位置調整でサイズが消える | `top` のみ設定すると XML に `<a:ext>` が出力されない | 調整前に `width`/`height` を保存し、調整後に復元 |
| viewProps.xml の継承                     | テンプレートの表示設定がそのままコピーされる         | 必要に応じて手動で正規化                         |
| 空プレースホルダーの残留                 | 画像追加後も空の Picture Placeholder が残る          | 明示的に削除処理を追加                           |

詳細は [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) の #21, #48 等を参照してください。

---

## 参考ドキュメント

すべてのスクリプトは以下の公式ドキュメントのみを参考に実装しています：

- [python-pptx Documentation](https://python-pptx.readthedocs.io/)
- [PptxGenJS Documentation](https://gitbrent.github.io/PptxGenJS/)
- [Playwright Documentation](https://playwright.dev/)
- [Pillow Documentation](https://pillow.readthedocs.io/)

---

## 関連リンク

- [README.md](../README.MD) - プロジェクト概要
- [SETUP.md](./SETUP.md) - セットアップ手順
- [AGENTS.md](../AGENTS.md) - エージェント定義
