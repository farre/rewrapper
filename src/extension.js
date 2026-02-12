const vscode = require("vscode");
const { WasmContext, Memory } = require("@vscode/wasm-component-model");
const { rewrapper } = require("./rewrapper.js");

async function activate(context) {
  const config = vscode.workspace.getConfiguration("The Great Rewrapper");
  if (!config["enable"]) {
    return;
  }

  const pattern = config["pattern"] ?? "**/html/source";

  const { default: originalRewrapper } =
    await import("rewrapper/rewrapper.mjs");

  const filename = vscode.Uri.joinPath(
    context.extensionUri,
    "dist",
    "target",
    "wasm32-unknown-unknown",
    "release",
    "the_great_rewrapper.wasm",
  );
  const bits = await vscode.workspace.fs.readFile(filename);
  const module = await WebAssembly.compile(bits);

  const wasmContext = new WasmContext.Default();
  const instance = await WebAssembly.instantiate(module, {});
  wasmContext.initialize(new Memory.Default(instance.exports));

  const api = rewrapper._.exports.bind(instance.exports, wasmContext);
  const specfmtInstance = { exports: api.types };

  context.subscriptions.push(
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      { pattern },
      {
        provideDocumentRangeFormattingEdits(document, range, options, token) {
          const config = vscode.workspace.getConfiguration(
            "The Great Rewrapper",
          );
          const columnLength = Math.abs(config["column-length"] ?? 100);
          const formatter = config["formatter"] ?? "original";
          const start = range.start.with({ character: 0 });
          const end = document.lineAt(range.end.line).range.end;
          range = new vscode.Range(start, end);

          if (formatter === "original") {
            return [
              vscode.TextEdit.replace(
                range,
                originalRewrapper(document.getText(range), columnLength),
              ),
            ];
          } else {
            const text = document.getText(range);
            const lines = text.split("\n").map((line) => [true, line]);
            const rewrapped = specfmtInstance.exports.rewrapLines(
              lines,
              BigInt(lines.length),
              columnLength,
            );
            return [vscode.TextEdit.replace(range, rewrapped.join("\n"))];
          }
        },
      },
    ),
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
