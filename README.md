# Gas Workhub

Google Apps Script を使った業務効率化ツール集です。

## 機能

### Googleカレンダー予約作成

Googleカレンダーに予定を作成する機能を提供します。

- **基本的な予約作成** - 日時指定での予定作成
- **年月日指定での予約作成** - 年/月/日と時刻を別々に指定
- **繰り返し予定の作成** - 毎日/毎週/毎月/毎年の繰り返し設定
- **営業日指定での予約作成** - 第1営業日、最終営業日、第N営業日に予定を作成

詳細は [docs/calendar-event.md](docs/calendar-event.md) を参照してください。

## セットアップ

### 1. プロジェクトの準備

```bash
# clasp でプロジェクトをプッシュ
clasp push
```

### 2. 初期設定

Google Apps Script エディタで `initializeCalendarSettings()` を実行して初期設定を行います。

```javascript
// デフォルト設定で初期化
initializeCalendarSettings();

// カスタム設定
setCalendarSettings({
  defaultCalendarId: 'your-calendar-id@group.calendar.google.com',
  defaultTimeZone: 'Asia/Tokyo',
  holidayCalendarId: 'ja.japanese#holiday@group.v.calendar.google.com',
  defaultReminderMinutes: 30
});
```

### 3. 権限の承認

初回実行時にGoogleカレンダーへのアクセス権限の承認が必要です。

## クイックスタート

### 基本的な予定作成

```javascript
const result = createCalendarEvent({
  title: 'ミーティング',
  startTime: new Date(2025, 0, 15, 10, 0),
  endTime: new Date(2025, 0, 15, 11, 0),
  description: '週次定例ミーティング',
  location: '会議室A'
});
```

### 毎週の繰り返し予定

```javascript
const result = createRecurringEvent({
  title: '週次レポート提出',
  startTime: new Date(2025, 0, 6, 9, 0),
  endTime: new Date(2025, 0, 6, 10, 0),
  recurrencePattern: 'weekly',
  weekdays: [1], // 月曜日
  count: 10
});
```

### 第1営業日の予定

```javascript
const result = createBusinessDayEvent({
  yearMonth: '2025-01',
  businessDayType: 'first',
  startTimeStr: '09:00',
  endTimeStr: '10:00',
  title: '月初ミーティング'
});
```

## ファイル構成

```
├── calendar/
│   ├── CalendarSettings.gs         # 設定管理
│   ├── CalendarUtils.gs            # ユーティリティ関数
│   ├── CalendarEventBasic.gs       # 基本的な予定作成
│   ├── CalendarEventRecurring.gs   # 繰り返し予定作成
│   ├── CalendarEventBusinessDay.gs # 営業日予定作成
│   └── CalendarEventExamples.gs    # 使用例
├── appsscript.json            # GAS設定
└── docs/
    └── calendar-event.md      # 詳細ドキュメント
```

## License

Gas Workhub is released under the MIT License. See the [LICENSE](LICENSE) file for details.
