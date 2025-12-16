/**
 * 会社オリジナルの休日定義
 * 年ごとにYYYY-MM-DD形式の配列で管理する
 *
 * 使用例:
 * - 創立記念日
 * - 年末年始休業
 * - 特別休業日
 */

/**
 * 会社休日の定義
 * キー: 年（数値）
 * 値: YYYY-MM-DD形式の日付文字列の配列
 */
const COMPANY_HOLIDAYS = {
  2025: [
    '2025-12-29',  // 年末休業
    '2025-12-30',  // 年末休業
    '2025-12-31'   // 年末休業
  ],
  2026: [
    '2026-12-29',  // 年末休業
    '2026-12-30',  // 年末休業
    '2026-12-31'   // 年末休業
  ]
};

/**
 * 指定した年の会社休日を取得
 * @param {number} year - 年
 * @returns {Date[]} 会社休日のDate配列
 */
function getCompanyHolidaysForYear(year) {
  const holidayStrings = COMPANY_HOLIDAYS[year];

  if (!holidayStrings || holidayStrings.length === 0) {
    Logger.log(`警告: ${year}年の会社休日が定義されていません`);
    return [];
  }

  return holidayStrings.map(dateStr => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  });
}

/**
 * 指定月の会社休日を取得
 * @param {number} year - 年
 * @param {number} month - 月（1-12）
 * @returns {Date[]} 指定月の会社休日のDate配列
 */
function getCompanyHolidaysInMonth(year, month) {
  const yearHolidays = getCompanyHolidaysForYear(year);

  return yearHolidays.filter(date =>
    date.getFullYear() === year &&
    date.getMonth() === month - 1
  );
}

/**
 * 指定した日付が会社休日かどうかを判定
 * @param {Date} date - 判定対象の日付
 * @returns {boolean} 会社休日の場合true
 */
function isCompanyHoliday(date) {
  const year = date.getFullYear();
  const holidays = getCompanyHolidaysForYear(year);

  return holidays.some(holiday =>
    holiday.getFullYear() === date.getFullYear() &&
    holiday.getMonth() === date.getMonth() &&
    holiday.getDate() === date.getDate()
  );
}
