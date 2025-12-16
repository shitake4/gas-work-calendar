# Gas Workhub

Googleカレンダーに予定を作成する機能を提供します。

- **基本的な予約作成** - 日時指定での予定作成
- **年月日指定での予約作成** - 年/月/日と時刻を別々に指定
- **営業日指定での予約作成** - 第1営業日、最終営業日、第N営業日に予定を作成

詳細は [docs/calendar-event.md](docs/calendar-event.md) を参照してください。

## セットアップ

### 1. プロジェクトの準備

```bash
# clasp でプロジェクトをプッシュ
clasp push
```

### 2. トリガーの設定
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

### 3. 権限の承認

初回実行時にGoogleカレンダーへのアクセス権限の承認が必要です。

## ファイル構成

```
├── calendar/
│   ├── CalendarSettings.gs         # 設定管理
│   ├── CalendarUtils.gs            # ユーティリティ関数
│   ├── CalendarEventBasic.gs       # 基本的な予定作成
│   ├── CalendarEventRecurring.gs   # 繰り返し予定作成
│   ├── CalendarEventBusinessDay.gs # 営業日予定作成
│   ├── CalendarEventExamples.gs    # 使用例
│   ├── CalendarReservationRunner.gs # 予約実行エントリ
│   └── CalendarReservationMain.gs   # 予約設定/実行用メイン
├── appsscript.json            # GAS設定
└── docs/
    └── calendar-event.md      # 詳細ドキュメント
```

## License

Gas Workhub is released under the MIT License. See the [LICENSE](LICENSE) file for details.
