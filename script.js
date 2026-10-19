// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Nav scroll state
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Typewriter effect in hero terminal
const typedEl = document.getElementById('typed');
const typedOut = document.getElementById('typedOut');
const command = 'whoami';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function typeCommand() {
  if (reduceMotion) {
    typedEl.textContent = command;
    typedOut.hidden = false;
    return;
  }
  let i = 0;
  const interval = setInterval(() => {
    typedEl.textContent = command.slice(0, i + 1);
    i++;
    if (i === command.length) {
      clearInterval(interval);
      setTimeout(() => { typedOut.hidden = false; }, 300);
    }
  }, 110);
}
window.addEventListener('DOMContentLoaded', () => setTimeout(typeCommand, 500));

// Scroll-reveal for sections
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => observer.observe(el));

// Fallback: reveal any section already in view on load (covers direct #anchor
// links landing past the initial viewport, where the observer's first check
// can be missed during the jump).
function revealVisibleNow() {
  revealEls.forEach(el => {
    if (el.classList.contains('visible')) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('visible');
      observer.unobserve(el);
    }
  });
}
if (document.readyState === 'complete') {
  revealVisibleNow();
} else {
  window.addEventListener('load', revealVisibleNow);
}
window.addEventListener('hashchange', () => setTimeout(revealVisibleNow, 50));

// Cursor-tracked spotlight glow on project slides
if (!reduceMotion) {
  document.querySelectorAll('.project-slide').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--y', `${e.clientY - rect.top}px`);
    });
  });
}

// Project carousel
(function () {
  const track = document.getElementById('projectTrack');
  if (!track) return;
  const carousel = track.parentElement;
  const slides = track.querySelectorAll('.project-slide');
  const prevBtn = document.getElementById('prevProject');
  const nextBtn = document.getElementById('nextProject');
  const countEl = document.getElementById('projectCount');
  let index = 0;

  function pad(n) { return String(n).padStart(2, '0'); }

  function update() {
    track.style.setProperty('--index', index);
    carousel.scrollLeft = 0; // guard against focus/scrollIntoView drift on the hidden-overflow track
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === slides.length - 1;
    if (countEl) countEl.textContent = `${pad(index + 1)} / ${pad(slides.length)}`;
  }

  prevBtn && prevBtn.addEventListener('click', () => {
    if (index > 0) { index--; update(); }
  });
  nextBtn && nextBtn.addEventListener('click', () => {
    if (index < slides.length - 1) { index++; update(); }
  });

  update();
})();

