(function(root){
  'use strict';
  const towers={
    archer:{name:'Ranger tower',symbol:'➶',cost:70,range:165,damage:17,rate:.65,color:0xbada86,detail:'Fast arrows · single target'},
    mage:{name:'Arcane spire',symbol:'✧',cost:100,range:150,damage:24,rate:1.1,color:0xe5a4d5,detail:'Magic bolts · slows enemies'},
    cannon:{name:'Ember cannon',symbol:'◉',cost:120,range:140,damage:32,rate:1.7,color:0xf0ba72,detail:'Explosive shots · area damage'}
  };
  const maps=[
    {name:'Emerald Approach',subtitle:'Protect the royal archive',color:0x315c46,accent:0x48734f,path:[[-30,150],[210,150],[210,440],[470,440],[470,240],[710,240],[710,485],[925,485]],sites:[[110,245],[300,235],[115,365],[310,355],[385,530],[395,255],[560,350],[620,150],[620,485],[795,340],[805,555],[480,145]]},
    {name:'Moonlit Crossing',subtitle:'Hold the bridge of forgotten loops',color:0x304951,accent:0x41606a,path:[[-30,435],[170,435],[170,205],[405,205],[405,450],[640,450],[640,135],[925,135]],sites:[[85,335],[270,335],[85,145],[290,145],[315,480],[495,325],[535,535],[730,335],[550,160],[735,245],[830,235],[390,145]]},
    {name:'Obsidian Keep',subtitle:'Face the Bug King and seal the rift',color:0x494655,accent:0x5e5764,path:[[-30,125],[260,125],[260,310],[105,310],[105,485],[470,485],[470,175],[710,175],[710,445],[925,445]],sites:[[100,210],[350,225],[175,390],[345,390],[365,550],[550,365],[560,275],[625,270],[800,270],[800,535],[55,550],[365,145]]}
  ];
  function stats(type,level=1){const t=towers[type];return {...t,damage:t.damage*(1+.6*(level-1)),range:t.range+12*(level-1),rate:t.rate/(1+.13*(level-1)),upgrade:Math.round(t.cost*(.75+.35*level)),sell:Math.floor((t.cost+Array.from({length:level-1},(_,i)=>Math.round(t.cost*(.75+.35*(i+1)))).reduce((a,b)=>a+b,0))*.65)};}
  function waveSpec(level,wave,difficulty='standard'){const factor={relaxed:.72,standard:1,expert:1.3}[difficulty]||1;return {count:5+wave*2+level*2,hp:Math.round((38+wave*12+level*26)*factor),speed:45+wave*3+level*4,interval:Math.max(.48,1-wave*.065),boss:wave===6};}
  function pathInfo(points){let lengths=[],total=0;for(let i=1;i<points.length;i++){const d=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);lengths.push(d);total+=d;}return {points,lengths,total};}
  function position(path,distance){let d=Math.max(0,distance);for(let i=0;i<path.lengths.length;i++){if(d<=path.lengths[i]){const t=d/path.lengths[i],a=path.points[i],b=path.points[i+1];return {x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t};}d-=path.lengths[i];}const p=path.points.at(-1);return {x:p[0],y:p[1]};}
  root.KDCore={towers,maps,stats,waveSpec,pathInfo,position};if(typeof module!=='undefined')module.exports=root.KDCore;
})(typeof window==='undefined'?globalThis:window);
