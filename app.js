import { portfolio } from './content.js';

const $ = (selector) => document.querySelector(selector);
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const external = 'target="_blank" rel="noopener noreferrer"';
const githubIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.83c.85 0 1.71.11 2.51.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>';
const databaseIcon = '<svg viewBox="0 0 32 32"><ellipse cx="16" cy="7" rx="10" ry="4"/><path d="M6 7v18c0 6 20 6 20 0V7M6 13c0 6 20 6 20 0M6 19c0 6 20 6 20 0"/></svg>';

function visual(project) {
  const scenes = {
    vision: '<div class="vision-grid"></div><div class="vision-scene"><div class="signal-panel"><div class="signal-pattern"></div><span>ENTROPY FEATURES</span></div><div class="fusion-plus">+</div><div class="signal-panel"><div class="signal-noise"></div><span>BIT-PLANE SIGNALS</span></div></div><div class="vision-result"><b>95.2%</b> TEST ACCURACY</div>',
    repository: '<div class="terminal"><div class="terminal-top"><i></i><i></i><i></i><span>reposage / knowledge, connected</span></div><p><span class="prompt">❯</span> where does this error start?</p><p>↳ retrieve. reason. reference.</p><div class="source-line"><span class="code-tag">code</span><span class="code-tag">docs</span><span class="code-tag">logs</span></div></div>',
    operations: '<div class="incident"><div class="incident-header"><span>OPSGUARDIAN / INVESTIGATE</span><b>LOCAL RAG</b></div><h4>Connect the incident dots.</h4><p>Alert → Evidence → Diagnostic checks</p><div class="incident-evidence"><span>RUNBOOKS</span><span>EVENTS</span><span>CONFIGS</span></div></div>',
    pipeline: `<div class="pipeline-art"><div class="pipeline-node">${databaseIcon}<span>SOURCE</span></div><span class="pipeline-link">→</span><div class="pipeline-node"><svg viewBox="0 0 32 32"><path d="m17 3-9 14h9l-2 12 10-17h-9Z"/></svg><span>DIAGNOSE</span></div><span class="pipeline-link">→</span><div class="pipeline-node">${databaseIcon}<span>LINEAGE</span></div></div><span class="pipeline-note">FOLLOW THE DATA. FIND THE CAUSE.</span>`,
    education: '<div class="edu-art"><div class="edu-heading">eduverse<span style="color:#a06f79">.</span></div><p class="edu-subtitle">A little learning goes a long way.</p><div class="edu-courses"><div class="edu-course"><span>⌘</span>COURSES</div><div class="edu-course"><span>✳</span>AI TOOLS</div><div class="edu-course"><span>↗</span>PROGRESS</div></div></div>',
    video: '<div class="video-art"><div class="video-panel"><span>✳</span> An idea. A document. A story.</div><div class="video-panel play">▷</div><div class="video-panel"><div class="waveform"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div><span class="video-subtitle">PROMPT → NARRATION → VISUALS → VIDEO</span>',
    satellite: '<div class="satellite-art"></div><span class="satellite-stat">ORBITALEYE / ~38,000 SYNTHETIC EVENTS</span>',
    transformer: '<div class="transformer-art"><div class="transformer-token"><span>t</span><span>h</span><span>e</span></div><span class="transformer-arrow">→</span><div class="transformer-block"><span>attention.</span>DECODER-ONLY<br>TRANSFORMER</div><span class="transformer-arrow">→</span><div class="transformer-token"><span>n</span><span>e</span><span>x</span></div></div>'
  };
  return `<div class="project-visual visual-${escape(project.kind)}"><span class="visual-caption">${escape(project.title)} / CONCEPT STUDY</span><div aria-hidden="true">${scenes[project.kind] || scenes.repository}</div><span class="visual-explore" aria-hidden="true">↗</span><button type="button" data-project="${escape(project.id)}" aria-label="Read about ${escape(project.title)}"></button></div>`;
}

function card(project) {
  return `<article class="project-card">${visual(project)}<div class="project-meta"><span class="project-category">${escape(project.category)}</span><span>${escape(project.year || 'Industry project')}</span></div><div class="project-title-row"><h3><button type="button" class="project-title-button" data-project="${escape(project.id)}">${escape(project.title)}</button></h3>${project.github ? `<a class="project-github" href="${escape(project.github)}" ${external} aria-label="${escape(project.title)} source code on GitHub">${githubIcon}</a>` : '<span class="project-private">PROJECT NOTES ↗</span>'}</div><p class="project-summary">${escape(project.summary)}</p><div class="project-tags">${project.tags.slice(0,4).map(tag => `<span>${escape(tag)}</span>`).join('')}</div></article>`;
}

