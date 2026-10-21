import type {
  FC,
  FocusEventHandler,
  PointerEventHandler,
  ReactNode,
  Ref,
  RefAttributes,
} from "react";
import {
  isValidElement,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { IconSearch, IconX } from "@tabler/icons-react";
import type {
  ComboBoxProps as AriaComboBoxProps,
  GroupProps as AriaGroupProps,
  ListBoxProps as AriaListBoxProps,
} from "react-aria-components";
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  Group as AriaGroup,
  Input as AriaInput,
  ListBox as AriaListBox,
  ComboBoxStateContext,
} from "react-aria-components";
import { DescriptionText } from "../base/DescriptionText";
import { Label } from "../base/Label";
import { Popover } from "../overlay/Popover";
import { useResizeObserver } from "@hooks/useResizeObserver";
import { cx } from "@styles/utils";
import { isReactComponent } from "@/utils/componentCheck";
import type { SelectionCommonProps, SelectItemType } from "./types";
import { selectSizes } from "./constants";
import { SelectContext } from "./select/SelectContext";

interface ComboBoxProps
  extends
    Omit<
      AriaComboBoxProps<SelectItemType>,
      "children" | "isRequired" | "items"
    >,
    RefAttributes<HTMLDivElement>,
    SelectionCommonProps {
  /** Keyboard shortcut to display. */
  shortcut?: string | boolean;
  /** Shows a button at the end of the input that clears its value. */
  isClearable?: boolean;
  /** Called after the clear button clears the value. */
  onClear?: () => void;
  items?: SelectItemType[];
  popoverClassName?: string;
  shortcutClassName?: string;
  /** Leading icon component displayed before the input. */
  icon?: FC | ReactNode;
  children: AriaListBoxProps<SelectItemType>["children"];
}

interface ComboBoxValueProps extends AriaGroupProps {
  size: "sm" | "md" | "lg";
  shortcut?: string | boolean;
  isClearable?: boolean;
  onClear?: () => void;
  placeholder?: string;
  shortcutClassName?: string;
  icon?: FC | ReactNode;
  onFocus?: FocusEventHandler;
  onPointerEnter?: PointerEventHandler;
  ref?: Ref<HTMLDivElement>;
}

