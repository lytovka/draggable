import React, {
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  DragData,
  DraggableComponentProps,
  DraggingContextType,
  Position,
} from "~/components/types";

const DEFAULT_WIDTH = "90";
const DEFAULT_HEIGHT = "90";

const getPercentage = (value: number, max: number) => (value / max) * 100;
const getPxValue = (value: string | number) => `${value}px`;
const getPercentageValue = (value: string | number) => `${value}%`;

export const DraggingContext = React.createContext<DraggingContextType>({
  draggingItem: null,
  setDraggingItem: () => {},
});

const useDragging = () => {
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

export const DraggableComponent = ({
  id,
  containerRef,
  initialPosition,
  children,
  callback,
  onDragStart,
  onDragMove,
  ...rest
}: PropsWithChildren<DraggableComponentProps>) => {
  const { draggingItem, setDraggingItem } = useDragging();
  const [currentPositionPercent, setCurrentPositionPercent] = useState<
    Position
  >(
    initialPosition ? initialPosition : [0, 0],
  );
  const dragData = useRef<DragData>({
    positionPx: [0, 0],
    positionPercent: [0, 0],
    parentDimensions: [0, 0],
    get dimensions(): [string, string] {
      const width = rest.style?.width?.toString() ?? DEFAULT_WIDTH;
      const height = rest.style?.height?.toString() ?? DEFAULT_HEIGHT;
      return [width, height];
    },
    get dimensionsPercent(): [number, number] {
      const width = getPercentage(
        parseInt(this.dimensions[0]),
        dragData.current.parentDimensions[0],
      );
      const height = getPercentage(
        parseInt(this.dimensions[1]),
        dragData.current.parentDimensions[1],
      );
      return [width, height];
    },
    get maxPositionPercent(): Position {
      return [
        100 - dragData.current.dimensionsPercent[0],
        100 - dragData.current.dimensionsPercent[1],
      ];
    },
  });

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      setDraggingItem(id);
      dragData.current.positionPx = [event.clientX, event.clientY];
      dragData.current.positionPercent = [
        currentPositionPercent[0],
        currentPositionPercent[1],
      ];
      onDragStart(event, id);
    },
    [id, currentPositionPercent, onDragStart, setDraggingItem],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const deltaX = event.clientX - dragData.current.positionPx[0];
      const deltaY = event.clientY - dragData.current.positionPx[1];
      const percentX = getPercentage(
        deltaX,
        dragData.current.parentDimensions[0],
      );
      const percentY = getPercentage(
        deltaY,
        dragData.current.parentDimensions[1],
      );

      const finalX = Math.min(
        Math.max(0, dragData.current.positionPercent[0] + percentX),
        dragData.current.maxPositionPercent[0],
      );
      const finalY = Math.min(
        Math.max(0, dragData.current.positionPercent[1] + percentY),
        dragData.current.maxPositionPercent[1],
      );

      setCurrentPositionPercent([finalX, finalY]);
      onDragMove(event, id);
    },
    [onDragMove, id],
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      setDraggingItem(id);
      const touch = event.touches[0];
      if (typeof touch === "undefined") return;
      dragData.current.positionPx = [touch.clientX, touch.clientY];
      dragData.current.positionPercent = [
        currentPositionPercent[0],
        currentPositionPercent[1],
      ];

      onDragStart(event, id);
    },
    [id, currentPositionPercent, onDragStart, setDraggingItem],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (draggingItem !== id) return;

      const touch = event.touches[0];
      if (typeof touch === "undefined") return;
      const deltaX = touch.clientX - dragData.current.positionPx[0];
      const deltaY = touch.clientY - dragData.current.positionPx[1];
      const percentX = getPercentage(
        deltaX,
        dragData.current.parentDimensions[0],
      );
      const percentY = getPercentage(
        deltaY,
        dragData.current.parentDimensions[1],
      );

      // Calculate max allowed percentage
      const maxPercentX = 100 - dragData.current.dimensionsPercent[0];
      const maxPercentY = 100 - dragData.current.dimensionsPercent[1];

      // Clamp the values between the minimum and maximum
      const finalX = Math.min(
        Math.max(0, dragData.current.positionPercent[0] + percentX),
        maxPercentX,
      );
      const finalY = Math.min(
        Math.max(0, dragData.current.positionPercent[1] + percentY),
        maxPercentY,
      );

      setCurrentPositionPercent([finalX, finalY]);
      onDragMove(event, id);
    },
    [draggingItem, onDragMove, id],
  );

  const stopDragging = useCallback(() => {
    setDraggingItem(null);
    callback(Number(id), currentPositionPercent);
  }, [id, setDraggingItem, callback, currentPositionPercent]);

  const updateContainerDimensions = useCallback((current: HTMLDivElement) => {
    const { width, height } = current.getBoundingClientRect();
    dragData.current.parentDimensions = [width, height];
  }, []);

  useEffect(() => {
    const current = containerRef?.current;
    if (!current) return;

    // Call initially to set the dimensions
    updateContainerDimensions(current);

    const resizeObserver = new ResizeObserver(() => {
      updateContainerDimensions(current);
    });
    resizeObserver.observe(current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, updateContainerDimensions]);

  useEffect(() => {
    if (draggingItem !== id) return;

    // Mouse events
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);

    // Touch events
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", stopDragging);

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
        width: getPxValue(dragData.current.dimensions[0]),
        height: getPxValue(dragData.current.dimensions[1]),
        left: getPercentageValue(currentPositionPercent[0]),
        top: getPercentageValue(currentPositionPercent[1]),
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {children}
    </div>
  );
};
