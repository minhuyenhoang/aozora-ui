import { Loader } from "../../status/Loader";

export function DataGridLoadingOverlay() {
  return (
    <div className="z-12 sticky left-0 top-0 flex h-0 w-0">
      <div className="w-(--ln-vp-width) h-(--ln-vp-height) bg-body/20 absolute left-0 top-0 flex flex-col items-center justify-center">
        <Loader className="size-8 text-fg-brand-primary" />
      </div>
    </div>
  );
}
