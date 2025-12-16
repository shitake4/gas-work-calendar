/**
 * 予約をまとめて登録する（バッチ処理対応）
 * - 下の reservations 配列に登録したい予約を追加して実行
 * - バッチ処理によりAPI呼び出し制限を考慮
 * - 各予約作成にはリトライ機能付き
 */
function runCalendarReservations() {
  // 実行時の年月を自動取得（当月と翌月）
  const currentYearMonth = getCurrentYearMonth();
  const nextYearMonth = getNextYearMonth();
  Logger.log(`対象年月: ${currentYearMonth}, ${nextYearMonth}`);

  // 登録する予約の配列
  // type: 'basic' | 'date' | 'recurring' | 'businessDay'
  const reservations = [
    // 当月の予約
    {
      type: 'businessDay',
      yearMonth: currentYearMonth,
      businessDayType: 'last',
      allDay: true,
      title: '経費精算'
    },
    // 翌月の予約
    {
      type: 'businessDay',
      yearMonth: nextYearMonth,
      businessDayType: 'last',
      allDay: true,
      title: '経費精算'
    }
  ];

  if (reservations.length === 0) {
    Logger.log('有効な予約がありません。reservations 配列に予約を追加してください。');
    return;
  }

  // バッチ処理オプション
  const batchOptions = {
    batchSize: 10,      // 10件ごとにスリープを挿入
    batchDelayMs: 1000, // バッチ間の待機時間（1秒）
    maxRetries: 3       // 各予定作成の最大リトライ回数
  };

  // バッチ処理で予約を登録
  const batchResult = createEventsInBatch(reservations, batchOptions);

  Logger.log('========== 予約登録結果 ==========');
  Logger.log(`成功: ${batchResult.successCount} 件`);
  Logger.log(`失敗: ${batchResult.failureCount} 件`);

  // 失敗した予約の詳細をログ出力
  const failures = batchResult.results.filter(r => !r.result.success);
  if (failures.length > 0) {
    Logger.log('--- 失敗した予約 ---');
    failures.forEach(f => {
      Logger.log(`  - ${f.reservation.title}: ${f.result.error}`);
    });
  }

  return batchResult;
}