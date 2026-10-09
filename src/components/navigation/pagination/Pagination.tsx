import { useMemo, useState } from "react";
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
}

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
  ...props
}: PaginationProps) => {
  const isDesktop = useBreakpoint("md");

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
            {isDesktop ? "Previous" : undefined}
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
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{total}</span>
            </div>
          </>
        )}
      </Pagination.Context>

      <div className="flex flex-1 justify-end">
        <Pagination.NextTrigger asChild>
          <Button iconTrailing={IconArrowRight} color="secondary" size="sm">
            {isDesktop ? "Next" : undefined}
          </Button>
        </Pagination.NextTrigger>
      </div>
    </Pagination.Root>
  );
};

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
  page: number;
  total: number;
  onPageChange?: (page: number) => void;
}

function PageComboBox({ page, total, onPageChange }: PageComboBoxProps) {
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
      aria-label="Page"
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

interface PaginationAdvancedProps {
  /** The current page. */
  page?: number;
  /** The total number of pages. */
  total?: number;
  /** The number of items per page. */
  pageSize?: number;
  /**
   * The total number of items, shown in the row range.
   * Defaults to `total * pageSize`, which overstates a partial last page.
   */
  totalItems?: number;
  /** The alignment of the pagination. */
  align?: "space-between" | "center";
  /** The class name of the pagination component. */
  className?: string;
  /** The function to call when the page changes. */
  onPageChange?: (page: number) => void;
  /** The function to call when the page size changes. */
  onPageSizeChange?: (pageSize: number) => void;
}

export const PaginationAdvanced = ({
  page = 1,
  total = 10,
  pageSize = 10,
  totalItems = total * pageSize,
  align = "space-between",
  onPageChange,
  className,
  onPageSizeChange,
}: PaginationAdvancedProps) => {
  const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={cx(
        "border-t border-secondary px-4 py-3 md:px-6 md:pt-3 md:pb-4",
        className,
      )}
    >
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
            align === "center" && "order-first",
          )}
        >
          <span className="text-sm font-medium whitespace-nowrap text-secondary">
            Rows per page
          </span>
          <Select
            aria-label="Page Size"
            value={pageSize}
            onChange={(value) => onPageSizeChange?.(value as number)}
            size="sm"
            items={[
              { label: "10", id: 10 },
              { label: "25", id: 25 },
              { label: "50", id: 50 },
              { label: "100", id: 100 },
            ]}
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

        <div className="hidden text-sm font-medium whitespace-nowrap text-fg-secondary md:block">
          {firstItem} - {lastItem} of {totalItems}
        </div>

        <div
          className={cx(
            "flex flex-1 items-center justify-between gap-4 md:ml-auto md:justify-end",
            align === "center" && "md:justify-center",
          )}
        >
          <div className="flex gap-2">
            <Button
              aria-label="First Page"
              iconLeading={IconChevronsLeft}
              color="secondary"
              size="sm"
              isDisabled={page === 1}
              onClick={() => onPageChange?.(1)}
            />
            <Pagination.PrevTrigger asChild>
              <Button
                iconLeading={IconChevronLeft}
                color="secondary"
                size="sm"
              />
            </Pagination.PrevTrigger>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium whitespace-nowrap text-fg-secondary">
            <PageComboBox
              page={page}
              total={total}
              onPageChange={onPageChange}
            />
            <span aria-hidden="true">/</span>
            <span>
              <span className="sr-only">of </span>
              {total}
            </span>
          </div>

          <div className="flex gap-2">
            <Pagination.NextTrigger asChild>
              <Button
                iconTrailing={IconChevronRight}
                color="secondary"
                size="sm"
              />
            </Pagination.NextTrigger>
            <Button
              aria-label="Last Page"
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
