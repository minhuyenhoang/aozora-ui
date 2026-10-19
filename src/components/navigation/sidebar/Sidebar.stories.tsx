import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  IconChartBar,
  IconFolder,
  IconHome,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { expect, screen, userEvent, within } from "storybook/test";
import type { NavItemDividerType, NavItemType } from "../constants";
import { Sidebar } from "./Sidebar";

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
  title: "Components/Navigation/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
  args: {
    items,
    activeUrl: "/dashboard",
    header: <span className="text-md font-semibold text-primary">Acme</span>,
    footer: <span className="text-sm text-tertiary">olivia@example.com</span>,
  },
  argTypes: {
    header: { control: false },
    footer: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Acme")).toBeVisible();
    await expect(canvas.getByText("olivia@example.com")).toBeVisible();

    // The item for the active URL is marked as the current page.
    await expect(
      canvas.getByRole("link", { name: "Dashboard" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );

    // A divider without a label is drawn as a line.
    await expect(
      canvas.getByRole("separator").getBoundingClientRect().height,
    ).toBe(1);
  },
};

export const WithSections: Story = {
  args: {
    items: [
      { divider: true, label: "General" },
      { label: "Home", href: "/", icon: IconHome },
      { label: "Dashboard", href: "/dashboard", icon: IconChartBar },
      { divider: true, label: "Workspace" },
      { label: "Team", href: "/team", icon: IconUsers },
      { label: "Settings", href: "/settings", icon: IconSettings },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const general = canvas.getByText("General");
    const workspace = canvas.getByText("Workspace");

    // A divider with a label draws a line, then heads its section. The first
    // section has nothing above it, so it has no line.
    await expect(general).toBeVisible();
    await expect(workspace).toBeVisible();
    const separator = canvas.getByRole("separator");
    await expect(separator.getBoundingClientRect().height).toBe(1);
    await expect(separator.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      workspace.getBoundingClientRect().top,
    );
    await expect(
      canvas.getByRole("link", { name: "Dashboard" }).getBoundingClientRect()
        .bottom,
    ).toBeLessThanOrEqual(separator.getBoundingClientRect().top);

    // Each label sits above the items of its section.
    const top = (element: HTMLElement) => element.getBoundingClientRect().top;
    await expect(top(general)).toBeLessThan(
      top(canvas.getByRole("link", { name: "Home" })),
    );
    await expect(
      top(canvas.getByRole("link", { name: "Dashboard" })),
    ).toBeLessThan(top(workspace));
    await expect(top(workspace)).toBeLessThan(
      top(canvas.getByRole("link", { name: "Team" })),
    );
  },
};

export const NestedItems: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const projects = canvas.getByRole("button", { name: "Projects" });

    // Sub-items open in a menu beside the sidebar.
    await userEvent.click(projects);
    const menu = await screen.findByRole("menu", { name: "Projects" });
    await expect(menu.getBoundingClientRect().left).toBeGreaterThan(
      projects.getBoundingClientRect().right,
    );

    await expect(within(menu).getAllByRole("menuitem")).toHaveLength(2);
    await expect(
      within(menu).getByRole("menuitem", { name: "Archived" }),
    ).toHaveAttribute("href", "/projects/archived");
  },
};

export const WithoutHeaderAndFooter: Story = {
  args: { header: undefined, footer: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText("Acme")).not.toBeInTheDocument();
    await expect(
      canvas.queryByText("olivia@example.com"),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "Home" })).toBeVisible();
  },
};
