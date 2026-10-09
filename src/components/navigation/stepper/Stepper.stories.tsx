import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconCreditCard, IconTruck, IconUser } from "@tabler/icons-react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../../button/Button";
import { Step } from "./Step";
import { Stepper } from "./Stepper";
import { type StepperState, useStepper } from "./StepperContext";

/** The Back and Next buttons shown under the content of each step. */
function Actions({ stepper }: { stepper: StepperState }) {
  return (
    <div className="mt-4 flex gap-3">
      <Button
        color="secondary"
        isDisabled={stepper.isFirstStep}
        onPress={stepper.previous}
      >
        Back
      </Button>
      <Button onPress={stepper.next}>
        {stepper.isLastStep ? "Finish" : "Next"}
      </Button>
    </div>
  );
}

const meta = {
  title: "Components/Navigation/Stepper",
  component: Stepper,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    orientation: "horizontal",
    size: "md",
    isLinear: true,
    onActiveStepChange: fn(),
    children: [],
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
    isLinear: { control: "boolean" },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="w-[min(92vw,44rem)]">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Stepper
      {...args}
      completedContent={(stepper) => (
        <div>
          <p>The order has been placed.</p>
          <Button
            color="secondary"
            className="mt-4"
            onPress={() => stepper.goToStep(0)}
          >
            Start again
          </Button>
        </div>
      )}
    >
      <Step label="Account" description="Your details">
        {(stepper) => (
          <>
            <p>Enter your name and email address.</p>
            <Actions stepper={stepper} />
          </>
        )}
      </Step>
      <Step label="Shipping" description="Where to send it">
        {(stepper) => (
          <>
            <p>Enter the address the order is sent to.</p>
            <Actions stepper={stepper} />
          </>
        )}
      </Step>
      <Step label="Payment" description="How you pay">
        {(stepper) => (
          <>
            <p>Choose a payment method.</p>
            <Actions stepper={stepper} />
          </>
        )}
      </Step>
    </Stepper>
  ),
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const step = (canvasElement: HTMLElement, name: RegExp) =>
  within(canvasElement).getByRole("button", { name });

/** The state of each step, in order. */
const states = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll("[data-slot=step]")).map((item) =>
    item.getAttribute("data-state"),
  );

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const next = () => canvas.getByRole("button", { name: "Next" });

    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    await expect(states(canvasElement)).toEqual([
      "active",
      "upcoming",
      "upcoming",
    ]);
    await expect(step(canvasElement, /Account/)).toHaveAttribute(
      "aria-current",
      "step",
    );
    await expect(canvas.getByText(/name and email address/)).toBeVisible();
    // A step shows its number until it is completed.
    await expect(step(canvasElement, /Shipping/)).toHaveTextContent(/^2/);

    // The next steps cannot be selected while this one is not completed.
    await expect(step(canvasElement, /Shipping/)).toBeDisabled();
    await expect(step(canvasElement, /Payment/)).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Back" })).toBeDisabled();

    // The content goes on with the function it is given.
    await userEvent.click(next());
    await expect(states(canvasElement)).toEqual([
      "completed",
      "active",
      "upcoming",
    ]);
    await expect(args.onActiveStepChange).toHaveBeenLastCalledWith(1);
    await expect(canvas.getByText(/address the order is sent to/)).toBeVisible();
    await expect(canvas.queryByText(/name and email address/)).toBeNull();
    // A completed step shows a check, and says so to screen readers.
    await expect(
      step(canvasElement, /Account/).querySelector(".tabler-icon-check"),
    ).toBeVisible();
    await expect(step(canvasElement, /Account/)).toHaveAccessibleName(
      /Account \(Completed\)/,
    );

    // A completed step can be selected, to go back to it.
    await userEvent.click(step(canvasElement, /Account/));
    await expect(states(canvasElement)).toEqual([
      "active",
      "upcoming",
      "upcoming",
    ]);
    await expect(step(canvasElement, /Shipping/)).toBeDisabled();

    // After the last step every step is completed.
    await userEvent.click(next());
    await userEvent.click(next());
    await userEvent.click(canvas.getByRole("button", { name: "Finish" }));
    await expect(states(canvasElement)).toEqual([
      "completed",
      "completed",
      "completed",
    ]);
    await expect(canvas.getByText("The order has been placed.")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Start again" }));
    await expect(states(canvasElement)[0]).toBe("active");
  },
};

/** The content of the active step is shown under that step. */
export const Vertical: Story = {
  args: { orientation: "vertical" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const top = (name: RegExp) =>
      step(canvasElement, name).getBoundingClientRect().top;

    // The steps are stacked, with the content between the first two.
    const content = canvas.getByText(/name and email address/);

    await expect(top(/Shipping/)).toBeGreaterThan(top(/Account/));
    await expect(content.getBoundingClientRect().top).toBeGreaterThan(
      top(/Account/),
    );
    await expect(content.getBoundingClientRect().bottom).toBeLessThan(
      top(/Shipping/),
    );

    // Going on moves the content under the second step.
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));

    const nextContent = canvas.getByText(/address the order is sent to/);

    await expect(nextContent.getBoundingClientRect().top).toBeGreaterThan(
      top(/Shipping/),
    );
    await expect(nextContent.getBoundingClientRect().bottom).toBeLessThan(
      top(/Payment/),
    );
  },
};

