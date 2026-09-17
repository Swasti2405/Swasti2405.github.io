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
    submitBtn.textContent = 'Sending...';

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(contactForm)
      });
      if (!res.ok) throw new Error('Request failed');
      statusEl.textContent = 'Received and bookmarked. I’ll reply soon.';
      statusEl.classList.add('success');
      contactForm.reset();
    } catch (err) {
      statusEl.textContent = 'Something went wrong. Please email me directly instead.';
      statusEl.classList.add('error');
    } finally {
      statusEl.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
}
