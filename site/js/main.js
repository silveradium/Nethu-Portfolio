(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------------
     Hero bubble parallax — back layer drifts down (0.3×), front layer rises
     (0.55×) as the page scrolls, as in the design.
     ------------------------------------------------------------------------ */
  const back = document.querySelector('.bubbles--back');
  const front = document.querySelector('.bubbles--front');
  const hero = document.querySelector('.hero');

  if (back && front && hero) {
    let raf = 0;
    let settled = false;

    const apply = (y) => {
      back.style.transform = `translate3d(0,${y * 0.3}px,0)`;
      front.style.transform = `translate3d(0,${-y * 0.55}px,0)`;
    };

    const update = () => {
      raf = 0;
      if (reduceMotion.matches) { apply(0); return; }
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      // Stop writing transforms once the hero is well out of view.
      const limit = hero.offsetHeight * 1.2;
      if (y > limit) {
        if (settled) return;
        settled = true;
        apply(limit);
        return;
      }
      settled = false;
      apply(y);
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    reduceMotion.addEventListener?.('change', onScroll);
    update();
  }

  /* ------------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------------ */
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('mobile-menu');

  if (toggle && menu) {
    const setOpen = (open, { focusToggle = false } = {}) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('menu-open', open);
      if (open) menu.querySelector('a')?.focus({ preventScroll: true });
      else if (focusToggle) toggle.focus({ preventScroll: true });
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false, { focusToggle: true });
    });
    // Close if the viewport grows past the mobile breakpoint while open.
    window.matchMedia('(min-width: 800px)').addEventListener?.('change', (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------------
     Canva embed — inject the iframe only when it's about to scroll into view.
     ------------------------------------------------------------------------ */
  const loadEmbed = (el) => {
    if (el.classList.contains('is-loaded')) return;
    const iframe = document.createElement('iframe');
    iframe.src = el.dataset.embedSrc;
    iframe.title = el.dataset.embedTitle || '';
    iframe.loading = 'lazy';
    iframe.allow = 'fullscreen';
    iframe.allowFullscreen = true;
    iframe.addEventListener('load', () => el.classList.add('is-loaded'), { once: true });
    el.appendChild(iframe);
  };

  const embeds = document.querySelectorAll('[data-embed-src]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        loadEmbed(entry.target);
      });
    }, { rootMargin: '600px 0px' });
    embeds.forEach((el) => io.observe(el));
  } else {
    embeds.forEach(loadEmbed);
  }

  /* ------------------------------------------------------------------------
     YouTube — poster + play button; the player loads only on click.
     Without JS the link simply opens the video on YouTube.
     ------------------------------------------------------------------------ */
  document.querySelectorAll('.yt[data-yt-id]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(link.dataset.ytId)}?autoplay=1&rel=0`;
      iframe.title = link.dataset.ytTitle || 'YouTube video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      link.replaceWith(iframe);
      iframe.focus();
    });
  });
})();
