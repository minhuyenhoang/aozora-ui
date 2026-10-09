import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useBreakpoint } from "@hooks/useBreakpoint";
import { cx } from "@styles/utils";
import {
  Pagination,
  type PaginationRootProps,
} from "../../base/PaginationBase";
import { ButtonGroup } from "../../button/group/ButtonGroup";
import { ButtonGroupItem } from "../../button/group/ButtonGroupItem";

interface PaginationButtonGroupProps extends Partial<
  Omit<PaginationRootProps, "children">
> {
  /** The alignment of the pagination. */
  align?: "left" | "center" | "right";
}

export const PaginationButtonGroup = ({
  align = "left",
  page = 1,
  total = 10,
  ...props
}: PaginationButtonGroupProps) => {
  const isDesktop = useBreakpoint("md");

  return (
    <div
      className={cx(
        "flex border-t border-secondary px-4 py-3 md:px-6 md:pt-3 md:pb-4",
        align === "left" && "justify-start",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
      )}
    >
      <Pagination.Root {...props} page={page} total={total}>
        <Pagination.Context>
          {({ pages }) => (
            <ButtonGroup size="sm">
              <Pagination.PrevTrigger asChild>
                <ButtonGroupItem iconLeading={IconArrowLeft}>
                  {isDesktop ? "Previous" : undefined}
                </ButtonGroupItem>
              </Pagination.PrevTrigger>

              {pages.map((page, index) =>
                page.type === "page" ? (
                  <Pagination.Item key={index} {...page} asChild>
                    <ButtonGroupItem
                      isSelected={page.isCurrent}
                      className="size-9 items-center justify-center"
                    >
                      {page.value}
                    </ButtonGroupItem>
                  </Pagination.Item>
                ) : (
                  <Pagination.Ellipsis key={index}>
                    <ButtonGroupItem className="pointer-events-none size-9 items-center justify-center rounded-none!">
                      &#8230;
                    </ButtonGroupItem>
                  </Pagination.Ellipsis>
                ),
              )}

              <Pagination.NextTrigger asChild>
                <ButtonGroupItem iconTrailing={IconArrowRight}>
                  {isDesktop ? "Next" : undefined}
                </ButtonGroupItem>
              </Pagination.NextTrigger>
            </ButtonGroup>
          )}
        </Pagination.Context>
      </Pagination.Root>
    </div>
  );
};
