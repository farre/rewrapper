# The Great Rewrapper (Extension Edition)

**The Great Rewrapper** is a formatter extension for formatting _Wattsi formatting specifications_.
It operates as a **range formatter** and rewrites text to a fixed column width using the `rewrapper` engine. This is a VSCodium/VS Code version of Domenic's [The Great Rewrapper](https://github.com/domenic/rewrapper). Similarly to the web application this is primarily intended for people contributing to the HTML Standard.

The formatter is opt-in, file-pattern scoped, and non-destructive outside the selected range.

---

## What the Extension Does

- Rewraps text to a configurable column width
- Operates only on files matching a configurable glob pattern
- Formats **only the selected range**

---

## When the Formatter Runs

The formatter is registered as a **Document Range Formatting Provider**.

It runs when you invoke any of the following (depending on default configuration) VSCodium/VS Code commands on selected text in a matching file:

- **Format Selection** / **Format Selection With...**

If no text is selected, VSCodium/VS Code supplies the full document range automatically. Reformatting will be done on whole lines, i.e if any part of a line is selected the whole line will be considered for formatting.

---

## Configuration

The extension provides the following settings and default values:

```json
{
  "The Great Rewrapper.column-length": 100,
  "The Great Rewrapper.enable": true,
  "The Great Rewrapper.pattern": "**/html/source",
  "The Great Rewrapper.formatter": "original"
}
```

### Column length

The length to which the formatter rewraps. Default: `100`.

### Enable

If the extension should be enabled. Practical for debugging purposes and for resolving conflicts between formatters. Default: `true`.

### Pattern

The glob pattern for which documents that the formatter will be available to.

Examples:

```json
"**/*.wattsi"
"docs/spec/**"
"**/*.txt"
```

Default: `"**/html/source"`

### Formatter

The rewrapper implementation to use. Available options:

- `"original"` - Uses the original rewrapper implementation from [domenic/rewrapper](https://github.com/domenic/rewrapper)
- `"specfmt"` - Uses the specfmt rewrapper implementation from [domfarolino/specfmt](https://github.com/domfarolino/specfmt)

Default: `"original"`
