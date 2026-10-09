import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { IconCode, IconPalette, IconSpeakerphone } from "@tabler/icons-react";
import { Select } from "../select/Select";
import { SelectItem } from "../select/SelectItem";
import type { SelectItemType } from "../types";

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
  title: "Components/Selection/Select",
  component: Select,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Team",
    description: "Choose the team responsible for this project.",
    placeholder: "Select a team",
    size: "md",
    items,
    children: (item: SelectItemType) => <SelectItem {...item} />,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    placeholder: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Team/ });

    await expect(trigger).toHaveTextContent("Select a team");
    await waitFor(() =>
      expect(
        canvas.getByText("Choose the team responsible for this project."),
      ).toBeVisible(),
    );

    await userEvent.click(trigger);

    const listbox = await screen.findByRole("listbox");

    await expect(within(listbox).getAllByRole("option")).toHaveLength(3);
    await waitFor(() =>
      expect(within(listbox).getByText("Product and brand")).toBeVisible(),
    );

    // Choosing a team shows it in the trigger and closes the list.
    await userEvent.click(
      within(listbox).getByRole("option", { name: /Marketing/ }),
    );
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await expect(trigger).toHaveTextContent("Marketing");

    // Opened again, the chosen team is the selected option.
    await userEvent.click(trigger);
    await expect(
      within(await screen.findByRole("listbox")).getByRole("option", {
        name: /Marketing/,
      }),
    ).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  },
};
