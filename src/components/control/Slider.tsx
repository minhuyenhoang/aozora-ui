import { type ReactNode, type Ref, useId } from "react";
import {
  Slider as AriaSlider,
  SliderFill as AriaSliderFill,
  SliderOutput as AriaSliderOutput,
  type SliderProps as AriaSliderProps,
  SliderThumb as AriaSliderThumb,
  SliderTrack as AriaSliderTrack,
} from "react-aria-components";
import { Label } from "../base/Label";
import { cx } from "@styles/utils";

const styles = {
  sm: {
    root: "gap-1.5",
    output: "text-sm font-medium",
    description: "text-xs",
    track: {
      horizontal: "h-5",
      vertical: "w-5",
    },
    bar: {
      horizontal: "h-1.5",
      vertical: "w-1.5",
    },
    thumb: "size-5",
  },
  md: {
    root: "gap-2",
    output: "text-md font-medium",
    description: "text-sm",
    track: {
      horizontal: "h-6",
      vertical: "w-6",
    },
    bar: {
      horizontal: "h-2",
      vertical: "w-2",
    },
    thumb: "size-6",
  },
};

export interface SliderProps<
  T extends number | number[] = number | number[],
> extends AriaSliderProps<T> {
  ref?: Ref<HTMLDivElement>;
  size?: "sm" | "md";
  label?: ReactNode;
  description?: ReactNode;
  /** Hides the current value displayed next to the label. */
  hideOutput?: boolean;
}

export function Slider<T extends number | number[]>({
  label,
  description,
  hideOutput,
  size = "sm",
  className,
  ...sliderProps
}: SliderProps<T>) {
  const descriptionId = useId();

  return (
    <AriaSlider
      {...sliderProps}
      className={(state) =>
        cx(
          "group relative flex touch-none flex-col select-none",
          state.orientation === "horizontal"
            ? "w-full"
            : "h-full w-max items-center",
          state.isDisabled && "cursor-not-allowed",
          styles[size].root,
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {({ orientation, state }) => (
        <>
          {(label || !hideOutput) && (
            <div
              className={cx(
                "flex items-center justify-between gap-2",
                orientation === "vertical" && "flex-col gap-0.5",
              )}
            >
              {label && <Label>{label}</Label>}

              {!hideOutput && (
                <AriaSliderOutput
                  className={cx(
                    "text-primary tabular-nums",
                    !label && orientation === "horizontal" && "ml-auto",
                    styles[size].output,
                  )}
                >
                  {state.values
                    .map((_, index) => state.getThumbValueLabel(index))
                    .join(" – ")}
                </AriaSliderOutput>
              )}
            </div>
          )}

          <AriaSliderTrack
            className={({ isDisabled }) =>
              cx(
                "relative",
                orientation === "horizontal" ? "w-full" : "min-h-32 flex-1",
                isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                styles[size].track[orientation],
              )
            }
          >
            <div
              className={cx(
                "absolute rounded-full bg-quaternary",
                orientation === "horizontal"
                  ? "top-1/2 w-full -translate-y-1/2"
                  : "left-1/2 h-full -translate-x-1/2",
                styles[size].bar[orientation],
              )}
            >
              {/* The fill always spans the cross axis of its parent, so it's sized by the bar. */}
              <AriaSliderFill className="pointer-events-none rounded-full bg-brand-solid" />
            </div>

            {state.values.map((_, index) => (
              <AriaSliderThumb
                key={index}
                index={index}
                aria-describedby={description ? descriptionId : undefined}
                className={({ isDragging, isFocusVisible, isDisabled }) =>
                  cx(
                    "rounded-full bg-slider-handle-bg shadow-md ring-2 ring-slider-handle-border outline-focus-ring transition duration-150 ease-linear ring-inset",
                    orientation === "horizontal" ? "top-1/2" : "left-1/2",
                    isDisabled ? "cursor-not-allowed" : "cursor-grab",
                    isDragging && "cursor-grabbing shadow-lg",
                    isFocusVisible && "outline-2 outline-offset-2",
                    styles[size].thumb,
                  )
                }
              />
            ))}
          </AriaSliderTrack>

          {description && (
            <span
              id={descriptionId}
              className={cx("text-tertiary", styles[size].description)}
            >
              {description}
            </span>
          )}
        </>
      )}
    </AriaSlider>
  );
}
