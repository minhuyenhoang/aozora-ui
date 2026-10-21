import {
  Children,
  Fragment,
  isValidElement,
  type ReactNode,
  type Ref,
  useContext,
  useMemo,
} from "react";
import {
  CheckboxGroup as AriaCheckboxGroup,
  CheckboxGroupStateContext,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
} from "react-aria-components";
import { DescriptionText } from "../../base/DescriptionText";
import { Label } from "../../base/Label";
import { Checkbox } from "../Checkbox";
import { CheckboxGroupContext } from "./CheckboxGroupContext";
import { cx } from "@styles/utils";

export interface CheckboxGroupProps
  extends Omit<AriaCheckboxGroupProps, "children" | "isRequired"> {
  children: ReactNode;
  /** Field label displayed above the checkboxes. */
  label?: ReactNode;
  /** Helper or error text displayed below the checkboxes. */
  description?: ReactNode;
  /** Tooltip text displayed beside the group label. */
  tooltip?: string;
  /** Size applied to every Checkbox child. */
  size?: "sm" | "md";
  /** Layout direction for the checkbox options. */
  orientation?: "horizontal" | "vertical";
  /** Whether the group is required and shows the required indicator. */
  required?: boolean;
  /** Whether to show a checkbox that selects or clears every enabled option. */
  selectAll?: boolean;
  /** Label for the select-all checkbox. */
  selectAllLabel?: ReactNode;
  /** Description for the select-all checkbox. */
  selectAllDescription?: ReactNode;
  /**
   * Values controlled by the select-all checkbox. By default these are
   * collected from enabled Checkbox children.
   */
  selectAllValues?: string[];
  ref?: Ref<HTMLDivElement>;
}

interface CheckboxElementProps {
  children?: ReactNode;
  isDisabled?: boolean;
  value?: string;
}

function getEnabledCheckboxValues(children: ReactNode) {
  const values = new Set<string>();

  function visit(nodes: ReactNode) {
    Children.forEach(nodes, (child) => {
      if (!isValidElement<CheckboxElementProps>(child)) return;

      if (child.type === Fragment) {
        visit(child.props.children);
        return;
      }

      if (child.type === Checkbox) {
        if (!child.props.isDisabled && typeof child.props.value === "string") {
          values.add(child.props.value);
        }
        return;
      }

      visit(child.props.children);
    });
  }

  visit(children);
  return [...values];
}

interface SelectAllCheckboxProps {
  values: string[];
  label: ReactNode;
  description?: ReactNode;
  size: "sm" | "md";
}

function SelectAllCheckbox({
  values,
  label,
  description,
  size,
}: SelectAllCheckboxProps) {
  const state = useContext(CheckboxGroupStateContext);

  if (!state) return null;

  const groupState = state;
  const selectableValues = new Set(values);
  const selectedCount = values.filter((value) =>
    groupState.isSelected(value),
  ).length;
  const isSelected = values.length > 0 && selectedCount === values.length;
  const isIndeterminate = selectedCount > 0 && !isSelected;

  function handleChange(nextSelected: boolean) {
    const retainedValues = groupState.value.filter(
      (value) => !selectableValues.has(value),
    );

    groupState.setValue(
      nextSelected ? [...retainedValues, ...values] : [...retainedValues],
    );
  }

  return (
    // The aggregate checkbox controls the group but is not itself one of the
    // submitted group values.
    <CheckboxGroupStateContext.Provider value={null}>
      <Checkbox
        label={label}
        description={description}
        size={size}
        isSelected={isSelected}
        isIndeterminate={isIndeterminate}
        isDisabled={groupState.isDisabled || values.length === 0}
        isReadOnly={groupState.isReadOnly}
        onChange={handleChange}
      />
    </CheckboxGroupStateContext.Provider>
  );
}

export function CheckboxGroup({
  children,
  label,
  description,
  tooltip,
  size = "sm",
  required,
  selectAll = false,
  selectAllLabel = "Select all",
  selectAllDescription,
  selectAllValues,
  orientation = "vertical",
  className,
  ref,
  ...props
}: CheckboxGroupProps) {
  const enabledValues = useMemo(
    () => selectAllValues ?? getEnabledCheckboxValues(children),
    [children, selectAllValues],
  );

  return (
    <CheckboxGroupContext.Provider value={{ size }}>
      <AriaCheckboxGroup
        {...props}
        ref={ref}
        aria-orientation={orientation}
        isRequired={required}
        className={(state) =>
          cx(
            "group flex w-full flex-col gap-3",
            typeof className === "function" ? className(state) : className,
          )
        }
      >
        {(state) => (
          <>
            {label && (
              <Label isRequired={state.isRequired} tooltip={tooltip}>
                {label}
              </Label>
            )}

            <div
              className={cx(
                "flex gap-4",
                orientation === "vertical"
                  ? "flex-col"
                  : "flex-row flex-wrap items-start",
              )}
            >
              {selectAll && (
                <SelectAllCheckbox
                  values={enabledValues}
                  label={selectAllLabel}
                  description={selectAllDescription}
                  size={size}
                />
              )}

              {children}
            </div>

            {description && (
              <DescriptionText isInvalid={state.isInvalid} size={size}>
                {description}
              </DescriptionText>
            )}
          </>
        )}
      </AriaCheckboxGroup>
    </CheckboxGroupContext.Provider>
  );
}
