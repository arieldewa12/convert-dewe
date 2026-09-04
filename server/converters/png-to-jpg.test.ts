import { describe, it, expect } from "vitest";
import sharp from "sharp";
import converter from "./png-to-jpg.js";

describe("png-to-jpg", () => {
  it("converts a PNG buffer to a valid JPG buffer", async () => {
    const pngInput = await sharp({
      create: {
        width: 4,
        height: 4,
        channels: 3,
        background: { r: 0, g: 255, b: 0 },
      },
    })
      .png()
      .toBuffer();

    const output = await converter.convert(pngInput);

    expect(output[0]).toBe(0xff);
    expect(output[1]).toBe(0xd8);
  });

  it("exposes the correct plugin metadata", () => {
    expect(converter.from).toBe("png");
    expect(converter.to).toBe("jpg");
  });
});
