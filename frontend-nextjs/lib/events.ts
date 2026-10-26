// Cross-tab and intra-tab synchronization for real-time component updates

export const COMPONENT_SYNC_CHANNEL = "uithings-components-sync";

type ComponentSyncCallback = () => void;
const listeners = new Set<ComponentSyncCallback>();

let channel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    channel = new BroadcastChannel(COMPONENT_SYNC_CHANNEL);
    channel.onmessage = (event) => {
      if (event?.data?.type === "COMPONENTS_UPDATED") {
        listeners.forEach((callback) => {
          try {
            callback();
          } catch (err) {
            console.error("Component sync callback error:", err);
          }
        });
      }
    };
  } catch (e) {
    console.warn("BroadcastChannel not available:", e);
  }
}

// Fallback to storage event for cross-tab notifications if BroadcastChannel is restricted
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "uithings_components_updated") {
      listeners.forEach((callback) => {
        try {
          callback();
        } catch (err) {
          console.error("Component sync callback error:", err);
        }
      });
    }
  });
}

/**
 * Call this function whenever a component is created, edited, deleted,
 * or has its status/visibility updated in the admin/dashboard panel.
 */
export function broadcastComponentChange() {
  if (typeof window === "undefined") return;

  // 1. Notify listeners in the current tab immediately
  listeners.forEach((callback) => {
    try {
      callback();
    } catch (err) {
      console.error("Component sync callback error:", err);
    }
  });

  // 2. Broadcast across tabs via BroadcastChannel
  if (channel) {
    try {
      channel.postMessage({ type: "COMPONENTS_UPDATED", timestamp: Date.now() });
    } catch {}
  }

  // 3. Fallback broadcast across tabs via localStorage
  try {
    localStorage.setItem("uithings_components_updated", Date.now().toString());
  } catch {}
}

/**
 * Subscribe to real-time component changes from any tab or panel.
 */
export function subscribeToComponentChanges(callback: ComponentSyncCallback) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
