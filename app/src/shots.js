// Fixed scenes for screenshots: shots.json names each shot's query string.
//
// ?shot=cover strips the studio chrome (body.shot-cover in style.css) and
// leaves the cover alone on the page, so a screenshot of the page is the
// artwork itself; ?shot=editor shows the studio with a scene loaded and the
// panels up. Either way window.__shotReady is set once the scene is painted,
// so whoever takes the screenshot knows when to press the shutter.

export async function runShot(shot, query, api) {
  api.loadDemo(query.get('photo') ?? 'boulevard');
  if (query.get('caption')) api.setCaption(query.get('caption'));
  if (query.get('sub')) api.setSub(query.get('sub'));
  if (query.get('layout')) api.setLayout(query.get('layout'));
  if (query.get('grade')) api.setGrade(query.get('grade'));
  if (query.get('size')) api.setSize(query.get('size'));
  // An exported cover carries no editor marks: drop the selection ring.
  if (shot === 'cover') api.setSelected(-1);
  api.render();
  if (shot === 'cover') document.body.classList.add('shot-cover');
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
