# msrchl

Kids video player for a fixed, hand-picked playlist. Live at
https://markpalantoni.github.io/msrchl/

Pick a show, a topic, and a length (2, 3 or 5 minutes), then pick a video or
hit Surprise me. It plays with no player controls, no recommendations and no
way out. Over the last 20 seconds the sound and picture fade to a goodbye card.

## While a video plays

The corners are invisible tap targets (add `?targets=1` to see them):

- top-left: show or hide the countdown
- top-right: tap to wind down now, double-tap to cancel a wind-down
- bottom-right: back to the picker
- double-tap anywhere else: pause and resume; the countdown pauses too

Every video remembers where it stopped and resumes from there next time.

## Deep links

Useful for a home-screen shortcut, e.g. `?v=last&m=5` reopens whatever played
last, where it left off, for a 5 minute session.

| param | values |
|---|---|
| `v` | a video id, `random`, or `last` |
| `m` / `s` | session length in minutes / seconds |
| `provider`, `topic` | preselect a filter |
| `clock=1` | start with the countdown showing |
| `targets=1` | label the corner targets |
| `debug=1` | on-screen log |

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
