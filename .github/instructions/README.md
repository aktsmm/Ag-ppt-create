# `.github/instructions` ディレクトリ

エージェントが参照するドメイン別ガイドライン集。`copilot-instructions.md` から適切な粒度で分割されたファイルです。

---

## ファイル一覧

### コア（★ 必須参照）

| ファイル                             | 説明                                          | 参照タイミング      |
| ------------------------------------ | --------------------------------------------- | ------------------- |
| `plan-phase.instructions.md`         | PLAN フェーズ確認プロセス（ユーザー承認必須） | PPTX 生成開始時     |
| `quality-guidelines.instructions.md` | 品質ガイドライン（空スライド禁止等）          | content.json 作成時 |
| `tools-reference.instructions.md`    | ツール使用ルール・フロー                      | スクリプト実行時    |
| `common.instructions.md`             | 命名規則・箇条書き・出力先                    | 全般                |

### 方式別

| ファイル                   | 説明                         | 参照エージェント |
| -------------------------- | ---------------------------- | ---------------- |
| `template.instructions.md` | テンプレートベース PPTX 生成 | Orchestrator     |
| `localize.instructions.md` | 英語 PPTX 日本語化           | Localizer        |

### 用途別

| ファイル                           | 説明                           | 参照エージェント |
| ---------------------------------- | ------------------------------ | ---------------- |
| `purpose-report.instructions.md`   | 報告・提案・説明プレゼン       | Orchestrator     |
| `purpose-incident.instructions.md` | 障害報告・インシデントレポート | Orchestrator     |
| `purpose-lt.instructions.md`       | LT（ライトニングトーク）       | Orchestrator     |
| `purpose-blog.instructions.md`     | ブログ記事からの変換           | Orchestrator     |

---

## 使い方

### copilot-instructions.md からの参照

`copilot-instructions.md` は簡潔に保ち、詳細はこれらのファイルを参照:

```markdown
詳細は [plan-phase.instructions.md](instructions/plan-phase.instructions.md) を参照。
```

### エージェントからの参照

```markdown
## 参照

- `.github/instructions/tools-reference.instructions.md`
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
