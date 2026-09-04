import sharp from "sharp";
import type { Converter } from "./types.js";

const converter: Converter = {
  id: "jpg-to-png",
  from: "jpg",
  to: "png",
  label: "JPG → PNG",
  async convert(input: Buffer): Promise<Buffer> {
    return sharp(input).png().toBuffer();
  },
};

export default converter;
