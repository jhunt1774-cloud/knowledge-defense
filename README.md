# Knowledge Defense · Math RPG edition

Start with Grade 6 math. Open Menu → Teacher tools to choose grades 6–8, a specific skill, Support/Practice/Challenge, or another collection. Click Use this collection. Math mixes the imported Forest Path questions with fresh numeric variants. Bank-only mode uses the imported problems.

The unchanged Forest Path generator covers 80 skills; 1,600 math questions and 196 computing/web questions are bundled. Forest Path itself was not modified. These are original practice questions, not official assessment items. Review content for your class.

Use Create 30 fresh problems for editing to make a fixed bank. Editing/importing switches to the editable bank. JSON and CSV exports preserve diagrams and metadata (CSV uses an optional metadata column); classroom packs also retain curriculum and combat settings. Standard eight-column CSV files still import. Forest Path JSON files import directly.

Parchment questions, brass frames, and wooden menus match the fantasy maps. The battlefield stays full width above continuous review. Graphs and tables appear beside their question; longer content scrolls within the question area.

# Knowledge Defense — Study Edition

A standalone Phaser 3 computer-science review game. **Answering questions powers the defense.** Questions remain at the bottom of the screen, one after another, while the battle runs above. No login, backend, analytics, saved progress, or asset CDN is required. Forest Path is a separate project and was not changed.

## Play

Extract the game ZIP and open **index.html** in Chrome or Edge. For a local website preview, run `node serve.cjs` from the source project and visit http://127.0.0.1:8080 . No dependency installation is needed to play.

1. Begin expedition. Two starter towers are already placed and the firing reserve is empty.
2. Answer the question at the bottom. Your first correct answer starts the first wave.
3. Each correct answer gives **12 seconds of firing time to all towers** and **25 gold**. The reserve holds up to 36 seconds and drains only during engagements. Wrong answers add neither charge nor gold and show an explanation.
4. Keep answering. Questions advance automatically, including during build phases and the four-second intermission between waves. When the reserve runs out, towers stop firing and monsters slow to 38% speed, giving you time to recharge.
5. Choose a tower type and click a foundation to build. Select an existing tower to upgrade it up to level 3 or sell it. Rangers fire quickly, arcane spires slow enemies, and cannons deal splash damage.
6. Defend six waves in each of three realms. Each realm ends with a boss. The next realm gives two new starter towers and 120 gold; unspent gold carries over, and the castle recovers up to 6 health. Charge resets, so every realm requires more correct answers.

Use **Pause & read** to stop both the battle and question advancement when more thinking time is needed. **1–4** answer the question; **Q/W/E** select tower types; **Space** pauses when focus is not on a button. All main controls also support mouse, touch, and Tab/Enter. Open **Sites** for numbered keyboard placement buttons.

Sound effects and quiet background music start after Begin expedition. Menu contains mute, volume, music, help, speed, full-screen mode, teacher tools, and restart. The built-in audio works without extra files. Optional ElevenLabs MP3s in `assets/audio/` replace the matching sounds when installed.

## Teacher workshop

Open **Menu → Teacher tools**. This is openly accessible practice software, not a locked assessment.

- Choose **8, 12, 16, or 20 firing seconds** per correct answer. Questions are always continuous; the former occasional-question frequency setting is gone.
- Choose Apprentice, Guardian, or Archmage challenge. Difficulty changes apply from the next wave.
- Select questions to edit, add, or delete. Click **Apply question** before exporting. Banks need 1–500 valid questions with exactly four different choices each.
- Import JSON or CSV to replace the bank. Invalid files leave the current bank unchanged. Files are processed locally, with a 2 MB limit.
- Export JSON/CSV for questions, or **Export classroom pack** for questions plus the firing reward and difficulty. Edits last in this tab; export to keep them before closing.
- Importing a new bank immediately replaces the live question. Questions cycle through the shuffled bank before repeating.

The default bank contains **32 original middle-school CS questions**, covering algorithms, loops, variables, events, functions, conditionals, lists, binary, networks, debugging, privacy, and related topics. They are not copied from or endorsed by Code.org. Repetition after the first pass is intentional review; larger banks can be imported.

## Question-bank formats

JSON accepts an array or an object with `questions`. The answer index is **zero-based**: 0=A, 1=B, 2=C, 3=D.

```json
{"version":2,"settings":{"powerReward":12,"difficulty":"standard"},"questions":[{"topic":"Loops","prompt":"What is 2 + 2?","choices":["3","4","5","6"],"answer":1,"explanation":"Adding two and two gives four."}]}
```

Settings are optional. Valid reward values are 8, 12, 16, 20; difficulties are `relaxed`, `standard`, `expert`. Earlier question banks still import; old frequency settings do not disable continuous review.

CSV uses **A/B/C/D** for the answer:

```csv
topic,prompt,a,b,c,d,answer,explanation
Loops,What is 2 + 2?,3,4,5,6,B,Adding two and two gives four.
```

Quote fields containing commas or newlines and double embedded quotation marks. UTF-8, BOM, and multiline fields are supported. See `data/sample-bank.json` and `data/sample-bank.csv`. All imported text is rendered as text, not HTML.

## GitHub Pages upload

Use the **Study Edition GitHub upload ZIP**. Extract it first, then upload its **contents** to the root of your existing separate Knowledge Defense repository. Keep the `src`, `data`, `vendor`, and `assets` folders. Include **review.css**, **fullscreen.css**, and the updated **index.html**. Upload the new assets/data files to get the new maps.

In repository Settings → Pages, use Deploy from a branch with your main branch and /(root). After Pages deploys, press **Ctrl+Shift+R**. Each upload file is small; the large original-art source images are not required to run the website. Updated script and stylesheet URLs carry version tags.

The source project uses `assets-bundle.js`; the ready-to-upload package splits the same art into `assets/data/*.js`. All paths are relative and the game also works from a local folder. Existing optional audio files can remain in `assets/audio/`.

## Artwork and source files

Three new guide-based paintings include their own curved roads, bridges, terrain, and landmarks: **Bramblewood Ruins**, **Moonstone Causeway**, and **The Ember Rift**. Routes and tower sites were checked against the artwork. Creature and tower sprites share an elevated three-quarter view. Open `art-gallery.html` to inspect them.

The original map PNGs and prompts are retained in the source project's `assets/maps/` and `assets/STUDY-MAP-PROMPTS.json`. Runtime WebP art is locally bundled. Original code and questions use the MIT license; Phaser's MIT license is in `vendor/PHASER-LICENSE.txt`.

## Verification

Run `npm test` for the seven data/mechanics checks. After installing development dependencies with `npm install`, run `npm run test:browser` for the Study Edition UI and resource-dependency regression and `npm run test:campaign` for the answer-paced campaign simulation. Chrome is used when installed, otherwise Playwright Chromium is needed.

See **STUDY-LOOP-UPDATE.md** for the actual checks and simulated answer cadences. Browser and signal tests do not replace student playtesting, listening checks on classroom equipment, or an older Chromebook pilot. The battlefield is visual and has keyboard controls, but is not a fully nonvisual game.
