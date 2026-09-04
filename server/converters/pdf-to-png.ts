import { pdfToPng } from "pdf-to-png-converter";
import type { Converter } from "./types.js";

const converter: Converter = {
  id: "pdf-to-png",
  from: "pdf",
  to: "png",
  label: "PDF → PNG (first page)",
  async convert(input: Buffer): Promise<Buffer> {
    const arrayBuffer = input.buffer.slice(
      input.byteOffset,
      input.byteOffset + input.byteLength
    ) as ArrayBuffer;
    const pages = await pdfToPng(arrayBuffer, {
      pagesToProcess: [1],
      viewportScale: 2.0,
    });
    const content = pages[0]?.content;
    if (!content) {
      throw new Error("pdf-to-png: no pages rendered from input PDF");
    }
    return content;
  },
};

export default converter;
