/**
 * 予約をまとめて登録する（バッチ処理対応）
 * - 下の reservations 配列に登録したい予約を追加して実行
 * - バッチ処理によりAPI呼び出し制限を考慮
 * - 各予約作成にはリトライ機能付き
 */

import { getCurrentYearMonth, getNextYearMonth, executeWithRetry } from './CalendarUtils.js';
import { createCalendarEvent, createCalendarEventByDate } from './CalendarEventBasic.js';
import { createBusinessDayEvent } from './CalendarEventBusinessDay.js';

/**
 * 予約タイプに応じた実行関数を返す
 * @param {string} type - 予約タイプ ('basic', 'date', 'recurring', 'businessDay')
 * @returns {Function|null} 実行関数
 */
export function getReservationExecutor(type) {
  switch (type) {
    case 'basic':
      return createCalendarEvent;
    case 'date':
      return createCalendarEventByDate;
    case 'businessDay':
      return createBusinessDayEvent;
    default:
      return null;
  }
}

/**
 * 複数の予定を一括作成（バッチ処理）
 * @param {Array<Object>} reservations - 予約設定の配列
 * @param {Object} [batchOptions] - バッチ処理オプション
 * @param {number} [batchOptions.batchSize=10] - 1バッチあたりの処理数
 * @param {number} [batchOptions.batchDelayMs=1000] - バッチ間の待機時間（ミリ秒）
 * @param {number} [batchOptions.maxRetries=3] - 各予定作成の最大リトライ回数
 * @returns {Object} 結果 { success: boolean, results: Array, successCount: number, failureCount: number }
 */
export function createEventsInBatch(reservations, batchOptions = {}) {
  const {
    batchSize = 10,
    batchDelayMs = 1000,
    maxRetries = 3
  } = batchOptions;

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  Logger.log(`バッチ処理開始: ${reservations.length}件の予約を処理します`);

  for (let i = 0; i < reservations.length; i++) {
    const reservation = reservations[i];

    try {
      // リトライ付きで予約作成を実行
      const result = executeWithRetry(() => {
        const executor = getReservationExecutor(reservation.type);
        if (!executor) {
          throw new Error(`不明な予約タイプ: ${reservation.type}`);
        }
        return executor(reservation);
      }, maxRetries);

      if (result.success) {
        successCount++;
        Logger.log(`予約作成成功 (${i + 1}/${reservations.length}): ${reservation.title}`);
      } else {
        failureCount++;
        Logger.log(`予約作成失敗 (${i + 1}/${reservations.length}): ${reservation.title} - ${result.error}`);
      }

      results.push({
        index: i,
        reservation: reservation,
        result: result
      });
    } catch (error) {
      failureCount++;
      Logger.log(`予約作成エラー (${i + 1}/${reservations.length}): ${reservation.title} - ${error.message}`);
      results.push({
        index: i,
        reservation: reservation,
        result: { success: false, error: error.message }
      });
    }

    // バッチ区切りでスリープ（最後のアイテムを除く）
    if ((i + 1) % batchSize === 0 && i < reservations.length - 1) {
      Logger.log(`バッチ処理: ${batchDelayMs}ms待機中...`);
      Utilities.sleep(batchDelayMs);
    }
  }

  Logger.log(`バッチ処理完了: 成功=${successCount}件, 失敗=${failureCount}件`);

  return {
    success: failureCount === 0,
    results: results,
    successCount: successCount,
    failureCount: failureCount
  };
}

/**
 * 予約実行エントリポイント
 */
export function runCalendarReservations() {
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
