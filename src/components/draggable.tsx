import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PropsWithChildren } from "react";
import type {
  DraggableComponentProps,
  DraggableItemStats,
  DraggingContextType,
  Position,
} from "./types";

const DEFAULT_WIDTH = "90";
const DEFAULT_HEIGHT = "90";

const getPercentage = (value: number, max: number) => (value / max) * 100;
const getPxValue = (value: number | string) => `${value}px`;
const getPercentageValue = (value: number | string) => `${value}%`;

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
    // eslint-disable-next-line
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
  const itemStats = useRef<DraggableItemStats>({
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
        parseInt(itemStats.current.dimensions[0], 10),
        itemStats.current.parentDimensions[0],
      );
      const height = getPercentage(
        parseInt(itemStats.current.dimensions[1], 10),
        itemStats.current.parentDimensions[1],
      );

      return [width, height];
    },
    get maxPositionPercent(): Position {
      return [
        100 - itemStats.current.dimensionsPercent[0],
        100 - itemStats.current.dimensionsPercent[1],
      ];
    },
  });

  const handleDown = useCallback(
    (
      event: React.MouseEvent | React.TouchEvent,
      clientX: number,
      clientY: number,
    ) => {
      setDraggingItem(id);
      itemStats.current.positionPx = [clientX, clientY];
      itemStats.current.positionPercent = [
        currentPositionPercent[0],
        currentPositionPercent[1],
      ];

      if (typeof onDragStart === "function") {
        onDragStart(event, id);
      }
    },
    [id, currentPositionPercent, onDragStart, setDraggingItem],
  );

  const handleMove = useCallback(
    (
      event: MouseEvent | TouchEvent,
      clientX: number,
      clientY: number,
    ) => {
      const deltaX = clientX - itemStats.current.positionPx[0];
      const deltaY = clientY - itemStats.current.positionPx[1];

      const percentX = getPercentage(
        deltaX,
        itemStats.current.parentDimensions[0],
      );
      const percentY = getPercentage(
        deltaY,
        itemStats.current.parentDimensions[1],
      );

      const finalX = Math.min(
        Math.max(0, itemStats.current.positionPercent[0] + percentX),
        itemStats.current.maxPositionPercent[0],
      );
      const finalY = Math.min(
        Math.max(0, itemStats.current.positionPercent[1] + percentY),
        itemStats.current.maxPositionPercent[1],
      );

      setCurrentPositionPercent([finalX, finalY]);
      if (typeof onDragMove === "function") {
        onDragMove(event, id);
      }
    },
    [onDragMove, id],
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      handleDown(event, event.clientX, event.clientY);
    },
    [handleDown],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      handleMove(event, event.clientX, event.clientY);
    },
    [handleMove],
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const touch = event.touches[0];
      if (typeof touch === "undefined") return;
      handleDown(event, touch.clientX, touch.clientX);
      itemStats.current.positionPx = [touch.clientX, touch.clientY];
    },
    [handleDown],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (draggingItem !== id) return;

      const touch = event.touches[0];
      if (typeof touch === "undefined") return;
      handleMove(event, touch.clientX, touch.clientY);
    },
    [draggingItem, id, handleMove],
  );

  const stopDragging = useCallback(() => {
    setDraggingItem(null);
    if (typeof callback === "function") {
      callback(id, {
        ...itemStats.current,
        positionPercent: currentPositionPercent,
      });
    }
  }, [id, setDraggingItem, callback, currentPositionPercent]);

  const updateContainerDimensions = useCallback((current: HTMLDivElement) => {
    const { width, height } = current.getBoundingClientRect();
    itemStats.current.parentDimensions = [width, height];
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
    // eslint-disable-next-line
    <div
      style={{
        ...rest.style,
        position: "absolute",
        width: getPxValue(itemStats.current.dimensions[0]),
        height: getPxValue(itemStats.current.dimensions[1]),
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
