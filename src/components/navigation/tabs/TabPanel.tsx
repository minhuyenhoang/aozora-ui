import type { ComponentPropsWithRef } from "react";
import { TabPanel as AriaTabPanel } from "react-aria-components";
import { cx } from "@styles/utils";

export const TabPanel = (props: ComponentPropsWithRef<typeof AriaTabPanel>) => {
  return (
    <AriaTabPanel
      {...props}
      className={(state) =>
        cx(
          "outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
          typeof props.className === "function"
            ? props.className(state)
            : props.className,
        )
      }
    />
  );
};
