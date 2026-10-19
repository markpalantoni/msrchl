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

- top-left: hold to fast-forward at 2x speed; release to return to the previous
  speed. Double-tap to skip forward one minute. Triple-tap opens the guide
  without skipping. A single tap does nothing; releasing a hold is not a tap
- top-right: tap to wind down now, double-tap to cancel a wind-down
- bottom-left: pause and resume; the session timer pauses too
- bottom-right: back to the picker

Taps anywhere else turn on sound if the video started muted.

YouTube's own title bar and play bezel are hidden behind a short black curtain
whenever playback starts or resumes, and a pause card covers the player while
paused.

Every video remembers where it stopped and resumes from there next time.
A skip saves its landing position immediately, including when you leave before
the player finishes seeking. Holding changes speed only while playing and stops
on release, movement, cancellation, pause, wind-down, or leaving the app. The
session still lasts the chosen amount of real time. Videos without 2x support
keep their normal speed; double-tap skipping remains available.

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

Open **Remote** in the picker to see whether this device has a topic. Generate
one there (192 random bits), paste an existing one, or forget it on this device.
Each iPad Home Screen icon has its own storage: configure Remote inside the
actual icon you use. A new icon starts without a topic. When storage is blocked,
the panel warns that the topic is only set for this visit.

Copy the topic or player setup link to configure another player. The setup link
uses `?remote=<topic>`; `?remote=off` forgets it. The player removes this parameter
from its address bar immediately, and ordinary shared video links omit it.

While a video plays, the player listens over [ntfy.sh](https://ntfy.sh) for
`wind`, `cancel`, `pause`, `resume`, `toggle`, `fwd` (+30 seconds), `fwd60`
(+1 minute) or `back` (-10 seconds). Seeking keeps the session deadline and pause state unchanged,
clamps to the video bounds, and is ignored during wind-down. The Remote section provides a
command link and a Copy link button for each. Send a link to your phone and use
it as a bookmark or a Shortcut with **Get Contents of URL**. Opening a command
link immediately sends its command. The triple-tap guide points back to setup.

The topic and all these links grant control of playback. Keep them private and
out of the repo. Generate a new topic and update the player devices and phone
links to rotate it; forgetting on one device leaves the others unchanged.

## Content

`content.json` is the whole catalog: each video once, tagged with a provider,
topics, and for Sesame Street a cast of characters (from the episode guides on
Muppet Wiki) plus, where known, the second each character first shows up. The
era filter comes from the air year. Sesame Street entries aired in 1999 or
earlier; the notes in the file explain how episode numbers give the year.

## Working on it

Static site, no build. Serve the directory (`python3 -m http.server 8765`) and
load it in a browser. Pushing to `main` deploys via GitHub Pages.

Run `node --test tests/controls.cjs` for the remote setup, seeking and gesture
logic checks. These use a simulated player; also verify playback and touch
behavior in a real browser before shipping.

After cloning, point git at the versioned hooks once:

    git config core.hooksPath hooks

They refuse commits and pushes that would put secrets or personal data in this
public repo.
