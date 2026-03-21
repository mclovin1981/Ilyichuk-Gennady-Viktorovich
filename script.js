/* ═══════════════════════════════════════
   script.js — Геннадий Ильичук (FIXED)
═══════════════════════════════════════ */

'use strict';

// ─── DOM REFS ────────────────────────────────
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
  setTimeout(() => {
    loader.classList.add('hide');
    // Запускаем анимации после скрытия лоадера
    setTimeout(() => {
      startHeroReveal();
      triggerRevealOnVisible();
    }, 100);
  }, 1400);
}

// ══════════════════════════════════════════════
//  TRIGGER REVEAL FOR VISIBLE ELEMENTS
// ══════════════════════════════════════════════
function triggerRevealOnVisible() {
  const elements = document.querySelectorAll('[data-reveal], [data-reveal-left], [data-reveal-right], [data-tl], [data-spec], [data-stat]');
  
  elements.forEach((el, index) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 100 && !el.classList.contains('revealed')) {
      setTimeout(() => {
        el.classList.add('revealed');
      }, index * 60);
    }
  });
}

// ══════════════════════════════════════════════
//  CUSTOM CURSOR (только на десктопе)
// ══════════════════════════════════════════════
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

function initCursor() {
  if (window.innerWidth < 600 || !cursor || !cursorFollower) return;
  
  // Скрываем курсор на тач-устройствах
  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    cursorFollower.style.display = 'none';
    return;
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  function animateCursor() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top  = followerY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}

// ══════════════════════════════════════════════
//  NAVBAR SCROLL
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
  if (!burger || !mobileMenu) return;
  
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
//  SMOOTH SCROLL
// ══════════════════════════════════════════════
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
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
  const lines = document.querySelectorAll('.hero-heading .line');
  lines.forEach((line, i) => {
    // Проверяем, есть ли уже span внутри
    if (!line.querySelector('span')) {
      const inner = document.createElement('span');
      inner.innerHTML = line.innerHTML;
      line.innerHTML = '';
      line.appendChild(inner);
    }
    setTimeout(() => line.classList.add('visible'), i * 120);
  });
}

// ══════════════════════════════════════════════
//  INTERSECTION OBSERVER — MAIN REVEAL SYSTEM
// ══════════════════════════════════════════════
function initReveal() {
  const selectors = [
    '[data-reveal]',
    '[data-reveal-left]',
    '[data-reveal-right]',
    '[data-tl]',
    '[data-spec]',
    '[data-stat]'
  ];

  const elements = document.querySelectorAll(selectors.join(', '));
  
  // Проверяем, есть ли элементы для анимации
  if (elements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const siblings = el.parentElement?.children;
        let delay = 0;
        
        // Добавляем задержку для последовательного появления
        if (siblings) {
          const index = Array.from(siblings).indexOf(el);
          delay = Math.min(index * 80, 400);
        }
        
        setTimeout(() => {
          el.classList.add('revealed');
        }, delay);
        
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  // Наблюдаем за всеми элементами
  elements.forEach(el => observer.observe(el));
  
  // Дополнительно: проверяем видимые элементы при загрузке
  setTimeout(() => {
    elements.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 50) {
        setTimeout(() => el.classList.add('revealed'), idx * 60);
        observer.unobserve(el);
      }
    });
  }, 200);
}

// ══════════════════════════════════════════════
//  COUNT-UP ANIMATION
// ══════════════════════════════════════════════
function countUp(el, target, duration = 1600) {
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target;
    }
  };
  requestAnimationFrame(step);
}

function initCountUp() {
  const statCards = document.querySelectorAll('[data-stat]');
  if (statCards.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.hasAttribute('data-counted')) {
        const numEl = entry.target.querySelector('[data-count]');
        if (numEl) {
          const target = parseInt(numEl.getAttribute('data-count'), 10);
          countUp(numEl, target);
          entry.target.setAttribute('data-counted', 'true');
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  statCards.forEach(card => observer.observe(card));
}

// ══════════════════════════════════════════════
//  PARALLAX EFFECT
// ══════════════════════════════════════════════
function initParallax() {
  const bgText = document.querySelector('.hero-bg-text');
  const credBg = document.querySelector('.cred-bg-word');
  
  if (!bgText && !credBg) return;

  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    if (bgText) bgText.style.transform = `translateY(calc(-50% + ${sy * 0.2}px))`;
  }, { passive: true });
}

// ══════════════════════════════════════════════
//  ACTIVE NAV LINK
// ══════════════════════════════════════════════
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  
  if (sections.length === 0 || links.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.style.color = 'var(--orange-light)';
          }
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
  
  sections.forEach(section => observer.observe(section));
}

// ══════════════════════════════════════════════
//  INIT ALL
// ══════════════════════════════════════════════
function init() {
  // Сначала показываем лоадер
  if (loader) {
    // На всякий случай, если лоадер долго висит
    setTimeout(() => {
      if (!loader.classList.contains('hide')) {
        loader.classList.add('hide');
        startHeroReveal();
        initReveal();
      }
    }, 3000);
    hideLoader();
  } else {
    startHeroReveal();
  }
  
  // Запускаем все остальное
  initCursor();
  initNavbar();
  initBurger();
  initSmoothScroll();
  initReveal();
  initCountUp();
  initParallax();
  initActiveNav();
  
  // Фикс для картинок - добавляем версию для сброса кеша
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    const src = img.src;
    if (src && !src.includes('base64') && !src.includes('blob')) {
      img.src = src.split('?')[0] + '?v=' + Date.now();
    }
  });
}

// Запускаем после полной загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Дополнительно: при изменении размера окна перепроверяем видимые элементы
window.addEventListener('resize', () => {
  setTimeout(() => {
    const elements = document.querySelectorAll('[data-reveal], [data-reveal-left], [data-reveal-right], [data-tl], [data-spec], [data-stat]');
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 50 && !el.classList.contains('revealed')) {
        el.classList.add('revealed');
      }
    });
  }, 100);
});
