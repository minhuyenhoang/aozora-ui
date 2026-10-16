import { INTL_DATETIME_FORMAT } from "@constants/datetime";
import {
  getLocalTimeZone,
  parseAbsolute,
  parseDate,
  parseDateTime,
  DateFormatter,
} from "@internationalized/date";

export type DateTimeFormatterOptions = {
  locale?: string;
  format?: Intl.DateTimeFormatOptions;
  /**
   * The time zone to show the date in. Only used by `isoDateTimeFormat`.
   * @default the user's local time zone
   */
  timeZone?: string;
};

export function dateFormat(date: string, options?: DateTimeFormatterOptions) {
  const formatter = new DateFormatter(
    options && options.locale ? options.locale : "en-GB",
    options?.format,
  );

  const dateValue = parseDate(date);

  return formatter.format(dateValue.toDate(getLocalTimeZone()));
}

export function dateTimeFormat(
  date: string,
  options?: DateTimeFormatterOptions,
) {
  const formatter = new DateFormatter(
    options && options.locale ? options.locale : "en-GB",
    options ? options.format : INTL_DATETIME_FORMAT,
  );

  const dateValue = parseDateTime(date);

  return formatter.format(dateValue.toDate(getLocalTimeZone()));
}

/**
 * Formats an ISO datetime that carries a time zone, such as
 * `2026-10-16T08:30:00Z` or `2026-10-16T15:30:00+07:00`. The date is shown in
 * the user's local time zone unless `options.timeZone` is set.
 */
export function isoDateTimeFormat(
  date: string,
  options?: DateTimeFormatterOptions,
) {
  const timeZone = options?.timeZone ?? getLocalTimeZone();
  const formatter = new DateFormatter(options?.locale ?? "en-GB", {
    ...(options?.format ?? INTL_DATETIME_FORMAT),
    timeZone,
  });

  const dateValue = parseAbsolute(date, timeZone);

  return formatter.format(dateValue.toDate());
}
