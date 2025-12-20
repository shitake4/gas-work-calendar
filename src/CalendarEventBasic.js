/**
 * 基本的なカレンダー予約作成機能
 * - 指定日時でのカレンダー予約作成
 * - 年月日指定での予約作成
 */

import { getCalendarSettings } from './CalendarSettings.js';
import {
  parseDateTime,
  isValidDate,
  isValidTimeFormat,
  buildEventOptions,
  formatDate,
  formatDateTime
} from './CalendarUtils.js';

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
export function checkDuplicateEvent(options) {
  try {
    const settings = getCalendarSettings();
    const calendarId = options.calendarId || settings.defaultCalendarId;
    const calendar = CalendarApp.getCalendarById(calendarId);

    if (!calendar) {
      Logger.log(`カレンダーが見つかりません: ${calendarId}`);
      return { isDuplicate: false };
    }

    const startTime = options.startTime;
    const endTime = options.endTime;

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

/**
 * 指定日時でカレンダー予約を作成
 * @param {Object} options - 予約オプション
 * @param {string} options.title - タイトル（必須）
 * @param {Date|string} [options.startTime] - 開始日時（終日でない場合必須）
 * @param {Date|string} [options.endTime] - 終了日時（終日でない場合必須）
 * @param {boolean} [options.allDay] - 終日予定かどうか（任意）
 * @param {Date|string} [options.startDate] - 終日予定の開始日（終日の場合必須）
 * @param {Date|string} [options.endDate] - 終日予定の終了日（終日の場合任意、省略時は開始日と同じ）
 * @param {string} [options.description] - 説明（任意）
 * @param {string} [options.location] - 場所（任意）
 * @param {string[]} [options.guests] - 参加者メールアドレス（任意）
 * @param {Object} [options.reminder] - リマインダー設定（任意）
 * @param {number} [options.reminder.email] - メールリマインダー（分前）
 * @param {number} [options.reminder.popup] - ポップアップリマインダー（分前）
 * @param {string} [options.calendarId] - カレンダーID（任意）
 * @returns {Object} 作成結果 { success: boolean, eventId?: string, error?: string }
 */
function createCalendarEvent(options) {
  try {
    // 必須パラメータのバリデーション
    if (!options.title) {
      throw new Error('タイトルは必須です');
    }

    const isAllDay = options.allDay === true;

    if (isAllDay) {
      // 終日予定の場合
      if (!options.startDate && !options.startTime) {
        throw new Error('終日予定の場合、開始日（startDate）は必須です');
      }
    } else {
      // 通常予定の場合
      if (!options.startTime) {
        throw new Error('開始日時は必須です');
      }
      if (!options.endTime) {
        throw new Error('終了日時は必須です');
      }
    }

    const settings = getCalendarSettings();
    const calendarId = options.calendarId || settings.defaultCalendarId;
    const calendar = CalendarApp.getCalendarById(calendarId);

    if (!calendar) {
      throw new Error(`カレンダーが見つかりません: ${calendarId}`);
    }

    // 重複チェック用の日時を事前に準備
    let checkStartTime, checkEndTime;
    if (isAllDay) {
      checkStartTime = parseDateTime(options.startDate || options.startTime);
      checkEndTime = null;
    } else {
      checkStartTime = parseDateTime(options.startTime);
      checkEndTime = parseDateTime(options.endTime);
    }

    // 重複チェック
    const duplicateCheck = checkDuplicateEvent({
      title: options.title,
      startTime: checkStartTime,
      endTime: checkEndTime,
      allDay: isAllDay,
      calendarId: calendarId
    });

    if (duplicateCheck.isDuplicate) {
      Logger.log(`スキップ（重複）: ${options.title}`);
      return {
        success: true,
        skipped: true,
        reason: '同じ予定が既に存在します',
        existingEventId: duplicateCheck.existingEvent.getId()
      };
    }

    // イベントオプションの構築
    const eventOptions = buildEventOptions(options);

    let event;

    if (isAllDay) {
      // 終日予定の作成
      const startDate = checkStartTime;
      const endDate = options.endDate ? parseDateTime(options.endDate) : null;

      if (endDate) {
        // 複数日にわたる終日予定
        // CalendarApp.createAllDayEvent の endDate は翌日を指定する必要がある
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
        event = calendar.createAllDayEvent(options.title, startDate, adjustedEndDate, eventOptions);
      } else {
        // 1日のみの終日予定
        event = calendar.createAllDayEvent(options.title, startDate, eventOptions);
      }
    } else {
      // 通常予定の作成
      const startTime = checkStartTime;
      const endTime = checkEndTime;

      // 開始日時 < 終了日時 のバリデーション
      if (startTime >= endTime) {
        throw new Error('開始日時は終了日時より前である必要があります');
      }

      event = calendar.createEvent(options.title, startTime, endTime, eventOptions);
    }

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

/**
 * 年月日と時刻を指定してカレンダー予約を作成
 * @param {Object} options - 予約オプション
 * @param {number} options.year - 年（必須、YYYY形式）
 * @param {number} options.month - 月（必須、1-12）
 * @param {number} options.day - 日（必須、1-31）
 * @param {string} [options.startTimeStr] - 開始時刻（終日でない場合必須、HH:mm形式）
 * @param {string} [options.endTimeStr] - 終了時刻（終日でない場合必須、HH:mm形式）
 * @param {boolean} [options.allDay] - 終日予定かどうか（任意）
 * @param {string} options.title - タイトル（必須）
 * @param {string} [options.description] - 説明（任意）
 * @param {string} [options.location] - 場所（任意）
 * @param {string[]} [options.guests] - 参加者メールアドレス（任意）
 * @param {Object} [options.reminder] - リマインダー設定（任意）
 * @param {string} [options.calendarId] - カレンダーID（任意）
 * @returns {Object} 作成結果 { success: boolean, eventId?: string, error?: string }
 */
export function createCalendarEventByDate(options) {
  try {
    // 必須パラメータのバリデーション
    if (options.year === undefined || options.month === undefined || options.day === undefined) {
      throw new Error('年月日は必須です');
    }
    if (!options.title) {
      throw new Error('タイトルは必須です');
    }

    const isAllDay = options.allDay === true;

    // 終日予定でない場合は時刻が必須
    if (!isAllDay) {
      if (!options.startTimeStr) {
        throw new Error('開始時刻は必須です');
      }
      if (!options.endTimeStr) {
        throw new Error('終了時刻は必須です');
      }
    }

    // 日付のバリデーション（うるう年考慮）
    if (!isValidDate(options.year, options.month, options.day)) {
      throw new Error(`無効な日付です: ${options.year}年${options.month}月${options.day}日`);
    }

    if (isAllDay) {
      // 終日予定の場合
      const startDate = new Date(options.year, options.month - 1, options.day);

      return createCalendarEvent({
        title: options.title,
        allDay: true,
        startDate: startDate,
        description: options.description,
        location: options.location,
        guests: options.guests,
        reminder: options.reminder,
        calendarId: options.calendarId
      });
    } else {
      // 通常予定の場合

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
    }

  } catch (error) {
    Logger.log(`予定作成エラー: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}
