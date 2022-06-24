import * as React from "react";
import { Renderer } from "@tldraw/core";
import { useAppState } from "./useAppState";
import { useTheme } from "./useTheme";
import { shapeUtils } from "./shapes";
import "./styles.css";

function App() {
  const {
    state,
    handlePan,
    handlePinch,
    handleShapePoint,
    handleCanvasPoint,
    handlePointerMove,
    handlePointerUp,
    handleShapeHover,
    handleShapeUnhover,
    handleShapeChange
  } = useAppState();

  const { meta, theme, toggleDarkMode } = useTheme();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh"
      }}
    >
      <Renderer
        page={state.page}
        pageState={state.pageState}
        shapeUtils={shapeUtils}
        onPan={handlePan}
        onPinch={handlePinch}
        onPointCanvas={handleCanvasPoint}
        onPointShape={handleShapePoint}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onHoverShape={handleShapeHover}
        onUnhoverShape={handleShapeUnhover}
        onShapeChange={handleShapeChange}
        meta={meta}
        theme={theme}
      />
      <button
        style={{ position: "absolute", top: 4, right: 4, zIndex: 999 }}
        onClick={toggleDarkMode}
      >
        Toggle Dark Mode
      </button>
    </div>
  );
}

export default App;
