# Security Policy / セキュリティポリシー

## Supported Versions / サポートバージョン

現在サポートされているバージョン：

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability / 脆弱性の報告

### English

If you discover a security vulnerability in this project, please follow these steps:

1. **DO NOT** open a public issue
2. Report privately through one of these methods:
   - GitHub Security Advisories (preferred)
   - Email to the maintainer (see GitHub profile)
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Best effort

### 日本語

本プロジェクトでセキュリティ脆弱性を発見した場合、以下の手順に従ってください：

1. 公開 Issue は**作成しないでください**
2. 以下のいずれかの方法でプライベートに報告してください：
   - GitHub Security Advisories（推奨）
   - メンテナーへのメール（GitHub プロフィール参照）
3. 以下の情報を含めてください：
   - 脆弱性の説明
   - 再現手順
   - 潜在的な影響
   - 修正案（もしあれば）

### 対応スケジュール

- **確認**: 48 時間以内
- **初期評価**: 7 日以内
- **修正期間**: 深刻度による
  - Critical（重大）: 7 日以内
  - High（高）: 14 日以内
  - Medium（中）: 30 日以内
  - Low（低）: ベストエフォート

## Known Security Considerations / 既知のセキュリティ考慮事項

### PowerShell Script Execution / PowerShell スクリプト実行

本プロジェクトは PowerShell スクリプトを使用します：

- ⚠️ 信頼できないソースからのスクリプトは実行しないでください
- ⚠️ Execution Policy を理解してから変更してください

### File Processing / ファイル処理

- ⚠️ 信頼できないソースからの PPTX ファイルには注意してください
- ⚠️ マクロを含む可能性のあるファイルの処理に注意してください

### Dependencies / 依存関係

定期的に依存パッケージを更新してください：

```powershell
# Python dependencies
pip install --upgrade -r requirements.txt

# Node.js dependencies
npm audit fix
```

## ⚠️ Supply Chain Risk / サプライチェーンリスク

本プロジェクトは外部モジュールに依存しています。使用前にリスクを認識してください。

### Node.js Dependencies (npm)

| Package        | Purpose                         | Risk Level | Notes                                           |
| -------------- | ------------------------------- | ---------- | ----------------------------------------------- |
| **playwright** | Browser automation (HTML→Image) | 🔴 High    | Large dependency tree, includes Chromium binary |
| **pptxgenjs**  | PPTX generation                 | 🟡 Medium  |                                                 |
| **sharp**      | Image processing                | 🟡 Medium  | Includes native binary                          |

### Python Dependencies (pip)

| Package         | Purpose                  | Risk Level | Notes               |
| --------------- | ------------------------ | ---------- | ------------------- |
| **python-pptx** | PPTX read/write          | 🟢 Low     | Widely used, stable |
| **Pillow**      | Image processing         | 🟢 Low     |                     |
| **six**         | Python 2/3 compatibility | 🟢 Low     |                     |

### Risk Mitigation / リスク軽減策

1. **定期監査**: 本番使用前に `npm audit` / `pip-audit` を実行
2. **ロックファイル**: `package-lock.json` を使用して依存バージョンを固定
3. **最小権限**: 必要最小限の権限で実行
4. **ネットワーク分離**: 可能であれば外部通信を制限

```powershell
# Audit commands
npm audit
pip-audit  # pip install pip-audit
```

## Security Best Practices / セキュリティベストプラクティス

### For Users / ユーザー向け

1. 常に最新バージョンを使用する
2. 信頼できるソースからのみファイルを処理する
3. 定期的に依存関係を更新する
4. 本番環境では適切な権限管理を行う

### For Contributors / コントリビューター向け

1. 機密情報をコミットしない（API キー、パスワード等）
2. 入力検証を適切に行う
3. ファイルパストラバーサル対策を実装する
4. 依存関係のセキュリティアラートに注意する

## Disclosure Policy / 開示ポリシー

- 脆弱性が修正されるまで、詳細は公開されません
- 修正後、適切なクレジットと共に脆弱性情報を公開します
- 報告者の匿名性を希望する場合は尊重します

## Out of Scope / スコープ外

以下は脆弱性として扱われません：

- サードパーティライブラリの既知の問題（python-pptx, PptxGenJS 等）
- ユーザーが作成した不正な入力ファイルによる問題
- 明示的にサポート対象外の環境での問題

---

**Thank you for helping keep Ag-ppt-create secure!**

**Ag-ppt-create のセキュリティ向上にご協力いただきありがとうございます！**
