/* Knowledge Defense: answering powers combat. No passive auto-win resource. */
(() => {
  'use strict';
  const C=KDCore;
  const S=window.KD={level:0,wave:0,gold:200,lives:20,correct:0,answered:0,kills:0,running:false,paused:false,blocked:true,speed:1,selected:-1,build:'archer',difficulty:'standard',powerReward:12,fireTime:0,maxFireTime:36,feedbackMs:1100,over:false,started:false,towers:[],enemies:[],shots:[],pending:0,spawnClock:0,intermission:0,totalShots:0,emptyTime:0,ruins:[],towersLost:0,enemyShots:0,repairs:0};
  let scene,sitesLayer,rangeLayer,baseArt,backdrop,enemyId=0,lastPowered=null,uiClock=0;
  const notify=()=>window.KDUI?.refresh();
  const hint=text=>{document.getElementById('hint').textContent=text;};
  const tone=type=>window.KDUI?.tone(type);
  class Battle extends Phaser.Scene{
    constructor(){super('Battle');}
    preload(){KDArt.preload(this);}
    create(){
      scene=this;rangeLayer=this.add.graphics().setDepth(5);sitesLayer=this.add.graphics().setDepth(55);
      this.makeTextures();this.loadMap();this.scale.on('resize',()=>this.fitBoard());
      this.input.on('pointerdown',p=>{if(S.blocked||S.over)return;const w=this.cameras.main.getWorldPoint(p.x,p.y),i=C.maps[S.level].sites.findIndex(([x,y])=>Math.hypot(x-w.x,y-w.y)<36);if(i>=0)S.selectSite(i);else{S.selected=-1;this.drawSites();notify();}});
      S.ready=true;notify();
    }
    fitBoard(){
      const tray=document.getElementById('question-tray'),height=tray&&!tray.hidden?Math.max(130,tray.getBoundingClientRect().top):this.scale.height;
      const width=this.scale.width,aspect=width/height,zoom=aspect>=2&&aspect<=2.95?Math.max(width/1200,height/520):Math.min(width/1240,height/550),camera=this.cameras.main;
      camera.setViewport(0,0,width,height).setZoom(zoom).centerOn(600,260);
      if(backdrop){const img=backdrop.texture.getSourceImage(),scale=Math.max((width/zoom+4)/img.width,(height/zoom+4)/img.height);backdrop.setDisplaySize(img.width*scale,img.height*scale);}
      this._playHeight=height;
    }
    makeTextures(){
      KDArt.register(this);const g=this.make.graphics({x:0,y:0,add:false});
      g.fillStyle(0xf8e7bd);g.fillTriangle(26,8,17,3,17,13);g.lineStyle(2,0xd0a46b);g.lineBetween(2,8,20,8);g.lineStyle(1,0xb8d5b1);g.lineBetween(2,8,7,4);g.lineBetween(2,8,7,12);g.generateTexture('arrow-fx',28,16);g.clear();
      for(const [key,color]of [['magic-fx',0xdcb1ff],['ember-fx',0xffbb69]]){g.fillStyle(color,.13);g.fillCircle(16,16,16);g.fillStyle(color,.45);g.fillCircle(16,16,8);g.fillStyle(0xfff4d5);g.fillCircle(16,16,3);g.generateTexture(key,32,32);g.clear();}g.destroy();
    }
    loadMap(){
      const map=C.maps[S.level];S.path=C.pathInfo(map.path);
      this.children.list.filter(o=>o.getData?.('worldart')).forEach(o=>o.destroy());
      const mark=o=>o.setData('worldart',true);
      const ambientKey='ambient-'+S.level;if(!this.textures.exists(ambientKey)){const texture=this.textures.createCanvas(ambientKey,240,104),ctx=texture.context;ctx.filter='blur(14px)';ctx.drawImage(this.textures.get(map.art).getSourceImage(),-24,-14,288,132);texture.refresh();}
      backdrop=mark(this.add.image(600,260,ambientKey).setDepth(-30).setFlipX(!!map.mirror).setTint(0x9db1a2));
      baseArt=mark(this.add.image(600,260,map.art).setDisplaySize(1200,520).setFlipX(!!map.mirror).setDepth(-20));
      if(map.drawRoad){const key='route-'+S.level;if(!this.textures.exists(key)){const tex=this.textures.createCanvas(key,1200,520),ctx=tex.context,stone=document.createElement('canvas');stone.width=190;stone.height=190;stone.getContext('2d').drawImage(this.textures.get('road').getSourceImage(),0,0,190,190);ctx.lineCap='round';ctx.lineJoin='round';const route=()=>{ctx.beginPath();ctx.moveTo(...map.path[0]);for(const p of map.path)ctx.lineTo(...p);};route();ctx.strokeStyle=map.art==='frostlands'?'#718e95':'#76684a';ctx.lineWidth=66;ctx.shadowColor='#18231588';ctx.shadowBlur=5;ctx.stroke();ctx.shadowBlur=0;route();ctx.lineWidth=59;ctx.strokeStyle=ctx.createPattern(stone,'repeat');ctx.stroke();route();ctx.lineWidth=57;ctx.strokeStyle=map.art==='frostlands'?'#e6f4fc99':map.art==='dunes'?'#eaca8b55':'#a39e6530';ctx.stroke();let seed=321+S.level;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let i=2;i<map.path.length-2;i+=2){const [x,y]=map.path[i],a=map.path[i-1],b=map.path[i+1],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy)||1;for(const sign of [-1,1]){const offset=29+rand()*10,px=x-dy/length*offset*sign,py=y+dx/length*offset*sign;ctx.fillStyle=map.art==='frostlands'?'#e2eff4bb':map.art==='sunken'?'#697843aa':'#a6865388';ctx.beginPath();ctx.ellipse(px,py,1+rand()*3,1+rand()*2,rand()*3,0,Math.PI*2);ctx.fill();}}tex.refresh();}mark(this.add.image(600,260,key).setDepth(-10));}
      // Original painted maps retain their authored roads; added realms use unique sampled routes.
      const end=map.path.at(-1),castle=mark(this.add.image(map.mirror?50:1150,end[1]+28,'castles',S.level%3).setOrigin(.5,1));castle.setScale(146/castle.frame.height).setDepth(100+end[1]+28);
      const portal=mark(this.add.image(map.mirror?1178:22,map.path[0][1]+10,'portal',0).setOrigin(.5,.89));portal.setScale(94/portal.frame.height).setDepth(100+map.path[0][1]);
      this.fitBoard();this.drawSites();lastPowered=null;
    }
    drawSites(){
      sitesLayer.clear();rangeLayer.clear();this.children.list.filter(o=>o.getData?.('sitelabel')||o.getData?.('siteart')).forEach(o=>o.destroy());
      C.maps[S.level].sites.forEach(([x,y],i)=>{const t=S.towers.find(t=>t.site===i);if(S.selected===i){sitesLayer.lineStyle(2,0xffd786,.95);sitesLayer.strokeEllipse(x,y,62,34);}if(!t){this.add.image(x,y+5,'platform',0).setDisplaySize(54,33).setDepth(50).setData('siteart',true);this.add.text(x,y-1,S.ruins.includes(i)?'↻ '+(i+1):String(i+1),{fontFamily:'system-ui',fontSize:'12px',color:'#fff0ba',fontStyle:'bold',stroke:'#243a32',strokeThickness:4}).setOrigin(.5).setDepth(60).setData('sitelabel',true);}else{if(t.type==='frost')this.add.text(x,y-86,'❄',{fontFamily:'Georgia',fontSize:'22px',color:'#c6f6ff',stroke:'#315e89',strokeThickness:3}).setOrigin(.5).setDepth(900).setData('sitelabel',true);this.add.text(x,y+14,'◆'.repeat(t.level),{fontFamily:'system-ui',fontSize:'8px',color:'#ffe2a0',stroke:'#26362b',strokeThickness:3}).setOrigin(.5).setDepth(900).setData('sitelabel',true);}});
      if(S.selected>=0){const[x,y]=C.maps[S.level].sites[S.selected],t=S.towers.find(t=>t.site===S.selected),r=C.stats(t?.type||S.build,t?.level||1).range;rangeLayer.fillStyle(0xb6e9ed,.06);rangeLayer.fillCircle(x,y,r);rangeLayer.lineStyle(1,0xd2ecc2,.5);rangeLayer.strokeCircle(x,y,r);}
    }
    update(time,delta){
      if(!S.ready)return;
      const tray=document.getElementById('question-tray'),height=tray&&!tray.hidden?Math.max(130,tray.getBoundingClientRect().top):this.scale.height;if(Math.abs(height-this._playHeight)>1)this.fitBoard();
      if(S.blocked||S.paused||S.over||!S.started)return;
      const realDt=Math.min(delta,80)/1000,dt=realDt*S.speed;
      const powered=S.fireTime>.001;
      if(powered!==lastPowered){for(const t of S.towers){t.sprite.setTint(powered?(t.type==='frost'?0x99dfff:0xffffff):0x80958e);t.aura.setVisible(powered);}lastPowered=powered;}
      if(!S.running){if(S.intermission>0){S.intermission=Math.max(0,S.intermission-realDt);if(S.intermission===0)beginWave();}uiClock+=realDt;if(uiClock>.1){uiClock=0;notify();}return;}
      const moveDt=dt*(powered?1:C.study.unchargedSpeed);S.spawnClock-=moveDt;
      if(S.pending>0&&S.spawnClock<=0){spawn(S.pending===1&&S.spec.boss);S.pending--;S.spawnClock=S.spec.interval;}
      for(const e of [...S.enemies]){
        if(e.dead)continue;e.slow=Math.max(0,e.slow-dt);e.distance+=e.speed*(e.windup>0?0:moveDt)*(e.slow>0?.5:1);const p=C.position(S.path,e.distance);e.x=p.x;e.y=p.y;e.sprite.setPosition(e.x,e.y+Math.sin(e.distance*.09)*1.5).setDepth(100+e.y);
        const ahead=C.position(S.path,e.distance+3);if(Math.abs(ahead.x-e.x)>.1)e.sprite.setFlipX(ahead.x<e.x);if(!e.boss)e.sprite.setFrame(Math.floor(e.distance/12)%4);e.sprite.setTint(e.slow>0?0xc0cfff:0xffffff);
        e.bar.clear();if(e.hp<e.maxHp||e.boss){e.bar.fillStyle(0x12272b,.9);e.bar.fillRoundedRect(e.x-e.size/2-1,e.y-e.drawHeight*.88-1,e.size+2,6,2);e.bar.fillStyle(e.boss?0xe6b780:0xb6d791);e.bar.fillRect(e.x-e.size/2,e.y-e.drawHeight*.88,e.size*Math.max(0,e.hp/e.maxHp),4);}
        if(e.ranged){e.attackClock-=moveDt;e.warning.clear();if(e.windup>0){e.windup=Math.max(0,e.windup-moveDt);const t=e.attackTarget;if(t&&S.towers.includes(t)){e.warning.lineStyle(3,0xff9c68,.85);e.warning.strokeEllipse(t.x,t.y,65,34);e.warning.lineStyle(2,0xffbc84,.75);e.warning.lineBetween(e.x,e.y-24,t.x,t.y-40);if(e.windup===0){const sprite=this.add.image(e.x,e.y-30,'ember-fx').setTint(0xff7666).setScale(.7).setDepth(850);S.shots.push({hostile:true,x:e.x,y:e.y-30,target:t,damage:e.attackDamage,sprite});S.enemyShots++;e.attackClock=e.boss?6:8;}}else{e.windup=0;e.attackClock=2;}}else if(e.attackClock<=0){const target=S.towers.filter(t=>Math.hypot(t.x-e.x,t.y-e.y)<e.attackRange).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(target){e.attackTarget=target;e.windup=1.8;hint('Incoming attack! Orange marks show the tower being targeted. Repair from tower details.');}}}
        if(e.distance>=S.path.total-100){remove(e);S.lives=Math.max(0,S.lives-(e.boss?5:1));tone('hurt');notify();if(S.lives<=0){finish(false);return;}}
      }
      const engaged=powered&&S.towers.some(t=>S.enemies.some(e=>!e.dead&&Math.hypot(e.x-t.x,e.y-t.y)<C.stats(t.type,t.level).range));
      if(engaged)S.fireTime=Math.max(0,S.fireTime-realDt);
      if(!powered)S.emptyTime+=realDt;
      for(const t of S.towers){
        t.cooldown-=dt;if(!powered||t.cooldown>0)continue;
        const st=C.stats(t.type,t.level),target=S.enemies.filter(e=>!e.dead&&Math.hypot(e.x-t.x,e.y-t.y)<st.range).sort((a,b)=>b.distance-a.distance)[0];if(!target)continue;
        t.cooldown=st.rate;const y=t.y-(['cannon','catapult'].includes(t.type)?45:72),sprite=this.add.image(t.x,y,t.type==='archer'?'arrow-fx':['mage','frost'].includes(t.type)?'magic-fx':'ember-fx').setDepth(800);if(t.type==='archer')sprite.setScale(.7);if(t.type==='frost')sprite.setTint(0x80dfff);if(t.type==='catapult')sprite.setScale(1.4).setTint(0xd0b18c);
        S.shots.push({x:t.x,y,target,type:t.type,damage:st.damage,sprite});S.totalShots++;tone(t.type==='archer'?'arrow':t.type==='mage'?'magic':'cannon');
      }
      for(const shot of [...S.shots]){if(shot.hostile){if(!S.towers.includes(shot.target)){destroyShot(shot);continue;}const dx=shot.target.x-shot.x,dy=shot.target.y-45-shot.y,d=Math.hypot(dx,dy),step=210*dt;if(d<=step){hurtTower(shot.target,shot.damage);destroyShot(shot);}else{shot.x+=dx/d*step;shot.y+=dy/d*step;shot.sprite.setPosition(shot.x,shot.y);}continue;}if(shot.target.dead){destroyShot(shot);continue;}const dx=shot.target.x-shot.x,dy=shot.target.y-shot.y,d=Math.hypot(dx,dy),step=430*dt;if(d<=step){const target=shot.target;if(['cannon','catapult'].includes(shot.type)){burst(target.x,target.y,0xffc57f,35);for(const e of [...S.enemies])if(Math.hypot(e.x-target.x,e.y-target.y)<(shot.type==='catapult'?85:65))damage(e,shot.damage);}else{burst(target.x,target.y,shot.type==='mage'?0xd5b2ff:0xffe6a6,12);damage(target,shot.damage);if(['mage','frost'].includes(shot.type)&&!target.dead)target.slow=shot.type==='frost'?4:2;}destroyShot(shot);}else{shot.x+=dx/d*step;shot.y+=dy/d*step;shot.sprite.setPosition(shot.x,shot.y);if(shot.type==='archer')shot.sprite.setRotation(Math.atan2(dy,dx));}}
      for(const t of S.towers){t.bar.clear();if(t.hp<t.maxHp){t.bar.fillStyle(0x251b18,.95);t.bar.fillRect(t.x-24,t.y+20,48,5);t.bar.fillStyle(t.hp/t.maxHp<.35?0xe67d5a:0xa8d589);t.bar.fillRect(t.x-24,t.y+20,48*t.hp/t.maxHp,5);}}
      uiClock+=realDt;if(uiClock>.08){uiClock=0;notify();}
      if(S.pending===0&&S.enemies.length===0&&S.running){S.running=false;S.gold+=25+S.wave*5;tone('win');if(S.wave===6)finish(true);else{S.intermission=4;hint('Wave cleared. Keep answering — next wave in 4 seconds.');}notify();}
    }
  }
  function spawn(boss){const n=S.spec.count-S.pending,kind=boss?'bosses':n%5===3?'brute':n%4===2?'runner':'goblin',hp=S.spec.hp*(boss?6:kind==='brute'?1.65:kind==='runner'?.72:1),size=boss?59:kind==='brute'?42:34,p=C.position(S.path,0),sprite=KDArt.unit(scene,kind,boss?S.level%3:0,p.x,p.y,boss),bar=scene.add.graphics().setDepth(1000);S.enemies.push({id:enemyId++,x:p.x,y:p.y,distance:0,speed:S.spec.speed*(boss?.75:kind==='runner'?1.35:kind==='brute'?.85:1),hp,maxHp:hp,size,drawHeight:sprite.displayHeight,boss,ranged:boss||(kind==='brute'&&(S.level>0||S.wave>=4))||(S.level>=3&&n%6===0),attackRange:boss?205:165,attackDamage:boss?32:19,attackClock:3,windup:0,warning:scene.add.graphics().setDepth(750),slow:0,sprite,bar,dead:false});}
  function remove(e){e.dead=true;e.sprite.destroy();e.bar.destroy();e.warning?.destroy();S.enemies=S.enemies.filter(a=>a!==e);}
  function damage(e,amount){if(e.dead)return;e.hp-=amount;if(e.hp<=0){S.gold+=e.boss?30:3;S.kills++;remove(e);}}
  function destroyShot(s){s.sprite.destroy();S.shots=S.shots.filter(a=>a!==s);}
  function burst(x,y,color,r){for(let i=0;i<6;i++){const a=Math.PI*2*i/6,p=scene.add.circle(x,y,2+Math.random()*2,color,.85).setDepth(850).setData('transient',true);scene.tweens.add({targets:p,x:x+Math.cos(a)*r,y:y+Math.sin(a)*r,alpha:0,scale:.2,duration:260,onComplete:()=>p.destroy()});}}
  function finish(won){S.running=false;S.intermission=0;S.blocked=true;S.over=true;notify();window.KDUI?.end(won);}
  function build(type,site,free=false){const data=C.towers[type];const cost=S.ruins.includes(site)?Math.ceil(data.cost*.5):data.cost;if(!free&&S.gold<cost)return false;if(!free)S.gold-=cost;S.ruins=S.ruins.filter(i=>i!==site);const[x,y]=C.maps[S.level].sites[site],sprite=KDArt.tower(scene,type,1,x,y),aura=scene.add.ellipse(x,y+7,53,19,0x9ce4e6,.23).setDepth(80+y).setVisible(S.fireTime>0);S.towers.push({site,x,y,type,level:1,cooldown:0,sprite,aura,hp:C.stats(type).health,maxHp:C.stats(type).health,bar:scene.add.graphics().setDepth(950)});lastPowered=null;return true;}
  function starterTowers(){const[a,b]=C.maps[S.level].starter;build('archer',a,true);build('mage',b,true);scene.drawSites();}
  S.begin=()=>{if(!S.ready)return false;S.started=true;S.blocked=false;if(!S.towers.length)starterTowers();notify();return true;};
  S.answerReward=()=>{S.fireTime=Math.min(S.maxFireTime,S.fireTime+Number(S.powerReward));S.gold+=C.study.goldReward;if(!S.running&&S.wave===0&&!S.over)beginWave();notify();};
  S.selectSite=i=>{if(!S.ready||S.over||S.blocked||i<0||i>=12)return;S.selected=i;if(!S.towers.some(t=>t.site===i)){if(build(S.build,i)){hint(`${C.towers[S.build].name} built. Answer to keep it firing.`);tone('build');}else hint(`Need ${C.towers[S.build].cost-S.gold} more gold. Correct answers earn 25 gold.`);}scene.drawSites();notify();};
  S.choose=type=>{if(!C.towers[type])return;S.build=type;S.selected=-1;scene?.drawSites();hint(`${C.towers[type].name} selected. Choose an empty foundation.`);notify();};
  S.upgrade=()=>{const t=S.towers.find(t=>t.site===S.selected);if(!t||t.level>=3||S.blocked||S.over)return;const st=C.stats(t.type,t.level);if(S.gold<st.upgrade)return;S.gold-=st.upgrade;t.level++;const extra=C.stats(t.type,t.level).health-t.maxHp;t.maxHp+=extra;t.hp=Math.min(t.maxHp,t.hp+extra);KDArt.upgrade(t.sprite,t.type,t.level);burst(t.x,t.y-35,0xf0d196,25);tone('build');scene.drawSites();notify();};
  S.sell=()=>{const t=S.towers.find(t=>t.site===S.selected);if(!t||S.blocked||S.over)return;S.gold+=C.stats(t.type,t.level).sell;t.sprite.destroy();t.aura.destroy();t.bar.destroy();S.towers=S.towers.filter(a=>a!==t);scene.drawSites();notify();};
  function hurtTower(t,amount){if(!S.towers.includes(t))return;t.hp=Math.max(0,t.hp-amount);burst(t.x,t.y-35,0xf7a071,20);tone('hurt');if(t.hp<=0){t.sprite.destroy();t.aura.destroy();t.bar.destroy();S.towers=S.towers.filter(a=>a!==t);S.ruins.push(t.site);S.towersLost++;hint('A tower fell! Rebuild on its marked platform for half price.');scene.drawSites();}notify();}
  S.repair=()=>{const t=S.towers.find(t=>t.site===S.selected);if(!t||t.hp>=t.maxHp||S.gold<20||S.blocked||S.over)return;S.gold-=20;t.hp=Math.min(t.maxHp,t.hp+85);S.repairs++;burst(t.x,t.y-30,0xa7e4b1,22);tone('build');notify();};
  S.startWave=()=>{if(!S.ready||S.running||S.over||S.blocked)return;if(!S.fireTime){hint('Answer correctly below to charge your defenses.');return;}S.intermission=0;beginWave();};
  function beginWave(){if(S.over||S.running||!S.started)return;S.wave++;S.spec=C.waveSpec(S.level,S.wave,S.difficulty);S.pending=S.spec.count;S.spawnClock=.8;S.running=true;hint(S.wave===6?C.maps[S.level].boss+' approaches. Keep your defenses charged!':'Answer below to fuel your towers.');notify();}
  function clearBoard(){scene.children.list.filter(o=>o.getData?.('transient')).forEach(o=>{scene.tweens.killTweensOf(o);o.destroy();});S.enemies.forEach(e=>{e.sprite.destroy();e.bar.destroy();e.warning?.destroy();});S.shots.forEach(s=>s.sprite.destroy());S.towers.forEach(t=>{t.sprite.destroy();t.aura.destroy();t.bar.destroy();});Object.assign(S,{enemies:[],shots:[],towers:[],ruins:[],running:false,over:false,paused:false,selected:-1,pending:0,wave:0,fireTime:0,intermission:0});lastPowered=null;}
  S.next=()=>{if(S.level>=C.maps.length-1)return;clearBoard();S.level++;S.gold+=120;S.lives=20;S.blocked=false;scene.loadMap();starterTowers();notify();hint('New realm. Your next correct answer begins the defense.');};
  S.reset=()=>{clearBoard();Object.assign(S,{level:0,gold:200,lives:20,kills:0,answered:0,correct:0,blocked:false,started:true,speed:1,build:'archer',totalShots:0,emptyTime:0,towersLost:0,enemyShots:0,repairs:0});scene.loadMap();starterTowers();notify();window.KDUI?.resetQuestions();};
  S.redraw=()=>scene?.drawSites();S.resize=()=>scene?.fitBoard();
  if(typeof Phaser==='undefined'){document.getElementById('game').textContent='The bundled Phaser engine is missing.';return;}
  S.game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:innerWidth,height:innerHeight,backgroundColor:'#142b29',antialias:true,transparent:false,render:{roundPixels:true},fps:{target:30,forceSetTimeOut:true},scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.NO_CENTER},scene:Battle,audio:{noAudio:true},banner:false});
})();
