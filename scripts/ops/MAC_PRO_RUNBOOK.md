# Mac Pro remote access and IBKR Paper runbook

This is the permanent, non-secret handoff for the dedicated Mac Pro. Read it before asking the
operator for connection details or changing the IBKR Paper setup. Private values stay outside Git.

Last hands-on verification: **2026-08-25**.

## Safety boundary

- Never commit or print the Mac password, IBKR credentials, paper-account number, Tailscale host,
  AnyDesk address, or private SSH material.
- Connection metadata lives in `~/.config/nostra-engine/remote-hosts.env`, owned by the local user
  with mode `0600`. Read individual keys; do not source the file and do not echo its values.
- The Screen Sharing password lives in macOS Keychain. The private metadata file contains only the
  Keychain service locator. Never run a password-retrieval command through a logged shell or tool.
- IBKR execution configuration lives on the Mac Pro in
  `~/.config/nostra-engine/paper.env`, also mode `0600`. Do not copy it into Git or logs.
- Every broker action remains paper-only. Never repoint this runbook or bridge at a live account.

The private metadata file must provide these keys:

| Key | Meaning |
|---|---|
| `NOSTRA_MAC_PRO_TAILSCALE_HOST` | Private Tailscale DNS name or address |
| `NOSTRA_MAC_PRO_SSH_USER` | Unix account used by SSH |
| `NOSTRA_MAC_PRO_SSH_KEY` | Local private-key path |
| `NOSTRA_MAC_PRO_SCREEN_SHARING_USER` | Separate, case-sensitive Screen Sharing login |
| `NOSTRA_MAC_PRO_CREDENTIAL_SERVICE` | Keychain service locator; never the password |
| `NOSTRA_MAC_PRO_PRIMARY_ACCESS` | Preferred remote-control route |
| `NOSTRA_MAC_PRO_REMOTE_REPO` | Production checkout on the Mac Pro |
| `NOSTRA_MAC_PRO_IBKR_BRIDGE_LABEL` | Paper bridge launchd label |
| `NOSTRA_MAC_PRO_TWS_API_PORT` | Current TWS Paper socket port |

## Proven access route

Use **Tailscale + SSH** for commands. Use **Apple Screen Sharing through an SSH tunnel** only when
the GUI is necessary. This route was proven working on 2026-08-25 and avoids AnyDesk's free-session
time limit.

Read the private values without printing them:

```bash
MAC_PRO_MEMORY="$HOME/.config/nostra-engine/remote-hosts.env"
test "$(stat -f '%Lp' "$MAC_PRO_MEMORY")" = 600

private_value() {
  /usr/bin/awk -F= -v wanted="$1" \
    '$1 == wanted { sub(/^[^=]*=/, ""); print; exit }' "$MAC_PRO_MEMORY"
}

MAC_PRO_HOST="$(private_value NOSTRA_MAC_PRO_TAILSCALE_HOST)"
MAC_PRO_SSH_USER="$(private_value NOSTRA_MAC_PRO_SSH_USER)"
MAC_PRO_SSH_KEY="$(private_value NOSTRA_MAC_PRO_SSH_KEY)"
SSH_BASE=(ssh -i "$MAC_PRO_SSH_KEY" -o BatchMode=yes -o IdentitiesOnly=yes)
```

Run a command:

```bash
"${SSH_BASE[@]}" "$MAC_PRO_SSH_USER@$MAC_PRO_HOST" 'whoami; sw_vers -productVersion'
```

For GUI access, keep this tunnel open in one terminal:

```bash
"${SSH_BASE[@]}" -N -L 5901:127.0.0.1:5900 "$MAC_PRO_SSH_USER@$MAC_PRO_HOST"
```

Then open Screen Sharing from another terminal:

```bash
open 'vnc://127.0.0.1:5901'
```

The Unix SSH identity and Screen Sharing identity are separate and case-sensitive. Use the private
metadata values exactly. Let Screen Sharing use its remembered Keychain credential. Do not assume
the visible computer name describes the hardware; the dedicated host is the 2019 Mac Pro even if
macOS displays an older laptop-style name.

Codex/ChatGPT is installed on the Mac Pro, but ordinary operations do not require opening it. SSH is
the simpler and more reliable control path.

## Current IBKR Paper design

- Trader Workstation (TWS) is the active paper-session GUI.
- Socket clients are enabled, Read-Only API is disabled, and Nostra connects to loopback port
  `7497`.
- `com.nostra.ibkr-paper-bridge` is a local LaunchAgent that wakes every 120 seconds.
- The bridge refreshes the verified `main` deployment, reads the published Calls ledger, and
  reconciles only eligible paper positions.
- Low-conviction eligible calls use 5%; high-conviction eligible calls use 10%, with 75 as the
  high-conviction threshold.
- Watchlist, Avoid, provisional, unverified, superseded, or otherwise blocked calls remain visible
  in history but do not trade.
- The bridge is idempotent. Once an unchanged target is aligned or submitted, later passes return
  the prior terminal record instead of rewriting `latest.json`. A deliberately cancelled/closed
  unchanged target therefore stays cancelled/closed until Research publishes a target-changing
  call or review.

As observed on 2026-08-25, the live API was connected, paper-only, automatic, and aligned, with no
positions or open orders because none of the 15 historical calls was safely executable. That was a
correct cash outcome, not a broken bridge. Always re-read current status instead of assuming this
snapshot is still current.

## Fast verification

Run these through the SSH route above.

Confirm that TWS is listening:

```bash
lsof -nP -iTCP:7497 -sTCP:LISTEN
```

