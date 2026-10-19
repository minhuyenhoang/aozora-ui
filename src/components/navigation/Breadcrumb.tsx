import {
  Children,
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useState,
} from "react";
import { IconChevronRight, IconDots } from "@tabler/icons-react";
import {
  Button as AriaButton,
  Breadcrumb as AriaBreadcrumb,
  type BreadcrumbProps as AriaBreadcrumbProps,
  Breadcrumbs as AriaBreadcrumbs,
  type BreadcrumbsProps as AriaBreadcrumbsProps,
} from "react-aria-components";
import { Link, type LinkProps } from "./Link";
import { cx } from "@styles/utils";

type BreadcrumbSeparator = "chevron" | "slash" | false;

const BreadcrumbsContext = createContext<BreadcrumbSeparator>("chevron");

export interface BreadcrumbsProps<
  T extends object,
> extends AriaBreadcrumbsProps<T> {
  /**
   * What is drawn between the items. `false` draws nothing.
   * @default "chevron"
   */
  separator?: BreadcrumbSeparator;
  /**
   * The most items shown at once. Past it, the items after the first one
   * collapse into an ellipsis, which shows them all when pressed. Only applies
   * to items given as children, not through `items`.
   */
  maxItems?: number;
  /**
   * The accessible name of the ellipsis.
   * @default "Show all pages"
   */
  expandLabel?: string;
}

export function Breadcrumbs<T extends object>({
  separator = "chevron",
  maxItems,
  expandLabel = "Show all pages",
  className,
  children,
  ...props
}: BreadcrumbsProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);

  let content = children;

  if (typeof children !== "function" && maxItems !== undefined) {
    const items = Children.toArray(children as ReactNode);
    // At least the first and the current page stay visible.
    const visibleCount = Math.max(maxItems, 2);

    if (!isExpanded && items.length > visibleCount) {
      content = [
        items[0],
        <BreadcrumbsEllipsis
          key="ellipsis"
          label={expandLabel}
          onPress={() => setIsExpanded(true)}
        />,
        ...items.slice(items.length - visibleCount + 1),
      ];
    }
  }

  return (
    <BreadcrumbsContext.Provider value={separator}>
      <AriaBreadcrumbs
        {...props}
        className={cx("flex flex-wrap items-center gap-2", className)}
      >
        {content}
      </AriaBreadcrumbs>
    </BreadcrumbsContext.Provider>
  );
}

function BreadcrumbsEllipsis({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const separator = useContext(BreadcrumbsContext);

  return (
    <AriaBreadcrumb id="ellipsis" className="flex items-center gap-2 text-sm">
      <AriaButton
        aria-label={label}
        onPress={onPress}
        className="flex cursor-pointer items-center rounded text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <IconDots aria-hidden="true" className="size-4" />
      </AriaButton>
      <BreadcrumbSeparatorIcon separator={separator} />
    </AriaBreadcrumb>
  );
}

function BreadcrumbSeparatorIcon({
  separator,
}: {
  separator: BreadcrumbSeparator;
}) {
  if (separator === "chevron") {
    return (
      <IconChevronRight
        aria-hidden="true"
        className="size-4 shrink-0 text-fg-quaternary"
      />
    );
  }

  if (separator === "slash") {
    return (
      <span aria-hidden="true" className="text-fg-quaternary">
        /
      </span>
    );
  }

  return null;
}

export interface BreadcrumbsItemProps
  extends
    Pick<AriaBreadcrumbProps, "id" | "className">,
    Omit<LinkProps, "id" | "className" | "color"> {
  /** Icon shown before the text. */
  icon?: FC<{ className?: string }>;
  /** Overrides the separator after this item, set on `Breadcrumbs`. */
  separator?: BreadcrumbSeparator;
}

/**
 * An item of `Breadcrumbs`. It is a `Link`, so it navigates through the
 * router given to React Aria's `RouterProvider`. The last item is the current
 * page, which is not a link and has no separator after it.
 */
export function BreadcrumbsItem({
  id,
  className,
  icon: Icon,
  separator: separatorProp,
  children,
  ...linkProps
}: BreadcrumbsItemProps) {
  const contextSeparator = useContext(BreadcrumbsContext);
  const separator = separatorProp ?? contextSeparator;

  return (
    <AriaBreadcrumb
      id={id}
      className={(state) =>
        cx(
          "flex items-center gap-2 text-sm",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {({ isCurrent }) => (
        <>
          <Link
            {...linkProps}
            color="gray"
            className="inline-flex items-center gap-1.5"
          >
            {(renderProps) => (
              <>
                {Icon && (
                  <Icon
                    aria-hidden="true"
                    className={cx(
                      "size-4 shrink-0",
                      isCurrent ? "text-fg-brand-secondary" : "text-fg-quaternary",
                    )}
                  />
                )}
                {typeof children === "function"
                  ? children(renderProps)
                  : children}
              </>
            )}
          </Link>

          {!isCurrent && <BreadcrumbSeparatorIcon separator={separator} />}
        </>
      )}
    </AriaBreadcrumb>
  );
}
