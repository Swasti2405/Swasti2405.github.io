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
