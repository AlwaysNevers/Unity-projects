# Last Orders

An interactive ethics game for a philosophy project. You play Corporal Wren, a soldier trying to reach the last evacuation ship on the first night of a third world war. Along the way you face four moral dilemmas about **obeying orders vs. following your conscience** and **whether the ends justify the means**.

## How to play

Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari). Nothing to install. Turn sound on.

- **Tap, click, or press Space** to advance the story.
- When a decision appears, **press and hold** a choice card (or hold **1** or **2**) to commit. A heartbeat timer adds pressure, but it never chooses for you.
- After each choice, the three philosophies react: agrees, disagrees, or divided.
- One playthrough takes about 6 minutes. There are 7 dilemmas and 5 endings in total, so play several times.

## What's in it

| | |
|---|---|
| **Dilemmas** | The Bridge · The Prisoner · The Cellar (the crying baby) · The Checkpoint · The Colonel's Offer · The Gunner · The Tide |
| **Endings** | The Road Held (survive) · The Ebb Tide (survive) · Twelve Years Old · Pier Four · Clean Hands |
| **Ethical perspectives** | Utilitarianism (Bentham, Mill) · Kantian ethics · Virtue ethics (Aristotle) |
| **Moral profile** | After each ending, a triangle between the three philosophies traces your path decision by decision and lands on your profile (Utilitarian, Kantian, Virtue Ethicist, or Pluralist). Tap any decision card to see why each philosophy agreed or disagreed. |
| **Designer's Notes** | The ethical issue, historical context, the three frameworks, the philosophical questions, and the designer's own reasoning and conclusions |

Being good does not reliably keep you alive, and surviving does not prove you chose well. This is deliberate (see "moral luck" in the Designer's Notes).

## Editing the writing

All the text lives in `js/story.js`: the story lines, the choices, how each philosophy judges them, the profiles, and the Designer's Notes. You can change any of it without touching the rest of the code. The **"My reasoning and conclusions"** section at the bottom of that file is a draft. Rewrite it in your own words, because it's graded as your view.

## Files

- `index.html` — page structure
- `css/style.css` — layout and typography
- `js/story.js` — all story and philosophy content
- `js/scenes.js` — the animated scenes and tactical map, drawn in code on a canvas
- `js/audio.js` — sound, synthesized in code (no audio files)
- `js/game.js` — game flow, hold-to-decide choices, and the moral profile
