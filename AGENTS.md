# msrchl

Personal side project: a kids video player for a fixed, hand-picked playlist.
Static site, no build step. `index.html` is the whole app; `content.json` is
the catalog it loads at runtime.

## Shipping: commit straight to `main`

This overrides the global PR and worktree rules. Mark is the only committer,
so there are no PRs, no review, and no feature branches. Make the change,
commit it on `main`, push. GitHub Pages serves `main` at the repo root
(https://markpalantoni.github.io/msrchl/), so the push is the deploy. A push
that has not reached `main` has not shipped.

- Conventional commit messages, no AI attribution (global rules still apply).
- The repo is public. `hooks/scan-sensitive` runs as pre-commit and pre-push
  (after `git config core.hooksPath hooks`, once per clone) and refuses
  secrets, emails, phone numbers, home paths, and commits authored with a work
  address. A false positive means rewording, never bypassing.
- If a worktree got created anyway, fast-forward `main` to it and push `main`;
  do not leave the work on a branch.

## Content

- Every video is one entry in `content.json`, tagged with a `provider` and
  `topics`; the app filters on either. The `_readme` and `_dating` keys in the
  file carry the catalog rules (Sesame Street is pre-1995 only, episode
  numbering gives the season and year).
- Before adding a video, confirm it is live and embeddable, then play it
  through the app once. Fan uploads of classic material get taken down, so a
  blank thumbnail in the picker means that entry needs re-sourcing.
- Prefer uploads at or above 5 minutes so the session timer, not the clip,
  ends the session.

## Running and testing locally

Serve the directory with any static server and load it in a browser:
`python3 -m http.server 8765`. Deep-link params for testing without the picker:
`v=<id>|random|last`, `m=<minutes>` or `s=<seconds>`, `clock=1` (show the
countdown), `targets=1` (label the invisible corner targets), `debug=1`
(on-screen log), `provider=` and `topic=`. UI changes are verified by playing a
video in a real browser, not by reading the code.
