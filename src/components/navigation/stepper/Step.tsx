import { type FC, type ReactNode, isValidElement, useContext } from "react";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { cx, sortCx } from "@styles/utils";
import { isReactComponent } from "@utils/componentCheck";
import { Loader } from "../../status/Loader";
import {
  type StepState,
  type StepperContent,
  StepIndexContext,
  useStepperContext,
} from "./StepperContext";

const styles = sortCx({
  sizes: {
    sm: {
      indicator: "size-6 text-xs",
      icon: "size-3.5 stroke-[2.5px]",
      label: "text-sm",
      description: "text-xs",
      // Lines up with the middle of the indicator.
      horizontalLine: "mt-[11px]",
      verticalLine: "top-8 left-[11px]",
      content: "pl-9",
    },
    md: {
      indicator: "size-8 text-sm",
      icon: "size-4 stroke-[2.5px]",
      label: "text-sm",
      description: "text-sm",
      horizontalLine: "mt-[15px]",
      verticalLine: "top-10 left-[15px]",
      content: "pl-11",
    },
  },
  states: {
    upcoming: {
      indicator: "bg-primary text-quaternary ring-1 ring-secondary",
      label: "text-tertiary",
    },
    active: {
      indicator: "bg-primary text-brand-secondary ring-2 ring-brand",
      label: "text-brand-secondary",
    },
    completed: {
      indicator: "bg-brand-solid text-white",
      label: "text-secondary",
    },
    error: {
      indicator:
        "bg-destructive-primary text-fg-destructive-primary ring-2 ring-destructive",
      label: "text-destructive-primary",
    },
    loading: {
      indicator: "bg-primary text-fg-brand-primary ring-1 ring-secondary",
      label: "text-brand-secondary",
    },
  },
});

export interface StepProps
  extends Omit<AriaButtonProps, "children" | "className" | "onPress"> {
  /** The name of the step. */
  label: ReactNode;
  /** A line of supporting text under the label. */
  description?: ReactNode;
  /** Icon component or element shown in place of the number of the step. */
  icon?: FC<{ className?: string }> | ReactNode;
  /**
   * Sets the state of the step by hand. Without it, a step before the active
   * one is `completed`, the active one is `active`, and the rest are
   * `upcoming`. Use it for `error` and `loading`.
   */
  state?: StepState;
  /**
   * The content of the step, shown while it is the active one. A function
   * receives the stepper, to go to the next or the previous step.
   */
  children?: StepperContent;
  className?: string;
}

/** One step of a `Stepper`: its marker, its label and its content. */
export function Step({
  label,
  description,
  icon: Icon,
  children,
  className,
  // Read by the stepper, which works out the state of every step.
  state: _state,
  isDisabled,
  ...props
}: StepProps) {
  const stepper = useStepperContext();
  const index = useContext(StepIndexContext);

  if (index === null) {
    throw new Error("Step must be a direct child of a Stepper component");
  }

  const { orientation, size, labels, goToStep } = stepper;
  const stepNumber = index + 1;
  const state = stepper.stepStates[index];
  const isVertical = orientation === "vertical";
  const isActive = index === stepper.activeStep;
  const isLast = index === stepper.stepCount - 1;
  // The line after a step is filled once that step is behind the user.
  const isLineFilled = state === "completed";
  const stateLabel =
    state === "completed" || state === "error" || state === "loading"
      ? labels[state]
      : undefined;

  function renderIndicator() {
    if (state === "loading") {
      return <Loader className={styles.sizes[size].icon} />;
    }
    if (state === "error") {
      return (
        <IconAlertCircle aria-hidden="true" className={styles.sizes[size].icon} />
      );
    }
    if (state === "completed") {
      return <IconCheck aria-hidden="true" className={styles.sizes[size].icon} />;
    }
    if (isValidElement(Icon)) return Icon;
    if (isReactComponent(Icon)) {
      return <Icon aria-hidden="true" className={styles.sizes[size].icon} />;
    }

    return stepNumber;
  }

  return (
    <li
      data-slot="step"
      data-state={state}
      className={cx(
        "relative flex",
        isVertical ? "flex-col" : "items-start",
        // Every step but the last grows, to make room for its line.
        !isVertical && !isLast && "flex-1",
        className,
      )}
    >
      <AriaButton
        {...props}
        isDisabled={isDisabled || !stepper.canSelectStep(index)}
        aria-current={isActive ? "step" : undefined}
        onPress={() => goToStep(index)}
        className={(button) =>
          cx(
            "group flex shrink-0 cursor-pointer items-start gap-3 rounded-lg text-left outline-focus-ring transition duration-100 ease-linear",
            button.isFocusVisible && "outline-2 outline-offset-2",
            button.isDisabled && "cursor-not-allowed",
            // A step that cannot be reached yet is dimmed. An error or a
            // loading step keeps its full color, so it is not missed.
            button.isDisabled && state === "upcoming" && "opacity-60",
          )
        }
      >
        <span
          data-slot="step-indicator"
          className={cx(
            "flex shrink-0 items-center justify-center rounded-full font-semibold ring-inset transition-inherit-all",
            styles.sizes[size].indicator,
            styles.states[state].indicator,
          )}
        >
          {renderIndicator()}
        </span>

        <span className="flex min-w-0 flex-col">
          <span
            className={cx(
              "font-semibold transition-inherit-all",
              // Centers a lone label on the indicator.
              !description && (size === "md" ? "py-1.5" : "py-0.5"),
              styles.sizes[size].label,
              styles.states[state].label,
            )}
          >
            {label}
            {stateLabel && <span className="sr-only"> ({stateLabel})</span>}
          </span>
          {description && (
            <span
              className={cx("text-tertiary", styles.sizes[size].description)}
            >
              {description}
            </span>
          )}
        </span>
      </AriaButton>

      {/* The line to the next step. */}
      {!isLast && (
        <span
          aria-hidden="true"
          data-slot="step-line"
          className={cx(
            "rounded-full transition duration-200 ease-linear",
            isLineFilled ? "bg-brand-solid" : "bg-border-secondary",
            isVertical
              ? cx("absolute bottom-1 w-0.5", styles.sizes[size].verticalLine)
              : cx(
                  "mx-3 h-0.5 min-w-6 flex-1",
                  styles.sizes[size].horizontalLine,
                ),
          )}
        />
      )}

      {/* A vertical stepper shows the content under its own step. */}
      {isVertical && (
        <div
          data-slot="step-content"
          className={cx(
            "min-h-6 text-sm text-tertiary",
            styles.sizes[size].content,
            isActive && children ? "pt-3 pb-6" : !isLast && "pb-4",
          )}
        >
          {isActive &&
            (typeof children === "function" ? children(stepper) : children)}
        </div>
      )}
    </li>
  );
}