const categories = ['All projects', ...new Set(portfolio.projects.map(project => project.category))];
let activeCategory = 'All projects';
$('#project-filters').innerHTML = categories.map((category, index) => `<button class="filter-button" type="button" data-category="${escape(category)}" aria-pressed="${index === 0}">${escape(category)}</button>`).join('');
function renderProjects() {
  const projects = portfolio.projects.filter(project => activeCategory === 'All projects' || project.category === activeCategory);
  const featured = projects.filter(project => project.featured);
  const other = projects.filter(project => !project.featured);
  $('#project-grid').innerHTML = featured.map(card).join('') + (other.length ? '<p class="extra-projects-label">MORE EXPLORATIONS</p>' + other.map(card).join('') : '');
  $('#work-count').textContent = `${projects.length} PROJECT${projects.length === 1 ? '' : 'S'} / ${activeCategory === 'All projects' ? 'SELECTED & EXPLORATIONS' : activeCategory.toUpperCase()}`;
  $('#project-empty').hidden = projects.length !== 0;
  document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === activeCategory)));
}
$('#project-filters').addEventListener('click', event => { const button = event.target.closest('[data-category]'); if (button) { activeCategory = button.dataset.category; renderProjects(); } });
renderProjects();

$('#about-copy').innerHTML = portfolio.bio.map(paragraph => `<p>${escape(paragraph)}</p>`).join('');
$('#toolkit-grid').innerHTML = portfolio.skills.map((skill, index) => `<div class="toolkit-item"><span class="toolkit-number">0${index + 1} /</span><h3>${escape(skill.title)}</h3><div class="toolkit-tags">${skill.items.map(item => `<span>${escape(item)}</span>`).join('')}</div></div>`).join('');
$('#timeline').innerHTML = portfolio.experience.map(item => `<article class="timeline-row"><div class="timeline-date">${escape(item.period)}<br><span class="timeline-type">${escape(item.type)}</span></div><div><h3 class="timeline-name">${escape(item.title)}</h3><p class="timeline-org">${escape(item.organization)}</p></div><p class="timeline-description">${escape(item.description)}</p></article>`).join('');
if (portfolio.certifications?.length) $('#certifications').innerHTML = `<h3>Along the way · Awards & certifications</h3><div class="cert-list">${portfolio.certifications.map(item => `<p class="cert-item">${escape(item.title || item.name)}<span>${escape([item.issuer || item.organization, item.period || item.date].filter(Boolean).join(' · '))}</span></p>`).join('')}</div>`; else $('#certifications').hidden = true;

function renderArchive(query = '') {
  const normalized = query.trim().toLocaleLowerCase();
  const repos = portfolio.archive.filter(repo => `${repo.title} ${repo.description} ${repo.language || ''} ${repo.fork ? 'fork' : ''}`.toLocaleLowerCase().includes(normalized));
  $('#archive-list').innerHTML = repos.map((repo, index) => `<a class="archive-row" href="${escape(repo.github)}" ${external} aria-label="${escape(repo.title)}${repo.fork ? ', fork' : ''} on GitHub"><span class="archive-index">${String(index + 1).padStart(2,'0')}</span><h3>${escape(repo.title)}${repo.fork ? '<span class="fork-badge">FORK</span>' : ''}</h3><span class="archive-desc">${escape(repo.description)}</span><span class="archive-language">${escape(repo.language || 'Coursework')}</span><span class="archive-arrow" aria-hidden="true">↗</span></a>`).join('');
  $('#archive-count').textContent = `${repos.length} OF ${portfolio.archive.length} REPOSITORIES`;
  $('#archive-empty').hidden = repos.length !== 0;
}
$('#archive-search').addEventListener('input', event => renderArchive(event.target.value));
renderArchive();

