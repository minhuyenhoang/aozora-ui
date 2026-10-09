import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { IconLogout, IconSettings, IconUser } from "@tabler/icons-react";
import { Separator } from "../surface/Separator";
import { Menu } from "./Menu";

interface MenuStoryArgs {
  defaultOpen: boolean;
  selectionMode: "none" | "single" | "multiple";
  selectionIndicator: "checkmark" | "checkbox" | "radio" | "toggle" | "none";
}

const meta = {
  title: "Components/Collection/Menu",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    defaultOpen: true,
    selectionMode: "single",
    selectionIndicator: "checkmark",
  },
  argTypes: {
    defaultOpen: { control: "boolean" },
    selectionMode: {
      control: "select",
      options: ["none", "single", "multiple"],
    },
    selectionIndicator: {
      control: "select",
      options: ["checkmark", "checkbox", "radio", "toggle", "none"],
    },
  },
  render: ({ defaultOpen, selectionMode, selectionIndicator }) => (
    <Menu.Root defaultOpen={defaultOpen}>
      <Menu.DotsButton />
      <Menu.Popover>
        <Menu.Menu
          aria-label="Account actions"
          selectionMode={selectionMode}
          defaultSelectedKeys={["profile"]}
        >
          <Menu.Item
            id="profile"
            label="Profile"
            icon={IconUser}
            selectionIndicator={selectionIndicator}
          />
          <Menu.Item
            id="settings"
            label="Settings"
            icon={IconSettings}
            addon="⌘,"
            selectionIndicator={selectionIndicator}
          />
          <Separator className="my-1" />
          <Menu.Item id="logout" label="Log out" icon={IconLogout} />
        </Menu.Menu>
      </Menu.Popover>
    </Menu.Root>
  ),
} satisfies Meta<MenuStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const menu = await screen.findByRole("menu");
    const items = within(menu);

    await expect(
      items.getByRole("menuitemradio", { name: "Profile" }),
    ).toBeChecked();
    await expect(
      items.getByRole("menuitemradio", { name: /Settings/ }),
    ).not.toBeChecked();

    // The separator divides the selectable items from the last action.
    const separator = items.getByRole("separator");

    await expect(separator.getBoundingClientRect().height).toBe(1);
    await expect(
      separator.compareDocumentPosition(items.getByText("Log out")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // Arrow keys skip the separator.
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(items.getByText("Log out").closest("[role]")).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await expect(
      within(canvasElement).getByRole("button", { name: "Open menu" }),
    ).toHaveAttribute("aria-expanded", "false");
  },
};

export const MultipleSelection: Story = {
  args: {
    selectionMode: "multiple",
    selectionIndicator: "checkbox",
  },
  play: async () => {
    const menu = await screen.findByRole("menu");
    const profile = within(menu).getByRole("menuitemcheckbox", {
      name: "Profile",
    });
    const settings = within(menu).getByRole("menuitemcheckbox", {
      name: /Settings/,
    });

    await expect(profile).toBeChecked();
    await expect(settings).not.toBeChecked();

    // The menu stays open, so more than one item can be chosen.
    await userEvent.click(settings);
    await expect(settings).toBeChecked();
    await expect(profile).toBeChecked();
    // The menu fades in, so it may not be fully visible yet.
    await waitFor(() => expect(menu).toBeVisible());

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  },
};
