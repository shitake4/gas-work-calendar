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

### 1. Google App Scriptsの設定

```bash
$ clasp login
```

### 2. コードのアップロード

```bash
$ clasp push
```

### 3. トリガーの設定
1. 初回セットアップ: GAS上で setupTriggers() を手動実行
2. 設定変更時: TRIGGER_CONFIG を編集 → clasp push → setupTriggers() を実行
3. トリガー確認: listTriggers() を実行

設定例:
```gas
  // 毎日9時に実行
  { functionName: 'execute', type: 'everyDays', hour: 9, enabled: true }

  // 毎週月曜10時に実行
  { functionName: 'execute', type: 'everyWeeks', dayOfWeek: 1, hour: 10, enabled: true }

  // 5分ごとに実行
  { functionName: 'execute', type: 'everyMinutes', interval: 5, enabled: true }

  // 無効化（enabledをfalse）
  { functionName: 'execute', type: 'everyMonths', dayOfMonth: 1, hour: 9, enabled: false }
```

### 4. 権限の承認

初回実行時にGoogleカレンダーへのアクセス権限の承認が必要です。

## ファイル構成

```
├── calendar/
│   ├── CalendarSettings.gs         # 設定管理
│   ├── CalendarUtils.gs            # ユーティリティ関数
│   ├── CalendarEventBasic.gs       # 基本的な予定作成
│   ├── CalendarEventRecurring.gs   # 繰り返し予定作成
│   ├── CalendarEventBusinessDay.gs # 営業日予定作成
│   ├── CalendarReservationRunner.gs # 予約実行エントリ
│   └── CalendarReservationMain.gs   # 予約設定/実行用メイン
├── appsscript.json            # GAS設定
└── docs/
    └── calendar-event.md      # 詳細ドキュメント
```

## License

Gas Work Calendar is released under the MIT License. See the [LICENSE](LICENSE) file for details.
