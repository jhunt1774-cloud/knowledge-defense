# Knowledge Defense

A separate, complete Phaser 3 tower-defense review game. Defend the royal archive through **three realms and 18 waves**, including three bosses. Original graphics are drawn locally by Phaser; sounds are synthesized by the browser. **No account, backend, analytics, cookies, local storage, or saved progress.** This project has no dependency on Forest Path.

## Play

Open `index.html` in Chrome, Edge, or a current Chromium-based Chromebook browser. Everything needed is included, so double-clicking the file also works. For a local website preview, install Node.js and run `node serve.cjs` in this folder, then visit **http://127.0.0.1:8080**. No package installation is needed to play or serve.

1. Choose a tower card and click/tap a numbered stone platform to build. You start with 180 gold.
2. Send a wave when ready. Towers attack automatically; building remains available in combat.
3. Select an existing tower to see its range, upgrade it (up to level 3), or sell it for 65% of its total investment, rounded down.
4. Study for gold at any time. Correct answers earn **60 gold**; incorrect answers earn **15 effort gold** and an explanation. Questions pause all combat. The question order and answer positions are shuffled.
5. Survive six waves to unlock the next realm. Towers reset at realm transitions; remaining gold carries over, you receive 160 extra gold, and the castle recovers up to 6 health (maximum 20). Each realm ends with a boss. Defeat all three bosses to win.

Rangers offer fast single-target damage. Arcane spires slow enemies by 50% for 2 seconds. Cannons deal splash damage within a 65-unit radius. Enemies award a small amount of gold; cleared waves award additional gold. Bosses deal 5 castle damage when they reach the archive; other monsters deal 1.

All controls work with mouse/touch or keyboard **Tab, Shift+Tab, Enter, Space**. Numbered site buttons below the tower cards duplicate the map controls. Use Pause to stop time and Speed to switch 1×/2×. Switching tabs pauses the battle until Resume is clicked. Sound starts off; enable it with the Sound button. On narrow screens the tower controls move below the battlefield.

## Teacher workshop

Teacher tools are deliberately open to everyone: this is a practice game, not a locked assessment.

- Set questions to every **15, 30, or 45 battle seconds**, **before each wave**, or **manual study only**. The default is 30 battle seconds. At 2× speed, battle time passes twice as quickly. Manual Study is always available and has no limit.
- Select **Apprentice**, **Guardian**, or **Archmage** difficulty. Difficulty changes enemy health for enemies spawned in subsequent waves; the current wave keeps its existing specification.
- Select a question to edit its topic, prompt, four answer choices, correct answer, and explanation. Click **Apply question** to include changes in the active bank. New questions must also be applied before export. At least one question must remain; at most 500 are accepted.
- **Import JSON / CSV** replaces the active bank after all questions validate. An invalid file leaves the previous bank unchanged. Files are processed locally and must be smaller than 2 MB.
- **Export JSON / CSV** downloads the active bank. **Export classroom pack** includes the bank and your frequency/difficulty settings; import that JSON pack next class to restore both.
- All edits live in the current tab. Reloading starts with the original sample questions and default settings. Export before closing. A game restart preserves the current bank and teacher settings in this tab.

For a class, distribute the same exported bank/pack and have it imported on each device. To change the questions included in your deployed site, replace the array assigned to `window.KD_SAMPLE_QUESTIONS` in `data/questions.js` with your exported JSON `questions` array; keep the assignment and semicolon. No student information is collected.

### JSON bank format

See `data/sample-bank.json`. Accepts a top-level array or an object containing `questions`. JSON `answer` is **zero-based** (0=A, 1=B, 2=C, 3=D). Exactly four different nonempty choices are required.

```json
{"version":1,"questions":[{"topic":"Loops","prompt":"What is 2 + 2?","choices":["3","4","5","6"],"answer":1,"explanation":"Adding two and two gives four."}]}
```

Classroom packs additionally contain `"settings":{"frequency":"30","difficulty":"standard"}`. Valid frequencies: `"15"`, `"30"`, `"45"`, `"wave"`, `"manual"`. Valid difficulties: `"relaxed"`, `"standard"`, `"expert"`.

### CSV bank format

See `data/sample-bank.csv`. Use these column names (order may vary):

```csv
topic,prompt,a,b,c,d,answer,explanation
Loops,What is 2 + 2?,3,4,5,6,B,Adding two and two gives four.
```

CSV `answer` is **A, B, C, or D**. Quote fields containing commas/newlines; double any embedded quotation marks. UTF-8 and a UTF-8 BOM are supported. CSV includes questions only; use the classroom JSON pack for settings. Text is rendered as text, never interpreted as HTML.

## Deploy to GitHub Pages — separate project

1. Create a **new repository**, for example `knowledge-defense`. Do not upload into or change your Forest Path repository.
2. Upload this folder's **contents** to the root of the new repository. `index.html`, `style.css`, `src/`, `data/`, and `vendor/` must retain their relative locations. `.nojekyll` is included. No build is needed. Tests, README, and preview server may be uploaded too but are not required at runtime.
3. In the repository's **Settings → Pages**, choose **Deploy from a branch**, select the main branch and **/(root)**, then Save.
4. When GitHub finishes publishing, open the URL it provides (normally `https://YOUR-NAME.github.io/knowledge-defense/`). Share that URL with students.

All runtime asset paths are relative so repository subpaths work. Phaser **3.90.0** is bundled in `vendor/phaser.min.js`; students never fetch Phaser from a CDN. After the initial page and assets load, the running game needs no network. Offline re-opening of the hosted URL is not guaranteed because there is no service worker; use the extracted folder for dependable offline play.

## Files and maintenance

- `index.html`, `style.css`: responsive game interface and dialogs.
- `src/game.js`: Phaser scene, generated art, waves, combat, campaign state.
- `src/core.js`: map paths, tower stats, upgrade math, wave specifications (shared with tests).
- `src/bank.js`: reusable JSON/CSV bank validation and conversion (independent of Phaser).
- `src/app.js`: questions, teacher editor, import/export, audio, and UI.
- `data/questions.js`: runtime sample bank; JSON and CSV samples contain the same questions.
- `vendor/`: bundled Phaser engine and its MIT license.
- `tests/`: data/mechanics checks and actual-browser regression checks.

The samples are **32 original questions** about algorithms, loops, variables, events, conditionals, lists, functions, binary, networks, privacy, debugging, and more. They follow common middle-school CS concepts and are **not copied from, affiliated with, or endorsed by Code.org**.

## Verification

Run `npm test` (Node.js only) for bank, CSV, path, economy, and scaling tests. To run browser tests, run `npm install`, start `node serve.cjs` in another terminal, then run `npm run test:browser`. Browser tests use installed Chrome on Windows or Playwright Chromium; if necessary run `npx playwright install chromium` first. See `TEST-REPORT.md` for the checks actually run on this delivery.

The canvas uses a fixed 900×600 logical resolution, a 30 FPS target, capped frame delta, and no physics engine, downloaded art, music, or external fonts. This keeps rendering modest for older Chromebooks. Actual school hardware still needs a classroom pilot. DOM controls and questions support keyboard use; the battlefield itself is visual and is not a fully screen-reader-equivalent game.

## License

Original project code, questions, and generated vector artwork: MIT, see `LICENSE`. Phaser: MIT, see `vendor/PHASER-LICENSE.txt`.
