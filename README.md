# Jazmín Bustos — Portfolio

Portfolio personal con fondo blanco, texto piedra y detalles pistacho. HTML, CSS y JavaScript sin dependencias de ejecución ni compilación.

## Iniciar

```sh
npm run dev
```

Abrir `http://127.0.0.1:4173`. Con un servidor ya iniciado en otro puerto, usar su URL. También funciona abriendo `index.html` directamente, salvo las funciones del portapapeles que requieren permisos del navegador.

## Páginas

- `index.html`: presentación, proyectos, experiencia, formación, conocimientos visibles y contacto.
- `proyecto-aprendizaje.html`: aprendizaje adaptativo con IA, portada conceptual interactiva.
- `proyecto-entrenamiento.html`: plataforma de entrenamiento, portada conceptual interactiva.
- `proyecto-milenium.html`: sistema de gestión y galería de nueve capturas.
- `proyecto-solana.html`: sitio profesional de Solana Becerra y enlace al sitio real.

Los proyectos usan enlaces nativos y páginas independientes. No hay popups. Cada página tiene título y descripción propios, enlace al listado y siguiente proyecto.

## Diseño e interacción

- `styles.css`: sistema visual base y responsive.
- `refinements.css`: dispositivos, presentación editorial y contacto discreto.
- `depth.css`: profundidad CSS 3D y páginas de proyecto.
- `identity.css`: identidad final, fondo abstracto animado, biografía, tecnologías originales en monocromo, contacto y footer.
- `script.js`: animaciones, navegación móvil, pestañas, interacción de profundidad, galerías y copia de email.
- `assets/`: escenas, favicon y capturas. Las copias WebP de Milenium se generaron sin pérdida para reducir transferencia; las fuentes PNG se conservan.

Los dispositivos tienen profundidad con perspectiva CSS y responden suavemente al puntero. Se integran al fondo de las tarjetas y sobresalen por su borde inferior, sin invadir sus títulos. El hover circular muestra sólo «Ver proyecto», sin flecha debajo, y es adicional al cursor nativo. Los efectos respetan `prefers-reduced-motion`. El fondo abstracto pistacho tiene un loop continuo hecho con CSS; se pausa fuera de pantalla y al ocultar la pestaña. No requiere video ni librerías.

El inicio presenta a Jazmín con los pilares software, informática e inteligencia artificial. «Sobre mí» amplía su experiencia y sus intereses en requerimientos, arquitectura e IA. Las tecnologías se presentan con SVG originales de Simple Icons, guardados localmente, en gris y con acento pistacho y nombre al pasar el puntero o enfocar con teclado. En dispositivos táctiles se muestran los nombres. Las fuentes y licencia se incluyen en `assets/icons/sources.json` y `assets/icons/LICENSE.md`.

En las páginas de proyectos, las capturas del dispositivo y de la galería son enlaces a la imagen completa, sin recorte, en otra pestaña. El enlace se actualiza al cambiar la captura seleccionada.

## Contenido

Editar los textos y enlaces directamente en los archivos HTML. Milenium y Solana recuperan las descripciones y funcionalidades del portfolio anterior. La experiencia profesional y los conocimientos se basan en la descripción de LinkedIn aportada por Jazmín. La formación indica «Estudiante avanzada» y Universidad Siglo 21.

Las portadas de los dos sistemas nuevos son conceptuales y están identificadas. No son capturas reales ni se atribuyen tecnologías de implementación que no estén confirmadas.

La escena de piedra y hojas fue generada con ImageGen y convertida a WebP. DM Sans e Instrument Serif se cargan desde Google Fonts, con alternativas locales si no hay conexión.

## Verificación y publicación

```sh
npm run check
```

Verificar navegación entre páginas, galerías, pestañas, menú móvil y movimiento reducido. Para publicar, servir esta carpeta como sitio estático en Vercel, Netlify o GitHub Pages, sin comando de build. `server.cjs` es sólo para vista previa local.
