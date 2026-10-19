import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconHome } from "@tabler/icons-react";
import { RouterProvider } from "react-aria-components";
import { expect, fn, userEvent, within } from "storybook/test";
import { Breadcrumbs, BreadcrumbsItem } from "./Breadcrumb";

const meta = {
  title: "Components/Navigation/Breadcrumbs",
  component: Breadcrumbs,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { separator: "chevron" },
  argTypes: {
    separator: {
      control: "inline-radio",
      options: ["chevron", "slash", false],
    },
  },
  render: (args) => (
    <Breadcrumbs {...args}>
      <BreadcrumbsItem href="/" icon={IconHome}>
        Home
      </BreadcrumbsItem>
      <BreadcrumbsItem href="/projects">Projects</BreadcrumbsItem>
      <BreadcrumbsItem href="/projects/aozora">Aozora</BreadcrumbsItem>
    </Breadcrumbs>
  ),
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const links = canvas.getAllByRole("link");

    await expect(links.map((link) => link.textContent)).toEqual([
      "Home",
      "Projects",
      "Aozora",
    ]);

    // The last item is the current page, in the brand color.
    await expect(links[2]).toHaveAttribute("aria-current", "page");
    await expect(links[0]).not.toHaveAttribute("aria-current");
    await expect(links[2]).toHaveClass("text-brand-secondary");
    await expect(links[0]).toHaveClass("text-tertiary");

    // A chevron sits between the items, but not after the last one.
    await expect(
      canvasElement.querySelectorAll(".tabler-icon-chevron-right"),
    ).toHaveLength(2);

    // The first item has its icon.
    await expect(
      links[0].querySelector(".tabler-icon-home"),
    ).toBeInTheDocument();
  },
};

export const Slash: Story = {
  args: { separator: "slash" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText("/")).toHaveLength(2);
    await expect(
      canvasElement.querySelector(".tabler-icon-chevron-right"),
    ).not.toBeInTheDocument();
  },
};

export const NoSeparator: Story = {
  args: { separator: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText("/")).not.toBeInTheDocument();
    await expect(
      canvasElement.querySelector(".tabler-icon-chevron-right"),
    ).not.toBeInTheDocument();
  },
};

export const Collapsed: Story = {
  args: { maxItems: 3 },
  render: (args) => (
    <Breadcrumbs {...args}>
      <BreadcrumbsItem href="/" icon={IconHome}>
        Home
      </BreadcrumbsItem>
      <BreadcrumbsItem href="/projects">Projects</BreadcrumbsItem>
      <BreadcrumbsItem href="/projects/aozora">Aozora</BreadcrumbsItem>
      <BreadcrumbsItem href="/projects/aozora/settings">Settings</BreadcrumbsItem>
      <BreadcrumbsItem href="/projects/aozora/settings/members">
        Members
      </BreadcrumbsItem>
    </Breadcrumbs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const linkNames = () =>
      canvas.getAllByRole("link").map((link) => link.textContent);

    // The first item and the last ones stay, the rest become an ellipsis.
    await expect(linkNames()).toEqual(["Home", "Settings", "Members"]);

    // Pressing the ellipsis shows every item.
    await userEvent.click(
      canvas.getByRole("button", { name: "Show all pages" }),
    );
    await expect(linkNames()).toEqual([
      "Home",
      "Projects",
      "Aozora",
      "Settings",
      "Members",
    ]);
    await expect(
      canvas.queryByRole("button", { name: "Show all pages" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("link", { name: "Members" }),
    ).toHaveAttribute("aria-current", "page");
  },
};

const navigate = fn();

/** Inside React Aria's `RouterProvider`, the items navigate through it. */
export const WithRouter: Story = {
  decorators: [
    (Story) => (
      <RouterProvider navigate={navigate}>
        <Story />
      </RouterProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    navigate.mockClear();

    await userEvent.click(
      within(canvasElement).getByRole("link", { name: "Projects" }),
    );
    await expect(navigate).toHaveBeenCalledWith("/projects", undefined);
  },
};
