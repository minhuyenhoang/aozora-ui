import { type ReactNode, useMemo, useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconChevronLeft,
  IconChevronsLeft,
  IconChevronRight,
  IconChevronsRight,
} from "@tabler/icons-react";
import type { Key } from "react-aria-components";
import { Button } from "../../button/Button";
import { Separator } from "../../surface/Separator";
import { ComboBox } from "../../selection/ComboBox";
import { Select } from "../../selection/select/Select";
import { useBreakpoint } from "@hooks/useBreakpoint";
import { cx } from "@styles/utils";
import {
  Pagination,
  type PaginationRootProps,
} from "../../base/PaginationBase";
import { SelectItem } from "../../selection/select/SelectItem";
import type { SelectItemType } from "../../selection/types";

export interface PaginationProps extends Partial<
  Omit<PaginationRootProps, "children">
> {
  /** Whether the pagination buttons are rounded. */
  rounded?: boolean;
  /** The text of the pagination, such as for translation. */
  labels?: Partial<PaginationDefaultLabels>;
}

export interface PaginationDefaultLabels {
  /** The text of the previous button, shown from the medium breakpoint up. */
  previous: string;
  /** The text of the next button, shown from the medium breakpoint up. */
  next: string;
  /** The current page out of the total, shown below the medium breakpoint. */
  pageOf: (page: number, total: number) => ReactNode;
}

const DEFAULT_PAGINATION_LABELS: PaginationDefaultLabels = {
  previous: "Previous",
  next: "Next",
  pageOf: (page, total) => (
    <>
      Page <span className="font-medium">{page}</span> of{" "}
      <span className="font-medium">{total}</span>
    </>
  ),
};

export const PaginationItem = ({
  value,
  rounded,
  isCurrent,
}: {
  value: number;
  rounded?: boolean;
  isCurrent: boolean;
}) => {
  return (
    <Pagination.Item
      value={value}
      isCurrent={isCurrent}
      className={({ isSelected }) =>
        cx(
          "flex size-9 cursor-pointer items-center justify-center p-3 text-sm font-medium text-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover hover:text-secondary focus-visible:z-10 focus-visible:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2",
          rounded ? "rounded-full" : "rounded-lg",
          isSelected && "bg-primary_hover text-secondary",
        )
      }
    >
      {value}
    </Pagination.Item>
  );
};

// interface MobilePaginationProps {
//   /** The current page. */
//   page?: number;
//   /** The total number of pages. */
//   total?: number;
//   /** The class name of the pagination component. */
//   className?: string;
//   /** The function to call when the page changes. */
//   onPageChange?: (page: number) => void;
// }

// const MobilePagination = ({
//   page = 1,
//   total = 10,
//   className,
//   onPageChange,
// }: MobilePaginationProps) => {
//   return (
//     <nav
//       aria-label="Pagination"
//       className={cx("flex items-center justify-between md:hidden", className)}
//     >
//       <Button
//         aria-label="Go to previous page"
//         iconLeading={IconArrowLeft}
//         color="secondary"
//         size="sm"
//         onClick={() => onPageChange?.(Math.max(0, page - 1))}
//       />

//       <span className="text-sm text-fg-secondary">
//         Page <span className="font-medium">{page}</span> of{" "}
//         <span className="font-medium">{total}</span>
//       </span>

//       <Button
//         aria-label="Go to next page"
//         iconLeading={IconArrowRight}
//         color="secondary"
//         size="sm"
//         onClick={() => onPageChange?.(Math.min(total, page + 1))}
//       />
//     </nav>
//   );
// };
export const PaginationDefault = ({
  rounded,
  page = 1,
  total = 10,
  labels: labelsProp,
  ...props
}: PaginationProps) => {
  const isDesktop = useBreakpoint("md");
  const labels = { ...DEFAULT_PAGINATION_LABELS, ...labelsProp };

  return (
    <Pagination.Root
      {...props}
      page={page}
      total={total}
      className="flex w-full items-center justify-between gap-3 border-t border-secondary px-4 py-3 md:px-6 md:pt-3 md:pb-4"
    >
      <div className="flex flex-1 justify-start">
        <Pagination.PrevTrigger asChild>
          <Button iconLeading={IconArrowLeft} color="secondary" size="sm">
            {isDesktop ? labels.previous : undefined}
          </Button>
        </Pagination.PrevTrigger>
      </div>

      <Pagination.Context>
        {({ pages, currentPage, total }) => (
          <>
            <div className="hidden justify-center gap-0.5 md:flex">
              {pages.map((page, index) =>
                page.type === "page" ? (
                  <PaginationItem key={index} rounded={rounded} {...page} />
                ) : (
                  <Pagination.Ellipsis
                    key={index}
                    className="flex size-9 shrink-0 items-center justify-center text-tertiary"
                  >
                    &#8230;
                  </Pagination.Ellipsis>
                ),
              )}
            </div>

            <div className="flex justify-center text-sm whitespace-pre text-fg-secondary md:hidden">
              {labels.pageOf(currentPage, total)}
            </div>
          </>
        )}
      </Pagination.Context>

      <div className="flex flex-1 justify-end">
        <Pagination.NextTrigger asChild>
          <Button iconTrailing={IconArrowRight} color="secondary" size="sm">
            {isDesktop ? labels.next : undefined}
          </Button>
        </Pagination.NextTrigger>
      </div>
    </Pagination.Root>
  );
};

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

