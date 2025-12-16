/**
 * カレンダー関連ユーティリティ関数
 */

/**
 * 現在の年月を取得（YYYY-MM形式）
 * @returns {string} 現在の年月（YYYY-MM形式）
 */
function getCurrentYearMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

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
 * @returns {string} フォーマット済み文字列（yyyy-MM-dd形式）
 */
function formatDate(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd');
}

/**
 * 日時をフォーマット
 * @param {Date} date - 日時
 * @returns {string} フォーマット済み文字列（yyyy-MM-dd HH:mm形式）
 */
function formatDateTime(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
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

/**
 * 曜日番号をCalendarApp.Weekdayに変換
 * @param {number} dayNumber - 曜日番号（0=日, 1=月, ..., 6=土）
 * @returns {CalendarApp.Weekday} CalendarApp.Weekday
 */
function getWeekday(dayNumber) {
  const weekdayMap = {
    0: CalendarApp.Weekday.SUNDAY,
    1: CalendarApp.Weekday.MONDAY,
    2: CalendarApp.Weekday.TUESDAY,
    3: CalendarApp.Weekday.WEDNESDAY,
    4: CalendarApp.Weekday.THURSDAY,
    5: CalendarApp.Weekday.FRIDAY,
    6: CalendarApp.Weekday.SATURDAY
  };
  return weekdayMap[dayNumber];
}

/**
 * リトライ付きで関数を実行
 * @param {Function} fn - 実行する関数
 * @param {number} [maxRetries=3] - 最大リトライ回数
 * @param {number} [initialDelayMs=1000] - 初回リトライ時の待機時間（ミリ秒）
 * @returns {*} 関数の戻り値
 * @throws {Error} 全てのリトライが失敗した場合
 */
function executeWithRetry(fn, maxRetries = 3, initialDelayMs = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return fn();
    } catch (error) {
      lastError = error;
      Logger.log(`API呼び出し失敗（試行 ${attempt}/${maxRetries}）: ${error.message}`);

      if (attempt < maxRetries) {
        // 指数バックオフ: 1秒、2秒、4秒...
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
        Logger.log(`${delayMs}ms後にリトライします...`);
        Utilities.sleep(delayMs);
      }
    }
  }

  throw new Error(`${maxRetries}回のリトライ後も失敗: ${lastError.message}`);
}

/**
 * 複数の予定を一括作成（バッチ処理）
 * @param {Array<Object>} reservations - 予約設定の配列
 * @param {Object} [batchOptions] - バッチ処理オプション
 * @param {number} [batchOptions.batchSize=10] - 1バッチあたりの処理数
 * @param {number} [batchOptions.batchDelayMs=1000] - バッチ間の待機時間（ミリ秒）
 * @param {number} [batchOptions.maxRetries=3] - 各予定作成の最大リトライ回数
 * @returns {Object} 結果 { success: boolean, results: Array, successCount: number, failureCount: number }
 */
function createEventsInBatch(reservations, batchOptions = {}) {
  const {
    batchSize = 10,
    batchDelayMs = 1000,
    maxRetries = 3
  } = batchOptions;

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  Logger.log(`バッチ処理開始: ${reservations.length}件の予約を処理します`);

  for (let i = 0; i < reservations.length; i++) {
    const reservation = reservations[i];

    try {
      // リトライ付きで予約作成を実行
      const result = executeWithRetry(() => {
        const executor = getReservationExecutor(reservation.type);
        if (!executor) {
          throw new Error(`不明な予約タイプ: ${reservation.type}`);
        }
        return executor(reservation);
      }, maxRetries);

      if (result.success) {
        successCount++;
        Logger.log(`予約作成成功 (${i + 1}/${reservations.length}): ${reservation.title}`);
      } else {
        failureCount++;
        Logger.log(`予約作成失敗 (${i + 1}/${reservations.length}): ${reservation.title} - ${result.error}`);
      }

      results.push({
        index: i,
        reservation: reservation,
        result: result
      });
    } catch (error) {
      failureCount++;
      Logger.log(`予約作成エラー (${i + 1}/${reservations.length}): ${reservation.title} - ${error.message}`);
      results.push({
        index: i,
        reservation: reservation,
        result: { success: false, error: error.message }
      });
    }

    // バッチ区切りでスリープ（最後のアイテムを除く）
    if ((i + 1) % batchSize === 0 && i < reservations.length - 1) {
      Logger.log(`バッチ処理: ${batchDelayMs}ms待機中...`);
      Utilities.sleep(batchDelayMs);
    }
  }

  Logger.log(`バッチ処理完了: 成功=${successCount}件, 失敗=${failureCount}件`);

  return {
    success: failureCount === 0,
    results: results,
    successCount: successCount,
    failureCount: failureCount
  };
}

