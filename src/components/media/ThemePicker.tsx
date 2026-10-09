import {
  IconDeviceDesktop,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { type Theme, useTheme } from "../../hooks/useTheme";
import { Button, type ButtonProps } from "../button/Button";
import { Menu } from "../collection/Menu";

export interface ThemePickerLabels {
  /** The accessible name of the button and of its menu. */
  picker: string;
  light: string;
  dark: string;
  system: string;
}

const DEFAULT_LABELS: ThemePickerLabels = {
  picker: "Theme",
  light: "Light",
  dark: "Dark",
  system: "System",
};

const options = [
  { theme: "light", icon: IconSun },
  { theme: "dark", icon: IconMoon },
  { theme: "system", icon: IconDeviceDesktop },
] as const;

export interface ThemePickerProps {
  /**
   * The size of the button.
   * @default "sm"
   */
  size?: ButtonProps["size"];
  /**
   * The color of the button.
   * @default "secondary"
   */
  color?: ButtonProps["color"];
  /** The theme used until the user chooses one. */
  defaultTheme?: Theme;
  /** Only shows the icon on the button. Its name is still announced. */
  iconOnly?: boolean;
  /** Called when the user chooses a theme. */
  onThemeChange?: (theme: Theme) => void;
  /** Overrides the text, for example to translate it. */
  labels?: Partial<ThemePickerLabels>;
  className?: string;
}

/**
 * A button that opens a menu to choose the light theme, the dark theme, or
 * the device's. The button shows the icon of the theme that is chosen.
 */
export function ThemePicker({
  size = "sm",
  color = "secondary",
  defaultTheme,
  iconOnly = false,
  onThemeChange,
  labels,
  className,
}: ThemePickerProps) {
  const { theme, setTheme } = useTheme(defaultTheme);
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const current = options.find((option) => option.theme === theme)!;

  return (
    <Menu.Root>
      <Button
        size={size}
        color={color}
        iconLeading={current.icon}
        className={className}
        // The chosen theme is part of the name, as the icon alone is silent.
        aria-label={`${resolvedLabels.picker}: ${resolvedLabels[theme]}`}
      >
        {iconOnly ? undefined : resolvedLabels[theme]}
      </Button>
      <Menu.Popover className="w-40">
        <Menu.Menu
          aria-label={resolvedLabels.picker}
          selectionMode="single"
          // One theme is always chosen.
          disallowEmptySelection
          selectedKeys={[theme]}
          onSelectionChange={(keys) => {
            if (keys === "all") return;

            const next = [...keys][0] as Theme | undefined;

            if (!next) return;

            setTheme(next);
            onThemeChange?.(next);
          }}
        >
          {options.map((option) => (
            <Menu.Item
              key={option.theme}
              id={option.theme}
              label={resolvedLabels[option.theme]}
              icon={option.icon}
            />
          ))}
        </Menu.Menu>
      </Menu.Popover>
    </Menu.Root>
  );
}
