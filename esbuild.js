const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ["src/extension.js"],
    bundle: true,
    format: "cjs",
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: "node",
    outfile: "dist/extension.js",
    external: ["vscode", "rewrapper/rewrapper.mjs"],
    logLevel: "warning",
    plugins: [copyRewrapperPlugin, esbuildProblemMatcherPlugin],
  });
  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

const copyRewrapperPlugin = {
  name: "copy-rewrapper",
  setup(build) {
    build.onEnd(() => {
      const rewrapperSource = path.join(
        __dirname,
        "node_modules",
        "rewrapper",
        "rewrapper.mjs",
      );
      const rewrapperDest = path.join(
        __dirname,
        "dist",
        "node_modules",
        "rewrapper",
        "rewrapper.mjs",
      );
      const rewrapperDestDir = path.dirname(rewrapperDest);
      if (!fs.existsSync(rewrapperDestDir)) {
        fs.mkdirSync(rewrapperDestDir, { recursive: true });
      }
      fs.copyFileSync(rewrapperSource, rewrapperDest);

      const wasmSource = path.join(
        __dirname,
        "target",
        "wasm32-unknown-unknown",
        "release",
        "the_great_rewrapper.wasm",
      );
      const wasmDest = path.join(
        __dirname,
        "dist",
        "target",
        "wasm32-unknown-unknown",
        "release",
        "the_great_rewrapper.wasm",
      );
      const wasmDestDir = path.dirname(wasmDest);
      if (!fs.existsSync(wasmDestDir)) {
        fs.mkdirSync(wasmDestDir, { recursive: true });
      }
      fs.copyFileSync(wasmSource, wasmDest);
    });
  },
};

const esbuildProblemMatcherPlugin = {
  name: "esbuild-problem-matcher",

  setup(build) {
    build.onStart(() => {
      console.log("[watch] build started");
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        if (location == null) return;
        console.error(
          `    ${location.file}:${location.line}:${location.column}:`,
        );
      });
      console.log("[watch] build finished");
    });
  },
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
