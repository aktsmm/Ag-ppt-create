# TROUBLESHOOTING

過去に発生した問題と対策の記録。スクリプト改修により自動対処されているものが多い。

> 📅 最終更新: 2025-12-17（#49, #50 追加: pptxgenjs スライドサイズ問題、図形スライド挿入位置問題）

---

## 目次

1. [スピーカーノートが消える](#1-スピーカーノートが消える問題)
2. [タイトルが空のスライド](#2-タイトルが空のスライドが多い問題)
3. [画像が見つからない](#3-画像が見つからない問題)
4. [GitHub Models API レート制限](#4-github-models-api-レート制限)
5. [中間ファイルが input/ に保存される](#5-中間ファイルが-input-に保存される問題)
6. [空スライドが生成される（two_column）](#6-空スライドが生成される問題two_column)
7. [画像が異常に大きく表示される](#7-画像が異常に大きく表示される問題)
8. [アイコン/ロゴが本文画像として使われる](#8-アイコンロゴが本文画像として使われる問題)
9. [position: "center" が無視される](#9-position-center-が無視される問題)
10. [翻訳後に元スライドの参照が不明](#10-翻訳後に元スライドの参照が不明になる問題)
11. [items にオブジェクト配列を使用してスキーマエラー](#11-items-にオブジェクト配列を使用してスキーマエラー)
12. [PLAN フェーズで選択肢が指定しづらい](#12-planフェーズで選択肢が指定しづらい問題)
13. [まとめスライドがあるのに警告が出る](#13-まとめスライドがあるのに警告が出る問題)
14. [背景画像がスクリーンショットに重なる](#14-背景画像がスクリーンショットに重なる問題)
15. [「この画像は表示できません」エラー](#15-この画像は表示できませんエラー)
16. [pptxgenjs でスピーカーノートが設定されない](#16-pptxgenjs-でスピーカーノートが設定されない問題)
17. [photo スライドが見にくい（タイトルと画像が離れている）](#17-photo-スライドが見にくい問題)
18. [PPTX がスライドマスター表示で開く](#18-pptx-がスライドマスター表示で開く問題)
19. [two_column タイプで左右の内容が表示されない](#19-two_column-タイプで左右の内容が表示されない問題)
20. [未使用プレースホルダーで余白が大きくなる](#20-未使用プレースホルダーで余白が大きくなる問題)
21. [画像がスライド右端にはみ出す](#21-画像がスライド右端にはみ出す問題)
22. [コードブロックがスライド下部にはみ出す](#22-コードブロックがスライド下部にはみ出す問題)
23. [fetch_webpage で画像 URL が取得できない](#23-fetch_webpage-で画像-url-が取得できない問題)
24. [content.json の code フィールドが反映されない](#24-contentjson-の-code-フィールドが反映されない問題)
25. [セクションスライドが空っぽに見える](#25-セクションスライドが空っぽに見える問題)
26. [セクションスライドで title と subtitle が重なる](#26-セクションスライドで-title-と-subtitle-が重なる問題)
27. [photo スライドで画像がスライド下部にはみ出す](#27-photo-スライドで画像がスライド下部にはみ出す問題)
28. [Summarizer による圧縮時の photo スライド乱用](#28-summarizer-による圧縮時の-photo-スライド乱用問題)
29. [content + image スライドで画像がテキストと重なる](#29-content--image-スライドで画像がテキストと重なる問題)
30. [テンプレート背景画像が新規スライドに継承される](#30-テンプレート背景画像が新規スライドに継承される問題)
31. [PREPARE_TEMPLATE フェーズがスキップされる](#31-prepare_template-フェーズがスキップされる問題)
32. [セクションスライドでタイトルが途中で改行される](#32-セクションスライドでタイトルが途中で改行される問題)
33. [スピーカーノートが「出典」だけで薄い](#33-スピーカーノートが出典だけで薄い問題)
34. [Two Column レイアウトで空のプレースホルダーが残る](#34-two-column-レイアウトで空のプレースホルダーが残る問題)
35. [セクションスライドのタイトルがスライド外に表示される](#35-セクションスライドのタイトルがスライド外に表示される問題)
36. [セクションスライドのサブタイトルが小さすぎる](#36-セクションスライドのサブタイトルが小さすぎる問題)
37. [セクションスライドのタイトル/サブタイトルが離れすぎ](#37-セクションスライドのタイトルサブタイトルが離れすぎ問題)
38. [テンプレート選択時のコントラスト問題](#38-テンプレート選択時のコントラスト問題暗い背景レイアウト)
39. [タイトルスライドでタイトルが折り返される](#39-タイトルスライドでタイトルが折り返される問題)
40. [テンプレートレイアウトにプレースホルダーがない](#40-テンプレートレイアウトにプレースホルダーがない問題)
41. [スライド外 TextBox による縦文字表示](#41-スライド外textboxによる縦文字表示問題)
42. [日本語テキストの文字間隔が不自然に広がる](#42-日本語テキストの文字間隔が不自然に広がる問題)
43. [セクションスライドの位置調整が効かない](#43-セクションスライドのタイトルサブタイトル位置調整が効かない問題)
44. [タイトルスライドの人物写真が大きすぎる](#44-タイトルスライドの人物写真が大きすぎる問題)
45. [pptxgenjs でアイコン/画像のアスペクト比が崩れる](#45-pptxgenjs-でアイコン画像のアスペクト比が崩れる問題)
46. [暗い背景でテキストが黒のまま表示される](#46-暗い背景でテキストが黒のまま表示される問題)
47. [アイコン/ロゴが大きく表示される（B/C 方式）](#47-アイコンロゴが大きく表示される問題bc-方式)
48. [サブタイトルが縦に 1 文字ずつ表示される](#48-サブタイトルが縦に1文字ずつ表示される問題)
49. [pptxgenjs でスライド右端・下端にはみ出す](#49-pptxgenjs-でスライド右端下端にはみ出す問題)
50. [merge_slides.py で図形スライドが末尾に追加される](#50-merge_slidespy-で図形スライドが末尾に追加される問題)

---

## 1. スピーカーノートが消える問題

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| **原因** | `create_from_template.py` で notes を設定していなかった  |
| **対策** | PPTX 生成時に notes フィールドを自動設定するよう修正済み |
| **確認** | 生成後に PowerPoint でノートを表示して確認               |
| **状態** | ✅ 修正済み（スクリプト対応）                            |

---

## 2. タイトルが空のスライドが多い問題

| 項目     | 内容                                                            |
| -------- | --------------------------------------------------------------- |
| **原因** | デモ/スクリーンショット用スライドはタイトルプレースホルダーが空 |
| **対策** | `reconstruct_analyzer.py` でスピーカーノートからタイトルを推測  |
| **確認** | content.json 生成時に "Inferred title" ログが出力される         |
| **状態** | ✅ 修正済み（スクリプト対応）                                   |

---

## 3. 画像が見つからない問題

| 項目     | 内容                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| **原因** | 元 PPTX の画像が抽出されていない、または拡張子が異なる                                           |
| **対策** | `extract_images.py` で事前に画像を抽出 / `create_from_template.py` で .png/.jpg/.jpeg を自動検索 |
| **確認** | PPTX 生成ログで 📷 マークと "[!] Image not found" を確認                                         |
| **状態** | ✅ 修正済み（スクリプト対応）                                                                    |

---

## 4. GitHub Models API レート制限

| 項目     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| **原因** | 日次 150 リクエスト制限に達する                              |
| **対策** | Localizer エージェントに委託（翻訳は AI エージェントが担当） |
| **確認** | 70 枚以上の PPTX は Localizer エージェント委託推奨           |
| **状態** | ✅ 運用で回避                                                |

---

## 5. 中間ファイルが input/ に保存される問題

| 項目     | 内容                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| **原因** | ワークフロー定義が曖昧だった                                                  |
| **対策** | `input/` はユーザー入力専用 / `output_manifest/` にすべての中間ファイルを保存 |
| **確認** | `input/` に自動生成ファイルがないこと                                         |
| **状態** | ✅ ドキュメント明確化済み                                                     |

---

## 6. 空スライドが生成される問題（two_column）

| 項目     | 内容                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| **原因** | content.json で `two_column` タイプに `left_items`/`right_items` を使用したが、スクリプトは `items` のみ対応していた |
| **対策** | `create_from_template.py` で `left_items` + `right_items` を自動マージして `items` に統合 / 空スライドを検出して警告 |
| **確認** | PPTX 生成ログで "Merged left_items + right_items" が出力される                                                       |
| **状態** | ✅ 修正済み（スクリプト対応）                                                                                        |

---

## 7. 画像が異常に大きく表示される問題

| 項目     | 内容                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **原因** | 小さい元画像（アイコン、ロゴ等）に対して `width_percent: 60` 等を指定すると過度に拡大される                                      |
| **対策** | `create_from_template.py` に PIL ベースの画像サイズ検出を追加 / `calculate_max_width_percent()` で自然サイズの 150% を上限に制限 |
| **確認** | PPTX 生成ログで "(capped from X% to Y%)" が出力される                                                                            |
| **状態** | ✅ 修正済み（スクリプト対応）                                                                                                    |

---

## 8. アイコン/ロゴが本文画像として使われる問題

| 項目     | 内容                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **原因** | スライドから最大の画像を抽出する際、アイコン/ロゴが選ばれてしまう                                                                   |
| **対策** | `extract_images.py` でアイコン/ロゴを検出してマーク（🔹icon/logo） / `create_from_template.py` で適切な小さいサイズ（15-25%）で配置 |
| **確認** | 抽出/生成ログで "icon/logo detected" が出力される                                                                                   |
| **状態** | ✅ 修正済み（スクリプト対応）                                                                                                       |

---

## 9. position: "center" が無視される問題

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| **原因** | `add_image_to_slide()` が `center` ポジションをサポートしていなかった    |
| **対策** | `create_from_template.py` で `center` を `full` と同様に処理（中央配置） |
| **確認** | 画像が中央に表示されることを視覚確認                                     |
| **状態** | ✅ 修正済み（スクリプト対応）                                            |

---

## 10. 翻訳後に元スライドの参照が不明になる問題

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ | ------------------ |
| **原因** | 要約/統合時に元のスライド番号や視覚要素の位置が分からなくなる            |
| **対策** | Localizer エージェントが翻訳時にスピーカーノートに元スライド情報を追加   |
| **確認** | 翻訳後の notes に元スライド参照が含まれる（フォーマット: `元スライド: #N | レイアウト: xxx`） |
| **状態** | ✅ 修正済み（スクリプト対応）                                            |

---

## 11. items にオブジェクト配列を使用してスキーマエラー

| 項目     | 内容                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **原因** | `items` にオブジェクト形式 `{"text": "...", "bullet": true}` を使用したが、`content.schema.json` は文字列配列のみ許容                       |
| **背景** | `replacements.json`（preserve 方式）と `content.json`（reconstruct 方式）で異なるスキーマが存在。ドキュメント間で形式が統一されていなかった |
| **対策** | `common.instructions.md` に「IR スキーマの使い分け」セクションを追加 / `validate_content.py` に `validate_items_format()` を追加            |
| **確認** | `validate_content.py` を IR 生成直後に実行して早期検出                                                                                      |
| **状態** | ✅ 修正済み（スクリプト + ドキュメント対応）                                                                                                |

### 正しい形式

```json
// ✅ OK: content.json の items（string[]）
"items": ["項目1", "項目2", "項目3"]

// ❌ NG: スキーマエラー
"items": [{"text": "項目1", "bullet": true}]
```

> 📖 詳細: [common.instructions.md の「IR スキーマの使い分け」](../.github/instructions/common.instructions.md)

---

## 12. PLAN フェーズで選択肢が指定しづらい問題

| 項目     | 内容                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| **原因** | テンプレートに A, B を割り当て、その他方式に `-` を使用していた               |
| **症状** | 「pptxgenjs を選びたい」時に「2C」のように簡潔に指定できなかった              |
| **対策** | 全方式に連続したアルファベットを割り当てるルールを明文化                      |
| **確認** | テンプレート 2 個 → A, B がテンプレート、C=pptxgenjs, D=create_ja_pptx        |
| **状態** | ✅ 修正済み（plan-phase.instructions.md, AGENTS.md, copilot-instructions.md） |

**修正内容:**

- `plan-phase.instructions.md` に項番ルールを追加
- 入力フォーマット: `{枚数}{方式}` 形式（例: `2A`, `3C`）

---

## 13. まとめスライドがあるのに警告が出る問題

| 項目     | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| **原因** | `validate_content.py` が `type: "summary"` のみをチェックしていた               |
| **症状** | `type: "content"` + `title: "まとめ"` のスライドを検出できず警告が出た          |
| **対策** | まとめ系キーワード（まとめ/summary/結論/conclusion/おわりに）を検出するよう改善 |
| **確認** | `validate_content.py` を実行し、警告が出ないことを確認                          |
| **状態** | ✅ 修正済み（スクリプト対応）                                                   |

---

## 14. 背景画像がスクリーンショットに重なる問題

| 項目     | 内容                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------- |
| **原因** | 英語版 PPTX のスライドマスターに装飾用背景画像（山の風景、ブランドグラフィック等）が埋め込まれていた |
| **症状** | 生成したスライドにスクリーンショットと背景画像が重なって表示される                                   |
| **背景** | Microsoft Ignite 等のイベント用テンプレートには多数のマスターと装飾画像が含まれる                    |
| **対策** | `clean_template.py` でマスター内の PICTURE シェイプを自動削除                                        |
| **確認** | `diagnose_template.py` で事前診断、問題があれば自動クリーニング                                      |
| **状態** | ✅ 修正済み（新規スクリプト追加 + PREPARE_TEMPLATE フェーズ導入）                                    |

### 診断・修正手順

```powershell
# 1. テンプレート診断
python scripts/diagnose_template.py "input/template.pptx"

# 2. 問題があればクリーニング
python scripts/clean_template.py "input/template.pptx" "output_manifest/{base}_clean_template.pptx"

# 3. クリーンテンプレートでPPTX生成
python scripts/create_from_template.py "output_manifest/{base}_clean_template.pptx" ...
```

---

## 15.「この画像は表示できません」エラー

| 項目     | 内容                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| **原因** | Picture Placeholder にデフォルト画像の blip 参照が埋め込まれていた / 画像追加後に空のプレースホルダーが残った |
| **症状** | スライドに「この画像は表示できません」というプレースホルダーが表示される                                      |
| **背景** | レイアウト内の Picture Placeholder には blip 要素でサンプル画像が埋め込まれていることがある                   |
| **対策** | `create_from_template.py` に `remove_empty_picture_placeholders()` 関数を追加し、画像追加後に自動削除         |
| **確認** | PPTX 生成ログで "[i] Removed N empty picture placeholder(s)" が出力される                                     |
| **状態** | ✅ 修正済み（スクリプト対応）                                                                                 |

### 技術詳細

```python
# 空のPicture Placeholderを検出・削除
def remove_empty_picture_placeholders(slide):
    for shape in slide.shapes:
        if shape.is_placeholder:
            ph_type = str(shape.placeholder_format.type)
            if 'PICTURE' in ph_type:
                # blip参照がなければ空 → 削除
                xml = etree.tostring(shape._element, encoding='unicode')
                if 'blip' not in xml or 'r:embed' not in xml:
                    shape._element.getparent().remove(shape._element)
```

---

## 16. pptxgenjs でスピーカーノートが設定されない問題

| 項目     | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| **原因** | `create_pptx.js` で `addSignature()` のみでノートを追加し、メインループで未設定 |
| **症状** | 最初と最後のスライドのみノートがあり、中間スライドのノートが空                  |
| **対策** | メインのスライド作成ループ内で `slide.addNotes(slideData.notes)` を追加         |
| **確認** | 生成後に PowerPoint でノートペインを確認                                        |
| **状態** | ✅ 修正済み（create_pptx.js 修正）                                              |

### 修正コード

```javascript
// create_pptx.js のスライド作成ループ内
if (slideData.notes) {
  slide.addNotes(slideData.notes);
}
```

---

## 17. photo スライドが見にくい問題

| 項目       | 内容                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| **原因**   | photo タイプが Layout 15 (Title - Square Photo) を使用し、タイトル左・画像右の固定配置になる |
| **症状**   | タイトルと画像が離れすぎて余白が大きい / スクリーンショットが小さくて見にくい                |
| **背景**   | `position: center` を指定してもレイアウト構造が優先される                                    |
| **対策 1** | photo タイプに Layout 12 (Title Only) を使用し、画像を大きく中央配置                         |
| **対策 2** | photo タイプを content に変換し、ノートから抽出した説明文を箇条書きとして追加                |
| **確認**   | layouts.json の `photo` マッピングを 12 に変更 / content.json で items を追加                |
| **状態**   | ✅ 運用で対応（content.json 生成時に改善）                                                   |

### 推奨パターン

```json
// Before: 画像だけで何を見せているかわからない
{
  "type": "photo",
  "title": "DSPM ダッシュボード",
  "image": { "path": "images/slide_22.png", "position": "right", "width_percent": 45 }
}

// After: 説明文を追加してわかりやすく
{
  "type": "content",
  "title": "DSPM ダッシュボード",
  "items": [
    "データセキュリティの簡素化",
    "主要なポスチャメトリクス",
    "目標（Objectives）の設定"
  ],
  "image": { "path": "images/slide_22.png", "position": "right", "width_percent": 50 }
}
```

---

## 18. PPTX がスライドマスター表示で開く問題

| 項目       | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| **原因**   | テンプレート PPTX の `ppt/viewProps.xml` に `lastView="sldMasterView"` が設定されていた     |
| **症状**   | 生成した PPTX を PowerPoint で開くと、通常の編集画面ではなくスライドマスター表示で開く      |
| **背景**   | python-pptx はテンプレートの viewProps.xml をそのままコピーするため、メタデータが継承される |
| **対策 1** | `diagnose_template.py` で `check_view_props()` を追加し、事前検出可能に                     |
| **対策 2** | `create_from_template.py` で `_normalize_view_settings()` を追加し、保存後に自動修正        |
| **確認**   | 生成ログで "Normalized view settings" が表示されることを確認                                |
| **状態**   | ✅ 修正済み（スクリプト対応）                                                               |

### 技術詳細

PPTX 内部の `ppt/viewProps.xml` には以下のような設定が含まれる:

```xml
<!-- NG: スライドマスター表示で開く -->
<p:viewPr lastView="sldMasterView" xmlns:p="...">

<!-- OK: 通常のスライド表示で開く -->
<p:viewPr lastView="sldView" xmlns:p="...">
```

### 修正コード（create_from_template.py 内）

```python
def _normalize_view_settings(pptx_path: str) -> bool:
    """PPTX 保存後に viewProps.xml を修正して通常表示で開くようにする"""
    import zipfile
    import shutil

    temp_path = pptx_path + ".tmp"
    modified = False

    with zipfile.ZipFile(pptx_path, 'r') as zin:
        with zipfile.ZipFile(temp_path, 'w', zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)
                if item.filename == "ppt/viewProps.xml":
                    content = data.decode('utf-8')
                    if 'lastView="sldMasterView"' in content:
                        content = content.replace('lastView="sldMasterView"', 'lastView="sldView"')
                        data = content.encode('utf-8')
                        modified = True
                zout.writestr(item, data)

    if modified:
        shutil.move(temp_path, pptx_path)
        print("    [✓] Normalized view settings (sldMasterView → sldView)")
    else:
        os.remove(temp_path)

    return modified
```

### 診断コマンド

```powershell
# テンプレートの viewProps 設定を確認
python scripts/diagnose_template.py "templates/template.pptx"

# 生成済み PPTX を手動で確認
python -c "import zipfile; z=zipfile.ZipFile('output.pptx'); print(z.read('ppt/viewProps.xml').decode())"
```

---

## 19. two_column タイプで左右の内容が表示されない問題

| 項目     | 内容                                                                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **原因** | `create_ja_pptx.py` と `create_pptx.js` が `two_column` タイプを個別処理していなかった                                                                    |
| **症状** | `type: "two_column"` のスライドでタイトルのみ表示され、`left_items` / `right_items` の内容が空になる                                                      |
| **背景** | content.json では `two_column` タイプに `left_title`, `left_items`, `right_title`, `right_items` を使用するが、これらのフィールドを読み取る処理がなかった |
| **対策** | `create_ja_pptx.py` に `add_two_column_slide()` 関数を追加 / `create_pptx.js` に `addTwoColumnSlide()` 関数を追加                                         |
| **確認** | PPTX 生成後に 2 列レイアウトのスライドで左右の内容が表示されることを確認                                                                                  |
| **状態** | ✅ 修正済み（スクリプト対応）                                                                                                                             |

### content.json での正しい形式

```json
{
  "type": "two_column",
  "title": "2つのスタイル比較",
  "left_title": "Sentry",
  "left_items": ["約800行 / 26KB", "詳細・網羅的", "リファレンス型"],
  "right_title": "Temporal",
  "right_items": ["約100行", "シンプル・構造化", "指示型"],
  "notes": "SentryとTemporalで対照的なアプローチ。"
}
```

### 修正対象スクリプト

| スクリプト                | 追加関数                                                             |
| ------------------------- | -------------------------------------------------------------------- |
| `create_ja_pptx.py`       | `add_two_column_slide()`                                             |
| `create_pptx.js`          | `addTwoColumnSlide()`                                                |
| `create_from_template.py` | 既存対応済み（`left_items` + `right_items` を `items` に自動マージ） |

> 📝 **注意**: `create_from_template.py` は既存のテンプレートレイアウトを使用するため、`left_items` と `right_items` を自動的に `items` に統合して処理します。これは TROUBLESHOOTING #6 で対応済みです。

---

## クイックリファレンス: よくある問題と解決策

| 症状                                   | 原因                     | 解決策                                      |
| -------------------------------------- | ------------------------ | ------------------------------------------- |
| PPTX に画像がない                      | 画像未抽出               | `extract_images.py` を先に実行              |
| 空スライドがある                       | items がない             | `validate_content.py` で検証                |
| 画像がぼやける                         | 小画像を拡大             | `width_percent` を下げる（自動制限あり）    |
| スキーマエラー                         | items がオブジェクト配列 | `string[]` に変更                           |
| API レート制限                         | 大量翻訳                 | Localizer エージェントに委託                |
| ノートが消えた                         | 古いスクリプト           | 最新版に更新                                |
| 選択肢が指定しづらい                   | 項番が不連続             | A,B,C... で連続割当                         |
| まとめがあるのに警告                   | type 検出のみ            | タイトルキーワードも検出（修正済み）        |
| **背景画像が重なる**                   | マスター内装飾画像       | `clean_template.py` でクリーニング          |
| **画像表示できませんエラー**           | 空の Picture Placeholder | 自動削除機能追加済み                        |
| **pptxgenjs でノートなし**             | addNotes 未呼び出し      | create_pptx.js 修正済み                     |
| **photo スライドが見にくい**           | レイアウト固定           | Layout 12 使用 or content に変換            |
| **スライドマスター表示で開く**         | viewProps.xml 設定継承   | `_normalize_view_settings()` で自動修正     |
| **two_column が空で表示**              | left/right_items 未対応  | スクリプト修正済み                          |
| **未使用プレースホルダーで余白**       | Body PH が空のまま残る   | 自動削除機能追加済み                        |
| **セクションスライドが空に見える**     | subtitle 未設定          | subtitle フィールドを必須化                 |
| **セクションの title/subtitle 重なり** | PH が同じ位置            | subtitle を textbox で追加                  |
| **photo で画像がはみ出す**             | 高さ制限なし             | width_percent を 50-60% に / content に変換 |
| **photo 乱用で説明が消失**             | Summarizer の圧縮方針    | photo → content+image に変換                |

---

## 20. 未使用プレースホルダーで余白が大きくなる問題

| 項目     | 内容                                                                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **症状** | テンプレートに Body/Content プレースホルダーがあるレイアウトを使用し、items を渡さなかった場合、空のプレースホルダーが残り余白が大きく見える |
| **原因** | 使われていないプレースホルダーが削除されずに残っていた                                                                                       |
| **対策** | (1) コンテンツなし時に自動でシンプルなレイアウト（title_only/blank）を選択、(2) それでも残る空の Body PH を自動削除                          |
| **確認** | PPTX 生成ログで "[i] No content → using simpler layout" や "[i] Removed N empty body placeholder(s)" が出力される                            |
| **状態** | ✅ 修正済み（スクリプト対応）                                                                                                                |

### 改善内容

1. **`analyze_template.py`**: `title_only` レイアウトカテゴリを `layout_mapping` に追加
2. **`create_from_template.py`**:
   - `remove_empty_body_placeholders()` 関数を追加（空の Body/Content PH を削除）
   - コンテンツ量に応じた最適レイアウト自動選択ロジックを追加
   - `title_only`, `blank`, `photo` レイアウトの自動検出を追加

### 自動選択ロジック

| 条件                                      | 選択されるレイアウト     |
| ----------------------------------------- | ------------------------ |
| `type: "content"` + items なし + 画像なし | `title_only` or `blank`  |
| `type: "photo"` + items なし + 画像あり   | `photo` or `blank`       |
| 通常のコンテンツあり                      | 元のレイアウトマップ通り |

---

> 💡 **新しい問題が発生したら**: このファイルに追記してください。

---

## 21. 画像がスライド右端にはみ出す問題

| 項目     | 内容                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| **症状** | `image.position: "right"` で配置した画像がスライドの右端からはみ出す                                            |
| **原因** | スライド幅を 13.333 インチ（標準サイズ）でハードコードしていた。別サイズのテンプレート（例：10.0 インチ）で破綻 |
| **対策** | `prs.slide_width.inches` で動的にスライドサイズを取得し、全ての計算に適用                                       |
| **確認** | 異なるサイズのテンプレートでも画像がはみ出さない                                                                |
| **状態** | ✅ 修正済み（スクリプト対応）                                                                                   |

### 改善内容

`create_from_template.py` の `add_image_to_slide()` 関数を修正：

```python
# ❌ 修正前: ハードコード
slide_width = 13.333
img_left = Inches(slide_width - margin) - img_width

# ✅ 修正後: 動的取得
slide_width_inches = prs.slide_width.inches
slide_height_inches = prs.slide_height.inches
img_left = Inches(slide_width_inches - margin) - img_width
```

### 影響範囲

- 画像の `position: "right"` 配置
- 画像の `position: "bottom"` 配置
- コードブロックの配置
- コンテンツエリアの高さ計算

---

## 22. コードブロックがスライド下部にはみ出す問題

| 項目     | 内容                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| **症状** | `code` フィールドで追加したコードブロックがスライドの下端からはみ出す                                       |
| **原因** | コードブロックの位置（`code_top = 4.5 インチ`）と高さ（`code_height = 2.0 インチ`）がハードコードされていた |
| **対策** | スライド高さに対する比率で動的に計算（60% 位置から開始、32% の高さ）                                        |
| **確認** | 小さいテンプレート（5.625 インチ高）でもはみ出さない                                                        |
| **状態** | ✅ 修正済み（スクリプト対応）                                                                               |

### 改善内容

```python
# ❌ 修正前: ハードコード
code_top = Inches(4.5)
code_height = Inches(2.0)

# ✅ 修正後: スライド高さに応じた動的計算
slide_height = prs.slide_height.inches
code_top = Inches(slide_height * 0.6)      # 60% の位置
code_height = Inches(slide_height * 0.32)  # 32% の高さ
```

---

## 23. fetch_webpage で画像 URL が取得できない問題

| 項目     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| **症状** | `fetch_webpage` ツールで Web 記事を取得しても、記事内の画像 URL が含まれない |
| **原因** | ツールの仕様として画像 URL は返さない場合がある                              |
| **対策** | `curl` で HTML ソースを取得し、正規表現で画像 URL を抽出する                 |
| **確認** | 記事に画像があるか `curl -s $url \| Select-String '<img'` で事前確認         |
| **状態** | ⚠️ ワークフロー対応（ツール制限のため）                                      |

### 対応手順

```powershell
# 1. HTML ソースを取得
$html = curl -s $url

# 2. 画像URLを正規表現で抽出
$imageUrls = [regex]::Matches($html, 'https://[^"]+\.(png|jpg|jpeg|gif|webp)') |
    ForEach-Object { $_.Value } | Select-Object -Unique

# 3. 画像をダウンロード
foreach ($imgUrl in $imageUrls) {
    curl -s -o "images/${base}/${i}_image.png" $imgUrl
}
```

**PLAN フェーズで確認**: Web ソースの場合、必ず画像の有無を事前確認すること。

---

## 24. content.json の code フィールドが反映されない問題

| 項目     | 内容                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------- |
| **症状** | content.json に `code` フィールドを追加しても、PPTX にコードブロックが表示されない                |
| **原因** | `create_from_template.py` の `add_slide_from_layout()` が `code` パラメータを受け取っていなかった |
| **対策** | 関数に `code` パラメータを追加し、暗色背景 + Consolas フォントでコードブロックを描画              |
| **確認** | 生成ログに `💻` マークが表示される                                                                |
| **状態** | ✅ 修正済み（スクリプト対応）                                                                     |

### 改善内容

1. `add_slide_from_layout()` に `code: Optional[str] = None` パラメータを追加
2. コードブロックのスタイル:
   - 背景色: `RGBColor(40, 44, 52)` （ダークテーマ）
   - フォント: Consolas, 11pt
   - 文字色: `RGBColor(171, 178, 191)` （ライトグレー）
3. 位置は items がある場合は下部、ない場合は中央に自動調整

---

## 25. セクションスライドが空っぽに見える問題

| 項目     | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| **症状** | `type: "section"` のスライドがタイトルのみで、本文が空っぽに見える                 |
| **原因** | セクションスライドは本来タイトルのみのレイアウトだが、文脈がないと意味が伝わらない |
| **対策** | `subtitle` フィールドを必須化し、セクションの概要や次の内容を記載                  |
| **確認** | PPTX 生成後、セクションスライドにサブタイトルが表示される                          |
| **状態** | ✅ ルール化済み（ドキュメント対応）                                                |

### 問題例

```json
// ❌ NG: タイトルのみで空っぽに見える
{
  "type": "section",
  "title": "MCP サーバーの開発とデプロイ"
}

// ✅ OK: subtitle でセクションの概要を追加
{
  "type": "section",
  "title": "MCP サーバーの開発とデプロイ",
  "subtitle": "VS Code で開発し Azure Container App にデプロイ",
  "notes": "このセクションでは..."
}
```

### 推奨される subtitle の書き方

| パターン             | 例                                                |
| -------------------- | ------------------------------------------------- |
| 内容の要約           | "VS Code で開発し Azure Container App にデプロイ" |
| これから説明すること | "認証フローと必要な設定項目を解説"                |
| キーワード列挙       | "Entra ID / アプリ登録 / スコープ設定"            |
| ステップ番号         | "Step 2 of 4: 認証設定"                           |

### 更新されたドキュメント

- `.github/copilot-instructions.md`: 必須ルールに追加
- `.github/instructions/quality-guidelines.instructions.md`: 詳細ルール追加
- `workspace/content.example.json`: section スライドの例追加

---

## 26. セクションスライドで title と subtitle が重なる問題

| 項目     | 内容                                                                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **症状** | `type: "section"` のスライドで、タイトルとサブタイトルのテキストが同じ位置に重なって表示される（文字が二重に見える）                            |
| **原因** | テンプレートの Section Title レイアウトで TITLE と SUBTITLE プレースホルダーが同じ位置（中央）に配置されている、または SUBTITLE PH がない       |
| **背景** | Microsoft Ignite 等のイベント用テンプレートでは、Section スライドの title/subtitle が同じ座標を持つことがある（片方のみ使用する前提のデザイン） |
| **対策** | `create_from_template.py` で SUBTITLE PH がない場合、title プレースホルダーの下に textbox として subtitle を追加するよう修正済み                |
| **確認** | PPTX 生成後、セクションスライドでテキストが重ならないことを確認                                                                                 |
| **状態** | ✅ 修正済み（2025-12-14）                                                                                                                       |

### 修正内容

1. **subtitle の位置を動的計算**: title プレースホルダーの下端 + 0.2 インチに配置
2. **word_wrap を無効化**: subtitle が改行されないように

```python
# 修正後のコード（create_from_template.py）
title_bottom = title_placeholder.top.inches + title_placeholder.height.inches + 0.2
subtitle_box = slide.shapes.add_textbox(
    Inches(0.64), Inches(title_bottom), Inches(slide_width - 1.5), Inches(0.6)
)
tf.word_wrap = False  # 改行を防止
```

---

## 27. photo スライドで画像がスライド下部にはみ出す問題

| 項目     | 内容                                                                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **症状** | `type: "photo"` + `position: "center"` で配置した画像がスライドの下端からはみ出す（Copilot ロゴ等の縦長画像で顕著）                     |
| **原因** | `width_percent` のみで画像サイズを制御しており、高さ方向の制限がない。縦長画像では width を基準にすると height が過大になる             |
| **対策** | (1) `add_image_to_slide()` で高さ方向も制限（スライド高さの 70% を上限）、(2) photo タイプは content レイアウトを使用してタイトルと分離 |
| **確認** | PPTX 生成後、画像がスライド内に収まることを確認                                                                                         |
| **状態** | 🔄 対応中（スクリプト改善予定）                                                                                                         |

### 技術詳細

```python
# 問題: width のみ制限
img_width = Inches(content_width * width_pct / 100)
# → 縦長画像では height がスライドをはみ出す

# 解決策: 高さも制限
max_height = Inches(slide_height * 0.65)  # タイトル領域を除いた70%
if calculated_height > max_height:
    # height を基準にして width を再計算
    img_height = max_height
    img_width = img_height * aspect_ratio
```

### 回避策

1. **content.json 側で対応**: `width_percent` を小さく（50-60%）

```json
{
  "type": "photo",
  "title": "M365 Copilot",
  "image": {
    "path": "images/slide_14.png",
    "position": "center",
    "width_percent": 50
  }
}
```

2. **type を変更**: `photo` → `content` にして箇条書きを追加

---

## 28. Summarizer による圧縮時の photo スライド乱用問題

| 項目     | 内容                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| **症状** | 複数スライドを 1 つに統合する際、`type: "photo"` が多用され、画像だけで説明がないスライドが多発                 |
| **原因** | Summarizer が画像中心のスライドを安易に `photo` タイプにまとめる。photo タイプは items を持たないため説明が消失 |
| **対策** | Summarizer エージェント定義に「photo タイプは content+image に変換」ルールを追加                                |
| **確認** | content_ja.json で `type: "photo"` の数が全体の 20% 以下であること                                              |
| **状態** | ✅ ルール化済み（エージェント定義更新）                                                                         |

### Summarizer への指示追加

```markdown
## photo タイプの使用制限

- `type: "photo"` は画像が主役で説明が不要な場合のみ使用
- スクリーンショット + 説明が必要な場合は `type: "content"` + `image` を使用
- 統合時に説明を落とさない（元スライドのノートから抽出）
```

### 推奨パターン

| 元のスライド              | 圧縮後の推奨                               |
| ------------------------- | ------------------------------------------ |
| スクリーンショット + 説明 | `type: "content"` + `image` + `items`      |
| ロゴ/アイコンのみ         | `type: "photo"` (OK)                       |
| デモ画面（説明なし）      | `type: "content"` + `image` + ノートに説明 |
| 複数画像を統合            | `type: "two_column"` + 両方に image        |

---

## 29. content + image で画像がテキストと重なる問題

| 項目     | 内容                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| **症状** | `type: "content"` に `image` を追加したスライドで、画像がテキストの上に重なって表示される      |
| **原因** | `create_from_template.py` が `content` タイプを見ると常に `Title and Content` レイアウトを選択 |
|          | このレイアウトには画像用のスペースがなく、画像は後から手動配置される                           |
| **対策** | `layout_mapping` に `content_with_image` を追加し、`Two Column` レイアウトを使用するよう修正   |
| **確認** | PPTX 生成ログで `[i] Content + image → using layout [6]` が表示されること                      |
| **状態** | ✅ 修正済み（スクリプト対応 2024-12-14）                                                       |

### 修正内容

**layouts.json に追加:**

```json
{
  "layout_mapping": {
    "content_with_image": 6 // Two Column Non-bulleted text
    // ... 他のマッピング
  }
}
```

**create_from_template.py の修正:**

```python
# Content slides with image should use two-column or content_with_image layout
elif slide_type == 'content' and has_image:
    image_layout = layout_map.get('content_with_image') or layout_map.get('two_column')
    if image_layout is not None:
        layout_idx = image_layout
```

---

## 30. テンプレートの背景画像/装飾がコンテンツを圧迫する問題

| 項目     | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| **症状** | スライドの左端に紫の帯や装飾画像が表示され、コンテンツエリアが狭くなる          |
| **原因** | スライドマスターに背景画像（Graphic 143、MS Brand colors 等）が埋め込まれている |
|          | 外部テンプレート（特に Ignite 等のイベント用）によく見られる                    |
| **対策** | PREPARE_TEMPLATE フェーズで `diagnose_template.py` → `clean_template.py` を実行 |
| **確認** | `diagnose_template.py` で "Background Images in Slide Masters" が 0 であること  |
| **状態** | ✅ ワークフロー明確化済み（PREPARE_TEMPLATE フェーズ必須化）                    |

### 診断・クリーニング手順

```powershell
# 1. テンプレート診断
python scripts/diagnose_template.py "input/template.pptx"

# 2. 問題があればクリーニング
python scripts/clean_template.py "input/template.pptx" "output_manifest/${base}_clean_template.pptx"

# 3. クリーンなテンプレートを再分析
python scripts/analyze_template.py "output_manifest/${base}_clean_template.pptx"
```

### 典型的な問題パターン

| 問題                        | 症状                             | 対処                                   |
| --------------------------- | -------------------------------- | -------------------------------------- |
| マスター内背景画像          | 生成スライドに山の風景等が重なる | PICTURE シェイプを削除                 |
| Picture Placeholder の blip | 「この画像は表示できません」表示 | blip 参照を削除                        |
| 過剰なスライドマスター数    | ファイルサイズ肥大、不整合       | 使用マスターのみに限定（5 個以下推奨） |

---

## 31. PREPARE_TEMPLATE フェーズがスキップされる問題

| 項目     | 内容                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- |
| **症状** | 外部テンプレート使用時にレイアウト崩れや背景画像重複が発生                               |
| **原因** | Orchestrator が PREPARE_TEMPLATE フェーズを実行せずに EXTRACT → TRANSLATE へ進んでしまう |
| **対策** | AGENTS.md と orchestrator.agent.md に PREPARE_TEMPLATE を必須フェーズとして明記          |
| **確認** | ワークフロー開始時に `diagnose_template.py` が実行されていること                         |
| **状態** | ✅ ドキュメント明確化済み                                                                |

### Orchestrator への指示

```markdown
## PREPARE_TEMPLATE フェーズ（★ 必須）

外部テンプレート（元 PPTX 含む）を使用する場合、以下を必ず実行:

1. `diagnose_template.py` でテンプレート品質診断
2. 問題があれば `clean_template.py` でクリーニング
3. `analyze_template.py` でレイアウト分析（layouts.json 生成）
4. layouts.json に `content_with_image` マッピングを追加

スキップ禁止: このフェーズをスキップすると、背景画像重複やレイアウト崩れの原因となる
```

---

## 32. セクションスライドでタイトルが途中で改行される問題

| 項目     | 内容                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| **症状** | `type: "section"` のスライドで、タイトルが途中で改行される（例: 「セキュリティ」→「セキュリ」「ティ」）    |
| **原因** | Section Title レイアウトの TITLE プレースホルダー幅が狭い（7.30 インチ等）ため、長いタイトルが折り返される |
| **対策** | `create_from_template.py` で section スライドの場合、TITLE プレースホルダーの幅を拡張 + word_wrap を無効化 |
| **確認** | PPTX 生成後、セクションスライドのタイトルが 1 行で表示されること                                           |
| **状態** | ✅ 修正済み（2025-12-14）                                                                                  |

### 修正内容

```python
# create_from_template.py - section スライドのタイトル幅拡張
if slide_type == 'section':
    title_placeholder.width = Inches(slide_width - 1.5)
    title_placeholder.text_frame.word_wrap = False
```

### 備考

- スライド幅（13.33 インチ）に対して 11.8 インチ程度に拡張
- 長いタイトルは事前に要約することを推奨（40 文字以内）

---

## 33. スピーカーノートが「出典」だけで薄い問題（★ 自動検出対応済み）

| 項目     | 内容                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| **症状** | スピーカーノートが `[出典: 元スライド #XX]` のみで、プレゼンターが何を話すべきか分からない |
| **原因** | Summarizer/Localizer が要約・翻訳時にノート内容を充実させていない                          |
| **対策** | `validate_pptx.py` で「出典のみ」パターンを自動検出して警告                                |
| **確認** | `validate_pptx.py` 実行時に `source_only_notes` 警告が出たらノートを充実させる             |
| **状態** | ✅ 自動検出対応済み（2025-12-14）                                                          |

### 自動検出されるパターン

```
[出典: 元スライド #XX]
---
[出典: ...]
[新規作成]
Source: ...
```

### 検出時の警告例

```
⚠️ WARN - 1 warning(s)

--- Warnings ---
  [source_only_notes] slides [14, 17, 21, ...]:
  13 slides have only source citations in notes (no actual content)
  💡 Add talking points, background info, or context for the presenter
```

### ルール

| スライドタイプ | ノートに含めるべき内容                     | 最低行数 |
| -------------- | ------------------------------------------ | -------- |
| section        | セクションの目的、扱うトピックの概要       | 3-5 行   |
| content        | 各項目の詳細説明、背景情報、話し方のヒント | 5-10 行  |
| photo/image    | 画像の説明、何を見せているか、注目ポイント | 3-5 行   |

---

## 34. Two Column レイアウトで空のプレースホルダーが残る問題

| 項目     | 内容                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **症状** | `content + image` スライドで Two Column レイアウトを使用すると、右カラムに「テキストを入力」という空のプレースホルダーが残る |
| **原因** | `add_slide_from_layout()` で items を左カラムに設定後、右カラムのプレースホルダーを削除していなかった                        |
| **対策** | 関数の最後で `remove_empty_body_placeholders()` を常に呼び出すように修正                                                     |
| **確認** | PPTX 生成ログに `Removed N empty body placeholder(s)` が表示される                                                           |
| **状態** | ✅ 修正済み（2025-12-14）                                                                                                    |

### 修正内容

```python
# create_from_template.py - スライド生成の最後に空プレースホルダーを削除
# Final cleanup: remove empty placeholders and textboxes
removed_body = remove_empty_body_placeholders(slide)
if removed_body > 0:
    print(f"    [i] Removed {removed_body} empty body placeholder(s)")

removed_textboxes = remove_empty_textboxes(slide)
if removed_textboxes > 0:
    print(f"    [i] Removed {removed_textboxes} empty textbox(es)")
```

### 追加された関数

- `remove_empty_textboxes()`: 空の TextBox シェイプを削除
- `remove_empty_body_placeholders()`: 空の BODY/OBJECT/CONTENT プレースホルダーを削除（既存、呼び出しタイミング変更）

---

## 35. セクションスライドのタイトルがスライド外に表示される問題

| 項目     | 内容                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------- |
| **症状** | `type: "section"` のスライドで、タイトルがスライドの上端からはみ出して表示される（PowerPoint で見切れる） |
| **原因** | テンプレートの TITLE プレースホルダーの位置・高さが不正（top=0.46" や height=0 など）                     |
| **対策** | `create_from_template.py` で section スライドは**常に**タイトル位置を 40% に設定（条件分岐なし）          |
| **確認** | PPTX 生成後、セクションスライドのタイトルがスライド中央付近（40%位置）に表示されること                    |
| **状態** | ✅ 修正済み（2025-12-14 v9）                                                                              |

### 修正内容（最終版）

```python
# create_from_template.py - section スライドのタイトル高さ・位置を修正
if slide_type == 'section':
    title_placeholder.width = Inches(slide_width - 1.5)
    title_placeholder.text_frame.word_wrap = False

    # Fix height if it's reported as 0 (causes display issues)
    if title_placeholder.height.inches < 0.5:
        title_placeholder.height = Inches(1.0)

    # ★ 常にタイトルを中央（40%位置）に配置（条件分岐なし）
    title_placeholder.top = Inches(slide_height * 0.40)
```

### 修正の経緯

1. **v7**: 条件付きで位置修正 → 一部テンプレートで位置ずれ
2. **v8**: 条件なしで常に 40% 位置に設定 → 全テンプレートで安定

### 備考

- 一部のテンプレート（Microsoft Ignite 等）では、プレースホルダーの位置が上端や下端に設定されている
- **常に 40%** に設定することで、どのテンプレートでも安定した表示が可能
- `top = slide_height * 0.40` = 7.5 インチスライドで 3.0 インチ

---

## 36. セクションスライドのサブタイトルが小さすぎる問題

| 項目     | 内容                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| **症状** | `type: "section"` のサブタイトル（例: 「統合データセキュリティプラットフォーム」）のフォントが小さく読みにくい |
| **原因** | サブタイトルのフォントサイズがデフォルト 18pt と控えめに設定されていた                                         |
| **対策** | `create_from_template.py` で section スライドのサブタイトルを 24pt、高さを 0.8 インチに変更                    |
| **確認** | PPTX 生成後、セクションスライドのサブタイトルが十分なサイズで表示されること                                    |
| **状態** | ✅ 修正済み（2025-12-14 v9）                                                                                   |

### 修正内容

```python
# create_from_template.py - サブタイトルのフォントサイズ・高さを増加
subtitle_box = slide.shapes.add_textbox(
    Inches(0.64),
    Inches(title_bottom),
    Inches(slide_width - 1.5),
    Inches(0.8)  # ★ 0.6 → 0.8 に増加
)
paragraph.font.size = Pt(24)  # ★ 18 → 24 に増加
paragraph.font.color.rgb = RGBColor(100, 100, 100)
```

### 推奨設定

| 要素         | 推奨サイズ | 色               |
| ------------ | ---------- | ---------------- |
| タイトル     | 44-54pt    | 濃い色（自動）   |
| サブタイトル | 24pt       | グレー (#646464) |

---

## 37. セクションスライドでタイトルとサブタイトルが離れすぎる問題

| 項目     | 内容                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| **症状** | `type: "section"` でタイトルが上部、サブタイトルが中央下部に配置され、スライドがスカスカに見える                   |
| **原因** | テンプレートの SUBTITLE/BODY プレースホルダーが離れた位置に設定されている                                          |
| **対策** | `create_from_template.py` でギャップが max_gap（スライド高さの 25% または 1.5 インチ）を超えた場合に自動で近づける |
| **確認** | PPTX 生成ログで "Subtitle repositioned to reduce gap" が出力される                                                 |
| **状態** | ✅ 修正済み（2025-12-14）                                                                                          |

### 修正内容

```python
# create_from_template.py - タイトルとサブタイトルの距離を自動調整
if title_placeholder:
    title_bottom = title_placeholder.top.inches + max(title_placeholder.height.inches, 0.8)
    subtitle_top = subtitle_placeholder.top.inches
    gap = subtitle_top - title_bottom

    # Maximum gap: 25% of slide height (or 1.5 inches, whichever is smaller)
    max_gap = min(slide_height * 0.25, 1.5)
    ideal_gap = 0.4  # Ideal gap: 0.3-0.5 inches

    if gap < 0.2:
        # Overlapping: move subtitle below title
        new_top = title_bottom + ideal_gap
        subtitle_placeholder.top = Inches(new_top)
    elif gap > max_gap:
        # Too far apart: bring subtitle closer to title
        new_top = title_bottom + ideal_gap
        subtitle_placeholder.top = Inches(new_top)
```

### 判定基準

| 状態     | gap の範囲          | アクション                    |
| -------- | ------------------- | ----------------------------- |
| 重なり   | < 0.2 インチ        | タイトル下に 0.4 インチで配置 |
| 適正     | 0.2 ≤ gap ≤ max_gap | そのまま維持                  |
| 離れすぎ | > max_gap           | タイトル下に 0.4 インチで配置 |

---

## 38. テンプレート選択時のコントラスト問題（暗い背景レイアウト）

| 項目     | 内容                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| **症状** | 暗い背景を持つレイアウト（Two Column 等）で黒文字が使われ、テキストが読めない                  |
| **原因** | テンプレートの一部レイアウトに暗い背景画像が埋め込まれているが、テキスト色が自動調整されない   |
| **対策** | (1) 暗い背景レイアウトを避ける (2) 元 PPTX 継承（方式 A）を使用 (3) テンプレート診断で事前確認 |
| **確認** | `diagnose_template.py` で "Picture shape in layout" 警告を確認                                 |
| **状態** | ⚠️ 運用回避（テンプレート選択時に注意）                                                        |

### 問題のあるテンプレートパターン

```python
# 診断コマンド
python scripts/diagnose_template.py templates/xxx.pptx

# 暗い背景を持つレイアウトを検出
for layout in prs.slide_layouts:
    for shape in layout.shapes:
        if not shape.is_placeholder and 'Picture' in shape.name:
            print(f'⚠️ Layout {i}: {layout.name} has Picture shape (likely dark background)')
```

### 推奨対応

| 入力タイプ         | 推奨方式                 | 理由                       |
| ------------------ | ------------------------ | -------------------------- |
| 英語 PPTX → 日本語 | **元 PPTX 継承（A）**    | 元のコントラスト設定を維持 |
| Web ソース → PPTX  | テンプレート診断後に選択 | 暗い背景レイアウトを避ける |
| コード多め         | pptxgenjs（B）           | 暗色背景対応コードブロック |

---

## 39. タイトルスライドでタイトルが折り返される問題

| 項目     | 内容                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| **症状** | タイトルスライドで長いタイトルが 3-4 行に折り返され、読みにくくなる                            |
| **原因** | テンプレートの CENTER_TITLE プレースホルダーの幅が狭い（例: 7.18 インチ / スライド幅の 54%）   |
| **対策** | `create_from_template.py` でタイトルプレースホルダーの幅を動的に拡張（スライド幅の 85%程度に） |
| **確認** | 長いタイトルが 1-2 行で収まることを視覚確認                                                    |
| **状態** | ⚠️ 一部テンプレートで発生（元 PPTX 継承で回避推奨）                                            |

### 対処法

```python
# タイトルプレースホルダーの幅を拡張
if slide_type == 'title':
    if title_placeholder.width.inches < slide_width * 0.7:
        title_placeholder.width = Inches(slide_width * 0.85)
        title_placeholder.left = Inches((slide_width - title_placeholder.width.inches) / 2)
```

---

## 40. テンプレートレイアウトにプレースホルダーがない問題

| 項目     | 内容                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| **症状** | 特定のレイアウト（例: Two Column）にプレースホルダーがなく、テキスト配置ができない          |
| **原因** | テンプレート設計上、プレースホルダーを使わずにシェイプで構成されている                      |
| **対策** | (1) テンプレート診断で事前確認 (2) プレースホルダーがあるレイアウトを layout_mapping で指定 |
| **確認** | `analyze_template.py` 出力で "placeholders: []" を確認                                      |
| **状態** | ⚠️ テンプレート選択時に注意                                                                 |

### 診断コマンド

```powershell
python scripts/analyze_template.py templates/xxx.pptx

# layouts.json で placeholder 数を確認
# placeholders: [] のレイアウトは避ける
```

---

## 41. スライド外 TextBox による縦文字表示問題

| 項目     | 内容                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------- |
| **症状** | スライド左端に「M i c r o s o f」のような縦書きテキストが表示される                                     |
| **原因** | テンプレートにスライド外（left > slide_width）の TextBox が存在し、狭い領域にテキストが入り縦書きになる |
| **対策** | `create_clean_template.py --all` でスライド外のシェイプを自動削除                                       |
| **確認** | 生成 PPTX を PowerPoint で開き、スライド左端に縦文字がないことを確認                                    |
| **状態** | ✅ 修正済み（スクリプト対応 - v3 以降）                                                                 |

### 検出ロジック

```python
# create_clean_template.py の remove_decorative_shapes()
slide_width = prs.slide_width.inches

for shape in layout.shapes:
    # スライド外のシェイプを検出・削除
    if shape.left.inches > slide_width:
        shapes_to_remove.append(shape)
```

---

## 42. 日本語テキストの文字間隔が不自然に広がる問題

| 項目     | 内容                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------- |
| **症状** | 日本語タイトルで「セキュ リティ」のように特定の文字間にスペースが入る                                     |
| **原因** | テンプレートの AutoFit（spAutoFit）設定により、テキストがプレースホルダーに収まるよう文字間隔が調整される |
| **対策** | `create_from_template.py` でセクションスライドの AutoFit を無効化（`auto_size = None`）                   |
| **確認** | 日本語タイトルに不自然なスペースがないことを視覚確認                                                      |
| **状態** | ✅ 修正済み（スクリプト対応 - v4 以降）                                                                   |

### 修正コード

```python
# create_from_template.py のセクションスライド処理
if slide_type == 'section':
    title_placeholder.text_frame.word_wrap = False
    title_placeholder.text_frame.auto_size = None  # AutoFit無効化
```

---

## 43. セクションスライドのタイトル/サブタイトル位置調整が効かない問題

| 項目     | 内容                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| **症状** | タイトルとサブタイトルが離れすぎているのに、位置調整が発動しない                        |
| **原因** | 調整条件が「< 20% or > 60%」と緩すぎ、43%位置のタイトルが調整対象外だった               |
| **対策** | セクションスライドは常に 35%位置に配置、サブタイトルはタイトル直下（0.15 インチ）に配置 |
| **確認** | セクションスライドでタイトルとサブタイトルが視覚的に近いことを確認                      |
| **状態** | ✅ 修正済み（スクリプト対応 - v4 以降）                                                 |

### 修正後のロジック

```python
# create_from_template.py のセクションスライド処理
if slide_type == 'section':
    # 常に35%位置に配置
    target_top = slide_height * 0.35
    title_placeholder.top = Inches(target_top)

    # サブタイトルはタイトル直下（0.15インチ）
    subtitle_top = title_top + title_height + 0.15
```

| 項目                 | 修正前                    | 修正後      |
| -------------------- | ------------------------- | ----------- |
| タイトル位置         | 43.5%（テンプレート依存） | 35%（固定） |
| サブタイトルギャップ | 0.3 インチ                | 0.15 インチ |
| 調整条件             | < 20% or > 60%            | 常に調整    |

---

## 44. タイトルスライドの人物写真が大きすぎる問題

| 項目     | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| **症状** | タイトルスライドでプレゼンター写真が右半分を占め、タイトルが途中で切れる        |
| **原因** | title タイプでも image があると通常のコンテンツスライドと同じサイズで画像を配置 |
| **対策** | title/closing タイプでは画像の width_percent を最大 25% に制限                  |
| **確認** | タイトルスライドで写真が小さく、タイトルが完全に表示されることを確認            |
| **状態** | ✅ 修正済み（create_pptx.js / create_ja_pptx.py 対応）                          |

### 修正コード

**create_pptx.js:**

```javascript
case "title":
case "closing":
  if (slideData.image) {
    // Limit image size for title slides (e.g., presenter photos)
    const titleSlideData = { ...slideData };
    titleSlideData.image = {
      ...titleSlideData.image,
      width_percent: Math.min(titleSlideData.image.width_percent || 25, 25)
    };
    slide = await addContentSlide(pptx, titleSlideData, basePath);
  }
```

**create_ja_pptx.py:**

```python
if slide_type in ['title', 'closing']:
    if image_config:
        small_image_config = image_config.copy()
        small_image_config['width_percent'] = min(image_config.get('width_percent', 25), 25)
        slide = add_content_slide(prs, title, content, slide_type, small_image_config)
```

---

## 45. pptxgenjs でアイコン/画像のアスペクト比が崩れる問題

| 項目     | 内容                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| **症状** | 画像が横長に潰れる、または縦長に引き伸ばされる                                   |
| **原因** | pptxgenjs で `h` を省略すると元ピクセルサイズで表示、または `w` のみで引き伸ばし |
| **対策** | `sizing: { type: 'contain', w: imgW, h: maxImgH }` でアスペクト比を維持          |
| **確認** | 画像が正しい比率で表示され、指定範囲内に収まることを確認                         |
| **状態** | ✅ 修正済み（create_pptx.js 対応）                                               |

### 修正コード

```javascript
// ❌ NG: h を省略 → アスペクト比崩れ
slide.addImage({
  ...imageOpts,
  x: imgX,
  y: imgY,
  w: imgW,
  // h is omitted - causes aspect ratio issues
});

// ✅ OK: sizing: 'contain' でアスペクト比維持
slide.addImage({
  ...imageOpts,
  x: imgX,
  y: imgY,
  sizing: { type: "contain", w: imgW, h: maxImgH },
});
```

### pptxgenjs の sizing オプション

| type    | 動作                                         |
| ------- | -------------------------------------------- |
| contain | 指定範囲内でアスペクト比を維持（余白あり）   |
| cover   | 指定範囲を埋める（はみ出し部分はトリミング） |
| crop    | 指定サイズでトリミング                       |

---

## 46. 暗い背景でテキストが黒のまま表示される問題

| 項目     | 内容                                                                       |
| -------- | -------------------------------------------------------------------------- |
| **症状** | セクションスライドや暗い背景レイアウトで、本文テキストが黒いままで読めない |
| **原因** | テキスト色がハードコードされており、背景色を考慮していなかった             |
| **対策** | 背景色を検出し、暗い場合は自動的に白文字に切り替え                         |
| **確認** | 暗い背景のスライドで白文字が表示されることを確認                           |
| **状態** | ✅ 修正済み（create_pptx.js / create_from_template.py 対応）               |

### 検出ロジック

```javascript
// create_pptx.js
function isDarkColor(hexColor) {
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  // Luminance formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 128; // Dark if luminance < 50%
}

function getTextColor(slideData, defaultColor) {
  if (slideData.dark_background || slideData.background_image) {
    return COLORS.white;
  }
  if (slideData.background_color && isDarkColor(slideData.background_color)) {
    return COLORS.white;
  }
  return defaultColor;
}
```

### content.json での指定方法

```json
{
  "type": "content",
  "title": "暗い背景のスライド",
  "dark_background": true,
  "items": ["この文字は自動的に白になる"]
}
```

---

## 47. アイコン/ロゴが大きく表示される問題（B/C 方式）

| 項目     | 内容                                                                       |
| -------- | -------------------------------------------------------------------------- |
| **症状** | 小さいアイコンやロゴが通常画像と同じサイズ（45%）で表示され、巨大になる    |
| **原因** | create_pptx.js / create_ja_pptx.py にアイコン検出ロジックがなかった        |
| **対策** | create_from_template.py と同じ `isIconOrLogo()` 関数を移植                 |
| **確認** | ログに "Icon/logo detected" と表示され、適切なサイズで配置されることを確認 |
| **状態** | ✅ 修正済み（create_pptx.js / create_ja_pptx.py 対応）                     |

### 検出条件

| 条件                               | 判定     | 推奨サイズ |
| ---------------------------------- | -------- | ---------- |
| 幅または高さ < 400px               | アイコン | 10-20%     |
| 正方形（0.9-1.1 比率）かつ ≤ 800px | ロゴ     | 15-25%     |
| 幅 > 高さ × 3（極端な横長）        | バナー   | 20%        |
| それ以外                           | 通常画像 | 指定値     |

### 実装例（JavaScript）

```javascript
function isIconOrLogo(imagePath) {
  const size = getImageSize(imagePath);
  if (!size) return { isIcon: false, suggestedPct: 45 };

  const { width, height } = size;
  const aspectRatio = width / height;

  // Small image = icon
  if (width < 400 || height < 400) {
    return {
      isIcon: true,
      suggestedPct: Math.max(10, Math.min(20, width / 40)),
    };
  }
  // Square-ish and small = logo
  if (aspectRatio >= 0.9 && aspectRatio <= 1.1 && width <= 800) {
    return { isIcon: true, suggestedPct: 25 };
  }
  // Very wide banner
  if (aspectRatio > 3) {
    return { isIcon: true, suggestedPct: 20 };
  }
  return { isIcon: false, suggestedPct: 45 };
}
```

---

## 48. サブタイトルが縦に 1 文字ずつ表示される問題

| 項目     | 内容                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------- |
| **症状** | タイトルスライドのサブタイトルが 1 文字ずつ縦に表示される（横書きなのに縦長に見える）             |
| **原因** | python-pptx でプレースホルダーの `top` のみを調整すると、XML の `<a:ext>`（サイズ）が設定されない |
| **対策** | 位置調整前に `width`/`height` を保存し、調整後に明示的に復元する                                  |
| **確認** | 生成された PPTX の XML で `<a:xfrm>` に `<a:off>` と `<a:ext>` の両方が存在するか確認             |
| **状態** | ✅ 修正済み（create_from_template.py 対応）                                                       |

### 技術詳細

PowerPoint の OOXML では、プレースホルダーのサイズはレイアウトから継承されます。しかし、python-pptx で `shape.top` を設定すると、`<a:xfrm>` 要素が作成され、`<a:off>`（位置）のみが設定されます。`<a:ext>`（サイズ）が省略されると、PowerPoint が正しくサイズを継承できず、幅がほぼ 0 になることがあります。

```xml
<!-- ❌ NG: ext がない（サイズ不明） -->
<a:xfrm>
  <a:off x="1524000" y="3875723"/>
</a:xfrm>

<!-- ✅ OK: off と ext の両方がある -->
<a:xfrm>
  <a:off x="1524000" y="3875723"/>
  <a:ext cx="9144000" cy="1655762"/>
</a:xfrm>
```

### 修正コード

```python
# 位置調整前にサイズを保存
original_left = subtitle_placeholder.left
original_width = subtitle_placeholder.width
original_height = subtitle_placeholder.height

# 位置を調整
subtitle_placeholder.top = Inches(new_top)

# サイズと左位置を復元
subtitle_placeholder.left = original_left
subtitle_placeholder.width = original_width
subtitle_placeholder.height = original_height
```

### 影響範囲

| スライドタイプ     | 影響                                      |
| ------------------ | ----------------------------------------- |
| タイトルスライド   | サブタイトル（SUBTITLE プレースホルダー） |
| セクションスライド | サブタイトル（BODY プレースホルダー）     |

> 💡 この問題は、プレースホルダーの位置を動的に調整するすべての箇所で発生する可能性があります。

---

## 49. pptxgenjs でスライド右端・下端にはみ出す問題

| 項目     | 内容                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| **症状** | pptxgenjs で生成した図形やテキストがスライドの右端・下端をはみ出す                               |
| **原因** | pptxgenjs の `LAYOUT_16x9` は **10" × 5.625"** であり、13.33" 幅を想定したハードコードがはみ出す |
| **対策** | `defineLayout()` でテンプレートサイズに合わせる。座標は変数で管理                                |
| **確認** | `console.log(pptx.presLayout)` で実際のサイズを確認                                              |
| **状態** | ✅ 文書化（設計原則 Dynamic Context で対応）                                                     |

### 技術詳細

pptxgenjs の組み込みレイアウトサイズ：

| レイアウト名  | 幅     | 高さ   | 備考                                |
| ------------- | ------ | ------ | ----------------------------------- |
| `LAYOUT_16x9` | 10.0"  | 5.625" | pptxgenjs デフォルト                |
| `LAYOUT_WIDE` | 13.33" | 7.5"   | PowerPoint 標準ワイドスクリーン相当 |
| カスタム      | 任意   | 任意   | `defineLayout()` で定義             |

### 修正コード

```javascript
// ❌ NG: 13.33インチ幅を想定したハードコード
const x = 12.0; // 10インチスライドではみ出す

// ✅ OK: defineLayout でテンプレートサイズに合わせる
pptx.defineLayout({ name: "TEMPLATE", width: 13.33, height: 7.5 });
pptx.layout = "TEMPLATE";

const SLIDE_WIDTH = 13.33;
const SLIDE_HEIGHT = 7.5;

// 全座標を変数ベースで計算
const boxX = SLIDE_WIDTH * 0.05; // 5% マージン
const boxW = SLIDE_WIDTH * 0.9; // 90% 幅
```

### PowerShell でテンプレートサイズを取得して適用

```powershell
# テンプレートサイズを取得
$templateSize = python -c "from pptx import Presentation; p=Presentation('$template'); print(f'{p.slide_width.inches},{p.slide_height.inches}')"
$sizes = $templateSize -split ','
$slideWidth = [double]$sizes[0]
$slideHeight = [double]$sizes[1]

# pptxgenjs スクリプトを動的に更新
$jsContent = Get-Content "scripts/my_diagram.js" -Raw
$jsContent = $jsContent -replace 'width: [\d.]+, height: [\d.]+', "width: $slideWidth, height: $slideHeight"
$jsContent | Set-Content "scripts/my_diagram.js" -Encoding UTF8
```

---

## 50. merge_slides.py で図形スライドが末尾に追加される問題

| 項目     | 内容                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| **症状** | pptxgenjs で生成した図形スライドがプレゼンテーションの末尾に追加される                           |
| **原因** | `merge_slides.py` は `--position` オプションで先頭か末尾を指定できるが、任意位置への挿入は非対応 |
| **対策** | `insert_diagram_slides.py` を使用して任意の位置に挿入                                            |
| **確認** | 挿入設定 JSON で `source_index` と `target_position` を指定                                      |
| **状態** | ✅ 新スクリプト追加で対応                                                                        |

### 使用方法

1. **挿入設定 JSON を作成**:

```json
{
  "insertions": [
    {
      "source_index": 0,
      "target_position": 4,
      "layout_name": "タイトルとコンテンツ"
    },
    {
      "source_index": 1,
      "target_position": 7,
      "layout_name": "タイトルとコンテンツ"
    },
    {
      "source_index": 2,
      "target_position": 10,
      "layout_name": "タイトルとコンテンツ"
    }
  ]
}
```

- `source_index`: 図形 PPTX 内のスライド番号（0 始まり）
- `target_position`: 挿入先の位置（0 始まり、その位置の後ろに挿入）
- `layout_name`: 使用するレイアウト名

2. **挿入実行**:

```powershell
python scripts/insert_diagram_slides.py base.pptx diagrams.pptx output.pptx --config insert_config.json
```

### 自動スケーリング

`insert_diagram_slides.py` は図形 PPTX とベース PPTX のサイズが異なる場合、自動的にスケーリングを行います。

```
Base size:     13.33" x 7.50"
Diagrams size: 10.00" x 5.63"
Scale: 133.33% x 133.33%
```

> 💡 テンプレートと pptxgenjs 出力のサイズを事前に統一しておくと、スケーリングが不要になり品質が向上します。
