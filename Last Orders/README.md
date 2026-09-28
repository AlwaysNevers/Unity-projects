# Last Orders

An interactive ethics game for a philosophy project. You play Corporal Wren, a soldier trying to reach the last evacuation ship on the first night of a third world war. Along the way you face four moral dilemmas about **obeying orders vs. following your conscience** and **whether the ends justify the means**.

## How to play

Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari). Nothing to install. Turn sound on.

- Click an option, or press **1** or **2**.
- Click the text, or press **Space**, to skip the typewriter effect.
- One playthrough takes about 5 minutes. There are 7 dilemmas and 5 endings in total, so play several times.

## What's in it

| | |
|---|---|
| **Dilemmas** | The Bridge · The Prisoner · The Cellar · The Checkpoint · The Colonel's Offer · The Last Boat · The Signal |
| **Endings** | The Last Aboard (survive) · The Silent Radio (survive) · Mira's Place · The Coordinates · Clean Hands |
| **Ethical perspectives** | Utilitarianism (Bentham, Mill) · Kantian deontology · Virtue ethics (Aristotle) |
| **Debrief** | After each ending: your path, why you lived or died (moral luck), your ethical profile, and each decision judged by all three frameworks, with real-world context and discussion questions |
| **Designer's Notes** | The ethical issue, historical context, the three frameworks, the philosophical questions, and the designer's own reasoning and conclusions |

Being good does not reliably keep you alive, and surviving does not prove you chose well. This is deliberate (see "moral luck" in the Designer's Notes).

## Editing the writing

All the text lives in `js/story.js`: the story, the debrief, the ethical profiles, and the Designer's Notes. You can change any of it without touching the rest of the code. The **"My reasoning and conclusions"** section at the bottom of that file is a draft. Rewrite it in your own words, because it's graded as your view.

## Files

- `index.html` — page structure
- `css/style.css` — layout and typography
- `js/story.js` — all story and philosophy content
- `js/scenes.js` — the animated silhouette scenes, drawn in code on a canvas
- `js/audio.js` — sound, synthesized in code (no audio files)
- `js/game.js` — game flow, the typewriter effect, and the debrief
