# Local LLM tier for the news ingester

A **local model** (Ollama / llama.cpp / LM Studio) plugged into the ingester as a **$0, never-rate-limited,
unlimited** bottom tier. It drains the paced backlog the free cloud providers can't reach, and keeps the paid
last-resort (Anthropic Haiku) from firing on heavy news days.

It is **off by default**. Nothing changes until you set `NEWS_LOCAL_ENABLED=1` and actually stand up a server.

---

## Cost — all of this is $0

Nothing here charges a card or draws your Claude plan:

- **Ollama** and **Qwen2.5-7B** are free and open-source; they run on Macs you already own (no API cost — just
  electricity). The tier sends a **dummy** API key, so it needs no paid key.
- **Tailscale**'s free Personal plan covers this scale (3 users / 100 devices) — enough for you + the Pro + the
  Air + Banks + Noel. If it ever outgrew that, Headscale / raw WireGuard are free self-hosted alternatives.
- The free cloud tiers above it (Groq, Gemini, Cerebras, Mistral, OpenRouter, NVIDIA) are already free.
- The only spend-capable seam is the pre-existing **last-resort tier**, which by default uses your existing
  Claude *subscription* (no card charge) and only fires when every free tier is exhausted — adding this local
  worker makes it fire even less. For an ironclad zero-plan-draw guarantee, set
  `NEWS_ANTHROPIC_FALLBACK_ENABLED=0`: the chain then ends at "defer to next cycle" instead of ever touching
  your plan (items just wait longer on extreme-volume days).

We are **not** buying hardware — this runs entirely on machines you already have.

---

## Why it's shaped this way (read this first)

- The ingester is **not** short on brains — the primary triage model is already an 8B (`llama-3.1-8b-instant`).
  Items are "held / dropped" because the free tiers are **paced to spread a daily token budget evenly across
  the clock**, not because a smarter model is needed. So a local model's job is **throughput, not quality**:
  be an unlimited extra worker.
- A local model can't out-think the cloud 70B/120B overflow tiers. It's placed **last** among the free tiers,
  so the stronger capped clouds (Cerebras/OpenRouter/NVIDIA, all `gpt-oss-120b` / `llama-3.3-70b`) get first
  crack and the local box absorbs only the tail — but it runs **before** Gemini and the paid tier, so it kills
  deferral and paid spend.
- When the local box **sleeps or goes unreachable**, the ingester's normal 429/network handling arms a cooldown
  and falls straight through to Gemini → paid → defer. A part-time local box degrades gracefully; it never
  stalls the pipeline. That's why running it on the **M3 Air** (which sleeps lid-closed) is fine as a
  "when-I'm-working" booster.

---

## Hardware note

Run the model on an **Apple-Silicon** box — it's memory-bandwidth-bound, so the M3/M-series unified memory is
far faster than the Intel primary. On a **16 GB** machine the ceiling is a **7–8B** model (≈4.7 GB at 4-bit,
~15–25 tok/s). `qwen2.5:7b-instruct` is the default: the best small model at batched JSON and non-English
headline translation, which is exactly where the triage prompt is demanding. A 14B model fits but is tight —
don't bother unless you free up RAM. Kimi K2 / Llama-70B and larger will **not** run on 16 GB (they need
tens-to-hundreds of GB); this is not that.

The Air is **fanless** — expect it to warm up under sustained triage. It also stops working while asleep, so if
you want it draining while the lid is open, keep it awake with `caffeinate -i` (or run it plugged in with the
lid open). For true 24/7 you'd want a never-sleeping Apple-Silicon box (e.g. a Mac mini) — out of scope here.

---

## Setup

### 1. On the box that will run the model (the M3 Air)

```sh
# Install + pull the model
brew install ollama            # or download the app from ollama.com
ollama pull qwen2.5:7b-instruct
```

Ollama needs TWO env vars beyond its defaults — get the Air's Tailscale IP from step 2 first (or start with
`0.0.0.0` to get moving, then tighten to the Tailscale IP per the security note below):

