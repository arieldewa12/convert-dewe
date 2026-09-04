import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";
import converter from "./heic-to-pdf.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("heic-to-pdf", () => {
  it("converts a HEIC buffer into a single-page PDF", async () => {
    const heicInput = await readFile(
      path.join(__dirname, "fixtures", "sample.heic")
    );

    const output = await converter.convert(heicInput);

    expect(output.subarray(0, 5).toString("ascii")).toBe("%PDF-");

    const doc = await PDFDocument.load(output);
    expect(doc.getPageCount()).toBe(1);
  });

  it("exposes the correct plugin metadata", () => {
    expect(converter.from).toBe("heic");
    expect(converter.to).toBe("pdf");
  });
});
