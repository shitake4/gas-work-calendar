# Gas Work Calendar
![CI](https://github.com/shitake4/gas-work-calendar/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/github/license/shitake4/gas-work-calendar)
![Last Commit](https://img.shields.io/github/last-commit/shitake4/gas-work-calendar)
![Repo Size](https://img.shields.io/github/repo-size/shitake4/gas-work-calendar)

Google Apps Script (GAS) で
**営業日・指定日・繰り返し条件に基づいて Google カレンダーへ自動的に予定を作成するライブラリ**です。

- 月初・月末・第N営業日の自動予約
- 定期バッチ（時間トリガー）による自動実行
- clasp対応でローカル管理可能

詳細は [docs/calendar-event.md](docs/calendar-event.md) を参照してください。

## 想定ユースケース

- 月初・月末・営業日に定例作業の予定を自動登録したい
  - 勤怠、請求書申請を営業日で指定したい

## セットアップ

### 1. 依存パッケージのインストール

```bash
$ npm install
```

### 2. ビルド

```bash
$ npm run build
```

`src/` 配下のES Modulesコードから `bundle.gs` が生成されます。

### 3. Google App Scriptsの設定

```bash
$ clasp login
```

### 4. コードのアップロード

```bash
$ clasp push
```

### 5. トリガーの設定
1. 初回セットアップ: GAS上で `setupTriggers()` を手動実行
2. 設定変更時: `src/TriggerManager.js` の `TRIGGER_CONFIG` を編集 → `npm run build` → `clasp push` → `setupTriggers()` を実行
3. トリガー確認: `listTriggers()` を実行

設定例:
```javascript
// 毎日9時に実行
{ functionName: 'runCalendarReservations', type: 'everyDays', hour: 9, enabled: true }

// 毎週月曜10時に実行
{ functionName: 'runCalendarReservations', type: 'everyWeeks', dayOfWeek: 1, hour: 10, enabled: true }

// 5分ごとに実行
{ functionName: 'runCalendarReservations', type: 'everyMinutes', interval: 5, enabled: true }

// 無効化（enabledをfalse）
{ functionName: 'runCalendarReservations', type: 'everyMonths', dayOfMonth: 1, hour: 9, enabled: false }
```

### 6. 権限の承認

初回実行時にGoogleカレンダーへのアクセス権限の承認が必要です。

## ファイル構成

```
├── src/                          # ソースコード（ES Modules）
│   ├── index.js                  # エントリーポイント（グローバル登録）
│   ├── CalendarSettings.js       # 設定管理
│   ├── CalendarUtils.js          # ユーティリティ関数
│   ├── CalendarEventBasic.js     # 基本的な予定作成
│   ├── CalendarEventBusinessDay.js # 営業日予定作成
│   ├── CompanyHolidays.js        # 会社休日定義
│   ├── TriggerManager.js         # トリガー管理
│   ├── TriggerValidation.js      # トリガーバリデーション
│   └── EntryPoint.js             # 予約実行エントリ
├── tests/                        # テストコード
│   ├── mocks/
│   │   └── gas-api.js            # GAS API モック
│   ├── setup.js                  # テストセットアップ
│   └── *.test.js                 # テストファイル
├── scripts/
│   └── build.js                  # ビルドスクリプト
├── bundle.gs                     # 生成されるGASファイル（自動生成）
├── appsscript.json               # GAS設定
├── package.json
├── vitest.config.js
└── docs/
    └── calendar-event.md         # 詳細ドキュメント
```

## 開発・テスト

### 環境構築

```bash
$ npm install
```

### ビルド

```bash
# GAS用にバンドル
$ npm run build
```

`src/` 配下のES Modulesコードを `bundle.gs` にバンドルします。
esbuildを使用してIIFE形式で出力し、全関数をグローバルスコープに登録します。

### テストの実行

```bash
# テストを実行
$ npm test

# ウォッチモードでテストを実行（ファイル変更を監視）
$ npm run test:watch

# カバレッジレポート付きでテストを実行
$ npm run test:coverage
```

### 開発フロー

1. `src/` 配下のファイルを編集
2. `npm test` でテスト実行
3. `npm run build` でビルド
4. `clasp push` でGASにアップロード

### テスト構成

- **テストフレームワーク**: Vitest
- **テストファイル**: `tests/` ディレクトリ配下
- **モック**: `tests/mocks/gas-api.js` にGAS固有APIのモックを配置

GAS固有のAPI（`PropertiesService`, `CalendarApp`, `ScriptApp` など）はモック化してNode.js環境でテスト可能です。

### CI

GitHub Actionsでプッシュ・PR時に自動テストが実行されます。

## License

Gas Work Calendar is released under the MIT License. See the [LICENSE](LICENSE) file for details.
