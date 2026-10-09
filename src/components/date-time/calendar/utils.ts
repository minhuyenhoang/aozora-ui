import type { SelectItemType } from "../../selection/types";

interface CalendarPickerItem {
  id: number;
  formatted: string;
}

export function toSelectItems(
  items: readonly CalendarPickerItem[],
): SelectItemType[] {
  return items.map((item) => ({ id: item.id, label: item.formatted }));
}
