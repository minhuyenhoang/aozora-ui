import { type ReactNode, useEffect, useId, useRef } from "react";
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBlockquote,
  IconBold,
  IconH2,
  IconH3,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconPhoto,
  IconStrikethrough,
  IconUnderline,
} from "@tabler/icons-react";
import { Extension } from "@tiptap/core";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import {
  type Editor,
  EditorContent,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { cx } from "@styles/utils";
import { DescriptionText } from "../base/DescriptionText";
import { Label } from "../base/Label";
import { ToolbarGroup } from "../control/group/ToolbarGroup";
import { Toolbar } from "../control/toolbar/Toolbar";
import { ToolbarItem } from "../control/toolbar/ToolbarItem";
import { Separator } from "../surface/Separator";

export interface TextEditorLabels {
  toolbar: string;
  /** Names of the button groups, read by screen readers. */
  historyGroup: string;
  styleGroup: string;
  blockGroup: string;
  alignGroup: string;
  insertGroup: string;
  bold: string;
  italic: string;
  underline: string;
  strike: string;
  heading2: string;
  heading3: string;
  bulletList: string;
  orderedList: string;
  blockquote: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  link: string;
  /** The question asked when adding a link. */
  linkPrompt: string;
  image: string;
  undo: string;
  redo: string;
  /** The text shown under the editor when `maxCharacters` is set. */
  charactersLeft: (count: number) => string;
}

const DEFAULT_LABELS: TextEditorLabels = {
  toolbar: "Formatting",
  historyGroup: "History",
  styleGroup: "Text style",
  blockGroup: "Blocks",
  alignGroup: "Alignment",
  insertGroup: "Insert",
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strike: "Strikethrough",
  heading2: "Heading 2",
  heading3: "Heading 3",
  bulletList: "Bullet list",
  orderedList: "Numbered list",
  blockquote: "Quote",
  alignLeft: "Align left",
  alignCenter: "Align center",
  alignRight: "Align right",
  link: "Link",
  linkPrompt: "Link URL",
  image: "Image",
  undo: "Undo",
  redo: "Redo",
  charactersLeft: (count) =>
    `${count} ${count === 1 ? "character" : "characters"} left`,
};

export interface TextEditorProps {
  /** The content as HTML. Makes the editor controlled. */
  value?: string;
  /** The initial content as HTML, for an uncontrolled editor. */
  defaultValue?: string;
  /** Called with the content as HTML whenever it changes. */
  onChange?: (html: string) => void;
  /** Label text for the editor. */
  label?: string;
  /** Helper text displayed below the editor. */
  description?: ReactNode;
  /** Tooltip message displayed after the label. */
  tooltip?: string;
  /** Placeholder text shown while the editor is empty. */
  placeholder?: string;
  /**
   * The most characters the editor accepts. Formatting is not counted.
   * When set, the number of characters left is shown under the editor.
   */
  maxCharacters?: number;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  /** Accessible name, for when there is no visible label. */
  "aria-label"?: string;
  /**
   * Uploads a picked image and returns its URL. Without it, images are
   * embedded in the HTML as data URLs.
   */
  onImageUpload?: (file: File) => Promise<string>;
  /** Overrides the accessible names of the toolbar buttons. */
  labels?: Partial<TextEditorLabels>;
  className?: string;
  /** Class name for the editable content area. */
  contentClassName?: string;
}

/** Styles for the HTML the editor produces. */
const contentStyles = [
  "min-h-40 px-3.5 py-3 text-md text-primary outline-hidden",
  "[&>*+*]:mt-3",
  "[&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold",
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-secondary [&_blockquote]:pl-3 [&_blockquote]:text-tertiary",
  "[&_a]:text-brand-secondary [&_a]:underline",
  "[&_code]:rounded [&_code]:bg-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm",
  "[&_img]:max-w-full [&_img]:rounded-lg",
  // Placeholder, drawn on the first empty paragraph.
  "[&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-placeholder [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
].join(" ");

/** Counts the text characters in a document. Each block break counts as one. */
function countCharacters(doc: ProseMirrorNode) {
  return doc.textBetween(0, doc.content.size, " ", " ").length;
}

/** Holds the current limit inside the editor state. */
const characterLimitKey = new PluginKey<number | undefined>("characterLimit");

/**
 * Stops edits that would take the text past the limit. Edits that shorten
 * the text are always allowed, so content already over the limit can be cut.
 */
const CharacterLimit = Extension.create({
  name: "characterLimit",
  addProseMirrorPlugins: () => [
    new Plugin<number | undefined>({
      key: characterLimitKey,
      state: {
        init: () => undefined,
        // The limit is changed by a transaction that carries the new value.
        apply: (transaction, limit) => {
          const change = transaction.getMeta(characterLimitKey) as
            { limit: number | undefined } | undefined;

          return change ? change.limit : limit;
        },
      },
      filterTransaction(transaction, state) {
        const limit = characterLimitKey.getState(state);

        // Content set from outside, such as a new `value`, is not limited.
        if (
          limit === undefined ||
          !transaction.docChanged ||
          transaction.getMeta("preventUpdate")
        ) {
          return true;
        }

        const nextCount = countCharacters(transaction.doc);

        return nextCount <= limit || nextCount <= countCharacters(state.doc);
      },
    }),
  ],
});

/** Reads a file as a data URL, to embed an image without uploading it. */
function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface TextEditorToolbarProps {
  editor: Editor;
  labels: TextEditorLabels;
  isDisabled?: boolean;
  onImageUpload: (file: File) => Promise<string>;
}

/** The formatting buttons. Each one reflects and changes the selection. */
function TextEditorToolbar({
  editor,
  labels,
  isDisabled,
  onImageUpload,
}: TextEditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-renders the toolbar only when one of these values changes.
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      heading2: editor.isActive("heading", { level: 2 }),
      heading3: editor.isActive("heading", { level: 3 }),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      blockquote: editor.isActive("blockquote"),
      alignLeft: editor.isActive({ textAlign: "left" }),
      alignCenter: editor.isActive({ textAlign: "center" }),
      alignRight: editor.isActive({ textAlign: "right" }),
      link: editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  /** Starts a command chain that returns focus to the editor. */
  const chain = () => editor.chain().focus();

  /** Removes the link under the cursor, or asks for a URL and adds one. */
  function toggleLink() {
    if (state.link) {
      chain().unsetLink().run();
      return;
    }

    const href = window.prompt(labels.linkPrompt)?.trim();

    if (href) chain().setLink({ href }).run();
  }

  /** Inserts the picked image at the cursor. */
  async function insertImage(file: File | undefined) {
    if (!file) return;

    const src = await onImageUpload(file);

    chain().setImage({ src, alt: file.name }).run();
  }

  /** Builds the props shared by every toggle button. */
  const toggle = (
    name: Exclude<keyof typeof state, "canUndo" | "canRedo">,
    icon: typeof IconBold,
    run: () => void,
  ) => ({
    isToggle: true as const,
    "aria-label": labels[name],
    icon,
    isSelected: state[name],
    // Without this a disabled editor could still be formatted by keyboard.
    isDisabled,
    onChange: run,
  });

  return (
    <Toolbar
      aria-label={labels.toolbar}
      className={cx(
        "w-full border-b border-secondary px-2 py-1.5",
        isDisabled && "pointer-events-none",
      )}
    >
      <ToolbarGroup aria-label={labels.historyGroup}>
        <ToolbarItem
          aria-label={labels.undo}
          icon={IconArrowBackUp}
          isDisabled={isDisabled || !state.canUndo}
          onPress={() => chain().undo().run()}
        />
        <ToolbarItem
          aria-label={labels.redo}
          icon={IconArrowForwardUp}
          isDisabled={isDisabled || !state.canRedo}
          onPress={() => chain().redo().run()}
        />
      </ToolbarGroup>

      <Separator />

      <ToolbarGroup aria-label={labels.styleGroup} isDisabled={isDisabled}>
        <ToolbarItem
          {...toggle("bold", IconBold, () => chain().toggleBold().run())}
        />
        <ToolbarItem
          {...toggle("italic", IconItalic, () => chain().toggleItalic().run())}
        />
        <ToolbarItem
          {...toggle("underline", IconUnderline, () =>
            chain().toggleUnderline().run(),
          )}
        />
        <ToolbarItem
          {...toggle("strike", IconStrikethrough, () =>
            chain().toggleStrike().run(),
          )}
        />
      </ToolbarGroup>

      <Separator />

      <ToolbarGroup aria-label={labels.blockGroup} isDisabled={isDisabled}>
        <ToolbarItem
          {...toggle("heading2", IconH2, () =>
            chain().toggleHeading({ level: 2 }).run(),
          )}
        />
        <ToolbarItem
          {...toggle("heading3", IconH3, () =>
            chain().toggleHeading({ level: 3 }).run(),
          )}
        />
        <ToolbarItem
          {...toggle("bulletList", IconList, () =>
            chain().toggleBulletList().run(),
          )}
        />
        <ToolbarItem
          {...toggle("orderedList", IconListNumbers, () =>
            chain().toggleOrderedList().run(),
          )}
        />
        <ToolbarItem
          {...toggle("blockquote", IconBlockquote, () =>
            chain().toggleBlockquote().run(),
          )}
        />
      </ToolbarGroup>

      <Separator />

      <ToolbarGroup aria-label={labels.alignGroup} isDisabled={isDisabled}>
        <ToolbarItem
          {...toggle("alignLeft", IconAlignLeft, () =>
            chain().toggleTextAlign("left").run(),
          )}
        />
        <ToolbarItem
          {...toggle("alignCenter", IconAlignCenter, () =>
            chain().toggleTextAlign("center").run(),
          )}
        />
        <ToolbarItem
          {...toggle("alignRight", IconAlignRight, () =>
            chain().toggleTextAlign("right").run(),
          )}
        />
      </ToolbarGroup>

      <Separator />

      <ToolbarGroup aria-label={labels.insertGroup} isDisabled={isDisabled}>
        <ToolbarItem {...toggle("link", IconLink, toggleLink)} />
        <ToolbarItem
          aria-label={labels.image}
          icon={IconPhoto}
          isDisabled={isDisabled}
          onPress={() => fileInputRef.current?.click()}
        />
      </ToolbarGroup>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          void insertImage(event.target.files?.[0]);
          // Lets the same file be picked again.
          event.target.value = "";
        }}
      />
    </Toolbar>
  );
}

