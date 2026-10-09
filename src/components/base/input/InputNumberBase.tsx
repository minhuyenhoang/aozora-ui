import {
  type ChangeEvent,
  type Ref,
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconMinus,
  IconPlus,
} from "@tabler/icons-react";
import {
  Button as AriaButton,
  Group as AriaGroup,
  Input as AriaInput,
  type InputProps as AriaInputProps,
  type NumberFieldProps as AriaNumberFieldProps,
  NumberFieldStateContext as AriaNumberFieldStateContext,
} from "react-aria-components";
import { useNumberFormatter } from "react-aria";
import { cx } from "@/styles/utils";
import { Button } from "../../button/Button";

const NumberFieldContext = createContext<{
  size?: "sm" | "md" | "lg";
  wrapperClassName?: string;
  iconClassName?: string;
  tooltipClassName?: string;
  inputClassName?: string;
}>({});

const styles = {
  sm: "px-3 py-2 text-sm",
  md: "px-3 py-2 text-md",
  lg: "px-3.5 py-2.5 text-md",
};

/** The longest run of digits a JavaScript number holds without rounding. */
const MAX_SAFE_DIGITS = 15;

type NumberFormatter = ReturnType<typeof useNumberFormatter>;

/**
 * Adds the thousands separators to a number that is still being typed.
 * Only the whole part is touched, so a sign, a currency symbol, a trailing
 * decimal separator and leading zeros all stay as they were typed.
 */
function groupWhileTyping(text: string, formatter: NumberFormatter) {
  const parts = formatter.formatToParts(11111.5);
  const group = parts.find((part) => part.type === "group")?.value;
  const decimal = parts.find((part) => part.type === "decimal")?.value;

  // The locale, or the format options, do not group digits.
  if (!group) return { text, group };

  const decimalIndex = decimal ? text.indexOf(decimal) : -1;
  const whole = decimalIndex === -1 ? text : text.slice(0, decimalIndex);
  const start = whole.search(/\d/);

  if (start === -1) return { text, group };

  // The whole part runs from the first digit to the last one.
  const end = whole.length - [...whole].reverse().findIndex(isDigit);
  const digits = [...whole.slice(start, end)].filter(isDigit);

  // Leaves alone anything else in between, such as a letter that was pasted.
  const isOnlyDigits = [...whole.slice(start, end)].every(
    (character) => isDigit(character) || character === group,
  );

  if (!isOnlyDigits || digits.length > MAX_SAFE_DIGITS) return { text, group };

  // Formats a number with as many digits, then puts the typed digits in its
  // place. This follows the grouping of the locale without changing a digit.
  const pattern = formatter.formatToParts(Number("1".repeat(digits.length)));
  const grouped = pattern
    .filter((part) => part.type === "integer" || part.type === "group")
    .map((part) =>
      part.type === "group"
        ? group
        : digits.splice(0, part.value.length).join(""),
    )
    .join("");

  return {
    text: text.slice(0, start) + grouped + text.slice(end),
    group,
  };
}

function isDigit(character: string) {
  return character >= "0" && character <= "9";
}

/** Where the caret goes so it stays after the same typed characters. */
function getCaretAfterGrouping(
  before: string,
  after: string,
  caret: number,
  group: string,
) {
  const count = (text: string) =>
    [...text].filter((character) => character !== group).length;
  const typedBeforeCaret = count(before.slice(0, caret));
  let position = 0;

  while (
    position < after.length &&
    count(after.slice(0, position)) < typedBeforeCaret
  ) {
    position += 1;
  }

  return position;
}

export interface InputNumberBaseProps extends AriaNumberFieldProps {
  /**
   * Input size.
   * @default "sm"
   */
  size?: "sm" | "md" | "lg";
  /** Placeholder text. */
  placeholder?: string;
  /** Class name for the input. */
  inputClassName?: string;
  /** Class name for the input wrapper. */
  wrapperClassName?: string;
  ref?: Ref<HTMLInputElement>;
  groupRef?: Ref<HTMLDivElement>;
  /** Orientation of buttons. */
  orientation?: "horizontal" | "vertical";
}

