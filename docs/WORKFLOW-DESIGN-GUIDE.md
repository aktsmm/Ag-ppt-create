# 汎用エージェントワークフロー設計ガイド

エージェントワークフローを設計する際の汎用原則。

> 📅 作成: 2025-12-14

---

## 設計原則

| 原則                  | 説明                                         | 適用例                          |
| --------------------- | -------------------------------------------- | ------------------------------- |
| **SSOT**              | 各ルールは 1 箇所のみで定義し、他は参照      | 確認フォーマット → 専用ファイル |
| **Agent vs Script**   | AI 判断が必要 → Agent、決定論的 → Script     | 翻訳 → Agent、検証 → Script     |
| **IR (中間表現)**     | エージェント間は JSON で疎結合               | content.json が共通言語         |
| **Fail Fast**         | エラーは早期検出、リトライ後エスカレーション | validate → build の順序         |
| **Human in the Loop** | 重要な決定はユーザー確認必須                 | PLAN フェーズでの承認           |
| **連続 ID**           | 選択肢は連続した ID で表現                   | A, B, C... で指定しやすく       |

---

## 汎用フロー構造

```
INIT → PLAN(確認) → EXTRACT → TRANSFORM → VALIDATE → BUILD → DONE
          ↑                                   │
          │         └────(FAIL→修正 最大N回)─┘
          │                    ↓
     ユーザー承認必須     ESCALATE(N回超)
```

### フェーズの役割

| フェーズ      | 責務                                  | 担当         |
| ------------- | ------------------------------------- | ------------ |
| **INIT**      | 入力検出、コンテキスト生成            | Script       |
| **PLAN**      | ユーザーに選択肢を提示し承認を得る    | Orchestrator |
| **EXTRACT**   | 入力からデータ抽出（並列可）          | Script       |
| **TRANSFORM** | データ変換・翻訳・要約（AI 判断必要） | Agent        |
| **VALIDATE**  | スキーマ・整合性検証                  | Script       |
| **BUILD**     | 最終成果物の生成                      | Script       |
| **DONE**      | 完了通知、成果物を開く                | Orchestrator |
| **ESCALATE**  | N 回失敗時の人間介入待ち              | Script       |

---

## エージェント設計テンプレート

### Orchestrator（状態管理）

```yaml
役割: 状態管理・計画・ヒアリング・リトライ制御
やること:
  - 入力分類
  - ユーザーへの選択肢提示
  - フェーズ遷移管理
  - リトライ/エスカレーション制御
やらないこと:
  - コンテンツ生成・翻訳
  - 検証
  - 成果物生成
```

### Worker Agent（作業系）

```yaml
役割: 特定の変換処理
入力: 明確に定義されたIR（JSON）
出力: 明確に定義されたIR（JSON）
必須要素:
  - 入力スキーマの参照
  - 出力スキーマの参照
  - エラー時の挙動
  - 想定外入力の処理方針
```

### Reviewer Agent（レビュー系）

```yaml
役割: 品質チェック
入力: 検証対象 + 検証基準
出力: PASS / WARN / FAIL + 詳細
判定基準:
  - PASS: エラー0、警告0
  - WARN: エラー0、警告1+ → ユーザー確認後続行
  - FAIL: エラー1+ → 差し戻し
```

---

## I/O 契約テンプレート

### ディレクトリ構造

```
input/           # ユーザー入力のみ（手動配置）
output_manifest/ # すべての中間生成物
output_final/    # 最終成果物
assets/          # 画像・リソース
templates/       # テンプレート（読み取り専用）
```

### ファイル命名規則

```
{YYYYMMDD}_{keyword}_{purpose}.{ext}
```

例: `20241214_copilot_private_use_content.json`

---

## 選択肢提示のベストプラクティス

### 連続 ID 方式

```markdown
| #     | 方式           | 特徴 |
| ----- | -------------- | ---- |
| **A** | テンプレート 1 | ...  |
| **B** | テンプレート 2 | ...  |
| **C** | pptxgenjs      | ...  |
| **D** | create_ja_pptx | ...  |
```

### 入力フォーマット

```
{枚数}{方式}
```

例: `2A`, `3C`, `全部`

### 動的要素と固定要素の分離

- **動的**: テンプレート数（A, B, ...）
- **固定**: その他方式（テンプレート数+1 から割当）

---

## エラー処理パターン

### リトライポリシー

```yaml
max_retries: 3
retry_interval: exponential_backoff
on_max_retries: escalate
```

### エスカレーション時の出力

```json
{
  "trace_id": "unique_id",
  "escalated_at": "ISO8601",
  "phase": "TRANSFORM",
  "reason": "API rate limit exceeded",
  "retry_count": 3,
  "resume_command": "python resume.py --from TRANSFORM"
}
```

---

## 検証スクリプトのベストプラクティス

### チェック項目

1. **スキーマ準拠**: JSON Schema で検証
2. **空コンテンツ検出**: 必須フィールドの存在確認
3. **参照整合性**: パスの存在確認
4. **キーワード検出**: タイトル内のキーワードも考慮
5. **文字数制限**: オーバーフロー防止

### 出力形式

```yaml
status: PASS | WARN | FAIL
errors: [...]
warnings: [...]
```

---

## 将来の拡張性

### 新エージェント追加時

1. `*.agent.md` を作成
2. 入出力スキーマを定義
3. Orchestrator のフロー図に追加
4. 必要なスクリプトを作成
5. TROUBLESHOOTING.md に想定される問題を追記

### 新方式追加時

1. スクリプト/ツールを追加
2. 選択肢テーブルに追記（連続 ID で）
3. plan-phase.instructions.md を更新
4. examples/ にサンプルを追加

---

## 参照

- [AGENTS.md](../AGENTS.md) - プロジェクト固有のエージェント定義
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - 問題と対策
