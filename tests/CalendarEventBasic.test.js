/**
 * CalendarEventBasic のテスト
 */
import { describe, it, expect } from 'vitest';
import { createCalendarEventByDate } from '../src/CalendarEventBasic.js';
import { getMockEvents } from './mocks/gas-api.js';

describe('CalendarEventBasic', () => {
  describe('createCalendarEventByDate', () => {
    describe('リマインダー設定', () => {
      it('単一のポップアップリマインダーを設定できる', () => {
        const result = createCalendarEventByDate({
          year: 2025,
          month: 1,
          day: 15,
          allDay: true,
          title: 'テスト予定',
          reminder: { popup: 30 }
        });

        expect(result.success).toBe(true);
        const events = getMockEvents();
        expect(events).toHaveLength(1);
        expect(events[0]._data.reminders).toEqual([
          { type: 'popup', minutes: 30 }
        ]);
      });

      it('単一のメールリマインダーを設定できる', () => {
        const result = createCalendarEventByDate({
          year: 2025,
          month: 1,
          day: 15,
          allDay: true,
          title: 'テスト予定',
          reminder: { email: 60 }
        });

        expect(result.success).toBe(true);
        const events = getMockEvents();
        expect(events).toHaveLength(1);
        expect(events[0]._data.reminders).toEqual([
          { type: 'email', minutes: 60 }
        ]);
      });

      it('複数のポップアップリマインダーを配列で設定できる', () => {
        const result = createCalendarEventByDate({
          year: 2025,
          month: 1,
          day: 15,
          allDay: true,
          title: 'テスト予定',
          reminder: { popup: [30, 1440] }
        });

        expect(result.success).toBe(true);
        const events = getMockEvents();
        expect(events).toHaveLength(1);
        expect(events[0]._data.reminders).toEqual([
          { type: 'popup', minutes: 30 },
          { type: 'popup', minutes: 1440 }
        ]);
      });

      it('複数のメールリマインダーを配列で設定できる', () => {
        const result = createCalendarEventByDate({
          year: 2025,
          month: 1,
          day: 15,
          allDay: true,
          title: 'テスト予定',
          reminder: { email: [60, 1440] }
        });

        expect(result.success).toBe(true);
        const events = getMockEvents();
        expect(events).toHaveLength(1);
        expect(events[0]._data.reminders).toEqual([
          { type: 'email', minutes: 60 },
          { type: 'email', minutes: 1440 }
        ]);
      });

      it('ポップアップとメールの複数リマインダーを組み合わせて設定できる', () => {
        const result = createCalendarEventByDate({
          year: 2025,
          month: 1,
          day: 15,
          allDay: true,
          title: 'テスト予定',
          reminder: {
            popup: [30, 1440],
            email: [60, 10080]
          }
        });

        expect(result.success).toBe(true);
        const events = getMockEvents();
        expect(events).toHaveLength(1);
        expect(events[0]._data.reminders).toEqual([
          { type: 'email', minutes: 60 },
          { type: 'email', minutes: 10080 },
          { type: 'popup', minutes: 30 },
          { type: 'popup', minutes: 1440 }
        ]);
      });

      it('リマインダー未指定時はデフォルト値（30分ポップアップ）が設定される', () => {
        const result = createCalendarEventByDate({
          year: 2025,
          month: 1,
          day: 15,
          allDay: true,
          title: 'テスト予定'
        });

        expect(result.success).toBe(true);
        const events = getMockEvents();
        expect(events).toHaveLength(1);
        expect(events[0]._data.reminders).toEqual([
          { type: 'popup', minutes: 30 }
        ]);
      });

      it('単一値と配列を混在して設定できる', () => {
        const result = createCalendarEventByDate({
          year: 2025,
          month: 1,
          day: 15,
          allDay: true,
          title: 'テスト予定',
          reminder: {
            popup: 30,
            email: [60, 1440]
          }
        });

        expect(result.success).toBe(true);
        const events = getMockEvents();
        expect(events).toHaveLength(1);
        expect(events[0]._data.reminders).toEqual([
          { type: 'email', minutes: 60 },
          { type: 'email', minutes: 1440 },
          { type: 'popup', minutes: 30 }
        ]);
      });
    });

    describe('基本動作', () => {
      it('終日予定を作成できる', () => {
        const result = createCalendarEventByDate({
          year: 2025,
          month: 1,
          day: 15,
          allDay: true,
          title: 'テスト終日予定'
        });

        expect(result.success).toBe(true);
        expect(result.eventId).toBeDefined();
        const events = getMockEvents();
        expect(events).toHaveLength(1);
        expect(events[0]._data.allDay).toBe(true);
      });

      it('時間指定の予定を作成できる', () => {
        const result = createCalendarEventByDate({
          year: 2025,
          month: 1,
          day: 15,
          startTimeStr: '10:00',
          endTimeStr: '11:00',
          title: 'テスト会議'
        });

        expect(result.success).toBe(true);
        expect(result.eventId).toBeDefined();
        const events = getMockEvents();
        expect(events).toHaveLength(1);
        expect(events[0]._data.allDay).toBe(false);
      });

      it('タイトルが必須', () => {
        const result = createCalendarEventByDate({
          year: 2025,
          month: 1,
          day: 15,
          allDay: true
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('タイトル');
      });

      it('無効な日付でエラー', () => {
        const result = createCalendarEventByDate({
          year: 2025,
          month: 2,
          day: 30,
          allDay: true,
          title: 'テスト'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('無効な日付');
      });
    });
  });
});
