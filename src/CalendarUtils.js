/**
 * カレンダー関連ユーティリティ関数
 */

import { getCompanyHolidaysInMonth } from './CompanyHolidays.js';

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
 * 指定月の祝日を取得（法定休日のみ）
 * @param {number} year - 年
 * @param {number} month - 月（1-12）
 * @param {string} holidayCalendarId - 祝日カレンダーID
 * @returns {Date[]} 祝日の配列
 */
export function getPublicHolidaysInMonth(year, month, holidayCalendarId) {
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
 * 指定月の全休日を取得（法定休日 + 会社休日）
 * @param {number} year - 年
 * @param {number} month - 月（1-12）
 * @param {string} holidayCalendarId - 祝日カレンダーID
 * @returns {Date[]} 休日の配列（重複なし）
 */
export function getHolidaysInMonth(year, month, holidayCalendarId) {
  // 法定休日を取得
  const publicHolidays = getPublicHolidaysInMonth(year, month, holidayCalendarId);

  // 会社休日を取得
  const companyHolidays = getCompanyHolidaysInMonth(year, month);

  // 重複を除いて結合
  const allHolidays = [...publicHolidays];

  for (const companyHoliday of companyHolidays) {
    const isDuplicate = allHolidays.some(holiday =>
      holiday.getFullYear() === companyHoliday.getFullYear() &&
      holiday.getMonth() === companyHoliday.getMonth() &&
      holiday.getDate() === companyHoliday.getDate()
    );

    if (!isDuplicate) {
      allHolidays.push(companyHoliday);
    }
  }

  return allHolidays;
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

/**
 * リトライ付きで関数を実行
 * @param {Function} fn - 実行する関数
 * @param {number} [maxRetries=3] - 最大リトライ回数
 * @param {number} [initialDelayMs=1000] - 初回リトライ時の待機時間（ミリ秒）
 * @returns {*} 関数の戻り値
 * @throws {Error} 全てのリトライが失敗した場合
 */
export function executeWithRetry(fn, maxRetries = 3, initialDelayMs = 1000) {
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
