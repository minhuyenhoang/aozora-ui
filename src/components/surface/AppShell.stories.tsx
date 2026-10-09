import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  IconChartBar,
  IconFolder,
  IconHome,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import type { NavItemDividerType, NavItemType } from "../navigation/constants";
import { SIDEBAR_STORAGE_KEY } from "../navigation/sidebar/Sidebar";
import { AppShell } from "./AppShell";

const items: (NavItemType | NavItemDividerType)[] = [
  { label: "Home", href: "/", icon: IconHome },
  { label: "Dashboard", href: "/dashboard", icon: IconChartBar },
  {
    label: "Projects",
    href: "/projects",
    icon: IconFolder,
    items: [
      { label: "Overview", href: "/projects/overview" },
      { label: "Archived", href: "/projects/archived" },
    ],
  },
  { divider: true },
  { label: "Team", href: "/team", icon: IconUsers },
  { label: "Settings", href: "/settings", icon: IconSettings },
];

const meta = {
  title: "Components/Layout/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
  // Each story starts without a remembered sidebar state.
  beforeEach: () => {
    localStorage.removeItem(SIDEBAR_STORAGE_KEY);
  },
  args: {
    items,
    activeUrl: "/dashboard",
    defaultCollapsed: false,
    header: <span className="text-md font-semibold text-primary">Acme</span>,
    sidebarHeader: (
      <span className="text-sm font-semibold text-tertiary">Workspace</span>
    ),
    children: (
      <div className="flex flex-col gap-3 p-6">
        <h1 className="text-xl font-semibold text-primary">Dashboard</h1>
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index} className="text-md text-tertiary">
            Page content paragraph {index + 1}. Collapse the sidebar with the
            button in the top bar, then hover that button to peek at it.
          </p>
        ))}
      </div>
    ),
  },
  argTypes: {
    defaultCollapsed: { control: "boolean" },
    header: { control: false },
    sidebarHeader: { control: false },
    children: { control: false },
  },
  // Remount so a changed `defaultCollapsed` control takes effect.
  render: (args) => <AppShell key={String(args.defaultCollapsed)} {...args} />,
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sidebar = canvasElement.querySelector("aside")!;

    await expect(sidebar).toHaveAttribute("data-state", "expanded");
    await expect(canvas.getByText("Acme")).toBeVisible();
    await expect(canvas.getByText("Workspace")).toBeVisible();
    await expect(
      canvas.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();

    // The item for the active URL is marked as the current page.
    await expect(
      within(sidebar).getByRole("link", { name: "Dashboard" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      within(sidebar).getByRole("link", { name: "Home" }),
    ).not.toHaveAttribute("aria-current");

    // The divider in the items is drawn as a separator, after Projects.
    const separator = within(sidebar).getByRole("separator");

    await expect(separator.getBoundingClientRect().height).toBe(1);
    await expect(
      separator.compareDocumentPosition(
        within(sidebar).getByRole("link", { name: "Team" }),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  },
};

export const Collapsed: Story = {
  args: { defaultCollapsed: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sidebar = canvasElement.querySelector("aside")!;
    const toggle = canvas.getByRole("button", { name: "Expand sidebar" });

    await expect(sidebar).toHaveAttribute("data-state", "collapsed");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    // The page content starts at the left edge while the sidebar is away.
    await expect(
      canvasElement.querySelector("main")!.getBoundingClientRect().left,
    ).toBe(0);

    await userEvent.click(toggle);
    await expect(sidebar).toHaveAttribute("data-state", "expanded");
    await expect(
      canvas.getByRole("button", { name: "Collapse sidebar" }),
    ).toHaveAttribute("aria-expanded", "true");
  },
};

export const CollapseAndPeek: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sidebar = canvasElement.querySelector("aside")!;
    const state = () => sidebar.getAttribute("data-state");

    await expect(state()).toBe("expanded");

    // Clicking collapses it, and it does not peek while the pointer rests.
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse sidebar" }),
    );
    await expect(state()).toBe("collapsed");

    const toggle = canvas.getByRole("button", { name: "Expand sidebar" });

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.unhover(toggle);

    // Hovering the toggle slides it out, and it stays while hovered itself.
    await userEvent.hover(toggle);
    await expect(state()).toBe("peeking");
    await userEvent.unhover(toggle);
    await userEvent.hover(sidebar);
    await new Promise((resolve) => setTimeout(resolve, 350));
    await expect(state()).toBe("peeking");

    // Leaving it closes it again.
    await userEvent.unhover(sidebar);
    await waitFor(() => expect(state()).toBe("collapsed"));

    // Clicking the toggle expands it for good.
    await userEvent.click(toggle);
    await expect(state()).toBe("expanded");
    await userEvent.unhover(toggle);
    await new Promise((resolve) => setTimeout(resolve, 350));
    await expect(state()).toBe("expanded");

    // Once expanded it pushes the content aside instead of covering it.
    if (window.innerWidth >= 640) {
      const main = canvasElement.querySelector("main")!;

      await expect(main.getBoundingClientRect().left).toBe(
        sidebar.getBoundingClientRect().right,
      );
    }
  },
};

export const NestedItemsMenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Projects" });

    // Sub-items are not in the sidebar until the menu is opened.
    await expect(canvas.queryByText("Overview")).toBeNull();

    await userEvent.click(trigger);

    const menu = await screen.findByRole("menu", { name: "Projects" });

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(
      within(menu).getByRole("menuitem", { name: "Overview" }),
    ).toHaveAttribute("href", "/projects/overview");
    await expect(within(menu).getAllByRole("menuitem")).toHaveLength(2);

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  },
};

export const RemembersState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBeNull();

    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse sidebar" }),
    );
    await expect(localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe("false");

    await userEvent.click(
      canvas.getByRole("button", { name: "Expand sidebar" }),
    );
    await expect(localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe("true");
  },
};

/** A stored choice wins over `defaultCollapsed`. */
export const RestoresState: Story = {
  args: { defaultCollapsed: false },
  beforeEach: () => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, "false");
  },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector("aside")?.getAttribute("data-state"),
    ).toBe("collapsed");
  },
};
