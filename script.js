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
const heroFlower = document.querySelector('.hero-flower');
const parallaxStages = [...document.querySelectorAll('[data-parallax]')];
const contactStar = document.querySelector('.contact-star');
let scrollFrame = 0;
let scrollEnabled = true;

function renderScroll() {
  scrollFrame = 0;
  const position = window.scrollY;
  const max = Math.max(1, root.scrollHeight - window.innerHeight);
  scrollProgress.style.transform = `scaleX(${Math.min(1, position / max)})`;
  header.classList.toggle('is-scrolled', position > 30);
  if (motionPreference.matches || !scrollEnabled) return;
  heroFlower.style.transform = `rotate(${position * 0.075}deg)`;
  if (window.innerWidth > 580) {
    parallaxStages.forEach(stage => {
      const bounds = stage.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
        const offset = (window.innerHeight / 2 - bounds.top - bounds.height / 2) * 0.055;
        stage.querySelector('.parallax-layer').style.transform = `translate3d(0,${offset.toFixed(2)}px,0)`;
      }
    });
  }
  const contactBounds = contactStar.getBoundingClientRect();
  if (contactBounds.top < window.innerHeight && contactBounds.bottom > 0) {
    contactStar.style.transform = `rotate(${(window.innerHeight - contactBounds.top) * 0.08}deg)`;
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

if ('IntersectionObserver' in window) {
  const navLinks = [...document.querySelectorAll('[data-section]')];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const active = link.dataset.section === entry.target.id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
  navLinks.forEach(link => sectionObserver.observe(document.getElementById(link.dataset.section)));
}

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
  pointerX = event.clientX;
  pointerY = event.clientY;
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

// Project content: known facts only; no guessed frameworks, dates or role claims.
const projects = {
  aprendizaje: {
    category: '01 / EDUCACIÓN + INTELIGENCIA ARTIFICIAL',
    title: 'Aprendizaje adaptativo <em>con IA.</em>',
    intro: 'Un sistema educativo que integra modelos de lenguaje, personalización del aprendizaje y desarrollo de software.',
    tags: ['LLM', 'Personalización', 'Software educativo'],
    note: 'La portada es una dirección visual conceptual. No representa una captura del sistema ni una demostración del modelo de IA.',
    problemTitle: 'La idea',
    problem: 'Explorar cómo el software y los modelos de lenguaje pueden acompañar distintas formas de aprender, conectando el contenido con las necesidades de cada persona.',
    features: ['Integración de modelos de lenguaje (LLM).', 'Personalización del aprendizaje.', 'Una experiencia educativa desarrollada como sistema de software.'],
    next: 'entrenamiento', nextLabel: 'Plataforma de entrenamiento'
  },
  entrenamiento: {
    category: '02 / ENTRENAMIENTO + APLICACIÓN WEB',
    title: 'Entrenamiento <em>conectado.</em>',
    intro: 'Una aplicación web que reúne a entrenadores y alumnos, desde la planificación hasta el seguimiento del rendimiento.',
    tags: ['Gestión de usuarios', 'Planificación', 'Estadísticas', 'Mensajería'],
    note: 'La portada es una dirección visual conceptual. Las pantallas y el gráfico de ejemplo no representan datos ni capturas reales del sistema.',
    problemTitle: 'La idea',
    problem: 'Reunir las distintas partes del entrenamiento en un mismo lugar: quién entrena, qué se planifica, cómo evoluciona y cómo se comunica con su entrenador.',
    features: ['Gestión de entrenadores y alumnos.', 'Planificación de rutinas y seguimiento del rendimiento.', 'Estadísticas para acompañar el entrenamiento.', 'Mensajería e intercambio de videos.'],
    next: 'milenium', nextLabel: 'Milenium Gym'
  },
  milenium: {
    category: '03 / GESTIÓN + DESARROLLO WEB',
    title: 'Milenium <em>Gym.</em>',
    intro: 'Un sistema para centralizar la gestión de clientes, cuotas y actividades de un gimnasio.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Supabase'],
    note: 'Herramienta privada de uso interno. La galería usa las capturas de demostración del portfolio anterior.',
    problemTitle: 'El problema',
    problem: 'Organizar en una sola herramienta la información de los socios, sus pagos, las actividades y el registro de ingreso, para acompañar la operación cotidiana del gimnasio.',
    features: ['Gestión de clientes y control de deudas.', 'Registro e historial de pagos.', 'Panel de estadísticas.', 'Gestión de actividades.', 'Check-in de socios.'],
    gallery: [
      { src: 'assets/milenium-02-socios-demo.png', alt: 'Listado de socios de Milenium Gym, captura de demostración', caption: 'Gestión de socios' },
      { src: 'assets/milenium-04-detalle-socio-demo.png', alt: 'Detalle de un socio, actividades y pagos, captura de demostración', caption: 'Detalle de socio y pagos' },
      { src: 'assets/milenium-06-movimientos-demo.png', alt: 'Panel de movimientos y pagos de Milenium Gym, captura de demostración', caption: 'Movimientos e historial de pagos' },
      { src: 'assets/milenium-07-estadisticas.png', alt: 'Panel de estadísticas de Milenium Gym', caption: 'Estadísticas del sistema' }
    ],
    next: 'solana', nextLabel: 'Solana Becerra'
  },
  solana: {
    category: '04 / DISEÑO + DESARROLLO WEB',
    title: 'Solana <em>Becerra.</em>',
    intro: 'Un sitio web profesional para presentar de forma clara y accesible la identidad y el trabajo de una abogada.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Responsive'],
    problemTitle: 'Mi participación',
    problem: 'Organicé los contenidos, diseñé y desarrollé la interfaz responsive y optimicé el sitio para fortalecer su presencia online.',
    features: ['Organización y jerarquía de contenidos.', 'Diseño y desarrollo de la interfaz.', 'Adaptación a distintos dispositivos.'],
    gallery: [{ src: 'assets/solana-becerra.jpg', alt: 'Sitio web profesional de Solana Becerra, captura real', caption: 'Sitio web profesional · captura real' }],
    links: [{ href: 'https://abogadabecerra.netlify.app/', label: 'Visitar sitio ↗' }],
    next: 'aprendizaje', nextLabel: 'Aprendizaje adaptativo con IA'
  }
};
const dialog = document.getElementById('project-dialog');
const dialogBody = document.getElementById('dialog-body');
let currentProject = '';
let galleryIndex = 0;
let returnFocusTo = null;
let closingDialog = false;
let closeAnimation = null;

