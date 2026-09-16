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

// Cursor-tracked spotlight glow on project cards
if (!reduceMotion) {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--y', `${e.clientY - rect.top}px`);
    });
  });
}

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
      statusEl.textContent = "Message sent. I'll get back to you soon.";
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
