import { useEffect, useRef, useState } from "react";
import { useObjectRef } from "react-aria";
import type {
  DateSegmentProps as AriaDateSegmentProps,
  DateFieldState,
  Key,
  Selection,
} from "react-aria-components";
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Popover as AriaPopover,
  TimeField as AriaTimeField,
} from "react-aria-components";
import { TimeFieldBase } from "../../base/date-time/TimeFieldBase";
import { DescriptionText } from "../../base/DescriptionText";
import { Label } from "../../base/Label";
import { cx } from "@styles/utils";
import type { TimeFieldProps } from "./TimeField";

type TimeSegment = AriaDateSegmentProps["segment"];
type TimeSegmentType = "hour" | "minute" | "second";

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTES_AND_SECONDS = Array.from({ length: 60 }, (_, value) => value);

export interface TimePickerProps extends Omit<TimeFieldProps, "hourCycle"> {
  /** Class name for the time options popover. */
  popoverClassName?: string;
}

interface TimeSegmentListProps {
  label: string;
  values: number[];
  segmentType: TimeSegmentType;
  state: DateFieldState;
}

function isTimeSegment(segment: TimeSegment): segment is TimeSegment & {
  type: TimeSegmentType;
} {
  return (
    segment.type === "hour" ||
    segment.type === "minute" ||
    segment.type === "second"
  );
}

function formatTimePart(value: number) {
  return value.toString().padStart(2, "0");
}

function TimeSegmentList({
  label,
  values,
  segmentType,
  state,
}: TimeSegmentListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const segment = state.segments.find(({ type }) => type === segmentType);
  const selectedValue = segment?.value;
  const selectedKeys =
    selectedValue === null || selectedValue === undefined
      ? new Set<Key>()
      : new Set<Key>([selectedValue]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>("[data-selected]")
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedValue]);

  function handleSelectionChange(selection: Selection) {
    if (selection === "all") return;

    const selectedKey = selection.values().next().value;

    if (selectedKey !== undefined) {
      state.setSegment(segmentType, Number(selectedKey));
    }
  }

  return (
    <AriaListBox
      ref={listRef}
      aria-label={label}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      className="max-h-56 w-11 overflow-y-auto p-0.5 outline-hidden"
    >
      {values.map((value) => (
        <AriaListBoxItem
          key={value}
          id={value}
          textValue={formatTimePart(value)}
          className={({ isDisabled, isFocusVisible, isHovered, isSelected }) =>
            cx(
              "flex cursor-pointer justify-center rounded-md px-2 py-1.5 text-sm text-primary tabular-nums outline-hidden select-none",
              (isHovered || isFocusVisible) &&
                !isSelected &&
                "bg-primary_hover",
              isFocusVisible && "ring-2 ring-focus-ring ring-inset",
              isSelected && "bg-brand-solid font-medium text-white",
              isDisabled && "cursor-not-allowed opacity-50",
            )
          }
        >
          {formatTimePart(value)}
        </AriaListBoxItem>
      ))}
    </AriaListBox>
  );
}

interface TimeOptionsProps {
  granularity: "hour" | "minute" | "second";
  state: DateFieldState;
}

function TimeOptions({ granularity, state }: TimeOptionsProps) {
  return (
    <div
      role="group"
      aria-label="Time options"
      className="flex items-start gap-1"
    >
      <TimeSegmentList
        label="Hours"
        values={HOURS}
        segmentType="hour"
        state={state}
      />
      {granularity !== "hour" && (
        <TimeSegmentList
          label="Minutes"
          values={MINUTES_AND_SECONDS}
          segmentType="minute"
          state={state}
        />
      )}
      {granularity === "second" && (
        <TimeSegmentList
          label="Seconds"
          values={MINUTES_AND_SECONDS}
          segmentType="second"
          state={state}
        />
      )}
    </div>
  );
}

export function TimePicker({
  size = "md",
  granularity = "second",
  shouldForceLeadingZeros = true,
  placeholder,
  icon: Icon,
  label,
  description,
  shortcut,
  hideRequiredIndicator,
  className,
  ref,
  groupRef,
  tooltip,
  iconClassName,
  inputClassName,
  wrapperClassName,
  tooltipClassName,
  popoverClassName,
  isDisabled,
  isReadOnly,
  ...props
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useObjectRef(groupRef);

  function handleSegmentClick(segment: TimeSegment) {
    if (!isDisabled && !isReadOnly && isTimeSegment(segment)) {
      setIsOpen(true);
    }
  }

  function shouldCloseOnInteractOutside(element: Element) {
    return !triggerRef.current?.contains(element);
  }

  return (
    <AriaTimeField
      {...props}
      hourCycle={24}
      granularity={granularity}
      shouldForceLeadingZeros={shouldForceLeadingZeros}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      className={(state) =>
        cx(
          "group flex h-max w-full flex-col items-start justify-start gap-1.5",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {({ isInvalid, state }) => (
        <>
          {label && (
            <Label
              isRequired={
                hideRequiredIndicator
                  ? !hideRequiredIndicator
                  : state.isRequired
              }
              isInvalid={isInvalid}
            >
              {label}
            </Label>
          )}

          <TimeFieldBase
            ref={ref}
            groupRef={triggerRef}
            size={size}
            placeholder={placeholder}
            icon={Icon}
            shortcut={shortcut}
            iconClassName={iconClassName}
            wrapperClassName={wrapperClassName}
            tooltipClassName={tooltipClassName}
            tooltip={tooltip}
            className={inputClassName}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            onSegmentClick={handleSegmentClick}
          />

          <AriaPopover
            triggerRef={triggerRef}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            isNonModal
            placement="bottom start"
            offset={4}
            shouldCloseOnInteractOutside={shouldCloseOnInteractOutside}
            className={({ isEntering, isExiting }) =>
              cx(
                "origin-(--trigger-anchor-point) rounded-lg bg-primary p-1 shadow-lg ring-1 ring-secondary_alt outline-hidden will-change-transform",
                isEntering &&
                  "duration-150 ease-out animate-in fade-in placement-top:slide-in-from-bottom-0.5 placement-bottom:slide-in-from-top-0.5",
                isExiting &&
                  "duration-100 ease-in animate-out fade-out placement-top:slide-out-to-bottom-0.5 placement-bottom:slide-out-to-top-0.5",
                popoverClassName,
              )
            }
          >
            <TimeOptions granularity={granularity} state={state} />
          </AriaPopover>

          {description && (
            <DescriptionText
              isInvalid={isInvalid}
              className={cx(size === "sm" && "text-xs")}
            >
              {description}
            </DescriptionText>
          )}
        </>
      )}
    </AriaTimeField>
  );
}
