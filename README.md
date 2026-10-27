# Jazmín Bustos — Portfolio

Portfolio editorial: fondo blanco, texto piedra y detalles pistacho. Desarrollado con HTML, CSS y JavaScript, sin dependencias de ejecución ni proceso de compilación.

## Vista previa

Con Node.js instalado:

```sh
npm run dev
```

Abrir `http://127.0.0.1:4173`. También se puede abrir `index.html` directamente; la copia del correo depende de los permisos del navegador. Para usar otro puerto: establecer la variable de entorno `PORT`.

## Qué incluye

- Diseño responsive y navegación móvil.
- Animaciones de entrada, apariciones al recorrer, profundidad en portadas, movimiento asociado al scroll y microinteracciones.
- Respeto por `prefers-reduced-motion` y contenido visible sin JavaScript.
- Portadas conceptuales interactivas para aprendizaje con IA y entrenamiento.
- Casos ampliados en diálogos nativos, navegación por teclado y restauración de foco.
- Galería de capturas de Milenium Gym y enlace al sitio de Solana Becerra.
- Contacto, enlaces profesionales y copia de correo con confirmación real.

## Contenido

Editar los textos de la página en `index.html`. Los casos, imágenes y enlaces se administran en el objeto `projects` de `script.js`. La paleta y los tamaños están en `styles.css`.

Las portadas de los dos sistemas nuevos son composiciones conceptuales, identificadas en la página. No se atribuyen tecnologías, métricas, fechas de lanzamiento ni roles que no estén confirmados. Sustituirlas por capturas reales cuando estén disponibles. La formación dice «Estudiante avanzada de la Licenciatura en Informática». La experiencia en SINAV no incluye un cargo ni tareas inventadas.

Las capturas existentes provienen del portfolio anterior. La escena de piedra y hojas se generó con ImageGen como recurso visual y se convirtió a WebP. Las tipografías DM Sans e Instrument Serif se cargan desde Google Fonts, con alternativas del sistema si no hay conexión.

## Publicación

Sitio estático: publicar la raíz en Vercel, Netlify o GitHub Pages. En Vercel seleccionar `Other`, sin comando de build ni instalación; directorio de salida `.`. `server.cjs` es solamente para desarrollo local.

## Verificación

```sh
npm run check
```

Comprobar en navegador escritorio y móvil: navegación, pestañas de portadas, apertura/cierre de proyectos, galería, enlaces y movimiento reducido. No se requieren paquetes externos.
