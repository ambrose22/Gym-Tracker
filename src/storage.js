/**
 * Storage adapter — drop-in replacement for the artifact's window.storage.
 *
 * The original used:
 *   await window.storage.get(key)   → { key, value } or null
 *   await window.storage.set(key, value)
 *
 * This wraps localStorage behind the same async interface so the component
 * logic barely changes. JSON parse failures return null instead of crashing.
 */

const storage = {
  async get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return { key, value: raw };
    } catch {
      // Private browsing or storage full — treat as empty
      return null;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage full — the caller's catch block shows "Save failed"
      throw new Error("localStorage write failed");
    }
  },
};

export default storage;
