/**
 * トリガー管理
 * GASの時間主導型トリガーをコードで管理する
 */

/**
 * トリガー設定の定義
 * この配列を編集してトリガーを管理する
 *
 * 設定オプション:
 * - functionName: 実行する関数名（必須）
 * - type: トリガータイプ（必須）
 *   - 'everyMinutes': N分ごと (interval: 1, 5, 10, 15, 30)
 *   - 'everyHours': N時間ごと (interval: 1, 2, 4, 6, 8, 12)
 *   - 'everyDays': 毎日指定時刻 (hour: 0-23)
 *   - 'everyWeeks': 毎週指定曜日・時刻 (dayOfWeek: 0-6, hour: 0-23)
 *   - 'everyMonths': 毎月指定日・時刻 (dayOfMonth: 1-31, hour: 0-23)
 * - interval: 間隔（everyMinutes, everyHoursで使用）
 * - hour: 実行時刻（0-23）
 * - dayOfWeek: 曜日（0=日, 1=月, ..., 6=土）
 * - dayOfMonth: 日（1-31）
 * - enabled: 有効/無効（デフォルト: true）
 */
const TRIGGER_CONFIG = [
  {
    functionName: 'runCalendarReservations',
    type: 'everyMonths',
    dayOfMonth: 1,
    hour: 9,
    enabled: true
  }
];

/**
 * 設定に基づいてすべてのトリガーをセットアップ
 * 既存のトリガーは削除してから再作成する
 */
function setupTriggers() {
  Logger.log('========== トリガーセットアップ開始 ==========');

  // 管理対象の関数名リストを取得
  const managedFunctions = TRIGGER_CONFIG.map(config => config.functionName);

  // 既存の管理対象トリガーを削除
  deleteTriggersForFunctions(managedFunctions);

  // 有効な設定のみでトリガーを作成
  const enabledConfigs = TRIGGER_CONFIG.filter(config => config.enabled !== false);

  let successCount = 0;
  let failureCount = 0;

  for (const config of enabledConfigs) {
    try {
      createTriggerFromConfig(config);
      successCount++;
      Logger.log(`トリガー作成成功: ${config.functionName} (${config.type})`);
    } catch (error) {
      failureCount++;
      Logger.log(`トリガー作成失敗: ${config.functionName} - ${error.message}`);
    }
  }

  Logger.log('========== トリガーセットアップ完了 ==========');
  Logger.log(`成功: ${successCount} 件, 失敗: ${failureCount} 件`);

  return {
    success: failureCount === 0,
    successCount: successCount,
    failureCount: failureCount
  };
}

/**
 * 設定からトリガーを作成
 * @param {Object} config - トリガー設定
 */
function createTriggerFromConfig(config) {
  if (!config.functionName) {
    throw new Error('functionName は必須です');
  }
  if (!config.type) {
    throw new Error('type は必須です');
  }

  const builder = ScriptApp.newTrigger(config.functionName).timeBased();

  switch (config.type) {
    case 'everyMinutes':
      validateInterval(config.interval, [1, 5, 10, 15, 30], 'everyMinutes');
      builder.everyMinutes(config.interval);
      break;

    case 'everyHours':
      validateInterval(config.interval, [1, 2, 4, 6, 8, 12], 'everyHours');
      builder.everyHours(config.interval);
      break;

    case 'everyDays':
      validateHour(config.hour);
      builder.everyDays(1).atHour(config.hour);
      break;

    case 'everyWeeks':
      validateHour(config.hour);
      validateDayOfWeek(config.dayOfWeek);
      builder.everyWeeks(1).onWeekDay(getWeekDayEnum(config.dayOfWeek)).atHour(config.hour);
      break;

    case 'everyMonths':
      validateHour(config.hour);
      validateDayOfMonth(config.dayOfMonth);
      builder.onMonthDay(config.dayOfMonth).atHour(config.hour);
      break;

    default:
      throw new Error(`不明なトリガータイプ: ${config.type}`);
  }

  return builder.create();
}

/**
 * 指定された関数のトリガーをすべて削除
 * @param {string[]} functionNames - 削除対象の関数名配列
 */
function deleteTriggersForFunctions(functionNames) {
  const triggers = ScriptApp.getProjectTriggers();

  for (const trigger of triggers) {
    if (functionNames.includes(trigger.getHandlerFunction())) {
      ScriptApp.deleteTrigger(trigger);
      Logger.log(`既存トリガー削除: ${trigger.getHandlerFunction()}`);
    }
  }
}

/**
 * すべてのトリガーを削除
 */
function deleteAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  Logger.log(`${triggers.length} 件のトリガーを削除します`);

  for (const trigger of triggers) {
    ScriptApp.deleteTrigger(trigger);
    Logger.log(`トリガー削除: ${trigger.getHandlerFunction()}`);
  }

  Logger.log('すべてのトリガーを削除しました');
}

/**
 * 現在のトリガー一覧を表示
 */
function listTriggers() {
  const triggers = ScriptApp.getProjectTriggers();

  if (triggers.length === 0) {
    Logger.log('トリガーは設定されていません');
    return [];
  }

  Logger.log('========== 現在のトリガー一覧 ==========');

  const triggerList = triggers.map(trigger => {
    const info = {
      functionName: trigger.getHandlerFunction(),
      type: trigger.getEventType().toString(),
      uniqueId: trigger.getUniqueId()
    };
    Logger.log(`- ${info.functionName} (${info.type})`);
    return info;
  });

  return triggerList;
}

/**
 * 間隔のバリデーション
 */
function validateInterval(interval, validValues, type) {
  if (!validValues.includes(interval)) {
    throw new Error(`${type} の interval は ${validValues.join(', ')} のいずれかである必要があります`);
  }
}

/**
 * 時刻のバリデーション
 */
function validateHour(hour) {
  if (hour === undefined || hour < 0 || hour > 23) {
    throw new Error('hour は 0-23 の範囲で指定してください');
  }
}

/**
 * 曜日のバリデーション
 */
function validateDayOfWeek(dayOfWeek) {
  if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error('dayOfWeek は 0-6 の範囲で指定してください（0=日, 6=土）');
  }
}

/**
 * 日のバリデーション
 */
function validateDayOfMonth(dayOfMonth) {
  if (dayOfMonth === undefined || dayOfMonth < 1 || dayOfMonth > 31) {
    throw new Error('dayOfMonth は 1-31 の範囲で指定してください');
  }
}

/**
 * 曜日番号をScriptApp.WeekDayに変換
 * @param {number} dayNumber - 曜日番号（0=日, 1=月, ..., 6=土）
 * @returns {ScriptApp.WeekDay} WeekDay列挙値
 */
function getWeekDayEnum(dayNumber) {
  const weekDayMap = {
    0: ScriptApp.WeekDay.SUNDAY,
    1: ScriptApp.WeekDay.MONDAY,
    2: ScriptApp.WeekDay.TUESDAY,
    3: ScriptApp.WeekDay.WEDNESDAY,
    4: ScriptApp.WeekDay.THURSDAY,
    5: ScriptApp.WeekDay.FRIDAY,
    6: ScriptApp.WeekDay.SATURDAY
  };
  return weekDayMap[dayNumber];
}
