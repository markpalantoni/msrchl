# msrchl

Kids video player for a fixed, hand-picked playlist. Live at
https://markpalantoni.github.io/msrchl/

Pick a show, a topic, and a length (2, 3, 5 or 20 minutes; 20 unless a link
says otherwise), then pick a video and it starts. Era and character belong to
a show: they sit under the show row, only list what that show has (none for Ms
Rachel), picking Big Bird selects Sesame Street, and switching shows clears
them. Topics cut across shows. With a character picked, a video that knows
where that character first appears starts there.

Surprise me draws from its own saved set of filters, whatever the picker is
showing, so a home-screen shortcut can stay on what the toddler likes this
month. The set starts as `defaults.surprise` in `content.json`; to change it on
the device, set the filters you want and tap "Make Surprise me pick from the
filters above". The button shows what it will pick from. It plays with no player controls, no recommendations and no
way out. Over the last 20 seconds the sound and picture fade to a goodbye card.

The wind-down is deliberately quiet: the only cue is a small white ring with a
dark outline at the top-left edge, readable on any background, which flashes
once when the wind-down starts and stays on until the end. There is no countdown on screen, so nothing reads as "it's
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

Useful for a home-screen shortcut, e.g. `?v=last` reopens whatever played
last, where it left off, for a 20 minute session.

A link with `v` starts playing on its own. Browsers only allow sound after a
tap (iOS always enforces this), so where sound is refused it plays muted with
a "Tap for sound" pill, and a tap anywhere off the corners turns sound on. If
nothing plays at all, it falls back to a "Tap to start" screen.

The address bar always carries the picker's filters and length, and "Share a
link that plays these filters" copies (or shares) one that plays a random
match, e.g. `?provider=ms-rachel&topic=colors&m=5&v=any`. A link that names
any filter names all of them: what it leaves out means "all", not whatever the
device picked last.

| param | values |
|---|---|
| `v` | a video id, `last`, `random` (from the Surprise set) or `any` (from the filters in the URL) |
| `m` / `s` | session length in minutes / seconds |
| `provider`, `topic` | preselect a filter, e.g. `ms-rachel`, `colors` |
| `era` | `70s`, `80s` or `90s` |
| `char` | a character id from `content.json`, e.g. `big-bird` |
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

`content.json` is the whole catalog: each video once, tagged with a provider,
topics, and for Sesame Street a cast of characters (from the episode guides on
Muppet Wiki) plus, where known, the second each character first shows up. The
era filter comes from the air year. Sesame Street entries aired in 1999 or
earlier; the notes in the file explain how episode numbers give the year.

## Working on it

Static site, no build. Serve the directory (`python3 -m http.server 8765`) and
load it in a browser. Pushing to `main` deploys via GitHub Pages.

After cloning, point git at the versioned hooks once:

    git config core.hooksPath hooks

They refuse commits and pushes that would put secrets or personal data in this
public repo.
