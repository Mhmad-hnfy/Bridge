"use client";

import { useEffect } from "react";

export default function SecurityProvider() {
  useEffect(() => {
    // 1. Disable right-click completely
    const handleContextMenu = (e) => e.preventDefault();

    // 2. Disable Copy, Cut, and Paste
    const handleCopy = (e) => {
      e.preventDefault();
      // alert("Copying content is strictly prohibited!");
    };
    const handleCut = (e) => e.preventDefault();
    const handlePaste = (e) => e.preventDefault();

    // 3. Disable dragging of images/videos
    const handleDragStart = (e) => {
      if (e.target.tagName === "IMG" || e.target.tagName === "VIDEO" || e.target.tagName === "IFRAME") {
        e.preventDefault();
      }
    };

    // 4. Advanced Keyboard Shortcut Blocking
    const handleKeyDown = (e) => {
      // F12, Ctrl+Shift+I, J, C, U, S, P
      const forbiddenKeys = [123, 73, 74, 67, 85, 83, 80];
      if (
        forbiddenKeys.includes(e.keyCode) || 
        (e.ctrlKey && forbiddenKeys.includes(e.keyCode)) ||
        (e.ctrlKey && e.shiftKey && [73, 74, 67].includes(e.keyCode))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 5. Extreme DevTools Detection (Disruptive)
    const devToolsCheck = setInterval(() => {
      // The debugger trap
      (function() {
        (function a() {
          try {
            (function b(i) {
              if (("" + i / i).length !== 1 || i % 20 === 0) {
                (function() {}.constructor("debugger")());
              } else {
                debugger;
              }
              b(++i);
            })(0);
          } catch (e) {
            setTimeout(a, 5000);
          }
        })();
      })();
    }, 500);

    // 6. Inject Ultra-Aggressive CSS
    const style = document.createElement("style");
    style.innerHTML = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-user-drag: none !important;
        user-drag: none !important;
        -webkit-touch-callout: none !important;
      }
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      /* Prevent iframe selection/interaction if needed */
      iframe { pointer-events: auto; }
    `;
    document.head.appendChild(style);

    // Attach listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
      clearInterval(devToolsCheck);
      document.head.removeChild(style);
    };
  }, []);

  return null;
}