/** A rich text editor with a formatting toolbar. Its value is HTML. */
export function TextEditor({
  value,
  defaultValue,
  onChange,
  label,
  description,
  tooltip,
  placeholder,
  maxCharacters,
  isDisabled = false,
  isInvalid = false,
  isRequired,
  "aria-label": ariaLabel,
  onImageUpload = readAsDataUrl,
  labels,
  className,
  contentClassName,
}: TextEditorProps) {
  const labelId = useId();
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };

  // The editor is created once, so it reads the latest callback from a ref.
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      Placeholder.configure({ placeholder }),
      CharacterLimit,
    ],
    content: value ?? defaultValue,
    editable: !isDisabled,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        ...(label ? { "aria-labelledby": labelId } : {}),
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        class: cx(contentStyles, contentClassName),
      },
    },
    onUpdate: ({ editor }) => onChangeRef.current?.(editor.getHTML()),
  });

  // Applies a new `value` from outside without reporting it back as a change.
  useEffect(() => {
    if (value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    editor.setEditable(!isDisabled, false);
  }, [editor, isDisabled]);

  // Hands the limit to the editor, now and whenever it changes.
  useEffect(() => {
    editor.commands.command(({ tr }) => {
      tr.setMeta(characterLimitKey, { limit: maxCharacters });
      return true;
    });
  }, [editor, maxCharacters]);

  const characterCount = useEditorState({
    editor,
    selector: ({ editor }) => countCharacters(editor.state.doc),
  });

  return (
    <div
      className={cx(
        "flex h-max w-full flex-col items-start justify-start gap-1.5",
        className,
      )}
    >
      {label && (
        <Label
          id={labelId}
          isRequired={isRequired ?? false}
          isInvalid={isInvalid}
          tooltip={tooltip}
          // Clicking the label focuses the editor, like a native field.
          onClick={() => editor.commands.focus()}
        >
          {label}
        </Label>
      )}

      <div
        className={cx(
          "w-full overflow-hidden rounded-lg bg-primary shadow-xs ring-1 ring-primary transition duration-100 ease-linear ring-inset",
          !isDisabled && "focus-within:ring-2 focus-within:ring-brand",
          isDisabled && "cursor-not-allowed opacity-50",
          isInvalid && "ring-destructive_subtle",
          isInvalid &&
            !isDisabled &&
            "focus-within:ring-2 focus-within:ring-destructive",
        )}
      >
        <TextEditorToolbar
          editor={editor}
          labels={resolvedLabels}
          isDisabled={isDisabled}
          onImageUpload={onImageUpload}
        />
        <EditorContent editor={editor} />
      </div>

      {(description || maxCharacters !== undefined) && (
        <div className="flex w-full items-start justify-between gap-3">
          {description && (
            <DescriptionText isInvalid={isInvalid}>
              {description}
            </DescriptionText>
          )}
          {maxCharacters !== undefined && (
            <DescriptionText
              // Announces the remaining count to screen readers as it changes.
              aria-live="polite"
              className="ml-auto shrink-0 tabular-nums"
            >
              {resolvedLabels.charactersLeft(
                Math.max(0, maxCharacters - characterCount),
              )}
            </DescriptionText>
          )}
        </div>
      )}
    </div>
  );
}
