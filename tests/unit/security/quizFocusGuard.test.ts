// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  attachExamFocusListeners,
  enterExamFullscreenSafe,
  exitExamFullscreenSafe,
  isBlockedDevToolsOrCopyShortcut,
  isExamFullscreenActive,
  shouldIgnoreExamShortcut,
} from "@/security/quizFocusGuard";

describe("quizFocusGuard (Exam Focus & Anti-Cheating Guard)", () => {
  describe("shouldIgnoreExamShortcut", () => {
    it("returns true when event target is HTMLInputElement (e.g. short essay)", () => {
      const input = document.createElement("input");
      input.type = "text";
      document.body.appendChild(input);

      expect(shouldIgnoreExamShortcut(input)).toBe(true);

      document.body.removeChild(input);
    });

    it("returns true when target is HTMLTextAreaElement", () => {
      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);

      expect(shouldIgnoreExamShortcut(textarea)).toBe(true);

      document.body.removeChild(textarea);
    });

    it('returns true when target has contentEditable="true"', () => {
      const div = document.createElement("div");
      div.contentEditable = "true";
      document.body.appendChild(div);

      expect(shouldIgnoreExamShortcut(div)).toBe(true);

      document.body.removeChild(div);
    });

    it("returns false when target is normal div, button, or body (so A-E and R work)", () => {
      const button = document.createElement("button");
      const div = document.createElement("div");

      expect(shouldIgnoreExamShortcut(button)).toBe(false);
      expect(shouldIgnoreExamShortcut(div)).toBe(false);
      expect(shouldIgnoreExamShortcut(document.body)).toBe(false);
      expect(shouldIgnoreExamShortcut(null)).toBe(false);
    });
  });

  describe("isBlockedDevToolsOrCopyShortcut", () => {
    it("blocks F12 shortcut", () => {
      const event = new KeyboardEvent("keydown", { key: "F12", code: "F12" });
      expect(isBlockedDevToolsOrCopyShortcut(event)).toBe(true);
    });

    it("blocks DevTools inspect shortcuts: Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C", () => {
      const inspectEvent = new KeyboardEvent("keydown", {
        key: "I",
        ctrlKey: true,
        shiftKey: true,
      });
      const consoleEvent = new KeyboardEvent("keydown", {
        key: "J",
        metaKey: true,
        shiftKey: true,
      });
      const pickerEvent = new KeyboardEvent("keydown", {
        key: "C",
        ctrlKey: true,
        shiftKey: true,
      });

      expect(isBlockedDevToolsOrCopyShortcut(inspectEvent)).toBe(true);
      expect(isBlockedDevToolsOrCopyShortcut(consoleEvent)).toBe(true);
      expect(isBlockedDevToolsOrCopyShortcut(pickerEvent)).toBe(true);
    });

    it("blocks View Source (Ctrl+U), Save (Ctrl+S), Print (Ctrl+P)", () => {
      const viewSourceEvent = new KeyboardEvent("keydown", {
        key: "u",
        ctrlKey: true,
      });
      const saveEvent = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
      });
      const printEvent = new KeyboardEvent("keydown", {
        key: "p",
        ctrlKey: true,
      });

      expect(isBlockedDevToolsOrCopyShortcut(viewSourceEvent)).toBe(true);
      expect(isBlockedDevToolsOrCopyShortcut(saveEvent)).toBe(true);
      expect(isBlockedDevToolsOrCopyShortcut(printEvent)).toBe(true);
    });

    it("blocks Ctrl+C, Ctrl+V, Ctrl+X if blockCopyPaste is enabled", () => {
      const copyEvent = new KeyboardEvent("keydown", {
        key: "c",
        ctrlKey: true,
      });
      const pasteEvent = new KeyboardEvent("keydown", {
        key: "v",
        ctrlKey: true,
      });

      // When blockCopyPaste is true
      expect(isBlockedDevToolsOrCopyShortcut(copyEvent, true)).toBe(true);
      expect(isBlockedDevToolsOrCopyShortcut(pasteEvent, true)).toBe(true);

      // When blockCopyPaste is false
      expect(isBlockedDevToolsOrCopyShortcut(copyEvent, false)).toBe(false);
      expect(isBlockedDevToolsOrCopyShortcut(pasteEvent, false)).toBe(false);
    });

    it("does not block standard exam letters A, B, C, D, E, R when pressed without Ctrl", () => {
      const letterA = new KeyboardEvent("keydown", { key: "a" });
      const letterR = new KeyboardEvent("keydown", { key: "r" });

      expect(isBlockedDevToolsOrCopyShortcut(letterA)).toBe(false);
      expect(isBlockedDevToolsOrCopyShortcut(letterR)).toBe(false);
    });
  });

  describe("fullscreen helpers", () => {
    it("detects fullscreen state properly", () => {
      expect(isExamFullscreenActive()).toBe(false);
    });

    it("enters and exits fullscreen safely", async () => {
      const mockElement = document.createElement("div");
      mockElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
      document.exitFullscreen = vi.fn().mockResolvedValue(undefined);

      const entered = await enterExamFullscreenSafe(mockElement);
      expect(entered).toBe(true);
      expect(mockElement.requestFullscreen).toHaveBeenCalled();

      // Test exit when fullscreen is active
      Object.defineProperty(document, "fullscreenElement", {
        value: mockElement,
        configurable: true,
      });
      const exited = await exitExamFullscreenSafe();
      expect(exited).toBe(true);
      expect(document.exitFullscreen).toHaveBeenCalled();
    });
  });

  describe("attachExamFocusListeners", () => {
    let unbind: (() => void) | null = null;

    afterEach(() => {
      if (unbind) {
        unbind();
        unbind = null;
      }
    });

    it("triggers TAB_BLUR violation on window blur", () => {
      const violationHandler = vi.fn();
      unbind = attachExamFocusListeners({ onViolation: violationHandler });

      window.dispatchEvent(new Event("blur"));
      expect(violationHandler).toHaveBeenCalledWith("TAB_BLUR");
    });

    it("triggers TAB_BLUR on visibilitychange when hidden", () => {
      const violationHandler = vi.fn();
      unbind = attachExamFocusListeners({ onViolation: violationHandler });

      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      });

      document.dispatchEvent(new Event("visibilitychange"));
      expect(violationHandler).toHaveBeenCalledWith("TAB_BLUR");
    });

    it("blocks context menu (right click)", () => {
      unbind = attachExamFocusListeners({ blockContextMenu: true });

      const contextMenuEvent = new MouseEvent("contextmenu", {
        cancelable: true,
      });
      document.dispatchEvent(contextMenuEvent);

      expect(contextMenuEvent.defaultPrevented).toBe(true);
    });

    it("intercepts blocked shortcuts and triggers DEVTOOLS_SHORTCUT", () => {
      const violationHandler = vi.fn();
      unbind = attachExamFocusListeners({
        onViolation: violationHandler,
        blockCopyPaste: true,
      });

      const devtoolsEvent = new KeyboardEvent("keydown", {
        key: "F12",
        code: "F12",
        cancelable: true,
      });
      window.dispatchEvent(devtoolsEvent);

      expect(violationHandler).toHaveBeenCalledWith("DEVTOOLS_SHORTCUT");
      expect(devtoolsEvent.defaultPrevented).toBe(true);
    });
  });
});
