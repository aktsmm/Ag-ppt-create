# `.github/agents` ディレクトリ

Copilot で扱う構造化エージェントのマニフェストを置く場所だよ。テンプレとしてこのフォルダをコピーする場合は、以下の手順でエージェントを追加してね。

1. `*.agent.md` 形式でエージェントを定義する。
2. `AGENTS.md` に行を追加して、ここに置いたマニフェストへリンクさせる。
3. 必要に応じて `.github/copilot-instructions.md` やチャットモードから読み込む。
4. runSubagent を使うときは「コンテキスト隔離」が主目的。計画 → 実装 → レビューのように工程を分ける用途に向いている一方、軽いタスクには向かないのでツール選択欄に書きすぎない。
5. runSubagent 自体は Copilot 側のビルトインツールで、ここに置く Markdown では「いつ runSubagent を呼び出すか」「サブエージェントへ何を渡すか」を記述するだけ。`tools: ["runSubagent", ...]` と書けば利用でき、別途 runSubagent 用ファイルを用意する必要はない。
6. 使い方の例: orchestrator.agent.md で `tools` に runSubagent を含め、本文で「#tool:runSubagent で issue.agent.md を呼び出し、要望を Issue に変換」と指示する。VS Code の Copilot Chat でそのエージェントを選んで話しかけると、runSubagent が裏で issue.agent.md 用のサブセッションを起動し、処理結果だけが戻る。

## 本プロジェクトのエージェント構成

PPTX 自動生成に特化した **3 エージェント + スクリプト群** 体制:

### 現行エージェント（AI 判断が必要なもののみ）

```
orchestrator.agent.md    # オーケストレーター（状態管理・計画・ヒアリング）
brainstormer.agent.md    # 壁打ち（インプット収集）
localizer.agent.md       # 翻訳（AI判断必須）
summarizer.agent.md      # 要約・再構成（AI判断必須）
json-reviewer.agent.md   # content.json レビュー（翻訳品質・構造） ★ 改名
pptx-reviewer.agent.md   # PPTX レビュー専用（視覚・ノート品質）
```

> ⚠️ `reviewer.agent.md` は `json-reviewer.agent.md` に改名・分離されました。

### スクリプト化されたもの（決定論的処理）

| 旧エージェント    | 代替スクリプト                |
| ----------------- | ----------------------------- |
| Router            | `classify_input.py`           |
| Template Analyzer | `analyze_template.py`         |
| Content Writer    | `reconstruct_analyzer.py`     |
| Notes Translator  | Localizer に統合              |
| Validator         | `validate_content.py`（補助） |
| Builder           | `create_from_template.py`     |

### 新規追加ツール

| ツール               | 用途                           |
| -------------------- | ------------------------------ |
| `classify_input.py`  | 入力分類・方式判定（純粋関数） |
| `workflow_tracer.py` | 観測性・トレースログ機能       |
| `resume_workflow.py` | エスカレーション後の再開       |

詳細は [AGENTS.md](../../AGENTS.md) を参照。

---

## 汎用的なエージェント設計ガイド

- runSubagent を用いたオーケストレーター設計では、エージェントごとに Job Responsibility (やること) と Non-goal (やらないこと) を必ず明記しよう。
- ファイル構成の一例（汎用）:

  ```
  orchestrator.agent.md  # 進行管理のみ。コード編集は禁止。
  issue.agent.md         # 要望の解像度を高め Issue を生成
  plan.agent.md          # 既存コード調査と設計
  impl.agent.md          # TDD ベースで実装＆テスト
  review.agent.md        # コードレビュー＆リワーク依頼
  pr.agent.md            # PR 作成と最終報告
  ```

  プロジェクトによって最適な役割は変わるため、必要なファイルだけ選んでね。

- 各ファイルをモジュール化することで単体呼び出しや差し替えが簡単になる。issue.agent.md だけ別ブランチで改善する、などの運用がしやすい。
- オーケストレーターには「サブエージェント定義を勝手に改変しない」「ユーザー意図を自力で補わない」といった禁止ルールを書き、責任境界を明文化しておくと暴走しにくい。
- /dev/null へのリダイレクトや無限ループを避ける警告文を `tools` セクションの下に入れておくと、自動実行でも中断しづらい。
