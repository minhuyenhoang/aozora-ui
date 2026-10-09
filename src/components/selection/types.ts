import type { FC, ReactNode } from "react";

export type SelectItemType = {
  /** Unique identifier for the item. */
  id: string | number;
  /** The primary display text. */
  label?: string;
  /** Avatar image URL. */
  avatarUrl?: string;
  /** Whether the item is disabled. */
  isDisabled?: boolean;
  /** Secondary text displayed alongside the label. */
  supportingText?: string;
  /** Leading icon component or element. */
  icon?: FC | ReactNode;
};

export interface SelectionCommonProps {
  /** Helper text displayed below the input. */
  description?: string;
  /** Field label displayed above the input. */
  label?: string;
  /** Tooltip text for the help icon next to the label. */
  tooltip?: string;
  /**
   * The size of the component.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /** Placeholder text when no value is selected. */
  placeholder?: string;
  /** Whether to hide the required indicator from the label. */
  hideRequiredIndicator?: boolean;
}
