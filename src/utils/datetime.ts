import { INTL_DATETIME_FORMAT } from "@constants/datetime";
import {
  getLocalTimeZone,
  parseDate,
  parseDateTime,
  DateFormatter,
} from "@internationalized/date";

export type DateTimeFormatterOptions = {
  locale?: string;
  format?: Intl.DateTimeFormatOptions;
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
