# Delivery verification

Tested October 28, 2026, on Windows with Google Chrome 156.0.8078.73, Playwright 1.64.1, and bundled Phaser 3.90.0.

## Automated checks

- **7/7 Node tests passed**: all 32 sample questions validate; JSON formats; CSV round trips with commas, quotation marks, Unicode, BOM, and multiline fields; invalid banks are rejected; upgrade/refund math; all map paths; enemy and difficulty scaling.
- **Actual-browser regression passed**: keyboard site activation, clicking map platforms, tower building/upgrading/selling, correct and incorrect answer rewards, explanations and return-to-play, invalid-import preservation, CSV and classroom JSON imports, teacher editing/addition/deletion, classroom export, timed and before-wave questions, pausing, and wave completion.
- **Campaign combat checks passed**: all 18 waves across all three realms, including every boss and the final victory screen. One run used maximum defenses and extra test resources to exercise all combat and progression branches. A second run used normal starting gold, standard difficulty, normal kill/wave rewards, and exactly two correctly answered questions before each wave, with a fixed building strategy and no injected gold. That second run defeated 252 monsters and completed the campaign with 20 castle health.
- **Loss/restart passed**: an undefended castle lost health, triggered defeat, and restarted with fresh campaign state.
- **Responsive checks passed** at desktop, 768-pixel, and 390-pixel viewport widths, with no horizontal page overflow. Desktop and narrow layouts were also visually inspected.
- **Local/offline launch passed**: opening `index.html` through `file://` loaded Phaser and supported tower placement. No external runtime requests or uncaught JavaScript errors were observed.
- **Sound toggle passed**: the browser accepted enabling synthesized sound without an exception. Perceived audio quality was not listening-tested.

Long campaign runs advance the actual Phaser scene's update function using capped simulation steps to avoid waiting through every wave in real time. Initial spawning, user interactions, dialogs, imports, exports, and pause behavior run through the browser normally. Combat has no separate mocked implementation.

## Scope and remaining practical checks

This is a working static project, ready for a new GitHub Pages repository. It has **not been published to a GitHub account**. Deployment instructions are in `README.md`.

The fixed-strategy playthrough demonstrates that the standard campaign is winnable with limited review rewards; it does not establish classroom difficulty or session duration for all learners. Actual older Chromebook performance, touch hardware, school filtering, and student playtesting still need a classroom pilot. Sound is synthesized and starts muted. The game does not provide saved progress or a fully nonvisual alternative to its battlefield.

All delivered game files were created inside the separate `knowledge-defense` folder. Forest Path files were not opened or changed.
