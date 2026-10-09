export const DATE_FORMAT = "DD/MM/YYYY";

export const TIME_FORMAT = "HH:mm:ss";

export const DATETIME_FORMAT = `${DATE_FORMAT}, ${TIME_FORMAT}`;

export const DATETIME_PICKER_FORMAT = `${DATE_FORMAT}, HH:mm`;

// Datetime ISO string
export const ISO_DATETIME_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

export const ISO_DATE_FORMAT = "YYYY-MM-DD";
export const ISO_DATETIME_FORMAT = "YYYY-MM-DDTHH:mm:ss";
export const ISO_DATETIME_FORMAT_WITH_TIMEZONE = "YYYY-MM-DDTHH:mm:ss.SSS";

export const TIMEZONE = "Asia/Ho_Chi_Minh";

export const INTL_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};

export const INTL_DATETIME_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
};

export const DATE_RANGE_PRESETS = [
  {
    value: ["today", "today"],
    label: "today",
  },
  {
    value: ["today-1d", "today"],
    label: "last1Day",
  },
  {
    value: ["today-1w", "today"],
    label: "last1Week",
  },
  {
    value: ["today-2w", "today"],
    label: "last2Weeks",
  },
  {
    value: ["today-1m", "today"],
    label: "last1Month",
  },
  {
    value: ["today-3m", "today"],
    label: "last3Months",
  },
];
