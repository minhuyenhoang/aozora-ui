import type { ReactNode } from "react";
import { cx } from "@styles/utils";
import {
  type BadgeTypeToColorMap,
  type BadgeTypes,
  type IconComponentType,
  type Sizes,
  badgeTypes,
} from "./constants";
import { withPillTypes } from "./styles";

export interface BadgeIconProps<T extends BadgeTypes> {
  type?: T;
  size?: Sizes;
  icon: IconComponentType;
  color?: BadgeTypeToColorMap<typeof withPillTypes>[T];
  children?: ReactNode;
}

export function BadgeIcon<T extends BadgeTypes>(props: BadgeIconProps<T>) {
  const {
    size = "md",
    color = "gray",
    type = "pill-color",
    icon: Icon,
  } = props;
  const colors = withPillTypes[type];

  const pillSizes = {
    sm: "p-1.25",
    md: "p-1.5",
    lg: "p-2",
  };
  const badgeSizes = {
    sm: "p-1.25",
    md: "p-1.5",
    lg: "p-2 rounded-lg",
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
      <Icon className={cx("size-3 stroke-[3px]", colors.styles[color].addon)} />
    </span>
  );
}