/** The most page options rendered in the list at once. */
const MAX_PAGE_OPTIONS = 100;

const toOption = (page: number): SelectItemType => ({
  id: page,
  label: page.toString(),
});

/**
 * Returns the page options to list. While the input still shows the current
 * page, this is a window of pages around it. Once the user types, it is the
 * pages containing what they typed.
 */
function getPageOptions(page: number, total: number, query: string) {
  const options: SelectItemType[] = [];

  if (query === "" || query === page.toString()) {
    const start = Math.max(
      1,
      Math.min(page - MAX_PAGE_OPTIONS / 2, total - MAX_PAGE_OPTIONS + 1),
    );
    const end = Math.min(total, start + MAX_PAGE_OPTIONS - 1);

    for (let value = start; value <= end; value++) {
      options.push(toOption(value));
    }

    return options;
  }

  for (
    let value = 1;
    value <= total && options.length < MAX_PAGE_OPTIONS;
    value++
  ) {
    if (value.toString().includes(query)) options.push(toOption(value));
  }

  return options;
}

// The options are already filtered by `getPageOptions`.
const showAllOptions = () => true;

interface PageComboBoxProps {
  label: string;
  page: number;
  total: number;
  onPageChange?: (page: number) => void;
}

function PageComboBox({
  label,
  page,
  total,
  onPageChange,
}: PageComboBoxProps) {
  const [inputValue, setInputValue] = useState(page.toString());
  const [syncedPage, setSyncedPage] = useState(page);

  // Show the new page when it changes from outside, such as via the buttons.
  if (syncedPage !== page) {
    setSyncedPage(page);
    setInputValue(page.toString());
  }

  const options = useMemo(
    () => getPageOptions(page, total, inputValue),
    [page, total, inputValue],
  );

  function handleSelectionChange(key: Key | null) {
    // A null key means the typed text was committed without picking an option.
    const nextPage = key === null ? Number(inputValue) : Number(key);
    const isValid =
      Number.isInteger(nextPage) && nextPage >= 1 && nextPage <= total;

    if (isValid && nextPage !== page) {
      setInputValue(nextPage.toString());
      onPageChange?.(nextPage);
    } else {
      setInputValue(page.toString());
    }
  }

  return (
    <ComboBox
      aria-label={label}
      size="sm"
      placeholder=""
      shortcut={false}
      // An empty element replaces the default search icon.
      icon={<></>}
      className="w-18"
      popoverClassName="min-w-24"
      allowsCustomValue
      defaultFilter={showAllOptions}
      items={options}
      selectedKey={page}
      onSelectionChange={handleSelectionChange}
      inputValue={inputValue}
      onInputChange={(value) => setInputValue(value.replace(/\D/g, ""))}
    >
      {(item) => <SelectItem id={item.id} label={item.label} />}
    </ComboBox>
  );
}

export interface PaginationAdvancedLabels {
  /** The text before the page size select. */
  rowsPerPage: string;
  /** The accessible name of the page size select. */
  pageSize: string;
  /** The accessible name of the page input. */
  page: string;
  /** The accessible text before the total number of pages. */
  of: string;
  /** The accessible names of the page buttons. */
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
  /** The range of rows shown, out of the total number of rows. */
  range: (firstItem: number, lastItem: number, totalItems: number) => ReactNode;
}

const DEFAULT_PAGINATION_ADVANCED_LABELS: PaginationAdvancedLabels = {
  rowsPerPage: "Rows per page",
  pageSize: "Page Size",
  page: "Page",
  of: "of",
  firstPage: "First Page",
  previousPage: "Previous Page",
  nextPage: "Next Page",
  lastPage: "Last Page",
  range: (firstItem, lastItem, totalItems) =>
    `${firstItem} - ${lastItem} of ${totalItems}`,
};

