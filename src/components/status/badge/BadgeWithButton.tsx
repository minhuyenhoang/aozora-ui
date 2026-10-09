import type { MouseEventHandler, ReactNode } from "react";
import { IconX } from "@tabler/icons-react";
import { cx } from "@styles/utils";
import {
  type BadgeTypeToColorMap,
  type BadgeTypes,
  type IconComponentType,
  type Sizes,
  badgeTypes,
} from "./constants";
import { withPillTypes } from "./styles";

export interface BadgeWithButtonProps<T extends BadgeTypes> {
  type?: T;
  size?: Sizes;
  icon?: IconComponentType;
  color?: BadgeTypeToColorMap<typeof withPillTypes>[T];
  children: ReactNode;
  /** The label for the button. */
  buttonLabel?: string;
  /** The click event handler for the button. */
  onButtonClick?: MouseEventHandler<HTMLButtonElement>;
}

export function BadgeWithButton<T extends BadgeTypes>(
  props: BadgeWithButtonProps<T>,
) {
  const {
    size = "md",
    color = "gray",
    type = "pill-color",
    icon: Icon = IconX,
    buttonLabel,
    children,
  } = props;
  const colors = withPillTypes[type];

  const pillSizes = {
    sm: "gap-0.5 py-0.5 pl-2 pr-0.75 text-xs font-medium",
    md: "gap-0.5 py-0.5 pl-2.5 pr-1 text-sm font-medium",
    lg: "gap-0.5 py-1 pl-3 pr-1.5 text-sm font-medium",
  };
  const badgeSizes = {
    sm: "gap-0.5 py-0.5 pl-1.5 pr-0.75 text-xs font-medium",
    md: "gap-0.5 py-0.5 pl-2 pr-1 text-sm font-medium",
    lg: "gap-0.5 py-1 pl-2.5 pr-1.5 text-sm font-medium rounded-lg",
  };
  const sizes = {
    [badgeTypes.pillColor]: pillSizes,
    [badgeTypes.badgeColor]: badgeSizes,
    [badgeTypes.badgeModern]: badgeSizes,
  };

  return (
    <span
      className={cx(
        colors.common,
        sizes[type][size],
        colors.styles[color].root,
      )}
    >
      {children}
      <button
        type="button"
        aria-label={buttonLabel}
        onClick={props.onButtonClick}
        className={cx(
          "flex cursor-pointer items-center justify-center p-0.5 outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2",
          colors.styles[color].addonButton,
          type === "pill-color" ? "rounded-full" : "rounded-[3px]",
        )}
      >
        <Icon className="size-3 stroke-[3px] transition-inherit-all" />
      </button>
    </span>
  );
}
