/**
 * カレンダー関連ユーティリティ関数
 */

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
