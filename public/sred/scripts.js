/* =========================================
   EXECOM Global Scripts
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Nav scroll effect ----
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ---- Mobile nav toggle ----
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const spans = toggle.querySelectorAll('span');
      if (links.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });
    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }

  // ---- Scroll reveal ----
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    // Enable animations only after observer is confirmed working
    document.body.classList.add('reveal-init');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });
    reveals.forEach(el => observer.observe(el));
    // Fallback: if nothing becomes visible after 2s, force all visible
    setTimeout(() => {
      const still = document.querySelectorAll('.reveal:not(.visible)');
      if (still.length === reveals.length) {
        document.body.classList.remove('reveal-init');
      }
    }, 2000);
  }

  // ---- FAQ accordion ----
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      // Toggle current
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ---- Savings calculator ----
  const calcInput = document.getElementById('calcRefund');
  const calcThem = document.getElementById('calcThem');
  const calcUs = document.getElementById('calcUs');
  const calcSave = document.getElementById('calcSave');

  function fmt(n) { return '$' + Math.round(n).toLocaleString('en-CA'); }

  function runCalc() {
    if (!calcInput) return;
    const raw = calcInput.value.replace(/[^0-9]/g, '');
    const refund = parseFloat(raw) || 0;
    const them = refund * 0.20;
    const us = Math.max(refund * 0.05, 10000);
    const save = them - us;
    if (calcThem) calcThem.textContent = fmt(them);
    if (calcUs) calcUs.textContent = fmt(us);
    if (calcSave) calcSave.textContent = fmt(Math.max(save, 0));
  }

  if (calcInput) {
    calcInput.addEventListener('input', function () {
      const raw = this.value.replace(/[^0-9]/g, '');
      this.value = raw ? parseInt(raw).toLocaleString('en-CA') : '';
      runCalc();
    });
    runCalc();
  }

  // ---- Counter animation ----
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          const target = parseInt(entry.target.dataset.count);
          const suffix = entry.target.dataset.suffix || '';
          const prefix = entry.target.dataset.prefix || '';
          const duration = 1500;
          const start = performance.now();
          function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            entry.target.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.3 });
    counters.forEach(el => counterObserver.observe(el));
  }

  // ---- Form submit (mailto fallback) ----
  const form = document.getElementById('intakeForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const fd = new FormData(this);
      const body = [];
      for (const [k, v] of fd.entries()) body.push(k + ': ' + v);
      const mailto = 'mailto:action@execom.ca?subject=' +
        encodeURIComponent('SR&ED Intake: ' + (fd.get('company') || 'New Lead')) +
        '&body=' + encodeURIComponent(body.join('\n'));
      window.location.href = mailto;
    });
  }

  // ---- Active nav link highlight ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

});
