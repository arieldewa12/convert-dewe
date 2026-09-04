import heicConvert from "heic-convert";
import { PDFDocument } from "pdf-lib";
import type { Converter } from "./types.js";

const converter: Converter = {
  id: "heic-to-pdf",
  from: "heic",
  to: "pdf",
  label: "HEIC → PDF",
  async convert(input: Buffer): Promise<Buffer> {
    const jpegBuffer = await heicConvert({
      buffer: input,
      format: "JPEG",
      quality: 0.9,
    });

    // pdf-lib's embedJpg reads straight off the ArrayBuffer without
    // respecting byteOffset, so a pooled/sliced Buffer (as heic-convert
    // returns for small images) gets misread. Copy to a fresh, offset-0
    // Uint8Array first.
    const jpegBytes = new Uint8Array(jpegBuffer);

    const doc = await PDFDocument.create();
    const image = await doc.embedJpg(jpegBytes);
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
    const bytes = await doc.save();
    return Buffer.from(bytes);
  },
};

export default converter;
