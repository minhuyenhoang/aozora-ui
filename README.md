# aozora-ui

Accessible React components built with React Aria, TypeScript, Tailwind CSS, and [Untitled UI](https://www.untitledui.com) design.

I built this library for my own projects, so it changes to fit what they need.
Everyone is free to use it, under the [MIT license](LICENSE).

## Installation

With npm:

```bash
npm install aozora-ui
```

With pnpm:

```bash
pnpm add aozora-ui \
  react-aria react-aria-components react-stately \
  @internationalized/date @tabler/icons-react \
  @1771technologies/lytenyte-core react-advanced-cropper \
  @tiptap/core @tiptap/pm @tiptap/react @tiptap/starter-kit \
  @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-text-align \
  tailwindcss @tailwindcss/vite tailwindcss-react-aria-components tw-animate-css
```

## Usage

The components are styled with [Tailwind CSS](https://tailwindcss.com) v4,
which your application needs to have installed. The stylesheet is Tailwind CSS
source, so your Tailwind CSS builds it together with your own classes. Import
it after Tailwind CSS in your main stylesheet:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

@import "tailwindcss";
@import "aozora-ui/styles.css";
```

This also makes the theme available to your own markup, such as `bg-primary`,
`text-brand-secondary` or `border-secondary`.

The first line loads the Inter font, which the theme uses. Without it, text
falls back to the system font.

Components and their TypeScript types are available from the package root:

```tsx
import { Button, InputText } from "aozora-ui";

export function Example() {
  return (
    <div>
      <InputText label="Name" placeholder="Enter your name" />
      <Button>Save</Button>
    </div>
  );
}
```

## Credits

The look of these components comes from [Untitled UI](https://www.untitledui.com),
a design system by Jordan Hughes. The color tokens, type scale, spacing and
component styles follow its design, and many components started from the
open-source [Untitled UI React](https://www.untitledui.com/react) components.

This library is not affiliated with or endorsed by Untitled UI. If you like the
design, please support the original.

## Development

```bash
npm install
npm run storybook
```

Useful commands:

```bash
npm run check
npm run build
npm pack --dry-run
```

The build produces ESM and CommonJS bundles, TypeScript declarations, source maps,
and the Tailwind CSS source stylesheets in `dist`.

## Publishing

Confirm the package name, version, ownership metadata, and license are correct for
the target npm account or organization, then run:

```bash
npm publish
```