const dialog = $('#project-dialog');
let projectTrigger;
function openProject(id, trigger) {
  const project = portfolio.projects.find(item => item.id === id);
  if (!project) return;
  projectTrigger = trigger;
  $('#dialog-content').innerHTML = `<p class="dialog-category">${escape(project.category)}${project.period || project.year ? ` · ${escape(project.period || project.year)}` : ''}</p><h2 id="dialog-title">${escape(project.title)}</h2><p class="dialog-summary">${escape(project.summary)}</p>${project.metrics.length ? `<div class="dialog-metrics">${project.metrics.map(metric => `<div class="dialog-metric"><b>${escape(metric.value)}</b><span>${escape(metric.label)}</span></div>`).join('')}</div>` : ''}<div class="dialog-details">${project.details.map(detail => `<p>${escape(detail)}</p>`).join('')}</div><div class="project-tags">${project.tags.map(tag => `<span>${escape(tag)}</span>`).join('')}</div><p class="dialog-collaboration">${escape(project.collaboration)}</p><div class="dialog-links">${project.github ? `<a class="button button-primary" href="${escape(project.github)}" ${external}>Explore the source <span aria-hidden="true">↗</span></a>` : '<p class="dialog-no-source">Public source code is not currently available. Happy to discuss the project.</p>'}${project.url ? `<a class="text-link" href="${escape(project.url)}" ${external}>Live project ↗</a>` : ''}<a class="text-link" href="#contact" data-close-dialog>Let’s discuss it ↗</a></div>`;
  dialog.showModal();
  document.body.style.overflow = 'hidden';
  dialog.scrollTop = 0;
}
$('#project-grid').addEventListener('click', event => { const trigger = event.target.closest('[data-project]'); if (trigger) openProject(trigger.dataset.project, trigger); });
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target.closest('[data-close-dialog]')) dialog.close(); else if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { document.body.style.overflow = ''; projectTrigger?.focus({ preventScroll: true }); });

const themeButton = $('.theme-toggle');
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  $('meta[name="theme-color"]').content = theme === 'dark' ? '#211c20' : '#f7f5ee';
  themeButton.innerHTML = theme === 'dark' ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.9 13a9 9 0 0 1-9.9-9.9A9 9 0 1 0 20.9 13Z"/></svg>';
}
try { const saved = localStorage.getItem('kg-portfolio-theme'); if (saved === 'dark' || saved === 'light') setTheme(saved); } catch { /* The site works when storage is unavailable. */ }
themeButton.addEventListener('click', () => { const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(theme); try { localStorage.setItem('kg-portfolio-theme',theme); } catch { /* Theme is still applied for this visit. */ } });

const menuButton = $('.menu-toggle');
const mobileNav = $('#mobile-nav');
function closeMenu() { mobileNav.hidden = true; menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Open navigation'); }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; mobileNav.hidden = !open; menuButton.setAttribute('aria-expanded',String(open)); menuButton.setAttribute('aria-label',open ? 'Close navigation' : 'Open navigation'); });
mobileNav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });

if (portfolio.email) {
  $('#email-link').href = `mailto:${portfolio.email}`;
  $('#contact-cta').href = `mailto:${portfolio.email}`;
  $('#copy-email').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(portfolio.email); $('#copy-status').textContent = 'Email copied. Say hello whenever you like.'; }
    catch { $('#copy-status').textContent = portfolio.email; }
  });
} else { $('#email-link').hidden = true; $('#copy-email').hidden = true; $('#contact-cta').href = portfolio.linkedin; }
$('#current-year').textContent = new Date().getFullYear();

// A deterministic Fibonacci sphere: a small, original visual about connected ideas.
const svgNS = 'http://www.w3.org/2000/svg';
const points = [];
for (let index = 0; index < 73; index++) {
  const y = 1 - index / 72 * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = index * Math.PI * (3 - Math.sqrt(5));
  const x = Math.cos(theta) * radius;
  const z = Math.sin(theta) * radius;
  points.push({ x: 200 + x * 151, y: 200 + y * 151, z });
}
const network = $('#orbit-network');
points.forEach((point, index) => {
  const nearest = points.map((other, otherIndex) => ({ point: other, index: otherIndex, distance: Math.hypot(point.x-other.x,point.y-other.y,(point.z-other.z)*150) })).filter(other => other.index > index).sort((a,b) => a.distance-b.distance).slice(0,3);
  nearest.forEach(other => {
    if (other.distance > 120) return;
    const line = document.createElementNS(svgNS,'line');
    for (const [key,value] of Object.entries({x1:point.x,y1:point.y,x2:other.point.x,y2:other.point.y,stroke:'currentColor','stroke-width':'.55',opacity:point.z < 0 ? '.17' : '.5'})) line.setAttribute(key,value);
    network.append(line);
  });
  const circle = document.createElementNS(svgNS,'circle');
  for (const [key,value] of Object.entries({cx:point.x,cy:point.y,r:point.z > .4 ? '2.5' : '1.4',fill:'currentColor',opacity:point.z < 0 ? '.4' : '.9'})) circle.setAttribute(key,value);
  network.append(circle);
});
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(pointer: fine)').matches) {
  $('.hero-art').addEventListener('pointermove', event => { const rect = event.currentTarget.getBoundingClientRect(); $('#neural-orbit').style.setProperty('--orbit-angle', `${(event.clientX - rect.left - rect.width/2)/rect.width*18}deg`); });
  $('.hero-art').addEventListener('pointerleave', () => $('#neural-orbit').style.setProperty('--orbit-angle','0deg'));
}
