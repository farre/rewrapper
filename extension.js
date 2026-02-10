const vscode = require("vscode");

async function activate(context) {
  const config = vscode.workspace.getConfiguration("The Great Rewrapper");
  if (!config["enable"]) {
    return;
  }

  const pattern = config["pattern"] ?? "**/html/source";

  const { default: rewrapper } = await import("rewrapper/rewrapper.mjs");
  context.subscriptions.push(
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      { pattern },
      {
        provideDocumentRangeFormattingEdits(document, range, options, token) {
          const config = vscode.workspace.getConfiguration(
            "The Great Rewrapper",
          );
          const columnLength = Math.abs(config["column-length"] ?? 100);
          const start = range.start.with({ character: 0 });
          const end = document.lineAt(range.end.line).range.end;
          range = new vscode.Range(start, end);
          return [
            vscode.TextEdit.replace(
              range,
              rewrapper(document.getText(range), columnLength),
            ),
          ];
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
