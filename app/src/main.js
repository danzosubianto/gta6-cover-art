// Neon Tide Cover Studio — the editor.
//
// Wires the controls to the cover engine: photos in (uploads stay on this
// machine; the built-in scenes are painted by demo.js), panels picked and
// dragged on the canvas, grade and lettering applied live, and exports
// rendered at full size by the same renderCover the preview uses.

import { LAYOUTS, GRADES, gradePhoto, renderCover, renderExport } from './cover.js';
import { DEMO_SCENES, makeDemoScene } from './demo.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const ctx = canvas.getContext('2d');
const status = $('status');

const editor = {
  photos: [],        // [{ source, label }] — source is an image or a canvas
  graded: new Map(), // "index|grade|amount" -> graded canvas
  fillMode: 'single',
  layout: 'poster',
  panelPhoto: [],
  crops: [],
  grade: 'sunset',
  gradeAmt: 0.7,
  title: 'Neon Tide',
  sub: 'One night in Vice Beach',
  lettering: 'chrome',
  titleScale: 1,
  selected: 0,
};

function panelCount() {
  return LAYOUTS[editor.layout].panels.length;
}

function ensurePanelState() {
  const n = panelCount();
  while (editor.crops.length < n) editor.crops.push({ dx: 0, dy: 0, zoom: 1 });
  while (editor.panelPhoto.length < n) {
    editor.panelPhoto.push(editor.photos.length ? editor.panelPhoto.length % editor.photos.length : 0);
  }
  editor.crops.length = n;
  editor.panelPhoto.length = n;
  if (editor.selected >= n) editor.selected = 0;
}

function gradedPhoto(index) {
  const key = `${index}|${editor.grade}|${Math.round(editor.gradeAmt * 20)}`;
  if (!editor.graded.has(key)) {
    editor.graded.set(key, gradePhoto(editor.photos[index].source, editor.grade, editor.gradeAmt));
  }
  return editor.graded.get(key);
}

function currentState() {
  ensurePanelState();
  return {
    photos: editor.photos.map((_, i) => gradedPhoto(i)),
    fillMode: editor.fillMode,
    layout: editor.layout,
    panelPhoto: editor.panelPhoto,
    crops: editor.crops,
    title: editor.title,
    sub: editor.sub,
    lettering: editor.lettering,
    titleScale: editor.titleScale,
    selected: editor.selected,
  };
}

function render() {
  ensurePanelState();
  renderCover(ctx, currentState(), canvas.width, canvas.height);
}

// --- photos -------------------------------------------------------------------

function addPhoto(source, label) {
  editor.photos.push({ source, label });
  editor.graded.clear();
  ensurePanelState();
  drawThumbs();
  render();
}

function loadDemo(kind) {
  const existing = editor.photos.findIndex((p) => p.label === DEMO_SCENES[kind].label);
  if (existing >= 0) {
    assignPhoto(existing);
    return;
  }
  addPhoto(makeDemoScene(kind), DEMO_SCENES[kind].label);
  assignPhoto(editor.photos.length - 1);
}

// In single-photo mode the chosen photo becomes the scene every panel crops;
// in multi mode it fills the selected panel.
function assignPhoto(index) {
  if (editor.fillMode === 'single') {
    if (index !== 0) {
      const [picked] = editor.photos.splice(index, 1);
      editor.photos.unshift(picked);
      editor.graded.clear();
    }
  } else {
    editor.panelPhoto[editor.selected] = index;
  }
  drawThumbs();
  render();
}

function drawThumbs() {
  const box = $('thumbs');
  box.replaceChildren();
  editor.photos.forEach((photo, i) => {
    const fig = document.createElement('figure');
    const active = editor.fillMode === 'single' ? i === 0 : editor.panelPhoto[editor.selected] === i;
    if (active) fig.className = 'on';
    const thumb = document.createElement('canvas');
    thumb.width = 124; thumb.height = 92;
    thumb.getContext('2d').drawImage(photo.source, 0, 0, 124, 92);
    thumb.title = photo.label;
    thumb.addEventListener('click', () => assignPhoto(i));
    const cap = document.createElement('figcaption');
    cap.textContent = photo.label.split('.')[0].slice(0, 12);
    fig.append(thumb, cap);
    box.append(fig);
  });
}

// --- panel picking and dragging -------------------------------------------------

