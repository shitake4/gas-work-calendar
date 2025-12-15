/**
 * 繰り返し予定の作成機能
 */

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
        const weekdays = options.weekdays.map(d => getWeekday(d));
        rule = CalendarApp.newRecurrence().addWeeklyRule().interval(interval).onlyOnWeekdays(weekdays);
      }
      break;

    case 'monthly':
      if (options.nthWeekday) {
        // 第N曜日
        rule = CalendarApp.newRecurrence()
          .addMonthlyRule()
          .interval(interval)
          .onlyOnWeekday(getWeekday(options.nthWeekday.day))
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
