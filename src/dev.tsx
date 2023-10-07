import React, { useRef } from "react";
import { createRoot } from "react-dom/client";
import { DraggableComponent, DraggingProvider } from "./draggable";

const App = () => {
  const containerRef = useRef(null);
  return (
    <div
      ref={containerRef}
      style={{
        width: "500px",
        height: "500px",
        border: "1px solid black",
        margin: "50px auto 0",
        position: "relative",
      }}
    >
      <DraggingProvider>
        <DraggableComponent
          callback={() => {}}
          containerRef={containerRef}
          id={`1`}
          initialPosition={[0, 0]}
          key={1}
          onDragStart={() => {}}
          onDragMove={() => {}}
          style={{ width: 200, height: 200, background: "red" }}
        >
          <p>Hello!</p>
          <p>Hello!</p>
        </DraggableComponent>
        <DraggableComponent
          callback={() => {}}
          containerRef={containerRef}
          id={`2`}
          initialPosition={[10, 0]}
          key={2}
          onDragStart={() => {}}
          onDragMove={() => {}}
          style={{ background: "green" }}
        >
          <p>hello!</p>
        </DraggableComponent>
      </DraggingProvider>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
