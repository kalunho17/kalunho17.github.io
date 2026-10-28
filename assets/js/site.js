/* kalunho.com: click-to-load video and fade-in on first view. No dependencies. */
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
