import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
  skipNodeModulesBundle: true,
  target: "node16",
  minify: false,
  treeshake: true,
  platform: "node",
  external: ["chalk"],
  outDir: "dist",
  banner: {
    js: "#!/usr/bin/env node",
  },
  esbuildOptions(options) {
    options.charset = "utf8";
    options.legalComments = "none";
  },
  onSuccess: async () => {
    console.log("✅ Build completed successfully!");
  },
});
