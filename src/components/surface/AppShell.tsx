import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";
import { useBreakpoint } from "@hooks/useBreakpoint";
import { cx } from "@styles/utils";
import { Button } from "../button/Button";
import {
  Sidebar,
  type SidebarProps,
  useSidebarOpen,
} from "../navigation/sidebar/Sidebar";

const SIDEBAR_WIDTH = 276;

/** How long the peeking sidebar stays after the pointer leaves it. */
const PEEK_CLOSE_DELAY = 200;

export interface AppShellLabels {
  collapse: string;
  expand: string;
  sidebar: string;
}

const DEFAULT_LABELS: AppShellLabels = {
  collapse: "Collapse sidebar",
  expand: "Expand sidebar",
  sidebar: "Main navigation",
};

export interface AppShellProps extends Pick<
  SidebarProps,
  "activeUrl" | "items"
> {
  /** The page content. */
  children: ReactNode;
  /** Content of the top bar, shown after the sidebar toggle. */
  header?: ReactNode;
  /** Content shown above the navigation in the sidebar. */
  sidebarHeader?: ReactNode;
  /** Content pinned to the bottom of the sidebar. */
  sidebarFooter?: ReactNode;
  /**
   * Whether the sidebar starts collapsed, until the user opens or closes it.
   * After that their choice is remembered. Defaults to collapsed on phone
   * widths and expanded everywhere else.
   */
  defaultCollapsed?: boolean;
  /** Called when the sidebar is collapsed or expanded. */
  onCollapsedChange?: (isCollapsed: boolean) => void;
  /** Overrides the accessible names used in the shell. */
  labels?: Partial<AppShellLabels>;
  className?: string;
}

/**
 * The page frame: a top bar, a collapsible sidebar and the content area.
 *
 * Clicking the toggle collapses or expands the sidebar. While it is
 * collapsed, hovering the toggle slides it out over the content, without
 * a backdrop, until the pointer leaves.
 */
export function AppShell({
  children,
  header,
  sidebarHeader,
  sidebarFooter,
  activeUrl,
  items,
  defaultCollapsed,
  onCollapsedChange,
  labels,
  className,
}: AppShellProps) {
  const sidebarId = useId();
  // Below this width there is no room to push the content aside.
  const hasRoomForSidebar = useBreakpoint("sm");
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };

  // The user's last choice is remembered, and wins over the default.
  const [isOpen, setIsOpen] = useSidebarOpen(
    !(defaultCollapsed ?? !hasRoomForSidebar),
  );
  const isCollapsed = !isOpen;
  // "Peeking" is the collapsed sidebar shown temporarily over the content.
  const [isPeeking, setIsPeeking] = useState(false);

  const closeTimer = useRef<number | undefined>(undefined);
  // Set after a click collapses the sidebar, so it does not peek right away
  // while the pointer is still resting on the toggle.
  const isPeekBlocked = useRef(false);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  /** Keeps the peeking sidebar open, cancelling any pending close. */
  function keepPeek() {
    window.clearTimeout(closeTimer.current);
  }

  /** Closes the peeking sidebar shortly, unless the pointer comes back. */
  function closePeekSoon() {
    keepPeek();
    closeTimer.current = window.setTimeout(
      () => setIsPeeking(false),
      PEEK_CLOSE_DELAY,
    );
  }

  /** Collapses or expands the sidebar when the toggle is clicked. */
  function toggleCollapsed() {
    const nextIsCollapsed = !isCollapsed;

    keepPeek();
    isPeekBlocked.current = nextIsCollapsed;
    setIsPeeking(false);
    setIsOpen(!nextIsCollapsed);
    onCollapsedChange?.(nextIsCollapsed);
  }

  const isHidden = isCollapsed && !isPeeking;

  return (
    <div
      style={{ "--sidebar-width": `${SIDEBAR_WIDTH}px` } as CSSProperties}
      className={cx(
        "flex h-dvh w-full flex-col overflow-hidden bg-primary",
        className,
      )}
    >
      <header className="relative z-40 flex h-14 shrink-0 items-center gap-3 border-b border-secondary bg-primary px-3">
        <Button
          color="tertiary"
          size="sm"
          aria-label={
            isCollapsed ? resolvedLabels.expand : resolvedLabels.collapse
          }
          aria-expanded={!isCollapsed}
          aria-controls={sidebarId}
          iconLeading={
            isCollapsed
              ? IconLayoutSidebarLeftExpand
              : IconLayoutSidebarLeftCollapse
          }
          onPress={toggleCollapsed}
          onHoverStart={() => {
            if (!isCollapsed || isPeekBlocked.current) return;

            keepPeek();
            setIsPeeking(true);
          }}
          onHoverEnd={() => {
            isPeekBlocked.current = false;
            closePeekSoon();
          }}
        />
        <div className="flex min-w-0 flex-1 items-center gap-3">{header}</div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* Reserves the sidebar's space while it is expanded, pushing the content. */}
        <div
          className={cx(
            "shrink-0 transition-[width] duration-200 ease-out motion-reduce:transition-none",
            isCollapsed ? "w-0" : "w-0 sm:w-(--sidebar-width)",
          )}
        />

        <Sidebar
          id={sidebarId}
          aria-label={resolvedLabels.sidebar}
          activeUrl={activeUrl}
          items={items}
          header={sidebarHeader}
          footer={sidebarFooter}
          // Keeps the hidden sidebar out of the tab order and screen readers.
          inert={isHidden}
          data-state={
            isHidden ? "collapsed" : isPeeking ? "peeking" : "expanded"
          }
          onPointerEnter={keepPeek}
          onPointerLeave={() => {
            if (isPeeking) closePeekSoon();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsPeeking(false);
          }}
          className={cx(
            "absolute inset-y-0 left-0 z-30 transition duration-200 ease-out motion-reduce:transition-none",
            isHidden && "-translate-x-full",
            // Floats over the content while peeking, and on phone widths.
            isPeeking ? "shadow-xl" : !isCollapsed && "max-sm:shadow-xl",
          )}
        />

        <main
          // A fallback for when the pointer leaves the sidebar by way of a
          // menu, which closes without a leave event reaching the sidebar.
          onPointerEnter={() => {
            if (isPeeking) closePeekSoon();
          }}
          className="min-w-0 flex-1 overflow-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
