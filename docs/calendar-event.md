# Googleカレンダー予約作成機能

Googleカレンダーに予定を作成するための機能群です。

## 目次

- [設定](#設定)
- [関数一覧](#関数一覧)
- [予約タイプ](#予約タイプ)
- [終日予定（allDay）](#終日予定allday)
- [予約設定メイン](#予約設定メイン)
- [1. 年月日指定での予定作成](#1-年月日指定での予定作成)
- [2. 営業日指定での予定作成](#2-営業日指定での予定作成)
- [エラーハンドリング](#エラーハンドリング)
- [使用例](#使用例)

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

## 関数一覧

| 関数名 | 説明 |
|-------|------|
| `createCalendarEventByDate(options)` | 年月日+時刻で予定を作成 |
| `createBusinessDayEvent(options)` | 営業日指定で予定を作成 |
| `getBusinessDayCount(yearMonth)` | 指定月の営業日数を取得 |

## 予約タイプ

予約設定で使用できる `type` パラメータの一覧です。

| type | 説明 | 主な用途 |
|------|------|----------|
| `date` | 年月日+時刻を個別に指定して予定を作成 | 特定の日時に予定を入れたい場合 |
| `businessDay` | 営業日（土日祝除く）を指定して予定を作成 | 月初・月末・第N営業日に予定を入れたい場合 |

### 各タイプの必須パラメータ

#### `date` タイプ

```javascript
{
  type: 'date',
  title: 'プロジェクトレビュー',   // 必須
  year: 2025,                   // 必須
  month: 1,                     // 必須（1-12）
  day: 15,                      // 必須
  startTimeStr: '10:00',        // 必須（終日でない場合）
  endTimeStr: '11:00',          // 必須（終日でない場合）
  allDay: false                 // 任意（終日予定の場合 true）
}
```

#### `businessDay` タイプ

```javascript
{
  type: 'businessDay',
  title: '経費精算',             // 必須
  yearMonth: '2025-01',         // 必須（YYYY-MM形式）
  businessDayType: 'last',      // 必須（'first' | 'last' | 'nth'）
  nthDay: 5,                    // businessDayType='nth' の場合必須
  startTimeStr: '10:00',        // 必須（終日でない場合）
  endTimeStr: '11:00',          // 必須（終日でない場合）
  allDay: true                  // 任意（終日予定の場合 true）
}
```

## 終日予定（allDay）

`allDay: true` を指定すると、時刻指定なしの終日予定を作成できます。

### 特徴

- 開始・終了時刻の指定が不要
- Googleカレンダー上で「終日」として表示される
- 複数日にまたがる終日予定も作成可能

### 使用例

#### 基本的な終日予定

```javascript
// date タイプでの終日予定
{
  type: 'date',
  title: '創立記念日',
  year: 2025,
  month: 4,
  day: 1,
  allDay: true
}

// businessDay タイプでの終日予定
{
  type: 'businessDay',
  title: '月末締め作業',
  yearMonth: '2025-01',
  businessDayType: 'last',
  allDay: true
}
```

### 注意事項

- `allDay: true` の場合、`startTimeStr`/`endTimeStr` の時刻部分は無視されます
- `date` タイプで `allDay: true` の場合、`startTimeStr`/`endTimeStr` は省略可能です
- `businessDay` タイプで `allDay: true` の場合、`startTimeStr`/`endTimeStr` は省略可能です

## 予約設定メイン

`src/reservations.config.js` で、実行したい予約をまとめて設定できます。`runCalendarReservations()` を実行すると、設定した予約が一括で登録されます。

```javascript
export function getReservations(currentYearMonth, nextYearMonth) {
  return [
    {
      type: 'date',       // date|businessDay
      year: 2025,
      month: 1,
      day: 15,
      startTimeStr: '10:00',
      endTimeStr: '11:00',
      title: 'ミーティング'
    },
    {
      type: 'businessDay',
      yearMonth: currentYearMonth,
      businessDayType: 'last',
      allDay: true,
      title: '月末締め作業'
    }
  ];
}
```

## 1. 年月日指定での予定作成

### `createCalendarEventByDate(options)`

年、月、日と時刻を別々に指定して予定を作成します。

#### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `year` | number | ○ | 年（YYYY形式） |
| `month` | number | ○ | 月（1-12） |
| `day` | number | ○ | 日（1-31） |
| `startTimeStr` | string | △ | 開始時刻（HH:mm形式）※終日でない場合必須 |
| `endTimeStr` | string | △ | 終了時刻（HH:mm形式）※終日でない場合必須 |
| `title` | string | ○ | イベントタイトル |
| `allDay` | boolean | - | 終日予定の場合 `true` |
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

## 2. 営業日指定での予定作成

### `createBusinessDayEvent(options)`

営業日（土日祝を除く）を指定して予定を作成します。

#### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `yearMonth` | string | ○ | 対象年月（YYYY-MM形式） |
| `businessDayType` | string | ○ | 営業日指定方法（下記参照） |
| `nthDay` | number | △ | 第N営業日（nth時に必須） |
| `startTimeStr` | string | △ | 開始時刻（HH:mm形式）※終日でない場合必須 |
| `endTimeStr` | string | △ | 終了時刻（HH:mm形式）※終日でない場合必須 |
| `title` | string | ○ | イベントタイトル |
| `allDay` | boolean | - | 終日予定の場合 `true` |
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
const result = createCalendarEventByDate({
  year: 2025,
  month: 1,
  day: 15,
  startTimeStr: '10:00',
  endTimeStr: '10:00',  // 開始と同じ時刻はエラー
  title: 'テスト'
});

if (!result.success) {
  Logger.log(`エラー: ${result.error}`);
  // エラー処理
} else {
  Logger.log(`予定を作成しました: ${result.eventId}`);
}
```

## 使用例

以下のコードを Google Apps Script エディタで実行してテストできます：

### 年月日指定での予定作成

```javascript
const result = createCalendarEventByDate({
  year: 2025,
  month: 1,
  day: 20,
  startTimeStr: '14:00',
  endTimeStr: '15:00',
  title: 'プロジェクトレビュー'
});
Logger.log(result);
```

### 営業日指定での予定作成

```javascript
// 第1営業日
const result = createBusinessDayEvent({
  yearMonth: '2025-01',
  businessDayType: 'first',
  startTimeStr: '09:00',
  endTimeStr: '10:00',
  title: '月初ミーティング'
});
Logger.log(result);
```

### 営業日数の取得

```javascript
const result = getBusinessDayCount('2025-01');
Logger.log(`営業日数: ${result.count}`);
Logger.log(result.dates);
```
