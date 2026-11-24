export function timeAgo(iso) {
  // The backend sends UTC times without a "Z", so add it before parsing
  const date = new Date(/Z|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + "Z");
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}