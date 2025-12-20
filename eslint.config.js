import globals from 'globals';

/**
 * ESLint設定 (Flat Config)
 * GAS（Google Apps Script）プロジェクト向け
 */
export default [
  {
    // 対象ファイル
    files: ['src/**/*.js', 'scripts/**/*.js', 'tests/**/*.js'],

    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        // Node.js グローバル（ビルドスクリプト・テスト用）
        ...globals.node,

        // GAS グローバル変数
        Logger: 'readonly',
        CalendarApp: 'readonly',
        PropertiesService: 'readonly',
        ScriptApp: 'readonly',
        Utilities: 'readonly',
        SpreadsheetApp: 'readonly',
        DriveApp: 'readonly',
        MailApp: 'readonly',
        GmailApp: 'readonly',
        UrlFetchApp: 'readonly',
        ContentService: 'readonly',
        HtmlService: 'readonly',
        Session: 'readonly',
        Browser: 'readonly',
        CacheService: 'readonly',
        LockService: 'readonly',

        // グローバルスコープ登録用
        globalThis: 'readonly',
      },
    },

    rules: {
      // エラー防止
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'no-undef': 'error',
      'no-console': 'off', // ビルドスクリプトでconsole使用

      // コード品質
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'warn',

      // スタイル（最小限）
      'semi': ['error', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
    },
  },

  // テストファイル用の追加設定
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        // Vitest グローバル
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
  },

  // 除外設定
  {
    ignores: [
      'node_modules/**',
      'bundle.gs',
      '*.gs',
    ],
  },
];
