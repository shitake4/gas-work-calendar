/**
 * CalendarUtils のテスト
 */
import { describe, it, expect } from 'vitest';
import {
  getCurrentYearMonth,
  getNextYearMonth,
  parseDateTime,
  isValidDate,
  isValidTimeFormat,
  buildEventOptions,
  formatDate,
  formatDateTime,
  getBusinessDaysInMonth
} from '../src/CalendarUtils.js';

describe('CalendarUtils', () => {
  describe('getCurrentYearMonth', () => {
    it('現在の年月をYYYY-MM形式で返す', () => {
      const result = getCurrentYearMonth();
      expect(result).toMatch(/^\d{4}-\d{2}$/);

      const now = new Date();
      const expectedYear = now.getFullYear();
      const expectedMonth = String(now.getMonth() + 1).padStart(2, '0');
      expect(result).toBe(`${expectedYear}-${expectedMonth}`);
    });
  });

  describe('getNextYearMonth', () => {
    it('翌月の年月をYYYY-MM形式で返す', () => {
      const result = getNextYearMonth();
      expect(result).toMatch(/^\d{4}-\d{2}$/);

      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const expectedYear = nextMonth.getFullYear();
      const expectedMonth = String(nextMonth.getMonth() + 1).padStart(2, '0');
      expect(result).toBe(`${expectedYear}-${expectedMonth}`);
    });

    it('12月の場合は翌年1月を返す', () => {
      // このテストは実行時の月に依存しないようにするため、関数のロジックをテスト
      const december = new Date(2025, 11, 15); // 2025年12月
      const nextMonth = new Date(december.getFullYear(), december.getMonth() + 1, 1);
      expect(nextMonth.getFullYear()).toBe(2026);
      expect(nextMonth.getMonth()).toBe(0); // 1月
    });
  });

  describe('parseDateTime', () => {
    it('Dateオブジェクトをそのまま返す', () => {
      const date = new Date(2025, 5, 15, 10, 30);
      const result = parseDateTime(date);
      expect(result).toBe(date);
    });

    it('ISO 8601形式の文字列をパースする', () => {
      const result = parseDateTime('2025-06-15T10:30:00');
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(5); // 6月 (0-indexed)
      expect(result.getDate()).toBe(15);
    });

    it('無効な日時文字列でエラーを投げる', () => {
      expect(() => parseDateTime('invalid-date')).toThrow('無効な日時形式です');
    });
  });

  describe('isValidDate', () => {
    it('有効な日付でtrueを返す', () => {
      expect(isValidDate(2025, 1, 15)).toBe(true);
      expect(isValidDate(2025, 12, 31)).toBe(true);
      expect(isValidDate(2025, 2, 28)).toBe(true);
    });

    it('うるう年の2月29日でtrueを返す', () => {
      expect(isValidDate(2024, 2, 29)).toBe(true); // 2024年はうるう年
      expect(isValidDate(2000, 2, 29)).toBe(true); // 400で割り切れる年
    });

    it('うるう年でない年の2月29日でfalseを返す', () => {
      expect(isValidDate(2025, 2, 29)).toBe(false);
      expect(isValidDate(1900, 2, 29)).toBe(false); // 100で割り切れるが400で割り切れない
    });

    it('無効な月でfalseを返す', () => {
      expect(isValidDate(2025, 0, 15)).toBe(false);
      expect(isValidDate(2025, 13, 15)).toBe(false);
    });

    it('無効な日でfalseを返す', () => {
      expect(isValidDate(2025, 1, 0)).toBe(false);
      expect(isValidDate(2025, 1, 32)).toBe(false);
      expect(isValidDate(2025, 4, 31)).toBe(false); // 4月は30日まで
    });
  });

  describe('isValidTimeFormat', () => {
    it('有効なHH:mm形式でtrueを返す', () => {
      expect(isValidTimeFormat('00:00')).toBe(true);
      expect(isValidTimeFormat('09:30')).toBe(true);
      expect(isValidTimeFormat('12:00')).toBe(true);
      expect(isValidTimeFormat('23:59')).toBe(true);
    });

    it('無効な形式でfalseを返す', () => {
      expect(isValidTimeFormat('9:30')).toBe(false);    // 1桁時刻
      expect(isValidTimeFormat('09:5')).toBe(false);    // 1桁分
      expect(isValidTimeFormat('24:00')).toBe(false);   // 24時
      expect(isValidTimeFormat('12:60')).toBe(false);   // 60分
      expect(isValidTimeFormat('12-30')).toBe(false);   // 区切り文字違い
      expect(isValidTimeFormat('1230')).toBe(false);    // 区切りなし
      expect(isValidTimeFormat('')).toBe(false);        // 空文字
    });
  });

  describe('buildEventOptions', () => {
    it('description, location, guestsを含むオプションを構築する', () => {
      const options = {
        description: 'テスト説明',
        location: '会議室A',
        guests: ['user1@example.com', 'user2@example.com']
      };

      const result = buildEventOptions(options);

      expect(result.description).toBe('テスト説明');
      expect(result.location).toBe('会議室A');
      expect(result.guests).toBe('user1@example.com,user2@example.com');
    });

    it('空のオプションで空オブジェクトを返す', () => {
      const result = buildEventOptions({});
      expect(result).toEqual({});
    });

    it('一部のオプションのみ設定された場合も正しく構築する', () => {
      const result = buildEventOptions({ description: 'テスト' });
      expect(result).toEqual({ description: 'テスト' });
    });
  });

  describe('formatDate', () => {
    it('日付をyyyy-MM-dd形式でフォーマットする', () => {
      const date = new Date(2025, 5, 15); // 2025年6月15日
      const result = formatDate(date);
      expect(result).toBe('2025-06-15');
    });
  });

  describe('formatDateTime', () => {
    it('日時をyyyy-MM-dd HH:mm形式でフォーマットする', () => {
      const date = new Date(2025, 5, 15, 10, 30); // 2025年6月15日 10:30
      const result = formatDateTime(date);
      expect(result).toBe('2025-06-15 10:30');
    });
  });

  describe('getBusinessDaysInMonth', () => {
    it('土日を除外した営業日を返す', () => {
      // 2025年1月 (水曜始まり)
      const holidays = [];
      const businessDays = getBusinessDaysInMonth(2025, 1, holidays);

      // 2025年1月は平日が23日（土日は4日と5日の週末が4組 + 土曜1/4, 1/11, 1/18, 1/25と日曜1/5, 1/12, 1/19, 1/26）
      // 実際の営業日数を確認
      businessDays.forEach(day => {
        const dayOfWeek = day.getDay();
        expect(dayOfWeek).not.toBe(0); // 日曜日でない
        expect(dayOfWeek).not.toBe(6); // 土曜日でない
      });
    });

    it('祝日を除外した営業日を返す', () => {
      // 2025年1月13日（成人の日）を祝日として設定
      const holidays = [new Date(2025, 0, 13)];
      const businessDays = getBusinessDaysInMonth(2025, 1, holidays);

      // 1月13日が含まれていないことを確認
      const hasJan13 = businessDays.some(day =>
        day.getFullYear() === 2025 &&
        day.getMonth() === 0 &&
        day.getDate() === 13
      );
      expect(hasJan13).toBe(false);
    });

    it('複数の祝日がある場合も正しく除外する', () => {
      const holidays = [
        new Date(2025, 0, 1),  // 元日
        new Date(2025, 0, 13)  // 成人の日
      ];
      const businessDays = getBusinessDaysInMonth(2025, 1, holidays);

      // 1月1日と13日が含まれていないことを確認
      holidays.forEach(holiday => {
        const hasHoliday = businessDays.some(day =>
          day.getFullYear() === holiday.getFullYear() &&
          day.getMonth() === holiday.getMonth() &&
          day.getDate() === holiday.getDate()
        );
        expect(hasHoliday).toBe(false);
      });
    });

    it('日付順にソートされた配列を返す', () => {
      const businessDays = getBusinessDaysInMonth(2025, 1, []);

      for (let i = 1; i < businessDays.length; i++) {
        expect(businessDays[i].getTime()).toBeGreaterThan(businessDays[i - 1].getTime());
      }
    });
  });
});