- `OLLAMA_HOST` — the default binds `127.0.0.1` only, unreachable from the primary.
- `OLLAMA_CONTEXT_LENGTH` — Ollama defaults to a **4k context** on a box below ~24 GiB VRAM (the 16 GB Air),
  but the engine sends `max_tokens` 3500 PLUS a batched triage/article prompt, which together overrun 4k —
  the model then silently truncates the prompt and emits length-capped / non-JSON output, and the ingester
  cools the local tier down instead of draining. Raise it (must exceed prompt + 3500; 8192 is a safe fit at
  4-bit on 16 GB — larger costs RAM for no gain here).

Both launch paths need BOTH vars, but they don't reach the server the same way:

- **GUI app path**: `launchctl setenv` applies only to apps launchd spawns (the Ollama.app), NOT to your
  current shell. It also does NOT affect an app that's already running — `open -a Ollama` on its own just
  re-activates the existing process, which keeps its OLD env; if Ollama is already open you must quit it
  first so the relaunch actually picks up the new vars:
  ```sh
  launchctl setenv OLLAMA_HOST "100.x.y.z:11434"        # Tailscale IP (preferred); or the LAN IP; or 0.0.0.0 to start
  launchctl setenv OLLAMA_CONTEXT_LENGTH "8192"          # raise the default 4k window so the triage prompt isn't truncated
  osascript -e 'quit app "Ollama"'                       # stop it if already running (menu-bar Quit works too)
  open -a Ollama                                         # (re)start the app so it actually picks up both vars
  ```

- **CLI path**: `ollama serve` in a shell will NOT see the launchctl vars — set them INLINE on the command:
  ```sh
  OLLAMA_HOST="100.x.y.z:11434" OLLAMA_CONTEXT_LENGTH="8192" ollama serve
  ```

```sh
# Sanity check locally (localhost still works regardless of the bind address)
curl -s http://localhost:11434/v1/models | head
```

### 2. Connectivity — how the primary reaches the model (Tailscale)

The engine runs on the **primary** (remote — "PRIMARY-DELHI"); the model runs on the **Air**. The engine calls
`NEWS_LOCAL_BASE_URL`, so that URL has to be reachable from the primary **across networks** — the everyday case
here. Use **[Tailscale](https://tailscale.com)**, a free private mesh (encrypted, device-authenticated):

1. Install it on **both** the primary and the Air, signed into the **same** tailnet:
   ```sh
   brew install --cask tailscale   # or the App Store app; then sign in on both machines
   ```
2. Get the Air's stable mesh IP:
   ```sh
   tailscale ip -4                 # on the Air → e.g. 100.101.102.103
   ```
   → `NEWS_LOCAL_BASE_URL=http://100.101.102.103:11434/v1` (used in step 3)

**Why Tailscale even when you'll sometimes be co-located:** the `100.x` IP is **stable wherever the machines
are**. When you visit the office and both sit on the same Wi-Fi, Tailscale silently routes over the local
network — same IP, nothing to change. Configure it **once** and never touch it whether the Pro is remote or next
to you. It's also the exact mechanism Banks's and Noel's laptops use as future workers.

**Security (matters — the Air roams).** The `/v1` endpoint has **no auth**, so never expose it publicly and never
port-forward :11434. On a laptop that hops onto café/hotel Wi-Fi, use the Air's own `tailscale ip -4` (not
`0.0.0.0`) as the `OLLAMA_HOST` value in step 1's commands, so it's reachable *just* over the private mesh.
(`0.0.0.0` is simpler but also listens on whatever local network you're on — fine at home behind a router with
the macOS firewall on, riskier on public Wi-Fi.) A Tailscale ACL can further restrict :11434 to just the primary.

