interface NotificationPersistState {
  readIds: string[];
  dismissedIds: string[];
}

const STORAGE_KEY = "admin_notification_state";

function loadRaw(): NotificationPersistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { readIds: [], dismissedIds: [] };
    }
    const parsed = JSON.parse(raw) as NotificationPersistState;
    return {
      readIds: Array.isArray(parsed.readIds) ? parsed.readIds : [],
      dismissedIds: Array.isArray(parsed.dismissedIds) ? parsed.dismissedIds : [],
    };
  } catch {
    return { readIds: [], dismissedIds: [] };
  }
}

function saveRaw(state: NotificationPersistState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export interface PersistedNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  url?: string;
  timestamp: Date;
  read: boolean;
}

export function applyNotificationState(list: PersistedNotification[]): PersistedNotification[] {
  const { readIds, dismissedIds } = loadRaw();
  const dismissed = new Set(dismissedIds);
  const read = new Set(readIds);
  return list
    .filter((n) => !dismissed.has(n.id))
    .map((n) => ({ ...n, read: n.read || read.has(n.id) }));
}

export function markNotificationRead(id: string): void {
  const state = loadRaw();
  if (!state.readIds.includes(id)) {
    state.readIds = [...state.readIds, id].slice(-200);
    saveRaw(state);
  }
}

export function dismissNotification(id: string): void {
  const state = loadRaw();
  const dismissed = new Set(state.dismissedIds);
  dismissed.add(id);
  state.dismissedIds = [...dismissed].slice(-200);
  saveRaw(state);
}

export function dismissAllNotifications(ids: string[]): void {
  const state = loadRaw();
  const dismissed = new Set([...state.dismissedIds, ...ids]);
  state.dismissedIds = [...dismissed].slice(-200);
  saveRaw(state);
}

export function markAllNotificationsRead(ids: string[]): void {
  const state = loadRaw();
  const read = new Set([...state.readIds, ...ids]);
  state.readIds = [...read].slice(-200);
  saveRaw(state);
}
