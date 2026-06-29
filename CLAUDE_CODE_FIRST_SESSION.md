# Care Journey — First Session in Claude Code (cheat-sheet)

A short orientation for your first run. The repo `CLAUDE.md` already briefs Claude Code on the project and the build sequence; this is about how to drive the tool itself.

## How Claude Code works (the 60-second version)

- It lives inside this repo and reads `CLAUDE.md` automatically at the start of every session.
- You talk to it in plain English. It proposes changes as diffs (red/green), and you approve, edit, or redirect before anything is written.
- It can run commands for you (build, tests, git), but asks before anything significant or destructive.
- Nothing is pushed to GitHub or deployed without you. Every change is reviewable, and anything it does to files can be undone with git.

## What to expect in the session

- It will scan the repo and `CLAUDE.md` first, then summarise what it found.
- It works best one step at a time. Don't ask for steps 2 to 6 in one go.
- It shows you diffs. Read them. If a change looks wrong, say so plainly and it adjusts.
- It commits when you ask. You decide when to push.
- If it heads the wrong way, interrupt and correct it. You are not locked in.

## How to steer it (five habits)

1. Start read-only: "walk me through this, don't change anything yet."
2. One task at a time, in the `CLAUDE.md` order.
3. Ask it to explain anything you don't follow. It will, at whatever level you want.
4. After any change, tell it to run the build and tests before moving on.
5. Make it stop at the gate: the save flag must not flip until the erasure/SAR test passes.

## Skills to add

Keep this minimal for v1. The `CLAUDE.md` is doing the heavy lifting that a skill otherwise would.

- Worth using before go-live: a security/code-review pass over the save-layer and erasure changes (a "review this diff for security and data-protection issues" prompt is enough; a dedicated review skill is a nice-to-have, not required).
- Not needed now: anything that generates new product scope. The scope is fixed by the spec.

## Connectors (MCP servers) to add — highest leverage first

These are added inside Claude Code's own MCP settings (not the Cowork connector list). Confirm the current setup steps in Claude Code's docs when you add them.

1. **Supabase MCP** — the big one. Lets Claude Code read your schema, run and inspect migrations, and check row-level-security policies directly against the database.

   Setup (hosted server, OAuth — no personal access token needed). In a terminal, `cd` into this repo, then run these two lines, one at a time:

   ```
   claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp"
   claude /mcp
   ```

   The first registers the server in this project's `.mcp.json` (no secrets in it, safe to commit). The second opens Claude Code's MCP screen — select "supabase", choose "Authenticate", and a browser window logs you in and grants access. Pick the organisation that contains `carejourney-prod`.

   IMPORTANT — do not point this at production data. Supabase's own guidance is that the MCP server is for development/testing only and should never be connected to a project holding real data. Care Journey's production database will hold special-category health data, so:
   - While the database is empty (now, pre-launch), using the MCP to set up schema and migrations is fine.
   - Scope it to the project and consider read-only: add `?project_ref=<your-project-ref>` to the URL, and `&read_only=true` if you are only inspecting (read-only blocks applying migrations).
   - Before any real carer data lands, switch the MCP to read-only or disconnect it from `carejourney-prod`. Do not leave an LLM with write access to a live health-data database.
   - Keep "manual approval of tool calls" ON, and review each one. This is your defence against prompt-injection via stored data.
2. **Vercel MCP** — lets it check deployments, build logs, and which env vars are set on the Care Journey project during the deploy steps. Saves you bouncing to the dashboard.
3. **GitHub MCP** — optional. Local git already covers commits and branches; add this if you want it opening pull requests, reading issues, or reviewing changes through GitHub.

No connector is needed for postcode lookups — that's the public postcodes.io API the app already calls.

Rule of thumb: give each connector the narrowest access that works, and keep production secret-setting and the final switch-on as your own manual actions.

## Routines to set up

- **`CLAUDE.md`** — done. It is the single most valuable routine; it briefs every session automatically.
- **The verification gate** — after any save-layer change, run the erasure/SAR test end to end before even discussing the flag. This is the hard stop.
- **Commit discipline** — small commits with clear messages; push only when a step is green and tested.
- **A secrets register** — names and locations only, never the values. (This is a flagged gap in the master tracker.) Note that the website's `ERASURE_LOG_SALT` is set-once and must never change.
- **Back in Cowork, not Claude Code** — keep the master progress document current and consider a weekly orchestration sweep. Claude Code builds; Cowork tracks and coordinates.

## Your first three prompts

1. "Read CLAUDE.md. Start with step 1: confirm the stateless v1 builds cleanly and is ready to ship, and show me anything that needs attention. Don't change anything yet — walk me through what you find."
2. "Now step 2: wire the save layer to the dedicated carejourney-prod Supabase project. I'll give you the URL and keys. Set the service-role key as a server-only env var, run the migrations, and enable RLS limited to the user's own login. Show me the plan before you make changes."
3. "Step 3, the gate: extend the erasure and SAR fan-out (delete-by-email and export-by-email) to reach carejourney-prod, then test end to end that a deletion request wipes Care Journey data. We do not flip the save flag until this passes, and the test evidence goes to Compliance."

---

Prepared by the Orchestration Agent (Agent 13). Approvals and the switch-on route via Phil.
