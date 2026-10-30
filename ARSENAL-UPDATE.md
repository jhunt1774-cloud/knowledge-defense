# Arsenal edition v6

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

The catapult is now built from a single consistent 3D model, including a hollow pivot bearing, an axle across the cart and a lever swinging in the perpendicular vertical plane. The chassis has an open center for the cup and counterweight. Its parts are rendered with a depth buffer for correct occlusion, and the full sweep is checked for solid intersections. Stones launch from the cup and follow a ballistic arc. Pause freezes the mechanism and flight.

All nine weapons have three ammunition/beam designs with different geometry. Other upgrade paths include feather/broadhead/triple-fin arrows; rune orb/orbiting ring/arcane star; ice shard/twin lance/snowflake; iron cannonball/explosive shell/incendiary bomb; heavy/barbed/trident ballista bolts; poison vial/acid flask/toxic globe; spark/forked lightning/chain crown; and sun ray/twin prism rays/radiant solar beam.

Impact animations are specific to the weapon: stone debris and a ground crater, explosion plumes, ice splinters, poison clouds and bubbles, arcane hexagons, lightning branches, solar rays, and arrow or bolt fragments. Ballista upgrades pierce one/two/three targets, poison inflicts damage over time, lightning chains to nearby enemies, and sunbeams damage enemies along their line. Existing range, damage, health and reload upgrades remain.

## Verification

Automated browser checks exercise all 27 weapon/upgrade combinations, confirm distinct ammunition textures, verify staged unlocks and blocked early selection, catapult arm rotation and ballistic flight, pause behavior, splash, slow, piercing, poison ticks, chain lightning and sunbeam damage. A six-realm simulated campaign uses real questions, normal earned gold and 80% correct answers. Existing class-link, math, audio, import/export and responsive-layout checks remain included.

## Upload

Extract Knowledge-Defense-Arsenal-v6.zip and upload its contents to the separate Knowledge Defense GitHub Pages repository. Include the new src/weapons.js file, updated scripts and styles, and the new assets/data/arsenal.js file. Uploading all extracted contents is easiest. Do not upload the ZIP itself. Refresh with Ctrl+Shift+R after Pages publishes. Class links work with the updated website. No change is needed in Forest Path.
