import path from "path";

import { type UserConfig } from "vite";

export interface ConfigOptions {
  plugins?: UserConfig["plugins"];
  outDir?: string;
  alias?: Record<string, string>;
  port?: number;
}

export const createConfig = (options: ConfigOptions = {}) => {
  const { plugins = [], outDir = "dist", port = 3000, alias } = options;

  return {
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src"),
        ...alias,
      },
    },
    server: {
      port,
      open: false,
    },
    build: {
      target: "esnext",
      outDir: outDir,
      assetsDir: "assets",
      emptyOutDir: false,
    },
    plugins,
  };
};