function panelPaths() {
  return LAYOUTS[editor.layout].panels.map((panel) => {
    const path = new Path2D();
    panel.poly.forEach(([x, y], i) => {
      if (i === 0) path.moveTo(x * canvas.width, y * canvas.height);
      else path.lineTo(x * canvas.width, y * canvas.height);
    });
    path.closePath();
    return path;
  });
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

let drag = null;
canvas.addEventListener('pointerdown', (event) => {
  const p = canvasPoint(event);
  const paths = panelPaths();
  for (let i = paths.length - 1; i >= 0; i--) {
    if (ctx.isPointInPath(paths[i], p.x, p.y)) {
      editor.selected = i;
      drag = { x: p.x, y: p.y };
      canvas.setPointerCapture(event.pointerId);
      $('zoom').value = Math.round((editor.crops[i].zoom ?? 1) * 100);
      drawThumbs();
      render();
      return;
    }
  }
});
canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const p = canvasPoint(event);
  const crop = editor.crops[editor.selected];
  const box = canvas.getBoundingClientRect();
  crop.dx = (crop.dx ?? 0) + (p.x - drag.x) / canvas.width;
  crop.dy = (crop.dy ?? 0) + (p.y - drag.y) / canvas.height;
  drag = p;
  render();
  void box;
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const crop = editor.crops[editor.selected];
  crop.zoom = Math.max(1, Math.min(3.5, (crop.zoom ?? 1) * (event.deltaY < 0 ? 1.07 : 0.93)));
  $('zoom').value = Math.round(crop.zoom * 100);
  render();
}, { passive: false });

// --- controls -------------------------------------------------------------------

$('photo').addEventListener('change', (event) => {
  for (const file of event.target.files) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.addEventListener('load', () => addPhoto(img, file.name));
    img.src = url;
  }
  event.target.value = '';
});
document.querySelectorAll('[data-demo]').forEach((btn) => {
  btn.addEventListener('click', () => loadDemo(btn.dataset.demo));
});
$('fillmode').addEventListener('change', (event) => {
  editor.fillMode = event.target.value;
  drawThumbs();
  render();
});
document.querySelectorAll('[data-layout]').forEach((btn) => {
  btn.addEventListener('click', () => {
    editor.layout = btn.dataset.layout;
    document.querySelectorAll('[data-layout]').forEach((b) => b.classList.toggle('on', b === btn));
    editor.selected = 0;
    render();
  });
});
$('zoom').addEventListener('input', (event) => {
  editor.crops[editor.selected].zoom = Number(event.target.value) / 100;
  render();
});
$('resetcrop').addEventListener('click', () => {
  editor.crops[editor.selected] = { dx: 0, dy: 0, zoom: 1 };
  $('zoom').value = 100;
  render();
});
$('grade').addEventListener('change', (event) => {
  editor.grade = event.target.value;
  editor.graded.clear();
  render();
});
$('gradeamt').addEventListener('input', (event) => {
  editor.gradeAmt = Number(event.target.value) / 100;
  render();
});
$('caption').addEventListener('input', (event) => { editor.title = event.target.value; render(); });
$('subcaption').addEventListener('input', (event) => { editor.sub = event.target.value; render(); });
$('lettering').addEventListener('change', (event) => { editor.lettering = event.target.value; render(); });
$('capsize').addEventListener('input', (event) => { editor.titleScale = Number(event.target.value) / 100; render(); });
$('size').addEventListener('change', (event) => {
  const [w, h] = event.target.value.split('x').map(Number);
  canvas.width = w;
  canvas.height = h;
  render();
});
$('export').addEventListener('click', () => {
  const art = renderExport(currentState(), canvas.width, canvas.height);
  art.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-tide-cover-${canvas.width}x${canvas.height}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    status.textContent = `Saved ${a.download}`;
  }, 'image/png');
});

// --- start ---------------------------------------------------------------------
// A painted boulevard is on stage from the first paint, so the studio never
// opens on an empty canvas. A ?shot= page sets its own scene instead.

const query = new URLSearchParams(location.search);
const api = {
  loadDemo,
  setCaption: (v) => { editor.title = v; $('caption').value = v; },
  setSub: (v) => { editor.sub = v; $('subcaption').value = v; },
  setLayout: (v) => {
    if (!LAYOUTS[v]) return;
    editor.layout = v;
    editor.selected = 0;
    document.querySelectorAll('[data-layout]').forEach((b) => b.classList.toggle('on', b.dataset.layout === v));
  },
  setSelected: (v) => { editor.selected = v; },
  setGrade: (v) => { if (GRADES[v]) { editor.grade = v; $('grade').value = v; editor.graded.clear(); } },
  setSize: (v) => {
    const [w, h] = v.split('x').map(Number);
    if (w > 0 && h > 0) { canvas.width = w; canvas.height = h; $('size').value = v; }
  },
  render,
};

if (query.get('shot')) {
  runShot(query.get('shot'), query, api);
} else {
  loadDemo('boulevard');
  render();
}
