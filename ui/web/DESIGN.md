# ui/web Design Contract

This document governs everything under `ui/web`. Every PR that touches a shared surface (§6) is
held to it. The cockpit is one product serving several swarms — research, screener, commodities —
whose views share components and one token system. This contract is what keeps those surfaces from
drifting apart. "It feels right" is part of done, next to "it works".

---

## 1. Token contract

- All color, radius, type, motion, and elevation values come from the custom properties in
  `src/styles/tokens.css`. Never a hex, `rgb()`, or `hsl()` literal in a component; `global.css`
  consumes tokens, it does not mint colors.
- Dark is the default theme (`:root`, `color-scheme: dark`). Light is an opt-in override via
  `[data-theme='light']` on `<html>` (the top-bar toggle plus the pre-paint script in
  `index.html`). No per-component theme branches anywhere — the whole UI flips on that one
  attribute.
- The accent family is additionally swarm-scoped via `data-swarm`. Every surface must therefore
  resolve correctly in all FOUR combinations: {dark, light} × {hand-tuned swarm, derived swarm}.
  A new token gets a value in both theme blocks; a new accent-family token gets one in all four
  scopes.
- A value that differs between themes is a token by definition. If a component wants to branch on
  theme, the branch belongs in `tokens.css` instead.

## 2. Swarm accent derivation

- Two palettes are hand-tuned and grandfathered: research (`:root` amber, `tokens.css` lines
  59–171; light overrides at 229–299) and screener (`[data-swarm='screener']` teal, lines 174–185
  dark, 303–314 light). Do not hand-tune a third.
- Every OTHER swarm derives its whole accent family — `--accent`, `--accent-bright`,
  `--accent-deep`, `--accent-soft`, `--accent-ink`, `--accent-bright-ink`, glows, washes, `--good`,
  `--core-glow`, `--app-bg` — from its manifest color. `App.tsx` (~lines 163–174) reads the swarm's
  `SWARM.md` `color:`, sets `data-swarm` on the app root, and injects the color as `--swarm-color`;
  the derived blocks
  `.app[data-swarm]:not([data-swarm='research']):not([data-swarm='screener'])` (`tokens.css`
  lines 196–215 dark, 322–340 light) `color-mix()` the family from it.
- Mixes stay `in srgb`. The three tokens the WebGL globe reads (`--accent`, `--accent-bright`,
  `--accent-deep`) are `@property`-registered (`tokens.css` lines 30–57) so a mix resolves to a
  concrete `color(srgb r g b)` at computed-value time — the one form
  `useGlobeColors.parseCssColor` handles. An oklab/oklch mix would serialize in a space the
  globe's parser does not cover. Do not change the mix space.
- Registration is not only for the globe: `syntax: '<color>'` also TYPE-CHECKS the token, and that
  is what makes a derived value fail closed. The manifest color is author-written and reaches the
  CSS unvalidated (`SWARM.md` `color:` → `swarms.ts` accepts any non-empty string → `App.tsx`
  injects it), so a typo'd `color: "#8b5cf"` makes every `color-mix()` off it invalid. A registered
  token discards the bad value and inherits the research palette; an UNREGISTERED one keeps the dead
  literal and collapses at use — for the inherited `color` property that means the ink resolves to
  `--text` (measured: near-white on amber, 1.88:1). So any derived accent token consumed as text or
  fill gets registered — `--accent-ink` is registered for this reason alone.
- Adding a swarm = ONE `color:` line in `.claude/agents/<swarm>/SWARM.md` (commodity declares
  `color: "#8b5cf6"`). Zero component or CSS edits (CLAUDE.md §26). If a new swarm seems to need
  a CSS edit, the derivation block is wrong — fix it there, for every swarm at once.
- Before the swarm list resolves, `--swarm-color` is absent and the family falls back to research
  amber. That fallback is deliberate — fail closed (see §5). The `var(--swarm-color, …)` fallback
  covers the token being ABSENT; registration (above) is what covers it being INVALID. A derived
  token needs both, and the two are not interchangeable.

## 3. Motion

The enforceable list. Every rule below is checkable in review.

- Animate ONLY `transform` and `opacity`. Never `width`/`height`/`margin`/`padding`/`top`/`left`,
  never `transition: all`.
- UI transitions stay ≤300ms. Use the shared tokens (`tokens.css` lines 158–162): `--dur-fast`
  (140ms), `--dur` (240ms), `--dur-slow` (420ms — stage-level moves only, not UI feedback), with
  `--ease` (`cubic-bezier(0.22, 0.61, 0.36, 1)`) or `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`).
  Custom curves only — never plain `ease-in`.
- Pressables give instant feedback: `transform: scale(0.97)` on `:active`, at `--dur-fast`
  (~140ms) — the `.estatus` / `.chatpanel__chip` pattern in `global.css`.
