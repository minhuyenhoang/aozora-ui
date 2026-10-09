import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { InputTags } from "./InputTags";

const meta = {
  title: "Components/Input/InputTags",
  component: InputTags,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Skills",
    description: "Add the skills that best describe your experience.",
    placeholder: "Type a skill and press Enter",
    size: "md",
    defaultValue: ["React", "TypeScript", "Accessibility"],
    maxTags: 8,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    placeholder: { control: "text" },
    tooltip: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    maxTags: { control: "number" },
    allowDuplicates: { control: "boolean" },
    isRequired: { control: "boolean" },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputTags>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Type a skill and press Enter");
    const tags = () => canvas.getAllByRole("row").map((tag) => tag.textContent);

    await expect(tags()).toEqual(["React", "TypeScript", "Accessibility"]);

    // Enter adds what was typed and clears the input.
    await userEvent.type(input, "  Testing  {Enter}");
    await expect(tags()).toEqual([
      "React",
      "TypeScript",
      "Accessibility",
      "Testing",
    ]);
    await expect(input).toHaveValue("");

    // A tag that is already there is not added again.
    await userEvent.type(input, "React{Enter}");
    await expect(tags()).toHaveLength(4);
    await expect(input).toHaveValue("React");

    // Each tag has a button that removes it.
    await userEvent.click(
      within(canvas.getByRole("row", { name: /^TypeScript/ })).getByRole(
        "button",
        { name: /Remove this tag/ },
      ),
    );
    await expect(tags()).toEqual(["React", "Accessibility", "Testing"]);
  },
};

export const Empty: Story = {
  args: { defaultValue: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Type a skill and press Enter");
    const description =
      "Add the skills that best describe your experience.";

    await expect(canvas.queryByRole("row")).toBeNull();
    await expect(canvas.getByText(description)).toBeVisible();

    // Enter on an empty input adds nothing.
    await userEvent.type(input, "{Enter}");
    await expect(canvas.queryByRole("row")).toBeNull();

    // The description gives way to the tags once there is one.
    await userEvent.type(input, "Design{Enter}");
    await expect(canvas.getByRole("row", { name: "Design" })).toBeVisible();
    await expect(canvas.queryByText(description)).toBeNull();
  },
};
