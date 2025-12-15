/**
 * 営業日指定での予約作成機能
 */

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
 * 指定月の営業日数を取得
 * @param {string} yearMonth - 対象年月（YYYY-MM形式）
 * @param {string} [holidayCalendarId] - 祝日カレンダーID（任意）
 * @returns {Object} 結果 { success: boolean, count?: number, dates?: Date[], error?: string }
 */
function getBusinessDayCount(yearMonth, holidayCalendarId) {
  try {
    const yearMonthMatch = yearMonth.match(/^(\d{4})-(\d{2})$/);
    if (!yearMonthMatch) {
      throw new Error('対象年月はYYYY-MM形式で入力してください');
    }

    const year = parseInt(yearMonthMatch[1], 10);
    const month = parseInt(yearMonthMatch[2], 10);

    const settings = getCalendarSettings();
    const calendarId = holidayCalendarId || settings.holidayCalendarId;

    const holidays = getHolidaysInMonth(year, month, calendarId);
    const businessDays = getBusinessDaysInMonth(year, month, holidays);

    return {
      success: true,
      count: businessDays.length,
      dates: businessDays
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
