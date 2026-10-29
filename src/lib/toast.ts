export type ToastKind = 'success' | 'error' | 'info';
export type ToastMessage = { id: number; message: string; kind: ToastKind };

type Listener = (t: ToastMessage) => void;
const listeners = new Set<Listener>();
let nextId = 1;

/** Cross-platform toast (the previous app only toasted on Android). Safe to call from anywhere. */
export function showToast(message: string, kind: ToastKind = 'info') {
  const t = { id: nextId++, message, kind };
  listeners.forEach((l) => l(t));
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
