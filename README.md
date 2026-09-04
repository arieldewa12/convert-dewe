# Converter of All

A local, open-source file converter. Runs entirely on your machine —
your files are never uploaded anywhere.

## Run locally

```bash
npm install
npm run dev
```

Open http://127.0.0.1:3000, drop a file, pick an output format, convert.

## What's supported today

- JPG ↔ PNG
- PNG ↔ WebP
- PNG → PDF
- PDF → PNG (first page)

More formats are added via a plugin system — see [CONTRIBUTING.md](./CONTRIBUTING.md)
to add your own.

## Why local-only

Everything happens in this one Node process. There are no outbound
network calls during conversion, and the server binds to `127.0.0.1`
only. Uploaded and converted files live in `server/tmp/` only for the
duration of a request and are deleted immediately after.

## Testing

```bash
npm test
```
