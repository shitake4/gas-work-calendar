/**
 * 予約登録のメインエントリ
 * Java の main 相当として、登録したい予約をこのファイルで設定する
 */

/**
 * 予約をまとめて登録する
 * - 下の reservations 配列に登録したい予約を追加して実行
 */
function runCalendarReservations() {
  const reservations = [
    {
      type: 'businessDay',
      options: {
        yearMonth: '2025-12',
        businessDayType: 'last',
        startTimeStr: '09:00',
        endTimeStr: '10:00',
        title: '経費精算'
      }
    }
  ];

  if (reservations.length === 0) {
    Logger.log('有効な予約がありません。reservations 配列で enabled を true に設定してください。');
    return;
  }

  const results = reservations.map(item => {
    const executor = getReservationExecutor(item.type);
    if (!executor) {
      Logger.log(`未対応の予約タイプです: ${item.type}`);
      return { success: false, error: `未対応の予約タイプ: ${item.type}` };
    }
    return executor(item.options);
  });

  Logger.log(`予約登録が完了しました。成功: ${results.filter(r => r.success).length} 件 / 失敗: ${results.filter(r => !r.success).length} 件`);
}

/**
 * 予約タイプに応じた実行関数を返す
 * @param {string} type 予約タイプ（basic|date|recurring|businessDay）
 * @returns {Function|null} 実行関数
 */
function getReservationExecutor(type) {
  const executors = {
    basic: createCalendarEvent,
    date: createCalendarEventByDate,
    recurring: createRecurringEvent,
    businessDay: createBusinessDayEvent
  };
  return executors[type] || null;
}
