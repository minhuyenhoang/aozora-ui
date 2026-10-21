import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import { IconCode, IconPalette, IconSpeakerphone } from "@tabler/icons-react";
import { ComboBox } from "./ComboBox";
import { SelectItem } from "./select/SelectItem";
import type { SelectItemType } from "./types";

const items: SelectItemType[] = [
  {
    id: "design",
    label: "Design",
    supportingText: "Product and brand",
    icon: IconPalette,
  },
  {
    id: "engineering",
    label: "Engineering",
    supportingText: "Web and platform",
    icon: IconCode,
  },
  {
    id: "marketing",
    label: "Marketing",
    supportingText: "Growth and content",
    icon: IconSpeakerphone,
  },
];

const meta = {
  title: "Components/Selection/ComboBox",
  component: ComboBox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Team",
    description: "Search for the team responsible for this project.",
    placeholder: "Search teams",
    size: "md",
    items,
    children: (item: SelectItemType) => <SelectItem {...item} />,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    placeholder: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    required: { control: "boolean" },
    isClearable: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: /Team/ });

    await expect(canvas.queryByText("⌘K")).not.toBeInTheDocument();

    // Focusing the input opens the list with every team.
    await userEvent.click(input);

    const listbox = await screen.findByRole("listbox");

    await expect(within(listbox).getAllByRole("option")).toHaveLength(3);

    // Typing narrows the list down.
    await userEvent.type(input, "eng");
    await waitFor(() =>
      expect(within(listbox).getAllByRole("option")).toHaveLength(1),
    );
    await userEvent.click(
      within(listbox).getByRole("option", { name: /Engineering/ }),
    );

    // Choosing a team fills the input with its label and supporting text,
    // and closes the list.
    await expect(input).toHaveValue("Engineering Web and platform");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  },
};

export const Clearable: Story = {
  args: { isClearable: true, onClear: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: /Team/ });

    await expect(
      canvas.queryByRole("button", { name: "Clear" }),
    ).not.toBeInTheDocument();
    await userEvent.type(input, "eng");

    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
    await expect(args.onClear).toHaveBeenCalledOnce();
    await expect(
      canvas.queryByRole("button", { name: "Clear" }),
    ).not.toBeInTheDocument();
  },
};

export const Required: Story = {
  args: { required: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("combobox", { name: /Team/ }),
    ).toBeRequired();
    await expect(canvas.getByText("*")).toBeVisible();
  },
};
