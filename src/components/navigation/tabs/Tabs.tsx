import type { ComponentPropsWithRef } from "react";
import { Tabs as AriaTabs } from "react-aria-components";
import { cx } from "@styles/utils";
import { Tab } from "./Tab";
import { TabList } from "./TabList";
import { TabPanel } from "./TabPanel";

export const Tabs = ({
  className,
  ...props
}: ComponentPropsWithRef<typeof AriaTabs>) => {
  return (
    <AriaTabs
      keyboardActivation="manual"
      {...props}
      className={(state) =>
        cx(
          "flex w-full flex-col",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
};

Tabs.Panel = TabPanel;
Tabs.List = TabList;
Tabs.Item = Tab;
