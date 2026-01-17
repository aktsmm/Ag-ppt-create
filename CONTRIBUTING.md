# Contributing Guide

Ag-ppt-create へのコントリビュートをご検討いただきありがとうございます！

## ⚠️ 重要な注意事項

### ライセンスと著作権

本プロジェクトは **CC BY-NC-SA 4.0** ライセンスで公開されています。
コントリビュートする際は、以下を理解した上で行ってください：

1. **あなたの貢献は同じライセンス（CC BY-NC-SA 4.0）の下で提供されます**
2. **著作権は aktsmm に帰属します**
3. **商用利用・AI 学習データとしての使用は禁止されています**
4. **あなたが提出するコードは、あなた自身が作成したものであるか、適切にライセンスされたものである必要があります**

Pull Request を提出することで、これらの条件に同意したものとみなします。

### 第三者コードの取り扱い

- **他のプロジェクトからのコードコピーは厳禁です**
- 公式ドキュメント（python-pptx, PptxGenJS）を参考に独自実装してください
- Stack Overflow などのコードを使用する場合は、ライセンスを確認してください

### サプライチェーンセキュリティ

新しい依存パッケージを追加する場合：

1. **必要性の検討**: 本当に必要か、標準ライブラリで代替できないか検討
2. **パッケージの信頼性確認**:
   - ダウンロード数、メンテナンス状況を確認
   - 既知の脆弱性がないか `npm audit` / `pip-audit` で確認
3. **最小権限の原則**: 必要な機能のみを持つ軽量パッケージを選択
4. **バージョン固定**: `package-lock.json` / `requirements.txt` にバージョンを明記

```powershell
# 脆弱性チェック
npm audit
pip-audit
```

## 開発環境のセットアップ

```powershell
# リポジトリをクローン
git clone https://github.com/aktsmm/Ag-ppt-create.git
cd Ag-ppt-create

# Python 環境
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Node.js 環境
npm install
npx playwright install chromium
```

## ブランチ戦略

```
main          # 安定版
├── feature/* # 新機能
├── fix/*     # バグ修正
└── docs/*    # ドキュメント更新
```

## コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/) に従ってください。

```
feat: 新機能を追加
fix: バグを修正
docs: ドキュメントを更新
refactor: コードをリファクタリング
test: テストを追加・修正
chore: その他の変更
```

### 例

```
feat(convert_html): テーブルセル結合をサポート
fix(apply_content): 日本語文字化けを修正
docs(README): セットアップ手順を追加
```

## プルリクエストの手順

1. **Issue を確認**（または新規作成）
2. **ブランチを作成**
   ```powershell
   git checkout -b feature/your-feature-name
   ```
3. **変更を加える**
4. **テスト**

   ```powershell
   # Python スクリプトのテスト
   python scripts/extract_shapes.py templates/sample.pptx test.json

   # HTML → PPTX 変換のテスト
   node scripts/convert_html_multi.js workspace/slides/ test.pptx
   ```

5. **コミット & プッシュ**
   ```powershell
   git add .
   git commit -m "feat: 説明"
   git push origin feature/your-feature-name
   ```
6. **プルリクエストを作成**

## コーディング規約

### Python

- 型ヒント推奨
- Docstring は Google スタイル
- フォーマット: `black` 推奨

```python
def process_slide(slide: Slide, options: dict) -> dict:
    """スライドを処理する。

    Args:
        slide: 処理対象のスライド
        options: 処理オプション

    Returns:
        処理結果の辞書
    """
    pass
```

### JavaScript/Node.js

- ES Modules 使用
- async/await 使用
- コメントは英語

```javascript
/**
 * Convert HTML to PPTX slide
 * @param {string} htmlPath - Path to HTML file
 * @param {PptxGenJS} pptx - PptxGenJS instance
 * @returns {Promise<{slide, placeholders}>}
 */
async function convertHtmlToSlide(htmlPath, pptx) {
  // ...
}
```

### PowerShell

- コマンドは `;` で連結（`&&` は使用しない）

```powershell
# ✅ OK
Set-Location $dir; npm install

# ❌ NG
cd $dir && npm install
```

## ディレクトリ構造

```
.github/
├── agents/           # エージェント定義
├── instructions/     # ドメイン固有ルール
└── prompts/          # 再利用プロンプト
scripts/              # Python/Node.js スクリプト
templates/            # PPTX テンプレート
docs/                 # ドキュメント
output_ppt/           # 生成物（.gitignore）
output_manifest/      # 中間ファイル（.gitignore）
```

## エージェント開発

新しいエージェントを追加する場合：

1. `.github/agents/` に `{name}.agent.md` を作成
2. `AGENTS.md` に登録
3. 必要に応じて `.github/instructions/` にルールを追加

詳細は [AGENTS.md](AGENTS.md) を参照。

## 質問・相談

- **Issue**: バグ報告、機能リクエスト
- **Discussions**: 質問、アイデア共有

## ライセンス

コントリビュートしたコードは [MIT License](LICENSE) の下で公開されます。
