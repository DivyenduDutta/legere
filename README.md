# Legere

A lightweight desktop PDF reader with annotation tools, text-to-speech, and an infinite canvas — built with Tauri v2, React, and TypeScript.

> *Legere* — Latin for "to read"

## Features

- **PDF rendering** — smooth, lazy-loaded page rendering via `pdfjs-dist`
- **Drawing tools** — freehand pen, arrow, rectangle, and ellipse overlaid on pages
- **Eraser** — click any drawn shape to remove it
- **Persistent annotations** — drawings are saved to a sidecar `.legere.json` file next to the PDF, loaded automatically on reopen
- **Text selection** — selectable text layer on every page
- **Text-to-speech** — read the current page aloud, or select text and press `R` to speak it
- **Excalidraw canvas** — toggle an infinite freeform canvas tied to the open PDF for diagrams and notes

## Tech Stack

| Layer | Library |
|---|---|
| Desktop shell | Tauri v2 |
| UI | React 19 + TypeScript |
| Build | Vite |
| PDF rendering | pdfjs-dist |
| Drawing layer | react-konva (Konva.js) |
| Infinite canvas | Excalidraw |
| File I/O | `@tauri-apps/plugin-fs` |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- [Tauri CLI prerequisites](https://tauri.app/start/prerequisites/) for your OS

### Install & Run

```bash
npm install
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

## Annotation Storage

Annotations are saved as a JSON sidecar file alongside the PDF:

```
my-document.pdf
my-document.legere.json   ← created automatically
```

Moving or renaming the PDF will detach its annotations unless you move the sidecar file too.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `R` | Speak selected text aloud (select mode only) |

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
