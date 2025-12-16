/**
 * ビルドスクリプト
 * src/ 配下のES Modulesコードを GAS用の .gs ファイルにバンドル
 */
import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = rootDir; // ルートディレクトリに出力

async function build() {
  console.log('Building GAS bundle...');

  try {
    // esbuild でバンドル
    const result = await esbuild.build({
      entryPoints: [path.join(rootDir, 'src/index.js')],
      bundle: true,
      format: 'iife',
      globalName: 'GasWorkCalendar',
      outfile: path.join(distDir, 'bundle.gs'),
      platform: 'neutral',
      target: 'es2020',
      minify: false,
      keepNames: true,
      // GASのグローバルオブジェクトを外部依存として扱う
      external: [],
      banner: {
        js: `/**
 * GAS Work Calendar
 * 自動生成されたファイル - 直接編集しないでください
 * ソースは src/ ディレクトリにあります
 *
 * Generated at: ${new Date().toISOString()}
 */
`
      }
    });

    // 生成されたファイルを読み込み
    let bundleContent = fs.readFileSync(path.join(distDir, 'bundle.gs'), 'utf-8');

    // IIFE のラッパーを削除し、グローバル関数として展開
    // esbuildが生成する形式: var GasWorkCalendar = (() => { ... })();

    // バンドル内容を調整（IIFEの戻り値を使わない形式に）
    bundleContent = bundleContent
      // var GasWorkCalendar = を削除（バナーの後にあるため、行頭でなくてもマッチ）
      .replace(/var GasWorkCalendar = /, '')
      // 末尾の ; を削除して即時実行関数のみにする
      .replace(/;\s*$/, '');

    // GASエディタから実行可能なトップレベル関数を追加
    // GASでは function キーワードでトップレベルに定義された関数のみが実行可能
    const globalFunctions = `

// ============================================================
// GASエディタから実行可能な関数
// ============================================================

/**
 * 予約を実行する（メイン関数）
 * トリガーからこの関数を呼び出してください
 */
function runCalendarReservations() {
  return globalThis.runCalendarReservations();
}

/**
 * トリガーをセットアップする
 * 初回セットアップ時に手動で実行してください
 */
function setupTriggers() {
  return globalThis.setupTriggers();
}

/**
 * 現在のトリガー一覧を表示
 */
function listTriggers() {
  return globalThis.listTriggers();
}

/**
 * すべてのトリガーを削除
 */
function deleteAllTriggers() {
  return globalThis.deleteAllTriggers();
}

/**
 * 現在の設定を表示
 */
function showCurrentSettings() {
  return globalThis.showCurrentSettings();
}

/**
 * 設定を初期化（日本向けデフォルト値）
 */
function initializeCalendarSettings() {
  return globalThis.initializeCalendarSettings();
}

/**
 * 営業日予定を作成
 */
function createBusinessDayEvent(options) {
  return globalThis.createBusinessDayEvent(options);
}

/**
 * カレンダー予定を作成
 */
function createCalendarEvent(options) {
  return globalThis.createCalendarEvent(options);
}

/**
 * 年月日指定でカレンダー予定を作成
 */
function createCalendarEventByDate(options) {
  return globalThis.createCalendarEventByDate(options);
}

/**
 * 指定月の営業日数を取得
 */
function getBusinessDayCount(yearMonth, holidayCalendarId) {
  return globalThis.getBusinessDayCount(yearMonth, holidayCalendarId);
}
`;

    bundleContent += globalFunctions;

    // ファイルを保存
    fs.writeFileSync(path.join(distDir, 'bundle.gs'), bundleContent);

    console.log('Build completed: bundle.gs');
    console.log(`Output size: ${(bundleContent.length / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
