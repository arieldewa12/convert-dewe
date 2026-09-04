import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import sharp from "sharp";
import { buildRegistry } from "../server/registry.js";
import { createApp } from "../server/index.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  const registry = await buildRegistry(
    path.join(__dirname, "..", "server", "converters")
  );
  app = createApp(registry);
});

describe("GET /api/formats", () => {
  it("lists the registered converters", async () => {
    const res = await request(app).get("/api/formats");
    expect(res.status).toBe(200);
    expect(
      res.body.some((c: { id: string }) => c.id === "jpg-to-png")
    ).toBe(true);
  });
});

describe("POST /api/convert", () => {
  it("converts an uploaded jpg to png", async () => {
    const jpgInput = await sharp({
      create: {
        width: 4,
        height: 4,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .jpeg()
      .toBuffer();

    const res = await request(app)
      .post("/api/convert")
      .field("from", "jpg")
      .field("to", "png")
      .attach("file", jpgInput, "input.jpg");

    expect(res.status).toBe(200);
    expect(res.body.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    );
  });

  it("returns 400 when no converter matches from/to", async () => {
    const res = await request(app)
      .post("/api/convert")
      .field("from", "gif")
      .field("to", "bmp")
      .attach("file", Buffer.from("not a real gif"), "input.gif");

    expect(res.status).toBe(400);
  });

  it("returns 422 when the converter throws on invalid input", async () => {
    const res = await request(app)
      .post("/api/convert")
      .field("from", "jpg")
      .field("to", "png")
      .attach("file", Buffer.from("not a real jpg"), "input.jpg");

    expect(res.status).toBe(422);
  });

  it("returns 400 when the upload's mimetype doesn't match the declared from format", async () => {
    const res = await request(app)
      .post("/api/convert")
      .field("from", "jpg")
      .field("to", "png")
      .attach("file", Buffer.from("hello"), {
        filename: "input.jpg",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/does not look like/);
  });

  it("resolves .jpeg uploads via the jpeg->jpg alias", async () => {
    const jpgInput = await sharp({
      create: {
        width: 4,
        height: 4,
        channels: 3,
        background: { r: 0, g: 255, b: 0 },
      },
    })
      .jpeg()
      .toBuffer();

    const res = await request(app)
      .post("/api/convert")
      .field("from", "jpeg")
      .field("to", "png")
      .attach("file", jpgInput, "input.jpeg");

    expect(res.status).toBe(200);
  });
});
