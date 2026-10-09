import { useClipboard } from "@hooks/useClipboard";
import { Button } from "./Button";
import { IconCheck, IconCopy } from "@tabler/icons-react";

export function CopyButton({ text }: { text: string }) {
  const { copied, copy } = useClipboard();

  return (
    <Button
      color="tertiary"
      iconLeading={copied ? IconCheck : IconCopy}
      onClick={() => copy(text)}
    />
  );
}
