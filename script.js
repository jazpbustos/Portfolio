'use strict';

/* No animation library or runtime dependency. The page remains readable without JS. */
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const root = document.documentElement;
if (!motionPreference.matches) root.classList.add('motion-ready');

// Reveal once; never take visible content away when scrolling back.
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -12px 0px' });
  reveals.forEach(element => revealObserver.observe(element));
} else {
  reveals.forEach(element => element.classList.add('is-visible'));
}

const header = document.querySelector('.site-header');
const scrollProgress = document.querySelector('.scroll-progress');
const parallaxStages = [...document.querySelectorAll('[data-parallax]')];
const scrollScenes = [...document.querySelectorAll('.small-cover.device-scene')];
let scrollFrame = 0;
const sectionLinks = [...document.querySelectorAll('[data-section]')];
let activeSection = null;
function updateSectionNavigation(position, maximum) {
  if (!sectionLinks.length) return;
  let current = '';
  const marker = Math.max(100, innerHeight * .3);
  sectionLinks.forEach(link => {
    const section = document.getElementById(link.dataset.section);
    if (section && section.getBoundingClientRect().top <= marker) current = section.id;
  });
  if (maximum > 1 && position >= maximum - 4) current = sectionLinks[sectionLinks.length - 1].dataset.section;
  if (activeSection === current) return;
  activeSection = current;
  sectionLinks.forEach(link => {
    const active = link.dataset.section === current;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function renderScroll() {
  scrollFrame = 0;
  const position = window.scrollY;
  const max = Math.max(1, root.scrollHeight - window.innerHeight);
  scrollProgress.style.transform = `scaleX(${Math.min(1, position / max)})`;
  header.classList.toggle('is-scrolled', position > 30);
  updateSectionNavigation(position, max);
  if (motionPreference.matches || !finePointer.matches || innerWidth <= 900) return;
  scrollScenes.forEach(scene => {
    const bounds = scene.getBoundingClientRect();
    if (bounds.bottom > 0 && bounds.top < innerHeight) {
      const offset = Math.max(-24, Math.min(24, (innerHeight / 2 - bounds.top - bounds.height / 2) * .09));
      scene.style.setProperty('--scroll-drift', `${offset.toFixed(2)}px`);
    }
  });
  if (window.innerWidth > 580) {
    parallaxStages.forEach(stage => {
      const bounds = stage.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
        const offset = (window.innerHeight / 2 - bounds.top - bounds.height / 2) * 0.1;
        stage.querySelector('.parallax-layer').style.transform = `translate3d(0,${offset.toFixed(2)}px,0)`;
      }
    });
  }
}
function requestScrollRender() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(renderScroll);
}
window.addEventListener('scroll', requestScrollRender, { passive: true });
window.addEventListener('resize', () => {
  if (window.innerWidth <= 580) {
    parallaxStages.forEach(stage => stage.querySelector('.parallax-layer').style.removeProperty('transform'));
  }
  requestScrollRender();
}, { passive: true });
motionPreference.addEventListener('change', () => {
  root.classList.toggle('motion-ready', !motionPreference.matches);
  requestScrollRender();
});
renderScroll();

// Compact, keyboard-friendly navigation.
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
function closeMenu(returnFocus = false) {
  menuToggle.setAttribute('aria-expanded', 'false');
  mainNav.classList.remove('is-open');
  if (returnFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  mainNav.classList.toggle('is-open', !isOpen);
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mainNav.classList.contains('is-open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeMenu();
});
header.addEventListener('focusout', () => {
  requestAnimationFrame(() => {
    if (!header.contains(document.activeElement)) closeMenu();
  });
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 580) closeMenu();
}, { passive: true });

// Real, local interactions inside the conceptual covers (WAI-ARIA tabs).
document.querySelectorAll('[role="tablist"]').forEach(list => {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  function selectTab(tab, focus = false) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectTab(tabs[next], true);
      }
    });
  });
});

