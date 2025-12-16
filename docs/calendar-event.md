# Googleカレンダー予約作成機能

Googleカレンダーに予定を作成するための機能群です。

## 目次

- [設定](#設定)
- [関数一覧](#関数一覧)
- [予約設定メイン](#予約設定メイン)
- [1. 基本的な予定作成](#1-基本的な予定作成)
- [2. 年月日指定での予定作成](#2-年月日指定での予定作成)
- [3. 営業日指定での予定作成](#3-営業日指定での予定作成)
- [エラーハンドリング](#エラーハンドリング)
- [使用例](#使用例)

---

## 設定

### スクリプトプロパティ

以下の設定がスクリプトプロパティで管理されます：

| プロパティ名 | 説明 | デフォルト値 |
|------------|------|-------------|
| `DEFAULT_CALENDAR_ID` | デフォルトカレンダーID | `primary` |
| `DEFAULT_TIMEZONE` | タイムゾーン | `Asia/Tokyo` |
| `HOLIDAY_CALENDAR_ID` | 祝日カレンダーID | `ja.japanese#holiday@group.v.calendar.google.com` |
| `DEFAULT_REMINDER_MINUTES` | デフォルトリマインダー（分） | `30` |

### 設定の初期化

```javascript
// デフォルト設定で初期化
initializeCalendarSettings();
```

### 設定の変更

```javascript
setCalendarSettings({
  defaultCalendarId: 'your-calendar-id@group.calendar.google.com',
  defaultTimeZone: 'Asia/Tokyo',
  holidayCalendarId: 'ja.japanese#holiday@group.v.calendar.google.com',
  defaultReminderMinutes: 15
});
```

### 現在の設定確認

```javascript
showCurrentSettings();
// Logger に現在の設定が出力されます
```

---

## 関数一覧

| 関数名 | 説明 |
|-------|------|
| `createCalendarEvent(options)` | 日時指定で予定を作成 |
| `createCalendarEventByDate(options)` | 年月日+時刻で予定を作成 |
| `createBusinessDayEvent(options)` | 営業日指定で予定を作成 |
| `getBusinessDayCount(yearMonth)` | 指定月の営業日数を取得 |

---

## 予約設定メイン

`calendar/CalendarEntryPoint.gs` で、実行したい予約をまとめて設定できます。Java の `main` のように、この関数を実行すると有効な予約が一括で登録されます。

```javascript
function runCalendarReservations() {
  const reservations = [
    {
      type: 'basic',       // basic|date|recurring|businessDay
      enabled: true,       // true にすると実行対象
      options: {
        title: 'ミーティング',
        startTime: new Date(2025, 0, 15, 10, 0),
        endTime: new Date(2025, 0, 15, 11, 0)
      }
    }
  ];

  // enabled=true の予約のみが登録され、結果は Logger に出力されます。
}
```

---

## 1. 基本的な予定作成

### `createCalendarEvent(options)`

日時を直接指定して予定を作成します。

#### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `title` | string | ○ | イベントタイトル |
| `startTime` | Date \| string | ○ | 開始日時（DateまたはISO 8601形式） |
| `endTime` | Date \| string | ○ | 終了日時（DateまたはISO 8601形式） |
| `description` | string | - | イベントの説明 |
| `location` | string | - | 場所 |
| `guests` | string[] | - | 参加者メールアドレスの配列 |
| `reminder` | Object | - | リマインダー設定 |
| `reminder.email` | number | - | メールリマインダー（分前） |
| `reminder.popup` | number | - | ポップアップリマインダー（分前） |
| `calendarId` | string | - | カレンダーID（省略時はデフォルト） |

#### 戻り値

```javascript
{
  success: boolean,      // 成功/失敗
  eventId?: string,      // イベントID（成功時）
  eventUrl?: string,     // イベントURL（参加者がいる場合）
  error?: string         // エラーメッセージ（失敗時）
}
```

#### 使用例

```javascript
// 基本的な使用
const result = createCalendarEvent({
  title: 'ミーティング',
  startTime: new Date(2025, 0, 15, 10, 0),
  endTime: new Date(2025, 0, 15, 11, 0),
  description: '週次定例ミーティング',
  location: '会議室A'
});

// ISO 8601形式での指定
const result = createCalendarEvent({
  title: '打ち合わせ',
  startTime: '2025-01-15T10:00:00',
  endTime: '2025-01-15T11:00:00'
});

// 参加者とリマインダー付き
const result = createCalendarEvent({
  title: '重要会議',
  startTime: new Date(2025, 0, 20, 14, 0),
  endTime: new Date(2025, 0, 20, 16, 0),
  guests: ['user1@example.com', 'user2@example.com'],
  reminder: {
    email: 60,   // 60分前にメール
    popup: 30    // 30分前にポップアップ
  }
});
```

---

## 2. 年月日指定での予定作成

### `createCalendarEventByDate(options)`

年、月、日と時刻を別々に指定して予定を作成します。

#### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `year` | number | ○ | 年（YYYY形式） |
| `month` | number | ○ | 月（1-12） |
| `day` | number | ○ | 日（1-31） |
| `startTimeStr` | string | ○ | 開始時刻（HH:mm形式） |
| `endTimeStr` | string | ○ | 終了時刻（HH:mm形式） |
| `title` | string | ○ | イベントタイトル |
| `description` | string | - | イベントの説明 |
| `location` | string | - | 場所 |
| `guests` | string[] | - | 参加者メールアドレスの配列 |
| `reminder` | Object | - | リマインダー設定 |
| `calendarId` | string | - | カレンダーID |

#### バリデーション

- 日付の妥当性チェック（うるう年考慮）
- 時刻形式のバリデーション（HH:mm形式）

#### 使用例

```javascript
const result = createCalendarEventByDate({
  year: 2025,
  month: 2,        // 2月
  day: 29,         // うるう年でなければエラー
  startTimeStr: '14:00',
  endTimeStr: '15:30',
  title: '打ち合わせ',
  description: 'プロジェクトレビュー'
});
```

---

## 3. 営業日指定での予定作成

### `createBusinessDayEvent(options)`

営業日（土日祝を除く）を指定して予定を作成します。

#### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `yearMonth` | string | ○ | 対象年月（YYYY-MM形式） |
| `businessDayType` | string | ○ | 営業日指定方法（下記参照） |
| `nthDay` | number | △ | 第N営業日（nth時に必須） |
| `startTimeStr` | string | ○ | 開始時刻（HH:mm形式） |
| `endTimeStr` | string | ○ | 終了時刻（HH:mm形式） |
| `title` | string | ○ | イベントタイトル |
| `holidayCalendarId` | string | - | 祝日カレンダーID |
| その他 | - | - | `createCalendarEvent`と同様 |

#### 営業日指定方法

| 値 | 説明 |
|----|------|
| `first` | 第1営業日 |
| `last` | 最終営業日 |
| `nth` | 第N営業日（`nthDay`で指定） |

#### 祝日対応

デフォルトで日本の祝日カレンダーを使用します：
- 日本の祝日: `ja.japanese#holiday@group.v.calendar.google.com`

カスタム祝日カレンダーも指定可能です。

#### 戻り値

成功時は `businessDay` プロパティに実際の営業日が含まれます：

```javascript
{
  success: true,
  eventId: 'xxx',
  businessDay: Date  // 実際に予定が作成された日付
}
```

#### 使用例

```javascript
// 第1営業日
const result = createBusinessDayEvent({
  yearMonth: '2025-01',
  businessDayType: 'first',
  startTimeStr: '09:00',
  endTimeStr: '10:00',
  title: '月初ミーティング',
  description: '月初の全体ミーティング'
});

// 最終営業日
const result = createBusinessDayEvent({
  yearMonth: '2025-01',
  businessDayType: 'last',
  startTimeStr: '17:00',
  endTimeStr: '18:00',
  title: '月末締め会議'
});

// 第5営業日
const result = createBusinessDayEvent({
  yearMonth: '2025-01',
  businessDayType: 'nth',
  nthDay: 5,
  startTimeStr: '10:00',
  endTimeStr: '11:00',
  title: '経費申請締切'
});

// カスタム祝日カレンダー使用
const result = createBusinessDayEvent({
  yearMonth: '2025-01',
  businessDayType: 'first',
  startTimeStr: '09:00',
  endTimeStr: '10:00',
  title: '月初ミーティング',
  holidayCalendarId: 'custom-holidays@group.calendar.google.com'
});
```

### `getBusinessDayCount(yearMonth, holidayCalendarId)`

指定月の営業日数と営業日一覧を取得します。

```javascript
const result = getBusinessDayCount('2025-01');
// result.count: 営業日数
// result.dates: 営業日の配列
```

---

## エラーハンドリング

すべての関数は以下の形式でエラーを返します：

```javascript
{
  success: false,
  error: 'エラーメッセージ'
}
```

### 主なエラー

| エラー | 原因 |
|-------|------|
| `タイトルは必須です` | title が未指定 |
| `開始日時は終了日時より前である必要があります` | 開始 >= 終了 |
| `無効な日付です` | 存在しない日付（例: 2月30日） |
| `無効な時刻形式です` | HH:mm形式でない |
| `カレンダーが見つかりません` | 不正なカレンダーID |
| `第N営業日は存在しません` | 営業日数を超える指定 |

### エラー処理の例

```javascript
const result = createCalendarEvent({
  title: 'テスト',
  startTime: new Date(),
  endTime: new Date()
});

if (!result.success) {
  Logger.log(`エラー: ${result.error}`);
  // エラー処理
} else {
  Logger.log(`予定を作成しました: ${result.eventId}`);
}
```

---

## 使用例

`calendar/CalendarEventExamples.gs` に以下の使用例関数があります：

| 関数名 | 説明 |
|-------|------|
| `exampleBasicEvent()` | 基本的な予定作成 |
| `exampleDateEvent()` | 年月日指定での予定作成 |
| `exampleFirstBusinessDayEvent()` | 第1営業日 |
| `exampleLastBusinessDayEvent()` | 最終営業日 |
| `exampleNthBusinessDayEvent()` | 第5営業日 |
| `exampleEventWithReminder()` | リマインダー付き |
| `exampleGetBusinessDayCount()` | 営業日数の取得 |

これらの関数は Google Apps Script エディタから直接実行してテストできます。
