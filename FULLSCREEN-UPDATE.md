# Knowledge Defense — full-screen battlefield and working audio

The battlefield now fills the browser viewport. The former page header, permanent sidebar, explanatory text, and footer have been removed from play. The map camera adapts to the window without stretching the tower/creature art or changing its ground-plane viewpoint. Terrain fills the area around the route so there are no empty letterbox bars.

Only compact health/gold/wave indicators, the build dock, Study, and Send Wave remain over the board. Tower details appear when a tower is selected and close with ×, Escape, or a click on empty terrain. Hints fade after four seconds. Menu contains teacher tools, help, speed, full-screen mode, volume, music, mute, and restart. Opening Menu pauses the battle until it closes. Questions and the teacher workshop also pause combat.

## Sound fix

Sound is on by default and unlocks after the player clicks **Begin expedition**, as required by browser autoplay behavior. The game now includes built-in arrow, magic, cannon, construction, correct/incorrect answer, castle damage, and victory sounds, plus a quiet looping fantasy-style score. No MP3 download or account is needed for these sounds.

Open **Menu → Sound** to mute/unmute everything, adjust **Volume**, or uncheck **Background music** independently. Sound pauses when the page is hidden. If the optional ElevenLabs MP3s are installed in `assets/audio/`, the corresponding recordings are preferred; a missing or unplayable recording falls back to the local sound engine.

## Upload

Extract the new GitHub-ready ZIP. Upload its contents into the **existing Knowledge Defense repository**, replacing matching files and preserving its folder structure. Include the new **fullscreen.css** and the updated index.html/src files. All illustrated graphics are included in the package. Existing optional audio uploads can remain in `assets/audio/`.

After Pages deploys, use **Ctrl+Shift+R** to reload the website. Updated stylesheet and game-script URLs include a version tag to reduce stale browser-cache problems.

## Verification

- Canvas covered the entire viewport at 1366×768, 1024×600, 768×1024, 390×844, and 844×390 with no page scrolling.
- Camera-adjusted map clicks placed towers correctly after the layout change.
- Contextual tower panels, menus, teacher tools, questions, and controls were exercised in Chrome.
- The audio context ran after Begin expedition. An analyser measured a nonzero output signal for sound effects; mute/unmute and volume control were checked. Background music was also checked separately from effects. These are signal checks, not a human listening test.
- Both full 18-wave campaign runs, original browser regression checks, and all seven data/mechanics tests passed after the layout changes.

Forest Path was not modified.