function renderProject(key) {
  const project = projects[key];
  if (!project) return;
  currentProject = key;
  galleryIndex = 0;
  // All markup comes from the trusted static project data above, never from URL input.
  dialogBody.innerHTML = `
    <p class="dialog-category">${project.category}</p>
    <h2 id="dialog-title">${project.title}</h2>
    <p class="dialog-intro">${project.intro}</p>
    <div class="dialog-tags">${project.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
    ${project.note ? `<p class="dialog-note">${project.note}</p>` : ''}
    ${project.gallery ? `<figure class="dialog-gallery"><div class="gallery-frame"><img id="gallery-image" src="${project.gallery[0].src}" alt="${project.gallery[0].alt}" width="1366" height="768"></div><figcaption class="gallery-bar"><span class="gallery-caption" aria-live="polite">${project.gallery[0].caption}</span>${project.gallery.length > 1 ? `<div class="gallery-controls"><button type="button" data-gallery="-1" aria-label="Captura anterior">←</button><span class="gallery-count" aria-live="polite">1 / ${project.gallery.length}</span><button type="button" data-gallery="1" aria-label="Captura siguiente">→</button></div>` : ''}</figcaption></figure>` : ''}
    <div class="dialog-grid"><div><h3>${project.problemTitle}</h3><p>${project.problem}</p></div><div><h3>Qué reúne el proyecto</h3><ul>${project.features.map(feature => `<li>${feature}</li>`).join('')}</ul></div></div>
    ${project.links ? `<div class="dialog-links">${project.links.map(link => `<a href="${link.href}" target="_blank" rel="noopener noreferrer">${link.label}</a>`).join('')}</div>` : ''}
    <div class="dialog-next"><span>SEGUIR EXPLORANDO</span><button type="button" data-next-project="${project.next}">${project.nextLabel}<span aria-hidden="true">↗</span></button></div>`;
  dialog.scrollTop = 0;
}