// Cursor preview and magnetic affordances: additive, never replaces the native cursor.
const pointerLabel = document.querySelector('.pointer-label');
let pointerX = 0;
let pointerY = 0;
let pointerFrame = 0;
function movePointer(event) {
  pointerX = Math.max(48, Math.min(event.clientX, window.innerWidth - 48));
  pointerY = Math.max(48, Math.min(event.clientY, window.innerHeight - 48));
  if (pointerFrame) return;
  pointerFrame = requestAnimationFrame(() => {
    pointerLabel.style.transform = `translate3d(${pointerX}px,${pointerY}px,0)`;
    pointerFrame = 0;
  });
}
document.querySelectorAll('[data-hover-label]').forEach(element => {
  element.addEventListener('pointerenter', event => {
    if (!finePointer.matches || motionPreference.matches || event.pointerType === 'touch') return;
    pointerLabel.querySelector('span').textContent = element.dataset.hoverLabel;
    movePointer(event);
    pointerLabel.classList.add('is-visible');
  });
  element.addEventListener('pointermove', movePointer);
  element.addEventListener('pointerleave', () => pointerLabel.classList.remove('is-visible'));
  element.addEventListener('click', () => pointerLabel.classList.remove('is-visible'));
});
document.querySelectorAll('.magnetic').forEach(element => {
  element.addEventListener('pointermove', event => {
    if (!finePointer.matches || motionPreference.matches || event.pointerType === 'touch') return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * .15;
    const y = (event.clientY - rect.top - rect.height / 2) * .15;
    element.style.transform = `translate(${x}px,${y}px)`;
  });
  element.addEventListener('pointerleave', () => {
    element.style.transform = '';
  });
});

// Clipboard with honest success / failure feedback, including file:// previews.
const email = 'jaz_bustos@outlook.com';
const copyButton = document.querySelector('.copy-email');
const toast = document.querySelector('.toast');
let toastTimer;
function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}
copyButton?.addEventListener('click', async () => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(email);
    notify('Email copiado. Seguimos en contacto.');
  } catch {
    notify(`Podés escribirme a ${email}`);
  }
});
document.getElementById('year').textContent = String(new Date().getFullYear());

// Pointer-driven CSS depth; screens can extend beyond their backdrop without
// moving the headings. Native links still support open-in-new-tab and history.
document.querySelectorAll('.device-scene').forEach(scene => {
  let depthFrame = 0;
  let depthX = 0;
  let depthY = 0;
  scene.addEventListener('pointermove', event => {
    if (!finePointer.matches || motionPreference.matches || event.pointerType === 'touch') return;
    const bounds = scene.getBoundingClientRect();
    depthX = -((event.clientY - bounds.top) / bounds.height - .5) * 5;
    depthY = ((event.clientX - bounds.left) / bounds.width - .5) * 7;
    if (!depthFrame) depthFrame = requestAnimationFrame(() => {
      scene.style.setProperty('--rx', `${depthX.toFixed(2)}deg`);
      scene.style.setProperty('--ry', `${depthY.toFixed(2)}deg`);
      depthFrame = 0;
    });
  });
  scene.addEventListener('pointerleave', () => {
    if (depthFrame) { cancelAnimationFrame(depthFrame); depthFrame = 0; }
    scene.style.removeProperty('--rx');
    scene.style.removeProperty('--ry');
  });
});