export function InputNumberBase({
  ref,
  groupRef,
  size = "md",
  isInvalid,
  isDisabled,
  placeholder,
  wrapperClassName,
  inputClassName,
  orientation = "vertical",
  formatOptions,
  // Omit this prop to avoid invalid HTML attribute warning
  isRequired: _isRequired,
  ...inputProps
}: Omit<InputNumberBaseProps, "label" | "description">) {
  // If the input is inside a `TextFieldContext`, use its context to simplify applying styles
  const context = useContext(NumberFieldContext);
  const state = useContext(AriaNumberFieldStateContext);
  // Only the separators are read from it, so the style of number is left out.
  const formatter = useNumberFormatter({
    useGrouping: formatOptions?.useGrouping,
  });
  // The caret to restore once the grouped text has been rendered.
  const pendingCaret = useRef<{ input: HTMLInputElement; position: number }>(
    null,
  );

  const inputSize = context?.size || size;

  // React Aria groups the digits when the field loses focus. This does the
  // same on every keystroke, so large numbers stay readable while typing.
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const typed = input.value;
    const { text, group } = groupWhileTyping(typed, formatter);

    if (!state || !group || text === typed) return;

    pendingCaret.current = {
      input,
      position: getCaretAfterGrouping(
        typed,
        text,
        input.selectionStart ?? typed.length,
        group,
      ),
    };
    state.setInputValue(text);
  }

  // Rewriting the text sends the caret to the end, so it is put back.
  useLayoutEffect(() => {
    if (!pendingCaret.current) return;

    const { input, position } = pendingCaret.current;

    pendingCaret.current = null;
    input.setSelectionRange(position, position);
  }, [state?.inputValue]);

  return (
    <AriaGroup
      {...{ isDisabled, isInvalid }}
      ref={groupRef}
      className={({ isFocusWithin, isDisabled, isInvalid }) =>
        cx(
          "relative flex w-full flex-row items-stretch rounded-lg bg-primary shadow-xs outline-1 -outline-offset-1 outline-primary transition-all duration-100 ease-linear",

          isFocusWithin &&
            !isDisabled &&
            "outline-2 -outline-offset-2 outline-brand",

          // Disabled state styles
          isDisabled &&
            "cursor-not-allowed opacity-50 in-data-input-wrapper:opacity-100",
          "group-disabled:cursor-not-allowed group-disabled:opacity-50 in-data-input-wrapper:group-disabled:opacity-100",

          // Invalid state styles
          isInvalid && "outline-destructive_subtle",
          "group-invalid:outline-destructive_subtle",

          // Invalid state with focus-within styles
          isInvalid &&
            isFocusWithin &&
            "outline-2 -outline-offset-2 outline-destructive",
          isFocusWithin &&
            "group-invalid:outline-2 group-invalid:-outline-offset-2 group-invalid:outline-destructive",

          context?.wrapperClassName,
          wrapperClassName,
        )
      }
    >
      {orientation === "horizontal" && (
        <Button
          size={size}
          iconLeading={IconMinus}
          slot="decrement"
          color="tertiary"
          className="static h-full rounded-r-none"
        />
      )}

      {/* Input field */}
      <AriaInput
        {...(inputProps as AriaInputProps)}
        ref={ref}
        placeholder={placeholder}
        onChange={handleChange}
        className={cx(
          "m-0 w-full bg-transparent text-primary ring-0 outline-hidden placeholder:text-placeholder autofill:rounded-lg autofill:text-primary disabled:cursor-not-allowed",
          orientation === "horizontal" && "text-center",
          styles[inputSize],
          context?.inputClassName,
          inputClassName,
        )}
      />

      {orientation === "horizontal" && (
        <Button
          size={size}
          iconLeading={IconPlus}
          slot="increment"
          color="tertiary"
          className="static h-full rounded-l-none"
        />
      )}

      {orientation === "vertical" && (
        <div
          className={cx(
            "flex w-7 shrink-0 flex-col border-l border-primary",
            size === "lg" && "w-7.5",
          )}
        >
          <AriaButton
            slot="increment"
            className="flex flex-1 cursor-pointer items-center justify-center text-fg-quaternary outline-brand transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconChevronUp
              className={cx(
                "size-3 stroke-3",
                size === "lg" && "size-3.5 stroke-[2.57px]",
              )}
            />
          </AriaButton>
          <AriaButton
            slot="decrement"
            className="flex flex-1 cursor-pointer items-center justify-center border-t border-primary text-fg-quaternary outline-brand transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconChevronDown
              className={cx(
                "size-3 stroke-3",
                size === "lg" && "size-3.5 stroke-[2.57px]",
              )}
            />
          </AriaButton>
        </div>
      )}
    </AriaGroup>
  );
}
