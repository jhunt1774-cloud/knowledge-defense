/* Optional recorded audio. Upload the separate ElevenLabs sound pack's MP3s
 * into assets/audio/. The game remains playable with synthesized fallback SFX. */
(() => {
  const clips={},missing=new Set(),last={};let enabled=false;
  const sources={arrow:'arrow',magic:'magic',cannon:'cannon',build:'build',win:'victory'};
  function load(key){if(clips[key]||missing.has(key))return;const a=new Audio('assets/audio/'+key+'.mp3');a.preload='auto';a.volume=key==='theme'?.13:key==='cannon'?.2:.28;a.addEventListener('error',()=>{missing.add(key);if(key==='theme'&&document.getElementById('music-status'))document.getElementById('music-status').textContent='Music file not installed';});clips[key]=a;}
  window.KDAudio={
    enable(value){enabled=value;if(value)Object.values(sources).forEach(load);else Object.entries(clips).forEach(([key,a])=>{if(key!=='theme')a.pause();});},
    effect(kind){if(!enabled)return false;const key=sources[kind];if(!key||missing.has(key))return false;const a=clips[key];if(!a||a.readyState<2)return false;const now=performance.now();if(now-(last[key]||0)<(key==='arrow'?180:300))return true;last[key]=now;a.currentTime=0;a.play().catch(()=>{});return true;},
    music(value){if(!value){clips.theme?.pause();return;}load('theme');if(clips.theme){clips.theme.loop=true;clips.theme.play().catch(()=>{});}}
  };
})();
