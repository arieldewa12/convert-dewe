# Converter of All

A local, open-source file converter. Runs entirely on your machine —
your files are never uploaded anywhere.

## Why this exists

Online file converters are convenient, but every file you upload to one
leaves your machine and lands on someone else's server — you have no
idea how long it's kept, who can see it, or what it's used for. For
personal or private files (IDs, contracts, photos, anything you'd
rather not hand to a random website), that's a real risk, not a
theoretical one.

Converter of All solves this by running the whole thing locally: no
upload, no server you don't control, no data leaving your machine.
If a file matters enough that you'd think twice before uploading it
somewhere, it belongs in a local/offline tool like this one.

## Run locally

```bash
npm install
npm run dev
```

Open http://127.0.0.1:3000. Converters are grouped into sections (Image,
Document, ...) — pick a card for the conversion you want, then drop a
matching file and hit Convert.

## What's supported today

- JPG ↔ PNG
- PNG ↔ WebP
- PNG → PDF
- PDF → PNG (first page)
- HEIC → PDF

More formats are added via a plugin system — see [CONTRIBUTING.md](./CONTRIBUTING.md)
to add your own.

## Why local-only

Everything happens in this one Node process. There are no outbound
network calls during conversion, and the server binds to `127.0.0.1`
only. Uploads are handled entirely in memory (`multer.memoryStorage()`)
and converted in memory — the file is never written to disk at any
point, which is a stronger guarantee than a temp file that gets cleaned
up after the fact.

## Testing

```bash
npm test
```
