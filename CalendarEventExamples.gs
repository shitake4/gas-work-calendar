/**
 * カレンダー予約作成の使用例・テスト関数
 */

/**
 * 使用例: 基本的な予定作成
 */
function exampleBasicEvent() {
  const result = createCalendarEvent({
    title: 'ミーティング',
    startTime: new Date(2025, 0, 15, 10, 0),
    endTime: new Date(2025, 0, 15, 11, 0),
    description: '週次定例ミーティング',
    location: '会議室A',
    guests: ['example@example.com']
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 年月日指定での予定作成
 */
function exampleDateEvent() {
  const result = createCalendarEventByDate({
    year: 2025,
    month: 1,
    day: 20,
    startTimeStr: '14:00',
    endTimeStr: '15:30',
    title: '打ち合わせ',
    description: 'プロジェクトレビュー'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 毎週月曜日の繰り返し予定
 */
function exampleWeeklyEvent() {
  const result = createRecurringEvent({
    title: '週次レポート提出',
    startTime: new Date(2025, 0, 6, 9, 0),
    endTime: new Date(2025, 0, 6, 10, 0),
    recurrencePattern: 'weekly',
    weekdays: [1], // 月曜日
    count: 10,
    description: '週次レポートの提出日'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 毎週月・水・金の繰り返し予定
 */
function exampleMultipleWeekdaysEvent() {
  const result = createRecurringEvent({
    title: '朝会',
    startTime: new Date(2025, 0, 6, 9, 0),
    endTime: new Date(2025, 0, 6, 9, 30),
    recurrencePattern: 'weekly',
    weekdays: [1, 3, 5], // 月・水・金
    until: new Date(2025, 2, 31), // 3月末まで
    description: '毎週月・水・金の朝会'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 2週間ごとの繰り返し予定
 */
function exampleBiweeklyEvent() {
  const result = createRecurringEvent({
    title: '隔週定例',
    startTime: new Date(2025, 0, 6, 14, 0),
    endTime: new Date(2025, 0, 6, 15, 0),
    recurrencePattern: 'weekly',
    interval: 2, // 2週間ごと
    count: 20,
    description: '2週間ごとの定例ミーティング'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 毎月第1金曜日の繰り返し予定
 */
function exampleMonthlyNthWeekdayEvent() {
  const result = createRecurringEvent({
    title: '月次会議',
    startTime: new Date(2025, 0, 3, 15, 0),
    endTime: new Date(2025, 0, 3, 17, 0),
    recurrencePattern: 'monthly',
    nthWeekday: { week: 1, day: 5 }, // 第1金曜日
    until: new Date(2025, 11, 31),
    description: '月次経営会議'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 毎月15日の繰り返し予定
 */
function exampleMonthlyDateEvent() {
  const result = createRecurringEvent({
    title: '経費精算締切',
    startTime: new Date(2025, 0, 15, 12, 0),
    endTime: new Date(2025, 0, 15, 13, 0),
    recurrencePattern: 'monthly',
    monthDay: 15,
    count: 12, // 1年分
    description: '毎月15日の経費精算締切'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 毎日の繰り返し予定
 */
function exampleDailyEvent() {
  const result = createRecurringEvent({
    title: '日報記入',
    startTime: new Date(2025, 0, 6, 17, 30),
    endTime: new Date(2025, 0, 6, 18, 0),
    recurrencePattern: 'daily',
    count: 30, // 30日間
    description: '毎日の日報記入リマインダー'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 毎年の繰り返し予定（記念日など）
 */
function exampleYearlyEvent() {
  const result = createRecurringEvent({
    title: '創立記念日',
    startTime: new Date(2025, 3, 1, 0, 0),
    endTime: new Date(2025, 3, 1, 23, 59),
    recurrencePattern: 'yearly',
    count: 10, // 10年分
    description: '会社創立記念日'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 第1営業日の予定作成
 */
function exampleFirstBusinessDayEvent() {
  const result = createBusinessDayEvent({
    yearMonth: '2025-01',
    businessDayType: 'first',
    startTimeStr: '09:00',
    endTimeStr: '10:00',
    title: '月初ミーティング',
    description: '月初の全体ミーティング'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 最終営業日の予定作成
 */
function exampleLastBusinessDayEvent() {
  const result = createBusinessDayEvent({
    yearMonth: '2025-01',
    businessDayType: 'last',
    startTimeStr: '17:00',
    endTimeStr: '18:00',
    title: '月末締め会議',
    description: '月末の締め処理確認'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 第5営業日の予定作成
 */
function exampleNthBusinessDayEvent() {
  const result = createBusinessDayEvent({
    yearMonth: '2025-01',
    businessDayType: 'nth',
    nthDay: 5,
    startTimeStr: '10:00',
    endTimeStr: '11:00',
    title: '経費申請締切',
    description: '経費申請の締切日'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: リマインダー付きの予定作成
 */
function exampleEventWithReminder() {
  const result = createCalendarEvent({
    title: '重要会議',
    startTime: new Date(2025, 0, 20, 10, 0),
    endTime: new Date(2025, 0, 20, 12, 0),
    description: '役員会議',
    location: '本社会議室',
    reminder: {
      email: 60,  // 60分前にメールリマインダー
      popup: 30   // 30分前にポップアップリマインダー
    }
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 営業日数の取得
 */
function exampleGetBusinessDayCount() {
  const result = getBusinessDayCount('2025-01');
  Logger.log(`2025年1月の営業日数: ${result.count}日`);
  if (result.dates) {
    result.dates.forEach((date, index) => {
      Logger.log(`  第${index + 1}営業日: ${formatDate(date)}`);
    });
  }
}
