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
    yearMonth: '2025-12',
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

/**
 * 使用例: 終日予定の作成（基本）
 */
function exampleAllDayEvent() {
  const result = createCalendarEvent({
    title: '社内研修',
    allDay: true,
    startDate: new Date(2025, 0, 15),
    description: '新人研修プログラム',
    location: '研修センター'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 複数日にわたる終日予定の作成
 */
function exampleMultiDayAllDayEvent() {
  const result = createCalendarEvent({
    title: '出張',
    allDay: true,
    startDate: new Date(2025, 0, 20),
    endDate: new Date(2025, 0, 22),
    description: '大阪出張（3日間）',
    location: '大阪支社'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 年月日指定での終日予定作成
 */
function exampleAllDayEventByDate() {
  const result = createCalendarEventByDate({
    year: 2025,
    month: 2,
    day: 11,
    allDay: true,
    title: '建国記念の日',
    description: '祝日'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 営業日指定での終日予定作成
 */
function exampleAllDayBusinessDayEvent() {
  const result = createBusinessDayEvent({
    yearMonth: '2025-03',
    businessDayType: 'last',
    allDay: true,
    title: '年度末棚卸',
    description: '年度末の在庫棚卸日'
  });
  Logger.log(JSON.stringify(result));
}

/**
 * 使用例: 複数予定の一括作成（バッチ処理）
 */
function exampleBatchEventCreation() {
  const reservations = [
    {
      type: 'businessDay',
      yearMonth: '2025-01',
      businessDayType: 'first',
      startTimeStr: '09:00',
      endTimeStr: '10:00',
      title: '1月 月初ミーティング'
    },
    {
      type: 'businessDay',
      yearMonth: '2025-01',
      businessDayType: 'last',
      startTimeStr: '17:00',
      endTimeStr: '18:00',
      title: '1月 月末締め'
    },
    {
      type: 'businessDay',
      yearMonth: '2025-02',
      businessDayType: 'first',
      startTimeStr: '09:00',
      endTimeStr: '10:00',
      title: '2月 月初ミーティング'
    },
    {
      type: 'date',
      year: 2025,
      month: 1,
      day: 15,
      startTimeStr: '14:00',
      endTimeStr: '15:00',
      title: '定期レビュー'
    }
  ];

  const result = createEventsInBatch(reservations, {
    batchSize: 2,       // 2件ごとにスリープ
    batchDelayMs: 500,  // 500ms待機
    maxRetries: 3       // 最大3回リトライ
  });

  Logger.log(`一括作成結果: 成功=${result.successCount}件, 失敗=${result.failureCount}件`);
}
