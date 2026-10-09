import type {
  FC,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
  RefAttributes,
} from "react";
import {
  IconChevronDown,
  IconChevronRight,
  IconExternalLink,
} from "@tabler/icons-react";
import type {
  ButtonProps as AriaButtonProps,
  LinkProps as AriaLinkProps,
} from "react-aria-components";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import { Badge } from "../status/badge/Badge";
import { cx, sortCx } from "@styles/utils";

const styles = sortCx({
  root: "group relative flex max-h-9 w-full cursor-pointer items-center rounded-md bg-primary outline-focus-ring transition duration-100 ease-linear select-none hover:bg-primary_hover focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
  rootSelected: "group bg-brand-solid hover:bg-brand-solid_hover",
});

/**
 * Props shared between the collapsible and link variants
 */
interface NavItemCommonProps {
  /** Icon component to display. */
  icon?: FC<HTMLAttributes<HTMLOrSVGElement>>;
  /** Badge to display. */
  badge?: ReactNode;
  /** Whether the nav item is currently active. */
  current?: boolean;
  /** Whether to truncate the label text. */
  truncate?: boolean;
  /** Handler for click events. */
  onClick?: MouseEventHandler;
  /** Content to display. */
  children?: ReactNode;
}

/**
 * Props for the collapsible variant (renders a `summary` element)
 */
export interface NavItemCollapsibleProps extends NavItemCommonProps {
  /** Type of the nav item. */
  type: "collapsible";
}

/**
 * Props for the link variants (anchor tag). Accepts all React Aria `Link` props such as `routerOptions`, `isDisabled` and `onPress`.
 */
export interface NavItemLinkProps
  extends
    NavItemCommonProps,
    Omit<AriaLinkProps, "children" | "className" | "onClick">,
    RefAttributes<HTMLAnchorElement> {
  /** Type of the nav item. */
  type: "link" | "collapsible-child";
  /** URL to navigate to when the nav item is clicked. */
  href?: AriaLinkProps["href"];
}

/**
 * Props for the menu variant (renders a button). Place it inside a menu
 * trigger, such as `Menu.Root`, so that pressing it opens the menu.
 */
export interface NavItemMenuProps
  extends
    NavItemCommonProps,
    Omit<AriaButtonProps, "children" | "className" | "onClick" | "type">,
    RefAttributes<HTMLButtonElement> {
  /** Type of the nav item. */
  type: "menu";
}

/** Union type of collapsible, menu and link props */
export type NavItemProps =
  NavItemCollapsibleProps | NavItemMenuProps | NavItemLinkProps;

export const NavItem = (props: NavItemProps) => {
  const {
    icon: Icon,
    badge,
    current,
    truncate = true,
    onClick,
    children,
    ...rest
  } = props;

  const iconElement = Icon && (
    <Icon
      aria-hidden="true"
      className={cx(
        "mr-2 size-5 shrink-0 text-fg-quaternary transition-inherit-all group-hover/item:text-fg-quaternary_hover",
        // Uses the same hover variant as above so it replaces that colour.
        current && "text-fg-white group-hover/item:text-fg-white",
      )}
    />
  );

  const badgeElement =
    badge && (typeof badge === "string" || typeof badge === "number") ? (
      <Badge className="ml-3" color="gray" type="pill-color" size="sm">
        {badge}
      </Badge>
    ) : (
      badge
    );

  const labelElement = (
    <span
      className={cx(
        "flex-1 text-sm font-semibold text-secondary transition-inherit-all group-hover/item:text-secondary_hover",
        truncate && "truncate",
        // Uses the same hover variant as above so it replaces that colour.
        current && "text-fg-white group-hover/item:text-fg-white",
      )}
    >
      {children}
    </span>
  );

  if (rest.type === "collapsible") {
    return (
      <summary
        className={cx("p-2", styles.root, current && styles.rootSelected)}
        onClick={onClick}
      >
        {iconElement}

        {labelElement}

        {badgeElement}

        <IconChevronDown
          aria-hidden="true"
          className="ml-3 size-4 shrink-0 stroke-[2.5px] text-fg-quaternary in-open:-scale-y-100"
        />
      </summary>
    );
  }

  if (rest.type === "menu") {
    const { type: _type, ...buttonProps } = rest;

    return (
      <AriaButton
        {...buttonProps}
        onClick={onClick}
        className={cx(
          "group/item p-2 text-left",
          styles.root,
          current && styles.rootSelected,
          // Stays highlighted while its menu is open.
          current
            ? "aria-expanded:bg-brand-solid_hover"
            : "aria-expanded:bg-primary_hover",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {iconElement}

        {labelElement}

        {badgeElement}

        <IconChevronRight
          aria-hidden="true"
          className="ml-3 size-4 shrink-0 stroke-[2.5px] text-fg-quaternary"
        />
      </AriaButton>
    );
  }

  const { type, href, isDisabled, ...linkProps } = rest;

  const isExternal = href?.startsWith("http");
  const externalIcon = isExternal && (
    <IconExternalLink className="size-4 stroke-[2.5px] text-fg-quaternary" />
  );

  return (
    <AriaLink
      // Defaults that consumers can override through React Aria link props.
      target={isExternal ? "_blank" : "_self"}
      rel="noopener noreferrer"
      aria-current={current ? "page" : undefined}
      {...linkProps}
      // Dropping `href` when disabled prevents navigation via middle-click or "open in new tab".
      href={isDisabled ? undefined : href}
      isDisabled={isDisabled}
      onClick={onClick}
      className={cx(
        type === "collapsible-child" ? "py-2 pr-3 pl-10" : "group/item p-2",
        styles.root,
        current && styles.rootSelected,
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      {type === "link" && iconElement}
      {labelElement}
      {externalIcon}
      {badgeElement}
    </AriaLink>
  );
};
