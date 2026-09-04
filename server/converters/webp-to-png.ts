import sharp from "sharp";
import type { Converter } from "./types.js";

const converter: Converter = {
  id: "webp-to-png",
  from: "webp",
  to: "png",
  label: "WebP → PNG",
  async convert(input: Buffer): Promise<Buffer> {
    return sharp(input).png().toBuffer();
  },
};

export default converter;
