$ErrorActionPreference='Stop'
$soundList=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'signed-links.json') -Raw | ConvertFrom-Json
$soundFolder=Join-Path $PSScriptRoot 'assets\audio'
New-Item -ItemType Directory -Force -Path $soundFolder | Out-Null
foreach ($clip in $soundList) {
  Write-Host ('Downloading '+$clip.name)
  Invoke-WebRequest -Uri $clip.url -OutFile (Join-Path $soundFolder $clip.name)
}
Compress-Archive -LiteralPath (Join-Path $PSScriptRoot 'assets') -DestinationPath (Join-Path $PSScriptRoot 'Knowledge-Defense-Audio.zip') -Force
Write-Host 'Ready: Knowledge-Defense-Audio.zip. Upload assets/audio/*.mp3 to your game repository.'
