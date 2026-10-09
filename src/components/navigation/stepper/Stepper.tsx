import {
  Children,
  type ComponentProps,
  type ReactElement,
  isValidElement,
  useCallback,
  useMemo,
} from "react";
import { useControlledState } from "react-stately/useControlledState";
import { cx } from "@styles/utils";
import type { StepProps } from "./Step";
import {
  type StepState,
  type StepperContent,
  type StepperContextValue,
  type StepperLabels,
  type StepperOrientation,
  type StepperSize,
  StepIndexContext,
  StepperContext,
} from "./StepperContext";

const DEFAULT_LABELS: StepperLabels = {
  completed: "Completed",
  error: "Error",
  loading: "Loading",
};

export interface StepperProps
  extends Omit<ComponentProps<"div">, "children" | "onChange"> {
  /** The `Step` components. They must be direct children. */
  children: ReactElement<StepProps> | ReactElement<StepProps>[];
  /**
   * The index of the step that is shown, counted from 0. A value equal to
   * the number of steps means every step is completed.
   */
  activeStep?: number;
  /**
   * The step shown at first, when `activeStep` is not set.
   * @default 0
   */
  defaultActiveStep?: number;
  /** Called with the new index when the stepper moves to another step. */
  onActiveStepChange?: (activeStep: number) => void;
  /**
   * The direction the steps are laid out in.
   * @default "horizontal"
   */
  orientation?: StepperOrientation;
  /**
   * The size of the steps.
   * @default "md"
   */
  size?: StepperSize;
  /**
   * Whether a step can only be selected once every step before it is
   * completed. Set it to false to let the user jump to any step.
   * @default true
   */
  isLinear?: boolean;
  /** Shown in place of a step once every step is completed. */
  completedContent?: StepperContent;
  /** Overrides the text read out for the state of a step. */
  labels?: Partial<StepperLabels>;
  /** Class name for the content of the active step. */
  contentClassName?: string;
}

/**
 * Shows progress through a sequence of steps, and the content of the active
 * one. Each step is a `Step`.
 */
export function Stepper({
  children,
  activeStep: activeStepProp,
  defaultActiveStep = 0,
  onActiveStepChange,
  orientation = "horizontal",
  size = "md",
  isLinear = true,
  completedContent,
  labels,
  className,
  contentClassName,
  ...props
}: StepperProps) {
  const steps = Children.toArray(children).filter(
    (child): child is ReactElement<StepProps> => isValidElement(child),
  );
  const stepCount = steps.length;

  const [storedActiveStep, setActiveStep] = useControlledState(
    activeStepProp,
    defaultActiveStep,
    onActiveStepChange,
  );
  // Keeps the index usable when steps are removed.
  const activeStep = Math.min(Math.max(storedActiveStep, 0), stepCount);

  const stepStates = steps.map(
    (step, index): StepState =>
      step.props.state ??
      (index < activeStep
        ? "completed"
        : index === activeStep
          ? "active"
          : "upcoming"),
  );
  // Joined, so the context below only changes when a state does.
  const stepStatesKey = stepStates.join(",");

  const goToStep = useCallback(
    (index: number) => setActiveStep(Math.min(Math.max(index, 0), stepCount)),
    [setActiveStep, stepCount],
  );
  const next = useCallback(
    () => goToStep(activeStep + 1),
    [goToStep, activeStep],
  );
  const previous = useCallback(
    () => goToStep(activeStep - 1),
    [goToStep, activeStep],
  );

  const context = useMemo<StepperContextValue>(() => {
    const states = stepStatesKey.split(",") as StepState[];

    return {
      activeStep,
      stepCount,
      isFirstStep: activeStep === 0,
      isLastStep: activeStep === stepCount - 1,
      isFinished: activeStep >= stepCount,
      next,
      previous,
      goToStep,
      orientation,
      size,
      labels: { ...DEFAULT_LABELS, ...labels },
      stepStates: states,
      canSelectStep: (index) =>
        // A step can be reached once every step before it is completed.
        !isLinear ||
        states.slice(0, index).every((state) => state === "completed"),
    };
    // The labels are compared by their text below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeStep,
    stepCount,
    next,
    previous,
    goToStep,
    orientation,
    size,
    isLinear,
    stepStatesKey,
    labels?.completed,
    labels?.error,
    labels?.loading,
  ]);

  const isVertical = orientation === "vertical";
  const isFinished = activeStep >= stepCount;
  // A horizontal stepper shows the content of the active step under the row.
  // A vertical one shows it inside the step, so only the end is shown here.
  const content = isFinished
    ? completedContent
    : isVertical
      ? undefined
      : steps[activeStep]?.props.children;

  return (
    <StepperContext.Provider value={context}>
      <div
        {...props}
        data-orientation={orientation}
        className={cx("flex w-full flex-col", className)}
      >
        <ol
          className={cx(
            "m-0 flex list-none p-0",
            isVertical ? "flex-col" : "w-full items-start",
          )}
        >
          {steps.map((step, index) => (
            <StepIndexContext.Provider key={step.key ?? index} value={index}>
              {step}
            </StepIndexContext.Provider>
          ))}
        </ol>

        {content !== undefined && content !== null && (
          <div
            data-slot="stepper-content"
            className={cx(
              "text-sm text-tertiary",
              isVertical ? "pt-2" : "pt-6",
              contentClassName,
            )}
          >
            {typeof content === "function" ? content(context) : content}
          </div>
        )}
      </div>
    </StepperContext.Provider>
  );
}
