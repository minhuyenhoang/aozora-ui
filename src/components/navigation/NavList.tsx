import { cx } from "@styles/utils";
import type { NavItemDividerType, NavItemType } from "./constants";
import { Menu } from "../collection/Menu";
import { Separator } from "../surface/Separator";
import { NavItem } from "./NavItem";

interface NavListProps {
  /** URL of the currently active item. */
  activeUrl?: string;
  /** Additional CSS classes to apply to the list. */
  className?: string;
  /** List of items to display. */
  items: (NavItemType | NavItemDividerType)[];
  /**
   * How items with sub-items are shown: expanding in place, or opening a
   * menu beside the list.
   * @default "collapsible"
   */
  nested?: "collapsible" | "menu";
}

export const NavList = ({
  activeUrl,
  items,
  className,
  nested = "collapsible",
}: NavListProps) => {
  const activeItem = items.find(
    (item) =>
      item.href === activeUrl ||
      item.items?.some((subItem) => subItem.href === activeUrl),
  );

  return (
    <ul className={cx("flex flex-col px-4 pt-5", className)}>
      {items.map((item, index) => {
        if (item.divider) {
          return (
            <li key={index} className="w-full px-0.5 py-2">
              <Separator />
            </li>
          );
        }

        if (item.items?.length && nested === "menu") {
          return (
            <li key={item.label} className="py-px">
              <Menu.Root>
                <NavItem
                  type="menu"
                  badge={item.badge}
                  icon={item.icon}
                  current={activeItem === item}
                >
                  {item.label}
                </NavItem>
                <Menu.Popover placement="right top" offset={12}>
                  <Menu.Menu aria-label={item.label}>
                    {item.items.map((childItem) => (
                      <Menu.Item
                        key={childItem.href}
                        id={childItem.href}
                        href={childItem.href}
                        label={childItem.label}
                        icon={childItem.icon}
                        aria-current={
                          activeUrl === childItem.href ? "page" : undefined
                        }
                      />
                    ))}
                  </Menu.Menu>
                </Menu.Popover>
              </Menu.Root>
            </li>
          );
        }

        if (item.items?.length) {
          return (
            <details
              key={item.label}
              open={activeItem?.href === item.href}
              className="appearance-none py-0.25"
            >
              <NavItem badge={item.badge} icon={item.icon} type="collapsible">
                {item.label}
              </NavItem>

              <dd>
                <ul className="pb-1">
                  {item.items.map((childItem) => (
                    <li key={childItem.label} className="py-0.25">
                      <NavItem
                        href={childItem.href}
                        badge={childItem.badge}
                        type="collapsible-child"
                        current={activeUrl === childItem.href}
                      >
                        {childItem.label}
                      </NavItem>
                    </li>
                  ))}
                </ul>
              </dd>
            </details>
          );
        }

        return (
          <li key={item.label} className="py-px">
            <NavItem
              type="link"
              badge={item.badge}
              icon={item.icon}
              href={item.href}
              current={activeUrl === item.href}
            >
              {item.label}
            </NavItem>
          </li>
        );
      })}
    </ul>
  );
};
