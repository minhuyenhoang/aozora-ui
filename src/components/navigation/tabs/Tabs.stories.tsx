import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconBell, IconCreditCard, IconUser } from "@tabler/icons-react";
import { expect, userEvent, within } from "storybook/test";
import { Tab } from "./Tab";
import { TabList } from "./TabList";
import { TabPanel } from "./TabPanel";
import { Tabs } from "./Tabs";

interface StoryArgs {
  size: "sm" | "md";
  type:
    | "button-brand"
    | "button-gray"
    | "button-border"
    | "button-minimal"
    | "underline"
    | "line";
  orientation: "horizontal" | "vertical";
  fullWidth: boolean;
  /** Shows an icon and a badge on the tabs. */
  withIconsAndBadges: boolean;
}

const tabs = [
  { id: "profile", label: "Profile", icon: IconUser, badge: undefined },
  { id: "billing", label: "Billing", icon: IconCreditCard, badge: 2 },
  { id: "notifications", label: "Notifications", icon: IconBell, badge: 12 },
];

const meta = {
  title: "Components/Navigation/Tabs",
  parameters: { layout: "centered" },
  args: {
    size: "sm",
    type: "button-brand",
    orientation: "horizontal",
    fullWidth: false,
    withIconsAndBadges: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    type: {
      control: "select",
      options: [
        "button-brand",
        "button-gray",
        "button-border",
        "button-minimal",
        "underline",
        "line",
      ],
      description:
        "`underline` is for horizontal tabs and `line` is for vertical tabs.",
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    fullWidth: { control: "boolean" },
    withIconsAndBadges: { control: "boolean" },
  },
  render: ({ size, type, orientation, fullWidth, withIconsAndBadges }) => (
    <div className="w-[min(90vw,32rem)]">
      <Tabs
        orientation={orientation}
        className={orientation === "vertical" ? "flex-row gap-6" : "gap-4"}
      >
        <TabList
          aria-label="Account settings"
          size={size}
          // The allowed types depend on the orientation, which is only known
          // at runtime here.
          type={type as "button-brand"}
          fullWidth={fullWidth}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={withIconsAndBadges ? tab.icon : undefined}
              badge={withIconsAndBadges ? tab.badge : undefined}
            />
          ))}
        </TabList>
        {tabs.map((tab) => (
          <TabPanel key={tab.id} id={tab.id} className="text-sm text-tertiary">
            {tab.label} settings
          </TabPanel>
        ))}
      </Tabs>
    </div>
  ),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ButtonBrand: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist", { name: "Account settings" });
    const tab = (name: RegExp) => canvas.getByRole("tab", { name });
    const style = (element: Element) => getComputedStyle(element);

    await expect(list).toHaveAttribute("aria-orientation", "horizontal");
    await expect(canvas.getAllByRole("tab")).toHaveLength(3);
    await expect(tab(/Profile/)).toHaveAttribute("aria-selected", "true");

    // The selected tab is filled, and the others are not.
    await expect(style(tab(/Profile/)).backgroundColor).not.toBe(
      style(tab(/Billing/)).backgroundColor,
    );
    await userEvent.click(tab(/Billing/));
    await expect(tab(/Billing/)).toHaveAttribute("aria-selected", "true");
    await expect(style(tab(/Billing/)).backgroundColor).not.toBe(
      style(tab(/Profile/)).backgroundColor,
    );
  },
};

export const ButtonGray: Story = {
  args: { type: "button-gray" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist", { name: "Account settings" });
    const tab = (name: RegExp) => canvas.getByRole("tab", { name });
    const style = (element: Element) => getComputedStyle(element);

    // The selected tab is filled, without a frame around the list.
    await expect(style(tab(/Profile/)).backgroundColor).not.toBe(
      style(tab(/Billing/)).backgroundColor,
    );
    await expect(style(list).boxShadow).toBe("none");
    await expect(style(list).padding).toBe("0px");
  },
};

export const ButtonBorder: Story = {
  args: { type: "button-border" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist", { name: "Account settings" });
    const tab = (name: RegExp) => canvas.getByRole("tab", { name });
    const style = (element: Element) => getComputedStyle(element);

    // The list is a padded, outlined box that holds the tabs.
    await expect(style(list).boxShadow).not.toBe("none");
    await expect(style(list).padding).toBe("4px");
    await expect(style(tab(/Profile/)).backgroundColor).not.toBe(
      style(tab(/Billing/)).backgroundColor,
    );
  },
};

export const ButtonMinimal: Story = {
  args: { type: "button-minimal" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist", { name: "Account settings" });
    const tab = (name: RegExp) => canvas.getByRole("tab", { name });
    const style = (element: Element) => getComputedStyle(element);

    // The list is outlined, and the tabs sit flush inside it.
    await expect(style(list).boxShadow).not.toBe("none");
    await expect(style(list).padding).toBe("0px");
    await expect(style(tab(/Profile/)).boxShadow).not.toBe(
      style(tab(/Billing/)).boxShadow,
    );
  },
};

