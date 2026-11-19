// The cover engine: panel layouts, the colour grade and the lettering.
//
// Everything the studio shows or exports is painted by renderCover() from a
// plain state object, so the live preview and the full-size PNG export are
// the same drawing at two sizes. No library, no network: canvas 2D only.

// --- Panel layouts ---------------------------------------------------------
// Each panel is a polygon in fractions of the artboard. The slight skews are
// deliberate: straight rectangles read as a slideshow, tilted panels with
// paper-white gutters read as a poster. `region` is the crop of the photo
// the panel starts from in one-photo mode (the whole artboard shows one
// scene, split by the panels); in multi-photo mode each panel frames its
// own photo instead.

export const LAYOUTS = {
  poster: {
    label: 'Poster Grid',
    panels: [
      { poly: [[0.03, 0.03], [0.63, 0.03], [0.60, 0.52], [0.03, 0.55]] },
      { poly: [[0.66, 0.03], [0.97, 0.03], [0.97, 0.30], [0.63, 0.31]] },
      { poly: [[0.66, 0.34], [0.97, 0.33], [0.97, 0.55], [0.63, 0.55]] },
      { poly: [[0.03, 0.58], [0.49, 0.55], [0.51, 0.97], [0.03, 0.97]] },
      { poly: [[0.54, 0.58], [0.97, 0.56], [0.97, 0.97], [0.54, 0.97]] },
    ],
  },
  hero: {
    label: 'Hero & Strips',
    panels: [
      { poly: [[0.03, 0.03], [0.97, 0.03], [0.97, 0.60], [0.03, 0.64]] },
      { poly: [[0.03, 0.67], [0.33, 0.65], [0.34, 0.97], [0.03, 0.97]] },
      { poly: [[0.36, 0.65], [0.65, 0.64], [0.65, 0.97], [0.37, 0.97]] },
      { poly: [[0.68, 0.64], [0.97, 0.62], [0.97, 0.97], [0.68, 0.97]] },
    ],
  },
  triptych: {
    label: 'Triptych',
    panels: [
      { poly: [[0.03, 0.03], [0.36, 0.03], [0.31, 0.97], [0.03, 0.97]] },
      { poly: [[0.39, 0.03], [0.66, 0.03], [0.64, 0.97], [0.34, 0.97]] },
      { poly: [[0.69, 0.03], [0.97, 0.03], [0.97, 0.97], [0.67, 0.97]] },
    ],
  },
  fullbleed: {
    label: 'Full Bleed',
    panels: [
      { poly: [[0, 0], [1, 0], [1, 1], [0, 1]] },
      { poly: [[0.05, 0.60], [0.34, 0.58], [0.35, 0.90], [0.05, 0.92]] },
      { poly: [[0.66, 0.58], [0.95, 0.60], [0.95, 0.92], [0.65, 0.90]] },
    ],
  },
};

export function panelBox(panel, w, h) {
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const [x, y] of panel.poly) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  return { x: minX * w, y: minY * h, w: (maxX - minX) * w, h: (maxY - minY) * h };
}

function tracePoly(ctx, panel, w, h) {
  ctx.beginPath();
  panel.poly.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x * w, y * h);
    else ctx.lineTo(x * w, y * h);
  });
  ctx.closePath();
}

// --- The colour grade --------------------------------------------------------
// A photo is graded once onto its own canvas (the editor caches it), then
// the panels just clip and frame it. The grade is a filter pass for punch,
// a three-stop colour wash laid over with overlay/soft-light blending, and
// a vignette to seat the edges — the sunset/neon cast the posters have.

export const GRADES = {
  sunset: { filter: 'saturate(1.35) contrast(1.08)', wash: ['#ffc44d', '#ff3d8a', '#2b1055'] },
  neon: { filter: 'saturate(1.5) contrast(1.15) brightness(1.03)', wash: ['#22d3ee', '#7b2d8b', '#050914'] },
  golden: { filter: 'saturate(1.2) contrast(1.05) brightness(1.06)', wash: ['#ffe9a8', '#ff9d5c', '#7a2d1a'] },
  clean: { filter: 'saturate(1.05) contrast(1.02)', wash: null },
};

const GRADE_MAX_W = 1600;

