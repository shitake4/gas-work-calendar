/**
 * 予約登録のメインエントリ
 * Java の main 相当として、登録したい予約をこのファイルで設定する
 */

/**
 * 予約をまとめて登録する（バッチ処理対応）
 * - 下の reservations 配列に登録したい予約を追加して実行
 * - バッチ処理によりAPI呼び出し制限を考慮
 * - 各予約作成にはリトライ機能付き
 */
function runCalendarReservations() {
  // 実行時の年月を自動取得
  const currentYearMonth = getCurrentYearMonth();
  Logger.log(`対象年月: ${currentYearMonth}`);

  // 登録する予約の配列
  // type: 'basic' | 'date' | 'recurring' | 'businessDay'
  const reservations = [
    {
      type: 'businessDay',
      yearMonth: currentYearMonth,
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

/**
 * 単一の予約を登録する（簡易実行用）
 * @param {Object} reservation - 予約設定
 * @returns {Object} 作成結果
 */
function runSingleReservation(reservation) {
  const executor = getReservationExecutor(reservation.type);
  if (!executor) {
    Logger.log(`未対応の予約タイプです: ${reservation.type}`);
    return { success: false, error: `未対応の予約タイプ: ${reservation.type}` };
  }

  try {
    return executeWithRetry(() => executor(reservation));
  } catch (error) {
    Logger.log(`予約作成エラー: ${error.message}`);
    return { success: false, error: error.message };
  }
}
