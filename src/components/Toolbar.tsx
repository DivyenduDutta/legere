import type { Tool } from "../App";

const TOOLS: { id: Tool; icon: string; label: string }[] = [
  { id: "select", icon: "↖", label: "Select / Text" },
  { id: "pen", icon: "✏", label: "Pen" },
  { id: "arrow", icon: "→", label: "Arrow" },
  { id: "rectangle", icon: "▭", label: "Rectangle" },
  { id: "ellipse", icon: "⬭", label: "Ellipse" },
  { id: "eraser", icon: "⌫", label: "Eraser" },
];

interface Props {
  tool: Tool;
  onToolChange: (t: Tool) => void;
  color: string;
  onColorChange: (c: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (w: number) => void;
  currentPage: number;
  totalPages: number;
  onOpenFile: () => void;
  onToggleExcalidraw: () => void;
  showExcalidraw: boolean;
  isTTSPlaying: boolean;
  onTTSToggle: () => void;
  hasPDF: boolean;
}

export default function Toolbar({
  tool, onToolChange, color, onColorChange, strokeWidth, onStrokeWidthChange,
  currentPage, totalPages, onOpenFile, onToggleExcalidraw, showExcalidraw,
  isTTSPlaying, onTTSToggle, hasPDF,
}: Props) {
  return (
    <div className="toolbar">
      <button className="toolbar-btn" onClick={onOpenFile}>Open PDF</button>
      <div className="sep" />
      {TOOLS.map((t) => (
        <button
          key={t.id}
          className={`toolbar-btn ${tool === t.id ? "active" : ""}`}
          onClick={() => onToolChange(t.id)}
          title={t.label}
        >
          {t.icon}
        </button>
      ))}
      <div className="sep" />
      <input
        type="color"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        title="Stroke color"
        style={{ width: 32, height: 28, cursor: "pointer", border: "none", background: "none" }}
      />
      <input
        type="range"
        min={1}
        max={20}
        value={strokeWidth}
        onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
        style={{ width: 72 }}
        title={`Stroke width: ${strokeWidth}px`}
      />
      <div className="sep" />
      {hasPDF && (
        <button
          className={`toolbar-btn ${isTTSPlaying ? "active" : ""}`}
          onClick={onTTSToggle}
          title="Read page aloud (or select text and press R)"
        >
          {isTTSPlaying ? "⏹ Stop" : "▶ Read"}
        </button>
      )}
      <div className="sep" />
      <button
        className={`toolbar-btn ${showExcalidraw ? "active" : ""}`}
        onClick={onToggleExcalidraw}
        title="Open infinite canvas for this PDF"
      >
        ⬡ Canvas
      </button>
      {totalPages > 0 && (
        <span className="page-info">
          {currentPage + 1} / {totalPages}
        </span>
      )}
    </div>
  );
}
