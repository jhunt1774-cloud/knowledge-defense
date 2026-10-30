RPG appearance update (v6.5): the approved catapult mechanism and all collision geometry are unchanged. Generated painterly oak, hammered iron, aged brass and crimson leather textures are applied to the rig surfaces. Flush iron reinforcement, rivets, heraldry and carved runes decorate the existing surfaces. The three tiers are Oak Siege Engine, Warded Catapult and Ember War Machine. The renderer adds soft grounding shadows, consistent lighting and higher-resolution antialiasing, with a lighter mode on lower-memory devices. The full-swing clearance checks, 27 weapon/upgrade checks and the new appearance/resize checks passed.

# Knowledge Defense · Arsenal edition v6.5

A separate, offline-capable Phaser 3 math review game. Forest Path is unchanged. No login, backend, or save is required.

## Play

Open index.html directly, or run `node serve.cjs` and open the displayed local address. Click Begin expedition to enable audio. Questions remain beneath the battlefield. Short answers are grouped into a compact four-choice row on a laptop; phones use two columns. Longer answers use a compact two-column group.

Every correct answer adds firing time (12 seconds by default) and 25 gold. The reserve holds 36 seconds and drains only during engagements. Wrong answers show the correct answer and explanation. Pause & read stops combat and question advancement. With no charge, towers stop and enemies advance more slowly.

## Six different routes

Bramblewood Ruins, Moonstone Causeway, The Ember Rift, The Sunken Garden, Amber Dunes, and Frostwatch Pass each have a different route and twelve tower sites. The three added realms have original garden, desert, and snowy terrain with routes that match the actual enemy paths. Each realm has six waves and a boss. Castle health restores to 20 when entering the next realm.

## Progressive weapon unlocks

| Realm | Newly available defenses |
|---|---|
| 1 · Bramblewood Ruins | Arrow tower and Arcane spire |
| 2 · Moonstone Causeway | Catapult and Ember cannon |
| 3 · The Ember Rift | Frost beacon and Piercing ballista |
| 4 · The Sunken Garden | Alchemist poison launcher |
| 5 · Amber Dunes | Storm obelisk |
| 6 · Frostwatch Pass | Solar prism |

Previously unlocked weapons remain available. The defense bar contains only available weapons and shows what comes next. On smaller screens swipe the bar to reach later weapons. Menu → Weapon progression shows all nine weapons and their upgrade ammunition. Starting a new expedition resets progression.

## Moving mechanisms and distinct ammunition

The catapult uses separately illustrated chassis and arm sprites. Its arm draws back, releases the loaded stone from the cup, then returns to rest. Stones follow an elevated arc to the aimed impact point. Animation and flight obey Pause & read. Upgraded catapults launch a granite boulder, a spiked siege stone, then a flaming meteor.

All nine weapons have three ammunition/beam designs with different geometry. Other upgrade paths include feather/broadhead/triple-fin arrows; rune orb/orbiting ring/arcane star; ice shard/twin lance/snowflake; iron cannonball/explosive shell/incendiary bomb; heavy/barbed/trident ballista bolts; poison vial/acid flask/toxic globe; spark/forked lightning/chain crown; and sun ray/twin prism rays/radiant solar beam.

Impact animations are specific to the weapon: stone debris and a ground crater, explosion plumes, ice splinters, poison clouds and bubbles, arcane hexagons, lightning branches, solar rays, and arrow or bolt fragments. Ballista upgrades pierce one/two/three targets, poison inflicts damage over time, lightning chains to nearby enemies, and sunbeams damage enemies along their line. Existing range, damage, health and reload upgrades remain.

Select a built tower to upgrade, sell, or repair it. Repairs restore up to 85 health for 20 gold. A destroyed platform rebuilds for half price. Orange warnings announce enemy shots. Correct answers still provide the firing time and gold required for defense.

Use 1–4 to answer, Q/W/E/R/T for arrows/magic/catapult/frost/cannon, and Space to pause. Later weapons can be selected from the defense bar or with keyboard focus. Menu includes the full Weapon progression guide.

## Math and teacher tools

Menu → Teacher tools supports Kindergarten through Grade 8. Choose the grade, practice level and skill, then click Use this collection. K–5 uses the original elementary generator; Grade 1 also includes its expanded 21-standard generator with safe visual models. Grades 6–8 include 1,600 original Forest Path questions and an 80-skill generator. Computing/web collections and custom JSON/CSV imports remain available.

Fresh math keeps generating new problems. Fixed practice creates a 30-question bank for K–5 and uses the imported library for grades 6–8. Create 30 fresh problems for editing makes a set you can change and share exactly. Editing or importing switches to the current editable bank. JSON and CSV exports preserve models and metadata; CSV uses an optional metadata column. Existing eight-column CSV and Forest Path JSON files also import. Export a classroom pack to retain the bank, curriculum, reward, and battle challenge. Content changes last in the current tab; exports retain them for another session. Original practice content should be reviewed for your class.

## Send a class link

Publish this edition first. Open the published game → Menu → Teacher tools. Apply your curriculum or bank, set the reward and challenge, and scroll to Send a class link. Enter a class name, then Create class link → Copy class link. Paste it into Google Classroom, email, or your class website. Open student link lets you check it. The published HTTPS address fills automatically; when preparing locally, enter your published Knowledge Defense address.

Students open the named assignment and begin. Fresh-generator links select a curriculum; edited/imported banks travel inside the link and restore exactly, including diagrams. For a fixed generated assignment, create an editable 30-problem bank before making the link. Very large banks may need a smaller set. Copy the entire link including #class=. Creating links does not require another repository commit. This tool prepares links for you to post; it does not send messages automatically.

## GitHub Pages deployment

Extract Knowledge-Defense-Arsenal-v6-5.zip. Upload the files and folders inside it to your separate Knowledge Defense repository, keeping index.html at the repository root. Include src, data, vendor, assets and all four CSS files. Do not upload the ZIP itself or an extra enclosing folder. In repository Settings → Pages, publish from the root of your chosen branch. After publishing, refresh with Ctrl+Shift+R. If the browser upload fails, commit assets first, vendor second, then the remaining files. No runtime file exceeds 1.2 MB. Bundled Phaser and artwork require no CDN.

Optional existing MP3 overrides in assets/audio can remain; local sound effects and music work without them. Audio begins after the initial play gesture and can be controlled from Menu.

## Verification and sources

Run npm test for core checks. With the optional Playwright development dependency installed, npm run test:browser, npm run test:classroom, npm run test:siege, npm run test:arsenal, and npm run test:campaign exercise the browser game. The campaign check uses simulated elapsed battle time and real question controls, with 80% correct answers, ordinary earned gold, and a fixed build/repair strategy. It is not a human usability study. The siege check verifies real projectile splash, slow effects, enemy telegraphs, damage, destruction, repairs, rebuilding, six routes and responsive layouts. Source hashes for unchanged reused teaching modules are in data/REUSE-SOURCES.json.
