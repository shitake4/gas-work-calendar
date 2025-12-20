/**
 * TriggerValidation のテスト
 */
import { describe, it, expect } from 'vitest';
import {
  validateInterval,
  validateHour,
  validateDayOfWeek,
  validateDayOfMonth
} from '../src/TriggerValidation.js';

describe('TriggerValidation', () => {
  describe('validateInterval', () => {
    it('有効な間隔値でエラーを投げない', () => {
      const validMinutes = [1, 5, 10, 15, 30];
      validMinutes.forEach(interval => {
        expect(() => validateInterval(interval, validMinutes, 'everyMinutes'))
          .not.toThrow();
      });

      const validHours = [1, 2, 4, 6, 8, 12];
      validHours.forEach(interval => {
        expect(() => validateInterval(interval, validHours, 'everyHours'))
          .not.toThrow();
      });
    });

    it('無効な間隔値でエラーを投げる', () => {
      const validMinutes = [1, 5, 10, 15, 30];

      expect(() => validateInterval(3, validMinutes, 'everyMinutes'))
        .toThrow('everyMinutes の interval は 1, 5, 10, 15, 30 のいずれかである必要があります');

      expect(() => validateInterval(20, validMinutes, 'everyMinutes'))
        .toThrow();
    });
  });

  describe('validateHour', () => {
    it('有効な時刻（0-23）でエラーを投げない', () => {
      for (let hour = 0; hour <= 23; hour++) {
        expect(() => validateHour(hour)).not.toThrow();
      }
    });

    it('undefinedでエラーを投げる', () => {
      expect(() => validateHour(undefined))
        .toThrow('hour は 0-23 の範囲で指定してください');
    });

    it('負の値でエラーを投げる', () => {
      expect(() => validateHour(-1))
        .toThrow('hour は 0-23 の範囲で指定してください');
    });

    it('24以上の値でエラーを投げる', () => {
      expect(() => validateHour(24))
        .toThrow('hour は 0-23 の範囲で指定してください');
      expect(() => validateHour(25))
        .toThrow('hour は 0-23 の範囲で指定してください');
    });
  });

  describe('validateDayOfWeek', () => {
    it('有効な曜日（0-6）でエラーを投げない', () => {
      for (let day = 0; day <= 6; day++) {
        expect(() => validateDayOfWeek(day)).not.toThrow();
      }
    });

    it('undefinedでエラーを投げる', () => {
      expect(() => validateDayOfWeek(undefined))
        .toThrow('dayOfWeek は 0-6 の範囲で指定してください');
    });

    it('負の値でエラーを投げる', () => {
      expect(() => validateDayOfWeek(-1))
        .toThrow('dayOfWeek は 0-6 の範囲で指定してください');
    });

    it('7以上の値でエラーを投げる', () => {
      expect(() => validateDayOfWeek(7))
        .toThrow('dayOfWeek は 0-6 の範囲で指定してください');
    });
  });

  describe('validateDayOfMonth', () => {
    it('有効な日（1-31）でエラーを投げない', () => {
      for (let day = 1; day <= 31; day++) {
        expect(() => validateDayOfMonth(day)).not.toThrow();
      }
    });

    it('undefinedでエラーを投げる', () => {
      expect(() => validateDayOfMonth(undefined))
        .toThrow('dayOfMonth は 1-31 の範囲で指定してください');
    });

    it('0でエラーを投げる', () => {
      expect(() => validateDayOfMonth(0))
        .toThrow('dayOfMonth は 1-31 の範囲で指定してください');
    });

    it('32以上の値でエラーを投げる', () => {
      expect(() => validateDayOfMonth(32))
        .toThrow('dayOfMonth は 1-31 の範囲で指定してください');
    });
  });
});
