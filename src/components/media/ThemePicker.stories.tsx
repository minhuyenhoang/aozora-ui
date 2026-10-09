import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import { THEME_STORAGE_KEY, useTheme } from "@hooks/useTheme";
import { ThemePicker } from "./ThemePicker";

/** Puts the page back to how it was, so a story does not affect the next. */
function resetTheme() {
  localStorage.removeItem(THEME_STORAGE_KEY);
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "";
}

const meta = {
  title: "Components/Media/ThemePicker",
  component: ThemePicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  // Each story starts without a remembered theme, and cleans up after itself.
  beforeEach: () => {
    resetTheme();
    return resetTheme;
  },
  args: {
    size: "sm",
    iconOnly: false,
    onThemeChange: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    color: { control: "inline-radio", options: ["secondary", "tertiary"] },
    defaultTheme: {
      control: "inline-radio",
      options: ["light", "dark", "system"],
    },
    iconOnly: { control: "boolean" },
  },
} satisfies Meta<typeof ThemePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const isDark = () => document.documentElement.classList.contains("dark");

/** Opens the menu and chooses the option with the given name. */
async function choose(canvasElement: HTMLElement, name: string) {
  await userEvent.click(within(canvasElement).getByRole("button"));
  await userEvent.click(
    within(await screen.findByRole("menu")).getByRole("menuitemradio", {
      name,
    }),
  );
  // Choosing an option closes the menu.
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
}

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button");

    // Nothing is stored yet, so the picker follows the device.
    await expect(button).toHaveAccessibleName("Theme: System");
    await expect(button).toHaveTextContent("System");
    await expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();

    // The menu lists the three themes, with the current one checked.
    await userEvent.click(button);

    const menu = await screen.findByRole("menu");

    await expect(within(menu).getAllByRole("menuitemradio")).toHaveLength(3);
    await expect(
      within(menu).getByRole("menuitemradio", { name: "System" }),
    ).toBeChecked();

    // Choosing the dark theme turns the dark styles on, and remembers it.
    await userEvent.click(
      within(menu).getByRole("menuitemradio", { name: "Dark" }),
    );
    await waitFor(() => expect(isDark()).toBe(true));
    await expect(document.documentElement.style.colorScheme).toBe("dark");
    await expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('"dark"');
    await expect(args.onThemeChange).toHaveBeenLastCalledWith("dark");
    await expect(button).toHaveAccessibleName("Theme: Dark");
    await expect(button.querySelector(".tabler-icon-moon")).toBeVisible();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());

    await choose(canvasElement, "Light");
    await waitFor(() => expect(isDark()).toBe(false));
    await expect(document.documentElement.style.colorScheme).toBe("light");

    // Choosing the current theme again does not clear the choice.
    await choose(canvasElement, "Light");
    await expect(button).toHaveAccessibleName("Theme: Light");
    await expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('"light"');
  },
};

/** Only the icon, for a top bar. The name is still read by screen readers. */
export const IconOnly: Story = {
  args: { iconOnly: true, color: "tertiary" },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Theme: System",
    });

    await expect(button).toHaveTextContent("");
    await expect(
      button.querySelector(".tabler-icon-device-desktop"),
    ).toBeVisible();

    await choose(canvasElement, "Dark");
    await waitFor(() => expect(isDark()).toBe(true));
    await expect(button.querySelector(".tabler-icon-moon")).toBeVisible();
  },
};

/** The menu can be used with the keyboard alone. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button");

    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    // The menu opens on the chosen theme, which is the last of the three.
    const menu = await screen.findByRole("menu");

    await waitFor(() =>
      expect(
        within(menu).getByRole("menuitemradio", { name: "System" }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard("{ArrowUp}{Enter}");
    await waitFor(() => expect(isDark()).toBe(true));

    // Focus goes back to the button once the menu has closed.
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await waitFor(() => expect(button).toHaveFocus());
  },
};

/** A stored choice wins over `defaultTheme`. */
export const RestoresChoice: Story = {
  args: { defaultTheme: "light" },
  beforeEach: () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify("dark"));
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button"),
    ).toHaveAccessibleName("Theme: Dark");
    await waitFor(() => expect(isDark()).toBe(true));
  },
};

export const CustomLabels: Story = {
  args: {
    labels: {
      picker: "Giao diện",
      light: "Sáng",
      dark: "Tối",
      system: "Hệ thống",
    },
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button");

    await expect(button).toHaveAccessibleName("Giao diện: Hệ thống");
    await choose(canvasElement, "Tối");
    await waitFor(() => expect(isDark()).toBe(true));
    await expect(button).toHaveAccessibleName("Giao diện: Tối");
  },
};

/** Shows what `useTheme` returns. Any component can read the theme this way. */
function ThemeReadout() {
  const { theme, resolvedTheme } = useTheme();

  return (
    <p data-testid="readout" className="text-sm text-tertiary">
      Chosen: {theme}. Shown: {resolvedTheme}.
    </p>
  );
}

/** Every user of `useTheme` stays in sync with the picker. */
export const WithUseTheme: Story = {
  render: (args) => (
    <div className="flex flex-col items-center gap-3">
      <ThemePicker {...args} />
      <ThemeReadout />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const readout = within(canvasElement).getByTestId("readout");

    await expect(readout).toHaveTextContent("Chosen: system.");

    await choose(canvasElement, "Dark");
    await waitFor(() =>
      expect(readout).toHaveTextContent("Chosen: dark. Shown: dark."),
    );

    // `system` resolves to whatever the device is set to.
    await choose(canvasElement, "System");

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    await waitFor(() =>
      expect(readout).toHaveTextContent(
        `Chosen: system. Shown: ${systemTheme}.`,
      ),
    );
    await expect(isDark()).toBe(systemTheme === "dark");
  },
};
