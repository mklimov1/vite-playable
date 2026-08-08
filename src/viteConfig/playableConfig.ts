import type { UserConfig } from "vite";
import { createConfig, type ConfigOptions } from "./createConfig";
import { resolveNetwork } from "../scripts/resolveNetwork";
import type { NetworkName } from "../networkConfigs";

export interface PlayableConfigOptions extends ConfigOptions {
  // Known networks autocomplete; any string (e.g. Vite's `mode`) is accepted.
  network?: NetworkName | (string & {});
}

export const playableConfig = (
  options: PlayableConfigOptions = {},
): UserConfig => {
  const { network = "develop", plugins = [], outDir, ...rest } = options;
  const resolved = resolveNetwork(network);

  return createConfig({
    ...rest,
    // Each network builds into its own dir so the per-network zip
    // (dist/<network>) has a folder to pack. Uses the resolved name so an
    // unknown network falls back consistently with resolveNetwork.
    outDir: outDir ?? `dist/${resolved.name}`,
    plugins: [...plugins, ...resolved.plugins],
  });
};
