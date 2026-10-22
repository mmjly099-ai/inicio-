const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
function makeCrcTable() {
  let c;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  return crcTable;
}
const crcTable = makeCrcTable();

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createPNG(width, height, getPixel) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // No interlace

  const ihdrChunk = Buffer.concat([
    Buffer.from('IHDR'),
    ihdrData
  ]);
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(crc32(ihdrChunk), 0);
  const ihdr = Buffer.concat([
    Buffer.alloc(4),
    ihdrChunk,
    ihdrCrc
  ]);
  ihdr.writeUInt32BE(13, 0);

  // IDAT
  const idatChunk = Buffer.concat([
    Buffer.from('IDAT'),
    compressedData
  ]);
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(idatChunk), 0);
  const idat = Buffer.concat([
    Buffer.alloc(4),
    idatChunk,
    idatCrc
  ]);
  idat.writeUInt32BE(compressedData.length, 0);

  // IEND
  const iendChunk = Buffer.from('IEND');
  const iendCrc = Buffer.alloc(4);
  iendCrc.writeUInt32BE(crc32(iendChunk), 0);
  const iend = Buffer.concat([
    Buffer.alloc(4),
    iendChunk,
    iendCrc
  ]);
  iend.writeUInt32BE(0, 0);

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Draw TOP STORE icon pixel
function getIconPixel(x, y, w, h, isMaskable = false) {
  // Normalize coords to -1 .. 1
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background color #0F172A (slate-900)
  const bgR = 15, bgG = 23, bgB = 42, bgA = 255;
  // Gold accent #F59E0B (amber-500)
  const goldR = 245, goldG = 158, goldB = 11, goldA = 255;
  // White #FFFFFF
  const whiteR = 255, whiteG = 255, whiteB = 255, whiteA = 255;
  // Blue accent #2563EB (blue-600)
  const blueR = 37, blueG = 99, blueB = 235, blueA = 255;

  const scale = isMaskable ? 0.72 : 0.88;
  const sx = nx / scale;
  const sy = ny / scale;

  // Outer rounded square border or circle
  const roundRadius = 0.88;
  const inOuterCard = Math.abs(sx) <= roundRadius && Math.abs(sy) <= roundRadius;

  // Let's create a badge background
  let r = bgR, g = bgG, b = bgB, a = 255;

  // Subtle gradient on background
  const grad = (ny + 1) * 0.15;
  r = Math.min(255, Math.floor(r + grad * 20));
  g = Math.min(255, Math.floor(g + grad * 25));
  b = Math.min(255, Math.floor(b + grad * 50));

  // Gold circular badge inside
  const badgeDist = Math.sqrt(sx * sx + (sy + 0.05) * (sy + 0.05));
  if (badgeDist >= 0.72 && badgeDist <= 0.78) {
    // Outer golden ring
    return [goldR, goldG, goldB, 255];
  }

  // Draw Shopping Bag / Store glyph
  // Body of the bag: sx in [-0.42, 0.42], sy in [-0.15, 0.52]
  const bagLeft = -0.42;
  const bagRight = 0.42;
  const bagTop = -0.12;
  const bagBottom = 0.52;

  // Handle of bag: arc on top from -0.22 to 0.22, height around -0.38
  const handleX = sx;
  const handleY = sy - (-0.12);
  const handleDist = Math.sqrt(handleX * handleX + (handleY * 1.5) * (handleY * 1.5));
  if (sy <= bagTop && handleDist >= 0.18 && handleDist <= 0.26) {
    return [goldR, goldG, goldB, 255];
  }

  if (sx >= bagLeft && sx <= bagRight && sy >= bagTop && sy <= bagBottom) {
    // Border of bag
    const isBagBorder = sx <= bagLeft + 0.04 || sx >= bagRight - 0.04 || sy >= bagBottom - 0.04 || sy <= bagTop + 0.04;
    if (isBagBorder) {
      return [goldR, goldG, goldB, 255];
    }

    // Inside the bag: Bar chart / Analytics growth bars
    // Bar 1 (left)
    if (sx >= -0.28 && sx <= -0.16 && sy >= 0.15 && sy <= 0.42) {
      return [goldR, goldG, goldB, 255];
    }
    // Bar 2 (center)
    if (sx >= -0.06 && sx <= 0.06 && sy >= 0.00 && sy <= 0.42) {
      return [blueR, blueG, blueB, 255];
    }
    // Bar 3 (right, highest)
    if (sx >= 0.16 && sx <= 0.28 && sy >= -0.05 && sy <= 0.42) {
      return [goldR, goldG, goldB, 255];
    }

    // Bag fill
    return [24, 34, 58, 255];
  }

  // Crown / Stars accent on top
  if (Math.abs(sx) <= 0.35 && sy >= -0.62 && sy <= -0.45) {
    const starDistCenter = Math.sqrt(sx * sx + (sy + 0.54) * (sy + 0.54));
    if (starDistCenter <= 0.055) {
      return [goldR, goldG, goldB, 255];
    }
    const starDistLeft = Math.sqrt((sx + 0.22) * (sx + 0.22) + (sy + 0.52) * (sy + 0.52));
    if (starDistLeft <= 0.04) {
      return [goldR, goldG, goldB, 255];
    }
    const starDistRight = Math.sqrt((sx - 0.22) * (sx - 0.22) + (sy + 0.52) * (sy + 0.52));
    if (starDistRight <= 0.04) {
      return [goldR, goldG, goldB, 255];
    }
  }

  return [r, g, b, a];
}

const publicDir = path.resolve(__dirname, '../public');

console.log('Generating PNG icons in:', publicDir);

// 192x192
const pwa192 = createPNG(192, 192, (x, y, w, h) => getIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

// 512x512
const pwa512 = createPNG(512, 512, (x, y, w, h) => getIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

// 512x512 maskable (with 15% safe padding)
const pwaMaskable512 = createPNG(512, 512, (x, y, w, h) => getIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable512);

// 180x180 apple-touch-icon
const appleTouch = createPNG(180, 180, (x, y, w, h) => getIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

// favicon.ico fallback
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), appleTouch);

console.log('Generated all PWA icon assets successfully.');
