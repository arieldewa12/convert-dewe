import express from "express";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRegistry, getConverter, listConverters } from "./registry.js";
import type { Converter } from "./converters/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ponytail: minimal extension->MIME map, extend if a converter emits a new format
const mimeTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  pdf: "application/pdf",
};
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB ?? 50);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxUploadMb * 1024 * 1024 },
});

// ponytail: basic sanity check per spec; extend if a converter's `from` needs one
const expectedMimeTypes: Record<string, string[]> = {
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
  pdf: ["application/pdf"],
  heic: ["image/heic", "image/heif", "application/octet-stream"], // browsers are inconsistent about HEIC's mimetype
};

export function createApp(registry: Map<string, Converter>) {
  const app = express();

  // resolve from cwd, not __dirname: after build, __dirname is dist/server
  // but public/ is never compiled there — both npm run dev and npm start
  // are invoked from the repo root.
  app.use(express.static(path.resolve("public")));

  app.get("/api/formats", (_req, res) => {
    res.json(listConverters(registry));
  });

  app.post("/api/convert", upload.single("file"), async (req, res) => {
    const { from, to } = req.body as { from?: string; to?: string };
    const file = req.file;

    if (!from || !to || !file) {
      res.status(400).json({ error: "from, to, and file are required" });
      return;
    }

    const expected = expectedMimeTypes[from];
    if (expected && file.mimetype && !expected.includes(file.mimetype)) {
      res.status(400).json({
        error: `file does not look like a .${from} file (got ${file.mimetype})`,
      });
      return;
    }

    const converter = getConverter(registry, from, to);
    if (!converter) {
      res.status(400).json({ error: `no converter for ${from} -> ${to}` });
      return;
    }

    try {
      const output = await converter.convert(file.buffer);
      res.setHeader("Content-Type", mimeTypes[to] ?? `application/${to}`);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="converted.${to}"`
      );
      res.send(output);
    } catch (err) {
      res.status(422).json({
        error: `conversion failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      });
    }
  });

  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _next: express.NextFunction
    ) => {
      if (err instanceof multer.MulterError) {
        res.status(413).json({ error: `file exceeds ${maxUploadMb}MB` });
        return;
      }
      res.status(500).json({ error: "internal error" });
    }
  );

  return app;
}

async function main() {
  const registry = await buildRegistry(path.join(__dirname, "converters"));
  const app = createApp(registry);
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, "127.0.0.1", () => {
    console.log(`Converter of All running at http://127.0.0.1:${port}`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
