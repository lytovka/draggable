import React, { useRef } from "react";
import { createRoot } from 'react-dom/client';
import { DraggingProvider, MovableComponent } from "./movable";

const App = () => {
  const containerRef = useRef(null);
  return (
    <div
      ref={containerRef}
      style={{
        width: "500px",
        height: "500px",
        border: "1px solid black",
        margin: "0 auto",
        position: "relative"
      }}
    >
      <DraggingProvider>
        <MovableComponent
          callback={() => {}}
          containerRef={containerRef}
          id={`1`}
          initialPosition={[0, 0]}
          key={1}
          onDown={() => {}}
          onMove={() => {}}
          style={{ background: "red" }}
        >
          <p>Hello!</p>
          <p>Hello!</p>
        </MovableComponent>
        <MovableComponent
          callback={() => {}}
          containerRef={containerRef}
          id={`2`}
          initialPosition={[10, 0]}
          key={2}
          onDown={() => {}}
          onMove={() => {}}
          style={{ background: "green" }}
        >
          <p>hello!</p>
        </MovableComponent>
      </DraggingProvider>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
