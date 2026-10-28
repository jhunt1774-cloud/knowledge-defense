# Knowledge Defense — separate ElevenLabs sound download pack

The six recordings were generated successfully in the user's ElevenLabs workspace. This pack contains a downloader, not the recordings themselves, because the current Codex session blocked downloading external audio files.

Open `DOWNLOAD-SOUNDS.html` in Chrome and click **Download recordings as ZIP**. If browser restrictions prevent that, open its individual recording links and save each file using the filename shown, or run `download-sounds.ps1` in PowerShell on your computer.

The temporary links expire on **October 28, 2026, around 4:56 p.m. America/New_York**. After expiry, download the existing recordings from the saved ElevenLabs flow: https://elevenlabs.io/app/flows/wukL1ZiLVB7EpPvrl5OC . Do not generate or pay for new recordings just because the download links expire.

Upload these six files to **your separate Knowledge Defense GitHub repository**, preserving the paths:

- `assets/audio/theme.mp3` — 60-second fantasy background score
- `assets/audio/arrow.mp3` — arrow release
- `assets/audio/magic.mp3` — crystal magic bolt
- `assets/audio/cannon.mp3` — dwarven cannon
- `assets/audio/build.mp3` — tower construction
- `assets/audio/victory.mp3` — victory flourish

The updated game automatically uses these optional recordings once they are installed. Sound starts off; turn on Sound for effects and check Music for the background score. Before recordings are installed, the game keeps its synthesized effect sounds.

Do **not** upload this download helper or `signed-links.json` to GitHub. Only upload the resulting MP3 files. No ElevenLabs account key is included or needed by the game.
