/**
 * GAS API モック
 * テスト用にGAS固有のグローバルオブジェクトをモック化
 */

// ストア用オブジェクト
const scriptProperties = {};
const logMessages = [];

// PropertiesService モック
export const PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (key) => scriptProperties[key] || null,
    setProperty: (key, value) => {
      scriptProperties[key] = value;
    },
    deleteProperty: (key) => {
      delete scriptProperties[key];
    },
    getProperties: () => ({ ...scriptProperties }),
    deleteAllProperties: () => {
      Object.keys(scriptProperties).forEach(key => delete scriptProperties[key]);
    }
  })
};

// Logger モック
export const Logger = {
  log: (message) => {
    logMessages.push(message);
    // console.log('[Logger]', message);
  },
  getLog: () => logMessages.join('\n'),
  clear: () => {
    logMessages.length = 0;
  }
};

// Utilities モック
export const Utilities = {
  formatDate: (date, timezone, format) => {
    // シンプルなフォーマット実装
    const pad = (n) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    if (format === 'yyyy-MM-dd') {
      return `${year}-${month}-${day}`;
    } else if (format === 'yyyy-MM-dd HH:mm') {
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    return date.toISOString();
  },
  sleep: (_ms) => {
    // テスト環境では実際にスリープしない
  }
};

// CalendarApp モック
const mockEvents = [];

const createMockEvent = (title, startTime, endTime, options = {}) => {
  const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const event = {
    id: eventId,
    title,
    startTime,
    endTime,
    allDay: options.allDay || false,
    description: options.description || '',
    location: options.location || '',
    guests: options.guests ? options.guests.split(',') : [],
    reminders: []
  };

  return {
    getId: () => event.id,
    getTitle: () => event.title,
    getStartTime: () => event.startTime,
    getEndTime: () => event.endTime,
    isAllDayEvent: () => event.allDay,
    getGuestList: () => event.guests.map(email => ({ getEmail: () => email })),
    removeAllReminders: () => { event.reminders = []; },
    addEmailReminder: (minutes) => { event.reminders.push({ type: 'email', minutes }); },
    addPopupReminder: (minutes) => { event.reminders.push({ type: 'popup', minutes }); },
    _data: event
  };
};

const createMockCalendar = (calendarId) => ({
  getEvents: (startTime, endTime) => {
    return mockEvents
      .filter(e => e._data.calendarId === calendarId)
      .filter(e => e.getStartTime() >= startTime && e.getStartTime() <= endTime);
  },
  createEvent: (title, startTime, endTime, options = {}) => {
    const event = createMockEvent(title, startTime, endTime, { ...options, allDay: false });
    event._data.calendarId = calendarId;
    mockEvents.push(event);
    return event;
  },
  createAllDayEvent: (title, date, optionsOrEndDate, maybeOptions) => {
    let endDate, options;
    if (optionsOrEndDate instanceof Date) {
      endDate = optionsOrEndDate;
      options = maybeOptions || {};
    } else {
      endDate = date;
      options = optionsOrEndDate || {};
    }
    const event = createMockEvent(title, date, endDate, { ...options, allDay: true });
    event._data.calendarId = calendarId;
    mockEvents.push(event);
    return event;
  }
});

export const CalendarApp = {
  getCalendarById: (calendarId) => {
    if (!calendarId) return null;
    return createMockCalendar(calendarId);
  },
  Weekday: {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6
  }
};

// ScriptApp モック
const mockTriggers = [];

export const ScriptApp = {
  getProjectTriggers: () => [...mockTriggers],
  deleteTrigger: (trigger) => {
    const index = mockTriggers.indexOf(trigger);
    if (index > -1) {
      mockTriggers.splice(index, 1);
    }
  },
  newTrigger: (functionName) => {
    const triggerConfig = {
      functionName,
      type: null,
      hour: null,
      interval: null,
      dayOfWeek: null,
      dayOfMonth: null
    };

    const trigger = {
      getHandlerFunction: () => triggerConfig.functionName,
      getEventType: () => ({ toString: () => triggerConfig.type }),
      getUniqueId: () => `trigger_${Date.now()}`
    };

    return {
      timeBased: () => ({
        everyMinutes: (n) => {
          triggerConfig.type = 'CLOCK';
          triggerConfig.interval = n;
          return {
            create: () => {
              mockTriggers.push(trigger);
              return trigger;
            }
          };
        },
        everyHours: (n) => {
          triggerConfig.type = 'CLOCK';
          triggerConfig.interval = n;
          return {
            create: () => {
              mockTriggers.push(trigger);
              return trigger;
            }
          };
        },
        everyDays: (_n) => ({
          atHour: (hour) => {
            triggerConfig.type = 'CLOCK';
            triggerConfig.hour = hour;
            return {
              create: () => {
                mockTriggers.push(trigger);
                return trigger;
              }
            };
          }
        }),
        everyWeeks: (_n) => ({
          onWeekDay: (day) => ({
            atHour: (hour) => {
              triggerConfig.type = 'CLOCK';
              triggerConfig.dayOfWeek = day;
              triggerConfig.hour = hour;
              return {
                create: () => {
                  mockTriggers.push(trigger);
                  return trigger;
                }
              };
            }
          })
        }),
        onMonthDay: (day) => ({
          atHour: (hour) => {
            triggerConfig.type = 'CLOCK';
            triggerConfig.dayOfMonth = day;
            triggerConfig.hour = hour;
            return {
              create: () => {
                mockTriggers.push(trigger);
                return trigger;
              }
            };
          }
        })
      })
    };
  },
  WeekDay: {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6
  }
};

// ヘルパー関数（テスト用）
export const resetMocks = () => {
  Object.keys(scriptProperties).forEach(key => delete scriptProperties[key]);
  logMessages.length = 0;
  mockEvents.length = 0;
  mockTriggers.length = 0;
};

export const setScriptProperty = (key, value) => {
  scriptProperties[key] = value;
};

export const getLogMessages = () => [...logMessages];

export const getMockEvents = () => [...mockEvents];

export const getMockTriggers = () => [...mockTriggers];
