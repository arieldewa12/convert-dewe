# Contributing a new converter

Every converter is one file in `server/converters/` that default-exports
an object matching this shape:

```ts
export interface Converter {
  id: string;       // unique, e.g. "gif-to-png"
  from: string;      // input format, e.g. "gif"
  to: string;        // output format, e.g. "png"
  label: string;      // shown in the UI dropdown, e.g. "GIF → PNG"
  convert(input: Buffer): Promise<Buffer>;
}
```

## Steps

1. Create `server/converters/<from>-to-<to>.ts`.
2. Implement `convert()` — take the input `Buffer`, return the output
   `Buffer`. Use whatever library makes sense (add it to
   `package.json` dependencies).
3. Add `server/converters/<from>-to-<to>.test.ts` with at least one test
   that generates a minimal input in-memory and asserts the output has
   the right file signature.
4. Run `npm test` — your converter is picked up automatically, no
   registration step needed.
5. Run `npm run dev` and confirm your format pair shows up in the UI's
   "to" dropdown once a matching file is dropped.

## Rules

- No network calls inside `convert()` — this project's entire premise
  is that files never leave the machine.
- One `from` → `to` pair per file. If two files declare the same pair,
  only the first one loaded wins (and a warning is logged) — don't
  rely on that; keep pairs unique.
- Keep `convert()` pure: input buffer in, output buffer out. No global
  state; `convert()` must not do any filesystem or network I/O —
  everything happens on the in-memory buffer.
