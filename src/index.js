/**
 * GAS Work Calendar - エントリーポイント
 * 全ての公開関数をグローバルスコープに登録
 */

// CalendarSettings
import {
  getCalendarSettings,
  setCalendarSettings,
  initializeCalendarSettings
} from './CalendarSettings.js';

// CalendarUtils
import {
  getCurrentYearMonth,
  getNextYearMonth,
  parseDateTime,
  isValidDate,
  isValidTimeFormat,
  buildEventOptions,
  formatDate,
  formatDateTime,
  getPublicHolidaysInMonth,
  getHolidaysInMonth,
  getBusinessDaysInMonth,
  getWeekday,
  executeWithRetry
} from './CalendarUtils.js';

// CompanyHolidays
import {
  COMPANY_HOLIDAYS,
  getCompanyHolidaysForYear,
  getCompanyHolidaysInMonth,
  isCompanyHoliday
} from './CompanyHolidays.js';

// CalendarEventBasic
import {
  checkDuplicateEvent,
  createCalendarEventByDate
} from './CalendarEventBasic.js';

// CalendarEventBusinessDay
import {
  createBusinessDayEvent,
  getBusinessDayCount
} from './CalendarEventBusinessDay.js';

// TriggerManager
import {
  TRIGGER_CONFIG,
  getWeekDayEnum,
  createTriggerFromConfig,
  deleteTriggersForFunctions,
  setupTriggers,
  deleteAllTriggers,
  listTriggers
} from './TriggerManager.js';

// TriggerValidation
import {
  validateInterval,
  validateHour,
  validateDayOfWeek,
  validateDayOfMonth
} from './TriggerValidation.js';

// EntryPoint
import {
  getReservationExecutor,
  createEventsInBatch,
  runCalendarReservations
} from './EntryPoint.js';

// Reservations Config
import { getReservations } from './reservations.config.js';

// グローバルスコープに登録
// CalendarSettings
globalThis.getCalendarSettings = getCalendarSettings;
globalThis.setCalendarSettings = setCalendarSettings;
globalThis.initializeCalendarSettings = initializeCalendarSettings;
globalThis.showCurrentSettings = function() {
  const settings = getCalendarSettings();
  Logger.log('Current Calendar Settings:');
  Logger.log(`  Default Calendar ID: ${settings.defaultCalendarId}`);
  Logger.log(`  Default Timezone: ${settings.defaultTimeZone}`);
  Logger.log(`  Holiday Calendar ID: ${settings.holidayCalendarId}`);
  Logger.log(`  Default Reminder: ${settings.defaultReminderMinutes} minutes`);
};

// CalendarUtils
globalThis.getCurrentYearMonth = getCurrentYearMonth;
globalThis.getNextYearMonth = getNextYearMonth;
globalThis.parseDateTime = parseDateTime;
globalThis.isValidDate = isValidDate;
globalThis.isValidTimeFormat = isValidTimeFormat;
globalThis.buildEventOptions = buildEventOptions;
globalThis.formatDate = formatDate;
globalThis.formatDateTime = formatDateTime;
globalThis.getPublicHolidaysInMonth = getPublicHolidaysInMonth;
globalThis.getHolidaysInMonth = getHolidaysInMonth;
globalThis.getBusinessDaysInMonth = getBusinessDaysInMonth;
globalThis.getWeekday = getWeekday;
globalThis.executeWithRetry = executeWithRetry;

// CompanyHolidays
globalThis.COMPANY_HOLIDAYS = COMPANY_HOLIDAYS;
globalThis.getCompanyHolidaysForYear = getCompanyHolidaysForYear;
globalThis.getCompanyHolidaysInMonth = getCompanyHolidaysInMonth;
globalThis.isCompanyHoliday = isCompanyHoliday;

// CalendarEventBasic
globalThis.checkDuplicateEvent = checkDuplicateEvent;
globalThis.createCalendarEventByDate = createCalendarEventByDate;

// CalendarEventBusinessDay
globalThis.createBusinessDayEvent = createBusinessDayEvent;
globalThis.getBusinessDayCount = getBusinessDayCount;

// TriggerManager
globalThis.TRIGGER_CONFIG = TRIGGER_CONFIG;
globalThis.getWeekDayEnum = getWeekDayEnum;
globalThis.createTriggerFromConfig = createTriggerFromConfig;
globalThis.deleteTriggersForFunctions = deleteTriggersForFunctions;
globalThis.setupTriggers = setupTriggers;
globalThis.deleteAllTriggers = deleteAllTriggers;
globalThis.listTriggers = listTriggers;

// TriggerValidation
globalThis.validateInterval = validateInterval;
globalThis.validateHour = validateHour;
globalThis.validateDayOfWeek = validateDayOfWeek;
globalThis.validateDayOfMonth = validateDayOfMonth;

// EntryPoint
globalThis.getReservationExecutor = getReservationExecutor;
globalThis.createEventsInBatch = createEventsInBatch;
globalThis.runCalendarReservations = runCalendarReservations;

// Reservations Config
globalThis.getReservations = getReservations;
