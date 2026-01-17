# images/

PPTX から抽出した画像の一時保存フォルダ。

## 構造

```
images/
├── {base}/           # プロジェクトごとのフォルダ
│   ├── slide_01.png  # スライドから抽出した画像
│   ├── slide_02.jpg
│   └── ...
└── slide_*.png       # 直接抽出した画像（非推奨）
```

## 命名規則

| パターン                 | 説明                                  |
| ------------------------ | ------------------------------------- |
| `slide_{nn}.png`         | スライド番号に対応した画像            |
| `{nn}_{description}.png` | Web 記事から取得した画像（連番+説明） |

## 使用ツール

- `scripts/extract_images.py` - PPTX から画像を抽出
- `scripts/create_from_template.py` - content.json の `image.path` を参照して配置

## 注意

- このフォルダの内容は `.gitignore` で除外されています
- 生成物は `output_ppt/` に出力されます