export function gradePhoto(img, gradeName, amount) {
  const grade = GRADES[gradeName] ?? GRADES.sunset;
  const scale = Math.min(1, GRADE_MAX_W / img.width);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const ctx = out.getContext('2d');
  ctx.filter = grade.filter;
  ctx.drawImage(img, 0, 0, w, h);
  ctx.filter = 'none';
  const amt = Math.max(0, Math.min(1, amount));
  if (grade.wash && amt > 0) {
    const g = ctx.createLinearGradient(0, 0, w * 0.25, h);
    g.addColorStop(0, grade.wash[0]);
    g.addColorStop(0.52, grade.wash[1]);
    g.addColorStop(1, grade.wash[2]);
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.55 * amt;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = 0.8 * amt;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  // Vignette: darken the corners so panels feel lit from the middle.
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.78);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, `rgba(10,4,24,${0.34 * amt + 0.08})`);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  return out;
}

// --- The lettering -----------------------------------------------------------
// The headline is drawn letter by letter so it can carry real tracking, a
// slight downhill tilt and layered paint: a hard offset shadow, a thick
// round-joined outline, then a gradient fill. No font file ships with the
// app — it asks the browser for the heaviest sans it has and leans on the
// stroke to give the letters their poster weight.

const HEADLINE_FONT = '"Arial Black", "Liberation Sans", "DejaVu Sans", sans-serif';

const LETTERING = {
  chrome: {
    fill: ['#ffffff', '#ffe9a8', '#ffc44d', '#ff7847'],
    stroke: '#22103d', shadow: '#ff3d8a', sub: '#ffd76a',
  },
  neonpop: {
    fill: ['#ffffff', '#c9f6ff', '#7ee7fc'],
    stroke: '#0b2a6b', shadow: '#ff3d8a', sub: '#7ee7fc',
  },
  newsprint: {
    fill: ['#ffffff', '#f2ede4'],
    stroke: '#101018', shadow: '#101018', sub: '#ffffff',
  },
};

function trackedWidth(ctx, text, tracking) {
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + tracking;
  return w - (text.length ? tracking : 0);
}

function drawTracked(ctx, text, cx, y, tracking, paint) {
  let x = cx - trackedWidth(ctx, text, tracking) / 2;
  for (const ch of text) {
    paint(ch, x, y);
    x += ctx.measureText(ch).width + tracking;
  }
}

export function drawHeadline(ctx, text, cx, cy, maxWidth, sizeScale, styleName) {
  const style = LETTERING[styleName] ?? LETTERING.chrome;
  const words = (text || '').trim() || 'Untitled';
  let px = Math.round(150 * sizeScale);
  ctx.textBaseline = 'middle';
  const setFont = () => { ctx.font = `italic 900 ${px}px ${HEADLINE_FONT}`; };
  setFont();
  // Shrink to fit: a long headline steps down until it fits the artboard.
  while (px > 40 && trackedWidth(ctx, words, px * 0.02) > maxWidth) {
    px -= 6;
    setFont();
  }
  const tracking = px * 0.02;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.022);
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  // Hard shadow pass.
  ctx.fillStyle = style.shadow;
  drawTracked(ctx, words, px * 0.055, px * 0.07, tracking, (ch, x, y) => ctx.fillText(ch, x, y));
  // Outline pass, then the gradient fill on top of it.
  const grad = ctx.createLinearGradient(0, -px * 0.55, 0, px * 0.6);
  style.fill.forEach((colour, i) => grad.addColorStop(i / (style.fill.length - 1), colour));
  drawTracked(ctx, words, 0, 0, tracking, (ch, x, y) => {
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = px * 0.16;
    ctx.strokeText(ch, x, y);
    ctx.fillStyle = grad;
    ctx.fillText(ch, x, y);
  });
  ctx.restore();
  return px;
}