- Nothing enters from `scale(0)`. Floor at `scale(0.95)` + `opacity: 0`.
- Popovers are origin-aware: `transform-origin` at the trigger. Modals stay centered.
- Exits are faster than entries. Exception on record: `LiveFeed` mounts with NO exit animation —
  see the comment above `{newsFeedOpen && <LiveFeed />}` in `App.tsx`: the wire re-renders on
  live news/status ticks, which can freeze a framer exit mid-slide, so instant close is
  deterministic. Any surface that re-renders on a live tick follows the same rule.
- Honor `prefers-reduced-motion` on every animation. CSS: a
  `@media (prefers-reduced-motion: reduce)` clamp beside the component block (`global.css`
  carries ~35 of them — keep the value truthful, drop only the glide). JS/framer: the
  `ResearchStage` pattern in `App.tsx` — read
  `matchMedia('(prefers-reduced-motion: reduce)')` once, zero the durations when it matches.
- Gate hover effects behind `@media (hover: hover) and (pointer: fine)`.
- Never animate keyboard-initiated or high-frequency actions (typing, focus moves, live tick
  updates).
- Prefer CSS transitions over keyframes for interruptible UI — a transition reverses mid-flight,
  a keyframe restarts.
- When a list animates in, stagger entries 30–80ms per row, and cap the total so late rows do not
  straggle in.

## 4. States

Every async surface ships all three from its first version:

- **Loading** — a skeleton or shimmer shaped like the content. Never a spinner alone.
- **Empty** — honest: name what was searched or filtered and what would fill it. "No events match
  scope: filings" beats "Nothing here".
- **Error** — recoverable: say what failed and give a retry affordance.
- Degraded results (fallback provider, partial fetch) are never cached as final — refetch on the
  next natural trigger.

## 5. Deploy skew

A deploy serves the NEW web bundle from the OLD engine for roughly 15–30 seconds (dist builds,
then the engine restarts). So the client positively matches any new server field: absent field →
feature OFF. Never default-permissive — `field === 'x'`, not `field ?? 'x'`. The `tokens.css`
fallback to research amber when `--swarm-color` is absent (§2) is this rule expressed in CSS.

## 6. Shared surfaces registry

**Editing anything here changes EVERY swarm that renders it — check each swarm's cockpit before
merging.**

| Surface | Role | Used by |
|---|---|---|
| `src/components/wire/*` — `WireSurface`, `WireContext`, `SubjectChips`, `SubjectPulse`, `WireLaunchBar` | the shared, config-driven wire surface (§7) | screener, commodity |
| `src/components/screener/{EventRail,EventDetail,ThemesView,FeedFilters,CompanyView,LiveFeed,PulseMap,SendToResearchMenu}.tsx` | the wire's organs — screener-named for history, cross-swarm in effect | screener, commodity |
| `src/lib/{dedup,scope,taxonomy,themes,wire}.ts` | wire data plumbing: dedup clusters, event scope, taxonomy, theme grouping, wire config | screener, commodity |
| `src/components/LaunchConfirm.tsx` | the launch confirm dialog | all swarms |
| `src/components/CommandBar.tsx` | top bar: swarm switcher, theme toggle, status | all swarms |
| `src/components/datalibrary/*` — `DataLibrary`, `DataLibraryFilters` | the cross-swarm data-pipeline library: connector registry + pool freshness + recommended-to-add (guarded by `ui/server/test/datalibrary-purity.test.ts`) | all swarms |
| `src/styles/tokens.css` + `src/styles/global.css` | the theming contract + every component class | all swarms |

## 7. Wire component contract

The wire is ONE surface rented to many swarms. The manifest is the only thing that differs.

- Wire components read their configuration via `useWireConfig()`
  (`src/components/wire/WireContext.tsx`).
- They branch on CAPABILITIES — `flow`, `groupBy`, `eventScope`, `pulse` — never on swarm ids.
  `if (cfg.pulse)` is correct; `if (swarm === 'commodity')` is a defect.
- A new wire feature must be expressible as manifest config (the `wire:` block in a swarm's
  `SWARM.md`), or it lives in a swarm-specific wrapper OUTSIDE `components/wire/`. If neither
  fits, the capability schema grows a field — a server + manifest change, never a component fork.
- Enforcement (CI): `ui/server/test/wire-purity.test.ts` fails the build on the string literals
  `'screener'` / `'commodity'` / `'research'` anywhere inside `components/wire/**` or
  `lib/wire.ts`; `ui/server/test/wire-manifest.test.ts` asserts the manifest `wire:` block
  round-trips unchanged from `SWARM.md` through the server to the client config.

---

*This document is linked from `ui/README.md` and its zero-touch swarm rule is CLAUDE.md §26.
Changes to it are code — they ride the normal code-PR review (CLAUDE.md §28).*
