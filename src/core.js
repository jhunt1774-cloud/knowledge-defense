(function(root){
  'use strict';
  const towers={
    archer:{unlock:0,name:'Ranger tower',symbol:'➶',cost:70,range:165,damage:17,rate:.65,color:0xbada86,detail:'Fast arrows · single target'},
    mage:{unlock:0,name:'Arcane spire',symbol:'✧',cost:100,range:150,damage:24,rate:1.1,color:0xe5a4d5,detail:'Magic bolts · slows enemies'},
    catapult:{unlock:1,name:'Siege catapult',symbol:'⌁',cost:155,range:240,damage:64,rate:2.8,color:0xd9b77b,detail:'Long-range stones · wide splash',health:220},
    frost:{unlock:2,name:'Frost beacon',symbol:'❄',cost:110,range:165,damage:18,rate:1.2,color:0x9ddfff,detail:'Ice bolts · strong slow',health:180},
    ballista:{unlock:2,name:'Piercing ballista',symbol:'➹',cost:145,range:220,damage:44,rate:1.45,color:0xd4bd80,health:220,detail:'Heavy bolts · upgraded bolts pierce'},
    venom:{unlock:3,name:'Alchemist launcher',symbol:'⚗',cost:150,range:170,damage:15,rate:1.7,color:0x92db70,health:190,detail:'Poison flasks · damage over time'},
    storm:{unlock:4,name:'Storm obelisk',symbol:'ϟ',cost:185,range:180,damage:36,rate:1.55,color:0x9bdcff,health:210,detail:'Chain lightning · strikes nearby enemies'},
    solar:{unlock:5,name:'Solar prism',symbol:'☀',cost:210,range:245,damage:55,rate:1.9,color:0xffdf86,health:220,detail:'Sunbeam · burns enemies along a line'},
    cannon:{unlock:1,name:'Ember cannon',symbol:'◉',cost:120,range:140,damage:32,rate:1.7,color:0xf0ba72,detail:'Explosive shots · area damage'}
  };
  function curve(nodes,steps=22){const result=[];for(let i=0;i<nodes.length-1;i++){const a=nodes[Math.max(0,i-1)],b=nodes[i],c=nodes[i+1],d=nodes[Math.min(nodes.length-1,i+2)];for(let n=0;n<steps;n++){const t=n/steps,t2=t*t,t3=t2*t;result.push([0,1].map(k=>.5*((2*b[k])+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t2+(-a[k]+3*b[k]-3*c[k]+d[k])*t3)));}}result.push(nodes.at(-1).slice());return result;}
  const maps=[
    {name:'Bramblewood Ruins',subtitle:'Defend the archive among ancient forest ruins',art:'emerald',color:0x315c46,accent:0x48734f,control:[[-45,150],[115,165],[230,260],[210,360],[335,410],[480,390],[535,270],[610,165],[775,130],[880,195],[850,300],[945,365],[1080,330],[1245,270]],sites:[[125,295],[300,185],[315,330],[435,275],[590,410],[630,270],[700,285],[790,410],[980,165],[1035,255],[1100,420],[535,460]],starter:[0,1],boss:'Thorn Warden'},
    {name:'Moonstone Causeway',subtitle:'Hold the island crossings beneath the moon',art:'moonlit',color:0x304951,accent:0x41606a,control:[[-45,330],[130,340],[260,305],[335,205],[510,165],[635,225],[660,350],[780,385],[900,320],[900,210],[1030,160],[1245,190]],sites:[[110,230],[265,405],[350,320],[415,245],[480,400],[440,335],[725,270],[820,445],[840,220],[1000,290],[1065,415],[1120,330]],starter:[0,3],boss:'Moonstone Colossus'},
    {name:'The Ember Rift',subtitle:'Guard the citadel at the edge of the burning chasm',art:'obsidian',color:0x494655,accent:0x5e5764,control:[[-45,150],[150,150],[290,210],[360,310],[325,415],[470,440],[610,350],[650,240],[760,165],[900,170],[1000,250],[960,360],[1090,405],[1245,350]],sites:[[130,290],[290,155],[230,420],[460,280],[500,160],[460,370],[740,345],[765,290],[875,420],[1010,160],[1100,285],[1130,440]],starter:[0,1],boss:'Bug King'}
  ].map(m=>({...m,path:curve(m.control)}));
  const newRealms=[
    {name:'The Sunken Garden',art:'sunken',boss:'Garden Siege Lord',subtitle:'Three tight bends · overlapping fields of fire',control:[[-45,400],[170,400],[230,300],[230,140],[450,105],[520,200],[510,355],[690,410],[805,320],[790,155],[980,115],[1090,230],[1245,270]]},
    {name:'Amber Dunes',art:'dunes',boss:'Sandstone Warbringer',subtitle:'Desert switchbacks · long-range siege defenses',control:[[-45,100],[200,95],[385,205],[280,330],[370,435],[610,415],[725,300],[640,185],[805,90],[1000,150],[1030,315],[1150,405],[1245,410]]},
    {name:'Frostwatch Pass',art:'frostlands',boss:'Frost Sovereign',subtitle:'Mountain hairpins · the final counterattack',control:[[-45,270],[145,265],[270,115],[475,90],[635,205],[570,310],[480,380],[655,440],[860,410],[1010,280],[965,150],[1070,90],[1245,100]]}
  ];
  for(const m of newRealms){const path=curve(m.control),candidates=[];for(let y=90;y<=445;y+=35)for(let x=110;x<=1090;x+=35){const distance=Math.min(...path.map(([px,py])=>Math.hypot(x-px,y-py)));if(distance>=62&&distance<=118)candidates.push([x,y]);}const sites=[];while(sites.length<12){candidates.sort((a,b)=>{const score=p=>sites.length?Math.min(...sites.map(q=>Math.hypot(p[0]-q[0],p[1]-q[1]))):1200-p[0];return score(b)-score(a);});sites.push(candidates.shift());}maps.push({...m,path,sites,starter:[0,2],color:0x496055,accent:0x647854,drawRoad:true});}
  const study={maxCharge:36,defaultReward:12,goldReward:25,feedbackMs:1100,wrongFeedbackMs:3200,unchargedSpeed:.38};
  function stats(type,level=1){const t=towers[type];return {...t,name:type==='catapult'?['Oak Siege Engine','Warded Catapult','Ember War Machine'][level-1]:t.name,health:(t.health||190)+70*(level-1),damage:t.damage*(1+.6*(level-1)),range:t.range+12*(level-1),rate:t.rate/(1+.13*(level-1)),upgrade:Math.round(t.cost*(.75+.35*level)),sell:Math.floor((t.cost+Array.from({length:level-1},(_,i)=>Math.round(t.cost*(.75+.35*(i+1)))).reduce((a,b)=>a+b,0))*.65)};}
  function waveSpec(level,wave,difficulty='standard'){const factor={relaxed:.72,standard:1,expert:1.3}[difficulty]||1;return {count:5+wave*2+Math.min(level,3)*2,hp:Math.round((38+wave*12+(Math.min(level,2)+Math.max(0,level-2)*.35)*26)*factor),speed:45+wave*3+Math.min(level,3)*4,interval:Math.max(.48,1-wave*.065),boss:wave===6};}
  function pathInfo(points){let lengths=[],total=0;for(let i=1;i<points.length;i++){const d=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);lengths.push(d);total+=d;}return {points,lengths,total};}
  function position(path,distance){let d=Math.max(0,distance);for(let i=0;i<path.lengths.length;i++){if(d<=path.lengths[i]){const t=d/path.lengths[i],a=path.points[i],b=path.points[i+1];return {x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t};}d-=path.lengths[i];}const p=path.points.at(-1);return {x:p[0],y:p[1]};}
  root.KDCore={towers,maps,study,curve,stats,waveSpec,pathInfo,position};if(typeof module!=='undefined')module.exports=root.KDCore;
})(typeof window==='undefined'?globalThis:window);