Confirm that launchd still owns the repeating bridge:

```bash
launchctl print "gui/$(id -u)/com.nostra.ibkr-paper-bridge" \
  | awk '/state =|runs =|last exit code =|run interval =/ { print }'
```

Read a compact, account-free status from Nostra:

```bash
curl -fsS --max-time 12 http://127.0.0.1:8787/api/calls/paper-portfolio \
  | python3 -c '
import json, sys
d = json.load(sys.stdin) or {}
h = d.get("history") or {}
t = d.get("target") or {}
e = d.get("execution") or {}
a = e.get("automatic") or {}
r = d.get("reconciliation") or {}
print(json.dumps({
    "status": d.get("status"),
    "paper_only": d.get("paper_only"),
    "as_of": d.get("as_of"),
    "positions": len((d.get("account") or {}).get("positions") or []),
    "open_orders": len(d.get("open_orders") or []),
    "historical_calls": h.get("calls_examined"),
    "trade_calls": h.get("trade_calls"),
    "target_positions": len(t.get("positions") or []),
    "reconciliation": r.get("status"),
    "execution": e.get("status"),
    "automatic": a.get("enabled"),
}, indent=2))'
```

`execution: ready` with `can_execute: false` can be correct when the verified target contains no
eligible positions. Judge the target and block reasons, not that Boolean alone.

If the job needs a safe manual wake-up:

```bash
launchctl kickstart -k "gui/$(id -u)/com.nostra.ibkr-paper-bridge"
```

To prove the scheduler is working, compare the launchd `runs` value before and more than 120 seconds
after a check. Do not use the unchanged `latest.json` timestamp as the heartbeat for an unchanged,
already-aligned target.

## TWS and IB Gateway

Bring the already-running TWS window forward without clicking remote coordinates:

```bash
open -a "$HOME/Applications/Trader Workstation/Trader Workstation.app"
```

IB Gateway 10.50 is installed from Interactive Brokers' signed Intel installer at:

```text
$HOME/Applications/IB Gateway/IB Gateway 10.50.app
```

It is a **prepared fallback, not the active broker session**. Do not launch or log into it while TWS
is using the same IBKR username: a competing broker session can disconnect the working TWS session.
The current Nostra bridge connects to port `7497`; IB Gateway normally uses a different paper port,
so a deliberate cutover must first configure Gateway to expose the reviewed port or change the
engine through a normal code PR.

IBKR rejected the current TWS auto-restart fields as read-only, and the GUI showed the restart choice
unavailable. Do not retry the protobuf update or edit TWS configuration files behind the running
application. For IBHK users, IBKR specifically recommends IB Gateway because TWS can lock from
inactivity. IB Gateway uses fewer resources and runs longer, but IBKR still requires user
re-authentication after the weekly server reset. There is no supported permanently authenticated,
headless session.

Official references:

- [TWS or IB Gateway for the API](https://www.interactivebrokers.com/docs/tws-api/doc/download-tws-or-ib-gateway/download-tws-or-ib-gateway)
- [IBKR third-party/API FAQ](https://ibkrcampus.com/docs/third-party-integrations/general-third-party-frequently-asked-questions)
- [Official IB Gateway download](https://portal.interactivebrokers.com/en/trading/ibgateway-latest.php)

## Mistakes already made—do not repeat them

| Mistake | Correct rule |
|---|---|
| Used the Screen Sharing login as the SSH user, including the wrong case | Read the separate SSH and Screen Sharing identities from private metadata; both are case-sensitive |
| Treated AnyDesk as the main route | Use Tailscale SSH and Apple Screen Sharing; AnyDesk's free licence closed long sessions |
| Assumed Codex/ChatGPT was not installed remotely | It is installed; nevertheless prefer SSH for operations |
| Trusted the visible Mac name as the hardware model | The name is stale; the host is the dedicated 2019 Mac Pro |
| Asked again for an account number already stored privately | Read `paper.env` in place; never print or copy the account identifier |
| Tried to change TWS auto-restart with the configuration protobuf API | IBKR returned those fields as read-only; do not retry or claim it succeeded |
| Tried screenshot-coordinate clicks through Screen Sharing automation | The remote desktop is not reliably exposed in the local accessibility tree; use SSH to launch/focus apps and use GUI only when unavoidable |
| Assumed forwarded keyboard shortcuts had TWS focus | Remote focus can switch unexpectedly; verify the visible app after each UI action |
| Considered starting Gateway beside the live TWS session | Never create a competing same-username session; prepare the cutover first |
| Read an unchanged `latest.json` timestamp as a dead bridge | Terminal aligned/submitted targets are intentionally deduplicated; verify launchd `runs` and the live API |
| Interpreted zero trades as failure | Inspect eligibility and block reasons; cash is correct when no published call clears the execution rules |
| Promised “always logged in” | IBKR mandates periodic authentication; automate detection/recovery but state the weekly human authentication limit plainly |
| Put connection facts into chat only | Keep non-secrets in this reviewed runbook and canonical memory; keep secret values in the owner-only file/Keychain |

## Handoff rule

Before changing anything, a future operator or agent must:

1. Read this file and the private metadata keys without printing their values.
2. Use SSH for inspection before opening any remote GUI.
3. Verify TWS port `7497`, the launchd `runs` counter, and the compact paper-portfolio status.
4. Preserve paper-only mode and all eligibility locks.
5. Treat IB Gateway as inactive until a deliberate, authenticated cutover is ready.
6. Put every repository change through a `codex/*` PR; runtime secrets never enter the PR.