/**
 * 予約タイプに応じた実行関数を返す
 * @param {string} type - 予約タイプ ('basic', 'date', 'recurring', 'businessDay')
 * @returns {Function|null} 実行関数
 */
function getReservationExecutor(type) {
  switch (type) {
    case 'basic':
      return createCalendarEvent;
    case 'date':
      return createCalendarEventByDate;
    case 'recurring':
      return createRecurringEvent;
    case 'businessDay':
      return createBusinessDayEvent;
    default:
      return null;
  }
}

/**
 * 既存イベントとの重複をチェック
 * 同一カレンダー上で、title, start日時, end日時, 終日フラグが一致するイベントが存在したら重複とみなす
 * @param {Object} options - チェックオプション
 * @param {string} options.title - タイトル
 * @param {Date} options.startTime - 開始日時
 * @param {Date} options.endTime - 終了日時（終日予定の場合はnull）
 * @param {boolean} options.allDay - 終日予定かどうか
 * @param {string} [options.calendarId] - カレンダーID
 * @returns {Object} 結果 { isDuplicate: boolean, existingEvent?: CalendarEvent }
 */
function checkDuplicateEvent(options) {
  try {
    const settings = getCalendarSettings();
    const calendarId = options.calendarId || settings.defaultCalendarId;
    const calendar = CalendarApp.getCalendarById(calendarId);

    if (!calendar) {
      Logger.log(`カレンダーが見つかりません: ${calendarId}`);
      return { isDuplicate: false };
    }

    const startTime = options.startTime;
    let endTime = options.endTime;

    // 検索範囲を設定（開始日時の前後1分程度でイベントを取得）
    const searchStart = new Date(startTime.getTime() - 60000);
    const searchEnd = new Date((endTime || startTime).getTime() + 60000);

    const existingEvents = calendar.getEvents(searchStart, searchEnd);

    for (const event of existingEvents) {
      const eventTitle = event.getTitle();
      const eventStart = event.getStartTime();
      const eventEnd = event.getEndTime();
      const eventAllDay = event.isAllDayEvent();

      // 終日予定フラグの一致確認
      if (eventAllDay !== options.allDay) {
        continue;
      }

      // タイトルの一致確認
      if (eventTitle !== options.title) {
        continue;
      }

      // 日時の一致確認
      if (options.allDay) {
        // 終日予定の場合は日付のみ比較
        const sameStartDate = eventStart.getFullYear() === startTime.getFullYear() &&
                              eventStart.getMonth() === startTime.getMonth() &&
                              eventStart.getDate() === startTime.getDate();
        if (sameStartDate) {
          Logger.log(`重複イベント検出: ${options.title} (${formatDate(startTime)})`);
          return { isDuplicate: true, existingEvent: event };
        }
      } else {
        // 通常予定の場合は日時を比較
        const sameStart = eventStart.getTime() === startTime.getTime();
        const sameEnd = eventEnd.getTime() === endTime.getTime();
        if (sameStart && sameEnd) {
          Logger.log(`重複イベント検出: ${options.title} (${formatDateTime(startTime)} - ${formatDateTime(endTime)})`);
          return { isDuplicate: true, existingEvent: event };
        }
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    Logger.log(`重複チェックエラー: ${error.message}`);
    return { isDuplicate: false };
  }
}
