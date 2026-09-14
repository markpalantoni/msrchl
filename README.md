# msrchl

Kids video player for a fixed, hand-picked playlist. Live at
https://markpalantoni.github.io/msrchl/

Pick a show, a topic, and a length (2, 3 or 5 minutes), then pick a video or
hit Surprise me. It plays with no player controls, no recommendations and no
way out. Over the last 20 seconds the sound and picture fade to a goodbye card.

The wind-down is deliberately quiet: the only cue is a dim gold dot in the
top-left corner, which flashes once when the wind-down starts and stays on
until the end. There is no countdown on screen, so nothing reads as "it's
about to stop".

## While a video plays

The corners are invisible tap targets (add `?targets=1` to see them):

- top-left: triple-tap for an on-screen guide to these controls (it hides
  itself after a few seconds)
- top-right: tap to wind down now, double-tap to cancel a wind-down
- bottom-left: pause and resume; the session timer pauses too
- bottom-right: back to the picker

Taps anywhere else do nothing.

YouTube's own title bar and play bezel are hidden behind a short black curtain
whenever playback starts or resumes, and a pause card covers the player while
paused.

Every video remembers where it stopped and resumes from there next time.

## Deep links

Useful for a home-screen shortcut, e.g. `?v=last&m=5` reopens whatever played
last, where it left off, for a 5 minute session.

| param | values |
|---|---|
| `v` | a video id, `random`, or `last` |
| `m` / `s` | session length in minutes / seconds |
| `provider`, `topic` | preselect a filter |
| `targets=1` | label the corner targets |
| `debug=1` | on-screen log |

## Remote control

The session can be wound down from another device, over [ntfy.sh](https://ntfy.sh).
Launch the playing device once with `?remote=<topic>` and it remembers the
topic (`?remote=off` forgets it). While a video plays it listens on that topic
for `wind`, `cancel`, `pause`, `resume` or `toggle`. From a phone, one tap on

    https://ntfy.sh/<topic>/publish?message=wind

sends the command; a Shortcut or a bookmark works. The topic is the only
credential: make it a long random string, keep it out of this repo, and
change it in both places to rotate it.

## Content

`content.json` is the whole catalog: each video once, tagged with a provider
and topics. Sesame Street entries are pre-1995 only; the notes in the file
explain how episode numbers give the year.

## Working on it

Static site, no build. Serve the directory (`python3 -m http.server 8765`) and
load it in a browser. Pushing to `main` deploys via GitHub Pages.

After cloning, point git at the versioned hooks once:

    git config core.hooksPath hooks

They refuse commits and pushes that would put secrets or personal data in this
public repo.
