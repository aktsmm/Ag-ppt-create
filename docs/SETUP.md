# セットアップ手順

このドキュメントでは、Ag-ppt-create の環境構築手順を説明します。

> 💡 **AI で自動セットアップ:** GitHub Copilot（Agent モード + Claude Opus 4）でこのファイルを読み込ませると、以下の手順を自動実行できます。

## 前提条件

- **OS**: Windows 10/11（macOS/Linux でも動作可能）
- **Python**: 3.10 以上
- **Node.js**: 18 以上
- **VS Code**: GitHub Copilot 拡張機能（オプション）

## 1. リポジトリのクローン

```powershell
git clone https://github.com/aktsmm/Ag-ppt-create.git
cd Ag-ppt-create
```

## 2. Python 環境のセットアップ

### 仮想環境の作成（推奨）

```powershell
# 仮想環境を作成
python -m venv .venv

# 仮想環境を有効化
.venv\Scripts\Activate.ps1
```

### パッケージのインストール

```powershell
pip install -r requirements.txt
```

または個別にインストール：

```powershell
pip install python-pptx Pillow markitdown six
```

## 3. Node.js 環境のセットアップ

```powershell
npm install
```

### Playwright ブラウザのインストール（HTML→PPTX 変換用）

```powershell
npx playwright install chromium
```

> ✅ **セットアップ完了！** ここまでで全ての基本機能（テンプレート方式・pptxgenjs）が使用可能です。

---

## 4. オプション: LibreOffice のインストール

サムネイル生成機能 (`gen_preview.py`) を使用する場合は LibreOffice が必要です。

> 💡 **Note:** 基本的なワークフロー（テンプレート方式・pptxgenjs）では LibreOffice は不要です。サムネイル画像が必要な場合のみインストールしてください。

1. [LibreOffice 公式サイト](https://www.libreoffice.org/download/download/) からダウンロード
2. インストール後、`soffice` コマンドにパスを通す

```powershell
# 確認
soffice --version
```

## 5. 動作確認

### 🤖 Orchestrator エージェントを使う（推奨）

VS Code で GitHub Copilot の **Agent モード** を開き、**orchestrator** を選択して以下を入力：

```
この URL を PowerPoint にして
https://github.com/aktsmm/Ag-ppt-create/blob/master/docs/SETUP.md
```

または：

```
「Q3 売上報告」のプレゼンを作成して
```

> 💡 Orchestrator が PLAN フェーズで方式・枚数を提案し、ユーザー確認後に生成を開始します。

### 📋 手動で確認する場合（参考）

<details>
<summary>テンプレートから PPTX 生成</summary>

```powershell
# テンプレートのレイアウトを分析
.venv\Scripts\python.exe scripts/analyze_template.py templates/sample-ppf.pptx

# content.json から PPTX 生成
.venv\Scripts\python.exe scripts/create_from_template.py templates/sample-ppf.pptx workspace/content.example.json output_ppt/output.pptx
```

</details>

## トラブルシューティング

### `ModuleNotFoundError: No module named 'pptx'`

仮想環境が有効になっていない可能性があります：

```powershell
.venv\Scripts\Activate.ps1
```

### `playwright` がブラウザを見つけられない

Chromium をインストールしてください：

```powershell
npx playwright install chromium
```

### 日本語が文字化けする

`apply_content.py` は UTF-8 エンコーディングに対応しています。JSON ファイルが UTF-8 で保存されているか確認してください。

## ディレクトリ構成

```
Ag-ppt-create/
├── .github/           # Copilot 設定・エージェント定義
├── scripts/           # PPTX 操作ツール
│   ├── create_from_template.py # テンプレート→PPTX 生成（★ 推奨）
│   ├── create_ja_pptx.py       # 新規 PPTX 生成
│   ├── create_pptx.js          # pptxgenjs で PPTX 生成
│   ├── reconstruct_analyzer.py # 英語版PPTX → content.json 抽出
│   ├── analyze_template.py     # テンプレートレイアウト分析
│   ├── validate_content.py     # content.json 検証
│   └── gen_preview.py          # サムネイル生成
├── templates/         # PPTX テンプレート
├── output_ppt/        # 生成された PPTX 出力先
├── output_manifest/   # 中間生成物（content.json, layouts.json 等）
├── workspace/         # スキーマ定義
├── package.json       # Node.js 依存関係
└── requirements.txt   # Python 依存関係
```

## 次のステップ

- [README.md](../README.MD) - 基本的な使い方
- [AGENTS.md](../AGENTS.md) - AI エージェント定義
- `.github/instructions/` - 詳細なルール・ガイドライン

---

## 参考

手動で作業する場合も、各手順に従えば問題なく環境構築できます。
