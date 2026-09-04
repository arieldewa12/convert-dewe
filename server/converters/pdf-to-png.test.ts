import { describe, it, expect } from "vitest";
import { PDFDocument, rgb } from "pdf-lib";
import converter from "./pdf-to-png.js";

describe("pdf-to-png", () => {
  it("renders the first page of a PDF to a PNG buffer", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([50, 50]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      color: rgb(1, 0, 0),
    });
    const pdfInput = Buffer.from(await doc.save());

    const output = await converter.convert(pdfInput);

    expect(output.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    );
  });

  it("exposes the correct plugin metadata", () => {
    expect(converter.from).toBe("pdf");
    expect(converter.to).toBe("png");
  });
});
