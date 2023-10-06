import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties, Dispatch, PropsWithChildren } from "react";
import { Position } from "./types";

const DEFAULT_WIDTH = 90;
const DEFAULT_HEIGHT = 90;

const getPercentage = (value: number, max: number) => (value / max) * 100;

interface DraggingContextType {
  draggingItem: string | null;
  setDraggingItem: Dispatch<React.SetStateAction<string | null>>;
}

export const DraggingContext = React.createContext<DraggingContextType>({
  draggingItem: null,
  setDraggingItem: () => {},
});

interface DragData {
  originalPos: Position;
  currentPos: Position;
  containerWidth: number;
  containerHeight: number;
}

export const useDragging = () => {
  return useContext(DraggingContext);
};

export const DraggingProvider = ({ children }: PropsWithChildren) => {
  const [draggingItem, setDraggingItem] = useState<string | null>(null);

  return (
    <DraggingContext.Provider value={{ draggingItem, setDraggingItem }}>
      {children}
    </DraggingContext.Provider>
  );
};

interface MovableComponentProps extends PropsWithChildren {
  id: string;
  width?: number;
  height?: number;
  style?: CSSProperties;
  initialPosition: Position;
  containerRef: React.RefObject<HTMLDivElement> | null;
  onDown: (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent,
    id: string,
  ) => void;
  onMove: (event: MouseEvent | TouchEvent, id: string) => void;
  callback: (id: number, position: Position) => void;
}

export const MovableComponent = ({
  id,
  containerRef,
  initialPosition,
  children,
  callback,
  onDown,
  onMove,
  ...rest
}: PropsWithChildren<MovableComponentProps>) => {
  const { draggingItem, setDraggingItem } = useDragging();
  const [position, setPosition] = useState<Position>(
    initialPosition ? initialPosition : [0, 0],
  );
  const dragData = useRef<DragData>({
    originalPos: [0, 0],
    currentPos: [0, 0],
    containerHeight: 0,
    containerWidth: 0,
  });

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      setDraggingItem(id);
      dragData.current.originalPos = [event.clientX, event.clientY];
      dragData.current.currentPos = [position[0], position[1]];
      onDown(event, id);
    },
    [id, position, onDown, setDraggingItem],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const deltaX = event.clientX - dragData.current.originalPos[0];
      const deltaY = event.clientY - dragData.current.originalPos[1];
      const percentX = getPercentage(deltaX, dragData.current.containerWidth);
      const percentY = getPercentage(deltaY, dragData.current.containerHeight);
      const objectWidthInPercentage = getPercentage(
        DEFAULT_WIDTH,
        dragData.current.containerWidth,
      );
      const objectHeightInPercentage = getPercentage(
        DEFAULT_HEIGHT,
        dragData.current.containerHeight,
      );

      const maxPercentX = 100 - objectWidthInPercentage;
      const maxPercentY = 100 - objectHeightInPercentage;

      const finalX = Math.min(
        Math.max(0, dragData.current.currentPos[0] + percentX),
        maxPercentX,
      );
      const finalY = Math.min(
        Math.max(0, dragData.current.currentPos[1] + percentY),
        maxPercentY,
      );

      setPosition([finalX, finalY]);
      onMove(event, id);
    },
    [onMove, id],
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      setDraggingItem(id);
      const touch = event.touches[0];
      dragData.current = {
        ...dragData.current,
        originalPos: [touch.clientX, touch.clientY],
        currentPos: [position[0], position[1]],
      };
      onDown(event, id);
    },
    [id, position, onDown, setDraggingItem],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (draggingItem === id) {
        const touch = event.touches[0];
        const deltaX = touch.clientX - dragData.current.originalPos[0];
        const deltaY = touch.clientY - dragData.current.originalPos[1];
        const percentX = getPercentage(deltaX, dragData.current.containerWidth);
        const percentY = getPercentage(
          deltaY,
          dragData.current.containerHeight,
        );

        const objectWidthInPercentage = getPercentage(
          DEFAULT_WIDTH,
          dragData.current.containerWidth,
        );
        const objectHeightInPercentage = getPercentage(
          DEFAULT_HEIGHT,
          dragData.current.containerHeight,
        );

        // Calculate max allowed percentage
        const maxPercentX = 100 - objectWidthInPercentage;
        const maxPercentY = 100 - objectHeightInPercentage;

        // Clamp the values between the minimum and maximum
        const finalX = Math.min(
          Math.max(0, dragData.current.currentPos[0] + percentX),
          maxPercentX,
        );
        const finalY = Math.min(
          Math.max(0, dragData.current.currentPos[1] + percentY),
          maxPercentY,
        );

        setPosition([finalX, finalY]);
        onMove(event, id);
      }
    },
    [draggingItem, onMove, id],
  );

  const stopDragging = useCallback(() => {
    setDraggingItem(null);
    callback(Number(id), position);
  }, [id, setDraggingItem, callback, position]);

  const updateContainerDimensions = useCallback((current: HTMLDivElement) => {
    const { width, height } = current.getBoundingClientRect();
    dragData.current.containerWidth = width;
    dragData.current.containerHeight = height;
    console.log(width, height);
  }, []);

  useEffect(() => {
    const current = containerRef?.current;
    if (current) {
      // Call initially to set the dimensions
      updateContainerDimensions(current);

      const resizeObserver = new ResizeObserver(() => {
        updateContainerDimensions(current);
      });
      resizeObserver.observe(current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [containerRef, updateContainerDimensions]);

  useEffect(() => {
    if (draggingItem === id) {
      // Mouse events
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", stopDragging);

      // Touch events
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", stopDragging);
    }

    return () => {
      // Mouse events
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);

      // Touch events
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopDragging);
    };
  }, [draggingItem, handleMouseMove, handleTouchMove, id, stopDragging]);

  return (
    <div
      style={{
        ...rest.style,
        position: "absolute",
        width: `${DEFAULT_WIDTH}px`,
        height: `${DEFAULT_HEIGHT}px`,
        left: `${position[0]}%`,
        top: `${position[1]}%`,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {children}
    </div>
  );
};
