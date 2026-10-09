import type { ReactNode } from "react";
import { cx } from "@styles/utils";
import {
  type BadgeTypeToColorMap,
  type BadgeTypes,
  type IconComponentType,
  type Sizes,
  badgeTypes,
} from "./constants";
import { withBadgeTypes } from "./styles";

export interface BadgeWithIconProps<T extends BadgeTypes> {
  type?: T;
  size?: Sizes;
  color?: BadgeTypeToColorMap<typeof withBadgeTypes>[T];
  iconLeading?: IconComponentType;
  iconTrailing?: IconComponentType;
  children: ReactNode;
  className?: string;
}

export function BadgeWithIcon<T extends BadgeTypes>(
  props: BadgeWithIconProps<T>,
) {
  const {
    size = "md",
    color = "gray",
    type = "pill-color",
    iconLeading: IconLeading,
    iconTrailing: IconTrailing,
    children,
    className,
  } = props;
  const colors = withBadgeTypes[type];
  const icon = IconLeading ? "leading" : "trailing";

  const pillSizes = {
    sm: {
      trailing: "gap-0.5 py-0.5 pl-2 pr-1.5 text-xs font-medium",
      leading: "gap-0.5 py-0.5 pr-2 pl-1.5 text-xs font-medium",
    },
    md: {
      trailing: "gap-1 py-0.5 pl-2.5 pr-2 text-sm font-medium",
      leading: "gap-1 py-0.5 pr-2.5 pl-2 text-sm font-medium",
    },
    lg: {
      trailing: "gap-1 py-1 pl-3 pr-2.5 text-sm font-medium",
      leading: "gap-1 py-1 pr-3 pl-2.5 text-sm font-medium",
    },
  };
  const badgeSizes = {
    sm: {
      trailing: "gap-0.5 py-0.5 pl-2 pr-1.5 text-xs font-medium",
      leading: "gap-0.5 py-0.5 pr-2 pl-1.5 text-xs font-medium",
    },
    md: {
      trailing: "gap-1 py-0.5 pl-2 pr-1.5 text-sm font-medium",
      leading: "gap-1 py-0.5 pr-2 pl-1.5 text-sm font-medium",
    },
    lg: {
      trailing: "gap-1 py-1 pl-2.5 pr-2 text-sm font-medium rounded-lg",
      leading: "gap-1 py-1 pr-2.5 pl-2 text-sm font-medium rounded-lg",
    },
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
        sizes[type][size][icon],
        colors.styles[color].root,
        className,
      )}
    >
      {IconLeading && (
        <IconLeading
          className={cx(colors.styles[color].addon, "size-3 stroke-3")}
        />
      )}
      {children}
      {IconTrailing && (
        <IconTrailing
          className={cx(colors.styles[color].addon, "size-3 stroke-3")}
        />
      )}
    </span>
  );
}
