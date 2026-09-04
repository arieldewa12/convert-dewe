import { describe, it, expect } from "vitest";
import sharp from "sharp";
import converter from "./webp-to-png.js";

describe("webp-to-png", () => {
  it("converts a WebP buffer to a valid PNG buffer", async () => {
    const webpInput = await sharp({
      create: {
        width: 4,
        height: 4,
        channels: 3,
        background: { r: 255, g: 255, b: 0 },
      },
    })
      .webp()
      .toBuffer();

    const output = await converter.convert(webpInput);

    expect(output.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    );
  });

  it("exposes the correct plugin metadata", () => {
    expect(converter.from).toBe("webp");
    expect(converter.to).toBe("png");
  });
});
