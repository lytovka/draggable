import type React from "react";

export type Position = [number, number];
export type Positions = Array<Position>;

export interface DraggingContextType {
  draggingItem: string | null;
  setDraggingItem: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface DraggableComponentProps extends React.PropsWithChildren {
  id: string;
  style?: React.CSSProperties;
  containerRef: React.RefObject<HTMLDivElement> | null;
  initialPosition?: Position;
  onDragStart?: (
    event: React.MouseEvent | React.TouchEvent,
    id: string,
  ) => void;
  onDragMove?: (event: MouseEvent | TouchEvent, id: string) => void;
  callback?: (id: string, stats: DraggableItemStats) => void;
}

export interface DraggableItemStats {
  positionPx: Position;
  positionPercent: Position;
  parentDimensions: [number, number];
  dimensionsPercent: [number, number];
  dimensions: [string, string];
  maxPositionPercent: [number, number];
}
