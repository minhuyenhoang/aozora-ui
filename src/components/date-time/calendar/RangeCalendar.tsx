import type { HTMLAttributes, PropsWithChildren } from "react";
import { Fragment, useContext, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useDateFormatter } from "react-aria";
import type {
  RangeCalendarProps as AriaRangeCalendarProps,
  DateValue,
} from "react-aria-components";
import {
  CalendarGrid as AriaCalendarGrid,
  CalendarGridBody as AriaCalendarGridBody,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarHeaderCell as AriaCalendarHeaderCell,
  RangeCalendar as AriaRangeCalendar,
  CalendarMonthPicker,
  CalendarYearPicker,
  RangeCalendarContext,
  RangeCalendarStateContext,
  useSlottedContext,
} from "react-aria-components";
import { Button } from "../../button/Button";
import { useBreakpoint } from "@hooks/useBreakpoint";
import { cx } from "@styles/utils";
import { CalendarCell } from "./CalendarCell";
import { SelectItem } from "../../selection/select/SelectItem";
import { toSelectItems } from "./utils";
import { Select } from "../../selection/select/Select";

export const RangeCalendarContextProvider = ({
  children,
  defaultValue = null,
}: PropsWithChildren<{
  /** The range selected at first. */
  defaultValue?: { start: DateValue; end: DateValue } | null;
}>) => {
  const [value, onChange] = useState<{
    start: DateValue;
    end: DateValue;
  } | null>(defaultValue);
  const [focusedValue, onFocusChange] = useState<DateValue | undefined>();

  return (
    <RangeCalendarContext.Provider
      value={{ value, onChange, focusedValue, onFocusChange }}
    >
      {children}
    </RangeCalendarContext.Provider>
  );
};

const RangeCalendarTitle = ({ part }: { part: "start" | "end" }) => {
  const context = useContext(RangeCalendarStateContext);

  if (!context) {
    throw new Error(
      "<RangeCalendarTitle /> must be used within a <RangeCalendar /> component.",
    );
  }

  const formatter = useDateFormatter({
    month: "long",
    year: "numeric",
    calendar: context.visibleRange.start.calendar.identifier,
    timeZone: context.timeZone,
  });

  return part === "start"
    ? formatter.format(context.visibleRange.start.toDate(context.timeZone))
    : formatter.format(context.visibleRange.end.toDate(context.timeZone));
};

interface RangeCalendarPresetButtonProps extends HTMLAttributes<HTMLButtonElement> {
  value: { start: DateValue; end: DateValue };
}

export const RangeCalendarPresetButton = ({
  value,
  className,
  children,
  ...props
}: RangeCalendarPresetButtonProps) => {
  const context = useSlottedContext(RangeCalendarContext);

  const isSelected =
    context?.value?.start?.compare(value.start) === 0 &&
    context?.value?.end?.compare(value.end) === 0;

  return (
    <button
      {...props}
      className={cx(
        "cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium text-white outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2",
        isSelected
          ? "bg-secondary text-secondary_hover hover:bg-secondary_hover"
          : "text-secondary hover:bg-primary_hover hover:text-secondary_hover",
        className,
      )}
    >
      {children}
    </button>
  );
};

interface RangeCalendarProps extends AriaRangeCalendarProps<DateValue> {
  /** The dates to highlight. */
  highlightedDates?: DateValue[];
  /** The date presets to display. */
  presets?: Record<
    string,
    { label: string; value: { start: DateValue; end: DateValue } }
  >;
  /** Whether to show out of range dates. */
  showOutOfRangeDates?: boolean;
  /** Whether to show presets on desktop. */
  showPresetsOnDesktop?: boolean;
}

export const RangeCalendar = ({
  presets,
  visibleDuration,
  showOutOfRangeDates = false,
  showPresetsOnDesktop = false,
  ...props
}: RangeCalendarProps) => {
  const isDesktop = useBreakpoint("md");
  const context = useSlottedContext(RangeCalendarContext);

  // On its own the calendar keeps its own value, starting from `defaultValue`.
  const ContextWrapper = context ? Fragment : RangeCalendarContextProvider;
  const wrapperProps = context ? {} : { defaultValue: props.defaultValue };

  const visibleDurationMonths = visibleDuration?.months || (isDesktop ? 2 : 1);

  return (
    <ContextWrapper {...wrapperProps}>
      <AriaRangeCalendar
        {...props}
        className={(state) =>
          cx(
            "flex",
            typeof props.className === "function"
              ? props.className(state)
              : props.className,
          )
        }
        visibleDuration={{
          months: visibleDurationMonths,
        }}
      >
        <div className="flex flex-col gap-3 px-6 py-5 md:gap-2">
          <header
            className={cx(
              "relative flex items-center",
              visibleDurationMonths > 1 ? "justify-start" : "justify-between",
            )}
          >
            <Button
              slot="previous"
              iconLeading={IconChevronLeft}
              size="sm"
              color="tertiary"
              className="size-8"
            />

            {visibleDurationMonths > 1 ? (
              <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-semibold text-fg-secondary">
                <RangeCalendarTitle part="start" />
              </h2>
            ) : (
              <div className="flex items-center gap-1">
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
              </div>
            )}

            {visibleDurationMonths === 1 && (
              <Button
                slot="next"
                iconLeading={IconChevronRight}
                size="sm"
                color="tertiary"
                className="size-8"
              />
            )}
          </header>

          <AriaCalendarGrid weekdayStyle="short" className="w-max">
            <AriaCalendarGridHeader>
              {(day) => (
                <AriaCalendarHeaderCell className="border-b-4 border-transparent p-0">
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
                  showOutOfRangeDates={showOutOfRangeDates}
                />
              )}
            </AriaCalendarGridBody>
          </AriaCalendarGrid>
        </div>

        {visibleDurationMonths > 1 && (
          <div className="flex flex-col gap-3 border-l border-secondary px-6 py-5">
            <header className="relative flex items-center justify-end">
              <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-semibold text-fg-secondary">
                <RangeCalendarTitle part="end" />
              </h2>

              <Button
                slot="next"
                iconLeading={IconChevronRight}
                size="sm"
                color="tertiary"
                className="size-8"
              />
            </header>

            <AriaCalendarGrid
              weekdayStyle="short"
              offset={{ months: 1 }}
              className="w-max"
            >
              <AriaCalendarGridHeader>
                {(day) => (
                  <AriaCalendarHeaderCell className="border-b-4 border-transparent p-0">
                    <div className="flex size-10 items-center justify-center text-sm font-medium text-secondary">
                      {day.slice(0, 2)}
                    </div>
                  </AriaCalendarHeaderCell>
                )}
              </AriaCalendarGridHeader>
              <AriaCalendarGridBody className="[&_td]:p-0 [&_tr]:border-b-4 [&_tr]:border-transparent [&_tr:last-of-type]:border-none">
                {(date) => <CalendarCell date={date} />}
              </AriaCalendarGridBody>
            </AriaCalendarGrid>
          </div>
        )}
      </AriaRangeCalendar>
    </ContextWrapper>
  );
};
