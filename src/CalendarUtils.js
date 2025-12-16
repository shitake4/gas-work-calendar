/**
 * カレンダー関連ユーティリティ関数
 */

/**
 * 現在の年月を取得（YYYY-MM形式）
 * @returns {string} 現在の年月（YYYY-MM形式）
 */
export function getCurrentYearMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 翌月の年月を取得（YYYY-MM形式）
 * @returns {string} 翌月の年月（YYYY-MM形式）
 */
export function getNextYearMonth() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const year = nextMonth.getFullYear();
  const month = String(nextMonth.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 日時をパース
 * @param {Date|string} dateTime - DateオブジェクトまたはISO 8601形式文字列
 * @returns {Date} Dateオブジェクト
 */
export function parseDateTime(dateTime) {
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
export function isValidDate(year, month, day) {
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
export function isValidTimeFormat(timeStr) {
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
export function buildEventOptions(options) {
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
export function formatDate(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd');
}

/**
 * 日時をフォーマット
 * @param {Date} date - 日時
 * @returns {string} フォーマット済み文字列（yyyy-MM-dd HH:mm形式）
 */
export function formatDateTime(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
}

/**
 * 指定月の営業日を取得
 * @param {number} year - 年
 * @param {number} month - 月（1-12）
 * @param {Date[]} holidays - 祝日の配列
 * @returns {Date[]} 営業日の配列
 */
export function getBusinessDaysInMonth(year, month, holidays) {
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
export function getWeekday(dayNumber) {
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
