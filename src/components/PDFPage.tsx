import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { TextLayer } from "pdfjs-dist";
import DrawingLayer from "./DrawingLayer";
import type { Tool } from "../App";
import type { DrawnPath } from "../hooks/useAnnotations";

const SCALE = 1.5;

interface Props {
  pdf: pdfjsLib.PDFDocumentProxy;
  pageIndex: number;
  tool: Tool;
  color: string;
  strokeWidth: number;
  paths: DrawnPath[];
  onAddPath: (p: DrawnPath) => void;
  onRemovePath: (id: string) => void;
}

export default function PDFPage({
  pdf, pageIndex, tool, color, strokeWidth, paths, onAddPath, onRemovePath,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  // Pre-compute page dimensions so the scroll container has correct height
  // before the canvas renders, preventing layout jumps.
  const [placeholder, setPlaceholder] = useState<{ w: number; h: number } | null>(null);
  const [rendered, setRendered] = useState(false);
  const isDrawing = tool !== "select";

  // Compute placeholder size once on mount (cheap — no pixel rendering)
  useEffect(() => {
    pdf.getPage(pageIndex + 1).then((page) => {
      const vp = page.getViewport({ scale: SCALE });
      setPlaceholder({ w: vp.width, h: vp.height });
    });
  }, [pdf, pageIndex]);

  // Only render the canvas when the page scrolls into view
  useEffect(() => {
    if (!placeholder || rendered) return;
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          renderPage();
        }
      },
      { rootMargin: "400px" } // start rendering 400px before it's visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [placeholder, rendered]);

  async function renderPage() {
    const page = await pdf.getPage(pageIndex + 1);
    const vp = page.getViewport({ scale: SCALE });

    const canvas = canvasRef.current;
    const textDiv = textLayerRef.current;
    if (!canvas || !textDiv) return;

    const ctx = canvas.getContext("2d")!;
    canvas.width = vp.width;
    canvas.height = vp.height;

    await page.render({ canvasContext: ctx, viewport: vp }).promise;

    textDiv.innerHTML = "";
    textDiv.style.width = vp.width + "px";
    textDiv.style.height = vp.height + "px";

    const textContent = await page.getTextContent();
    const tl = new TextLayer({ textContentSource: textContent, container: textDiv, viewport: vp });
    await tl.render();

    setRendered(true);
  }

  if (!placeholder) return null;

  return (
    <div
      ref={wrapperRef}
      className="pdf-page-wrapper"
      style={{ width: placeholder.w, height: placeholder.h }}
    >
      <canvas ref={canvasRef} />
      <div
        ref={textLayerRef}
        className="text-layer"
        style={{ pointerEvents: isDrawing ? "none" : "auto" }}
      />
      {rendered && (
        <DrawingLayer
          width={placeholder.w}
          height={placeholder.h}
          tool={tool}
          color={color}
          strokeWidth={strokeWidth}
          paths={paths}
          onAddPath={onAddPath}
          onRemovePath={onRemovePath}
        />
      )}
    </div>
  );
}
