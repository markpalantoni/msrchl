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

## Home Screen launch address and YouTube Premium

Use `https://markpalantoni.github.io/msrchl/?v=last` in the regular browser
where YouTube is signed into the Premium account. This entry point resolves
the last video and saved position from that browser on every launch; it does
not pin a particular video ID. When opened with `v=last`, the site leaves the
launch address unchanged: it does not append provider filters or session length,
or replace `last` with a video ID. Returning to the picker also keeps the address.
Video ID, playback position, provider filters, and the selected session length
live in browser storage. Explicit duration/filter parameters in an incoming link
still override the saved selections. Remote setup credentials are always removed
from the address after import.

In Safari's **Share > Add to Home Screen**, turn **Open as Web App off**.
The resulting bookmark opens in the default browser. Set that default to the
browser with the Premium login. The player opts out of the legacy standalone
Apple web-app mode; iPadOS 26 still requires turning off its install toggle.
An existing standalone icon is not converted by a site update: create a new
bookmark and verify playback before removing the old icon. Copy any Remote
topic from the old web app into the regular browser if needed.

YouTube's embedded player must be able to access the Premium sign-in and
YouTube cookies. Separate web apps may not share the browser's account context.
The site cannot inspect a cross-origin YouTube account, verify Premium, or
promise that YouTube will never serve an ad. Test on the physical iPad in the
chosen browser. YouTube's official troubleshooting is at
https://support.google.com/youtube/answer/7437519.

## Home Screen icon

The site supplies a pink teddy-bear icon for Safari's **Add to Home Screen**
preview, installed web apps and browser tabs. The editable artwork is
`icons/pink-bear.svg`; the PNG exports include a 180-pixel Apple touch icon.
Existing iPad icons may retain their cached artwork. If the old letter icon
persists, reload the site in Safari and add it to the Home Screen again.
Keep the old player icon until the replacement works. If Remote is configured,
copy its topic from the old icon and set the same topic inside the new icon;
Home Screen icons can have separate storage.

## iPad launcher

[Download Open Ms Rachel](shortcuts/Open-Ms-Rachel.shortcut) on the iPad and
open the file in Shortcuts. The signed launcher has one action: **Open URLs**
with `https://markpalantoni.github.io/msrchl/?v=last`. It sends the URL on every
run, regardless of whether the browser is already running, rather than only
opening the browser app. It uses the device's default browser.

In the shortcut's details, choose **Add to Home Screen**. Keep using the same
browser as before to retain its saved positions and Remote topic. If the launch
opens another browser, that browser needs its own Remote setup.

Browser tab selection is handled by the default browser. This launcher does not
search Chrome's open tabs or guarantee that an existing matching tab is reused.
Verify it on the target iPad with the browser closed, with another tab selected,
and with the player already selected. The published artifact is Apple-signed;
its iPad launch and tab-reuse behavior still require those device checks.

For a browser bookmark without Shortcuts, use the Home Screen setup above
with **Open as Web App off**. Avoid standalone installation when relying on
the browser’s YouTube Premium sign-in.

## Deep links

Useful for a home-screen shortcut, e.g. `?v=last` reopens whatever played
last, where it left off, using the saved session length (20 minutes initially).

A link with `v` starts playing on its own. Browsers only allow sound after a
tap (iOS always enforces this), so where sound is refused it plays muted with
a "Tap for sound" pill, and a tap anywhere off the corners turns sound on. If
nothing plays at all, it falls back to a "Tap to start" screen.

Except for stable `v=last` launch links, the address bar carries the picker's
filters and length. "Share a link that plays these filters" always copies
(or shares) an explicit link that plays a random match, e.g. `?provider=ms-rachel&topic=colors&m=5&v=any`. A link that names
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

### Set up phone controls once

In the iPad player's **Remote** section, choose **Send controls to phone** to
open the device's share sheet, or **Copy phone setup link** to paste into
Messages or Mail. Copying changes the button to **Copied!** and shows a visible
confirmation. If clipboard access is denied, a separate field selects the text
for manual copying without replacing the topic input.

The setup link opens `remote.html?remote=<topic>`. Opening it imports the topic,
removes it from the address bar immediately, and displays all eight controls.
The phone remembers the topic in that browser; bookmark `remote.html` to reopen
the controls. Another browser or Home Screen icon may have separate storage;
reopen the original private setup link there to pair it. If storage is blocked,
the controller says the setup is only available for the current visit.

Use the same topic on both iPads to control them together. Use **Copy topic**
and paste it inside the second iPad's actual player icon. Different topics give
independent controls. Existing player links using `?remote=<topic>` and
`?remote=off` continue to work; ordinary shared video links omit the topic.

The phone controller only sends a command after a button press. Requests use
HTTPS POST with `Cache: no`, so opening or previewing the setup link never sends
a playback command and these button commands aren't retained in ntfy's message
cache. A pending request disables buttons to prevent duplicate taps. The page
reports accepted requests as sent; it cannot confirm the iPad received them.
If delivery cannot be confirmed, check the iPad before retrying a skip.
The controller loads no video catalog or YouTube scripts.

While a video plays, the player listens over [ntfy.sh](https://ntfy.sh) for
`wind`, `cancel`, `pause`, `resume`, `toggle`, `fwd` (+30 seconds), `fwd60`
(+1 minute) or `back` (-10 seconds). Seeking keeps the session deadline and pause
state unchanged, clamps to video bounds, and is ignored during wind-down.
The triple-tap guide points back to Remote setup in the picker.

Legacy command links and their copy buttons remain under **Individual command
links and Shortcuts**. Opening one sends immediately using GET. Use the phone
setup link for normal sharing: email scanners or link previews that visit a
legacy command URL could trigger its command. The legacy Shortcut below still
works with a command link.

### One-tap Fade Down on iPhone

1. Inside the iPad Home Screen icon you actually use, return to the picker and
   open **Remote**. Generate a topic if none is set. Copy the **Wind down** link
   and send it privately to your phone.
2. On the phone, [download Fade Down](shortcuts/Fade-Down.shortcut), then open
   the downloaded file in Shortcuts. Its setup question asks for that link once.
   If setup is skipped, edit the shortcut and paste the link into the URL field
   of **Get Contents of URL**.
3. In the shortcut's details, choose **Add to Home Screen**. Tap the resulting
   icon whenever you want the 20-second sound-and-picture fade to end playback.
   Allow the shortcut to connect to ntfy.sh if iOS asks on its first run.

The player must remain open and both devices must have internet. No ntfy app or
account is required. This stops the video; it does not lock or power off the
physical iPad. The **Pause** command link stops playback immediately. A duplicated
shortcut using that link instead can serve as a separate Pause button.

The shared shortcut contains no topic or command link. It performs a GET request
to the private URL supplied during setup, then discards the response. It does not
claim that a server acknowledgment confirms the iPad received the command.
Its editable source is `shortcuts/Fade-Down.source.plist`. To rebuild on macOS,
convert the source to a binary plist with a `.shortcut` extension and run
`shortcuts sign --mode anyone --input <unsigned.shortcut> --output <signed.shortcut>`.
This sends the generic template to Apple for signing; never insert a private
command link into the published source or signed file.

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

Run `node --test tests/controls.cjs tests/phone-remote.cjs` for the remote setup, seeking and gesture
logic checks. These use a simulated player; also verify playback and touch
behavior in a real browser before shipping.

After cloning, point git at the versioned hooks once:

    git config core.hooksPath hooks

They refuse commits and pushes that would put secrets or personal data in this
public repo.
