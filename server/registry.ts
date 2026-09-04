import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Converter } from "./converters/types.js";

function isValidConverter(value: unknown): value is Converter {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Partial<Converter>;
  return (
    typeof c.id === "string" &&
    typeof c.from === "string" &&
    typeof c.to === "string" &&
    typeof c.label === "string" &&
    typeof c.convert === "function"
  );
}

export async function buildRegistry(
  dir: string
): Promise<Map<string, Converter>> {
  const registry = new Map<string, Converter>();
  const rawEntries = await readdir(dir);

  const candidates = rawEntries.filter((entry) => {
    if (!entry.endsWith(".js") && !entry.endsWith(".ts")) return false;
    if (entry.endsWith(".test.ts") || entry.endsWith(".test.js")) return false;
    if (entry === "types.ts" || entry === "types.js") return false;
    return true;
  });

  // readdir order is filesystem-dependent, not creation order; sort by
  // birth/mtime so "first" (for duplicate from:to handling) is deterministic.
  const withTimes = await Promise.all(
    candidates.map(async (entry) => {
      try {
        const s = await stat(path.join(dir, entry));
        const time =
          Number.isFinite(s.birthtimeMs) && s.birthtimeMs > 0
            ? s.birthtimeMs
            : s.mtimeMs;
        return { entry, time };
      } catch (err) {
        console.warn(`[registry] failed to stat ${entry}:`, err);
        return { entry, time: Infinity };
      }
    })
  );
  withTimes.sort((a, b) => a.time - b.time);
  const entries = withTimes.map(({ entry }) => entry);

  for (const entry of entries) {
    const fileUrl = pathToFileURL(path.join(dir, entry)).href;

    try {
      const mod = await import(fileUrl);
      const candidate = mod.default;

      if (!isValidConverter(candidate)) {
        console.warn(`[registry] skipped ${entry}: invalid Converter shape`);
        continue;
      }

      const key = `${candidate.from}:${candidate.to}`;
      if (registry.has(key)) {
        console.warn(
          `[registry] skipped ${entry}: duplicate converter for ${key}`
        );
        continue;
      }

      registry.set(key, candidate);
    } catch (err) {
      console.warn(`[registry] failed to load ${entry}:`, err);
    }
  }

  return registry;
}

// ponytail: just the one real alias gap across the shipped converters
const extensionAliases: Record<string, string> = { jpeg: "jpg" };

export function getConverter(
  registry: Map<string, Converter>,
  from: string,
  to: string
): Converter | undefined {
  const normFrom = extensionAliases[from] ?? from;
  const normTo = extensionAliases[to] ?? to;
  return registry.get(`${normFrom}:${normTo}`);
}

export function listConverters(registry: Map<string, Converter>) {
  return [...registry.values()].map(({ id, from, to, label }) => ({
    id,
    from,
    to,
    label,
  }));
}
