import type { Grid } from "@1771technologies/lytenyte-core";

/** The serializable part of a column's layout. */
export interface DataGridColumnSetting {
  id: string;
  hide?: boolean;
  groupPath?: string[];
  /** The side the column is pinned to, or null when it is not pinned. */
  pin?: "start" | "end" | null;
}

function isColumnSetting(value: unknown): value is DataGridColumnSetting {
  if (typeof value !== "object" || value === null) return false;

  const { id, hide, groupPath, pin } = value as Record<string, unknown>;

  return (
    typeof id === "string" &&
    (hide === undefined || typeof hide === "boolean") &&
    (pin === undefined || pin === null || pin === "start" || pin === "end") &&
    (groupPath === undefined ||
      (Array.isArray(groupPath) &&
        groupPath.every((part) => typeof part === "string")))
  );
}

/** Extracts the order, visibility, pinning and group structure of the columns. */
export function getDataGridColumnSettings(
  columns: readonly Grid.Column[],
): DataGridColumnSetting[] {
  return columns.map(({ id, hide, groupPath, pin }) => ({
    id,
    pin: pin ?? null,
    ...(hide ? { hide: true } : {}),
    ...(groupPath?.length ? { groupPath: [...groupPath] } : {}),
  }));
}

/**
 * Saves the column order, visibility, pinning and group structure to
 * localStorage.
 * Returns false when storage is unavailable or full.
 */
export function saveDataGridColumnSettings(
  storageKey: string,
  columns: readonly Grid.Column[],
): boolean {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify(getDataGridColumnSettings(columns)),
    );
    return true;
  } catch {
    return false;
  }
}

/** Reads saved column settings. Returns null when nothing valid is stored. */
export function loadDataGridColumnSettings(
  storageKey: string,
): DataGridColumnSetting[] | null {
  try {
    const raw = localStorage.getItem(storageKey);

    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) && parsed.every(isColumnSetting)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

/** Removes saved column settings. */
export function clearDataGridColumnSettings(storageKey: string) {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Storage is unavailable, so there is nothing to clear.
  }
}

/**
 * Applies saved settings to a set of column definitions.
 * Saved columns that no longer exist are ignored, and columns that were not
 * saved keep their definition and are appended in their original order.
 */
export function applyDataGridColumnSettings<Column extends Grid.Column>(
  columns: readonly Column[],
  settings: readonly DataGridColumnSetting[] | null | undefined,
): Column[] {
  if (!settings?.length) return [...columns];

  const columnsById = new Map(columns.map((column) => [column.id, column]));
  const result: Column[] = [];

  for (const setting of settings) {
    const column = columnsById.get(setting.id);

    if (!column) continue;

    columnsById.delete(setting.id);
    result.push({
      ...column,
      hide: setting.hide ?? false,
      groupPath: setting.groupPath,
      // Settings saved before pinning was stored keep the column's own pin.
      pin: setting.pin === undefined ? column.pin : setting.pin,
    });
  }

  return [...result, ...columnsById.values()];
}
