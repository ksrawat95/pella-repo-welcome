# Welcome to Pella India – slideshow

A self-contained looping welcome slideshow (plain HTML, CSS and JavaScript – no build step, no dependencies).

## Files

| File | What it is |
| --- | --- |
| `index.html` | The slides (text, names, titles) |
| `styles.css` | Look and animations |
| `app.js` | Slide timing, photo galleries, confetti, greetings, built-in raga music, keep-screen-awake |
| `assets/` | Logo, the two round portraits, and `photos/` for the galleries |

## Host it on GitHub Pages

1. Create a new repository and upload everything in this folder (keep the `assets` folder structure).
2. Repository **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` and `/ (root)`.
3. After a minute the slideshow is live at `https://<your-user>.github.io/<repo-name>/`.

You can also just double-click `index.html` to run it locally.

## Using it

* Click **Full screen**, then click once on the slide so the music can start (browsers block sound until a click).
* **♪ Music** turns the music on and off. Click or tap the slide for a confetti burst.
* The built-in raga (tanpura drone, veena, bansuri and tabla, synthesised in the browser) plays by default.
* Optional recording: if you add your own licensed track as `assets/music.mp3`, a **Source** button appears to switch to it.

## Edit the content

* Names, titles and slide text: `index.html`
* Gallery photos: replace the files in `assets/photos/` (or edit the `PHOTOS` and `PHOTOS2` lists in `app.js`; captions are the `a:` text)
* Slide length: the `data-ms` value (milliseconds) on each `<section class="scene">`

## Before you publish publicly

* A public GitHub Pages site is visible to anyone with the link. It contains photos of colleagues, names and job titles, and the Pella logo. Check with the people pictured and with Pella's communications or legal contact first, or keep the repository private (private Pages needs a paid GitHub plan).
* Do not upload a music recording you do not have the rights to use.
