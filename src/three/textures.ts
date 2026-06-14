import * as THREE from "three";

const cache = new Map<string, THREE.CanvasTexture>();

function rounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shade(hex: string, amt: number): string {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, amt);
  return `#${c.getHexString()}`;
}

/** Imagen placeholder: degradado de la carrera + etiqueta. */
export function makeImageTexture(
  label: string,
  color: string,
  accent: string,
  key: string
): THREE.CanvasTexture {
  if (cache.has(key)) return cache.get(key)!;
  const w = 1024;
  const h = 640;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, shade(color, -0.18));
  g.addColorStop(1, shade(color, 0.12));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // patrón de puntos
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let y = 40; y < h; y += 46) {
    for (let x = 40; x < w; x += 46) {
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // arco decorativo
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(w - 120, h - 90, 200, Math.PI, Math.PI * 1.5);
  ctx.stroke();

  // marco
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  rounded(ctx, 24, 24, w - 48, h - 48, 28);
  ctx.stroke();

  // etiqueta
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "600 56px Inter, sans-serif";
  ctx.textBaseline = "middle";
  wrapText(ctx, label, 70, h / 2, w - 180, 64);

  // chip "imagen demo"
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  rounded(ctx, 60, 60, 250, 56, 28);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.font = "700 26px Inter, sans-serif";
  ctx.fillText("IMAGEN DEMO", 90, 89);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

/** Pantalla de video: thumbnail estilizado con botón play. */
export function makeVideoTexture(
  title: string,
  color: string,
  key: string
): THREE.CanvasTexture {
  if (cache.has(key)) return cache.get(key)!;
  const w = 1024;
  const h = 576;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#05070f");
  g.addColorStop(1, shade(color, -0.25));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // líneas tipo "scanline"
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let y = 0; y < h; y += 6) ctx.fillRect(0, y, w, 2);

  // botón play
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 - 20, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 24, h / 2 - 56);
  ctx.lineTo(w / 2 - 24, h / 2 + 16);
  ctx.lineTo(w / 2 + 40, h / 2 - 20);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "700 40px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Ver video del proyecto", w / 2, h / 2 + 110);
  ctx.font = "500 28px Inter, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  wrapTextCentered(ctx, title, w / 2, h / 2 + 160, w - 160, 34);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

/** Banner de carrera (texto grande sobre color). */
export function makeBannerTexture(
  text: string,
  color: string,
  accent: string,
  key: string
): THREE.CanvasTexture {
  if (cache.has(key)) return cache.get(key)!;
  const w = 2048;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, shade(color, -0.2));
  g.addColorStop(0.5, color);
  g.addColorStop(1, shade(color, -0.2));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = accent;
  ctx.fillRect(0, h - 14, w, 14);
  ctx.fillRect(0, 0, w, 8);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 110px Sora, Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), w / 2, h / 2 + 6);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

/** Cartel de stand con título de proyecto y carrera. */
export function makeSignTexture(
  title: string,
  carrera: string,
  color: string,
  accent: string,
  key: string
): THREE.CanvasTexture {
  if (cache.has(key)) return cache.get(key)!;
  const w = 1024;
  const h = 384;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#0b1224";
  rounded(ctx, 0, 0, w, h, 36);
  ctx.fill();

  ctx.fillStyle = color;
  rounded(ctx, 0, 0, 18, h, 8);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.fillStyle = accent;
  ctx.font = "700 34px Inter, sans-serif";
  ctx.fillText(carrera.toUpperCase(), 60, 80);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 70px Sora, Inter, sans-serif";
  wrapText(ctx, title, 60, 190, w - 110, 78);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, yy);
      line = word + " ";
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, yy);
}

function wrapTextCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, yy);
      line = word + " ";
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, yy);
}
