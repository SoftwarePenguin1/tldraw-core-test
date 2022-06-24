import * as React from "react";
import {
  TLPage,
  TLPageState,
  TLPinchEventHandler,
  TLWheelEventHandler,
  TLPointerEventHandler,
  TLBinding,
  TLShapeChangeHandler
} from "@tldraw/core";
import { Vec } from "@tldraw/vec";
import { shapeUtils, MyShapes } from "./shapes";
import { useImmer } from "use-immer";
import { RectangleShape } from "./shapes/rectangle";

interface State {
  page: TLPage<MyShapes, TLBinding>;
  pageState: TLPageState;
}

function screenToPage(point: number[], cameraPoint: number[], zoom: number) {
  return Vec.sub(Vec.div(point, zoom), cameraPoint);
}

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

export function useAppState() {
  // State machines, anyone?
  const rStatus = React.useRef("idle");

  // Define the initial state (page + pageState)
  const [state, setState] = useImmer<State>({
    page: {
      id: "page1",
      shapes: {
        rect1: {
          id: "rect1",
          parentId: "page1",
          name: "Rectangle",
          childIndex: 1,
          type: "rectangle",
          point: [0, 0],
          rotation: 0,
          size: [100, 100],
          text: "Slob on My Knob"
        }
      },
      bindings: {}
    },
    pageState: {
      id: "page1",
      selectedIds: [],
      camera: {
        point: [0, 0],
        zoom: 1
      }
    }
  });

  // Handle camera pan
  const handlePan = React.useCallback<TLWheelEventHandler>(
    (info) => {
      setState((draft) => {
        const { point, zoom } = draft.pageState.camera;

        // Find the new point by offsetting the current point by the
        // pan gesture's delta (divided by the current zoom).
        const newPoint = Vec.sub(point, Vec.div(info.delta, zoom));

        // Update the state
        draft.pageState.camera.point = newPoint;
      });
    },
    [setState]
  );

  // Handle camera pinch
  const handlePinch = React.useCallback<TLPinchEventHandler>(
    (info) => {
      setState((draft) => {
        const { camera } = draft.pageState;
        const { point, delta } = info;

        // The pinch's delta is [x, y, z]. We'll use the z to adjust the
        // zoom and the x and y to adjust the point.

        // Find the new zoom, clamped between 15% and 500%.
        const nextZoom = clamp(
          camera.zoom - (delta[2] / 2) * camera.zoom,
          0.15,
          5
        );

        // Find the new point by offsetting the current point by the
        // pan gesture's delta (divided by the current zoom). Then offset
        // _that_ point by the difference between the pinch point's page
        // point at the new zoom and the point's page point at the old zoom.
        const nextPoint = Vec.add(
          Vec.sub(camera.point, Vec.div(info.delta, camera.zoom)),
          Vec.sub(
            screenToPage(point, camera.point, nextZoom),
            screenToPage(point, camera.point, camera.zoom)
          )
        );

        // Update the state
        draft.pageState.camera.point = nextPoint;
        draft.pageState.camera.zoom = nextZoom;
      });
    },
    [setState]
  );

  // Handle shape point
  const handleShapePoint = React.useCallback<TLPointerEventHandler>(
    (info, e) => {
      e.stopPropagation();
      rStatus.current = "pointing";
      setState((draft) => {
        draft.pageState.selectedIds = [info.target];
      });
    },
    [setState]
  );

  // Handle shape point
  const handleCanvasPoint = React.useCallback<TLPointerEventHandler>(
    (info, e) => {
      setState((draft) => {
        if (draft.pageState.selectedIds.length === 0) {
          const { camera } = state.pageState;

          // Screen to document
          const point = Vec.sub(Vec.div(info.point, camera.zoom), camera.point);

          // Create a new shape via the rectangle shape util
          const newShape: RectangleShape = {
            id: Date.now() + "",
            type: "rectangle",
            parentId: "page1",
            name: "Rectangle",
            point: Vec.sub(point, [50, 50]),
            childIndex: Object.keys(state.page.shapes).length,
            rotation: 0,
            size: [100, 100],
            text: "Slob Me"
          };

          draft.page.shapes[newShape.id] = newShape;
        } else {
          rStatus.current = "idle";
          draft.pageState.selectedIds = [];
        }
      });
    },
    [setState]
  );

  // Handle pointer move
  const handlePointerMove = React.useCallback<TLPointerEventHandler>(
    (info) => {
      if (rStatus.current === "pointing") {
        rStatus.current = "dragging";
      }

      if (rStatus.current === "dragging") {
        setState((draft) => {
          draft.pageState.selectedIds.forEach((shapeId) => {
            draft.page.shapes[shapeId].point = Vec.add(
              draft.page.shapes[shapeId].point,
              info.delta
            );
          });
        });
      }
    },
    [setState]
  );

  const handlePointerUp = React.useCallback<TLPointerEventHandler>((info) => {
    rStatus.current = "idle";
  }, []);

  const handleShapeHover = React.useCallback<TLPointerEventHandler>(
    (info) => {
      setTimeout(() => {
        setState((draft) => {
          draft.pageState.hoveredId = info.target;
        });
      }, 0);
    },
    [setState]
  );

  const handleShapeUnhover = React.useCallback<TLPointerEventHandler>(
    (info) => {
      setState((draft) => {
        draft.pageState.hoveredId = undefined;
      });
    },
    []
  );

  const handleShapeChange = React.useCallback<TLShapeChangeHandler<MyShapes>>(
    (shape) => {
      // If the shape itself prompts a change, update the shape
      setState((draft) => {
        Object.assign(draft.page.shapes[shape.id], shape);
      });
    },
    [setState]
  );

  return {
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
  };
}
