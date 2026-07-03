# Keedio Tender Radar — DESIGN

## Identidad (una frase)
Panel analítico **oscuro** (azul-noche `#0a0e1a`) con acento **azul** `#5b94ff`, tipografía
**Space Grotesk** (titulares) + **Inter** (UI/cuerpo), tarjetas con superficie en gradiente sutil y
elevación en capas, cifras en **numerales tabulares**; denso pero legible, sin decoración gratuita.

## Paleta (tokens en `app/globals.css`)
- `--bg` `#0a0e1a` (fondo azul-noche, con radial sutil del brand arriba)
- `--surface` `#141a2e` / `--surface-2` `#1b2236` (tarjetas: gradiente 180deg surface-2→surface)
- `--border` `rgba(148,163,196,0.16)` (hairline)
- `--ink` `#e8edf7` (texto) · `--muted` `#97a3bd` (secundario)
- `--brand` `#5b94ff` · `--brand-dark` `#3f73d6`
- Semáforo/estado: emerald (GO/🟢), amber (revisar/🟡), rose/red (no-go/🔴), sky/violet en gráficas.
- **Estrategia de color: Restrained** — neutros tintados + un acento (brand) ≤10% de superficie.
  El color de datos (verde/ámbar/rojo) es funcional (semáforo), no decorativo.

## Tipografía
- Titulares (h1/h2): **Space Grotesk** (geométrica, `--font-display`), `letter-spacing` -0.02/-0.015em.
- UI/cuerpo y h3 (títulos de tarjeta): **Inter** (humanista, `--font-sans`). Pareja en eje de contraste.
- Self-hosted vía `next/font` (cero layout-shift). `text-wrap: balance` en titulares, `pretty` en prosa.
- **Numerales tabulares** (`.tnum` / `font-variant-numeric: tabular-nums`) en toda cifra: importes €,
  %, scores, días, KPIs, tablas. Es un rasgo de identidad (interfaz de datos).

## Componentes
- `.card`: radio 14px, borde hairline, superficie en gradiente, **elevación en capas** (reflejo
  superior 1px + sombra de contacto + ambiente). `.card-hover` eleva en hover (respeta reduced-motion).
- `TenderCard`: título (h3 Inter) + `ScoreBadge` + meta (presupuesto tabular, cierre, órgano) + chips CPV.
- `ScoreBadge`: pill de color por tramo (verde≥80/ámbar≥60/naranja≥40/rojo), score tabular.
- `StatsPanel`/KPIs: grid de tarjetas, valor 2xl tabular + etiqueta xs mayúscula (contraste AA).
- NavBar sticky con blur, marca en fuente display, `nav-link` con subrayado activo.
- Skeletons con shimmer; entradas `fade-up`/`stagger` (solo con motion permitido).

## Layout
- Contenedor `max-w-6xl`, `px-5 py-8 sm:px-6 sm:py-10`. Grids responsivas (`sm:grid-cols-2/4`).
- Secciones apiladas con `gap-5/6/8`. Flex para 1D, grid para 2D.

## Motion
- Transiciones cortas (0.15–0.18s), ease-out. `fade-up` con `cubic-bezier(0.22,1,0.36,1)`.
- Todo bajo `@media (prefers-reduced-motion)`; el contenido es visible por defecto (no se oculta).

## Accesibilidad
- Texto cuerpo ≥4.5:1; etiquetas pequeñas subidas a `neutral-400` para cumplir AA.
- `focus-visible` con anillo brand en todos los interactivos.
