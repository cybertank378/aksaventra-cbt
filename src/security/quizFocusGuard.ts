/**
 * Aksaventra CBT Quiz Focus & Anti-Cheating Browser Guard
 * Handles fullscreen enforcement, shortcut suppression, context menu blocking,
 * and focus violation detection.
 */

export interface ExamFocusListenerOptions {
  onViolation?: (
    type: "TAB_BLUR" | "FULLSCREEN_EXIT" | "DEVTOOLS_SHORTCUT",
  ) => void;
  blockContextMenu?: boolean;
  blockCopyPaste?: boolean;
  enforceFullscreen?: boolean;
}

/**
 * Checks whether keyboard shortcut should be ignored by the exam navigation handler
 * (e.g. When the student is typing into a text field, textarea, or contentEditable element).
 */
export function shouldIgnoreExamShortcut(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toUpperCase();
  const isInputOrTextArea =
    tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
  const isEditable =
    target.isContentEditable ||
    target.contentEditable === "true" ||
    target.getAttribute("contenteditable") === "true";

  return isInputOrTextArea || isEditable;
}

/**
 * Checks if a keyboard event matches forbidden DevTools inspection or browser shortcuts.
 */
export function isBlockedDevToolsOrCopyShortcut(
  event: KeyboardEvent,
  blockCopyPaste = false,
): boolean {
  const key = event.key.toUpperCase();
  const code = event.code;
  const isCtrlOrCmd = event.ctrlKey || event.metaKey;
  const isShift = event.shiftKey;

  // 1. DevTools F12
  if (key === "F12" || code === "F12") {
    return true;
  }

  // 2. DevTools combos: Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
  if (isCtrlOrCmd && isShift && (key === "I" || key === "J" || key === "C")) {
    return true;
  }

  // 3. View Source (Ctrl+U), Save Page (Ctrl+S), Print (Ctrl+P)
  if (isCtrlOrCmd && (key === "U" || key === "S" || key === "P")) {
    return true;
  }

  // 4. Strict exam copy/paste protection if enabled
  if (
    blockCopyPaste &&
    isCtrlOrCmd &&
    (key === "C" || key === "V" || key === "X" || key === "A")
  ) {
    return true;
  }

  return false;
}

/**
 * Safely requests fullscreen mode on a given HTML element or document.documentElement.
 */
export async function enterExamFullscreenSafe(
  element?: HTMLElement,
): Promise<boolean> {
  if (typeof document === "undefined") return false;

  const target = element || document.documentElement;

  try {
    if (target.requestFullscreen) {
      await target.requestFullscreen();
      return true;
    }

    // Vendor prefixes
    const vendorTarget = target as unknown as {
      webkitRequestFullscreen?: () => Promise<void>;
      mozRequestFullScreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };

    if (vendorTarget.webkitRequestFullscreen) {
      await vendorTarget.webkitRequestFullscreen();
      return true;
    }
    if (vendorTarget.mozRequestFullScreen) {
      await vendorTarget.mozRequestFullScreen();
      return true;
    }
    if (vendorTarget.msRequestFullscreen) {
      await vendorTarget.msRequestFullscreen();
      return true;
    }

    return false;
  } catch (_err) {
    return false;
  }
}

/**
 * Safely exits fullscreen mode.
 */
export async function exitExamFullscreenSafe(): Promise<boolean> {
  if (typeof document === "undefined" || !isExamFullscreenActive())
    return false;

  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
      return true;
    }

    const vendorDoc = document as unknown as {
      webkitExitFullscreen?: () => Promise<void>;
      mozCancelFullScreen?: () => Promise<void>;
      msExitFullscreen?: () => Promise<void>;
    };

    if (vendorDoc.webkitExitFullscreen) {
      await vendorDoc.webkitExitFullscreen();
      return true;
    }
    if (vendorDoc.mozCancelFullScreen) {
      await vendorDoc.mozCancelFullScreen();
      return true;
    }
    if (vendorDoc.msExitFullscreen) {
      await vendorDoc.msExitFullscreen();
      return true;
    }

    return false;
  } catch (_err) {
    return false;
  }
}

/**
 * Checks whether browser is currently in fullscreen mode.
 */
export function isExamFullscreenActive(): boolean {
  if (typeof document === "undefined") return false;

  const vendorDoc = document as unknown as {
    fullscreenElement?: Element;
    webkitFullscreenElement?: Element;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
  };

  return Boolean(
    vendorDoc.fullscreenElement ||
      vendorDoc.webkitFullscreenElement ||
      vendorDoc.mozFullScreenElement ||
      vendorDoc.msFullscreenElement,
  );
}

/**
 * Attaches browser focus, blur, fullscreen, and keyboard event listeners for exam protection.
 * Returns an unbind cleanup function.
 */
export function attachExamFocusListeners(
  options: ExamFocusListenerOptions = {},
): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  const {
    onViolation,
    blockContextMenu = true,
    blockCopyPaste = true,
    enforceFullscreen = true,
  } = options;

  const handleBlur = () => {
    onViolation?.("TAB_BLUR");
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      onViolation?.("TAB_BLUR");
    }
  };

  const handleFullscreenChange = () => {
    if (enforceFullscreen && !isExamFullscreenActive()) {
      onViolation?.("FULLSCREEN_EXIT");
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    if (blockContextMenu) {
      e.preventDefault();
      return false;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isBlockedDevToolsOrCopyShortcut(e, blockCopyPaste)) {
      e.preventDefault();
      e.stopPropagation();
      onViolation?.("DEVTOOLS_SHORTCUT");
      return false;
    }
  };

  window.addEventListener("blur", handleBlur);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("contextmenu", handleContextMenu);
  window.addEventListener("keydown", handleKeyDown, true);

  return () => {
    window.removeEventListener("blur", handleBlur);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    document.removeEventListener(
      "webkitfullscreenchange",
      handleFullscreenChange,
    );
    document.removeEventListener("contextmenu", handleContextMenu);
    window.removeEventListener("keydown", handleKeyDown, true);
  };
}
