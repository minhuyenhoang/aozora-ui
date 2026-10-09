import { type ReactNode, createContext, useContext } from "react";

export type StepperOrientation = "horizontal" | "vertical";

export type StepperSize = "sm" | "md";

/**
 * Where a step stands. `upcoming`, `active` and `completed` follow from the
 * position of the step. `error` and `loading` are set on the step itself.
 */
export type StepState =
  | "upcoming"
  | "active"
  | "completed"
  | "error"
  | "loading";

export interface StepperLabels {
  /** Read out after the label of a completed step. */
  completed: string;
  /** Read out after the label of a step with an error. */
  error: string;
  /** Read out after the label of a step that is loading. */
  loading: string;
}

/** The state of the stepper, and the functions that move between steps. */
export interface StepperState {
  /** The index of the step that is shown, counted from 0. */
  activeStep: number;
  /** How many steps there are. */
  stepCount: number;
  /** Whether the first step is shown. */
  isFirstStep: boolean;
  /** Whether the last step is shown. */
  isLastStep: boolean;
  /** Whether every step has been completed. */
  isFinished: boolean;
  /** Goes to the next step, marking the current one as completed. */
  next: () => void;
  /** Goes back to the previous step. */
  previous: () => void;
  /** Goes to the step with the given index. */
  goToStep: (index: number) => void;
}

/** Content that can read the stepper, for example to render a Next button. */
export type StepperContent = ReactNode | ((stepper: StepperState) => ReactNode);

export interface StepperContextValue extends StepperState {
  orientation: StepperOrientation;
  size: StepperSize;
  labels: StepperLabels;
  /** The state of every step, in order. */
  stepStates: StepState[];
  /** Whether the user can go to the step by pressing it. */
  canSelectStep: (index: number) => boolean;
}

export const StepperContext = createContext<StepperContextValue | null>(null);

/** The position of a step in its stepper. Set by the stepper for each step. */
export const StepIndexContext = createContext<number | null>(null);

export function useStepperContext() {
  const context = useContext(StepperContext);

  if (!context) {
    throw new Error("Step must be used within a Stepper component");
  }

  return context;
}

/**
 * Reads the stepper from anywhere inside it, for example in a form that
 * goes to the next step once it has been saved.
 */
export function useStepper(): StepperState {
  const {
    activeStep,
    stepCount,
    isFirstStep,
    isLastStep,
    isFinished,
    next,
    previous,
    goToStep,
  } = useStepperContext();

  return {
    activeStep,
    stepCount,
    isFirstStep,
    isLastStep,
    isFinished,
    next,
    previous,
    goToStep,
  };
}
