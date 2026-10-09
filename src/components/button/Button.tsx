import type { FC, ReactElement, ReactNode } from "react";
import { isValidElement } from "react";
import type {
  ButtonProps as AriaButtonProps,
  LinkProps as AriaLinkProps,
} from "react-aria-components";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import { chain } from "react-aria";
import { useTabFocus } from "@hooks/useTabFocus";
import { cx, sortCx } from "@styles/utils";
import { isReactComponent } from "@utils/componentCheck";
import { Loader } from "../status/Loader";

export const buttonStyles = sortCx({
  common: {
    root: [
      "group relative inline-flex h-max cursor-pointer items-center justify-center whitespace-nowrap outline-brand transition duration-100 ease-linear before:absolute",
      // The focus ring is only shown when the button was reached with Tab.
      // `outline-0` keeps the browser from drawing its own ring otherwise.
      "outline-0 data-tab-focused:outline-2 data-tab-focused:outline-offset-2",
      // When button is used within `InputGroup`
      "in-data-input-wrapper:shadow-xs in-data-input-wrapper:focus:!z-50 in-data-input-wrapper:in-data-leading:-mr-px in-data-input-wrapper:in-data-leading:rounded-r-none in-data-input-wrapper:in-data-leading:before:rounded-r-none in-data-input-wrapper:in-data-trailing:-ml-px in-data-input-wrapper:in-data-trailing:rounded-l-none in-data-input-wrapper:in-data-trailing:before:rounded-l-none",
      // Disabled buttonStyles
      "disabled:cursor-not-allowed disabled:opacity-50 in-data-input-wrapper:disabled:opacity-100",
      // Same as `icon` but for SSR icons that cannot be passed to the client as functions.
      "*:data-icon:pointer-events-none *:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:transition-inherit-all",
    ].join(" "),
    icon: "pointer-events-none size-5 shrink-0 transition-inherit-all",
  },
  sizes: {
    xs: {
      root: [
        "gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold before:rounded-[7px] data-icon-only:p-2",
        "in-data-input-wrapper:px-3.5 in-data-input-wrapper:py-2.5 in-data-input-wrapper:data-icon-only:p-2.5",
        "*:data-icon:size-4 *:data-icon:stroke-[2.25px]",
      ].join(" "),
      linkRoot: "gap-1 *:data-text:underline-offset-3",
    },
    sm: {
      root: [
        "gap-1 rounded-lg px-3 py-2 text-sm font-semibold before:rounded-[7px] data-icon-only:p-2",
        "in-data-input-wrapper:px-3.5 in-data-input-wrapper:py-2.5 in-data-input-wrapper:data-icon-only:p-2.5",
      ].join(" "),
      linkRoot: "gap-1 *:data-text:underline-offset-3",
    },
    md: {
      root: [
        "gap-1 rounded-lg px-3.5 py-2.5 text-sm font-semibold before:rounded-[7px] data-icon-only:p-2.5",
        "in-data-input-wrapper:gap-1.5 in-data-input-wrapper:px-4 in-data-input-wrapper:text-md in-data-input-wrapper:data-icon-only:p-3",
      ].join(" "),
      linkRoot: "gap-1 *:data-text:underline-offset-4",
    },
    lg: {
      root: "gap-1.5 rounded-lg px-4 py-2.5 text-md font-semibold before:rounded-[7px] data-icon-only:p-3",
      linkRoot: "gap-1.5 *:data-text:underline-offset-4",
    },
    xl: {
      root: "gap-1.5 rounded-lg px-4.5 py-3 text-md font-semibold before:rounded-[7px] data-icon-only:p-3.5",
      linkRoot: "gap-1.5 *:data-text:underline-offset-4",
    },
  },

  colors: {
    primary: {
      root: [
        "bg-brand-solid text-white shadow-xs-skeuomorphic ring-1 ring-transparent ring-inset hover:bg-brand-solid_hover data-loading:bg-brand-solid_hover",
        // Inner border gradient
        "before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0%",
        // Icon buttonStyles
        "*:data-icon:text-white/60 hover:*:data-icon:text-white/70",
      ].join(" "),
    },
    secondary: {
      root: [
        "bg-primary text-secondary shadow-xs-skeuomorphic ring-1 ring-primary ring-inset hover:bg-primary_hover hover:text-secondary_hover data-loading:bg-primary_hover",
        // Icon buttonStyles
        "*:data-icon:text-fg-quaternary hover:*:data-icon:text-fg-quaternary_hover",
      ].join(" "),
    },
    tertiary: {
      root: [
        "text-tertiary hover:bg-primary_hover hover:text-tertiary_hover data-loading:bg-primary_hover",
        // Icon buttonStyles
        "*:data-icon:text-fg-quaternary hover:*:data-icon:text-fg-quaternary_hover",
      ].join(" "),
    },
    light: {
      root: [
        // The ring is barely there on a light page, and outlines the button on a dark one.
        "bg-utility-brand-50 text-utility-brand-700 ring-1 ring-utility-brand-100 ring-inset hover:bg-utility-brand-100 data-loading:bg-utility-brand-100 dark:ring-utility-brand-200",
        // Icon buttonStyles
        "*:data-icon:text-utility-brand-500 hover:*:data-icon:text-utility-brand-600",
      ].join(" "),
    },
    "link-color": {
      root: [
        "justify-normal rounded p-0! text-brand-secondary hover:text-brand-secondary_hover",
        // Inner text underline
        "*:data-text:underline *:data-text:decoration-transparent hover:*:data-text:decoration-fg-brand-secondary_alt",
        // Icon buttonStyles
        "*:data-icon:text-fg-brand-secondary_alt hover:*:data-icon:text-fg-brand-secondary_hover",
      ].join(" "),
    },
    "link-gray": {
      root: [
        "justify-normal rounded p-0! text-tertiary hover:text-tertiary_hover",
        // Inner text underline
        "*:data-text:underline *:data-text:decoration-transparent hover:*:data-text:decoration-fg-quaternary",
        // Icon buttonStyles
        "*:data-icon:text-fg-quaternary hover:*:data-icon:text-fg-quaternary_hover",
      ].join(" "),
    },
    "primary-destructive": {
      root: [
        "bg-destructive-solid text-white shadow-xs-skeuomorphic ring-1 ring-transparent outline-destructive ring-inset hover:bg-destructive-solid_hover data-loading:bg-destructive-solid_hover",
        // Inner border gradient
        "before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0%",
        // Icon buttonStyles
        "*:data-icon:text-white/60 hover:*:data-icon:text-white/70",
      ].join(" "),
    },
    "secondary-destructive": {
      root: [
        "bg-primary text-destructive-primary shadow-xs-skeuomorphic ring-1 ring-destructive_subtle outline-destructive ring-inset hover:bg-destructive-primary hover:text-destructive-primary_hover data-loading:bg-destructive-primary",
        // Icon buttonStyles
        "*:data-icon:text-fg-destructive-secondary hover:*:data-icon:text-fg-destructive-primary",
      ].join(" "),
    },
    "tertiary-destructive": {
      root: [
        "text-destructive-primary outline-destructive hover:bg-destructive-primary hover:text-destructive-primary_hover data-loading:bg-destructive-primary",
        // Icon buttonStyles
        "*:data-icon:text-fg-destructive-secondary hover:*:data-icon:text-fg-destructive-primary",
      ].join(" "),
    },
    "light-destructive": {
      root: [
        // The ring is barely there on a light page, and outlines the button on a dark one.
        "bg-utility-red-50 text-utility-red-700 ring-1 ring-utility-red-100 outline-destructive ring-inset hover:bg-utility-red-100 data-loading:bg-utility-red-100 dark:ring-utility-red-200",
        // Icon buttonStyles
        "*:data-icon:text-utility-red-500 hover:*:data-icon:text-utility-red-600",
      ].join(" "),
    },
    "link-destructive": {
      root: [
        "justify-normal rounded p-0! text-destructive-primary outline-destructive hover:text-destructive-primary_hover",
        // Inner text underline
        "*:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current",
        // Icon buttonStyles
        "*:data-icon:text-fg-destructive-secondary hover:*:data-icon:text-fg-destructive-primary",
      ].join(" "),
    },
  },
});

