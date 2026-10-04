'use strict';
const config = window.TACIT_CONFIG;
const title = 'TACIT: Tactile Contact Supervision for Spatial Attention in Dexterous Manipulation';
const svgNS = 'http://www.w3.org/2000/svg';
const createIcon = name => {
  const icon = document.createElementNS(svgNS, 'svg');
  const use = document.createElementNS(svgNS, 'use');
  icon.classList.add('ui-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');
  use.setAttribute('href', `#icon-${name}`);
  icon.append(use);
  return icon;
};
if (config.showAuthors) {
  const block = document.querySelector('#author-block');
  const names = document.createElement('p');
  names.textContent = config.authors.join(' · ');
  const affiliation = document.createElement('p');
  affiliation.className = 'affiliation';
  affiliation.textContent = config.affiliation;
  block.append(names, affiliation);
  block.hidden = false;
}
if (config.showPublicationStatus && config.publicationStatus) {
  const status = document.querySelector('#publication-status');
  status.textContent = config.publicationStatus;
  status.hidden = false;
}
for (const [key, resource] of Object.entries(config.links)) {
  const enabled = resource.enabled && resource.href;
  const link = document.createElement(enabled ? 'a' : 'button');
  link.className = 'resource-link';
  link.dataset.resource = key;
  const label = document.createElement('span');
  label.textContent = resource.label;
  link.append(createIcon(resource.icon), label);
  if (enabled) {
    link.href = resource.href;
    if (resource.external) {
      link.target = '_blank';
      link.rel = 'noopener';
    }
  }
  else { link.type = 'button'; link.disabled = true; }
  document.querySelector('#resource-links').append(link);
}
// The displayed citation follows the author visibility setting.
const authorField = config.showAuthors ? `  author = {${config.authors.map(name => {
  const parts = name.split(' '); const last = parts.pop(); return `${last}, ${parts.join(' ')}`;
}).join(' and ')}},\n` : '';
const bibtex = `@misc{lai${config.citationYear}tacit,\n  title = {{${title}}},\n${authorField}  year = {${config.citationYear}},\n  eprint = {${config.arxivId}},\n  archivePrefix = {arXiv},\n  primaryClass = {${config.arxivClass}},\n  url = {https://arxiv.org/abs/${config.arxivId}}\n}`;
document.querySelector('#bibtex').textContent = bibtex;
document.querySelector('#copy-citation').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try { await navigator.clipboard.writeText(bibtex); status.textContent = 'BibTeX copied.'; }
  catch {
    const range = document.createRange(); range.selectNodeContents(document.querySelector('#bibtex'));
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    status.textContent = 'Citation selected. Use your browser’s Copy command.';
  }
});
const videoTitles = {
  TACIT_Video: 'TACIT full paper video',
  ball_a2_vs_tacit: 'Ball placement: A2 and TACIT comparison',
  peg_a2_vs_tacit: 'Peg insertion: A2 and TACIT comparison',
  ball_future_contact_label: 'Training-only future-contact target',
  ball_attention: 'Real-ball predicted attention in the camera view',
  ball_attention_pointcloud_camera: 'Real-ball predicted camera-point attention',
  sim_peg_attention: 'Simulated peg attention diagnostic'
};
for (const figure of document.querySelectorAll('[data-video]')) {
  const name = figure.dataset.video;
  const shell = figure.querySelector('.video-shell');
  const video = document.createElement('video');
  video.controls = true; video.muted = true; video.defaultMuted = true; video.playsInline = true;
  video.preload = 'none'; video.setAttribute('aria-label', videoTitles[name]);
  video.setAttribute('muted', ''); video.setAttribute('playsinline', '');
  video.hidden = true; // No src is attached before explicit user interaction.
  const start = document.createElement('button');
  start.type = 'button'; start.className = 'video-start';
  start.setAttribute('aria-label', `Play ${videoTitles[name]}`);
  const poster = document.createElement('img');
  poster.src = `assets/posters/${name}.jpg`; poster.alt = '';
  poster.loading = name === 'TACIT_Video' ? 'eager' : 'lazy';
  if (name === 'TACIT_Video') poster.fetchPriority = 'high';
  poster.width = 960; poster.height = 540;
  const label = document.createElement('span'); label.className = 'play-label';
  label.append(createIcon('play'), document.createTextNode('Play video'));
  start.append(poster, label); shell.append(video, start);
  const error = document.createElement('p'); error.className = 'video-error'; error.hidden = true;
  error.append('Video could not play. ');
  const direct = document.createElement('a'); direct.href = `assets/videos/${name}.mp4`; direct.textContent = 'Open the MP4 file';
  error.append(direct); shell.append(error);
  video.addEventListener('error', () => { error.hidden = false; });
  video.addEventListener('play', () => {
    document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
  });
  start.addEventListener('click', async () => {
    video.src = `assets/videos/${name}.mp4`; video.hidden = false; start.hidden = true;
    video.focus();
    try { await video.play(); } catch { /* Native controls allow a manual retry. */ }
  }, { once: true });
}