export function drawStrapline(ctx, text, cx, cy, w, styleName) {
  const style = LETTERING[styleName] ?? LETTERING.chrome;
  const words = (text || '').trim().toUpperCase();
  if (!words) return;
  const px = Math.max(20, Math.round(w * 0.026));
  ctx.font = `700 ${px}px "Segoe UI", system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  const tracking = px * 0.34;
  const tw = trackedWidth(ctx, words, tracking);
  // A torn-paper dark band behind the line keeps it readable on any photo.
  ctx.fillStyle = 'rgba(12,6,26,0.72)';
  const padX = px * 0.9, padY = px * 0.52;
  ctx.fillRect(cx - tw / 2 - padX, cy - padY, tw + padX * 2, padY * 2);
  ctx.fillStyle = style.sub;
  drawTracked(ctx, words, 0, 0, tracking, (ch, x, y) => ctx.fillText(ch, cx + x, cy + y));
}

// --- The render ---------------------------------------------------------------
// state = {
//   photos: [graded canvas per loaded photo],
//   fillMode: 'single' | 'multi',
//   layout: key of LAYOUTS,
//   panelPhoto: [photo index per panel],
//   crops: [{ dx, dy, zoom } per panel],   // dx/dy in fractions of the panel box
//   title, sub, lettering, titleScale,
//   selected: panel index or -1 (editor only; exports pass -1),
// }

function drawPanelPhoto(ctx, state, panel, index, w, h) {
  const photoIndex = state.fillMode === 'single' ? 0 : (state.panelPhoto[index] ?? 0);
  const img = state.photos[photoIndex];
  if (!img) return;
  const crop = state.crops[index] ?? { dx: 0, dy: 0, zoom: 1 };
  ctx.save();
  tracePoly(ctx, panel, w, h);
  ctx.clip();
  if (state.fillMode === 'single') {
    // One scene across the whole artboard, split by the panels: the photo
    // covers the artboard and each panel shows the part beneath it, with
    // the panel's own pan/zoom nudging its window on the scene.
    const base = Math.max(w / img.width, h / img.height);
    const z = base * (crop.zoom ?? 1);
    const dw = img.width * z, dh = img.height * z;
    const box = panelBox(panel, w, h);
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    const ox = (w - dw) / 2 + (crop.dx ?? 0) * box.w + (cx - w / 2) * (1 - (crop.zoom ?? 1));
    const oy = (h - dh) / 2 + (crop.dy ?? 0) * box.h + (cy - h / 2) * (1 - (crop.zoom ?? 1));
    ctx.drawImage(img, ox, oy, dw, dh);
  } else {
    // Each panel frames its own photo: cover the panel's box, then apply
    // the panel's pan (fractions of the box) and zoom around its centre.
    const box = panelBox(panel, w, h);
    const base = Math.max(box.w / img.width, box.h / img.height);
    const z = base * (crop.zoom ?? 1);
    const dw = img.width * z, dh = img.height * z;
    const x = box.x + (box.w - dw) / 2 + (crop.dx ?? 0) * box.w;
    const y = box.y + (box.h - dh) / 2 + (crop.dy ?? 0) * box.h;
    ctx.drawImage(img, x, y, dw, dh);
  }
  ctx.restore();
}

export function renderCover(ctx, state, w, h) {
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.poster;
  // Poster paper behind the panels.
  ctx.fillStyle = '#f7f1e3';
  ctx.fillRect(0, 0, w, h);

  layout.panels.forEach((panel, i) => drawPanelPhoto(ctx, state, panel, i, w, h));

  // Gutters: a paper stroke around every panel, then a hairline of ink.
  for (const panel of layout.panels) {
    tracePoly(ctx, panel, w, h);
    ctx.strokeStyle = '#f7f1e3';
    ctx.lineWidth = Math.max(6, w * 0.011);
    ctx.stroke();
    tracePoly(ctx, panel, w, h);
    ctx.strokeStyle = 'rgba(16,16,24,0.85)';
    ctx.lineWidth = Math.max(1.5, w * 0.0022);
    ctx.stroke();
  }

  // Bottom scrim so the caption sits on the art, not in it.
  const scrim = ctx.createLinearGradient(0, h * 0.68, 0, h);
  scrim.addColorStop(0, 'rgba(10,4,24,0)');
  scrim.addColorStop(0.55, 'rgba(10,4,24,0.38)');
  scrim.addColorStop(1, 'rgba(10,4,24,0.66)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h * 0.68, w, h * 0.32);

  const px = drawHeadline(ctx, state.title, w / 2, h * 0.865, w * 0.92, (state.titleScale ?? 1) * (w / 1080), state.lettering);
  drawStrapline(ctx, state.sub, w / 2, h * 0.865 + px * 0.78, w, state.lettering);

  // The editor's selection ring (never on an export: exports pass -1).
  if (state.selected >= 0 && layout.panels[state.selected]) {
    tracePoly(ctx, layout.panels[state.selected], w, h);
    ctx.strokeStyle = '#ffc44d';
    ctx.lineWidth = Math.max(3, w * 0.004);
    ctx.setLineDash([18, 12]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// Renders the cover at an exact export size onto a fresh canvas.
export function renderExport(state, w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  renderCover(c.getContext('2d'), { ...state, selected: -1 }, w, h);
  return c;
}
