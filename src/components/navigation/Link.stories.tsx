import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterProvider } from "react-aria-components";
import { expect, fn, userEvent, within } from "storybook/test";
import { Link } from "./Link";

const meta = {
  title: "Components/Navigation/Link",
  component: Link,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    href: "/settings",
    children: "Account settings",
    color: "brand",
  },
  argTypes: {
    color: { control: "inline-radio", options: ["brand", "gray"] },
    isDisabled: { control: "boolean" },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", {
      name: "Account settings",
    });

    await expect(link.tagName).toBe("A");
    await expect(link).toHaveAttribute("href", "/settings");
  },
};

export const Gray: Story = {
  args: { color: "gray" },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", {
      name: "Account settings",
    });

    await expect(link).toHaveAttribute("aria-disabled", "true");
    await userEvent.tab();
    await expect(link).not.toHaveFocus();
  },
};

const navigate = fn();

/**
 * Inside React Aria's `RouterProvider`, the link navigates through the router
 * it is given, such as React Router's or TanStack Router's `navigate`.
 */
export const WithRouter: Story = {
  args: {
    // Apps type these by adding their router's options to React Aria's
    // `RouterConfig`. This library has no router, so they are untyped here.
    routerOptions: { replace: true } as never,
  },
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
      within(canvasElement).getByRole("link", { name: "Account settings" }),
    );

    // The router navigates, with the options given to the link.
    await expect(navigate).toHaveBeenCalledWith("/settings", { replace: true });
  },
};
