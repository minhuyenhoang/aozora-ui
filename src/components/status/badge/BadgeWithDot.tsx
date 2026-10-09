import type { ReactNode } from "react";
import { Dot } from "../Dot";
import { cx } from "@styles/utils";
import {
  type BadgeTypeToColorMap,
  type BadgeTypes,
  type Sizes,
  badgeTypes,
} from "./constants";
import { withBadgeTypes } from "./styles";

export interface BadgeWithDotProps<T extends BadgeTypes> {
  type?: T;
  size?: Sizes;
  color?: BadgeTypeToColorMap<typeof withBadgeTypes>[T];
  className?: string;
  children: ReactNode;
}

export function BadgeWithDot<T extends BadgeTypes>(
  props: BadgeWithDotProps<T>,
) {
  const {
    size = "md",
    color = "gray",
    type = "pill-color",
    className,
    children,
  } = props;
  const colors = withBadgeTypes[type];

  const pillSizes = {
    sm: "gap-1 py-0.5 pl-1.5 pr-2 text-xs font-medium",
    md: "gap-1.5 py-0.5 pl-2 pr-2.5 text-sm font-medium",
    lg: "gap-1.5 py-1 pl-2.5 pr-3 text-sm font-medium",
  };
  const badgeSizes = {
    sm: "gap-1 py-0.5 px-1.5 text-xs font-medium",
    md: "gap-1.5 py-0.5 px-2 text-sm font-medium",
    lg: "gap-1.5 py-1 px-2.5 text-sm font-medium rounded-lg",
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
        className,
      )}
    >
      <Dot className={colors.styles[color].addon} size="sm" />
      {children}
    </span>
  );
}