// A gallery within the project page; nothing opens in a modal.
const galleryImage = document.getElementById('case-gallery-image');
const galleryThumbnails = [...document.querySelectorAll('[data-gallery-index]')];
if (galleryImage && galleryThumbnails.length) {
  let selectedImage = 0;
  const galleryFigure = document.querySelector('.case-gallery');
  const galleryCaption = document.querySelector('.case-gallery-caption');
  const galleryCount = document.querySelector('.case-gallery-count');
  const galleryFull = document.querySelector('.case-gallery-full');
  function selectImage(index) {
    selectedImage = (index + galleryThumbnails.length) % galleryThumbnails.length;
    const selected = galleryThumbnails[selectedImage];
    galleryImage.src = selected.dataset.src;
    galleryImage.alt = selected.dataset.alt;
    galleryCaption.textContent = selected.dataset.caption;
    galleryCount.textContent = `${selectedImage + 1} / ${galleryThumbnails.length}`;
    galleryFull.href = selected.dataset.src;
    galleryImage.closest("a.image-expand").href = selected.dataset.src;
    galleryImage.closest("a.image-expand").setAttribute("aria-label", `Abrir imagen completa: ${selected.dataset.alt}`);
    galleryThumbnails.forEach((thumb, i) => thumb.setAttribute('aria-pressed', String(i === selectedImage)));
    if (!motionPreference.matches) galleryImage.animate([{opacity:.45,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:250,easing:'ease-out'});
  }
  galleryThumbnails.forEach((thumb, index) => thumb.addEventListener('click', () => selectImage(index)));
  document.querySelectorAll('[data-gallery-step]').forEach(button => button.addEventListener('click', () => selectImage(selectedImage + Number(button.dataset.galleryStep))));
  function galleryKeys(event) {
    if (!['ArrowLeft','ArrowRight'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    selectImage(selectedImage + (event.key === 'ArrowRight' ? 1 : -1));
  }
  galleryFigure.addEventListener('keydown', galleryKeys);
  document.querySelector('.gallery-thumbnails').addEventListener('keydown', galleryKeys);
}


// Ambient satin-like gradients: a seamless CSS loop, active only on screen.
const ambientScenes = [...document.querySelectorAll('[data-ambient]')];
if ('IntersectionObserver' in window) {
  const ambientObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-live', entry.isIntersecting));
  });
  ambientScenes.forEach(scene => ambientObserver.observe(scene));
} else ambientScenes.forEach(scene => scene.classList.add('is-live'));
document.addEventListener('visibilitychange', () => root.classList.toggle('page-hidden', document.hidden));

// Gentle wheel inertia. Touch, keyboard, zoom and nested scrolling stay native.
let wheelFrame = 0;
let wheelTarget = 0;
let wheelPosition = 0;
let wheelTime = 0;
function stopWheel() {
  if (wheelFrame) cancelAnimationFrame(wheelFrame);
  wheelFrame = 0;
  root.classList.remove('wheel-smoothing');
}
function easeWheel(time) {
  const dt = Math.min(40, Math.max(1, time - wheelTime));
  wheelTime = time;
  wheelTarget = Math.min(wheelTarget, Math.max(0, root.scrollHeight - innerHeight));
  const remaining = wheelTarget - wheelPosition;
  if (Math.abs(remaining) < .5) {
    window.scrollTo(0, wheelTarget);
    stopWheel();
    return;
  }
  wheelPosition += remaining * (1 - Math.exp(-dt / 115));
  window.scrollTo(0, wheelPosition);
  wheelFrame = requestAnimationFrame(easeWheel);
}
window.addEventListener('wheel', event => {
  if (!finePointer.matches || innerWidth <= 900 || motionPreference.matches || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  if (event.deltaMode === 0 && Math.abs(event.deltaY) < 40) { stopWheel(); return; }
  if (document.body.style.overflow === 'hidden' || mainNav.classList.contains('is-open')) return;
  for (let element = event.target instanceof Element ? event.target : null; element && element !== document.body; element = element.parentElement) {
    const css = getComputedStyle(element);
    if (['INPUT','TEXTAREA','SELECT','VIDEO','IFRAME'].includes(element.tagName) || element.isContentEditable || (/auto|scroll/.test(css.overflowY) && element.scrollHeight > element.clientHeight + 1)) {
      stopWheel();
      return;
    }
  }
  const maximum = Math.max(0, root.scrollHeight - innerHeight);
  if (!maximum) return;
  const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
  if (!wheelFrame) wheelTarget = wheelPosition = scrollY;
  wheelTarget = Math.min(maximum, Math.max(0, wheelTarget + delta));
  event.preventDefault();
  root.classList.add('wheel-smoothing');
  if (!wheelFrame) {
    wheelTime = performance.now();
    wheelFrame = requestAnimationFrame(easeWheel);
  }
}, {passive:false});
window.addEventListener('keydown', stopWheel, {passive:true});
window.addEventListener('pointerdown', stopWheel, {passive:true});
window.addEventListener('touchstart', stopWheel, {passive:true});
window.addEventListener('resize', stopWheel, {passive:true});
window.addEventListener('pagehide', stopWheel);
motionPreference.addEventListener('change', stopWheel);

// Full-size screenshots: swipe, native scrolling, named navigation and keyboard.
document.querySelectorAll('.screen-reel').forEach(reel => {
  const track = reel.querySelector('.screen-track');
  const slides = [...track.querySelectorAll('.screen-slide')];
  const indices = [...reel.querySelectorAll('[data-screen]')];
  const caption = reel.querySelector('.screen-caption');
  const count = reel.querySelector('.screen-count');
  let current = 0;
  let frame = 0;
  function renderScreen() {
    frame = 0;
    current = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
    caption.textContent = slides[current].getAttribute('aria-label').split(': ').slice(1).join(': ');
    if (count) count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    indices.forEach((button,index) => button.setAttribute('aria-pressed', String(index === current)));
  }
  function goTo(index) {
    stopWheel();
    const next = (index + slides.length) % slides.length;
    track.scrollTo({left: next * track.clientWidth, behavior: motionPreference.matches ? 'instant' : 'smooth'});
  }
  indices.forEach(button => button.addEventListener('click', () => goTo(Number(button.dataset.screen))));
  reel.querySelectorAll('[data-screen-step]').forEach(button => button.addEventListener('click', () => goTo(current + Number(button.dataset.screenStep))));
  track.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(renderScreen); }, {passive:true});
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    goTo(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  window.addEventListener('resize', () => track.scrollTo({left:current * track.clientWidth,behavior:'instant'}), {passive:true});
});
