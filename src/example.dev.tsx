import React, { useRef } from "react";
import { createRoot } from "react-dom/client";
import { DraggableComponent, DraggingProvider } from "./components";

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
          id={`1`}
          containerRef={containerRef}
          initialPosition={[0, 0]}
          style={{ width: 200, height: 200, background: "red" }}
        >
          <p>Hello!</p>
          <p>Hello!</p>
        </DraggableComponent>
        <DraggableComponent
          id={`2`}
          containerRef={containerRef}
          initialPosition={[10, 0]}
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
