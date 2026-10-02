export type SearchParams = Record<string, string | string[] | undefined>;

export function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Builds `/path?...` from current params with some keys changed (null/"" removes a key). Resets page on filter changes. */
export function hrefWith(path: string, current: SearchParams, changes: Record<string, string | null>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) {
    const value = first(v);
    if (value) params.set(k, value);
  }
  if (!("page" in changes)) params.delete("page");
  for (const [k, v] of Object.entries(changes)) {
    if (v === null || v === "") params.delete(k);
    else params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