// Book detail modal: click a skill on the shelf to read notes about it
const SKILL_NOTES = {
  'Python': { note: "The backbone of NextStep Bot's RAG pipeline and CogniShield's FastAPI service.", quote: 'Readability counts.', attribution: 'The Zen of Python' },
  'Java': { note: 'Where I first learned to think in data structures and algorithms.', quote: 'Verbose, but it never lies to you about types.' },
  'C#': { note: 'Built a WPF desktop utility for bidirectional file conversion at Ametek Instruments.', quote: 'Strongly typed, strongly opinionated, surprisingly fun.' },
  'C': { note: 'The class that taught me what a computer is actually doing under the hood.', quote: 'No garbage collector. No safety net. No excuses.' },
  'JavaScript': { note: "Powers CogniShield's browser extension, watching chats in real time.", quote: 'Any application that can be written in JavaScript will eventually be written in JavaScript.', attribution: "Atwood's Law" },
  'SQL': { note: 'The quiet workhorse behind every database class and every slow-query mystery.', quote: 'In God we trust. All others must bring data.', attribution: 'W. Edwards Deming' },
  'React.js': { note: "Built the browser-based interface for Ametek's file-conversion tool.", quote: 'Learn once, componentize everything.' },
  'Node.js': { note: 'Paired with React to bring a desktop utility to the browser at Ametek.', quote: 'JavaScript, but it finally has a backstage pass to the server.' },
  'Express.js': { note: 'The lightweight layer routing requests behind more than one side project.', quote: 'Minimal by design, opinionated by exception.' },
  '.NET': { note: 'The framework behind the WPF utility that made manual file conversion obsolete.', quote: 'Enterprise-grade, and it shows.' },
  'Django': { note: 'Batteries-included framework from full-stack coursework and personal builds.', quote: "The admin panel you didn't know you needed until you had it." },
  'Flask': { note: "Powers Technopired's backend, gamification logic and all.", quote: 'Small enough to understand in an afternoon, flexible enough to outgrow it.' },
  'HTML/CSS': { note: 'Every interface starts here, whether it ends in React or not.', quote: 'The most-used, least-credited languages in the stack.' },
  'PHP': { note: 'An early stop on the way to understanding how the web actually serves pages.', quote: 'Unfashionable. Still running half the internet.' },
  'Git': { note: 'Every project starts with git init and a little optimism.', quote: 'Commit early, commit often, rebase carefully.' },
  'AWS': { note: 'Ran the serverless Lambda pipeline that reconciles document versions at LexisNexis.', quote: "Someone else's computer, now with more acronyms." },
  'SonarQube': { note: "Kept LexisNexis's codebase honest about its own technical debt.", quote: 'The friend who tells you your code has a smell.' },
  'Windows': { note: 'The OS I built the .NET desktop utility on, and debugged more than a few times.', quote: "It restarted. It's fine now." },
  'Ubuntu': { note: 'Home base for most of my Python and ML work.', quote: 'apt install patience, then get to work.' },
  'Pandas': { note: "Cleaned and reshaped financial datasets for Pinaka AI's risk models.", quote: 'Turns messy spreadsheets into something a model can actually learn from.' },
  'NumPy': { note: 'The math underneath every model, quietly doing the heavy lifting.', quote: "Vectorized, so your loops don't have to exist." },
  'Matplotlib': { note: 'Turned model outputs into charts someone other than me could understand.', quote: 'Not pretty by default. Worth the extra three lines.' },
  'OpenCV': { note: 'Explored computer vision fundamentals outside the classroom.', quote: "Taught me that seeing is mostly linear algebra." },
  'PyTorch': { note: 'Used for model experimentation alongside fine-tuning work on LLMs.', quote: 'Dynamic graphs, for when your ideas change mid-training.' },
  'TensorFlow': { note: 'The other half of the deep learning toolkit, for when production stability matters.', quote: 'Built for scale, forgiven for its verbosity.' },
  'Scikit-learn': { note: 'The first stop for any predictive model before reaching for something heavier.', quote: 'Solves 80% of ML problems with 20% of the drama.' },
  'RAG': { note: "The core of NextStep Bot's ability to answer with actual, grounded information.", quote: "Because a language model's memory shouldn't be the only source of truth." },
  'LLM Fine-tuning': { note: "Used QLoRA to specialize models for career guidance and Pinaka AI's financial insights.", quote: 'Teaching a model new tricks without teaching it everything from scratch.' }
};
const CATEGORY_LABELS = { lang: 'Languages', web: 'Web & Frameworks', tools: 'Tools & Platforms', data: 'Data & ML' };
const CATEGORY_COLORS = { lang: '#6f95f2', web: '#4fd6c4', tools: '#f0b84f', data: '#b79bf5' };

const bookModalOverlay = document.getElementById('bookModalOverlay');
const bookModal = document.getElementById('bookModal');
const bookModalClose = document.getElementById('bookModalClose');
const bookModalKicker = document.getElementById('bookModalKicker');
const bookModalTitle = document.getElementById('bookModalTitle');
const bookModalNote = document.getElementById('bookModalNote');
const bookModalQuote = document.getElementById('bookModalQuote');
const bookModalAttr = document.getElementById('bookModalAttr');

function openBookModal(book) {
  const name = book.querySelector('span').textContent;
  const info = SKILL_NOTES[name];
  if (!info) return;
  const category = ['lang', 'web', 'tools', 'data'].find(c => book.classList.contains(c));

  bookModal.style.setProperty('--modal-color', CATEGORY_COLORS[category] || '');
  bookModalKicker.textContent = CATEGORY_LABELS[category] || '';
  bookModalTitle.textContent = name;
  bookModalNote.textContent = info.note;
  bookModalQuote.textContent = `“${info.quote}”`;
  if (info.attribution) {
    bookModalAttr.textContent = `- ${info.attribution}`;
    bookModalAttr.hidden = false;
  } else {
    bookModalAttr.hidden = true;
  }

  bookModalOverlay.hidden = false;
  requestAnimationFrame(() => bookModalOverlay.classList.add('open'));
  document.body.style.overflow = 'hidden';
}

