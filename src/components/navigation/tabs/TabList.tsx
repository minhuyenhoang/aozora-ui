import type { TabListProps as AriaTabListProps } from "react-aria-components";
import {
  TabList as AriaTabList,
  TabsContext,
  useSlottedContext,
} from "react-aria-components";
import { cx } from "@styles/utils";
import { Tab, type TabComponentProps } from "./Tab";
import {
  TabListContext,
  type HorizontalTabTypes,
  type TabOrientation,
  type TabSize,
  type TabTypeColors,
} from "./TabListContext";

// Styles for different types of horizontal tabs
const getHorizontalStyles = ({
  size,
  fullWidth,
}: {
  size?: TabSize;
  fullWidth?: boolean;
}) => ({
  "button-brand": "gap-1",
  "button-gray": "gap-1",
  "button-border": cx(
    "gap-1 rounded-[10px] bg-secondary_alt p-1 ring-1 ring-secondary ring-inset",
    size === "md" && "rounded-xl p-1.5",
  ),
  "button-minimal":
    "gap-0.5 rounded-lg bg-secondary_alt ring-1 ring-inset ring-secondary",
  underline: cx("gap-3", fullWidth && "w-full gap-4"),
  line: "gap-2",
});

export interface TabListComponentProps<
  T extends object,
  K extends TabOrientation,
> extends Omit<AriaTabListProps<T>, "items"> {
  /** The size of the tab list. */
  size?: TabSize;
  /** The type of the tab list. */
  type?: TabTypeColors<K>;
  /** The orientation of the tab list. */
  orientation?: K;
  /** The items of the tab list. When provided, tabs are rendered automatically via the render function in children. */
  items?: T[];
  /** Whether the tab list is full width. */
  fullWidth?: boolean;
}

export const TabList = <T extends TabOrientation>({
  size = "sm",
  type = "button-brand",
  orientation: orientationProp,
  fullWidth,
  className,
  children,
  ...otherProps
}: TabListComponentProps<TabComponentProps, T>) => {
  const context = useSlottedContext(TabsContext);

  const orientation = orientationProp ?? context?.orientation ?? "horizontal";

  return (
    <TabListContext.Provider value={{ size, type, orientation, fullWidth }}>
      <AriaTabList
        {...otherProps}
        className={(state) =>
          cx(
            "group flex",

            getHorizontalStyles({
              size,
              fullWidth,
            })[type as HorizontalTabTypes],

            orientation === "vertical" && "w-max flex-col",

            // Only horizontal tabs with underline type have bottom border
            orientation === "horizontal" &&
              type === "underline" &&
              "relative before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border-secondary",

            typeof className === "function" ? className(state) : className,
          )
        }
      >
        {children ??
          (otherProps.items
            ? (item) => <Tab {...item}>{item.children}</Tab>
            : undefined)}
      </AriaTabList>
    </TabListContext.Provider>
  );
};
