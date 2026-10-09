import type { ReactNode } from "react";
import { cx } from "@styles/utils";
import {
  type BadgeTypeToColorMap,
  type BadgeTypes,
  type Sizes,
  badgeTypes,
} from "./constants";
import { withPillTypes } from "./styles";

export interface BadgeWithImageProps<T extends BadgeTypes> {
  type?: T;
  size?: Sizes;
  imgSrc: string;
  color?: BadgeTypeToColorMap<typeof withPillTypes>[T];
  children: ReactNode;
}

export function BadgeWithImage<T extends BadgeTypes>(
  props: BadgeWithImageProps<T>,
) {
  const {
    size = "md",
    color = "gray",
    type = "pill-color",
    imgSrc,
    children,
  } = props;
  const colors = withPillTypes[type];

  const pillSizes = {
    sm: "gap-1 py-0.5 pl-0.75 pr-2 text-xs font-medium",
    md: "gap-1.5 py-0.5 pl-1 pr-2.5 text-sm font-medium",
    lg: "gap-1.5 py-1 pl-1.5 pr-3 text-sm font-medium",
  };
  const badgeSizes = {
    sm: "gap-1 py-0.5 pl-1 pr-1.5 text-xs font-medium",
    md: "gap-1.5 py-0.5 pl-1.5 pr-2 text-sm font-medium",
    lg: "gap-1.5 py-1 pl-2 pr-2.5 text-sm font-medium rounded-lg",
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
      <img
        src={imgSrc}
        className="size-4 max-w-none rounded-full"
        alt="Badge image"
      />
      {children}
    </span>
  );
}
