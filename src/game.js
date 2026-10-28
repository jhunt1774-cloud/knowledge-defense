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
    preload(){KDArt.preload(this);}
    create(){
      scene=this;terrain=this.add.graphics();decor=this.add.graphics();rangeLayer=this.add.graphics().setDepth(5);sitesLayer=this.add.graphics().setDepth(55);fx=this.add.graphics();
      this.makeTextures();this.loadMap();
      this.input.on('pointerdown',p=>{if(S.blocked||S.over)return;const sites=C.maps[S.level].sites;const index=sites.findIndex(s=>Math.hypot(s[0]-p.x,s[1]-p.y)<35);if(index>=0)S.selectSite(index);});
      S.ready=true;notify();
    }
    makeTextures(){
      KDArt.register(this);
      const g=this.make.graphics({x:0,y:0,add:false});
      // Tiny combat effects remain procedural; all world and unit art is illustrated.
      g.fillStyle(0xf8e7bd);g.fillTriangle(26,8,17,3,17,13);g.lineStyle(2,0xd0a46b);g.lineBetween(2,8,20,8);g.lineStyle(1,0xb8d5b1);g.lineBetween(2,8,7,4);g.lineBetween(2,8,7,12);g.generateTexture('arrow-fx',28,16);g.clear();
      g.fillStyle(0xb46ff7,.13);g.fillCircle(16,16,16);g.fillStyle(0xdcb1ff,.35);g.fillCircle(16,16,10);g.fillStyle(0xefdcff);g.fillCircle(16,16,4);g.generateTexture('magic-fx',32,32);g.clear();
      g.fillStyle(0xf29242,.13);g.fillCircle(16,16,16);g.fillStyle(0xf2a34e,.5);g.fillCircle(16,16,8);g.fillStyle(0xffe0a0);g.fillCircle(16,16,4);g.generateTexture('ember-fx',32,32);g.destroy();
    }
    loadMap(){
      const map=C.maps[S.level];S.path=C.pathInfo(map.path);terrain.clear();decor.clear();sitesLayer.clear();rangeLayer.clear();
      this.children.list.filter(o=>o.getData?.('maplabel')||o.getData?.('worldart')).forEach(o=>o.destroy());
      const mark=o=>o.setData('worldart',true);
      mark(this.add.image(450,300,['emerald','moonlit','obsidian'][S.level]).setDisplaySize(900,600).setDepth(-20));
      // Draw the exact gameplay route with painted cobbles. Keeping the collision
      // path and the texture stroke on the same coordinates avoids off-road units.
      const key='road-'+S.level;
      if(this.textures.exists(key))this.textures.remove(key);
      const texture=this.textures.createCanvas(key,900,600),ctx=texture.context;
      const tile=document.createElement('canvas');tile.width=tile.height=220;
      tile.getContext('2d').drawImage(this.textures.get('road').getSourceImage(),0,0,220,220);
      const line=(width,style)=>{ctx.beginPath();map.path.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=width;ctx.strokeStyle=style;ctx.stroke();};
      ctx.shadowColor='#071d1b99';ctx.shadowBlur=9;ctx.shadowOffsetY=4;line(57,'#25392c');ctx.shadowBlur=0;ctx.shadowOffsetY=0;
      line(52,S.level===2?'#61566c':'#79806a');line(46,ctx.createPattern(tile,'repeat'));
      // Weathered outer stones and tiny verge flecks soften the road's contour.
      let seed=82+S.level;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
      for(let d=10;d<S.path.total;d+=15){const p=C.position(S.path,d),q=C.position(S.path,d+1),angle=Math.atan2(q.y-p.y,q.x-p.x)+Math.PI/2;for(const side of [-1,1]){const x=p.x+Math.cos(angle)*side*26,y=p.y+Math.sin(angle)*side*26;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=['#c2b796','#a49c83','#8d9276'][Math.floor(rnd()*3)];ctx.beginPath();ctx.roundRect(-3,-4,5+rnd()*2,8,2);ctx.fill();ctx.restore();}}
      if(S.level===1){for(const [x,y]of [[170,300],[405,312],[640,325]]){ctx.fillStyle='#5a5145';ctx.fillRect(x-31,y-36,62,72);for(let py=y-32;py<y+33;py+=8){ctx.fillStyle=py%3?'#b3a081':'#9c8b73';ctx.fillRect(x-29,py,58,6);ctx.fillStyle='#c8baa0';ctx.fillRect(x-29,py,58,1);}ctx.fillStyle='#c6c4aa';ctx.fillRect(x-33,y-39,5,78);ctx.fillRect(x+28,y-39,5,78);for(const dx of [-31,30])for(const dy of [-35,35]){ctx.fillStyle='#eee3be';ctx.beginPath();ctx.arc(x+dx,y+dy,6,0,Math.PI*2);ctx.fill();}}}
      texture.refresh();mark(this.add.image(450,300,key).setDepth(-10));
      const endY=map.path.at(-1)[1];
      const castle=mark(this.add.image(818,endY+29,'castles',S.level).setOrigin(.5,1));castle.setScale(153/castle.frame.height).setDepth(100+endY+29);
      const portal=mark(this.add.image(28,map.path[0][1]+14,'portal',0).setOrigin(.5,.89));portal.setScale(105/portal.frame.height).setDepth(100+map.path[0][1]);
      this.drawSites();
      const title=this.add.text(25,20,['THE EMERALD WILDS','THE SILVER RIVER','THE ASHEN HIGHLANDS'][S.level],{fontFamily:'Georgia',fontSize:'12px',color:'#fff1c7',stroke:'#1b3029',strokeThickness:3}).setDepth(950).setAlpha(.9);title.setData('maplabel',true);
    }
    drawSites(){
      sitesLayer.clear();rangeLayer.clear();const map=C.maps[S.level];
      this.children.list.filter(o=>o.getData?.('sitelabel')).forEach(o=>o.destroy());
      this.children.list.filter(o=>o.getData?.('siteart')).forEach(o=>o.destroy());
      map.sites.forEach(([x,y],i)=>{
        const t=S.towers.find(t=>t.site===i);
        if(S.selected===i){sitesLayer.lineStyle(2,0xffd786,.95);sitesLayer.strokeEllipse(x,y,64,35);}
        if(!t){
          const disk=this.add.image(x,y+5,'platform',0).setDisplaySize(57,35).setDepth(50).setData('siteart',true);
          const label=this.add.text(x,y-1,String(i+1),{fontFamily:'system-ui',fontSize:'13px',color:'#fff0ba',fontStyle:'bold',stroke:'#243a32',strokeThickness:4}).setOrigin(.5).setDepth(60);label.setData('sitelabel',true);
        }else{
          const badge=this.add.text(x,y+14,'◆'.repeat(t.level),{fontFamily:'system-ui',fontSize:'8px',color:'#ffe2a0',stroke:'#26362b',strokeThickness:3}).setOrigin(.5).setDepth(900);badge.setData('sitelabel',true);
        }
      });
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
        e.sprite.setPosition(e.x,e.y+Math.sin(e.distance*.09)*2);e.sprite.setDepth(100+e.y);const future=C.position(S.path,e.distance+3);if(Math.abs(future.x-e.x)>.1)e.sprite.setFlipX(future.x<e.x);if(!e.boss)e.sprite.setFrame(Math.floor(e.distance/12)%4);e.sprite.setTint(e.slow>0?0xc0cfff:0xffffff);e.bar.clear();e.bar.fillStyle(0x12272b);e.bar.fillRect(e.x-e.size/2,e.y-e.drawHeight*.88,e.size,5);e.bar.fillStyle(e.boss?0xe6b780:0xb6d791);e.bar.fillRect(e.x-e.size/2,e.y-e.drawHeight*.88,e.size*Math.max(0,e.hp/e.maxHp),5);
        if(e.distance>=S.path.total-55){remove(e);S.lives=Math.max(0,S.lives-(e.boss?5:1));tone('hurt');hint(e.boss?'The boss struck the castle!':'A monster reached the archive!');notify();if(S.lives<=0){finish(false);return;}}
      }
      for(const t of S.towers){t.cooldown-=dt;if(t.cooldown>0)continue;const st=C.stats(t.type,t.level),targets=S.enemies.filter(e=>!e.dead&&Math.hypot(e.x-t.x,e.y-t.y)<st.range).sort((a,b)=>b.distance-a.distance);if(targets.length){const target=targets[0];t.cooldown=st.rate;const sy=t.y-(t.type==='cannon'?48:74);const sprite=this.add.image(t.x,sy,t.type==='archer'?'arrow-fx':t.type==='mage'?'magic-fx':'ember-fx').setDepth(800);if(t.type==='archer')sprite.setScale(.7);S.shots.push({x:t.x,y:sy,target,type:t.type,damage:st.damage,sprite});tone(t.type==='archer'?'arrow':t.type==='mage'?'magic':'cannon');}}
      for(const shot of [...S.shots]){if(shot.target.dead){destroyShot(shot);continue;}const dx=shot.target.x-shot.x,dy=shot.target.y-shot.y,d=Math.hypot(dx,dy),step=420*dt;if(d<=step){const target=shot.target;if(shot.type==='cannon'){burst(target.x,target.y,0xe6ac72,48);for(const e of [...S.enemies])if(Math.hypot(e.x-target.x,e.y-target.y)<65)damage(e,shot.damage);}else{burst(target.x,target.y,shot.type==='mage'?0xe5a4d5:0xdbe5b0,12);damage(target,shot.damage);if(shot.type==='mage'&&!target.dead)target.slow=2;}destroyShot(shot);}else{shot.x+=dx/d*step;shot.y+=dy/d*step;shot.sprite.setPosition(shot.x,shot.y);if(shot.type==='archer')shot.sprite.setRotation(Math.atan2(dy,dx));}}
      if(S.pending===0&&S.enemies.length===0&&S.running){S.running=false;S.gold+=25+S.wave*5;hint('Wave cleared! Build, upgrade, or study before the next wave.');tone('win');notify();if(S.wave===6)finish(true);}
    }
  }
  function spawn(boss){
    const n=S.spec.count-S.pending,kind=boss?'bosses':n%5===3?'brute':n%4===2?'runner':'goblin';
    const hp=S.spec.hp*(boss?7:kind==='brute'?1.8:kind==='runner'?.7:1),size=boss?59:kind==='brute'?42:34;
    const p=C.position(S.path,0),sprite=KDArt.unit(scene,kind,boss?S.level:0,p.x,p.y,boss),bar=scene.add.graphics().setDepth(1000);
    S.enemies.push({id:enemyId++,x:p.x,y:p.y,distance:0,speed:S.spec.speed*(boss?.7:kind==='runner'?1.5:kind==='brute'?.8:1),hp,maxHp:hp,size,drawHeight:sprite.displayHeight,boss,slow:0,sprite,bar,dead:false});
  }
  function remove(e){e.dead=true;e.sprite.destroy();e.bar.destroy();S.enemies=S.enemies.filter(a=>a!==e);}
  function damage(e,amount){if(e.dead)return;e.hp-=amount;if(e.hp<=0){S.gold+=e.boss?35:5;S.kills++;remove(e);notify();}}
  function destroyShot(s){s.sprite.destroy();S.shots=S.shots.filter(a=>a!==s);}
  function burst(x,y,color,r){const circle=scene.add.circle(x,y,r,color,.4).setDepth(850).setData('transient',true);scene.tweens.add({targets:circle,alpha:0,scale:1.5,duration:200,onComplete:()=>circle.destroy()});}
  function finish(won){S.running=false;S.blocked=true;S.over=true;window.KDUI?.end(won);}
  S.selectSite=i=>{
    if(!S.ready||S.over||S.blocked)return;S.selected=i;
    const tower=S.towers.find(t=>t.site===i);
    if(!tower){const t=C.towers[S.build];if(S.gold>=t.cost){S.gold-=t.cost;const [x,y]=C.maps[S.level].sites[i];const sprite=KDArt.tower(scene,S.build,1,x,y);S.towers.push({site:i,x,y,type:S.build,level:1,cooldown:0,sprite});hint(`${t.name} built at site ${i+1}.`);tone('build');}else hint(`Need ${t.cost-S.gold} more gold. Answer a study question to earn it.`);}
    scene.drawSites();notify();
  };
  S.choose=type=>{S.build=type;S.selected=-1;scene?.drawSites();hint(`${C.towers[type].name} selected. Choose an empty platform.`);notify();};
  S.upgrade=()=>{const t=S.towers.find(t=>t.site===S.selected);if(!t||t.level>=3||S.blocked||S.over)return;const st=C.stats(t.type,t.level);if(S.gold<st.upgrade){hint('Study for gold to afford this upgrade.');return;}S.gold-=st.upgrade;t.level++;KDArt.upgrade(t.sprite,t.type,t.level);burst(t.x,t.y-35,0xf0d196,25);tone('build');scene.drawSites();notify();};
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
