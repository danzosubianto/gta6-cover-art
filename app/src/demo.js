// Built-in demo scenes, drawn in code.
//
// The studio must show living cover art before the visitor uploads anything
// (and the screenshots are taken from these scenes), so each "photo" here is
// a small painting made with canvas paths: a sunset boulevard, a neon pier
// at night and a palm beach at noon. They are nobody's photographs and no
// game's artwork — just gradients, silhouettes and light, drawn at 1600x1200
// so any panel crop stays sharp.

const W = 1600;
const H = 1200;

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function sky(ctx, stops, w = W, h = H) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, colour] of stops) g.addColorStop(at, colour);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function sun(ctx, x, y, r, colour) {
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.6);
  g.addColorStop(0, colour);
  g.addColorStop(0.35, colour + 'aa');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = colour;
  ctx.fill();
}

// A palm in silhouette: a leaning trunk and a crown of arcing fronds.
function palm(ctx, x, y, h, lean, colour) {
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = h * 0.045;
  ctx.lineCap = 'round';
  const topX = x + lean;
  const topY = y - h;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + lean * 0.3, y - h * 0.6, topX, topY);
  ctx.stroke();
  ctx.lineWidth = h * 0.02;
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (0.08 + (i / 8) * 0.84);
    const len = h * (0.34 + (i % 3) * 0.05);
    const ex = topX + Math.cos(a) * len;
    const ey = topY - Math.sin(a) * len * 0.55 + len * 0.34;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + Math.cos(a) * len * 0.6, topY - Math.sin(a) * len * 0.6, ex, ey);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(topX, topY + h * 0.02, h * 0.035, 0, Math.PI * 2);
  ctx.arc(topX + h * 0.05, topY + h * 0.045, h * 0.028, 0, Math.PI * 2);
  ctx.fill();
}

// A skyline block with a scatter of lit windows. `lit` is the window colour.
function skyline(ctx, baseY, blocks, dark, lit) {
  for (const [x, w, h] of blocks) {
    ctx.fillStyle = dark;
    ctx.fillRect(x, baseY - h, w, h);
    ctx.fillStyle = lit;
    const cols = Math.max(2, Math.floor(w / 34));
    const rows = Math.max(3, Math.floor(h / 44));
    for (let cx = 0; cx < cols; cx++) {
      for (let cy = 0; cy < rows; cy++) {
        // A fixed pattern (not random) so the scene paints the same twice.
        if ((cx * 7 + cy * 11 + x) % 5 < 2) {
          ctx.globalAlpha = 0.5 + ((cx + cy) % 3) * 0.2;
          ctx.fillRect(x + 10 + cx * 34, baseY - h + 14 + cy * 44, 13, 18);
        }
      }
    }
    ctx.globalAlpha = 1;
  }
}

// --- Boulevard Dusk: sunset over a palm-lined avenue ----------------------
function boulevard() {
  const c = canvas(W, H);
  const ctx = c.getContext('2d');
  sky(ctx, [[0, '#2b1055'], [0.34, '#7b2d8b'], [0.58, '#e8447c'], [0.78, '#ff7847'], [0.92, '#ffc44d'], [1, '#3a1c5e']]);
  sun(ctx, W * 0.62, H * 0.66, 120, '#ffd76a');
  // Retro sun bands: darker stripes across the low sun, poster style.
  ctx.fillStyle = 'rgba(43,16,85,0.55)';
  for (let i = 0; i < 4; i++) ctx.fillRect(W * 0.62 - 330, H * 0.66 + 18 + i * 26, 660, 7 + i * 3);

  skyline(ctx, H * 0.78, [[0, 210, 300], [180, 150, 210], [1240, 170, 340], [1400, 200, 250]], '#1c1033', '#ffd76a');
  skyline(ctx, H * 0.8, [[330, 120, 150], [1080, 130, 170]], '#241243', '#ff9d5c');

  // The avenue: a dark road rushing to a vanishing point, neon edge lines.
  ctx.fillStyle = '#160b2a';
  ctx.beginPath();
  ctx.moveTo(0, H); ctx.lineTo(W * 0.44, H * 0.78); ctx.lineTo(W * 0.6, H * 0.78); ctx.lineTo(W, H);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#ff3d8a'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(W * 0.44, H * 0.78); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W, H); ctx.lineTo(W * 0.6, H * 0.78); ctx.stroke();
  ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 6; ctx.setLineDash([46, 60]);
  ctx.beginPath(); ctx.moveTo(W * 0.52, H * 0.79); ctx.lineTo(W * 0.52, H); ctx.stroke();
  ctx.setLineDash([]);

  palm(ctx, 210, H * 0.99, 560, 90, '#12081f');
  palm(ctx, 1360, H * 1.0, 640, -110, '#12081f');
  palm(ctx, 420, H * 0.86, 300, 40, '#1c0d33');
  palm(ctx, 1150, H * 0.87, 320, -50, '#1c0d33');
  return c;
}