/** With `isLinear` off, any step can be selected at any time. */
export const NonLinear: Story = {
  args: { isLinear: false },
  play: async ({ canvasElement }) => {
    await expect(step(canvasElement, /Payment/)).toBeEnabled();

    await userEvent.click(step(canvasElement, /Payment/));
    await expect(states(canvasElement)).toEqual([
      "completed",
      "completed",
      "active",
    ]);
    await expect(
      within(canvasElement).getByText("Choose a payment method."),
    ).toBeVisible();
  },
};

/** An icon takes the place of the number of a step. */
export const WithIcons: Story = {
  args: { defaultActiveStep: 1 },
  render: (args) => (
    <Stepper {...args}>
      <Step label="Account" icon={IconUser}>
        Enter your name and email address.
      </Step>
      <Step label="Shipping" icon={IconTruck}>
        Enter the address the order is sent to.
      </Step>
      <Step label="Payment" icon={IconCreditCard}>
        Choose a payment method.
      </Step>
    </Stepper>
  ),
  play: async ({ canvasElement }) => {
    const icon = (name: RegExp, icon: string) =>
      step(canvasElement, name).querySelector(`.tabler-icon-${icon}`);

    // A completed step shows the check instead of its icon.
    await expect(icon(/Account/, "check")).toBeVisible();
    await expect(icon(/Account/, "user")).toBeNull();
    await expect(icon(/Shipping/, "truck")).toBeVisible();
    await expect(icon(/Payment/, "credit-card")).toBeVisible();
    // With an icon there is no number.
    await expect(step(canvasElement, /Payment/)).toHaveTextContent(/^Payment$/);
  },
};

/** `state` on a step shows an error, or that the step is being saved. */
export const ErrorAndLoading: Story = {
  args: { defaultActiveStep: 2 },
  render: (args) => (
    <Stepper {...args}>
      <Step label="Account" description="Saving" state="loading">
        Enter your name and email address.
      </Step>
      <Step label="Shipping" description="The address is missing" state="error">
        Enter the address the order is sent to.
      </Step>
      <Step label="Payment" description="How you pay">
        Choose a payment method.
      </Step>
    </Stepper>
  ),
  play: async ({ canvasElement }) => {
    const account = step(canvasElement, /Account/);
    const shipping = step(canvasElement, /Shipping/);

    await expect(states(canvasElement)).toEqual(["loading", "error", "active"]);
    await expect(account).toHaveAccessibleName(/Account \(Loading\)/);
    await expect(shipping).toHaveAccessibleName(/Shipping \(Error\)/);
    await expect(account.querySelector("svg .animate-spin")).not.toBeNull();
    await expect(
      shipping.querySelector(".tabler-icon-alert-circle"),
    ).toBeVisible();

    // A step after one that is not completed cannot be selected.
    await expect(account).toBeEnabled();
    await expect(shipping).toBeDisabled();
  },
};

export const Small: Story = {
  args: { size: "sm" },
  play: async ({ canvasElement }) => {
    const indicator = canvasElement
      .querySelector("[data-slot=step-indicator]")!
      .getBoundingClientRect();

    await expect(indicator.width).toBe(24);
    await expect(indicator.height).toBe(24);
  },
};

/** The parent holds the active step, and can change it from outside. */
export const Controlled: Story = {
  args: {
    activeStep: 8,
    defaultActiveStep: 1
  },

  render: function Render(args) {
    const [activeStep, setActiveStep] = useState(1);

    return (
      <div className="flex flex-col gap-6">
        <Stepper
          {...args}
          activeStep={activeStep}
          onActiveStepChange={setActiveStep}
        >
          <Step label="Account">Enter your name and email address.</Step>
          <Step label="Shipping">Enter the address the order is sent to.</Step>
          <Step label="Payment">Choose a payment method.</Step>
        </Stepper>
        <div className="flex items-center gap-3">
          <Button color="secondary" onPress={() => setActiveStep(0)}>
            Reset
          </Button>
          <output data-testid="active" className="text-sm text-tertiary">
            Active step: {activeStep}
          </output>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const output = canvas.getByTestId("active");

    await expect(output).toHaveTextContent("Active step: 1");
    await expect(states(canvasElement)).toEqual([
      "completed",
      "active",
      "upcoming",
    ]);

    await userEvent.click(step(canvasElement, /Account/));
    await expect(output).toHaveTextContent("Active step: 0");

    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(states(canvasElement)[0]).toBe("active");
  }
};

/** A form deep in the content, going on with `useStepper`. */
function SaveButton() {
  const stepper = useStepper();
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Button
      className="mt-4"
      isLoading={isSaving}
      showTextWhileLoading
      onPress={() => {
        setIsSaving(true);
        setTimeout(() => {
          setIsSaving(false);
          stepper.next();
        }, 150);
      }}
    >
      Save and continue
    </Button>
  );
}

/** `useStepper` reads the stepper from any component inside it. */
export const WithUseStepper: Story = {
  render: (args) => (
    <Stepper {...args}>
      <Step label="Account">
        <p>Enter your name and email address.</p>
        <SaveButton />
      </Step>
      <Step label="Shipping">Enter the address the order is sent to.</Step>
    </Stepper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Save and continue" }),
    );
    await waitFor(() =>
      expect(states(canvasElement)).toEqual(["completed", "active"]),
    );
  },
};

/** The steps can be reached and selected with the keyboard. */
export const Keyboard: Story = {
  args: { defaultActiveStep: 2 },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(step(canvasElement, /Account/)).toHaveFocus();
    await userEvent.tab();
    await expect(step(canvasElement, /Shipping/)).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await expect(states(canvasElement)).toEqual([
      "completed",
      "active",
      "upcoming",
    ]);
  },
};
