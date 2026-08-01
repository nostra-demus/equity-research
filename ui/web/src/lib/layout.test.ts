// CONSTELLATION LAYOUT INVARIANTS — nothing on the field may overlap anything else, at any viewport.
//
// The bug this locks down: the master-thesis core used to be placed at a flat H * 0.87. The decision dock
// is an absolute, bottom-anchored overlay on the SAME stage, ~160px tall with its "newer data" notice
// showing — so at an ordinary browser height the core was drawn behind it and the Memo orb, the thing every
// arrow in the field points at, was invisible. A fraction of the viewport cannot know an overlay exists.
//
// So these are geometry assertions, swept across a matrix of real viewport sizes × dock heights, rather
// than a snapshot of one happy size. Run: npx tsx src/lib/layout.test.ts
import assert from 'node:assert/strict'
import { computeLayout } from './layout'
import type { SwarmGraph } from './types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// The real research swarm's shape: 6 modules, layer depths as the engine actually reports them.
const DEPTHS: [string, number][] = [
  ['business-model', 5], ['earnings', 5], ['balance-sheet-survival', 5],
  ['management-governance', 4], ['valuation', 6], ['catalyst', 3],
]
const graph = (depths: [string, number][] = DEPTHS): SwarmGraph => ({
  modules: depths.map(([name, layers]) => ({
    name, dependsOn: [], depsComplete: true,
    layers: Object.fromEntries(
      Array.from({ length: layers }, (_, li) => [
        String(li),
        Array.from({ length: li === layers - 1 ? 1 : 3 }, (_, j) => ({
          key: `${name}/${li}-${j}`, module: name, nn: String(li), name: `a${li}${j}`, slug: `a${li}${j}`,
          layer: li, failFast: li === 0, description: '', tools: [], requiredUpstream: [],
          isSynthesis: li === layers - 1,
        })),
      ]),
    ),
  })) as any,
  masterSynthesizer: { name: 'synthesizer', description: '' },
  totals: { modules: depths.length, agents: 0, specialists: 0, synthesis: 0 },
})

// every viewport a real browser plausibly gives the stage × every dock state (0 = no dock, 96 = the bar,
// 176 = the bar with its "newer data" notice, 240 = notice + a wrapped metric strip on a narrow window)
const SIZES: [number, number][] = [[1280, 620], [1440, 760], [1728, 900], [2560, 1300], [900, 560], [760, 480]]
// measured live in the cockpit: 149px at 1512 wide, 154 at 1200, 212 once the metric strip wraps.
// 0 = no dock (no decision yet); 240 is a margin above anything observed.
const DOCKS = [0, 149, 154, 212, 240]
const sweep = (fn: (l: ReturnType<typeof computeLayout>, w: number, h: number, dock: number) => void, g = graph()) => {
  for (const [w, h] of SIZES) for (const dock of DOCKS) fn(computeLayout(g, w, h, dock), w, h, dock)
}

// ---- the reported bug ----
check('the memo core is never drawn behind the decision dock', () => {
  sweep((l, w, h, dock) => {
    const floor = h - dock
    assert.ok(l.core.y + l.core.r <= floor, `core bottom ${l.core.y + l.core.r} must clear the dock at ${floor} (${w}x${h}, dock ${dock})`)
  })
})

check('the memo core is fully on-stage — never above the top edge either', () => {
  sweep((l, w, h, dock) => {
    assert.ok(l.core.y - l.core.r >= 0, `core top ${l.core.y - l.core.r} off-stage (${w}x${h}, dock ${dock})`)
  })
})

// ---- nothing overlaps anything ----
check('no orb overlaps the memo core', () => {
  sweep((l, w, h, dock) => {
    if (!l.metrics.fits) return // below minHeight the field is genuinely smaller than its content — see below
    for (const n of l.nodes) {
      const d = Math.hypot(n.x - l.core.x, n.y - l.core.y)
      assert.ok(d >= n.r + l.core.r, `orb ${n.key} sits ${d.toFixed(1)}px from the core (needs ${n.r + l.core.r}) at ${w}x${h}/${dock}`)
    }
  })
})

check('no two orbs overlap each other', () => {
  sweep((l, w, h, dock) => {
    for (let i = 0; i < l.nodes.length; i++) {
      for (let j = i + 1; j < l.nodes.length; j++) {
        const a = l.nodes[i], b = l.nodes[j]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        assert.ok(d >= a.r + b.r, `${a.key} and ${b.key} overlap (${d.toFixed(1)} < ${a.r + b.r}) at ${w}x${h}/${dock}`)
      }
    }
  })
})

check("a module's label block never lands on another band's orbs", () => {
  // the label is translate(-50%,-100%) at labelY, so its block runs labelY-labelH … labelY. labelH comes
  // from the layout's OWN solve (metrics), never a re-derived constant — the solve compresses it.
  sweep((l, w, h, dock) => {
    const LABEL_BLOCK = l.metrics.labelH
    for (const c of l.clusters) {
      const top = c.labelY - LABEL_BLOCK
      for (const n of l.nodes) {
        if (n.module === c.module) continue
        const sameColumn = Math.abs(n.x - c.labelX) < 90 // only a column that could actually collide
        if (!sameColumn) continue
        assert.ok(n.y + n.r <= top || n.y - n.r >= c.labelY, `${n.key} lands inside ${c.module}'s label block at ${w}x${h}/${dock}`)
      }
    }
  })
})

