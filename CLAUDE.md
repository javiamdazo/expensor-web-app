# expensor-web-app

## Arquitectura del frontend

El frontend sigue una **arquitectura basada en componentes**. La UI se construye
componiendo componentes reutilizables en lugar de páginas monolíticas.

Los componentes de UI base (botones, inputs, cards, etc.) provienen de la
librería [shadcn/ui](https://ui.shadcn.com). No es un paquete npm instalado:
el código de cada componente se genera con el CLI de shadcn y vive directamente
en el repositorio, en `src/components/ui/`, para poder modificarse libremente.

### Estructura de directorios

- `src/components/ui/` — Componentes shadcn/ui (button, card, input, select,
  switch, textarea, avatar, badge, etc.). Son la base visual del sistema de
  diseño.
- `src/components/` — Componentes propios de la aplicación (`Layout`,
  `StatCard`, `TrendChart`, `CategoryBreakdownChart`, `icons`), construidos
  componiendo los componentes de `ui/`.
- `src/pages/` — Vistas/páginas de la app (`Dashboard`, `Budget`, `Cases`,
  `Data`, `History`), que componen componentes de `components/` y `components/ui/`.
- `src/lib/` — Utilidades compartidas (p. ej. `cn` para combinar clases con
  `clsx` + `tailwind-merge`).
- `src/store/` — Estado global de la aplicación con `zustand`.

### Convenciones de shadcn/ui

- Configuración en `components.json` (estilo `new-york`, iconos `lucide`,
  color base `zinc`, variables CSS activadas).
- Alias de importación: `@/components`, `@/components/ui`, `@/lib`,
  `@/hooks`.
- Para añadir un nuevo componente de shadcn, usar el CLI oficial
  (`npx shadcn@latest add <componente>`) en lugar de escribirlo a mano, para
  mantener consistencia con el resto de componentes generados.
- Los componentes de `ui/` no deben contener lógica de negocio: solo
  presentación y variantes de estilo (usando `class-variance-authority`).

### Stack relevante

- React 19 + TypeScript + Vite.
- Tailwind CSS v4.
- Radix UI como primitivas headless bajo los componentes de shadcn.
- React Router para el enrutado de páginas.
- Zustand para estado global.
