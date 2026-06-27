import { useRef, useState, useCallback } from "react";
import { Stage, Layer, Line, Arrow, Rect, Ellipse } from "react-konva";
import type Konva from "konva";
import type { Tool } from "../App";
import type { DrawnPath } from "../hooks/useAnnotations";

interface Props {
  width: number;
  height: number;
  tool: Tool;
  color: string;
  strokeWidth: number;
  paths: DrawnPath[];
  onAddPath: (p: DrawnPath) => void;
  onRemovePath: (id: string) => void;
}

export default function DrawingLayer({
  width, height, tool, color, strokeWidth, paths, onAddPath, onRemovePath,
}: Props) {
  const [drawing, setDrawing] = useState(false);
  const [penPoints, setPenPoints] = useState<number[]>([]);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [preview, setPreview] = useState<number[] | null>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const isActive = tool !== "select";
  const cursor =
    tool === "pen" ? "crosshair"
    : tool === "eraser" ? "cell"
    : isActive ? "crosshair"
    : "default";

  const getPos = (e: Konva.KonvaEventObject<MouseEvent>) =>
    e.target.getStage()!.getPointerPosition()!;

  const onMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isActive || tool === "eraser") return;
      const p = getPos(e);
      setDrawing(true);
      setStartPos(p);
      if (tool === "pen") setPenPoints([p.x, p.y]);
    },
    [isActive, tool]
  );

  const onMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!drawing) return;
      const p = getPos(e);
      if (tool === "pen") {
        setPenPoints((pts) => [...pts, p.x, p.y]);
      } else {
        setPreview([startPos.x, startPos.y, p.x, p.y]);
      }
    },
    [drawing, tool, startPos]
  );

  const onMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!drawing) return;
      setDrawing(false);
      const p = getPos(e);
      const id = `${Date.now()}-${Math.random()}`;

      if (tool === "pen" && penPoints.length > 4) {
        onAddPath({ id, type: "pen", points: penPoints, color, strokeWidth });
      } else if (tool !== "pen" && tool !== "eraser" && preview) {
        onAddPath({ id, type: tool as DrawnPath["type"], points: [startPos.x, startPos.y, p.x, p.y], color, strokeWidth });
      }
      setPenPoints([]);
      setPreview(null);
    },
    [drawing, tool, penPoints, startPos, preview, color, strokeWidth, onAddPath]
  );

  const renderPath = (path: DrawnPath, previewMode = false) => {
    const key = previewMode ? "preview" : path.id;
    const shared = {
      stroke: path.color,
      strokeWidth: path.strokeWidth,
      listening: tool === "eraser" && !previewMode,
      onClick: () => { if (tool === "eraser") onRemovePath(path.id); },
    };
    const [x1, y1, x2, y2] = path.points;

    switch (path.type) {
      case "pen":
        return <Line key={key} {...shared} points={path.points} tension={0.4} lineCap="round" lineJoin="round" />;
      case "arrow":
        return <Arrow key={key} {...shared} points={path.points} fill={path.color} />;
      case "rectangle":
        return <Rect key={key} {...shared} x={Math.min(x1, x2)} y={Math.min(y1, y2)} width={Math.abs(x2 - x1)} height={Math.abs(y2 - y1)} />;
      case "ellipse":
        return <Ellipse key={key} {...shared} x={(x1 + x2) / 2} y={(y1 + y2) / 2} radiusX={Math.abs(x2 - x1) / 2} radiusY={Math.abs(y2 - y1) / 2} />;
      default:
        return null;
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        cursor,
        pointerEvents: isActive ? "auto" : "none",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <Layer>
        {paths.map((p) => renderPath(p))}
        {drawing && tool === "pen" && penPoints.length > 2 && (
          <Line
            points={penPoints}
            stroke={color}
            strokeWidth={strokeWidth}
            tension={0.4}
            lineCap="round"
            lineJoin="round"
            listening={false}
          />
        )}
        {preview && tool !== "pen" &&
          renderPath({ id: "preview", type: tool as DrawnPath["type"], points: preview, color, strokeWidth }, true)}
      </Layer>
    </Stage>
  );
}