function openProject(key, trigger) {
  if (!projects[key]) return;
  if (!dialog.open) returnFocusTo = trigger || document.activeElement;
  closingDialog = false;
  if (closeAnimation) { closeAnimation.cancel(); closeAnimation = null; }
  renderProject(key);
  if (!dialog.open) {
    dialog.showModal();
    document.body.classList.add('modal-open');
    scrollEnabled = false;
    if (!motionPreference.matches) {
      dialog.animate([{ opacity: 0, transform: 'translateY(35px) scale(.97)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
  }
  document.querySelector('.dialog-close').focus({ preventScroll: true });
}

function closeProject() {
  if (!dialog.open || closingDialog) return;
  closingDialog = true;
  if (motionPreference.matches) dialog.close();
  else {
    closeAnimation = dialog.animate([{ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(18px) scale(.98)' }], { duration: 180, easing: 'ease-in', fill: 'forwards' });
    closeAnimation.finished.then(() => {
      dialog.close();
      closeAnimation.cancel();
      closeAnimation = null;
    }).catch(() => {});
  }
}
document.querySelectorAll('[data-open-project]').forEach(button => {
  button.addEventListener('click', () => openProject(button.dataset.openProject, button));
});
document.querySelector('.dialog-close').addEventListener('click', closeProject);
dialog.addEventListener('cancel', event => { event.preventDefault(); closeProject(); });
let backdropPointer = false;
dialog.addEventListener('pointerdown', event => { backdropPointer = event.target === dialog; });
dialog.addEventListener('click', event => {
  if (event.target !== dialog || !backdropPointer) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeProject();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  scrollEnabled = true;
  closingDialog = false;
  if (returnFocusTo?.isConnected) returnFocusTo.focus({ preventScroll: true });
  requestScrollRender();
});

function changeGallery(direction) {
  const gallery = projects[currentProject]?.gallery;
  if (!gallery || gallery.length < 2) return;
  galleryIndex = (galleryIndex + direction + gallery.length) % gallery.length;
  const item = gallery[galleryIndex];
  const image = document.getElementById('gallery-image');
  image.src = item.src;
  image.alt = item.alt;
  dialogBody.querySelector('.gallery-caption').textContent = item.caption;
  dialogBody.querySelector('.gallery-count').textContent = `${galleryIndex + 1} / ${gallery.length}`;
  if (!motionPreference.matches) image.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 230 });
}
dialogBody.addEventListener('click', event => {
  const galleryButton = event.target.closest('[data-gallery]');
  if (galleryButton) changeGallery(Number(galleryButton.dataset.gallery));
  const nextButton = event.target.closest('[data-next-project]');
  if (nextButton) {
    renderProject(nextButton.dataset.nextProject);
    document.querySelector('.dialog-close').focus({ preventScroll: true });
  }
});
dialog.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (projects[currentProject]?.gallery?.length > 1 && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    changeGallery(event.key === 'ArrowRight' ? 1 : -1);
  }
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
copyButton.addEventListener('click', async () => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(email);
    notify('Email copiado. Seguimos en contacto.');
  } catch {
    notify(`Podés escribirme a ${email}`);
  }
});
document.getElementById('year').textContent = String(new Date().getFullYear());