/**
 * Common props shared between button and anchor variants
 */
export interface CommonProps {
  /** Disables the button and shows a disabled state */
  isDisabled?: boolean;
  /** Shows a loading spinner and disables the button */
  isLoading?: boolean;
  /** The size variant of the button */
  size?: keyof typeof buttonStyles.sizes;
  /** The color variant of the button */
  color?: keyof typeof buttonStyles.colors;
  /** Icon component or element to show before the text */
  iconLeading?: FC<{ className?: string }> | ReactNode;
  /** Icon component or element to show after the text */
  iconTrailing?: FC<{ className?: string }> | ReactNode;
  /** Removes horizontal padding from the text content */
  noTextPadding?: boolean;
  /** When true, keeps the text visible during loading state */
  showTextWhileLoading?: boolean;

  children?: ReactNode;
  className?: string;
}

/**
 * Props for the button variant (non-link)
 */
export interface ButtonProps
  extends CommonProps, Omit<AriaButtonProps, "children" | "className"> {}
/**
 * Props for the link variant (anchor tag)
 */
interface LinkProps
  extends CommonProps, Omit<AriaLinkProps, "children" | "className"> {
  href: NonNullable<AriaLinkProps["href"]>;
}

/** Union type of button and link props */
export type Props = ButtonProps | LinkProps;

