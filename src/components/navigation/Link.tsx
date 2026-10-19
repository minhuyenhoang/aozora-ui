import type { Ref } from "react";
import {
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
} from "react-aria-components";
import { cx, sortCx } from "@styles/utils";

export const linkStyles = sortCx({
  root: "rounded font-semibold outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2",
  colors: {
    brand: "text-brand-secondary hover:text-brand-secondary_hover",
    gray: "text-tertiary hover:text-tertiary_hover",
  },
});

export interface LinkProps extends AriaLinkProps {
  ref?: Ref<HTMLAnchorElement>;
  /**
   * The color of the link.
   * @default "brand"
   */
  color?: keyof typeof linkStyles.colors;
}

/**
 * A link that works with any router. It renders a React Aria `Link`, so it
 * navigates through the router given to React Aria's `RouterProvider`, and
 * takes `routerOptions` for it.
 *
 * With React Router, wrap the app once:
 * ```tsx
 * const navigate = useNavigate();
 * <RouterProvider navigate={navigate} useHref={useHref}>...</RouterProvider>
 * ```
 *
 * With TanStack Router, either use `RouterProvider` the same way, or create a
 * typed link from it: `const RouterLink = createLink(Link);`.
 */
export function Link({ color = "brand", className, ...props }: LinkProps) {
  return (
    <AriaLink
      {...props}
      className={(state) =>
        cx(
          linkStyles.root,
          linkStyles.colors[color],
          state.isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          // The current page, such as the last breadcrumb, is not a link.
          state.isCurrent &&
            "cursor-default text-brand-secondary hover:text-brand-secondary",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}
