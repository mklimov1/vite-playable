import { defineConfig } from "vite";
import { playableConfig } from "@mklimov1/vite-playable";

// Consumes the package by name (via file:.. symlink) exactly like a real user
// would after `npm i -D @mklimov1/vite-playable`. The `--mode <network>`
// flag selects the network preset (develop | develop-inline).
export default defineConfig(({ mode }) => playableConfig({ network: mode }));
