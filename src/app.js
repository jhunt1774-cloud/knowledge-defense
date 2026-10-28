(() => {
  'use strict';
  const $=id=>document.getElementById(id),S=KD,C=KDCore,modal=$('modal'),teacher=$('teacher-modal');
  let bank=QuestionBank.validate(window.KD_SAMPLE_QUESTIONS),bag=[],sound=false,audio,editIndex=0,currentQuestion=null,afterQuestion=null;
  function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
  function button(text,action,cls){const b=el('button',text,cls);b.addEventListener('click',action);return b;}
  function portrait(key,frame=0,width=64,height=76){const canvas=el('canvas');canvas.width=width*2;canvas.height=height*2;canvas.className='art-portrait';canvas.setAttribute('aria-hidden','true');const asset=KD_ASSETS[key],img=new Image();img.onload=()=>{const [x,y,w,h]=asset.frames[frame],scale=Math.min(canvas.width/w,canvas.height/h);canvas.getContext('2d').drawImage(img,x,y,w,h,(canvas.width-w*scale)/2,canvas.height-h*scale,w*scale,h*scale);};img.src=asset.data;return canvas;}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function show(content){$('modal-body').replaceChildren(...content);S.blocked=true;if(!modal.open)modal.showModal();}
  function close(){modal.close();S.blocked=S.over||teacher.open;currentQuestion=null;afterQuestion=null;refresh();}
  function tone(kind){
    if(!sound)return;
    try{if(window.KDAudio?.effect(kind))return;audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const shot=['shot','arrow','magic','cannon'].includes(kind);if(shot&&Math.random()>.18)return;const o=audio.createOscillator(),g=audio.createGain();const now=audio.currentTime;const f={shot:330,arrow:430,magic:660,cannon:110,build:520,win:740,correct:880,wrong:190,hurt:120}[kind]||440;o.type=kind==='hurt'||kind==='cannon'?'triangle':'sine';o.frequency.setValueAtTime(f,now);o.frequency.exponentialRampToValueAtTime(f*(kind==='wrong'?.6:1.3),now+.12);g.gain.setValueAtTime(shot?.018:.065,now);g.gain.exponentialRampToValueAtTime(.001,now+.18);o.connect(g);g.connect(audio.destination);o.start();o.stop(now+.2);}catch{sound=false;$('sound').textContent='Sound unavailable';}
  }
  function refresh(){
    $('gold').innerHTML=`${S.gold} <i>◆</i>`;$('hearts').innerHTML=`${S.lives} <i>♥</i>`;$('wave').textContent=`${S.wave} / 6`;$('accuracy').textContent=`${S.correct} / ${S.answered}`;
    $('map-title').textContent=C.maps[S.level].name;$('map-subtitle').textContent=C.maps[S.level].subtitle;$('chapter').textContent=`0${S.level+1} / ${C.maps[S.level].name.toUpperCase()}`;
    $('state-label').textContent=S.over?'BATTLE ENDED':S.paused?'PAUSED':S.running?'WAVE IN PROGRESS':'BUILD PHASE';
    $('start').disabled=S.running||S.over||!S.ready;$('start').textContent=S.wave===5?'Send boss wave →':'Send wave →';$('pause').textContent=S.paused?'Resume':'Pause';$('speed').textContent=`Speed: ${S.speed}×`;
    $('quiz').disabled=S.over;$('bank-count').textContent=`${bank.length} review questions`;
    for(const type of Object.keys(C.towers)){const b=$('tower-'+type);if(b){b.classList.toggle('active',type===S.build);b.setAttribute('aria-pressed',String(type===S.build));}}
    const t=S.towers.find(t=>t.site===S.selected),st=t?C.stats(t.type,t.level):null;
    $('selected-title').textContent=t?`${st.name} · Level ${t.level}`:S.selected>=0?`Site ${S.selected+1} · empty`:'Choose a site';
    $('selected-info').textContent=t?`${Math.round(st.damage)} damage · ${Math.round(st.range)} range · ${st.rate.toFixed(2)}s between shots${t.level===3?' · Maximum level':''}`:'Select a tower card, then tap a numbered site to build. Select an existing tower to upgrade or sell.';
    $('upgrade').textContent=t&&t.level<3?`Upgrade · ${st.upgrade} ◆`:t?'Max level':'Upgrade';$('upgrade').disabled=!t||t.level>=3||S.gold<st.upgrade||S.over;
    $('sell').textContent=t?`Sell · ${st.sell} ◆`:'Sell';$('sell').disabled=!t||S.over;
    for(let i=0;i<12;i++){const b=$('site-'+i);if(!b)continue;const tower=S.towers.find(t=>t.site===i);b.classList.toggle('occupied',!!tower);b.classList.toggle('selected',i===S.selected);b.setAttribute('aria-label',`Site ${i+1}: ${tower?C.towers[tower.type].name+', level '+tower.level:'empty; build '+C.towers[S.build].name}`);b.disabled=S.over||!S.ready;}
  }
  function ask(callback){
    if(currentQuestion||S.over||teacher.open)return;
    if(!bag.length)bag=shuffle([...bank.keys()]);const q=bank[bag.pop()];currentQuestion=q;afterQuestion=callback;S.questionClock=0;
    const eyebrow=el('span','THE SCHOLAR’S CHALLENGE','eyebrow'),topic=el('h2',q.topic),prompt=el('div',q.prompt,'question-prompt'),choices=el('div',undefined,'answers'),note=el('p','The battle is paused. Take your time. Correct: +60 gold · Try again reward: +15 gold','muted');
    const order=shuffle([0,1,2,3]);order.forEach((original,i)=>{const b=button('',()=>answer(original,b), 'answer');b.append(el('span','ABCD'[i]),el('div',q.choices[original]));b.dataset.choice=String(original);choices.append(b);});
    const feedback=el('div');show([eyebrow,topic,prompt,choices,note,feedback]);
    function answer(value,chosen){if(currentQuestion!==q||choices.dataset.done)return;choices.dataset.done='yes';const ok=value===q.answer;S.answered++;if(ok)S.correct++;S.gold+=ok?60:15;for(const b of choices.children){b.disabled=true;if(Number(b.dataset.choice)===q.answer)b.classList.add('correct');}if(!ok)chosen.classList.add('wrong');tone(ok?'correct':'wrong');note.textContent=ok?'Well reasoned. +60 gold earned.':'Keep learning. +15 effort gold earned.';feedback.className='feedback';feedback.append(el('strong',ok?'Correct!':'Correct answer: '+q.choices[q.answer]),el('p',q.explanation),button(callback?'Continue to wave →':'Return to the battlefield →',()=>{const next=afterQuestion;close();next?.();},'primary wide'));refresh();feedback.scrollIntoView({block:'nearest'});}
  }
  function intro(){
    const pills=el('div',undefined,'level-pills');['3 realms','18 waves','32 questions'].forEach(t=>pills.append(el('span',t)));
    show([el('span','WELCOME, CASTLE GUARDIAN','eyebrow'),portrait('castles',0,110,150),el('h2','Defend the Algorithm Kingdom.'),el('p','Monsters are marching toward the royal archive. Build towers, answer computer science questions, and turn your knowledge into gold.'),pills,el('p','Start with 180 gold. Choose a tower card, then a numbered platform to build. Send a wave when ready. Study for more gold whenever you need it. Questions always pause combat.'),button('Begin expedition →',close,'primary wide'),button('Read the field guide',()=>help(true),'wide subtle')]);
  }
  function help(fromIntro=false){
    const list=el('ol',undefined,'instructions');[
      'Build: choose Ranger (70), Arcane (100), or Cannon (120), then tap a stone platform. The numbered site buttons also work with Tab and Enter.',
      'Battle: send a wave when ready. Towers attack automatically. You can build, upgrade, sell, or study during combat.',
      'Review: correct answers earn 60 gold. Other answers earn 15 effort gold and an explanation. Study has no limit; the goal is practice.',
      'Strategy: rangers fire quickly, arcane spires slow monsters, and cannons damage groups. Select a built tower to see its range and upgrade it to level 3.',
      'Campaign: survive six waves, including a boss, in each of three realms. New realms clear towers, add 160 gold, and restore up to 6 castle health. Unspent gold carries over.',
      'Controls: use mouse, touch, or Tab/Enter for all buttons and sites. Pause stops combat. Speed cycles 1×/2×. Sound starts off. Teacher tools set question timing and manage banks.'
    ].forEach(t=>list.append(el('li',t)));
    show([el('span','FIELD GUIDE','eyebrow'),el('h2','Knowledge wins battles.'),list,button(fromIntro?'Begin expedition →':'Return to battle →',close,'primary wide')]);
  }
  function end(won){
    const final=won&&S.level===2,stats=el('div',undefined,'stat-grid');[[S.kills,'monsters defeated'],[`${S.correct}/${S.answered}`,'review correct'],[S.lives,'castle health']].forEach(([v,l])=>{const d=el('div');d.append(el('strong',String(v)),el('small',l));stats.append(d);});
    show([el('span',final?'THE ARCHIVE IS SAFE':won?'REALM DEFENDED':'THE ARCHIVE NEEDS YOU','eyebrow'),el('div',won?'✦ ♜ ✦':'♜','banner-art'),el('h2',final?'A kingdom of knowledge.':won?`${C.maps[S.level].name} secured.`:'The castle has fallen.'),el('p',final?'You conquered all three realms and defeated the Bug King. Every answer made your defenses stronger.':won?'Your next realm awaits. Towers reset, unspent gold carries over, and you receive 160 gold plus up to 6 health.':'Try more slowing towers near corners, add splash damage for groups, and study for gold before the next wave.'),stats,button(won&&!final?'Travel to next realm →':'Play a new expedition →',()=>{modal.close();currentQuestion=null;won&&!final?S.next():S.reset();},'primary wide')]);
  }
  function openTeacher(){if(modal.open)return;S.blocked=true;$('frequency').value=S.frequency;$('difficulty').value=S.difficulty;renderList();loadEditor(0);teacher.showModal();}
  function closeTeacher(){teacher.close();S.blocked=S.over||modal.open;refresh();}
  function msg(t){$('teacher-message').textContent=t;}
  function renderList(){const list=$('question-list');list.replaceChildren();bank.forEach((q,i)=>{const b=button(`${i+1}. ${q.topic} · ${q.prompt.slice(0,65)}`,()=>loadEditor(i));b.classList.toggle('active',i===editIndex);list.append(b);});refresh();}
  function loadEditor(i){editIndex=i;$('edit-index').value=i;const q=bank[i]||{topic:'Computer science',prompt:'',choices:['','','',''],answer:0,explanation:''};$('edit-topic').value=q.topic;$('edit-prompt').value=q.prompt;$('edit-answer').value=q.answer;$('edit-explanation').value=q.explanation;const target=$('choice-editor');target.replaceChildren();q.choices.forEach((choice,j)=>{const label=el('label',`Choice ${'ABCD'[j]}`),input=el('input');input.id='edit-choice-'+j;input.value=choice;input.required=true;input.maxLength=500;label.append(input);target.append(label);});$('delete-question').disabled=i>=bank.length||bank.length<=1;[...$('question-list').children].forEach((b,j)=>b.classList.toggle('active',j===i));}
  function download(name,text,type){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('editor').addEventListener('submit',e=>{e.preventDefault();try{const q=QuestionBank.validate([{topic:$('edit-topic').value,prompt:$('edit-prompt').value,choices:[0,1,2,3].map(i=>$('edit-choice-'+i).value),answer:Number($('edit-answer').value),explanation:$('edit-explanation').value}])[0];if(editIndex>=bank.length&&bank.length>=500)throw Error('A bank can contain up to 500 questions.');bank[editIndex]=q;bag=[];renderList();loadEditor(editIndex);msg('Question applied to this session. Export to keep your changes.');}catch(e){msg(e.message);}});
  $('delete-question').onclick=()=>{if(bank.length<=1)return;bank.splice(editIndex,1);bag=[];editIndex=Math.min(editIndex,bank.length-1);renderList();loadEditor(editIndex);msg('Question deleted. Export to keep this bank.');};
  $('add-question').onclick=()=>{loadEditor(bank.length);msg('Fill in all fields, then apply the new question.');$('edit-prompt').focus();};
  $('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2000000)throw Error('Files must be smaller than 2 MB.');const text=await file.text(),next=QuestionBank.parse(text,file.name);let settings=null;if(!/\.csv$/i.test(file.name)){const obj=JSON.parse(text);settings=obj.settings;if(settings){if(!['15','30','45','wave','manual'].includes(String(settings.frequency))||!['relaxed','standard','expert'].includes(settings.difficulty))throw Error('Classroom pack settings are invalid.');}}bank=next;bag=[];if(settings){S.frequency=String(settings.frequency);S.difficulty=settings.difficulty;$('frequency').value=S.frequency;$('difficulty').value=S.difficulty;S.questionClock=0;}editIndex=0;renderList();loadEditor(0);msg(`Imported ${bank.length} questions${settings?' and classroom settings':''}. The previous bank was replaced.`);}catch(err){msg('Import failed: '+err.message+' Your current bank is unchanged.');}e.target.value='';};
  $('export-json').onclick=()=>download('knowledge-defense-questions.json',JSON.stringify({version:1,questions:bank},null,2),'application/json');
  $('export-csv').onclick=()=>download('knowledge-defense-questions.csv',QuestionBank.toCSV(bank),'text/csv;charset=utf-8');
  $('export-pack').onclick=()=>download('knowledge-defense-classroom.json',JSON.stringify({version:1,settings:{frequency:S.frequency,difficulty:S.difficulty},questions:bank},null,2),'application/json');
  $('frequency').onchange=e=>{S.frequency=e.target.value;S.questionClock=0;msg('Question frequency updated. Export a classroom pack to keep it.');};$('difficulty').onchange=e=>{S.difficulty=e.target.value;msg('Challenge updated starting with the next wave.');};
  for(const [type,t]of Object.entries(C.towers)){const b=button('',()=>S.choose(type),'tower-card');b.id='tower-'+type;b.setAttribute('aria-pressed',String(type===S.build));const info=el('span');info.append(el('b',t.name),el('small',t.detail));b.append(portrait({archer:'ranger',mage:'mage',cannon:'cannon'}[type]),info,el('span',t.cost+' ◆','cost'));$('tower-cards').append(b);}
  for(let i=0;i<12;i++){const b=button(String(i+1),()=>S.selectSite(i));b.id='site-'+i;$('sites').append(b);}
  $('start').onclick=S.startWave;$('upgrade').onclick=S.upgrade;$('sell').onclick=S.sell;$('quiz').onclick=()=>ask();$('pause').onclick=()=>{S.paused=!S.paused;refresh();};$('speed').onclick=()=>{S.speed=S.speed===1?2:1;refresh();};$('help').onclick=()=>help();$('teacher').onclick=openTeacher;$('close-teacher').onclick=closeTeacher;
  $('sound').onclick=()=>{sound=!sound;window.KDAudio?.enable(sound);$('sound').textContent='Sound: '+(sound?'on':'off');$('sound').setAttribute('aria-pressed',String(sound));tone('build');};
  $('restart').onclick=()=>{show([el('h2','Start a fresh expedition?'),el('p','This resets your towers, gold, waves, and review totals. Your current question bank and teacher settings stay available.'),button('Restart expedition',()=>{modal.close();currentQuestion=null;S.reset();},'primary wide'),button('Keep playing',close,'wide subtle')]);};
  modal.addEventListener('cancel',e=>{e.preventDefault();if(!currentQuestion&&!S.over)close();});teacher.addEventListener('cancel',e=>{e.preventDefault();closeTeacher();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&S.running){S.paused=true;refresh();}});
  $('music-toggle').onchange=e=>{window.KDAudio.music(e.target.checked);$('music-status').textContent=e.target.checked?'Background music':'Music off';};
  window.KDUI={refresh,ask,end,tone,getBank:()=>JSON.parse(JSON.stringify(bank))};
  refresh();intro();
})();