function closeBookModal() {
  bookModalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { bookModalOverlay.hidden = true; }, 250);
}

document.querySelectorAll('.book').forEach(book => {
  book.setAttribute('role', 'button');
  book.setAttribute('tabindex', '0');
  book.addEventListener('click', () => openBookModal(book));
  book.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openBookModal(book);
    }
  });
});
bookModalClose.addEventListener('click', closeBookModal);
bookModalOverlay.addEventListener('click', (e) => {
  if (e.target === bookModalOverlay) closeBookModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !bookModalOverlay.hidden) closeBookModal();
});

// Contact form: submit via FormSubmit's AJAX endpoint (no backend required)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const CONTACT_EMAIL = 'swasti.s245@gmail.com';
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById('formStatus');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;

    statusEl.hidden = true;
    statusEl.classList.remove('success', 'error');
    submitBtn.disabled = true;
    submitBtn.classList.add('sending');

    const frames = ['[□□□□]', '[■□□□]', '[■■□□]', '[■■■□]', '[■■■■]'];
    let frame = 0;
    submitBtn.textContent = `$ sending ${frames[0]}`;
    const ticker = setInterval(() => {
      frame = (frame + 1) % frames.length;
      submitBtn.textContent = `$ sending ${frames[frame]}`;
    }, 140);
    // keep the transmit readout on screen long enough to be seen on a fast response
    const minDisplay = new Promise(resolve => setTimeout(resolve, 900));

    let sent = false;
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(contactForm)
      });
      if (!res.ok) throw new Error('Request failed');
      sent = true;
    } catch (err) {
      sent = false;
    }
    await minDisplay;
    clearInterval(ticker);
    submitBtn.classList.remove('sending');

    if (sent) {
      statusEl.textContent = 'Received and bookmarked. I’ll reply soon.';
      statusEl.classList.add('success');
      contactForm.reset();
      submitBtn.textContent = '200 OK';
      submitBtn.classList.add('sent');
      setTimeout(() => {
        submitBtn.classList.remove('sent');
        submitBtn.textContent = originalLabel;
        submitBtn.disabled = false;
      }, 2600);
    } else {
      statusEl.textContent = 'Something went wrong. Please email me directly instead.';
      statusEl.classList.add('error');
      submitBtn.textContent = originalLabel;
      submitBtn.disabled = false;
    }
    statusEl.hidden = false;
  });
}

// ---------- Text decrypt: characters cycle through code glyphs, then settle left to right ----------
const SCRAMBLE_GLYPHS = '{}[]<>/\\=+*#$%_01';
function scramble(el, duration = 700) {
  const id = (el._scrambleId || 0) + 1;
  el._scrambleId = id;
  el.setAttribute('aria-label', el.textContent);
  el.style.minHeight = `${el.offsetHeight}px`;

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  const cells = [];
  const swaps = textNodes.map(node => {
    const wrap = document.createElement('span');
    for (const ch of node.textContent) {
      const span = document.createElement('span');
      span.textContent = ch;
      wrap.appendChild(span);
      if (ch.trim()) cells.push({ span, ch });
    }
    node.replaceWith(wrap);
    return { node, wrap };
  });
  cells.forEach((c, i) => {
    c.at = (i / cells.length) * duration * 0.75 + Math.random() * duration * 0.25;
    c.span.className = 'scr';
  });

  const start = performance.now();
  let lastShuffle = 0;
  function tick(now) {
    if (el._scrambleId !== id) return;
    const elapsed = now - start;
    const shuffle = now - lastShuffle > 45;
    if (shuffle) lastShuffle = now;
    let pending = 0;
    cells.forEach(c => {
      if (elapsed >= c.at) {
        if (c.span.className) { c.span.textContent = c.ch; c.span.className = ''; }
      } else {
        pending++;
        if (shuffle) c.span.textContent = SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
      }
    });
    if (pending) { requestAnimationFrame(tick); return; }
    swaps.forEach(({ node, wrap }) => wrap.replaceWith(node));
    el.removeAttribute('aria-label');
    el.style.minHeight = '';
  }
  requestAnimationFrame(tick);
}

if (!reduceMotion) {
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      titleObserver.unobserve(entry.target);
      scramble(entry.target);
    });
  }, { threshold: 1, rootMargin: '0px 0px -15% 0px' });
  document.querySelectorAll('.section-title').forEach(t => titleObserver.observe(t));
}

