import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useBreakpoint } from "@hooks/useBreakpoint";
import { cx } from "@styles/utils";
import { Pagination } from "../../base/PaginationBase";
import { Button } from "../../button/Button";
import { PaginationItem, type PaginationProps } from "./Pagination";

export const PaginationSearchDefault = ({
  rounded,
  page = 1,
  total = 10,
  className,
  ...props
}: PaginationProps) => {
  const isDesktop = useBreakpoint("md");

  return (
    <Pagination.Root
      {...props}
      page={page}
      total={total}
      className={cx(
        "flex w-full items-center justify-between gap-3 border-t border-secondary pt-4 md:pt-5",
        className,
      )}
    >
      <div className="hidden flex-1 justify-start md:flex">
        <Pagination.PrevTrigger asChild>
          <Button iconLeading={IconArrowLeft} color="link-gray" size="sm">
            {isDesktop ? "Previous" : undefined}
          </Button>
        </Pagination.PrevTrigger>
      </div>

      <Pagination.PrevTrigger asChild className="md:hidden">
        <Button iconLeading={IconArrowLeft} color="secondary" size="sm">
          {isDesktop ? "Previous" : undefined}
        </Button>
      </Pagination.PrevTrigger>

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

      <div className="hidden flex-1 justify-end md:flex">
        <Pagination.NextTrigger asChild>
          <Button iconTrailing={IconArrowRight} color="link-gray" size="sm">
            {isDesktop ? "Next" : undefined}
          </Button>
        </Pagination.NextTrigger>
      </div>
      <Pagination.NextTrigger asChild className="md:hidden">
        <Button iconTrailing={IconArrowRight} color="secondary" size="sm">
          {isDesktop ? "Next" : undefined}
        </Button>
      </Pagination.NextTrigger>
    </Pagination.Root>
  );
};

export const PaginationSearchMinimalCenter = ({
  rounded,
  page = 1,
  total = 10,
  className,
  ...props
}: PaginationProps) => {
  const isDesktop = useBreakpoint("md");

  return (
    <Pagination.Root
      {...props}
      page={page}
      total={total}
      className={cx(
        "flex w-full items-center justify-between gap-3 border-t border-secondary pt-4 md:pt-5",
        className,
      )}
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
