import { describe, it, expect } from "vitest";
import sharp from "sharp";
import converter from "./jpg-to-png.js";

describe("jpg-to-png", () => {
  it("converts a JPG buffer to a valid PNG buffer", async () => {
    const jpgInput = await sharp({
      create: {
        width: 4,
        height: 4,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .jpeg()
      .toBuffer();

    const output = await converter.convert(jpgInput);

    expect(output.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    );
  });

  it("exposes the correct plugin metadata", () => {
    expect(converter.from).toBe("jpg");
    expect(converter.to).toBe("png");
  });
});
