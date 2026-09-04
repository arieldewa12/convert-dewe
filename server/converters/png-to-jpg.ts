import sharp from "sharp";
import type { Converter } from "./types.js";

const converter: Converter = {
  id: "png-to-jpg",
  from: "png",
  to: "jpg",
  label: "PNG → JPG",
  async convert(input: Buffer): Promise<Buffer> {
    return sharp(input).jpeg().toBuffer();
  },
};

export default converter;
