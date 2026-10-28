/* Local audio works without downloaded recordings. Optional assets/audio MP3s
 * replace the matching built-in sounds automatically when available. */
(() => {
  'use strict';
  let ctx,master,sfx,musicBus,analyser,enabled=true,musicOn=true,volume=.65;
  let beat=0,nextBeat=0,recordedTheme=false,effectCount=0,lastEffect='';
  const clips={},missing=new Set(),last={},active=new Set();
  const sources={arrow:'arrow',magic:'magic',cannon:'cannon',build:'build',win:'victory'};
  const midi=n=>440*Math.pow(2,(n-69)/12);
  function init(){
    if(ctx)return true;
    const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return false;
    ctx=new Context();master=ctx.createGain();master.gain.value=enabled?volume:0;
    sfx=ctx.createGain();sfx.gain.value=.8;musicBus=ctx.createGain();musicBus.gain.value=.25;
    analyser=ctx.createAnalyser();analyser.fftSize=1024;
    sfx.connect(master);musicBus.connect(master);master.connect(analyser);analyser.connect(ctx.destination);
    setInterval(schedule,100);return true;
  }
  function nodeDone(node){active.add(node);node.onended=()=>{active.delete(node);node.disconnect();};}
  function note(freq,time,duration,level=.2,type='sine',bus=sfx,slide){
    if(!ctx||active.size>64)return;
    const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,time);
    if(slide)osc.frequency.exponentialRampToValueAtTime(slide,time+duration);
    gain.gain.setValueAtTime(.0001,time);gain.gain.linearRampToValueAtTime(level,time+.008);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
    osc.connect(gain);gain.connect(bus);nodeDone(osc);osc.start(time);osc.stop(time+duration+.02);
  }
  function noise(time,duration,level,filter=1800){
    const size=Math.ceil(ctx.sampleRate*duration),buffer=ctx.createBuffer(1,size,ctx.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<size;i++)data[i]=(Math.random()*2-1)*(1-i/size);
    const source=ctx.createBufferSource(),gain=ctx.createGain(),band=ctx.createBiquadFilter();source.buffer=buffer;band.type='lowpass';band.frequency.value=filter;
    gain.gain.setValueAtTime(level,time);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);source.connect(band);band.connect(gain);gain.connect(sfx);nodeDone(source);source.start(time);
  }
  function fallback(kind){
    const t=ctx.currentTime+.01;
    switch(kind){
      case 'arrow':case 'shot':noise(t,.15,.14,4200);note(380,t,.15,.16,'triangle',sfx,145);break;
      case 'magic':[523,784,1047].forEach((f,i)=>note(f,t+i*.025,.38,.13,'sine',sfx,f*1.3));break;
      case 'cannon':noise(t,.32,.35,900);note(135,t,.38,.45,'triangle',sfx,38);break;
      case 'build':noise(t,.08,.2,1500);[392,523,784].forEach((f,i)=>note(f,t+i*.07,.3,.2,'triangle'));break;
      case 'correct':[659,831,988,1319].forEach((f,i)=>note(f,t+i*.065,.35,.22));break;
      case 'wrong':note(294,t,.23,.2,'triangle',sfx,220);note(196,t+.13,.28,.15);break;
      case 'hurt':noise(t,.25,.2,650);note(95,t,.35,.4,'triangle',sfx,45);break;
      case 'win':[523,659,784,1047].forEach((f,i)=>note(f,t+i*.12,.65,.2,'triangle'));break;
      default:note(660,t,.15,.15);
    }
  }
  function load(key){
    if(clips[key]||missing.has(key))return;
    const a=new Audio('assets/audio/'+key+'.mp3');a.preload='auto';a.volume=(key==='theme'?.22:.6)*volume;clips[key]=a;
    a.addEventListener('error',()=>{missing.add(key);if(key==='theme')recordedTheme=false;});a.load();
  }
  function schedule(){
    if(!ctx||ctx.state!=='running'||!enabled||!musicOn||document.hidden||recordedTheme)return;
    const now=ctx.currentTime;if(nextBeat<now-.1)nextBeat=now+.04;
    while(nextBeat<now+.28){
      const roots=[48,45,53,55],root=roots[Math.floor(beat/16)%4],pattern=[0,7,12,4,7,12,2,7],n=pattern[beat%8];
      note(midi(root+12+n),nextBeat,.55,.065,'triangle',musicBus);
      if(beat%4===0)note(midi(root),nextBeat,1,.1,'sine',musicBus);
      if(beat%8===4)note(midi(root+24+(beat%16===4?7:4)),nextBeat,1.15,.035,'sine',musicBus);
      if(beat%16===0){note(midi(root+7),nextBeat,2.8,.025,'sine',musicBus);note(midi(root+12),nextBeat,2.8,.02,'sine',musicBus);}
      beat++;nextBeat+=60/96/2;
    }
  }
  function applyVolume(){
    if(master)master.gain.setTargetAtTime(enabled&&!document.hidden?volume:0,ctx.currentTime,.025);
    for(const [key,a]of Object.entries(clips))a.volume=enabled?(key==='theme'?.22:.6)*volume:0;
  }
  function playTheme(){
    if(!enabled||!musicOn)return;
    load('theme');const a=clips.theme;if(!a||missing.has('theme'))return;
    a.loop=true;a.play().then(()=>{recordedTheme=true;}).catch(()=>{recordedTheme=false;});
  }
  window.KDAudio={
    async unlock(){if(!init())return false;try{await ctx.resume();applyVolume();schedule();return ctx.state==='running';}catch{return false;}},
    enable(value){enabled=!!value;if(enabled){init();ctx?.resume();Object.values(sources).forEach(load);playTheme();}else Object.values(clips).forEach(a=>a.pause());applyVolume();},
    effect(kind){
      if(!enabled||!init())return false;ctx.resume();
      const now=performance.now(),delay={arrow:85,magic:150,cannon:230}[kind]||0;
      if(now-(last[kind]||-10000)<delay)return true;last[kind]=now;effectCount++;lastEffect=kind;
      const key=sources[kind],a=key&&clips[key];
      if(a&&!missing.has(key)&&a.readyState>=2){a.currentTime=0;a.play().catch(()=>fallback(kind));}else fallback(kind);
      return true;
    },
    music(value){musicOn=!!value;if(musicOn){if(!init())return;ctx.resume();nextBeat=ctx.currentTime+.04;playTheme();schedule();}else{clips.theme?.pause();recordedTheme=false;}if(musicBus)musicBus.gain.setTargetAtTime(musicOn?.25:0,ctx.currentTime,.12);},
    duck(value){if(musicBus)musicBus.gain.setTargetAtTime(musicOn?(value?.09:.25):0,ctx.currentTime,.1);if(clips.theme)clips.theme.volume=(value?.08:.22)*volume*(enabled?1:0);},
    setVolume(value){volume=Math.max(0,Math.min(1,Number(value)));applyVolume();},
    status(){const samples=new Float32Array(1024);analyser?.getFloatTimeDomainData(samples);return {context:ctx?.state||'not-started',enabled,musicOn,mode:recordedTheme?'recorded':'built-in',volume,effectCount,lastEffect,rms:Math.sqrt(samples.reduce((sum,n)=>sum+n*n,0)/samples.length)};}
  };
  document.addEventListener('visibilitychange',()=>{applyVolume();if(document.hidden)clips.theme?.pause();else if(enabled&&musicOn){playTheme();nextBeat=ctx?ctx.currentTime+.04:0;}});
})();
