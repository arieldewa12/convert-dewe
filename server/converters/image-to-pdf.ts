import { PDFDocument } from "pdf-lib";
import type { Converter } from "./types.js";

const converter: Converter = {
  id: "png-to-pdf",
  from: "png",
  to: "pdf",
  label: "PNG → PDF",
  async convert(input: Buffer): Promise<Buffer> {
    const doc = await PDFDocument.create();
    const image = await doc.embedPng(input);
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
