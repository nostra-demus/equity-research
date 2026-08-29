# Nostradamus hosting: primary / standby runbook

The engine that serves **app.nostra-demus.com** runs on one always-on Mac (the **primary**),
with a second Mac as a **best-effort standby** that auto-takes-over if the primary dies while the
standby is awake. This file is the single source of truth for *which machine is which*, *how to
tell who's serving*, and *how to debug it* when something looks wrong.

## The one command that answers everything

```bash
bash ~/nostra-prod/scripts/ops/nostra-status.sh      # or from ~/equity-research
```

It prints an unambiguous identity card and — the important part — decides **"am I the live host?"**
by *fact, not guess*: it matches this machine's own public IP against the tunnel connector's origin
IP. If they match, this machine is serving. This is the check whose absence caused every past mix-up
(a "Delhi + arm64" connector was assumed to be the Pro when it was actually the Air on a Delhi network).

`--oneline` gives a one-line summary; `--set-role <LABEL>` stamps a durable human label into
`~/.nostra-identity` (we use `PRIMARY-DELHI` and `STANDBY-FAILOVER`).

## Topology

| | Primary | Standby |
|---|---|---|
| Role label | `PRIMARY-DELHI` | `STANDBY-FAILOVER` |
| Services | full stack (engine, tunnel, deploy, watchdog, news-archive, hk-*) via `install-services.sh` | **only** `com.nostradamus.failover` |
| Normal state | serving :8787 + tunnel connector up | dormant, watching |
| Data pool | `~/nostra-prod/data` → **symlink into Google Drive** (`equity-research-data`) | same Drive account |
| Secrets | `~/.config/nostra-engine/providers.env` + `~/.cloudflared/` | same |

Both machines share **one named Cloudflare tunnel** (`nostradamus-engine`). Cloudflare load-balances
across every connected connector, so **two live connectors = split-brain** (both serve, both ingest,
both push data commits to `main`). The standby's entire job is to be the *only* second connector, and
*only* when the primary is truly gone.

## Automatic recovery — what's covered

1. **Primary process crash / hang / reboot** → handled *on the primary* by launchd `KeepAlive` +
   the watchdog (`com.nostradamus.watchdog`, ~60s). No second machine needed. Covers ~95% of failures.
2. **Total primary death (power / hardware / OS / internet)** → the standby's failover monitor takes
   over **if it is awake and online**. See below.

### The failover monitor (`nostra-failover.sh`, standby only)

Runs every 60s. Each tick:

- Queries `cloudflared tunnel info` (Cloudflare's **global** view of who's connected).
- **Fail-safe:** it trusts the reply only if it provably reached Cloudflare (the reply carries the
  tunnel's `ID:` line). If the standby's *own* internet is down, it does **nothing** — it never takes
  over on the basis of its own connectivity problems. This is what makes it safe on a traveling laptop.
- Dormant + **0 connectors** for **K minutes** (default 10, `NOSTRA_FAILOVER_MINUTES`) → **ACTIVATE**
  (runs `install-services.sh` to bring up the full stack and join the tunnel).
- Active + **≥2 connectors** (the primary is back) → **STANDDOWN** within one tick.

**Known limitation:** launchd timers don't fire while a Mac is asleep (lid closed). The standby fails
over only while **awake and online**. For true 24/7 failover, use an always-on standby (a box that
never sleeps), not a laptop.

**Debug it:**
```bash
cat ~/.nostra-ops/failover.status                     # always-fresh: decision, connectors, counter
tail -f ~/Library/Logs/nostradamus-failover.log       # history of ACTIVATE/STANDDOWN/WAIT
NOSTRA_FAILOVER_DRYRUN=1 bash ~/.nostra-ops/failover.sh   # observe a decision with zero side effects
```

## Common operations

**Who is serving right now?** — `nostra-status.sh` on either machine (look for the 🟢/🔴 line), or:
```bash
cloudflared tunnel info nostradamus-engine            # 1 connector = healthy; 2 = overlap/split-brain
```

**Install the standby failover monitor** (idempotent):
```bash
git -C ~/equity-research fetch origin main -q
bash <(git -C ~/equity-research show origin/main:scripts/ops/install-failover.sh)
```

**Promote a machine to primary manually** (e.g. planned move): on the new machine run
`install-services.sh`; on the old machine stop its services (watchdog first — see below). Confirm the
tunnel shows exactly one connector afterward.

**Retire / stand a machine down** (watchdog FIRST — it resurrects booted-out agents):
```bash
launchctl bootout gui/$(id -u)/com.nostradamus.watchdog
for a in deploy engine tunnel news-archive caffeinate; do launchctl bootout gui/$(id -u)/com.nostradamus.$a; done
```

## Gotchas learned the hard way

- **The data pool is a symlink into Google Drive**, gitignored — `git clone` never creates it, and a
  fresh machine shows *"0 companies"* until Drive is signed in as `ceekay@muns.io` and the symlink is
  recreated. Most files are Drive *dataless placeholders* (0 blocks); the engine plist sets
  `MaterializeDatalessFiles` so reads stream them in.
- **Never `rsync` the pool** — copy nothing; sign the machine into the same Drive.
- **Keep Codex external-agent import off on every production host.** In owner-only `~/.codex/config.toml`,
  `[desktop] external-agent-import-sync-enabled` must be `false`. Importing Claude projects can otherwise
  recreate untracked `.codex/agents/*.toml` helpers inside `~/nostra-prod`; the §28 dirty gate deliberately
  blocks deployment rather than compiling an unreviewed file. The deploy log identifies this exact cause.
- **Distinguish machines by arch + IPv6**, not by edge location: the primary here is `darwin_amd64`
  (Intel toolchain), the standby is `darwin_arm64` (M-series). Both can be on a Delhi network.
- **Never run the failover script's side-effecting path to "test" it on a live node** — use
  `NOSTRA_FAILOVER_DRYRUN=1` or the sandbox. `cloudflared tunnel info <bad-name>` does **not** fail; it
  falls back to the configured tunnel.
