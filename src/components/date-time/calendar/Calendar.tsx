import type { PropsWithChildren, ReactNode } from "react";
import { Fragment, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type {
  CalendarProps as AriaCalendarProps,
  DateValue,
} from "react-aria-components";
import {
  Calendar as AriaCalendar,
  CalendarContext as AriaCalendarContext,
  CalendarGrid as AriaCalendarGrid,
  CalendarGridBody as AriaCalendarGridBody,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarHeaderCell as AriaCalendarHeaderCell,
  CalendarMonthPicker,
  CalendarYearPicker,
  useSlottedContext,
} from "react-aria-components";
import { Button } from "../../button/Button";
import { cx } from "@styles/utils";
import { CalendarCell } from "./CalendarCell";
import { Select } from "../../selection/select/Select";
import { SelectItem } from "../../selection/select/SelectItem";
import { toSelectItems } from "./utils";

export function CalendarContextProvider({
  children,
  defaultValue = null,
}: PropsWithChildren<{
  /** The date selected at first. */
  defaultValue?: DateValue | null;
}>) {
  const [value, setValue] = useState<DateValue | null>(defaultValue);
  const [focusedValue, onFocusChange] = useState<DateValue | undefined>();

  // React Aria's Calendar context widened `onChange` to support multiple selection
  // (`selectionMode="multiple"`). This calendar is single-select, so collapse any
  // array value down to the first entry.
  function onChange(next: DateValue | readonly DateValue[] | null) {
    setValue(Array.isArray(next) ? (next[0] ?? null) : next);
  }

  return (
    <AriaCalendarContext.Provider
      value={{ value, onChange, focusedValue, onFocusChange }}
    >
      {children}
    </AriaCalendarContext.Provider>
  );
}

interface CalendarProps extends AriaCalendarProps<DateValue> {
  /** The dates to highlight. */
  highlightedDates?: DateValue[];
  /**
   * The content to render between the header and the calendar grid.
   * If not provided, a default layout will be rendered with a date input and a today button.
   */
  children?: ReactNode;
}

export function Calendar({
  highlightedDates,
  className,
  children,
  ...props
}: CalendarProps) {
  const context = useSlottedContext(AriaCalendarContext);

  // On its own the calendar keeps its own value, starting from `defaultValue`.
  const ContextWrapper = context ? Fragment : CalendarContextProvider;
  const wrapperProps = context ? {} : { defaultValue: props.defaultValue };

  return (
    <ContextWrapper {...wrapperProps}>
      <AriaCalendar
        {...props}
        className={(state) =>
          cx(
            "flex flex-col gap-3",
            typeof className === "function" ? className(state) : className,
          )
        }
      >
        {() => (
          <>
            <header className="flex items-center gap-1">
              <Button
                slot="previous"
                iconLeading={IconChevronLeft}
                size="sm"
                color="tertiary"
                className="size-8"
              />
              <CalendarMonthPicker>
                {(pickerProps) => (
                  <Select
                    {...pickerProps}
                    items={toSelectItems(pickerProps.items)}
                    size="sm"
                    className="min-w-0 flex-1"
                  >
                    {(item) => <SelectItem {...item} />}
                  </Select>
                )}
              </CalendarMonthPicker>
              <CalendarYearPicker>
                {(pickerProps) => (
                  <Select
                    {...pickerProps}
                    items={toSelectItems(pickerProps.items)}
                    size="sm"
                    className="w-24 shrink-0"
                  >
                    {(item) => <SelectItem {...item} />}
                  </Select>
                )}
              </CalendarYearPicker>
              <Button
                slot="next"
                iconLeading={IconChevronRight}
                size="sm"
                color="tertiary"
                className="size-8"
              />
            </header>

            {children}

            <AriaCalendarGrid weekdayStyle="short" className="w-max">
              <AriaCalendarGridHeader className="border-b-4 border-transparent">
                {(day) => (
                  <AriaCalendarHeaderCell className="p-0">
                    <div className="flex size-10 items-center justify-center text-sm font-medium text-secondary">
                      {day.slice(0, 2)}
                    </div>
                  </AriaCalendarHeaderCell>
                )}
              </AriaCalendarGridHeader>
              <AriaCalendarGridBody className="[&_td]:p-0 [&_tr]:border-b-4 [&_tr]:border-transparent [&_tr:last-of-type]:border-none">
                {(date) => (
                  <CalendarCell
                    date={date}
                    isHighlighted={highlightedDates?.some(
                      (highlightedDate) => date.compare(highlightedDate) === 0,
                    )}
                  />
                )}
              </AriaCalendarGridBody>
            </AriaCalendarGrid>
          </>
        )}
      </AriaCalendar>
    </ContextWrapper>
  );
}
