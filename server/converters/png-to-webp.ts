import sharp from "sharp";
import type { Converter } from "./types.js";

const converter: Converter = {
  id: "png-to-webp",
  from: "png",
  to: "webp",
  label: "PNG → WebP",
  async convert(input: Buffer): Promise<Buffer> {
    return sharp(input).webp().toBuffer();
  },
};

export default converter;
