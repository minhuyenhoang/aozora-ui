import type { ComponentProps, ReactNode } from "react";
import { useLocalStorage } from "@hooks/useLocalStorage";
import { cx } from "@styles/utils";
import { NavList } from "../NavList";
import type { NavItemDividerType, NavItemType } from "../constants";

/** The localStorage key that remembers whether the sidebar is open. */
export const SIDEBAR_STORAGE_KEY = "sidebar:open";

/**
 * Remembers whether the sidebar is open, across reloads and tabs.
 *
 * @param defaultIsOpen Used until the user has opened or closed the sidebar.
 * @returns Whether it is open, and a function to change that.
 */
export function useSidebarOpen(defaultIsOpen: boolean) {
  const [storedIsOpen, setIsOpen] = useLocalStorage<boolean | null>(
    SIDEBAR_STORAGE_KEY,
    null,
  );

  return [storedIsOpen ?? defaultIsOpen, setIsOpen] as const;
}

export interface SidebarProps extends Omit<
  ComponentProps<"aside">,
  "children"
> {
  /** URL of the currently active item. */
  activeUrl?: string;
  /** List of items to display. */
  items: (NavItemType | NavItemDividerType)[];
  /** Content shown above the navigation, such as a logo or workspace name. */
  header?: ReactNode;
  /** Content pinned to the bottom, such as an account menu. */
  footer?: ReactNode;
}

/**
 * The navigation panel. It only draws itself. Where it sits, and whether it
 * is collapsed, is decided by the layout that renders it, such as `AppShell`.
 */
export function Sidebar({
  activeUrl,
  items,
  header,
  footer,
  className,
  ...props
}: SidebarProps) {
  return (
    <aside
      {...props}
      className={cx(
        "flex h-full w-(--sidebar-width,276px) max-w-full flex-col overflow-y-auto border-r border-secondary bg-primary",
        className,
      )}
    >
      {header && <div className="px-4 pt-4">{header}</div>}
      <NavList
        activeUrl={activeUrl}
        items={items}
        // Sub-items open in a menu beside the sidebar.
        nested="menu"
        className="flex-1 pt-4 pb-4"
      />
      {footer && (
        <div className="border-t border-secondary px-4 py-3">{footer}</div>
      )}
    </aside>
  );
}
