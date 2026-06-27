import { useState, useCallback, useEffect } from "react";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";

export interface DrawnPath {
  id: string;
  type: "pen" | "arrow" | "rectangle" | "ellipse";
  points: number[];
  color: string;
  strokeWidth: number;
}

type AnnotationMap = Record<number, DrawnPath[]>;

function sidecarFor(pdfPath: string) {
  return pdfPath.replace(/\.pdf$/i, ".legere.json");
}

export function useAnnotations(pdfPath: string | null) {
  const [annotations, setAnnotations] = useState<AnnotationMap>({});

  useEffect(() => {
    if (!pdfPath) return;
    setAnnotations({});
    readFile(sidecarFor(pdfPath))
      .then((bytes) => {
        const data = JSON.parse(new TextDecoder().decode(bytes));
        setAnnotations(data);
      })
      .catch(() => {});
  }, [pdfPath]);

  const persist = useCallback(
    async (next: AnnotationMap) => {
      if (!pdfPath) return;
      const json = new TextEncoder().encode(JSON.stringify(next));
      await writeFile(sidecarFor(pdfPath), json);
    },
    [pdfPath]
  );

  const addPath = useCallback(
    (pageIndex: number, path: DrawnPath) => {
      setAnnotations((prev) => {
        const next = { ...prev, [pageIndex]: [...(prev[pageIndex] ?? []), path] };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removePath = useCallback(
    (pageIndex: number, id: string) => {
      setAnnotations((prev) => {
        const next = {
          ...prev,
          [pageIndex]: (prev[pageIndex] ?? []).filter((p) => p.id !== id),
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return { annotations, addPath, removePath };
}