export function Button(props: LinkProps): ReactElement<LinkProps>;
export function Button(props: ButtonProps): ReactElement<ButtonProps>;
export function Button({
  size = "sm",
  color = "primary",
  children,
  className,
  noTextPadding,
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  isDisabled: disabled,
  isLoading: loading,
  showTextWhileLoading,
  ...props
}: Props) {
  const href = "href" in props ? props.href : undefined;
  const { isTabFocused, focusProps } = useTabFocus();

  const isIcon = (IconLeading || IconTrailing) && !children;
  const isLinkType = ["link-gray", "link-color", "link-destructive"].includes(
    color,
  );

  noTextPadding = isLinkType || noTextPadding;

  const commonChildren = (
    <>
      {/* Leading icon */}
      {isValidElement(IconLeading) && IconLeading}
      {isReactComponent(IconLeading) && (
        <IconLeading data-icon="leading" className={buttonStyles.common.icon} />
      )}

      {loading && (
        <Loader
          className={cx(
            buttonStyles.common.icon,
            !showTextWhileLoading &&
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          )}
        />
      )}

      {children && (
        <span
          data-text
          className={cx("transition-inherit-all", !noTextPadding && "px-0.5")}
        >
          {children}
        </span>
      )}

      {/* Trailing icon */}
      {isValidElement(IconTrailing) && IconTrailing}
      {isReactComponent(IconTrailing) && (
        <IconTrailing
          data-icon="trailing"
          className={buttonStyles.common.icon}
        />
      )}
    </>
  );

  const commonProps = {
    "data-loading": loading ? true : undefined,
    "data-icon-only": isIcon ? true : undefined,
    "data-tab-focused": isTabFocused ? true : undefined,
    ...props,
    onFocus: chain(focusProps.onFocus, props.onFocus),
    onBlur: chain(focusProps.onBlur, props.onBlur),
    isDisabled: disabled,
    className: cx(
      buttonStyles.common.root,
      buttonStyles.sizes[size].root,
      buttonStyles.colors[color].root,
      isLinkType && buttonStyles.sizes[size].linkRoot,
      (loading || (href && (disabled || loading))) && "pointer-events-none",
      // If in `loading` state, hide everything except the loading icon (and text if `showTextWhileLoading` is true).
      loading &&
        (showTextWhileLoading
          ? "[&>*:not([data-icon=loading]):not([data-text])]:hidden"
          : "[&>*:not([data-icon=loading])]:invisible"),
      className,
    ),
    children: commonChildren,
  };

  if ("href" in commonProps) {
    return <AriaLink {...commonProps} href={disabled ? undefined : href} />;
  }

  return (
    <AriaButton
      {...commonProps}
      type={commonProps.type || "button"}
      isPending={loading}
    />
  );
}
