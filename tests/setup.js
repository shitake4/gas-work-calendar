/**
 * テストセットアップ
 * GAS APIモックをグローバルに登録
 */
import {
  PropertiesService,
  Logger,
  Utilities,
  CalendarApp,
  ScriptApp,
  resetMocks
} from './mocks/gas-api.js';

// グローバルにGAS APIモックを登録
globalThis.PropertiesService = PropertiesService;
globalThis.Logger = Logger;
globalThis.Utilities = Utilities;
globalThis.CalendarApp = CalendarApp;
globalThis.ScriptApp = ScriptApp;

// 各テスト前にモックをリセット
beforeEach(() => {
  resetMocks();
});