function ComboBoxValue({
  size,
  shortcut,
  isClearable,
  onClear,
  placeholder,
  shortcutClassName,
  icon: IconProp,
  ref,
  ...otherProps
}: ComboBoxValueProps) {
  const state = useContext(ComboBoxStateContext);
  const inputRef = useRef<HTMLInputElement>(null);

  const value = state?.selectedItem?.value || null;
  const inputValue = state?.inputValue || null;
  const isClearVisible = isClearable && Boolean(inputValue);

  const first = inputValue?.split(value?.supportingText)?.[0] || "";
  const last = inputValue?.split(first)[1];

  return (
    <AriaGroup
      ref={ref}
      {...otherProps}
      className={({ isFocusWithin, isDisabled }) =>
        cx(
          "relative flex w-full items-center gap-2 rounded-lg bg-primary shadow-xs ring-1 ring-primary outline-hidden transition-shadow duration-100 ease-linear ring-inset",
          isDisabled && "cursor-not-allowed opacity-50",
          isFocusWithin && "ring-2 ring-brand",

          // Icon styles
          "*:data-icon:shrink-0 *:data-icon:text-fg-quaternary",

          selectSizes[size].root,
        )
      }
    >
      {isReactComponent(IconProp) ? (
        <IconProp
          data-icon
          className="pointer-events-none"
          aria-hidden="true"
        />
      ) : isValidElement(IconProp) ? (
        IconProp
      ) : (
        <IconSearch
          data-icon
          className="pointer-events-none"
          aria-hidden="true"
        />
      )}

      <div className="relative flex w-full items-center">
        {inputValue && (
          <span
            className={cx(
              "absolute top-1/2 z-0 inline-flex w-full -translate-y-1/2 truncate",
              selectSizes[size].textContainer,
            )}
            aria-hidden="true"
          >
            <p
              className={cx("font-medium text-primary", selectSizes[size].text)}
            >
              {first}
            </p>
            {last && (
              <p
                className={cx("-ml-0.75 text-tertiary", selectSizes[size].text)}
              >
                {last}
              </p>
            )}
          </span>
        )}

        <AriaInput
          ref={inputRef}
          placeholder={placeholder}
          className={cx(
            "z-10 w-full appearance-none bg-transparent text-transparent caret-alpha-black/90 placeholder:text-placeholder focus:outline-hidden disabled:cursor-not-allowed",
            selectSizes[size].text,
          )}
        />
      </div>

      {isClearVisible && (
        <AriaButton
          slot={null}
          aria-label="Clear"
          // Keep the control exposed while React Aria hides content outside
          // the input and popover from assistive technology.
          data-react-aria-top-layer
          preventFocusOnPress
          onPress={() => {
            state?.setValue(null);
            state?.setInputValue("");
            state?.close();
            inputRef.current?.focus();
            onClear?.();
          }}
          className="flex shrink-0 cursor-pointer items-center justify-center text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover focus:outline-hidden"
        >
          <IconX className="size-4 stroke-[2.25px]" />
        </AriaButton>
      )}

      {shortcut && !isClearVisible && (
        <div
          className={cx(
            "absolute inset-y-0.5 right-0.5 z-10 hidden items-center rounded-r-[inherit] bg-linear-to-r from-transparent to-bg-primary to-40% pl-8 md:flex",
            selectSizes[size].shortcut,
            shortcutClassName,
          )}
        >
          <span
            className="pointer-events-none rounded px-1 py-px text-xs font-medium text-quaternary ring-1 ring-secondary select-none ring-inset"
            aria-hidden="true"
          >
            {typeof shortcut === "string" ? shortcut : "⌘K"}
          </span>
        </div>
      )}
    </AriaGroup>
  );
}

export function ComboBox({
  placeholder = "Search",
  shortcut,
  isClearable,
  onClear,
  size = "md",
  children,
  items,
  shortcutClassName,
  icon,
  required,
  ...otherProps
}: ComboBoxProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [popoverWidth, setPopoverWidth] = useState("");

  // Resize observer for popover width
  const onResize = useCallback(() => {
    if (!placeholderRef.current) return;

    const divRect = placeholderRef.current?.getBoundingClientRect();

    setPopoverWidth(divRect.width + "px");
  }, [placeholderRef, setPopoverWidth]);

  useResizeObserver({
    ref: placeholderRef,
    box: "border-box",
    onResize,
  });

  return (
    <SelectContext.Provider value={{ size }}>
      <AriaComboBox menuTrigger="focus" {...otherProps} isRequired={required}>
        {(state) => (
          <div className="flex flex-col gap-1.5">
            {otherProps.label && (
              <Label
                isRequired={state.isRequired}
                tooltip={otherProps.tooltip}
              >
                {otherProps.label}
              </Label>
            )}

            <ComboBoxValue
              ref={placeholderRef}
              placeholder={placeholder}
              shortcut={shortcut}
              isClearable={
                isClearable && !state.isDisabled && !state.isReadOnly
              }
              onClear={onClear}
              shortcutClassName={shortcutClassName}
              icon={icon}
              size={size}
              // This is a workaround to correctly calculating the trigger width
              // while using ResizeObserver wasn't 100% reliable.
              onFocus={onResize}
              onPointerEnter={onResize}
            />

            <Popover
              size={size}
              triggerRef={placeholderRef}
              style={{ width: popoverWidth }}
              className={otherProps.popoverClassName}
            >
              <AriaListBox items={items} className="size-full outline-hidden">
                {children}
              </AriaListBox>
            </Popover>

            {otherProps.description && (
              <DescriptionText
                isInvalid={state.isInvalid}
                className={cx(size === "sm" && "text-xs")}
              >
                {otherProps.description}
              </DescriptionText>
            )}
          </div>
        )}
      </AriaComboBox>
    </SelectContext.Provider>
  );
}
