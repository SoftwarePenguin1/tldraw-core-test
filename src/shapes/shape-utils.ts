import { TLShapeUtilsMap } from "@tldraw/core";
import { RectangleUtil, RectangleShape } from "./rectangle";

// Create a union of all custom shape types
export type MyShapes = RectangleShape;

// Create a table of shape type -> shape utility singleton
export const shapeUtils: TLShapeUtilsMap<MyShapes> = {
  rectangle: new RectangleUtil()
};