export interface PaginationAdvancedProps {
  /** The current page. */
  page?: number;
  /** The total number of pages. */
  total?: number;
  /** The number of items per page. */
  pageSize?: number;
  /**
   * The page sizes the user can choose from.
   * @default [10, 25, 50, 100]
   */
  pageSizes?: number[];
  /**
   * The total number of items, shown in the row range.
   * Defaults to `total * pageSize`, which overstates a partial last page.
   */
  totalItems?: number;
  /**
   * The alignment of the pagination. With `center`, the page size is on the
   * left, the page controls in the middle and the row range on the right.
   */
  align?: "space-between" | "center";
  /** The class name of the pagination component. */
  className?: string;
  /** The function to call when the page changes. */
  onPageChange?: (page: number) => void;
  /** The function to call when the page size changes. */
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * The text of the pagination, such as for translation. Any label left out
   * uses its English default.
   */
  labels?: Partial<PaginationAdvancedLabels>;
}

export const PaginationAdvanced = ({
  page = 1,
  total = 10,
  pageSize = 10,
  pageSizes = DEFAULT_PAGE_SIZES,
  totalItems = total * pageSize,
  align = "space-between",
  onPageChange,
  className,
  onPageSizeChange,
  labels: labelsProp,
}: PaginationAdvancedProps) => {
  const labels = { ...DEFAULT_PAGINATION_ADVANCED_LABELS, ...labelsProp };
  const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);

  return (
    <div className={cx("pb-3 md:pb-4", className)}>
      <Pagination.Root
        page={page}
        total={total}
        onPageChange={onPageChange}
        className={cx(
          "flex items-center gap-3",
          align === "center" && "justify-between",
        )}
      >
        <div
          className={cx(
            "hidden items-center gap-2 md:flex",
            // The side columns share the free space, which centres the middle.
            align === "center" && "md:flex-1",
          )}
        >
          <span className="text-sm font-medium whitespace-nowrap text-secondary">
            {labels.rowsPerPage}
          </span>
          <Select
            aria-label={labels.pageSize}
            value={pageSize}
            onChange={(value) => onPageSizeChange?.(value as number)}
            size="sm"
            items={pageSizes.map(toOption)}
          >
            {(item) => (
              <SelectItem selectionIndicator="none" id={item.id}>
                {item.label}
              </SelectItem>
            )}
          </Select>
        </div>

        <Separator
          orientation="vertical"
          className={cx(
            "mx-1 h-4 self-auto bg-border-primary max-md:hidden",
            align === "center" && "hidden",
          )}
        />

        <div
          className={cx(
            "hidden text-sm font-medium whitespace-nowrap text-fg-secondary md:block",
            align === "center" && "order-last text-right md:flex-1",
          )}
        >
          {labels.range(firstItem, lastItem, totalItems)}
        </div>

        <div
          className={cx(
            "flex flex-1 items-center justify-between gap-4 md:ml-auto md:justify-end",
            align === "center" && "md:ml-0 md:flex-none md:justify-center",
          )}
        >
          <div className="flex gap-2">
            <Button
              aria-label={labels.firstPage}
              iconLeading={IconChevronsLeft}
              color="secondary"
              size="sm"
              isDisabled={page === 1}
              onClick={() => onPageChange?.(1)}
            />
            <Pagination.PrevTrigger asChild aria-label={labels.previousPage}>
              <Button
                iconLeading={IconChevronLeft}
                color="secondary"
                size="sm"
              />
            </Pagination.PrevTrigger>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium whitespace-nowrap text-fg-secondary">
            <PageComboBox
              label={labels.page}
              page={page}
              total={total}
              onPageChange={onPageChange}
            />
            <span aria-hidden="true">/</span>
            <span>
              <span className="sr-only">{labels.of} </span>
              {total}
            </span>
          </div>

          <div className="flex gap-2">
            <Pagination.NextTrigger asChild aria-label={labels.nextPage}>
              <Button
                iconTrailing={IconChevronRight}
                color="secondary"
                size="sm"
              />
            </Pagination.NextTrigger>
            <Button
              aria-label={labels.lastPage}
              iconTrailing={IconChevronsRight}
              color="secondary"
              size="sm"
              isDisabled={page === total}
              onClick={() => onPageChange?.(total)}
            />
          </div>
        </div>
      </Pagination.Root>
    </div>
  );
};
