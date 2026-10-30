# Knowledge Defense · Siege edition v5

A separate, offline-capable Phaser 3 math review game. Forest Path is unchanged. No login, backend, or save is required.

## Play

Open index.html directly, or run `node serve.cjs` and open the displayed local address. Click Begin expedition to enable audio. Questions remain beneath the battlefield. Short answers are grouped into a compact four-choice row on a laptop; phones use two columns. Longer answers use a compact two-column group.

Every correct answer adds firing time (12 seconds by default) and 25 gold. The reserve holds 36 seconds and drains only during engagements. Wrong answers show the correct answer and explanation. Pause & read stops combat and question advancement. With no charge, towers stop and enemies advance more slowly.

## Six different routes

Bramblewood Ruins, Moonstone Causeway, The Ember Rift, The Sunken Garden, Amber Dunes, and Frostwatch Pass each have a different route and twelve tower sites. The three added realms have original garden, desert, and snowy terrain with routes that match the actual enemy paths. Each realm has six waves and a boss. Castle health restores to 20 when entering the next realm.

## Five defenses

- Q: Arrow tower — fast single-target shots; 70 gold.
- W: Arcane spire — magic damage and a two-second slow; 100 gold.
- E: Catapult — long range, heavy stones, and an 85-unit splash radius; 155 gold.
- R: Frost beacon — ice bolts and a four-second slow; 110 gold.
- T: Ember cannon — faster close-range splash; 120 gold.

Choose a defense and click an empty numbered platform. Each tower has three upgrade levels. Select a built tower to see its health, damage, range, upgrade, repair, and sell controls. Repairs restore up to 85 health for 20 gold. Upgrades increase maximum health and restore the gained health. Two starter towers are free in each realm.

Bosses can fire at towers. Armored brutes begin doing this from the fourth wave of the first realm; later realms introduce them earlier, and some raiders become ranged attackers. Orange target rings and lines give an attack warning before a projectile launches. Pause freezes the warning. Tower health bars appear when damaged. A fallen platform has a rebuild mark; rebuilding there costs half the chosen tower's normal price. Repair, rebuild, and upgrades use gold earned through studying and combat.

Use 1–4 for answers, Q/W/E/R/T for defenses, and Space to pause. The Sites button provides numbered keyboard-accessible building controls. Menu includes sound, music, speed, fullscreen, help, and teacher tools.

## Math and teacher tools

Menu → Teacher tools supports Kindergarten through Grade 8. Choose the grade, practice level and skill, then click Use this collection. K–5 uses the original elementary generator; Grade 1 also includes its expanded 21-standard generator with safe visual models. Grades 6–8 include 1,600 original Forest Path questions and an 80-skill generator. Computing/web collections and custom JSON/CSV imports remain available.

Fresh math keeps generating new problems. Fixed practice creates a 30-question bank for K–5 and uses the imported library for grades 6–8. Create 30 fresh problems for editing makes a set you can change and share exactly. Editing or importing switches to the current editable bank. JSON and CSV exports preserve models and metadata; CSV uses an optional metadata column. Existing eight-column CSV and Forest Path JSON files also import. Export a classroom pack to retain the bank, curriculum, reward, and battle challenge. Content changes last in the current tab; exports retain them for another session. Original practice content should be reviewed for your class.

## Send a class link

Publish this edition first. Open the published game → Menu → Teacher tools. Apply your curriculum or bank, set the reward and challenge, and scroll to Send a class link. Enter a class name, then Create class link → Copy class link. Paste it into Google Classroom, email, or your class website. Open student link lets you check it. The published HTTPS address fills automatically; when preparing locally, enter your published Knowledge Defense address.

Students open the named assignment and begin. Fresh-generator links select a curriculum; edited/imported banks travel inside the link and restore exactly, including diagrams. For a fixed generated assignment, create an editable 30-problem bank before making the link. Very large banks may need a smaller set. Copy the entire link including #class=. Creating links does not require another repository commit. This tool prepares links for you to post; it does not send messages automatically.

## GitHub Pages deployment

Extract Knowledge-Defense-Siege-v5.zip. Upload the files and folders inside it to your separate Knowledge Defense repository, keeping index.html at the repository root. Include src, data, vendor, assets and all four CSS files. Do not upload the ZIP itself or an extra enclosing folder. In repository Settings → Pages, publish from the root of your chosen branch. After publishing, refresh with Ctrl+Shift+R. If the browser upload fails, commit assets first, vendor second, then the remaining files. No runtime file exceeds 1.2 MB. Bundled Phaser and artwork require no CDN.

Optional existing MP3 overrides in assets/audio can remain; local sound effects and music work without them. Audio begins after the initial play gesture and can be controlled from Menu.

## Verification and sources

Run npm test for core checks. With the optional Playwright development dependency installed, npm run test:browser, npm run test:classroom, npm run test:siege, and npm run test:campaign exercise the browser game. The campaign check uses simulated elapsed battle time and real question controls, with 80% correct answers, ordinary earned gold, and a fixed build/repair strategy. It is not a human usability study. The siege check verifies real projectile splash, slow effects, enemy telegraphs, damage, destruction, repairs, rebuilding, six routes and responsive layouts. Source hashes for unchanged reused teaching modules are in data/REUSE-SOURCES.json.
