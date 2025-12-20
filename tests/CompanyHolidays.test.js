/**
 * CompanyHolidays のテスト
 */
import { describe, it, expect } from 'vitest';
import {
  COMPANY_HOLIDAYS,
  getCompanyHolidaysForYear,
  getCompanyHolidaysInMonth,
  isCompanyHoliday
} from '../src/CompanyHolidays.js';

describe('CompanyHolidays', () => {
  describe('COMPANY_HOLIDAYS', () => {
    it('2025年の会社休日が定義されている', () => {
      expect(COMPANY_HOLIDAYS[2025]).toBeDefined();
      expect(Array.isArray(COMPANY_HOLIDAYS[2025])).toBe(true);
      expect(COMPANY_HOLIDAYS[2025].length).toBeGreaterThan(0);
    });

    it('2026年の会社休日が定義されている', () => {
      expect(COMPANY_HOLIDAYS[2026]).toBeDefined();
      expect(Array.isArray(COMPANY_HOLIDAYS[2026])).toBe(true);
    });

    it('日付がYYYY-MM-DD形式である', () => {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      COMPANY_HOLIDAYS[2025].forEach(dateStr => {
        expect(dateStr).toMatch(datePattern);
      });
    });
  });

  describe('getCompanyHolidaysForYear', () => {
    it('指定した年の会社休日をDate配列で返す', () => {
      const holidays = getCompanyHolidaysForYear(2025);

      expect(Array.isArray(holidays)).toBe(true);
      expect(holidays.length).toBeGreaterThan(0);
      holidays.forEach(holiday => {
        expect(holiday instanceof Date).toBe(true);
        expect(holiday.getFullYear()).toBe(2025);
      });
    });

    it('未定義の年は空配列を返す', () => {
      const holidays = getCompanyHolidaysForYear(2020);
      expect(holidays).toEqual([]);
    });

    it('日付が正しくパースされている', () => {
      const holidays = getCompanyHolidaysForYear(2025);

      // 2025年12月29日が含まれているか確認
      const dec29 = holidays.find(d =>
        d.getMonth() === 11 && d.getDate() === 29
      );
      expect(dec29).toBeDefined();
      expect(dec29.getFullYear()).toBe(2025);
      expect(dec29.getMonth()).toBe(11); // 12月（0-indexed）
      expect(dec29.getDate()).toBe(29);
    });
  });

  describe('getCompanyHolidaysInMonth', () => {
    it('指定した月の会社休日のみを返す', () => {
      const holidays = getCompanyHolidaysInMonth(2025, 12);

      expect(Array.isArray(holidays)).toBe(true);
      holidays.forEach(holiday => {
        expect(holiday.getFullYear()).toBe(2025);
        expect(holiday.getMonth()).toBe(11); // 12月（0-indexed）
      });
    });

    it('会社休日がない月は空配列を返す', () => {
      const holidays = getCompanyHolidaysInMonth(2025, 6);
      expect(holidays).toEqual([]);
    });

    it('2025年12月の年末休業3日間を返す', () => {
      const holidays = getCompanyHolidaysInMonth(2025, 12);

      expect(holidays.length).toBe(3);

      const dates = holidays.map(d => d.getDate()).sort((a, b) => a - b);
      expect(dates).toEqual([29, 30, 31]);
    });
  });

  describe('isCompanyHoliday', () => {
    it('会社休日の日付でtrueを返す', () => {
      const dec29 = new Date(2025, 11, 29);
      expect(isCompanyHoliday(dec29)).toBe(true);

      const dec30 = new Date(2025, 11, 30);
      expect(isCompanyHoliday(dec30)).toBe(true);

      const dec31 = new Date(2025, 11, 31);
      expect(isCompanyHoliday(dec31)).toBe(true);
    });

    it('会社休日でない日付でfalseを返す', () => {
      const dec28 = new Date(2025, 11, 28);
      expect(isCompanyHoliday(dec28)).toBe(false);

      const jan1 = new Date(2025, 0, 1);
      expect(isCompanyHoliday(jan1)).toBe(false);
    });

    it('未定義の年の日付でfalseを返す', () => {
      const oldDate = new Date(2020, 11, 29);
      expect(isCompanyHoliday(oldDate)).toBe(false);
    });
  });
});
