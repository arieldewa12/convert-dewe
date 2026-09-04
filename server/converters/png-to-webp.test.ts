import { describe, it, expect } from "vitest";
import sharp from "sharp";
import converter from "./png-to-webp.js";

describe("png-to-webp", () => {
  it("converts a PNG buffer to a valid WebP buffer", async () => {
    const pngInput = await sharp({
      create: {
        width: 4,
        height: 4,
        channels: 3,
        background: { r: 0, g: 0, b: 255 },
      },
    })
      .png()
      .toBuffer();

    const output = await converter.convert(pngInput);

    expect(output.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(output.subarray(8, 12).toString("ascii")).toBe("WEBP");
  });

  it("exposes the correct plugin metadata", () => {
    expect(converter.from).toBe("png");
    expect(converter.to).toBe("webp");
  });
});
