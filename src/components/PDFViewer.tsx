import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import PDFPage from "./PDFPage";
import { useTTS } from "../hooks/useTTS";
import { useAnnotations } from "../hooks/useAnnotations";
import type { Tool } from "../App";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).href;

interface Props {
  pdfBytes: Uint8Array;
  pdfPath: string | null;
  tool: Tool;
  color: string;
  strokeWidth: number;
  onPageChange: (p: number) => void;
  onTotalPages: (n: number) => void;
  isTTSPlaying: boolean;
  onTTSStateChange: (v: boolean) => void;
}

export default function PDFViewer({
  pdfBytes, pdfPath, tool, color, strokeWidth,
  onPageChange, onTotalPages, isTTSPlaying, onTTSStateChange,
}: Props) {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { annotations, addPath, removePath } = useAnnotations(pdfPath);
  const { speakText, stop } = useTTS(() => onTTSStateChange(false));

  useEffect(() => {
    pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise.then((doc) => {
      setPdf(doc);
      onTotalPages(doc.numPages);
    });
  }, [pdfBytes]);

  const getVisiblePageIndex = useCallback(() => {
    const container = containerRef.current;
    if (!container) return 0;
    const wrappers = container.querySelectorAll<HTMLElement>(".pdf-page-wrapper");
    for (let i = 0; i < wrappers.length; i++) {
      if (wrappers[i].offsetTop + wrappers[i].offsetHeight > container.scrollTop + 80) {
        return i;
      }
    }
    return 0;
  }, []);

  useEffect(() => {
    if (!isTTSPlaying || !pdf) {
      stop();
      return;
    }
    (async () => {
      const idx = getVisiblePageIndex();
      const page = await pdf.getPage(idx + 1);
      const content = await page.getTextContent();
      const text = content.items.map((it: any) => it.str).join(" ");
      speakText(text);
    })();
  }, [isTTSPlaying, pdf]);

  const handleScroll = useCallback(() => {
    onPageChange(getVisiblePageIndex());
  }, [onPageChange, getVisiblePageIndex]);

  // Press R in select mode to read selected text
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "r" || tool !== "select") return;
      const selection = window.getSelection()?.toString().trim();
      if (selection) speakText(selection);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tool, speakText]);

  return (
    <div className="pdf-viewer" ref={containerRef} onScroll={handleScroll}>
      {pdf &&
        Array.from({ length: pdf.numPages }, (_, i) => (
          <PDFPage
            key={i}
            pdf={pdf}
            pageIndex={i}
            tool={tool}
            color={color}
            strokeWidth={strokeWidth}
            paths={annotations[i] ?? []}
            onAddPath={(p) => addPath(i, p)}
            onRemovePath={(id) => removePath(i, id)}
          />
        ))}
    </div>
  );
}
