/* Phaser owns rendering/input. Simulation uses capped delta time and no physics engine. */
(() => {
  'use strict';
  const C=KDCore;
  const S=window.KD={level:0,wave:0,gold:180,lives:20,correct:0,answered:0,kills:0,running:false,paused:false,blocked:true,speed:1,selected:-1,build:'archer',frequency:'30',difficulty:'standard',questionClock:0,over:false,towers:[],enemies:[],shots:[],pending:0,spawnClock:0};
  let scene,terrain,decor,rangeLayer,sitesLayer,castle,fx,enemyId=0;
  const notify=()=>window.KDUI?.refresh();
  function hint(t){document.getElementById('hint').textContent=t;}
  const tone=(type)=>window.KDUI?.tone(type);
  class Battle extends Phaser.Scene{
    constructor(){super('Battle');}
    create(){
      scene=this;terrain=this.add.graphics();decor=this.add.graphics();rangeLayer=this.add.graphics();sitesLayer=this.add.graphics();fx=this.add.graphics();
      this.makeTextures();this.loadMap();
      this.input.on('pointerdown',p=>{if(S.blocked||S.over)return;const sites=C.maps[S.level].sites;const index=sites.findIndex(s=>Math.hypot(s[0]-p.x,s[1]-p.y)<35);if(index>=0)S.selectSite(index);});
      S.ready=true;notify();
    }
    makeTextures(){
      const g=this.make.graphics({x:0,y:0,add:false});
      const tex=(key,draw,w=72,h=90)=>{g.clear();draw(g);g.generateTexture(key,w,h);};
      for(const [type,t] of Object.entries(C.towers))tex(type,g=>{
        g.fillStyle(0x102b29,.35);g.fillEllipse(36,74,60,19);
        g.fillStyle(0x89877b);g.fillRoundedRect(15,39,42,33,4);g.fillStyle(0xc2bb97);g.fillRect(15,39,33,30);g.fillStyle(0xe1d6ac);g.fillEllipse(36,39,44,14);g.lineStyle(2,0x666e62);g.strokeEllipse(36,70,43,13);
        g.fillStyle(0x59625c);g.fillRect(30,50,9,17);g.fillStyle(t.color);
        if(type==='archer'){g.fillTriangle(10,35,36,7,62,35);g.fillStyle(0x587953);g.fillRect(19,33,34,9);g.lineStyle(3,0xd5c294);g.lineBetween(36,4,36,21);g.fillStyle(0xf3d48d);g.fillTriangle(38,4,51,10,38,16);}
        if(type==='mage'){g.fillTriangle(15,34,36,2,57,34);g.fillStyle(0x7d638e);g.fillRect(23,30,26,10);g.fillStyle(0xf9d5f1);g.fillCircle(36,17,6);g.lineStyle(2,0xd6a7e9);g.strokeCircle(36,17,12);}
        if(type==='cannon'){g.fillStyle(0x3d454b);g.fillRoundedRect(24,12,24,30,5);g.fillStyle(0x252a31);g.fillEllipse(36,13,23,13);g.fillStyle(0xe1a363);g.fillCircle(36,14,6);g.fillStyle(0x555c60);g.fillEllipse(36,40,40,16);}
      });
      for(const [key,color] of [['goblin',0x9bb872],['runner',0x83c5c4],['brute',0xb698b4],['boss',0xc37b6e]])tex(key,g=>{
        g.fillStyle(0x102b29,.3);g.fillEllipse(30,60,39,12);g.fillStyle(0x3b4546);g.fillRoundedRect(16,34,28,25,7);g.fillStyle(color);g.fillCircle(30,26,18);g.fillTriangle(13,19,3,14,15,33);g.fillTriangle(47,19,57,14,45,33);g.fillStyle(0x172832);g.fillRect(19,23,7,5);g.fillRect(35,23,7,5);g.fillStyle(0xf3e8c8);g.fillRect(27,35,8,3);g.fillStyle(0x59645b);g.fillRect(15,53,10,10);g.fillRect(35,53,10,10);
        if(key==='boss'){g.fillStyle(0xe6c077);g.fillTriangle(13,14,12,0,24,10);g.fillTriangle(24,10,30,0,36,10);g.fillTriangle(36,10,48,0,47,14);g.fillRect(14,10,32,6);}
        if(key==='brute'){g.fillStyle(0x6c7984);g.fillRoundedRect(12,10,36,10,4);}
      },60,70);
      g.destroy();
    }
    loadMap(){
      const map=C.maps[S.level];S.path=C.pathInfo(map.path);terrain.clear();decor.clear();sitesLayer.clear();rangeLayer.clear();
      this.children.list.filter(o=>o.getData?.('maplabel')).forEach(o=>o.destroy());
      terrain.fillStyle(map.color);terrain.fillRect(0,0,900,600);
      let seed=510+S.level;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
      // Seeded patches, meadow flecks, and stepping-stone path.
      for(let i=0;i<100;i++){terrain.fillStyle(map.accent,.16+random()*.16);terrain.fillEllipse(random()*900,random()*600,25+random()*110,15+random()*65);}
      if(S.level===1){terrain.lineStyle(75,0x243e52);terrain.beginPath();terrain.moveTo(0,290);terrain.lineTo(900,340);terrain.strokePath();terrain.lineStyle(2,0x729ca0,.3);for(let i=0;i<35;i++){const x=random()*900,y=290+x/18;terrain.lineBetween(x,y-20+random()*35,x+20,y-20+random()*35);}}
      const pathDraw=(width,color)=>{terrain.lineStyle(width,color,1);terrain.beginPath();map.path.forEach(([x,y],i)=>i?terrain.lineTo(x,y):terrain.moveTo(x,y));terrain.strokePath();for(const [x,y]of map.path){terrain.fillStyle(color);terrain.fillCircle(x,y,width/2);}};
      pathDraw(66,0x203e35);pathDraw(57,0x8c8363);pathDraw(48,0xb3a580);pathDraw(35,0xbeb28b);
      for(let d=20;d<S.path.total;d+=24){const p=C.position(S.path,d);terrain.fillStyle(0x877d63,.25);terrain.fillRoundedRect(p.x-8+random()*12,p.y-12+random()*18,5+random()*9,3,2);}
      const nearPath=(x,y)=>{for(let d=0;d<S.path.total;d+=24){const p=C.position(S.path,d);if(Math.hypot(p.x-x,p.y-y)<67)return true;}return false;};
      for(let i=0;i<130;i++){const x=random()*900,y=random()*600;if(nearPath(x,y)||map.sites.some(p=>Math.hypot(p[0]-x,p[1]-y)<44))continue;if(random()<.5){const size=17+random()*20;decor.fillStyle(0x162f2d,.35);decor.fillEllipse(x+5,y+7,size*1.4,13);decor.fillStyle(0x655b43);decor.fillRect(x-3,y-4,6,15);decor.fillStyle(S.level===2?0x354944:0x214b39);decor.fillTriangle(x-size*.65,y+2,x,y-size*1.65,x+size*.65,y+2);decor.fillStyle(S.level===2?0x4d6456:0x3b6a48);decor.fillTriangle(x-size*.5,y-10,x-1,y-size*1.7,x+size*.4,y-10);decor.fillStyle(0x719069,.6);decor.fillTriangle(x-size*.35,y-17,x,y-size*1.7,x+size*.1,y-17);}else{decor.fillStyle(0xa4b083,.55);decor.fillCircle(x,y,2);decor.fillStyle(0x173e33,.5);decor.fillEllipse(x+3,y+2,9,4);}}
      this.drawCastle(map.path.at(-1)[1]);this.drawSites();
      const text=this.add.text(28,22,['THE EMERALD WILDS','THE SILVER RIVER','THE ASHEN HIGHLANDS'][S.level],{fontFamily:'Georgia',fontSize:'14px',color:'#d5daba'}).setAlpha(.75);text.setData('maplabel',true);
      const gate=map.path[0];this.add.text(16,gate[1]-57,'MONSTER\nPORTAL',{fontFamily:'system-ui',fontSize:'9px',color:'#eee3bb',align:'center'}).setData('maplabel',true);
      terrain.lineStyle(3,0xc693d3,.8);terrain.strokeEllipse(13,gate[1],25,62);terrain.fillStyle(0x483e65,.7);terrain.fillEllipse(13,gate[1],17,49);
    }
    drawCastle(y){
      const g=decor,x=807;g.fillStyle(0x132e2d,.4);g.fillEllipse(x+22,y+36,120,38);g.fillStyle(0x8c9690);g.fillRoundedRect(x-10,y-43,80,74,4);g.fillStyle(0xc3c5b0);g.fillRect(x-10,y-43,62,70);g.fillStyle(0xa5b1a4);for(const dx of [-25,54]){g.fillRect(x+dx,y-63,30,95);g.fillStyle(0xd3d2b6);g.fillRect(x+dx,y-63,20,90);g.fillStyle(0x476771);g.fillTriangle(x+dx-7,y-63,x+dx+15,y-100,x+dx+37,y-63);g.fillStyle(0xa5b1a4);}g.fillStyle(0x263c3b);g.fillRoundedRect(x+10,y-7,25,40,{tl:12,tr:12,bl:0,br:0});g.fillStyle(0x354c4b);g.fillRect(x+3,y-37,9,15);g.fillRect(x+36,y-37,9,15);g.lineStyle(2,0xe6d099);g.lineBetween(x+17,y-97,x+17,y-126);g.fillStyle(0xe6bb75);g.fillTriangle(x+18,y-126,x+42,y-117,x+18,y-109);
    }
    drawSites(){
      sitesLayer.clear();rangeLayer.clear();const map=C.maps[S.level];
      this.children.list.filter(o=>o.getData?.('sitelabel')).forEach(o=>o.destroy());
      map.sites.forEach(([x,y],i)=>{const t=S.towers.find(t=>t.site===i);sitesLayer.fillStyle(0x102e2b,.4);sitesLayer.fillEllipse(x+3,y+7,57,29);sitesLayer.fillStyle(S.selected===i?0xc6ad73:0x939c84);sitesLayer.fillEllipse(x,y,51,28);sitesLayer.lineStyle(2,S.selected===i?0xf3d28c:0xc0c7a3,.8);sitesLayer.strokeEllipse(x,y-2,49,26);if(!t){const label=this.add.text(x,y-4,String(i+1),{fontFamily:'system-ui',fontSize:'14px',color:'#233d36',fontStyle:'bold'}).setOrigin(.5);label.setData('sitelabel',true);}});
      if(S.selected>=0){const [x,y]=map.sites[S.selected],t=S.towers.find(t=>t.site===S.selected);const r=C.stats(t?.type||S.build,t?.level||1).range;rangeLayer.fillStyle(0xe8d6a1,.07);rangeLayer.fillCircle(x,y,r);rangeLayer.lineStyle(1,0xf0d28f,.45);rangeLayer.strokeCircle(x,y,r);}
    }
    update(time,delta){
      if(!S.ready||S.blocked||S.paused||S.over)return;
      const dt=Math.min(delta,80)/1000*S.speed;
      if(!S.running)return;
      S.questionClock+=dt;
      if(!['manual','wave'].includes(S.frequency)&&S.questionClock>=Number(S.frequency)){S.questionClock=0;window.KDUI.ask();return;}
      S.spawnClock-=dt;
      if(S.pending>0&&S.spawnClock<=0){spawn(S.pending===1&&S.spec.boss);S.pending--;S.spawnClock=S.spec.interval;}
      for(const e of [...S.enemies]){
        if(e.dead)continue;e.slow=Math.max(0,e.slow-dt);e.distance+=e.speed*dt*(e.slow>0?.5:1);const p=C.position(S.path,e.distance);e.x=p.x;e.y=p.y;
        e.sprite.setPosition(e.x,e.y+Math.sin(e.distance*.09)*2);e.sprite.setDepth(10+e.y/1000);e.bar.clear();e.bar.fillStyle(0x12272b);e.bar.fillRect(e.x-e.size/2,e.y-e.size*.8,e.size,5);e.bar.fillStyle(e.boss?0xe6b780:0xb6d791);e.bar.fillRect(e.x-e.size/2,e.y-e.size*.8,e.size*Math.max(0,e.hp/e.maxHp),5);
        if(e.distance>=S.path.total-55){remove(e);S.lives=Math.max(0,S.lives-(e.boss?5:1));tone('hurt');hint(e.boss?'The boss struck the castle!':'A monster reached the archive!');notify();if(S.lives<=0){finish(false);return;}}
      }
      for(const t of S.towers){t.cooldown-=dt;if(t.cooldown>0)continue;const st=C.stats(t.type,t.level),targets=S.enemies.filter(e=>!e.dead&&Math.hypot(e.x-t.x,e.y-t.y)<st.range).sort((a,b)=>b.distance-a.distance);if(targets.length){const target=targets[0];t.cooldown=st.rate;const sprite=this.add.circle(t.x,t.y-36,t.type==='cannon'?6:4,st.color).setDepth(30);S.shots.push({x:t.x,y:t.y-36,target,type:t.type,damage:st.damage,sprite});tone('shot');}}
      for(const shot of [...S.shots]){if(shot.target.dead){destroyShot(shot);continue;}const dx=shot.target.x-shot.x,dy=shot.target.y-shot.y,d=Math.hypot(dx,dy),step=420*dt;if(d<=step){const target=shot.target;if(shot.type==='cannon'){burst(target.x,target.y,0xe6ac72,48);for(const e of [...S.enemies])if(Math.hypot(e.x-target.x,e.y-target.y)<65)damage(e,shot.damage);}else{burst(target.x,target.y,shot.type==='mage'?0xe5a4d5:0xdbe5b0,12);damage(target,shot.damage);if(shot.type==='mage'&&!target.dead)target.slow=2;}destroyShot(shot);}else{shot.x+=dx/d*step;shot.y+=dy/d*step;shot.sprite.setPosition(shot.x,shot.y);}}
      if(S.pending===0&&S.enemies.length===0&&S.running){S.running=false;S.gold+=25+S.wave*5;hint('Wave cleared! Build, upgrade, or study before the next wave.');tone('win');notify();if(S.wave===6)finish(true);}
    }
  }
  function spawn(boss){const n=S.spec.count-S.pending;const kind=boss?'boss':n%5===3?'brute':n%4===2?'runner':'goblin';const hp=S.spec.hp*(boss?7:kind==='brute'?1.8:kind==='runner'?.7:1),size=boss?60:kind==='brute'?40:32;const p=C.position(S.path,0);const sprite=scene.add.image(p.x,p.y,kind).setDisplaySize(size,size*70/60).setOrigin(.5,.7);const bar=scene.add.graphics().setDepth(31);S.enemies.push({id:enemyId++,x:p.x,y:p.y,distance:0,speed:S.spec.speed*(boss?.7:kind==='runner'?1.5:kind==='brute'?.8:1),hp,maxHp:hp,size,boss,slow:0,sprite,bar,dead:false});}
  function remove(e){e.dead=true;e.sprite.destroy();e.bar.destroy();S.enemies=S.enemies.filter(a=>a!==e);}
  function damage(e,amount){if(e.dead)return;e.hp-=amount;if(e.hp<=0){S.gold+=e.boss?35:5;S.kills++;remove(e);notify();}}
  function destroyShot(s){s.sprite.destroy();S.shots=S.shots.filter(a=>a!==s);}
  function burst(x,y,color,r){const circle=scene.add.circle(x,y,r,color,.4).setDepth(29).setData('transient',true);scene.tweens.add({targets:circle,alpha:0,scale:1.5,duration:200,onComplete:()=>circle.destroy()});}
  function finish(won){S.running=false;S.blocked=true;S.over=true;window.KDUI?.end(won);}
  S.selectSite=i=>{
    if(!S.ready||S.over||S.blocked)return;S.selected=i;
    const tower=S.towers.find(t=>t.site===i);
    if(!tower){const t=C.towers[S.build];if(S.gold>=t.cost){S.gold-=t.cost;const [x,y]=C.maps[S.level].sites[i];const sprite=scene.add.image(x,y,S.build).setOrigin(.5,.82).setDepth(8);S.towers.push({site:i,x,y,type:S.build,level:1,cooldown:0,sprite});hint(`${t.name} built at site ${i+1}.`);tone('build');}else hint(`Need ${t.cost-S.gold} more gold. Answer a study question to earn it.`);}
    scene.drawSites();notify();
  };
  S.choose=type=>{S.build=type;S.selected=-1;scene?.drawSites();hint(`${C.towers[type].name} selected. Choose an empty platform.`);notify();};
  S.upgrade=()=>{const t=S.towers.find(t=>t.site===S.selected);if(!t||t.level>=3||S.blocked||S.over)return;const st=C.stats(t.type,t.level);if(S.gold<st.upgrade){hint('Study for gold to afford this upgrade.');return;}S.gold-=st.upgrade;t.level++;t.sprite.setTint(t.level===2?0xffe2a4:0xffc97b);burst(t.x,t.y-35,0xf0d196,25);tone('build');scene.drawSites();notify();};
  S.sell=()=>{const t=S.towers.find(t=>t.site===S.selected);if(!t||S.blocked||S.over)return;S.gold+=C.stats(t.type,t.level).sell;t.sprite.destroy();S.towers=S.towers.filter(a=>a!==t);hint('Tower sold. The platform is ready for a new defense.');scene.drawSites();notify();};
  S.startWave=()=>{if(!S.ready||S.running||S.over||S.blocked)return;if(S.frequency==='wave')window.KDUI.ask(beginWave);else beginWave();};
  function beginWave(){if(S.over||S.running)return;S.wave++;S.spec=C.waveSpec(S.level,S.wave,S.difficulty);S.pending=S.spec.count;S.spawnClock=.5;S.questionClock=0;S.running=true;S.paused=false;hint(S.wave===6?'Boss wave! Combine slowing magic and concentrated fire.':'Monsters approach. You can keep building during battle.');notify();}
  function clearBoard(){scene.children.list.filter(o=>o.getData?.('transient')).forEach(o=>{scene.tweens.killTweensOf(o);o.destroy();});S.enemies.forEach(e=>{e.sprite.destroy();e.bar.destroy();});S.shots.forEach(s=>s.sprite.destroy());S.towers.forEach(t=>t.sprite.destroy());S.enemies=[];S.shots=[];S.towers=[];S.running=false;S.over=false;S.paused=false;S.selected=-1;S.pending=0;S.questionClock=0;S.wave=0;}
  S.next=()=>{clearBoard();S.level++;S.gold+=160;S.lives=Math.min(20,S.lives+6);S.blocked=false;scene.loadMap();notify();hint('A new realm! Build fresh defenses before sending the first wave.');};
  S.reset=()=>{clearBoard();Object.assign(S,{level:0,gold:180,lives:20,kills:0,answered:0,correct:0,blocked:false,speed:1,build:'archer'});scene.loadMap();notify();hint('Choose a tower, then an empty stone platform.');};
  S.redraw=()=>scene?.drawSites();
  if(typeof Phaser==='undefined'){document.getElementById('game').textContent='The bundled Phaser file is missing. Restore vendor/phaser.min.js from the project package.';return;}
  S.game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:900,height:600,backgroundColor:'#315c46',antialias:true,transparent:false,render:{pixelArt:false,roundPixels:true},fps:{target:30,forceSetTimeOut:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:Battle,audio:{noAudio:true},banner:false});
})();
