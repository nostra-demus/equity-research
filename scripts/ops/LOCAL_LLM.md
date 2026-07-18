# Local LLM tier for the news ingester

A **local model** (Ollama / llama.cpp / LM Studio) plugged into the ingester as a **$0, never-rate-limited,
unlimited** bottom tier. It drains the paced backlog the free cloud providers can't reach, and keeps the paid
last-resort (Anthropic Haiku) from firing on heavy news days.

It is **off by default**. Nothing changes until you set `NEWS_LOCAL_ENABLED=1` and actually stand up a server.

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

# Make Ollama listen on the LAN, not just localhost (default is 127.0.0.1 only)
launchctl setenv OLLAMA_HOST "0.0.0.0:11434"
# then (re)start the server:
ollama serve                   # or restart the Ollama app

# Sanity check locally
curl -s http://localhost:11434/v1/models | head
```

### 2. Connectivity — how the engine reaches the model

The engine runs on the **primary** (Intel Pro); the model runs on the **Air**. The engine calls
`NEWS_LOCAL_BASE_URL`, so that URL must be reachable from the primary.

- **Same LAN** (both machines on the same Wi-Fi/router): use the Air's LAN IP.
  ```sh
  ipconfig getifaddr en0        # on the Air → e.g. 192.168.1.42
  ```
  → `NEWS_LOCAL_BASE_URL=http://192.168.1.42:11434/v1`

- **Different networks** (e.g. the primary is remote / "PRIMARY-DELHI"): put both machines on a free private
  mesh with [Tailscale](https://tailscale.com) and use the Air's Tailscale IP (`100.x.y.z`).
  → `NEWS_LOCAL_BASE_URL=http://100.x.y.z:11434/v1`

**Never expose Ollama to the public internet.** Bind it to the LAN or Tailscale only — the `/v1` endpoint has no
auth. If your model runs on the *same* box as the engine, skip all of this and use the localhost default.

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
- If it never engages, confirm the primary can reach the URL:
  `curl -s $NEWS_LOCAL_BASE_URL/models` from the **primary**.

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

**Turn it off:** set `NEWS_LOCAL_ENABLED=0` (or remove the line) and restart the engine. The tier disappears and
the chain reverts to Groq → cloud overflow → Gemini → paid → defer.

The wiring is a single entry in `buildOverflowProviders()` (`ui/server/src/config.ts`); it auto-flows into
triage, article-read, auto-heal, and the status/headroom paths with no other code.
