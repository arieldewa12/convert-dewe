import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import converter from "./image-to-pdf.js";

describe("image-to-pdf", () => {
  it("converts a PNG buffer into a single-page PDF", async () => {
    const pngInput = await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: { r: 10, g: 20, b: 30 },
      },
    })
      .png()
      .toBuffer();

    const output = await converter.convert(pngInput);

    expect(output.subarray(0, 5).toString("ascii")).toBe("%PDF-");

    const doc = await PDFDocument.load(output);
    expect(doc.getPageCount()).toBe(1);
  });

  it("exposes the correct plugin metadata", () => {
    expect(converter.from).toBe("png");
    expect(converter.to).toBe("pdf");
  });
});
