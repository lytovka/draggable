import type { CSSProperties, Dispatch, PropsWithChildren } from "react";

export type Position = [number, number];
export type Positions = Array<Position>;

export interface DraggingContextType {
  draggingItem: string | null;
  setDraggingItem: Dispatch<React.SetStateAction<string | null>>;
}

export interface DraggableComponentProps extends PropsWithChildren {
  id: string;
  style?: CSSProperties;
  initialPosition: Position;
  containerRef: React.RefObject<HTMLDivElement> | null;
  onDragStart?: (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent,
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
