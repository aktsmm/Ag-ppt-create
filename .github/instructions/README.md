# `.github/instructions` ディレクトリ

エージェントが参照するドメイン別ガイドライン集。

---

## ファイル一覧

### 共通

| ファイル                 | 説明                                                 | 参照エージェント |
| ------------------------ | ---------------------------------------------------- | ---------------- |
| `common.instructions.md` | 命名規則・箇条書き・出力先（Single Source of Truth） | 全エージェント   |

### 方式別

| ファイル                    | 説明                         | 参照エージェント                           |
| --------------------------- | ---------------------------- | ------------------------------------------ |
| `template.instructions.md`  | テンプレートベース PPTX 生成 | Template Analyzer, Content Writer, Builder |
| `convert_html.instructions.md` | HTML → PPTX 変換             | Content Writer, Builder                    |

### 用途別

| ファイル                           | 説明                           | 参照エージェント |
| ---------------------------------- | ------------------------------ | ---------------- |
| `purpose-report.instructions.md`   | 報告・提案・説明プレゼン       | Content Writer   |
| `purpose-incident.instructions.md` | 障害報告・インシデントレポート | Content Writer   |
| `purpose-lt.instructions.md`       | LT（ライトニングトーク）       | Content Writer   |
| `purpose-blog.instructions.md`     | ブログ記事からの変換           | Content Writer   |

---

## 使い方

### Orchestrator から指定

```
【設定】
- 用途: 報告 → purpose-report.instructions.md
- 方式: テンプレート → template.instructions.md
```

### エージェントが直接参照

```markdown
## 参照

- `.github/instructions/template.instructions.md`
```

---

## ファイル構造

```
.github/instructions/
├── README.md                        # このファイル
├── common.instructions.md           # 共通ルール（Single Source of Truth）
├── template.instructions.md         # テンプレート方式
├── convert_html.instructions.md        # HTML方式
├── purpose-report.instructions.md   # 用途: 報告・提案
├── purpose-incident.instructions.md # 用途: 障害報告
├── purpose-lt.instructions.md       # 用途: LT
└── purpose-blog.instructions.md     # 用途: ブログ変換
```

---

## 命名規則

- 共通: `common.instructions.md`
- 方式別: `<method>.instructions.md`
- 用途別: `purpose-<type>.instructions.md`

---

## 追加するとき

1. 命名規則に従ってファイル作成
2. この README に追記
3. `AGENTS.md` の参照テーブルに追加
4. 関連エージェントの `## 参照` セクションに追加