// ---------- Reading progress: nav bar + chapter readout ----------
const readProgress = document.getElementById('readProgress');
const rsChapter = document.getElementById('rsChapter');
const rsName = document.getElementById('rsName');
const rsPct = document.getElementById('rsPct');
const chapters = [
  ['top', 'preface'], ['about', 'about'], ['skills', 'skills'], ['education', 'education'],
  ['projects', 'projects'], ['experience', 'experience'], ['contact', 'contact']
].map(([id, name]) => ({ el: document.getElementById(id), name })).filter(c => c.el);
let currentChapter = -1;

function updateReading() {
  if (!readProgress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
  readProgress.style.transform = `scaleX(${ratio.toFixed(4)})`;
  rsPct.textContent = `${Math.round(ratio * 100)}%`;

  const line = window.innerHeight * 0.4;
  let idx = 0;
  chapters.forEach((c, i) => { if (c.el.getBoundingClientRect().top <= line) idx = i; });
  if (ratio > 0.995) idx = chapters.length - 1;
  if (idx === currentChapter) return;
  currentChapter = idx;
  rsChapter.textContent = `ch.${String(idx).padStart(2, '0')}/${String(chapters.length - 1).padStart(2, '0')}`;
  rsName.textContent = chapters[idx].name;
  if (!reduceMotion) scramble(rsName, 380);
}

// ---------- Git-graph timeline: branch line fills on scroll, roles commit when reached ----------
const gitTimeline = document.querySelector('#experience .timeline');
const commits = gitTimeline ? [...gitTimeline.querySelectorAll('.timeline-item')].map(item => {
  const msg = item.querySelector('.commit-msg');
  return { item, marker: item.querySelector('.timeline-marker'), msg, text: msg ? msg.textContent : '', typed: false };
}) : [];
if (gitTimeline && !reduceMotion) {
  gitTimeline.classList.add('git-live');
  commits.forEach(c => { if (c.msg) c.msg.textContent = ''; });
}

function typeCommit(c) {
  c.typed = true;
  if (!c.msg) return;
  c.msg.classList.add('typing');
  let i = 0;
  const timer = setInterval(() => {
    c.msg.textContent = c.text.slice(0, ++i);
    if (i >= c.text.length) {
      clearInterval(timer);
      c.msg.classList.remove('typing');
    }
  }, 24);
}

function updateTimeline() {
  if (!gitTimeline || reduceMotion) return;
  const rect = gitTimeline.getBoundingClientRect();
  const progress = clamp((window.innerHeight * 0.65 - rect.top) / rect.height, 0, 1);
  gitTimeline.style.setProperty('--line', progress.toFixed(4));
  const reach = progress * rect.height;
  commits.forEach(c => {
    const done = c.item.offsetTop + c.marker.offsetTop + c.marker.offsetHeight / 2 <= reach + 1;
    c.item.classList.toggle('committed', done);
    if (done && !c.typed) typeCommit(c);
  });
}

let scrollQueued = false;
function onScrollFrame() {
  scrollQueued = false;
  updateTimeline();
  updateReading();
}
function queueScrollFrame() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(onScrollFrame);
}
window.addEventListener('scroll', queueScrollFrame, { passive: true });
window.addEventListener('resize', queueScrollFrame);
window.addEventListener('load', queueScrollFrame);
queueScrollFrame();

// ---------- Bookshelf browsing + magnetic buttons (mouse only) ----------
if (finePointer && !reduceMotion) {
  document.querySelectorAll('.shelf').forEach(shelf => {
    const books = [...shelf.querySelectorAll('.book')];
    shelf.addEventListener('pointermove', (e) => {
      const rects = books.map(b => b.getBoundingClientRect());
      books.forEach((b, i) => {
        const r = rects[i];
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        b.style.setProperty('--lean', Math.max(0, 1 - d / 120).toFixed(3));
      });
    });
    shelf.addEventListener('pointerleave', () => books.forEach(b => b.style.removeProperty('--lean')));
  });

  document.querySelectorAll('.hero-cta .btn, .contact-links .btn, .contact-form .btn').forEach(btn => {
    btn.classList.add('magnetic');
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', `${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px`);
      btn.style.setProperty('--my', `${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px`);
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.removeProperty('--mx');
      btn.style.removeProperty('--my');
    });
  });
}

