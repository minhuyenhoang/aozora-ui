import type { ReactNode } from "react";
import { cx } from "@styles/utils";
import {
  type BadgeTypeToColorMap,
  type BadgeTypes,
  type Sizes,
  badgeTypes,
} from "./constants";
import { withPillTypes } from "./styles";

export type BadgeColor<T extends BadgeTypes> = BadgeTypeToColorMap<
  typeof withPillTypes
>[T];

export interface BadgeProps<T extends BadgeTypes> {
  type?: T;
  size?: Sizes;
  color?: BadgeColor<T>;
  children: ReactNode;
  className?: string;
}

export function Badge<T extends BadgeTypes>(props: BadgeProps<T>) {
  const { type = "pill-color", size = "md", color = "gray", children } = props;
  const colors = withPillTypes[type];

  const pillSizes = {
    sm: "py-0.5 px-2 text-xs font-medium",
    md: "py-0.5 px-2.5 text-sm font-medium",
    lg: "py-1 px-3 text-sm font-medium",
  };
  const badgeSizes = {
    sm: "py-0.5 px-1.5 text-xs font-medium",
    md: "py-0.5 px-2 text-sm font-medium",
    lg: "py-1 px-2.5 text-sm font-medium rounded-lg",
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
        props.className,
      )}
    >
      {children}
    </span>
  );
}

// export const BadgeWithFlag = <T extends BadgeTypes>(props: BadgeWithFlagProps<T>) => {
//     const { size = "md", color = "gray", type = "pill-color", children } = props;

//     const colors = withPillTypes[type];

//     const pillSizes = {
//         sm: "gap-1 py-0.5 pl-0.75 pr-2 text-xs font-medium",
//         md: "gap-1.5 py-0.5 pl-1 pr-2.5 text-sm font-medium",
//         lg: "gap-1.5 py-1 pl-1.5 pr-3 text-sm font-medium",
//     };
//     const badgeSizes = {
//         sm: "gap-1 py-0.5 pl-1 pr-1.5 text-xs font-medium",
//         md: "gap-1.5 py-0.5 pl-1.5 pr-2 text-sm font-medium",
//         lg: "gap-1.5 py-1 pl-2 pr-2.5 text-sm font-medium rounded-lg",
//     };

//     const sizes = {
//         [badgeTypes.pillColor]: pillSizes,
//         [badgeTypes.badgeColor]: badgeSizes,
//         [badgeTypes.badgeModern]: badgeSizes,
//     };

//     return (
//         <span className={cx(colors.common, sizes[type][size], colors.styles[color].root)}>
//             <img src={`https://www.untitledui.com/images/flags/${flag}.svg`} className="size-4 max-w-none rounded-full" alt={`${flag} flag`} />
//             {children}
//         </span>
//     );
// };