export const Underline: Story = {
  args: { type: "underline" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist", { name: "Account settings" });
    const tab = (name: RegExp) => canvas.getByRole("tab", { name });
    const style = (element: Element) => getComputedStyle(element);

    await expect(list).toHaveAttribute("aria-orientation", "horizontal");

    // Each tab has a bottom border. Only the selected one is colored.
    await expect(style(tab(/Profile/)).borderBottomWidth).toBe("2px");
    await expect(style(tab(/Billing/)).borderBottomColor).toBe(
      "rgba(0, 0, 0, 0)",
    );
    await expect(style(tab(/Profile/)).borderBottomColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );

    // Each tab is only as wide as its label needs.
    await expect(tab(/Profile/).getBoundingClientRect().width).toBeLessThan(
      tab(/Notifications/).getBoundingClientRect().width,
    );
  },
};

export const UnderlineFullWidth: Story = {
  args: { type: "underline", fullWidth: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist", { name: "Account settings" });
    const tab = (name: RegExp) => canvas.getByRole("tab", { name });

    // The list fills its container, and the tabs share the width evenly.
    await expect(list.getBoundingClientRect().width).toBe(
      list.parentElement!.getBoundingClientRect().width,
    );
    await expect(
      Math.abs(
        tab(/Profile/).getBoundingClientRect().width -
          tab(/Notifications/).getBoundingClientRect().width,
      ),
    ).toBeLessThanOrEqual(1);
  },
};

export const VerticalLine: Story = {
  args: { type: "line", orientation: "vertical" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist", { name: "Account settings" });
    const tab = (name: RegExp) => canvas.getByRole("tab", { name });
    const style = (element: Element) => getComputedStyle(element);

    await expect(list).toHaveAttribute("aria-orientation", "vertical");

    // The tabs are stacked, with a line on the left of the selected one.
    await expect(
      tab(/Billing/).getBoundingClientRect().top,
    ).toBeGreaterThanOrEqual(tab(/Profile/).getBoundingClientRect().bottom);
    await expect(style(tab(/Profile/)).borderLeftWidth).toBe("2px");
    await expect(style(tab(/Profile/)).borderLeftColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
    await expect(style(tab(/Billing/)).borderLeftColor).toBe("rgba(0, 0, 0, 0)");

    // The down arrow moves focus to the next tab.
    await userEvent.click(tab(/Profile/));
    await userEvent.keyboard("{ArrowDown}");
    await expect(tab(/Billing/)).toHaveFocus();
  },
};

export const VerticalButton: Story = {
  args: { type: "button-gray", orientation: "vertical" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist", { name: "Account settings" });
    const tab = (name: RegExp) => canvas.getByRole("tab", { name });

    await expect(list).toHaveAttribute("aria-orientation", "vertical");
    await expect(
      tab(/Billing/).getBoundingClientRect().top,
    ).toBeGreaterThanOrEqual(tab(/Profile/).getBoundingClientRect().bottom);

    // The panel sits beside the list, not under it.
    await expect(
      canvas.getByRole("tabpanel").getBoundingClientRect().left,
    ).toBeGreaterThanOrEqual(list.getBoundingClientRect().right);
  },
};

export const MediumSize: Story = {
  args: { size: "md", type: "underline" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist", { name: "Account settings" });
    const tab = (name: RegExp) => canvas.getByRole("tab", { name });
    const style = (element: Element) => getComputedStyle(element);

    // The medium size uses the larger text.
    await expect(list).toBeVisible();
    await expect(style(tab(/Profile/)).fontSize).toBe("16px");
  },
};

export const WithIconsAndBadges: Story = {
  args: { type: "underline", withIconsAndBadges: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist", { name: "Account settings" });
    const tab = (name: RegExp) => canvas.getByRole("tab", { name });

    await expect(list).toBeVisible();
    for (const name of [/Profile/, /Billing/, /Notifications/]) {
      await expect(tab(name).querySelector("svg")).toBeVisible();
    }

    // A badge is only shown on the tabs that have one.
    await expect(within(tab(/Billing/)).getByText("2")).toBeVisible();
    await expect(within(tab(/Notifications/)).getByText("12")).toBeVisible();
    await expect(tab(/Profile/)).toHaveTextContent(/^Profile$/);
  },
};

export const SwitchesPanels: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("tabpanel")).toHaveTextContent(
      "Profile settings",
    );

    await userEvent.click(canvas.getByRole("tab", { name: "Billing" }));
    await expect(canvas.getByRole("tab", { name: "Billing" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent(
      "Billing settings",
    );

    // Arrow keys only move focus. Enter activates the focused tab.
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent(
      "Billing settings",
    );
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent(
      "Notifications settings",
    );
  },
};

/** Tabs rendered from an `items` array, without writing each `Tab`. */
export const FromItems: Story = {
  render: ({ size, type, fullWidth }) => (
    <div className="w-[min(90vw,32rem)]">
      <Tabs className="gap-4">
        <TabList
          aria-label="Account settings"
          size={size}
          type={type as "button-brand"}
          fullWidth={fullWidth}
          items={tabs.map(({ id, label }) => ({ id, children: label }))}
        />
        {tabs.map((tab) => (
          <TabPanel key={tab.id} id={tab.id} className="text-sm text-tertiary">
            {tab.label} settings
          </TabPanel>
        ))}
      </Tabs>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getAllByRole("tab").map((tab) => tab.textContent),
    ).toEqual(["Profile", "Billing", "Notifications"]);

    await userEvent.click(canvas.getByRole("tab", { name: "Notifications" }));
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent(
      "Notifications settings",
    );
  },
};
