/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
import { readFileSync } from "node:fs";
import path from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

// Everything the library depends on stays out of the bundle, and is installed
// alongside it instead. The list is read from package.json so it cannot drift.
const packageJson = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, "./package.json"), "utf8"),
) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const externalPackages = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
];

function isExternalPackage(id: string) {
  return externalPackages.some(
    (packageName) => id === packageName || id.startsWith(`${packageName}/`),
  );
}

/**
 * Publishes the stylesheets as Tailwind CSS source, next to the bundle, so the
 * app's Tailwind CSS builds them with its own classes.
 */
function publishStylesheets(): Plugin {
  const styles = path.resolve(import.meta.dirname, "./src/styles");

  return {
    name: "publish-stylesheets",
    apply: (config, { command }) => command === "build" && !!config.build?.lib,
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "styles.css",
        source: readFileSync(path.join(styles, "library.css"), "utf8"),
      });
      this.emitFile({
        type: "asset",
        fileName: "theme.css",
        source: readFileSync(path.join(styles, "theme.css"), "utf8"),
      });
    },
  };
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), tailwindcss(), publishStylesheets()],
  resolve: {
    // Use alias for cleaner import statements, REMEMBER to define these paths in tsconfig.app.json as well!
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@components": path.resolve(import.meta.dirname, "./src/components"),
      "@constants": path.resolve(import.meta.dirname, "./src/constants"),
      "@hooks": path.resolve(import.meta.dirname, "./src/hooks"),
      "@styles": path.resolve(import.meta.dirname, "./src/styles"),
      "@utils": path.resolve(import.meta.dirname, "./src/utils"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, "./src/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    sourcemap: true,
    rollupOptions: {
      external: isExternalPackage,
      output: {
        exports: "named",
      },
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(import.meta.dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
      },
    ],
  },
});
