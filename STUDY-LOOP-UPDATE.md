# Knowledge Defense — Study Edition, October 30, 2026

This edition replaces the occasional modal quiz with **continuous questions at the bottom of the screen**. The battle remains visible above the question panel.

## Answer → charge → defend

- Every correct answer gives **12 seconds of firing time** to all towers and **25 gold**. Teachers can choose 8, 12, 16, or 20 seconds per correct answer.
- The firing reserve starts empty and holds at most **36 seconds**. It only drains while enemies are in range of a tower. It does not drain during pauses, menus, preparation, or gaps between engagements.
- When charge reaches zero, towers stop shooting. Enemies keep moving at 38% speed, giving students time to recover by answering. Previously fired projectiles can still finish their flight.
- Wrong answers give no firing time or gold. The correct answer and explanation are shown before the next question appears. Correct answers advance automatically after about 1.1 seconds; wrong answers remain longer for reading. Next question can advance sooner, and Pause & read holds both combat and automatic advancement.
- The first correct answer starts each realm's first wave. Later waves follow after a four-second intermission. Questions continue through the entire board, including build time and intermissions.
- Each realm begins with two free starter towers. Gold buys additional towers and upgrades. Firing charge resets between realms, so it must be earned again.

Use **1–4** to answer, **Q/W/E** to choose tower types, and **Space** to pause when focus is not on a button. The on-screen controls also support touch and keyboard navigation.

## New battlefields

Three new wide landscape paintings replace the earlier blank-center backgrounds and rectangular road overlay:

1. **Bramblewood Ruins** — curved forest trails, mossy temple ruins, a fountain, streams, and culverts.
2. **Moonstone Causeway** — island terraces, carved moonstone bridges, waterfalls, and moon-temple plazas.
3. **The Ember Rift** — fractured basalt plateaus, lava chasms, stone bridges, forge ruins, and crystal shrines.

The routes are part of the painted artwork. Movement paths were checked with route overlays and adjusted around the illustrated bridges. Tower sites were moved off water, crystal formations, and cliff edges. All world sprites retain the shared three-quarter viewpoint.

Original map PNGs and the built-in image tool's prompts are retained in the source project's `assets/maps/` and `assets/STUDY-MAP-PROMPTS.json`. The GitHub upload package contains the optimized local game artwork, split into small files.

## Teacher tools and deployment

Teacher tools remain under Menu. JSON/CSV question import, editing, addition, deletion, and export still work. Classroom packs now use version 2 with `settings.powerReward` and `settings.difficulty`. Older question-bank files remain readable; old frequency settings no longer disable continuous questions.

Upload the **extracted contents** of the Study Edition ZIP to the existing separate Knowledge Defense repository, replacing matching files. Include **review.css**, the updated index.html and src files, and all assets/data files. Wait for GitHub Pages to deploy, then press **Ctrl+Shift+R**. No login, backend, save system, or external asset CDN is needed. Forest Path was not changed.

## Checks and practical limits

- Browser tests verified continuous bottom questions, automatic progression without pausing combat, zero charge at the start, correct rewards, no wrong-answer reward, charge cap, pause behavior, firing shutdown at zero, teacher settings/import/edit/export, tower controls, restart, responsive layouts, audio output, and no external runtime requests.
- An unattended run after only one correct answer lost before completing the first board. The towers did not continue firing after charge ran out.
- A standard-difficulty simulated campaign with 80% correct answers, one attempt every 10 simulated seconds, normal resources, and a fixed build strategy completed all 18 waves after **55 questions**.
- A slower 15-second-cadence run at the same accuracy completed after **46 questions**, with **16 castle health** remaining at the end. Both runs used the actual scene simulation and actual question-answer UI, advancing combat time to avoid a long real-time wait.
- The original seven bank, CSV, upgrade, path, and wave tests passed. Three-map route overlays and actual in-game scenes were inspected visually.

These checks establish the new resource dependency and a workable automated pacing baseline. They do not replace student playtesting or testing on actual older school Chromebooks.
