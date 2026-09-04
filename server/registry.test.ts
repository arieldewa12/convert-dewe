import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildRegistry, getConverter, listConverters } from "./registry.js";

let dir: string;

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "registry-test-"));

  await writeFile(
    path.join(dir, "good.js"),
    `export default {
      id: "a-to-b",
      from: "a",
      to: "b",
      label: "A -> B",
      async convert(input) { return input; },
    };`
  );

  await writeFile(
    path.join(dir, "duplicate.js"),
    `export default {
      id: "a-to-b-2",
      from: "a",
      to: "b",
      label: "A -> B (dup)",
      async convert(input) { return input; },
    };`
  );

  await writeFile(
    path.join(dir, "broken.js"),
    `throw new Error("boom");`
  );

  await writeFile(
    path.join(dir, "not-a-converter.js"),
    `export default { foo: "bar" };`
  );
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("buildRegistry", () => {
  it("registers a valid converter", async () => {
    const registry = await buildRegistry(dir);
    const conv = getConverter(registry, "a", "b");
    expect(conv?.id).toBe("a-to-b");
  });

  it("keeps the first converter on a duplicate from:to pair", async () => {
    const registry = await buildRegistry(dir);
    expect(registry.size).toBe(1);
  });

  it("skips files that throw on load without crashing", async () => {
    const registry = await buildRegistry(dir);
    expect(getConverter(registry, "a", "b")).toBeDefined();
  });

  it("skips files whose default export is not a valid Converter", async () => {
    const registry = await buildRegistry(dir);
    const list = listConverters(registry);
    expect(list.some((c) => c.id === undefined)).toBe(false);
  });

  it("lists converters with id, from, to, label", async () => {
    const registry = await buildRegistry(dir);
    const list = listConverters(registry);
    expect(list).toEqual([
      { id: "a-to-b", from: "a", to: "b", label: "A -> B" },
    ]);
  });
});
