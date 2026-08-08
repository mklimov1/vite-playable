import { networkConfigMap } from "../networkConfigs";
import type { NetworkConfig } from "../types/networkConfig";

// Accepts any string (e.g. Vite's `mode`) and falls back to `develop` for
// unknown networks, so consumers don't have to cast in vite.config.ts.
export const resolveNetwork = (name: string = "develop"): NetworkConfig =>
  (networkConfigMap as Record<string, NetworkConfig>)[name] ??
  networkConfigMap.develop;
