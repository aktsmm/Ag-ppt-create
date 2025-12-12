# AGENTS

PPTX 自動生成エージェント定義（再設計版）。

## エージェント一覧と責務

| エージェント      | マニフェスト                           | 役割                                                        |
| ----------------- | -------------------------------------- | ----------------------------------------------------------- |
| Router            | `.github/agents/router.agent.md`       | 入力分類・方式判定（純粋関数、I/O スキーマ出力）            |
| Orchestrator      | `.github/agents/orchestrator.agent.md` | 状態管理・計画・再実行/リトライ制御                         |
| Template Analyzer | `.github/agents/template.agent.md`     | working.pptx 作成と inventory 生成、レイアウト分析          |
| Content Writer    | `.github/agents/content.agent.md`      | content.json(IR)生成、画像取得（HTML/pptxgenjs は特殊用途） |
| Localizer         | `.github/agents/localizer.agent.md`    | ANALYZE/CONSOLIDATE/TRANSLATE（本文のみ）                   |
| Notes Translator  | `.github/agents/notes.agent.md`        | スピーカーノート翻訳                                        |
| Validator         | `.github/agents/validator.agent.md`    | スキーマ/バレット/オーバーフロー/コントラスト検証           |
| Builder           | `.github/agents/builder.agent.md`      | apply_content/translate_notes 実行と出力生成                |
| QA Agent          | `.github/agents/qa.agent.md`           | 最終視覚チェックと記録                                      |

## 共通 I/O 契約

- base: `{YYYYMMDD}_{keyword}_{purpose}`
- 入力: `context.json`
- 中間: `output_manifest/{base}_working.pptx`, `{base}_inventory.json`, `{base}_analysis.json`, `{base}_slides_to_keep.json`, `{base}_replacements.json`, `{base}_notes.json`, `{base}_notes_ja.json`
- レイアウト設定: `templates/{template}_layouts.json`
- 最終: `output_ppt/{base}.pptx`
- すべて UTF-8、JSON は schema バリデート必須。

## 標準フロー

```
INIT → ROUTE → PLAN(確認) → FETCH_IMAGES → INVENTORY → ANALYZE → CONSOLIDATE → TRANSLATE → NOTES → VALIDATE → BUILD → QA → DONE
                   ↑                                                              │
                   │              └───────────(FAIL→修正・再検証 最大3回)
                   │
              ユーザー承認必須
```

- **PLAN(確認)**: ユーザーに方式・枚数・詳しさの選択肢を提示し、承認を得てから次へ進む（★ 必須）
  - **デフォルト**: ユーザーが「お任せ」または未指定の場合は **B + D パターンを同時生成**
    - B: `create_from_template` + 詳細版
    - D: `pptxgenjs` + 詳細版
- **FETCH_IMAGES**: Web ソースの場合、Content Writer が画像を `images/{base}/` に取得
- FAIL 時は直前チェックポイントから再開。3 回失敗で Orchestrator が停止し要介入を記録。

## 詳細フロー（pptx_en → 日本語）

1. Router: input_type 判定、base 生成、context JSON 出力
2. **Orchestrator: ユーザーにモード/目標枚数の選択肢を提示し承認を得る**
3. Template Analyzer: working.pptx と inventory JSON 作成
4. Localizer ANALYZE: shapes 抽出・分類・狭小/除外マーク
5. Localizer CONSOLIDATE: 類似スライド統合案 → slides_to_keep JSON
6. Localizer TRANSLATE: replacements JSON 生成（80% 文字数、bullet 付与）
7. Notes Translator: notes_ja JSON 生成（必要時のみ）
8. Validator: schema/overflow/contrast/bullet/slide_filter 検証
9. Builder: apply_content + translate_notes → output_ppt
10. QA Agent: APPROVE/REJECT + コメント記録

## 詳細フロー（Web/Blog → 新規 PPTX）★ 推奨

1. Router: input_type=`blog`/`url` 判定、base 生成、context JSON 出力
2. **Orchestrator: ユーザーに方式/枚数/詳しさの選択肢を提示し承認を得る**
   - **「お任せ」や未指定の場合は B + D パターンを同時生成**
3. **Content Writer FETCH_IMAGES**: Web ページから画像 URL を抽出し `images/{base}/` にダウンロード
4. **Content Writer CONTENT**: content.json 生成（`image` フィールドで画像を適切なスライドに配置）
5. Validator: schema/画像パス存在/オーバーフロー検証
6. Builder: `create_from_template.py` で PPTX 生成
7. QA Agent: APPROVE/REJECT + コメント記録

### 画像取得の標準手順

```powershell
$base = "20251212_example_blog"

# 1. 画像保存ディレクトリ作成
New-Item -ItemType Directory -Path "images/${base}" -Force

# 2. Web ページから画像 URL を抽出
$html = Invoke-WebRequest -Uri $url -UseBasicParsing
$imageUrls = $html.Images | Select-Object -ExpandProperty src | Where-Object { $_ -match "content-image" }

# 3. 主要な画像をダウンロード（連番命名）
$i = 1
foreach ($imgUrl in $imageUrls) {
    $outPath = "images/${base}/$('{0:D2}' -f $i)_image.png"
    Invoke-WebRequest -Uri $imgUrl -OutFile $outPath -UseBasicParsing
    $i++
}

# 4. content.json で image.path を指定して配置
```

## 方式選定

| 用途                 | 推奨方式                                          | 推奨度     | 備考                 |
| -------------------- | ------------------------------------------------- | ---------- | -------------------- |
| **テンプレート利用** | `analyze_template.py` + `create_from_template.py` | ⭐⭐⭐⭐⭐ | 最推奨、デザイン継承 |
| 白紙から新規作成     | `create_ja_pptx.py`                               | ⭐⭐⭐⭐   | シンプルできれい     |
| コード/技術内容多    | カスタム JS (pptxgenjs)                           | ⭐⭐⭐⭐   | コードブロック向け   |
| HTML ベース          | `convert_html_multi.js`                           | ⭐⭐       | 非推奨（IR 迂回）    |

### 廃止された方式

| 方式                     | 状態   | 理由                                                           |
| ------------------------ | ------ | -------------------------------------------------------------- |
| preserve                 | 非推奨 | 英語版 PPTX 日本語化で使用。図・グラフで崩れやすい（改善予定） |
| テンプレートベース（旧） | 統合   | `create_from_template.py` に統合                               |

### テンプレート新規生成フロー（最推奨）

```
templates/{template}.pptx
    ↓
analyze_template.py (初回のみ)
    ↓
templates/{template}_layouts.json
    ↓
create_from_template.py --config
    ↓
output_ppt/{base}.pptx
```

## 運用ルール

- `.github/copilot-instructions.md` と `.github/instructions/*.md` に従う
- すべてのツール呼び出しは I/O スキーマ整合性を確認してから実行
- テンプレート/PPTX の直接編集は禁止
- **新規テンプレート使用時は `analyze_template.py` でレイアウト設定を生成**
