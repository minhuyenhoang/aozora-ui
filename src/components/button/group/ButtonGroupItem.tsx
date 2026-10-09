import {
  type FC,
  type PropsWithChildren,
  type ReactNode,
  type RefAttributes,
  isValidElement,
  useContext,
} from "react";
import {
  ToggleButton as AriaToggleButton,
  type ToggleButtonProps,
} from "react-aria-components";
import { ButtonGroupContext, buttonGroupStyles } from "./ButtonGroup";
import { cx } from "@styles/utils";
import { isReactComponent } from "@utils/componentCheck";

interface ButtonGroupItemProps
  extends ToggleButtonProps, RefAttributes<HTMLButtonElement> {
  iconLeading?: FC<{ className?: string }> | ReactNode;
  iconTrailing?: FC<{ className?: string }> | ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ButtonGroupItem({
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  children,
  className,
  ...otherProps
}: PropsWithChildren<ButtonGroupItemProps>) {
  const context = useContext(ButtonGroupContext);

  if (!context) {
    throw new Error(
      "ButtonGroupItem must be used within a ButtonGroup component",
    );
  }

  const { size } = context;

  const isIcon = (IconLeading || IconTrailing) && !children;

  return (
    <AriaToggleButton
      {...otherProps}
      data-icon-only={isIcon ? true : undefined}
      data-icon-leading={IconLeading ? true : undefined}
      className={cx(
        buttonGroupStyles.common.root,
        buttonGroupStyles.sizes[size].root,
        className,
      )}
    >
      {isReactComponent(IconLeading) && (
        <IconLeading
          className={cx(
            buttonGroupStyles.common.icon,
            buttonGroupStyles.sizes[size].icon,
          )}
        />
      )}
      {isValidElement(IconLeading) && IconLeading}

      {children}

      {isReactComponent(IconTrailing) && (
        <IconTrailing
          className={cx(
            buttonGroupStyles.common.icon,
            buttonGroupStyles.sizes[size].icon,
          )}
        />
      )}
      {isValidElement(IconTrailing) && IconTrailing}
    </AriaToggleButton>
  );
}
