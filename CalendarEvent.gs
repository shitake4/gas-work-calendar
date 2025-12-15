/**
 * Googleカレンダー予約作成機能
 *
 * 提供機能:
 * 1. 指定日時でのカレンダー予約作成
 * 2. 年月日指定での予約作成
 * 3. 繰り返し予定の作成
 * 4. 営業日指定での予約作成
 */

// ============================================================
// 設定管理
// ============================================================

/**
 * スクリプトプロパティから設定を取得
 * @returns {Object} 設定オブジェクト
 */
function getCalendarSettings() {
  const props = PropertiesService.getScriptProperties();
  return {
    defaultCalendarId: props.getProperty('DEFAULT_CALENDAR_ID') || 'primary',
    defaultTimeZone: props.getProperty('DEFAULT_TIMEZONE') || 'Asia/Tokyo',
    holidayCalendarId: props.getProperty('HOLIDAY_CALENDAR_ID') || 'ja.japanese#holiday@group.v.calendar.google.com',
    defaultReminderMinutes: parseInt(props.getProperty('DEFAULT_REMINDER_MINUTES') || '30', 10)
  };
}

/**
 * スクリプトプロパティに設定を保存
 * @param {Object} settings - 設定オブジェクト
 */
function setCalendarSettings(settings) {
  const props = PropertiesService.getScriptProperties();
  if (settings.defaultCalendarId) props.setProperty('DEFAULT_CALENDAR_ID', settings.defaultCalendarId);
  if (settings.defaultTimeZone) props.setProperty('DEFAULT_TIMEZONE', settings.defaultTimeZone);
  if (settings.holidayCalendarId) props.setProperty('HOLIDAY_CALENDAR_ID', settings.holidayCalendarId);
  if (settings.defaultReminderMinutes) props.setProperty('DEFAULT_REMINDER_MINUTES', String(settings.defaultReminderMinutes));
  Logger.log('Calendar settings updated');
}

// ============================================================
// 1. 指定日時でのカレンダー予約作成
// ============================================================

/**
 * 指定日時でカレンダー予約を作成
 * @param {Object} options - 予約オプション
 * @param {string} options.title - タイトル（必須）
 * @param {Date|string} options.startTime - 開始日時（必須）
 * @param {Date|string} options.endTime - 終了日時（必須）
 * @param {string} [options.description] - 説明（任意）
 * @param {string} [options.location] - 場所（任意）
 * @param {string[]} [options.guests] - 参加者メールアドレス（任意）
 * @param {Object} [options.reminder] - リマインダー設定（任意）
 * @param {string} [options.calendarId] - カレンダーID（任意）
 * @returns {Object} 作成結果 { success: boolean, eventId?: string, error?: string }
 */
