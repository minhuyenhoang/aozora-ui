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
pnpm add aozora-ui
```

## Usage

Import the compiled stylesheet once in your application entry point:

```tsx
import "aozora-ui/styles.css";
```

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
and compiled CSS in `dist`.

## Publishing

Confirm the package name, version, ownership metadata, and license are correct for
the target npm account or organization, then run:

```bash
npm publish
```
