/**
 * カレンダー設定管理
 * スクリプトプロパティを使用した設定の取得・保存
 */

/**
 * スクリプトプロパティから設定を取得
 * @returns {Object} 設定オブジェクト
 */
export function getCalendarSettings() {
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
 * @param {string} [settings.defaultCalendarId] - デフォルトカレンダーID
 * @param {string} [settings.defaultTimeZone] - デフォルトタイムゾーン
 * @param {string} [settings.holidayCalendarId] - 祝日カレンダーID
 * @param {number} [settings.defaultReminderMinutes] - デフォルトリマインダー（分）
 */
export function setCalendarSettings(settings) {
  const props = PropertiesService.getScriptProperties();
  if (settings.defaultCalendarId) props.setProperty('DEFAULT_CALENDAR_ID', settings.defaultCalendarId);
  if (settings.defaultTimeZone) props.setProperty('DEFAULT_TIMEZONE', settings.defaultTimeZone);
  if (settings.holidayCalendarId) props.setProperty('HOLIDAY_CALENDAR_ID', settings.holidayCalendarId);
  if (settings.defaultReminderMinutes) props.setProperty('DEFAULT_REMINDER_MINUTES', String(settings.defaultReminderMinutes));
  Logger.log('Calendar settings updated');
}

/**
 * 設定を初期化（日本向けデフォルト値）
 */
export function initializeCalendarSettings() {
  setCalendarSettings({
    defaultCalendarId: 'primary',
    defaultTimeZone: 'Asia/Tokyo',
    holidayCalendarId: 'ja.japanese#holiday@group.v.calendar.google.com',
    defaultReminderMinutes: 30
  });
  Logger.log('Calendar settings initialized with Japanese defaults');
}
