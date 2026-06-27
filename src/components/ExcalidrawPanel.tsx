import { useEffect, useState, useRef, useCallback } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";

interface Props {
  pdfPath: string;
  onClose: () => void;
}

function sidecarFor(p: string) {
  return p.replace(/\.pdf$/i, ".excalidraw");
}

export default function ExcalidrawPanel({ pdfPath, onClose }: Props) {
  const [initialData, setInitialData] = useState<any>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasPath = sidecarFor(pdfPath);

  useEffect(() => {
    readFile(canvasPath)
      .then((b) => setInitialData(JSON.parse(new TextDecoder().decode(b))))
      .catch(() => setInitialData({ elements: [], appState: { theme: "dark" } }));
  }, [canvasPath]);

  const handleChange = useCallback(
    (elements: any, appState: any, files: any) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const json = JSON.stringify({ elements, appState, files });
        await writeFile(canvasPath, new TextEncoder().encode(json));
      }, 1000);
    },
    [canvasPath]
  );

  if (!initialData) {
    return (
      <div className="excalidraw-overlay" style={{ alignItems: "center", justifyContent: "center" }}>
        Loading canvas…
      </div>
    );
  }

  return (
    <div className="excalidraw-overlay">
      <div className="excalidraw-header">
        <span>{pdfPath.split(/[\\/]/).pop()} — Canvas</span>
        <button onClick={onClose}>✕ Close</button>
      </div>
      <div className="excalidraw-body">
        <Excalidraw initialData={initialData} onChange={handleChange} theme="dark" />
      </div>
    </div>
  );
}
