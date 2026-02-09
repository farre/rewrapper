const vscode = require("vscode");

async function activate(context) {
  const { default: rewrapper } = await import("rewrapper/rewrapper.mjs");
  context.subscriptions.push(
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      { pattern: "**/html/source" },
      {
        provideDocumentRangeFormattingEdits(document, range, options, token) {
          const columnLength = vscode.workspace.getConfiguration(
            "the-great-rewrapper",
          )["column-length"];
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
