/**
 * Generates PWA PNG icons: dark background (#151A21) with "B1" in amber.
 *
 * This uses Node's built-in zlib to create valid PNGs without any
 * image library. The icons are simple — a solid dark background with
 * the letters "B1" rendered as pre-drawn pixel blocks.
 *
 * Run: node scripts/generate-icons.js
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { deflateSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
mkdirSync(publicDir, { recursive: true });

// Colors
const BG = [0x15, 0x1A, 0x21]; // #151A21
const FG = [0xFF, 0xB4, 0x54]; // #FFB454

// Simple bitmap for "B1" — each row is a string of 0s and 1s.
// This is a blocky pixel-font representation.
const B1_GLYPH = [
  "1111100011",
  "1000010011",
  "1000010011",
  "1111100011",
  "1000010011",
  "1000010011",
  "1111100011",
];
const GLYPH_W = 10;
const GLYPH_H = 7;

function createPNG(size) {
  const pixels = Buffer.alloc(size * size * 3);
  // Fill background
  for (let i = 0; i < size * size; i++) {
    pixels[i * 3] = BG[0];
    pixels[i * 3 + 1] = BG[1];
    pixels[i * 3 + 2] = BG[2];
  }

  // Draw "B1" centered, scaled up
  const scale = Math.floor(size / (GLYPH_W + 4)); // pixel scale factor
  const glyphPxW = GLYPH_W * scale;
  const glyphPxH = GLYPH_H * scale;
  const offsetX = Math.floor((size - glyphPxW) / 2);
  const offsetY = Math.floor((size - glyphPxH) / 2);

  for (let gy = 0; gy < GLYPH_H; gy++) {
    for (let gx = 0; gx < GLYPH_W; gx++) {
      if (B1_GLYPH[gy][gx] === "1") {
        // Fill a scale×scale block
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const px = offsetX + gx * scale + dx;
            const py = offsetY + gy * scale + dy;
            if (px < size && py < size) {
              const idx = (py * size + px) * 3;
              pixels[idx] = FG[0];
              pixels[idx + 1] = FG[1];
              pixels[idx + 2] = FG[2];
            }
          }
        }
      }
    }
  }

  // Build PNG file
  // PNG uses rows prefixed with a filter byte (0 = none)
  const rawData = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    rawData[y * (size * 3 + 1)] = 0; // filter: none
    pixels.copy(rawData, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
  }

  const compressed = deflateSync(rawData);

  // PNG chunks
  function crc32(buf) {
    let c = 0xFFFFFFFF;
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let k = n;
      for (let j = 0; j < 8; j++) k = k & 1 ? 0xEDB88320 ^ (k >>> 1) : k >>> 1;
      table[n] = k;
    }
    for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeAndData = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData));
    return Buffer.concat([len, typeAndData, crc]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);  // width
  ihdr.writeUInt32BE(size, 4);  // height
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 2;   // color type: RGB
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

writeFileSync(join(publicDir, "pwa-192x192.png"), createPNG(192));
writeFileSync(join(publicDir, "pwa-512x512.png"), createPNG(512));

console.log("✓ Generated public/pwa-192x192.png");
console.log("✓ Generated public/pwa-512x512.png");
