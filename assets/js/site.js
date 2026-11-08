/* kalunho.com: click-to-load video, colour theme toggle and fade-in on first view. No dependencies. */
(function () {
  'use strict';

  // Click-to-load YouTube: nothing is requested from YouTube until the visitor clicks.
  // Without JavaScript (or before the playlist ID is filled in) the poster stays a plain link.
  document.querySelectorAll('[data-playlist]').forEach(function (poster) {
    var playlist = poster.getAttribute('data-playlist');
    if (!/^[\w-]+$/.test(playlist)) return;

    poster.setAttribute('role', 'button');
    poster.addEventListener('keydown', function (event) {
      if (event.key === ' ') { event.preventDefault(); poster.click(); }
    });
    poster.addEventListener('click', function (event) {
      event.preventDefault();
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/videoseries?list=' + playlist + '&autoplay=1&rel=0';
      frame.title = poster.getAttribute('data-title') || 'YouTube video player';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      poster.replaceWith(frame);
      frame.focus();
    });
  });

  // Colour theme toggle: light → dark → system → light. Light is the default: it removes
  // the stored choice. "dark" and "system" (follow the device) are stored in localStorage
  // under "theme". The script in <head> (between THEME START and THEME END) applies a
  // stored choice before the first paint; the colours themselves are tokens in site.css.
  var root = document.documentElement;
  var THEMES = ['light', 'dark', 'system'];
  var THEME_COLOR = { light: '#FFFFFF', dark: '#10365C' };  // must match the <meta name="theme-color"> tags

  function currentTheme() {
    var theme = root.getAttribute('data-theme');
    return theme === 'dark' || theme === 'system' ? theme : 'light';
  }

  function nextTheme(theme) {
    return THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  }

  function setTheme(theme) {
    if (theme === 'light') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try {
      if (theme === 'light') localStorage.removeItem('theme');
      else localStorage.setItem('theme', theme);
    } catch (error) { /* storage blocked: the choice lasts until the page is closed */ }
    // Browser chrome: each tag keeps its own colour for "system", both follow a fixed choice
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
      var mode = theme === 'system' ? (/dark/.test(meta.media) ? 'dark' : 'light') : theme;
      meta.content = THEME_COLOR[mode];
    });
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
    function updateLabel() {
      var theme = currentTheme();
      var label = 'Colour theme: ' + theme + '. Switch to ' + nextTheme(theme) + '.';
      button.setAttribute('aria-label', label);
      button.title = label;
    }
    updateLabel();
    button.addEventListener('click', function () {
      // Short cross-fade (site.css), never with reduced motion
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        root.classList.add('theme-switching');
        window.setTimeout(function () { root.classList.remove('theme-switching'); }, 250);
      }
      setTheme(nextTheme(currentTheme()));
      updateLabel();
    });
  });

  // Fade in with a 12 px rise on first view. Only for content below the fold,
  // so nothing on screen ever disappears, and never with reduced motion.
  var items = document.querySelectorAll('[data-reveal]');
  if (!items.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  items.forEach(function (item) {
    if (item.getBoundingClientRect().top < window.innerHeight) return;
    var group = item.closest('[data-reveal-group]');
    var index = group ? Array.prototype.indexOf.call(group.querySelectorAll('[data-reveal]'), item) : 0;
    item.style.setProperty('--reveal-i', index);
    item.classList.add('reveal-pending');
    observer.observe(item);
  });
})();