check('the top band clears the view toggle', () => {
  const TOGGLE_BOTTOM = 44 // .viewtoggle top:14px, ~30px tall
  sweep((l, w, h, dock) => {
    for (const c of l.clusters) {
      assert.ok(c.labelY - l.metrics.labelH >= TOGGLE_BOTTOM, `${c.module}'s label starts at ${Math.round(c.labelY - l.metrics.labelH)}, over the toggle (${w}x${h}/${dock})`)
    }
  })
})

check('the reserved label block is never smaller than the block actually renders', () => {
  // the DOM block measures 63px idle (name + status + the hidden timer row); reserving less than it
  // renders is what let a label grow upward into the toggle
  sweep((l, w, h, dock) => {
    assert.ok(l.metrics.labelH >= 63, `reserved ${l.metrics.labelH} for a 63px block (${w}x${h}/${dock})`)
  })
})

// ---- it degrades by compressing, not by overflowing ----
check('a short viewport compresses the gaps instead of running off the bottom', () => {
  const tall = computeLayout(graph(), 1440, 1000, 176)
  const short = computeLayout(graph(), 1440, 620, 176)
  const depth = (l: ReturnType<typeof computeLayout>) => {
    const ys = l.nodes.filter((n) => n.module === 'valuation').map((n) => n.y)
    return Math.max(...ys) - Math.min(...ys)
  }
  assert.ok(depth(short) < depth(tall), 'the deepest module must compress on a short stage')
  assert.ok(depth(short) >= (6 - 1) * 18, "but never below the orbs' own diameter — they would touch")
})

check('the layout is deterministic — same inputs, same places', () => {
  const a = computeLayout(graph(), 1440, 760, 176)
  const b = computeLayout(graph(), 1440, 760, 176)
  assert.deepEqual(a.core, b.core)
  assert.deepEqual(a.nodes.map((n) => [n.key, n.x, n.y]), b.nodes.map((n) => [n.key, n.x, n.y]))
})

check('a taller dock pushes the core up by exactly that much', () => {
  const a = computeLayout(graph(), 1440, 900, 96)
  const b = computeLayout(graph(), 1440, 900, 176)
  assert.equal(Math.round(a.core.y - b.core.y), 80, 'the seat tracks the measured dock 1:1')
})

// ---- shapes other than the research swarm ----
check('it holds for other module counts and depths', () => {
  for (const g of [
    graph([['only', 4]]),
    graph([['a', 3], ['b', 3]]),
    graph([['a', 9], ['b', 2], ['c', 7], ['d', 4]]), // a deep, lopsided swarm
    graph(DEPTHS.concat([['extra-one', 5], ['extra-two', 2]])),
  ]) {
    sweep((l, w, h, dock) => {
      assert.ok(l.core.y + l.core.r <= h - dock, `core behind the dock at ${w}x${h}/${dock}`)
      if (!l.metrics.fits) return
      for (const n of l.nodes) {
        assert.ok(Math.hypot(n.x - l.core.x, n.y - l.core.y) >= n.r + l.core.r, `orb on the core at ${w}x${h}/${dock}`)
      }
    }, g)
  }
})

check('no dock measurement behaves exactly like the stage floor', () => {
  const l = computeLayout(graph(), 1440, 900, 0)
  assert.ok(l.core.y + l.core.r <= 900)
  assert.ok(l.core.y + l.core.r >= 900 - 40, 'with no dock the core still seats near the floor, not mid-field')
})

// ---- what is still guaranteed when the field is genuinely too small ----
// A stage shorter than the content's own floor (two label blocks + two orb stacks + the core) cannot hold
// everything, and no layout can invent room. What must NEVER regress is the thing the user lost: the Memo.
check('below minHeight the core is still whole, on-stage, and clear of the dock', () => {
  let sawTooSmall = false
  sweep((l, w, h, dock) => {
    if (l.metrics.fits) return
    sawTooSmall = true
    assert.ok(l.core.y + l.core.r <= h - dock, `core behind the dock at ${w}x${h}/${dock}`)
    assert.ok(l.core.y - l.core.r >= 0, `core off the top at ${w}x${h}/${dock}`)
    assert.ok(l.core.r >= 24, `core shrank past legibility (${l.core.r}) at ${w}x${h}/${dock}`)
  })
  assert.ok(sawTooSmall, 'the sweep must actually exercise a too-small field, or this proves nothing')
})

check('minHeight is a real floor — a field at it fits, a field under it does not', () => {
  const probe = computeLayout(graph(), 1440, 2000, 0)
  const need = probe.metrics.minHeight
  assert.ok(computeLayout(graph(), 1440, Math.ceil(need), 0).metrics.fits, 'exactly minHeight must fit')
  assert.ok(!computeLayout(graph(), 1440, Math.floor(need) - 2, 0).metrics.fits, 'just under must not claim to')
})

console.log(`\nlayout.test.ts: ${passed} passed`)
