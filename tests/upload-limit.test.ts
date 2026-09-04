import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// module-level maxUploadMb is read from env at import time, so this needs
// its own env + fresh import, isolated from the shared app in e2e.test.ts.
process.env.MAX_UPLOAD_MB = "1";

let app: import("express").Express;

beforeAll(async () => {
  const { buildRegistry } = await import("../server/registry.js");
  const { createApp } = await import("../server/index.js");
  const registry = await buildRegistry(
    path.join(__dirname, "..", "server", "converters")
  );
  app = createApp(registry);
});

describe("POST /api/convert - upload size limit", () => {
  it("returns 413 with clean JSON when the file exceeds MAX_UPLOAD_MB", async () => {
    const tooBig = Buffer.alloc(2 * 1024 * 1024, 1);
    const res = await request(app)
      .post("/api/convert")
      .field("from", "jpg")
      .field("to", "png")
      .attach("file", tooBig, "big.jpg");

    expect(res.status).toBe(413);
    expect(res.body.error).toMatch(/exceeds 1MB/);
  });
});
