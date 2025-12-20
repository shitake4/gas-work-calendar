/**
 * トリガーバリデーション関数
 */

/**
 * 間隔のバリデーション
 * @param {number} interval - 間隔
 * @param {number[]} validValues - 有効な値の配列
 * @param {string} type - トリガータイプ
 * @throws {Error} 無効な間隔の場合
 */
export function validateInterval(interval, validValues, type) {
  if (!validValues.includes(interval)) {
    throw new Error(`${type} の interval は ${validValues.join(', ')} のいずれかである必要があります`);
  }
}

/**
 * 時刻のバリデーション
 * @param {number} hour - 時刻
 * @throws {Error} 無効な時刻の場合
 */
export function validateHour(hour) {
  if (hour === undefined || hour < 0 || hour > 23) {
    throw new Error('hour は 0-23 の範囲で指定してください');
  }
}

/**
 * 曜日のバリデーション
 * @param {number} dayOfWeek - 曜日（0-6）
 * @throws {Error} 無効な曜日の場合
 */
export function validateDayOfWeek(dayOfWeek) {
  if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error('dayOfWeek は 0-6 の範囲で指定してください（0=日, 6=土）');
  }
}

/**
 * 日のバリデーション
 * @param {number} dayOfMonth - 日（1-31）
 * @throws {Error} 無効な日の場合
 */
export function validateDayOfMonth(dayOfMonth) {
  if (dayOfMonth === undefined || dayOfMonth < 1 || dayOfMonth > 31) {
    throw new Error('dayOfMonth は 1-31 の範囲で指定してください');
  }
}
