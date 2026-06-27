import { useState, useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import Toolbar from "./components/Toolbar";
import PDFViewer from "./components/PDFViewer";
import ExcalidrawPanel from "./components/ExcalidrawPanel";

export type Tool = "select" | "pen" | "arrow" | "rectangle" | "ellipse" | "eraser";

export default function App() {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [tool, setTool] = useState<Tool>("select");
  const [color, setColor] = useState("#e63946");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [showExcalidraw, setShowExcalidraw] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);

  const handleOpenFile = useCallback(async () => {
    const path = await open({ filters: [{ name: "PDF", extensions: ["pdf"] }] });
    if (!path || typeof path !== "string") return;
    const bytes = await readFile(path);
    setPdfBytes(bytes);
    setPdfPath(path);
    setCurrentPage(0);
    setIsTTSPlaying(false);
  }, []);

  return (
    <div className="app">
      <Toolbar
        tool={tool}
        onToolChange={setTool}
        color={color}
        onColorChange={setColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        currentPage={currentPage}
        totalPages={totalPages}
        onOpenFile={handleOpenFile}
        onToggleExcalidraw={() => setShowExcalidraw((v) => !v)}
        showExcalidraw={showExcalidraw}
        isTTSPlaying={isTTSPlaying}
        onTTSToggle={() => setIsTTSPlaying((v) => !v)}
        hasPDF={!!pdfBytes}
      />
      <div className="main">
        {pdfBytes ? (
          <PDFViewer
            pdfBytes={pdfBytes}
            pdfPath={pdfPath}
            tool={tool}
            color={color}
            strokeWidth={strokeWidth}
            onPageChange={setCurrentPage}
            onTotalPages={setTotalPages}
            isTTSPlaying={isTTSPlaying}
            onTTSStateChange={setIsTTSPlaying}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-logo">L</div>
            <p>Legere</p>
            <button onClick={handleOpenFile}>Open PDF</button>
          </div>
        )}
      </div>
      {showExcalidraw && pdfPath && (
        <ExcalidrawPanel pdfPath={pdfPath} onClose={() => setShowExcalidraw(false)} />
      )}
    </div>
  );
}
