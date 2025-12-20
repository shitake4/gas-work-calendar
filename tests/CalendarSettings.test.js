/**
 * CalendarSettings のテスト
 */
import { describe, it, expect } from 'vitest';
import {
  getCalendarSettings,
  setCalendarSettings,
  initializeCalendarSettings
} from '../src/CalendarSettings.js';
import { setScriptProperty } from './mocks/gas-api.js';

describe('CalendarSettings', () => {
  describe('getCalendarSettings', () => {
    it('デフォルト値を返す（プロパティ未設定時）', () => {
      const settings = getCalendarSettings();

      expect(settings.defaultCalendarId).toBe('primary');
      expect(settings.defaultTimeZone).toBe('Asia/Tokyo');
      expect(settings.holidayCalendarId).toBe('ja.japanese#holiday@group.v.calendar.google.com');
      expect(settings.defaultReminderMinutes).toBe(30);
    });

    it('設定されたプロパティ値を返す', () => {
      setScriptProperty('DEFAULT_CALENDAR_ID', 'custom-calendar@group.calendar.google.com');
      setScriptProperty('DEFAULT_TIMEZONE', 'America/New_York');
      setScriptProperty('HOLIDAY_CALENDAR_ID', 'custom-holiday@group.v.calendar.google.com');
      setScriptProperty('DEFAULT_REMINDER_MINUTES', '60');

      const settings = getCalendarSettings();

      expect(settings.defaultCalendarId).toBe('custom-calendar@group.calendar.google.com');
      expect(settings.defaultTimeZone).toBe('America/New_York');
      expect(settings.holidayCalendarId).toBe('custom-holiday@group.v.calendar.google.com');
      expect(settings.defaultReminderMinutes).toBe(60);
    });

    it('リマインダー分が文字列の場合、数値に変換する', () => {
      setScriptProperty('DEFAULT_REMINDER_MINUTES', '45');

      const settings = getCalendarSettings();

      expect(settings.defaultReminderMinutes).toBe(45);
      expect(typeof settings.defaultReminderMinutes).toBe('number');
    });
  });

  describe('setCalendarSettings', () => {
    it('カレンダーIDを設定する', () => {
      setCalendarSettings({
        defaultCalendarId: 'new-calendar@group.calendar.google.com'
      });

      const settings = getCalendarSettings();
      expect(settings.defaultCalendarId).toBe('new-calendar@group.calendar.google.com');
    });

    it('タイムゾーンを設定する', () => {
      setCalendarSettings({
        defaultTimeZone: 'Europe/London'
      });

      const settings = getCalendarSettings();
      expect(settings.defaultTimeZone).toBe('Europe/London');
    });

    it('祝日カレンダーIDを設定する', () => {
      setCalendarSettings({
        holidayCalendarId: 'new-holiday@group.v.calendar.google.com'
      });

      const settings = getCalendarSettings();
      expect(settings.holidayCalendarId).toBe('new-holiday@group.v.calendar.google.com');
    });

    it('リマインダー分を設定する', () => {
      setCalendarSettings({
        defaultReminderMinutes: 15
      });

      const settings = getCalendarSettings();
      expect(settings.defaultReminderMinutes).toBe(15);
    });

    it('複数の設定を同時に更新できる', () => {
      setCalendarSettings({
        defaultCalendarId: 'multi-test@group.calendar.google.com',
        defaultTimeZone: 'Asia/Singapore',
        defaultReminderMinutes: 10
      });

      const settings = getCalendarSettings();
      expect(settings.defaultCalendarId).toBe('multi-test@group.calendar.google.com');
      expect(settings.defaultTimeZone).toBe('Asia/Singapore');
      expect(settings.defaultReminderMinutes).toBe(10);
    });

    it('未指定のプロパティは変更しない', () => {
      // 事前に設定
      setCalendarSettings({
        defaultCalendarId: 'original@group.calendar.google.com',
        defaultReminderMinutes: 20
      });

      // 一部のみ更新
      setCalendarSettings({
        defaultReminderMinutes: 25
      });

      const settings = getCalendarSettings();
      expect(settings.defaultCalendarId).toBe('original@group.calendar.google.com');
      expect(settings.defaultReminderMinutes).toBe(25);
    });
  });

  describe('initializeCalendarSettings', () => {
    it('日本向けデフォルト値で初期化する', () => {
      // 事前にカスタム値を設定
      setCalendarSettings({
        defaultCalendarId: 'custom@group.calendar.google.com',
        defaultTimeZone: 'America/Los_Angeles',
        holidayCalendarId: 'custom-holiday@group.v.calendar.google.com',
        defaultReminderMinutes: 60
      });

      // 初期化
      initializeCalendarSettings();

      const settings = getCalendarSettings();
      expect(settings.defaultCalendarId).toBe('primary');
      expect(settings.defaultTimeZone).toBe('Asia/Tokyo');
      expect(settings.holidayCalendarId).toBe('ja.japanese#holiday@group.v.calendar.google.com');
      expect(settings.defaultReminderMinutes).toBe(30);
    });
  });
});