function createCalendarEvent(options) {
  try {
    // 必須パラメータのバリデーション
    if (!options.title) {
      throw new Error('タイトルは必須です');
    }
    if (!options.startTime) {
      throw new Error('開始日時は必須です');
    }
    if (!options.endTime) {
      throw new Error('終了日時は必須です');
    }

    const settings = getCalendarSettings();
    const calendarId = options.calendarId || settings.defaultCalendarId;
    const calendar = CalendarApp.getCalendarById(calendarId);

    if (!calendar) {
      throw new Error(`カレンダーが見つかりません: ${calendarId}`);
    }

    // 日時のパース
    const startTime = parseDateTime(options.startTime);
    const endTime = parseDateTime(options.endTime);

    // 開始日時 < 終了日時 のバリデーション
    if (startTime >= endTime) {
      throw new Error('開始日時は終了日時より前である必要があります');
    }

    // イベントオプションの構築
    const eventOptions = {};
    if (options.description) {
      eventOptions.description = options.description;
    }
    if (options.location) {
      eventOptions.location = options.location;
    }
    if (options.guests && options.guests.length > 0) {
      eventOptions.guests = options.guests.join(',');
    }

    // イベント作成
    const event = calendar.createEvent(options.title, startTime, endTime, eventOptions);

    // リマインダー設定
    if (options.reminder) {
      event.removeAllReminders();
      if (options.reminder.email) {
        event.addEmailReminder(options.reminder.email);
      }
      if (options.reminder.popup) {
        event.addPopupReminder(options.reminder.popup);
      }
    } else {
      // デフォルトリマインダー
      event.removeAllReminders();
      event.addPopupReminder(settings.defaultReminderMinutes);
    }

    Logger.log(`予定を作成しました: ${options.title} (${event.getId()})`);
    return {
      success: true,
      eventId: event.getId(),
      eventUrl: event.getGuestList().length > 0 ? `https://calendar.google.com/calendar/event?eid=${encodeURIComponent(event.getId())}` : null
    };

  } catch (error) {
    Logger.log(`予定作成エラー: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================
// 2. 年月日指定での予約作成
// ============================================================

/**
 * 年月日と時刻を指定してカレンダー予約を作成
 * @param {Object} options - 予約オプション
 * @param {number} options.year - 年（必須、YYYY形式）
 * @param {number} options.month - 月（必須、1-12）
 * @param {number} options.day - 日（必須、1-31）
 * @param {string} options.startTimeStr - 開始時刻（必須、HH:mm形式）
 * @param {string} options.endTimeStr - 終了時刻（必須、HH:mm形式）
 * @param {string} options.title - タイトル（必須）
 * @param {string} [options.description] - 説明（任意）
 * @param {string} [options.location] - 場所（任意）
 * @param {string[]} [options.guests] - 参加者メールアドレス（任意）
 * @param {Object} [options.reminder] - リマインダー設定（任意）
 * @param {string} [options.calendarId] - カレンダーID（任意）
 * @returns {Object} 作成結果 { success: boolean, eventId?: string, error?: string }
 */
function createCalendarEventByDate(options) {
  try {
    // 必須パラメータのバリデーション
    if (options.year === undefined || options.month === undefined || options.day === undefined) {
      throw new Error('年月日は必須です');
    }
    if (!options.startTimeStr) {
      throw new Error('開始時刻は必須です');
    }
    if (!options.endTimeStr) {
      throw new Error('終了時刻は必須です');
    }
    if (!options.title) {
      throw new Error('タイトルは必須です');
    }

    // 日付のバリデーション（うるう年考慮）
    if (!isValidDate(options.year, options.month, options.day)) {
      throw new Error(`無効な日付です: ${options.year}年${options.month}月${options.day}日`);
    }

    // 時刻形式のバリデーション
    if (!isValidTimeFormat(options.startTimeStr)) {
      throw new Error(`無効な開始時刻形式です: ${options.startTimeStr}（HH:mm形式で入力してください）`);
    }
    if (!isValidTimeFormat(options.endTimeStr)) {
      throw new Error(`無効な終了時刻形式です: ${options.endTimeStr}（HH:mm形式で入力してください）`);
    }

    // 日時の構築
    const [startHour, startMinute] = options.startTimeStr.split(':').map(Number);
    const [endHour, endMinute] = options.endTimeStr.split(':').map(Number);

    const startTime = new Date(options.year, options.month - 1, options.day, startHour, startMinute);
    const endTime = new Date(options.year, options.month - 1, options.day, endHour, endMinute);

    // 基本関数を呼び出し
    return createCalendarEvent({
      title: options.title,
      startTime: startTime,
      endTime: endTime,
      description: options.description,
      location: options.location,
      guests: options.guests,
      reminder: options.reminder,
      calendarId: options.calendarId
    });

  } catch (error) {
    Logger.log(`予定作成エラー: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================
// 3. 繰り返し予定の作成
// ============================================================

/**
 * 繰り返し予定を作成
 * @param {Object} options - 予約オプション
 * @param {string} options.title - タイトル（必須）
 * @param {Date|string} options.startTime - 開始日時（必須）
 * @param {Date|string} options.endTime - 終了日時（必須）
 * @param {string} options.recurrencePattern - 繰り返しパターン（必須: 'daily', 'weekly', 'monthly', 'yearly'）
 * @param {number} [options.interval=1] - 繰り返し間隔
 * @param {number[]} [options.weekdays] - 曜日指定（weekly時: 0=日, 1=月, ..., 6=土）
 * @param {number} [options.monthDay] - 月の日付指定（monthly時）
 * @param {Object} [options.nthWeekday] - 第N曜日指定（monthly時）
 * @param {number} options.nthWeekday.week - 第N週（1-5）
 * @param {number} options.nthWeekday.day - 曜日（0=日, 1=月, ..., 6=土）
 * @param {Date|string} [options.until] - 終了日（終了条件）
 * @param {number} [options.count] - 繰り返し回数（終了条件）
 * @param {string} [options.description] - 説明（任意）
 * @param {string} [options.location] - 場所（任意）
 * @param {string[]} [options.guests] - 参加者メールアドレス（任意）
 * @param {Object} [options.reminder] - リマインダー設定（任意）
 * @param {string} [options.calendarId] - カレンダーID（任意）
 * @returns {Object} 作成結果 { success: boolean, eventId?: string, error?: string }
 */
function createRecurringEvent(options) {
  try {
    // 必須パラメータのバリデーション
    if (!options.title) {
      throw new Error('タイトルは必須です');
    }
    if (!options.startTime) {
      throw new Error('開始日時は必須です');
    }
    if (!options.endTime) {
      throw new Error('終了日時は必須です');
    }
    if (!options.recurrencePattern) {
      throw new Error('繰り返しパターンは必須です');
    }
    if (!options.until && !options.count) {
      throw new Error('終了条件（終了日または繰り返し回数）は必須です');
    }

    const validPatterns = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validPatterns.includes(options.recurrencePattern)) {
      throw new Error(`無効な繰り返しパターンです: ${options.recurrencePattern}`);
    }

    const settings = getCalendarSettings();
    const calendarId = options.calendarId || settings.defaultCalendarId;
    const calendar = CalendarApp.getCalendarById(calendarId);

    if (!calendar) {
      throw new Error(`カレンダーが見つかりません: ${calendarId}`);
    }

    // 日時のパース
    const startTime = parseDateTime(options.startTime);
    const endTime = parseDateTime(options.endTime);

    if (startTime >= endTime) {
      throw new Error('開始日時は終了日時より前である必要があります');
    }

    // 繰り返しルールの構築
    const recurrence = buildRecurrenceRule(options);

    // イベントシリーズの作成
    const eventSeries = calendar.createEventSeries(
      options.title,
      startTime,
      endTime,
      recurrence,
      buildEventOptions(options)
    );

    // リマインダー設定
    const events = eventSeries.getEvents(startTime, new Date(startTime.getTime() + 365 * 24 * 60 * 60 * 1000));
    if (events.length > 0) {
      const firstEvent = events[0];
      firstEvent.removeAllReminders();
      if (options.reminder) {
        if (options.reminder.email) {
          firstEvent.addEmailReminder(options.reminder.email);
        }
        if (options.reminder.popup) {
          firstEvent.addPopupReminder(options.reminder.popup);
        }
      } else {
        firstEvent.addPopupReminder(settings.defaultReminderMinutes);
      }
    }

    Logger.log(`繰り返し予定を作成しました: ${options.title}`);
    return {
      success: true,
      eventId: eventSeries.getId ? eventSeries.getId() : 'series-created'
    };

  } catch (error) {
    Logger.log(`繰り返し予定作成エラー: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 繰り返しルールを構築
 * @param {Object} options - オプション
 * @returns {CalendarApp.RecurrenceRule} 繰り返しルール
 */
function buildRecurrenceRule(options) {
  let rule;
  const interval = options.interval || 1;

  switch (options.recurrencePattern) {
    case 'daily':
      rule = CalendarApp.newRecurrence().addDailyRule().interval(interval);
      break;

    case 'weekly':
      rule = CalendarApp.newRecurrence().addWeeklyRule().interval(interval);
      if (options.weekdays && options.weekdays.length > 0) {
        const weekdayMap = {
          0: CalendarApp.Weekday.SUNDAY,
          1: CalendarApp.Weekday.MONDAY,
          2: CalendarApp.Weekday.TUESDAY,
          3: CalendarApp.Weekday.WEDNESDAY,
          4: CalendarApp.Weekday.THURSDAY,
          5: CalendarApp.Weekday.FRIDAY,
          6: CalendarApp.Weekday.SATURDAY
        };
        const weekdays = options.weekdays.map(d => weekdayMap[d]);
        rule = CalendarApp.newRecurrence().addWeeklyRule().interval(interval).onlyOnWeekdays(weekdays);
      }
      break;

    case 'monthly':
      if (options.nthWeekday) {
        // 第N曜日
        const weekdayMap = {
          0: CalendarApp.Weekday.SUNDAY,
          1: CalendarApp.Weekday.MONDAY,
          2: CalendarApp.Weekday.TUESDAY,
          3: CalendarApp.Weekday.WEDNESDAY,
          4: CalendarApp.Weekday.THURSDAY,
          5: CalendarApp.Weekday.FRIDAY,
          6: CalendarApp.Weekday.SATURDAY
        };
        rule = CalendarApp.newRecurrence()
          .addMonthlyRule()
          .interval(interval)
          .onlyOnWeekday(weekdayMap[options.nthWeekday.day])
          .weekStartsOn(CalendarApp.Weekday.SUNDAY);
      } else if (options.monthDay) {
        // 特定の日付
        rule = CalendarApp.newRecurrence()
          .addMonthlyRule()
          .interval(interval)
          .onlyOnMonthDay(options.monthDay);
      } else {
        rule = CalendarApp.newRecurrence().addMonthlyRule().interval(interval);
      }
      break;

    case 'yearly':
      rule = CalendarApp.newRecurrence().addYearlyRule().interval(interval);
      break;
  }

  // 終了条件の設定
  if (options.until) {
    const untilDate = parseDateTime(options.until);
    rule = rule.until(untilDate);
  } else if (options.count) {
    rule = rule.times(options.count);
  }

  return rule;
}

// ============================================================
// 4. 営業日指定での予約作成
// ============================================================

/**
 * 営業日指定でカレンダー予約を作成
 * @param {Object} options - 予約オプション
 * @param {string} options.yearMonth - 対象年月（必須、YYYY-MM形式）
 * @param {string} options.businessDayType - 営業日指定方法（'first', 'last', 'nth'）
 * @param {number} [options.nthDay] - 第N営業日（businessDayType='nth'時に必須）
 * @param {string} options.startTimeStr - 開始時刻（必須、HH:mm形式）
 * @param {string} options.endTimeStr - 終了時刻（必須、HH:mm形式）
 * @param {string} options.title - タイトル（必須）
 * @param {string} [options.description] - 説明（任意）
 * @param {string} [options.location] - 場所（任意）
 * @param {string[]} [options.guests] - 参加者メールアドレス（任意）
 * @param {Object} [options.reminder] - リマインダー設定（任意）
 * @param {string} [options.calendarId] - カレンダーID（任意）
 * @param {string} [options.holidayCalendarId] - 祝日カレンダーID（任意）
 * @returns {Object} 作成結果 { success: boolean, eventId?: string, businessDay?: Date, error?: string }
 */
function createBusinessDayEvent(options) {
  try {
    // 必須パラメータのバリデーション
    if (!options.yearMonth) {
      throw new Error('対象年月は必須です');
    }
    if (!options.businessDayType) {
      throw new Error('営業日指定方法は必須です');
    }
    if (options.businessDayType === 'nth' && !options.nthDay) {
      throw new Error('第N営業日の指定が必要です');
    }
    if (!options.startTimeStr) {
      throw new Error('開始時刻は必須です');
    }
    if (!options.endTimeStr) {
      throw new Error('終了時刻は必須です');
    }
    if (!options.title) {
      throw new Error('タイトルは必須です');
    }

    // 年月形式のバリデーション
    const yearMonthMatch = options.yearMonth.match(/^(\d{4})-(\d{2})$/);
    if (!yearMonthMatch) {
      throw new Error('対象年月はYYYY-MM形式で入力してください');
    }

    const year = parseInt(yearMonthMatch[1], 10);
    const month = parseInt(yearMonthMatch[2], 10);

    if (month < 1 || month > 12) {
      throw new Error('月は1-12の範囲で指定してください');
    }

    const validTypes = ['first', 'last', 'nth'];
    if (!validTypes.includes(options.businessDayType)) {
      throw new Error(`無効な営業日指定方法です: ${options.businessDayType}`);
    }

    // 時刻形式のバリデーション
    if (!isValidTimeFormat(options.startTimeStr)) {
      throw new Error(`無効な開始時刻形式です: ${options.startTimeStr}`);
    }
    if (!isValidTimeFormat(options.endTimeStr)) {
      throw new Error(`無効な終了時刻形式です: ${options.endTimeStr}`);
    }

    const settings = getCalendarSettings();
    const holidayCalendarId = options.holidayCalendarId || settings.holidayCalendarId;

    // 祝日を取得
    const holidays = getHolidaysInMonth(year, month, holidayCalendarId);

    // 営業日を取得
    const businessDays = getBusinessDaysInMonth(year, month, holidays);

    if (businessDays.length === 0) {
      throw new Error(`${year}年${month}月に営業日がありません`);
    }

    // 指定された営業日を取得
    let targetDate;
    switch (options.businessDayType) {
      case 'first':
        targetDate = businessDays[0];
        break;
      case 'last':
        targetDate = businessDays[businessDays.length - 1];
        break;
      case 'nth':
        if (options.nthDay < 1 || options.nthDay > businessDays.length) {
          throw new Error(`第${options.nthDay}営業日は存在しません（${year}年${month}月の営業日数: ${businessDays.length}日）`);
        }
        targetDate = businessDays[options.nthDay - 1];
        break;
    }

    // 日時の構築
    const [startHour, startMinute] = options.startTimeStr.split(':').map(Number);
    const [endHour, endMinute] = options.endTimeStr.split(':').map(Number);

    const startTime = new Date(targetDate);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(targetDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    // 基本関数を呼び出し
    const result = createCalendarEvent({
      title: options.title,
      startTime: startTime,
      endTime: endTime,
      description: options.description,
      location: options.location,
      guests: options.guests,
      reminder: options.reminder,
      calendarId: options.calendarId
    });

    if (result.success) {
      result.businessDay = targetDate;
      Logger.log(`営業日予定を作成しました: ${options.title} (${formatDate(targetDate)})`);
    }

    return result;

  } catch (error) {
    Logger.log(`営業日予定作成エラー: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 指定月の祝日を取得
 * @param {number} year - 年
 * @param {number} month - 月（1-12）
 * @param {string} holidayCalendarId - 祝日カレンダーID
 * @returns {Date[]} 祝日の配列
 */
function getHolidaysInMonth(year, month, holidayCalendarId) {
  try {
    const holidayCalendar = CalendarApp.getCalendarById(holidayCalendarId);
    if (!holidayCalendar) {
      Logger.log(`祝日カレンダーが見つかりません: ${holidayCalendarId}`);
      return [];
    }

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const events = holidayCalendar.getEvents(startOfMonth, endOfMonth);
    return events.map(event => {
      const date = event.getStartTime();
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    });
  } catch (error) {
    Logger.log(`祝日取得エラー: ${error.message}`);
    return [];
  }
}

/**
 * 指定月の営業日を取得
 * @param {number} year - 年
 * @param {number} month - 月（1-12）
 * @param {Date[]} holidays - 祝日の配列
 * @returns {Date[]} 営業日の配列
 */
function getBusinessDaysInMonth(year, month, holidays) {
  const businessDays = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    // 土日を除外
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    // 祝日を除外
    const isHoliday = holidays.some(holiday =>
      holiday.getFullYear() === date.getFullYear() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getDate() === date.getDate()
    );

    if (!isHoliday) {
      businessDays.push(date);
    }
  }

  return businessDays;
}

// ============================================================
// ユーティリティ関数
// ============================================================

/**
 * 日時をパース
 * @param {Date|string} dateTime - DateオブジェクトまたはISO 8601形式文字列
 * @returns {Date} Dateオブジェクト
 */
function parseDateTime(dateTime) {
  if (dateTime instanceof Date) {
    return dateTime;
  }

  const parsed = new Date(dateTime);
  if (isNaN(parsed.getTime())) {
    throw new Error(`無効な日時形式です: ${dateTime}`);
  }

  return parsed;
}

/**
 * 日付の妥当性チェック（うるう年考慮）
 * @param {number} year - 年
 * @param {number} month - 月（1-12）
 * @param {number} day - 日
 * @returns {boolean} 有効な日付かどうか
 */
function isValidDate(year, month, day) {
  if (month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}

/**
 * 時刻形式のバリデーション
 * @param {string} timeStr - 時刻文字列
 * @returns {boolean} 有効なHH:mm形式かどうか
 */
function isValidTimeFormat(timeStr) {
  const match = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return false;
  }

  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);

  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

/**
 * イベントオプションを構築
 * @param {Object} options - オプション
 * @returns {Object} イベントオプション
 */
function buildEventOptions(options) {
  const eventOptions = {};

  if (options.description) {
    eventOptions.description = options.description;
  }
  if (options.location) {
    eventOptions.location = options.location;
  }
  if (options.guests && options.guests.length > 0) {
    eventOptions.guests = options.guests.join(',');
  }

  return eventOptions;
}

/**
 * 日付をフォーマット
 * @param {Date} date - 日付
 * @returns {string} フォーマット済み文字列
 */
function formatDate(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd');
}

// ============================================================
// 使用例・テスト関数
// ============================================================

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
