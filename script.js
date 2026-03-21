/* ═══════════════════════════════════════
   script.js — Геннадий Ильичук
═══════════════════════════════════════ */

'use strict';

// ─── DOM REFS ────────────────────────────────
// Картинки встроены в HTML через base64 src — JS-инжекция не нужна
const loader         = document.getElementById('loader');
const navbar         = document.getElementById('navbar');
const burger         = document.getElementById('burger');
const mobileMenu     = document.getElementById('mobileMenu');
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');

// ══════════════════════════════════════════════
//  LOADER
// ══════════════════════════════════════════════
function hideLoader() {
  // Use requestAnimationFrame to ensure DOM is painted before reveal check
  setTimeout(() => {
    loader.classList.add('hide');
    // Small delay so CSS transition finishes before we trigger reveals
    setTimeout(() => {
      startHeroReveal();
      // Re-trigger reveal for any elements now visible after loader hides
      document.querySelectorAll('[data-reveal],[data-reveal-left],[data-reveal-right],[data-tl],[data-spec],[data-stat]').forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && !el.classList.contains('revealed')) {
          setTimeout(() => el.classList.add('revealed'), 200 + i * 60);
        }
      });
    }, 100);
  }, 1400);
}

// ══════════════════════════════════════════════
//  CUSTOM CURSOR
// ══════════════════════════════════════════════
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

function initCursor() {
  if (window.innerWidth < 600) return;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  (function animateCursor() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top  = followerY + 'px';
    requestAnimationFrame(animateCursor);
  })();
}

// ══════════════════════════════════════════════
//  NAVBAR
// ══════════════════════════════════════════════
function initNavbar() {
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ══════════════════════════════════════════════
//  BURGER / MOBILE MENU
// ══════════════════════════════════════════════
function initBurger() {
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ══════════════════════════════════════════════
//  SMOOTH NAV SCROLL (anchor links)
// ══════════════════════════════════════════════
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ══════════════════════════════════════════════
//  HERO HEADING REVEAL
// ══════════════════════════════════════════════
function startHeroReveal() {
  document.querySelectorAll('.hero-heading .line').forEach((line, i) => {
    const inner = document.createElement('span');
    inner.innerHTML = line.innerHTML;
    line.innerHTML = '';
    line.appendChild(inner);
    setTimeout(() => line.classList.add('visible'), i * 120);
  });
}

// ══════════════════════════════════════════════
//  INTERSECTION OBSERVER — SCROLL REVEALS
// ══════════════════════════════════════════════
function initReveal() {
  const selectors = [
    '[data-reveal]',
    '[data-reveal-left]',
    '[data-reveal-right]',
    '[data-tl]',
    '[data-spec]',
    '[data-stat]',
  ];

  const elements = document.querySelectorAll(selectors.join(', '));

  // Immediately reveal elements already in viewport on load
  function revealIfVisible(el, delay) {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setTimeout(() => el.classList.add('revealed'), delay);
      return true;
    }
    return false;
  }

  // Use low threshold + no rootMargin so mobile browsers trigger correctly
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // stagger siblings of same type
      const attrName = el.getAttributeNames().find(a => a.startsWith('data-'));
      const siblings = attrName
        ? [...el.parentElement.children].filter(c => c.hasAttribute(attrName))
        : [];
      const idx = Math.max(0, siblings.indexOf(el));
      const delay = idx * 80;

      setTimeout(() => el.classList.add('revealed'), delay);
      io.unobserve(el);
    });
  }, {
    threshold: 0,
    rootMargin: '0px 0px -20px 0px',
  });

  elements.forEach((el, i) => {
    // Check if already visible (hero elements, first section)
    if (!revealIfVisible(el, i * 60)) {
      io.observe(el);
    }
  });
}

// ══════════════════════════════════════════════
//  COUNT-UP ANIMATION
// ══════════════════════════════════════════════
function countUp(el, target, duration = 1600) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCountUp() {
  const statCards = document.querySelectorAll('[data-stat]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const numEl = entry.target.querySelector('[data-count]');
      if (numEl) {
        const target = parseInt(numEl.getAttribute('data-count'), 10);
        countUp(numEl, target);
      }
      io.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  statCards.forEach(c => io.observe(c));
}

// ══════════════════════════════════════════════
//  PARALLAX — hero bg text
// ══════════════════════════════════════════════
function initParallax() {
  const bgText = document.querySelector('.hero-bg-text');
  const credBg = document.querySelector('.cred-bg-word');
  if (!bgText && !credBg) return;

  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    if (bgText) bgText.style.transform = `translateY(calc(-50% + ${sy * 0.25}px))`;
  }, { passive: true });
}

// ══════════════════════════════════════════════
//  SPEC CARD TILT
// ══════════════════════════════════════════════
function initTilt() {
  document.querySelectorAll('.spec-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-8px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s var(--ease-out)';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.15s ease';
    });
  });
}

// ══════════════════════════════════════════════
//  ACTIVE NAV LINK ON SCROLL
// ══════════════════════════════════════════════
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.style.color = '');
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.style.color = 'var(--orange-light)';
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

  sections.forEach(s => io.observe(s));
}

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
function init() {
  initCursor();
  initNavbar();
  initBurger();
  initSmoothScroll();
  initReveal();
  initCountUp();
  initParallax();
  initTilt();
  initActiveNav();
  hideLoader();
}

document.addEventListener('DOMContentLoaded', init);