*Co-located only?* If you're certain both machines always stay on one LAN, you can skip Tailscale and use the
Air's LAN IP (`ipconfig getifaddr en0` → `http://192.168.x.y:11434/v1`) — but you'd re-point the URL every time
the network changes, so Tailscale is the lower-maintenance default here. If the model ever runs on the *same*
box as the engine, use the `http://localhost:11434/v1` default and ignore all of this.

### 3. On the primary (where the engine runs)

Add to `~/.config/nostra-engine/providers.env` (out-of-repo; auto-loaded, and auto-scrubbed from child runs):

```sh
NEWS_LOCAL_ENABLED=1
NEWS_LOCAL_BASE_URL=http://<air-lan-or-tailscale-ip>:11434/v1
# optional overrides:
# NEWS_LOCAL_MODEL=qwen2.5:7b-instruct
# NEWS_LOCAL_API_KEY=local          # only if your server enforces a key (LM Studio can)
# NEWS_LOCAL_MAX_TOKENS=3500
```

Restart the engine so it re-reads the config:

```sh
launchctl kickstart -k gui/$(id -u)/com.nostradamus.engine
```

### 4. Verify

- The cockpit **EVENTS** panel should show a **Local** provider chip (azure) once it handles its first batch.
- Watch the held/backlog count fall faster than before on a busy cycle.
- If it never engages, confirm the primary can reach the URL — use the literal address (the
  `NEWS_LOCAL_BASE_URL` from `providers.env` is loaded by the engine, not exported into your interactive
  shell, so `curl -s $NEWS_LOCAL_BASE_URL/models` would hit an empty var):
  `curl -s http://<air-tailscale-or-lan-ip>:11434/v1/models` from the **primary**.

---

## Tuning & off switch

| Env var | Default | Purpose |
| --- | --- | --- |
| `NEWS_LOCAL_ENABLED` | *(unset → off)* | `1` to enable the tier |
| `NEWS_LOCAL_BASE_URL` | `http://localhost:11434/v1` | OpenAI-compatible base URL of the local server |
| `NEWS_LOCAL_MODEL` | `qwen2.5:7b-instruct` | model tag the server serves |
| `NEWS_LOCAL_API_KEY` | `local` (dummy) | only set if the server enforces a key |
| `NEWS_LOCAL_RPM` | `0` (no spacing) | raise only to throttle a shared/thermal-limited box |
| `NEWS_LOCAL_DAILY_REQ_CAP` | `100000000` | effectively unlimited |
| `NEWS_LOCAL_MAX_TOKENS` | `3500` | per-call output budget |
| `NEWS_LOCAL_TIMEOUT_MS` | `120000` (2 min) | per-call wall-clock ceiling — well above triage's generic 30s default, because a 7-8B model at ~15-25 tok/s answering up to 3500 output tokens can legitimately take longer than 30s without anything being wrong |
| `NEWS_LOCAL_MAX_ATTEMPTS` | `1` | in-call retry count — deliberately 1, not the generic 2: a genuine failure re-costs the full timeout on a retry, and a sustained outage is already caught by the cross-cycle cooldown on the NEXT cycle |

**Not used for article reads.** The local tier is wired ONLY into the background triage / backlog-drain loop,
not into the on-demand "open an article" reader — that path runs a short ~7s user-facing deadline, which a
legitimately-slow local answer could trip, arming the same cooldown the backlog drain relies on. Local's job
is throughput on the backlog, not answering a human waiting on one article; reads keep using Groq → cloud
overflow → Gemini exactly as before.

**Turn it off:** set `NEWS_LOCAL_ENABLED=0` (or remove the line) and restart the engine. The tier disappears and
the chain reverts to Groq → cloud overflow → Gemini → paid → defer.

The wiring is a single entry in `buildOverflowProviders()` (`ui/server/src/config.ts`); it auto-flows into
triage, auto-heal, and the status/headroom paths with no other code — it opts OUT of the on-demand
article-read path specifically (`skipArticleRead: true`, see the "Not used for article reads" note above).
