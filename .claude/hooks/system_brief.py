#!/usr/bin/env python3
"""SessionStart hook — the standing orientation every session needs before it touches anything.

WHY THIS EXISTS. A session that does not know the deployment topology reaches a confidently wrong
conclusion within a few turns, and the two failure modes are both expensive:

  1. It assumes the checkout it can see IS the live system, "fixes" something, and reports the problem
     solved. The live engine is on a different Mac and was never touched.
  2. It sees a merge to `main` and concludes the change is live. Merging is not deploying; the doer
     still has to pull and restart, and (see the runbook) there is a failure mode where it silently
     never does.

Unlike review_due.py — which is a scheduler and stays silent when nothing is due — this always prints.
It is orientation, not a notification: the cost of a session missing it is much higher than a few lines
of context. Keep it SHORT for that reason; detail belongs in scripts/ops/README.md, not here.

Facts marked (verified) were measured directly on 2026-08-20. Facts marked (operator) are as stated by
the operator and have not been independently checked from a session — do not restate them as measured.
"""
import json
import sys

BRIEF = """SYSTEM ORIENTATION — read before acting on anything operational.

TOPOLOGY. This engine runs on the operator's own Macs, not in the cloud:
  - DOER (live): the MacBook Pro (operator). Runs the cockpit engine, the news ingester, the public
    tunnel, auto-deploy and the hk-* timers. Production checkout: ~/nostra-prod. Connectors are pinned
    here permanently, even if serving fails over.
  - STANDBY: a MacBook Air, hw.model Mac15,12, host "Chiraags-Laptop" (verified). Dormant; only
    com.nostra.ollama + com.nostradamus.failover installed. It takes over only if the doer is absent
    ~10 min. It is NOT where the live cockpit runs.

YOU ARE NOT ON EITHER MACHINE. A Claude Code session runs in an ephemeral cloud container with its own
clone. You cannot see, restart, or verify the live engine from here. Never report an operational fix as
done based on this container: say what the operator must run, and on WHICH Mac.

MERGED != LIVE. Merging to main does not deploy. The doer's deploy.sh pulls every 120s and restarts the
engine on ui/server/** changes. Verify a fix by what the running cockpit reports, never by the merge.

DEPLOY'S ONE UNRECOVERABLE FAILURE. deploy.sh is fast-forward-only, so a REWRITTEN main orphans every
checkout permanently and it parks itself silently — the symptom is the deploy log simply stopping, not
an error. This cost 16 days undetected (2026-08-04 -> 2026-08-20). Recovery is manual and per-machine.
Full detail + the exact commands: scripts/ops/README.md, "The one thing auto-deploy CANNOT recover from".

COMMIT STREAMS (CLAUDE.md 25/28). Research data (analyses/, screener/, watchlist/) goes straight to
main. ALL code — including .claude/**, frameworks/**, scripts/**, and the doctrine files — goes through
branch -> PR -> green CI -> review -> merge. Never push code to main."""


def main() -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": BRIEF,
        }
    }))
    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        # Orientation must never be the reason a session fails to start. Fail silent.
        sys.exit(0)
