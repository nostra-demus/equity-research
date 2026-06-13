# Theme Engine — correspondence review (2026‑06‑13)

**Reviewer:** Claude (cockpit side) · **Owner:** screener theme engine (`ui/server/src/news/themes/`)
**Question asked:** do the articles inside a theme genuinely correspond to that theme, or are unrelated items being bucketed in?
**Method:** read the engine end‑to‑end + a live snapshot of the top 8 themes from `GET /api/news/themes` and `/api/news/themes/:id` (engine live, `generated_at 2026‑06‑13T16:26Z`).

**Verdict: the wiring is real, but in practice the clusters are loose — the flagship theme is ~15% on‑topic.** The cockpit shows real member articles and honest counts; the problem is the *assignment heuristic*, which over‑matches on generic/template tokens. Concrete fixes below, prioritized.

---

## Evidence — the #1 theme (live)

`THM-74234e98` **"CAR‑T Cancer Treatment Advancements"** · composite **90** · rank #1 · 13 members
`keywords: [car-t, cancer, treatment, null, phase, biotechs, caribou, boosts, case, shelf, matches, autologous, drugs]`

| score | member | corresponds? |
|---|---|---|
| 93 / 90 | Caribou — off‑the‑shelf CAR‑T matches autologous (×2) | ✅ the only true CAR‑T items |
| 99 / 86 | Parabilis cancer IPO (×2) | ⚠️ cancer, not CAR‑T |
| 100 / 100 | Takeda TYK2 vs Sotyktu, **psoriasis** (×2) | ❌ small molecule, not cancer |
| 96 / 82 | Ethyreal Bio, **thyroid eye disease** (×2) | ❌ not CAR‑T/cancer |
| 99 | **Open banking — UK Payments Initiative (FCA)** | ❌ banking regulation |
| 99 | **FCA — mortgage access** | ❌ mortgage regulation |
| 94 | **FCA — climate reporting rules** | ❌ disclosure |
| 64 | **FCA — Money Market Fund reform** | ❌ fund regulation |
| 57 | **"11 Indian sailors convicted, ship fined $5.3M for cocaine trafficking"** | ❌ crime/shipping |

Genuinely CAR‑T: **2 of 13.** The cocaine‑trafficking story matched because the theme keyword **`drugs`** (from "autologous drugs") collided with "drug trafficking" — a textbook generic‑token / homonym false‑match. The four FCA items are pure finance. (Other top themes — Ganesh Housing, Yes Bank, Continental Seeds — are coherent only by *filing template*, not topic; see issue 5.)

---

## What is already correct (not the problem)
- **Deep‑dive members are real.** `buildThemeDetail` (`store.ts`) resolves the real `theme.members` ring (populated by `assign.ts`) to actual `FeedItem`s by `event_id`; nothing fabricated. The cockpit's "news in this theme", `member_count`, scores and sparkline are all honest.
- **The architecture is sound.** Members as source of truth; unmatched items → unclustered → discovery; capped multi‑membership; fail‑soft; LLM after persistence. The issue is purely the *match bar*, not the design.
- **The map animation is decorative and honest** (cockpit side) — `aria-hidden`, count/tier‑based, no on‑screen claim to be real article flow. No change needed there.

---

## Issues (prioritized)

**1 — [High] The 2‑generic‑token branch admits off‑topic items.**
`assign.ts:29` → `matched = companyOverlap >= 1 || tokenOverlap >= 2`. Two shared topic tokens with **no** company overlap, no phrase/proximity check, no LLM confirmation is too low a bar (it pulled cocaine‑trafficking into CAR‑T via `drugs`).
*Fix:* for assignment to an existing theme, raise to `companyOverlap >= 1 || tokenOverlap >= 3` (match the stricter `discover.ts:53` cluster‑forming bar), and/or require ≥1 *distinctive* (low‑document‑frequency) token, not two common ones. Down‑weight high‑DF tokens when computing overlap.

**2 — [High] Junk tokens are becoming matching anchors.**
The live keyword set contains the literal `null` (and generic `case`/`boosts`/`matches`/`phase`). `null`/empty/standalone‑number tokens should never be keywords or match anchors.
*Fix:* filter `null`/`undefined`/`''`/pure‑number and a generic‑verb stoplist in `topicTokens` (`text-match.ts`) and in `clusterIdentity` keyword derivation; also sanitize LLM‑returned keywords (issue 6).

**3 — [High] Rejected items are surfacing as theme members.**
Live "Yes Bank" theme included a `band=drop / relevance=irrelevant / inboxed=false / score=10` technical‑tip article. A triage‑rejected item must never be a theme member.
*Fix:* hard‑filter the `assignThemes` input (and `readRecentThemeItems`) to `band !== 'drop' && relevance !== 'irrelevant'`; defensively drop such members in `buildThemeDetail`.

**4 — [Medium] Duplicate members in the ring.**
The CAR‑T theme shows the same story twice (Takeda ×2, Parabilis ×2, Caribou ×2, Ethyreal ×2). The story‑dedup (`dedup.ts` / `story-floor.ts`) isn't applied to the member ring.
*Fix:* dedup `theme.members` by `dedup_group` / story id — one row per story.

**5 — [Medium] Event‑template tokens cluster unrelated companies.**
Ganesh Housing / Yes Bank / Continental Seeds are SEBI‑filing‑boilerplate clusters ("Special Window for dematerialisation", "Reg 30 LODR intimation", "recovery certificate") spanning unrelated filers (Rajasthan Cylinders, HealthCare Global, Maiden Forgings), then named after one scrip.
*Fix:* add filing/template boilerplate to the topic stoplist — e.g. `intimation, dematerialisation, regulation, lodr, schedule, advertisement, newspaper, recovery, certificate, remittance, window, transfer, securities, disclosure, pursuant`. Themes should form on subject, not on the filing form.

**6 — [Medium] LLM‑invented keywords widen the matching gate.**
`llm.ts:120‑122` prepends model‑chosen keywords into `t.keywords`, which *is* the assignment set — so a theme can admit items its members never justified (name vs contents drift).
*Fix:* keep LLM keywords for name/description only; do **not** add them to the matching set unless they already appear in ≥1 member.

**7 — [Low] Auto‑naming after one member overstates coherence.**
"SonoThera · fierce" is really a Fierce biotech *layoff* tracker; "Continental Seeds" is a multi‑entity enforcement sweep. The `· fierce` / `· positive` / `· scrip` suffixes are publisher/boilerplate artifacts.
*Fix:* when the cluster is held by event‑type rather than a shared subject, name it by the event ("SEBI ISO enforcement sweep") not one scrip; strip publisher suffixes.

**8 — [Low] Composite score is uncorrelated with member purity.**
The #1 theme (comp 90) is the least pure. Consider a cohesion/purity term in `score.ts` (mean pairwise company/token overlap across members) so contaminated clusters can't top the board.

**9 — [Low] No re‑validation on drift.**
Members are never re‑checked after LLM/merge shifts the keyword set (`discover.ts mergeAndRetire` unions keyword sets). A periodic pass that evicts members no longer matching the current anchors would self‑heal drift.

---

## Suggested order
3 (rejected items) and 2 (`null`/junk anchors) are quick, safe correctness fixes. 1 (token bar) + 5 (template stoplist) remove the bulk of the contamination. 4 (dedup ring) is cosmetic but very visible. 6–9 harden against drift over time.
