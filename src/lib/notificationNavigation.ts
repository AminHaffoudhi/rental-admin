export function equipmentIdFromNotification(input: {
  id: string;
  type: string;
  url?: string;
}): string | null {
  const fromId = input.id.match(/^equipment-(?:pending|approved|rejected)-(.+)$/)?.[1];
  if (fromId) {
    return fromId;
  }
  if (!input.url) {
    return null;
  }
  try {
    const u = new URL(input.url, window.location.origin);
    return u.searchParams.get("highlight");
  } catch {
    return null;
  }
}

export function notificationTargetPath(url: string, equipmentId?: string | null): string {
  try {
    const target = new URL(url, window.location.origin);
    if (equipmentId && !target.searchParams.has("highlight")) {
      target.searchParams.set("highlight", equipmentId);
    }
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    if (!equipmentId) {
      return url.startsWith("/") ? url : `/${url}`;
    }
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}highlight=${encodeURIComponent(equipmentId)}`;
  }
}