// --- Neon Pier: a fairground wheel over black water -----------------------
function pier() {
  const c = canvas(W, H);
  const ctx = c.getContext('2d');
  sky(ctx, [[0, '#050914'], [0.55, '#0a1440'], [0.8, '#14264f'], [1, '#050914']]);
  // Stars, on a fixed lattice.
  ctx.fillStyle = '#cfe6ff';
  for (let i = 0; i < 90; i++) {
    const x = (i * 173) % W;
    const y = (i * 97) % (H * 0.5);
    ctx.globalAlpha = 0.25 + (i % 4) * 0.18;
    ctx.fillRect(x, y, 2.4, 2.4);
  }
  ctx.globalAlpha = 1;
  sun(ctx, W * 0.82, H * 0.2, 52, '#e8f4ff');

  // The wheel: rim, spokes and a ring of neon bulbs.
  const cx = W * 0.36, cy = H * 0.44, r = 300;
  ctx.strokeStyle = '#0d1b3d'; ctx.lineWidth = 26;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 5;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.strokeStyle = i % 2 ? '#ff3d8a' : '#22d3ee';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke();
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ctx.fillStyle = i % 3 ? '#ffd76a' : '#ff3d8a';
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 9, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#0d1b3d';
  ctx.beginPath(); ctx.moveTo(cx - 190, H * 0.86); ctx.lineTo(cx, cy + 40); ctx.lineTo(cx + 190, H * 0.86); ctx.closePath(); ctx.fill();

  // Boardwalk silhouette and string lights sagging between posts.
  ctx.fillStyle = '#04060f';
  ctx.fillRect(0, H * 0.84, W, H * 0.16);
  for (const px of [120, 560, 1020, 1460]) ctx.fillRect(px, H * 0.66, 14, H * 0.18);
  const posts = [127, 567, 1027, 1467];
  for (let s = 0; s < posts.length - 1; s++) {
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const x = posts[s] + (posts[s + 1] - posts[s]) * t;
      const y = H * 0.665 + Math.sin(t * Math.PI) * 46;
      ctx.fillStyle = s % 2 ? '#ff7847' : '#ffd76a';
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Water: broken reflections under the lights.
  for (let i = 0; i < 130; i++) {
    const x = (i * 211) % W;
    const y = H * 0.87 + ((i * 37) % (H * 0.11));
    ctx.globalAlpha = 0.12 + (i % 5) * 0.06;
    ctx.fillStyle = i % 3 ? '#22d3ee' : '#ff3d8a';
    ctx.fillRect(x, y, 26 + (i % 4) * 16, 3.5);
  }
  ctx.globalAlpha = 1;
  return c;
}

// --- Palm Beach: noon over turquoise water --------------------------------
function beach() {
  const c = canvas(W, H);
  const ctx = c.getContext('2d');
  sky(ctx, [[0, '#2f9be8'], [0.42, '#79c7f2'], [0.55, '#bfe9ff'], [1, '#fff3cf']], W, H * 0.62);
  sun(ctx, W * 0.16, H * 0.14, 74, '#fff7ae');
  // Clouds: soft stacks of ellipses.
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  for (const [x, y, s] of [[420, 150, 1], [1010, 110, 1.3], [1330, 240, 0.8], [700, 260, 0.7]]) {
    ctx.beginPath();
    ctx.ellipse(x, y, 130 * s, 34 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 70 * s, y + 8 * s, 90 * s, 26 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 80 * s, y + 10 * s, 80 * s, 22 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Sea, then a foam line, then sand.
  const sea = ctx.createLinearGradient(0, H * 0.52, 0, H * 0.78);
  sea.addColorStop(0, '#0e7fc4'); sea.addColorStop(0.7, '#19b3a6'); sea.addColorStop(1, '#7fe0cd');
  ctx.fillStyle = sea; ctx.fillRect(0, H * 0.52, W, H * 0.26);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (let i = 0; i < 26; i++) ctx.fillRect((i * 149) % W, H * 0.55 + ((i * 53) % (H * 0.18)), 34 + (i % 3) * 22, 4);
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(W * 0.5, H * 0.775, W * 0.52, 16, 0, 0, Math.PI * 2); ctx.fill();
  const sand = ctx.createLinearGradient(0, H * 0.78, 0, H);
  sand.addColorStop(0, '#ffe9b0'); sand.addColorStop(1, '#f7c873');
  ctx.fillStyle = sand; ctx.fillRect(0, H * 0.78, W, H * 0.22);

  // A lifeguard tower and a beach umbrella, both simple and bold.
  ctx.fillStyle = '#e8f6ff';
  ctx.fillRect(1150, H * 0.62, 150, 96);
  ctx.fillStyle = '#ff5d5d'; ctx.fillRect(1142, H * 0.6, 166, 22);
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(1166, H * 0.7); ctx.lineTo(1130, H * 0.86); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1284, H * 0.7); ctx.lineTo(1320, H * 0.86); ctx.stroke();
  ctx.strokeStyle = '#7a4a21'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(360, H * 0.83); ctx.lineTo(392, H * 0.97); ctx.stroke();
  ctx.fillStyle = '#ff3d8a';
  ctx.beginPath(); ctx.moveTo(268, H * 0.83); ctx.quadraticCurveTo(360, H * 0.72, 452, H * 0.83); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath(); ctx.moveTo(314, H * 0.795); ctx.quadraticCurveTo(360, H * 0.72, 406, H * 0.795); ctx.closePath(); ctx.fill();

  palm(ctx, 130, H * 1.0, 520, 70, '#14532d');
  palm(ctx, 1500, H * 1.01, 580, -80, '#14532d');
  palm(ctx, 700, H * 0.9, 260, 30, '#1a6b3a');
  return c;
}

export const DEMO_SCENES = {
  boulevard: { label: 'Boulevard Dusk', paint: boulevard },
  pier: { label: 'Neon Pier', paint: pier },
  beach: { label: 'Palm Beach', paint: beach },
};

// Paints a demo scene once and returns it as a canvas "photo".
export function makeDemoScene(kind) {
  const scene = DEMO_SCENES[kind] ?? DEMO_SCENES.boulevard;
  return scene.paint();
}
