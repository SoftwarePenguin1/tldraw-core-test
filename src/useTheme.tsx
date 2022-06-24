import { TLTheme } from "@tldraw/core";
import * as React from "react";

export function useTheme() {
  // (optional) Meta is passed to the Renderer and available in each shape
  // component's props. The rectangle uses it to change its stroke color.
  // This object can be anything you like!
  const [meta, setMeta] = React.useState({
    isDarkMode: false
  });

  const toggleDarkMode = React.useCallback(() => {
    setMeta((meta) => ({ ...meta, isDarkMode: !meta.isDarkMode }));
  }, []);

  // (optional) The theme is passed to the Renderer.
  const theme = React.useMemo<TLTheme>(() => {
    return {
      background: meta.isDarkMode ? "#15151e" : "#fefefe"
    };
  }, [meta]);

  return { meta, theme, toggleDarkMode };
}