// ---------- Reading lamp: dot-grid page; the cursor glows and reveals code glyphs ----------
(function () {
  const canvas = document.getElementById('lampCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const SPACING = 28;
  const RADIUS = 170;
  const PARALLAX = 0.12;
  const GLYPHS = '{}[]()<>/;=+*#$_01';
  const lamp = { x: 0, y: 0, tx: 0, ty: 0, a: 0, ta: 0 };
  let width = 0, height = 0, raf = 0, lastMove = 0;

  function hash(c, r) {
    let n = (Math.imul(c, 374761393) + Math.imul(r, 668265263)) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(now) {
    ctx.clearRect(0, 0, width, height);
    const shift = reduceMotion ? 0 : window.scrollY * PARALLAX;
    const rowBase = Math.floor(shift / SPACING);
    const offsetY = rowBase * SPACING - shift;
    const half = SPACING / 2;
    const cols = Math.ceil(width / SPACING) + 1;
    const rows = Math.ceil(height / SPACING) + 1;
    const lit = lamp.a > 0.01;

    if (lit) {
      const reach = RADIUS * 1.3;
      const glow = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, reach);
      glow.addColorStop(0, `rgba(79, 214, 196, ${0.07 * lamp.a})`);
      glow.addColorStop(1, 'rgba(79, 214, 196, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(lamp.x - reach, lamp.y - reach, reach * 2, reach * 2);
    }

    ctx.fillStyle = 'rgba(139, 149, 165, 0.16)';
    for (let r = 0; r < rows; r++) {
      const y = offsetY + r * SPACING + half;
      for (let c = 0; c < cols; c++) ctx.fillRect(c * SPACING + half - 0.7, y - 0.7, 1.4, 1.4);
    }
    if (!lit) return;

    const c0 = Math.max(0, Math.floor((lamp.x - RADIUS) / SPACING));
    const c1 = Math.min(cols - 1, Math.ceil((lamp.x + RADIUS) / SPACING));
    const r0 = Math.max(0, Math.floor((lamp.y - RADIUS - offsetY) / SPACING));
    const r1 = Math.min(rows - 1, Math.ceil((lamp.y + RADIUS - offsetY) / SPACING));
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let r = r0; r <= r1; r++) {
      const y = offsetY + r * SPACING + half;
      for (let c = c0; c <= c1; c++) {
        const x = c * SPACING + half;
        const d = Math.hypot(x - lamp.x, y - lamp.y);
        if (d >= RADIUS) continue;
        let t = 1 - d / RADIUS;
        t = t * t * (3 - 2 * t) * lamp.a;
        const h = hash(c, r + rowBase);
        if (h < 0.13 && t > 0.3) {
          ctx.clearRect(x - 1, y - 1, 2, 2);
          ctx.fillStyle = `rgba(79, 214, 196, ${Math.min(1, t * 1.1).toFixed(3)})`;
          ctx.fillText(GLYPHS[(Math.floor(h * 997) + Math.floor((now + h * 4200) / 420)) % GLYPHS.length], x, y);
        } else {
          ctx.fillStyle = `rgba(79, 214, 196, ${(0.1 + 0.6 * t).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, 0.8 + 1.6 * t, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  function frame(now) {
    raf = 0;
    lamp.x += (lamp.tx - lamp.x) * 0.18;
    lamp.y += (lamp.ty - lamp.y) * 0.18;
    lamp.a += (lamp.ta - lamp.a) * 0.1;
    draw(now);
    const settling = Math.abs(lamp.tx - lamp.x) + Math.abs(lamp.ty - lamp.y) > 0.5 || Math.abs(lamp.ta - lamp.a) > 0.005;
    if (settling || (lamp.a > 0.01 && now - lastMove < 1600)) request();
  }
  function request() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  resize();
  request();
  window.addEventListener('resize', () => { resize(); request(); });
  if (!reduceMotion) window.addEventListener('scroll', request, { passive: true });

  if (finePointer && !reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (lamp.a < 0.02) { lamp.x = e.clientX; lamp.y = e.clientY; }
      lamp.tx = e.clientX;
      lamp.ty = e.clientY;
      lamp.ta = 1;
      lastMove = performance.now();
      request();
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => { lamp.ta = 0; request(); });
  }
})();
