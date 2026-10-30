(() => {
  'use strict';
  const $=id=>document.getElementById(id),S=KD,C=KDCore,modal=$('modal'),teacher=$('teacher-modal'),settings=$('settings-modal');
  let bank=KDCurriculum.collection(),bag=[],lastQuestion=-1,currentQuestion=null,locked=false,remainingFeedback=0,questionSerial=0,sound=true,editIndex=0;
  function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
  function button(text,action,cls){const b=el('button',text,cls);b.addEventListener('click',action);return b;}
  function portrait(key,frame=0,width=64,height=76){const canvas=el('canvas');canvas.width=width*2;canvas.height=height*2;canvas.className='art-portrait';canvas.setAttribute('aria-hidden','true');const asset=KD_ASSETS[key],img=new Image();img.onload=()=>{const [x,y,w,h]=asset.frames[frame],scale=Math.min(canvas.width/w,canvas.height/h);canvas.getContext('2d').drawImage(img,x,y,w,h,(canvas.width-w*scale)/2,canvas.height-h*scale,w*scale,h*scale);};img.src=asset.data;return canvas;}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function openMenu(){if(modal.open||teacher.open)return;S.blocked=true;settings.showModal();KDAudio.duck(true);}
  function closeMenu(){if(settings.open)settings.close();S.blocked=S.over||modal.open||teacher.open;KDAudio.duck(S.blocked);}
  function show(content){if(settings.open)closeMenu();$('modal-body').replaceChildren(...content);S.blocked=true;KDAudio.duck(true);if(!modal.open)modal.showModal();}
  function close(){modal.close();S.blocked=S.over||teacher.open||settings.open;KDAudio.duck(S.blocked);refresh();}
  function beginExpedition(){if(!S.begin())return;KDAudio.enable(sound);KDAudio.unlock();KDAudio.music($('music-toggle').checked);$('question-tray').hidden=false;close();renderQuestion();S.resize();}
  function tone(kind){
    if(!sound)return;
    try{KDAudio.effect(kind);}catch{sound=false;$('sound').textContent='Sound unavailable';}
  }
  function refresh(){
    $('gold').textContent=S.gold;$('hearts').textContent=S.lives;$('wave').textContent=`${S.wave} / 6`;$('accuracy').textContent=`${S.correct} / ${S.answered}`;
    $('map-title').textContent=C.maps[S.level].name;$('map-subtitle').textContent=C.maps[S.level].subtitle;$('chapter').textContent=`0${S.level+1} / ${C.maps[S.level].name.toUpperCase()}`;
    $('state-label').textContent=S.over?'REALM FINISHED':S.paused?'PAUSED':S.running?(S.fireTime>0?'DEFENSES ACTIVE':'ANSWER TO RECHARGE'):'ANSWER TO BEGIN';
    $('power-number').textContent=S.fireTime.toFixed(1)+'s';$('charge-fill').style.width=100*S.fireTime/S.maxFireTime+'%';$('charge-meter').setAttribute('aria-valuenow',S.fireTime.toFixed(1));
    $('reward-label').textContent=`Correct: +${S.powerReward}s firing +25 ◆`;$('charge-status').textContent=S.fireTime>0?'FIRING RESERVE':'TOWERS NEED KNOWLEDGE';document.body.classList.toggle('out-of-charge',S.fireTime<=0);
    $('start').hidden=S.running||S.wave===0||S.over;$('start').disabled=!S.ready;$('start').textContent=S.intermission>0?`Next wave ${Math.ceil(S.intermission)}s →`:'Send wave →';
    $('pause').textContent=S.paused?'Resume':'Pause';$('reading-pause').textContent=S.paused?'▶ Resume battle':'Ⅱ Pause & read';$('speed').textContent=`Speed: ${S.speed}×`;$('bank-count').textContent=`${bank.length} review questions`;
    const begin=$('begin-expedition');if(begin)begin.disabled=!S.ready;
    for(const type of Object.keys(C.towers)){const b=$('tower-'+type);if(b){b.classList.toggle('active',type===S.build);b.setAttribute('aria-pressed',String(type===S.build));}}
    const t=S.towers.find(t=>t.site===S.selected),st=t?C.stats(t.type,t.level):null;$('selection').hidden=!t||S.over;
    $('selected-title').textContent=t?`${st.name} · Level ${t.level}`:'Choose a tower';$('selected-info').textContent=t?`${Math.round(st.damage)} damage · ${Math.round(st.range)} range${t.level===3?' · Max level':''}`:'';
    $('upgrade').textContent=t&&t.level<3?`Upgrade · ${st.upgrade} ◆`:t?'Max level':'Upgrade';$('upgrade').disabled=!t||t.level>=3||S.gold<st.upgrade||S.over;
    $('sell').textContent=t?`Sell · ${st.sell} ◆`:'Sell';$('sell').disabled=!t||S.over;
    for(let i=0;i<12;i++){const b=$('site-'+i);if(!b)continue;const tower=S.towers.find(t=>t.site===i);b.classList.toggle('occupied',!!tower);b.classList.toggle('selected',i===S.selected);b.setAttribute('aria-label',`Site ${i+1}: ${tower?C.towers[tower.type].name:'empty; build '+C.towers[S.build].name}`);b.disabled=S.over||!S.ready;}
  }
  function renderQuestion(){
    locked=false;remainingFeedback=0;if(!bag.length){bag=shuffle([...bank.keys()]);if(bag.length>1&&bag.at(-1)===lastQuestion)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];}
    const index=bag.pop(),q=KDCurriculum.next()||bank[index];lastQuestion=index;currentQuestion=q;questionSerial++;
    const focusWasAnswer=$('live-answers').contains(document.activeElement)||document.activeElement===$('next-question');
    $('question-topic').textContent=q.standard?`Grade ${q.mathGrade} · ${q.standard} · ${q.mathLevel}`:q.topic;$('question-count').textContent='QUESTION '+questionSerial;$('question-prompt').textContent=q.prompt;const model=MathModels.render(q);$('question-model').replaceChildren(...(model?[model]:[]));
    $('answer-feedback').textContent='';$('answer-feedback').className='answer-feedback';$('next-question').hidden=true;
    const choices=$('live-answers');choices.replaceChildren();shuffle([0,1,2,3]).forEach((original,i)=>{const b=button('',()=>answer(original,b),'live-answer');b.dataset.choice=String(original);b.append(el('span',String(i+1),'answer-number'),el('span',q.choices[original],'answer-text'));choices.append(b);});
    if(focusWasAnswer)choices.firstElementChild?.focus({preventScroll:true});refresh();requestAnimationFrame(()=>S.resize());
  }
  function answer(value,chosen){
    if(locked||S.over||!S.started||S.blocked||!currentQuestion)return;
    locked=true;const q=currentQuestion,ok=value===q.answer;S.answered++;if(ok){S.correct++;S.answerReward();}
    for(const b of $('live-answers').children){b.disabled=true;if(Number(b.dataset.choice)===q.answer){b.classList.add('correct');b.firstElementChild.textContent='✓';}}
    if(!ok){chosen.classList.add('wrong');chosen.firstElementChild.textContent='×';}
    $('answer-feedback').className='answer-feedback '+(ok?'is-correct':'is-wrong');
    $('answer-feedback').textContent=(ok?`Correct! +${S.powerReward}s firing, +25 gold. `:`Correct answer: ${q.choices[q.answer]}. `)+q.explanation;
    $('next-question').hidden=false;tone(ok?'correct':'wrong');remainingFeedback=ok?S.feedbackMs:Math.min(10000,Math.max(4200,q.explanation.split(/\s+/).length*180));refresh();
  }
  let lastTick=performance.now();setInterval(()=>{const now=performance.now(),dt=Math.min(200,now-lastTick);lastTick=now;if(locked&&!S.blocked&&!S.paused&&!S.over&&!document.hidden&&S.started){remainingFeedback-=dt;if(remainingFeedback<=0)renderQuestion();}},80);
  function intro(){
    const begin=button('Begin expedition →',beginExpedition,'primary wide');begin.id='begin-expedition';begin.disabled=!S.ready;
    show([el('span','STUDY TO POWER YOUR DEFENSES','eyebrow'),portrait('castles',0,85,110),el('h2','Master the numbers. Defend the realm.'),el('p','Grade 6 math is ready to play. Teachers can choose grades 6–8, individual skills, computing, or an imported bank from Menu → Teacher tools. Questions stay at the bottom, one after another. Each correct answer adds 12 seconds of firing time and 25 gold. Towers go dormant when the reserve runs out.'),el('p','Two starter towers are ready. Your first correct answer starts the attack. Keep answering while the battle plays above. Use Pause & read whenever you need more thinking time.'),begin,button('How the defense works',()=>help(true),'wide subtle')]);
  }
  function help(fromIntro=false){const list=el('ol',undefined,'instructions');[
    'Answer the question at the bottom. A correct answer gives firing time to ALL towers and 25 gold. The next question appears automatically.',
    'The firing reserve holds up to 36 seconds. It only drains while enemies are within tower range. With no charge, towers stop shooting and enemies advance more slowly to give you time to think.',
    'Wrong answers show the correct answer and explanation, without giving firing time. Read it, then continue. Pause & read stops combat and the question countdown.',
    'Two starter towers are free in every realm. Spend gold on more towers or upgrades. Ranger fires quickly, Arcane slows enemies, and Cannon deals splash damage.',
    'Waves continue automatically. Defend six waves per realm, including a boss. Your firing reserve resets between realms, so keep studying throughout the campaign.',
    'Use 1–4 to answer. Q/W/E select towers. Space pauses. Menu contains teacher tools, difficulty, sound, and the reward-per-correct-answer setting.'
  ].forEach(text=>list.append(el('li',text)));show([el('span','THE SCHOLAR’S FIELD GUIDE','eyebrow'),el('h2','Knowledge is your ammunition.'),list,button(fromIntro?'Begin expedition →':'Return to battle →',fromIntro?beginExpedition:close,'primary wide')]);}
  function end(won){
    const final=won&&S.level===2,stats=el('div',undefined,'stat-grid');[[S.correct,'correct answers'],[S.answered,'questions answered'],[S.kills,'monsters stopped']].forEach(([value,label])=>{const d=el('div');d.append(el('strong',String(value)),el('small',label));stats.append(d);});
    show([el('span',won?'KNOWLEDGE HELD THE LINE':'RECHARGE AND TRY AGAIN','eyebrow'),el('h2',final?'The archive is safe.':won?C.maps[S.level].name+' defended.':'The archive fell.'),el('p',final?'You defended all three realms. Your correct answers powered every shot.':won?'Your answers powered every shot. Keep studying in the next realm.':'Build near the route, keep answering to refill the firing reserve, and use Pause & read when you need more time.'),stats,button(won&&!final?'Travel to next realm →':'Start a new expedition →',()=>{modal.close();if(won&&!final){S.next();renderQuestion();}else S.reset();KDAudio.duck(false);},'primary wide')]);
  }
  function openTeacher(){syncCourse();if(modal.open)return;if(settings.open)closeMenu();S.blocked=true;KDAudio.duck(true);$('frequency').value=String(S.powerReward);$('difficulty').value=S.difficulty;renderList();loadEditor(0);teacher.showModal();}
  function closeTeacher(){teacher.close();S.blocked=S.over||modal.open;KDAudio.duck(S.blocked);refresh();$('menu-open').focus();}
  function msg(t){$('teacher-message').textContent=t;}
  function renderList(){const list=$('question-list');list.replaceChildren();bank.forEach((q,i)=>{const b=button(`${i+1}. ${q.topic} · ${q.prompt.slice(0,65)}`,()=>loadEditor(i));b.classList.toggle('active',i===editIndex);list.append(b);});refresh();}
  function loadEditor(i){editIndex=i;$('edit-index').value=i;const q=bank[i]||{topic:'Computer science',prompt:'',choices:['','','',''],answer:0,explanation:''};$('edit-topic').value=q.topic;$('edit-prompt').value=q.prompt;$('edit-answer').value=q.answer;$('edit-explanation').value=q.explanation;const target=$('choice-editor');target.replaceChildren();q.choices.forEach((choice,j)=>{const label=el('label',`Choice ${'ABCD'[j]}`),input=el('input');input.id='edit-choice-'+j;input.value=choice;input.required=true;input.maxLength=500;label.append(input);target.append(label);});$('delete-question').disabled=i>=bank.length||bank.length<=1;[...$('question-list').children].forEach((b,j)=>b.classList.toggle('active',j===i));}
  function download(name,text,type){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('editor').addEventListener('submit',e=>{e.preventDefault();try{const q=QuestionBank.validate([{...(bank[editIndex]||{}),topic:$('edit-topic').value,prompt:$('edit-prompt').value,choices:[0,1,2,3].map(i=>$('edit-choice-'+i).value),answer:Number($('edit-answer').value),explanation:$('edit-explanation').value}])[0];if(editIndex>=bank.length&&bank.length>=500)throw Error('A bank can contain up to 500 questions.');bank[editIndex]=q;KDCurriculum.set({...KDCurriculum.config,source:'custom'});syncCourse();bag=[];renderQuestion();renderList();loadEditor(editIndex);msg('Question applied to this session. Export to keep your changes.');}catch(e){msg(e.message);}});
  $('delete-question').onclick=()=>{if(bank.length<=1)return;bank.splice(editIndex,1);KDCurriculum.set({...KDCurriculum.config,source:'custom'});syncCourse();bag=[];renderQuestion();editIndex=Math.min(editIndex,bank.length-1);renderList();loadEditor(editIndex);msg('Question deleted. Export to keep this bank.');};
  $('add-question').onclick=()=>{loadEditor(bank.length);msg('Fill in all fields, then apply the new question.');$('edit-prompt').focus();};
  $('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2000000)throw Error('Files must be smaller than 2 MB.');const text=await file.text(),next=QuestionBank.parse(text,file.name);let settings=null;if(!/\.csv$/i.test(file.name)){settings=JSON.parse(text).settings;if(settings){if(settings.powerReward!==undefined&&![8,12,16,20].includes(Number(settings.powerReward)))throw Error('Firing reward must be 8, 12, 16, or 20 seconds.');if(settings.difficulty&&!['relaxed','standard','expert'].includes(settings.difficulty))throw Error('Invalid challenge setting.');if(settings.curriculum){const c=settings.curriculum;if(!['math','math-bank','forest','cs','custom'].includes(c.source)||![6,7,8].includes(Number(c.grade))||!['support','practice','challenge'].includes(c.level)||(c.skill&&!KDCurriculum.codes({...c,skill:''}).includes(c.skill)))throw Error('Invalid curriculum settings.');}}}bank=next;KDCurriculum.set(settings?.curriculum||{...KDCurriculum.config,source:'custom'});syncCourse();bag=[];if(settings){S.powerReward=Number(settings.powerReward||12);S.difficulty=settings.difficulty||S.difficulty;$('frequency').value=String(S.powerReward);$('difficulty').value=S.difficulty;}renderQuestion();editIndex=0;renderList();loadEditor(0);msg(`Imported ${bank.length} questions. Continuous review is active.`);}catch(err){msg('Import failed: '+err.message+' Your current bank is unchanged.');}e.target.value='';};
  $('export-json').onclick=()=>download('knowledge-defense-questions.json',JSON.stringify({version:1,questions:bank},null,2),'application/json');
  $('export-csv').onclick=()=>download('knowledge-defense-questions.csv',QuestionBank.toCSV(bank),'text/csv;charset=utf-8');
  $('export-pack').onclick=()=>download('knowledge-defense-classroom.json',JSON.stringify({version:2,settings:{powerReward:S.powerReward,difficulty:S.difficulty,curriculum:KDCurriculum.config},questions:bank},null,2),'application/json');
  $('frequency').onchange=e=>{S.powerReward=Number(e.target.value);msg('Firing-time reward updated. Export a classroom pack to keep it.');refresh();};$('difficulty').onchange=e=>{S.difficulty=e.target.value;msg('Challenge updated starting with the next wave.');};
  function skillOptions(selected=''){const grade=Number($('course-grade').value),list=$('course-skill');list.replaceChildren(new Option('All skills · mixed review',''));for(const code of KDCurriculum.codes({grade,skill:''}))list.add(new Option(code+' · '+MiddleSchoolMath.plans[code].label,code));list.value=selected;}
  function syncCourse(){const c=KDCurriculum.config;$('course-source').value=c.source;$('course-grade').value=c.grade;$('course-level').value=c.level;skillOptions(c.skill);}
  function selectedCourse(){return {source:$('course-source').value,grade:Number($('course-grade').value),level:$('course-level').value,skill:$('course-skill').value};}
  $('course-grade').onchange=()=>skillOptions();
  $('apply-course').onclick=()=>{try{const next=KDCurriculum.set(selectedCourse());if(next)bank=next;bag=[];renderQuestion();renderList();loadEditor(0);msg(`Collection ready: ${bank.length} editable questions${KDCurriculum.config.source==='math'?' plus fresh generated problems':''}.`);}catch(e){msg(e.message);}};
  $('generate-bank').onclick=()=>{try{const c=selectedCourse();KDCurriculum.set({...c,source:'math'});bank=KDCurriculum.generate(30);KDCurriculum.set({...c,source:'custom'});syncCourse();bag=[];renderQuestion();renderList();loadEditor(0);msg('30 fresh math problems are ready to edit and export. JSON keeps graphs, tables, and skill labels.');}catch(e){msg(e.message);}};
  syncCourse();
  for(const [type,t]of Object.entries(C.towers)){const b=button('',()=>S.choose(type),'tower-card');b.id='tower-'+type;b.title=t.name+' · '+t.detail+' · '+t.cost+' gold';b.setAttribute('aria-label',b.title);const info=el('span');info.append(el('b',{archer:'Ranger',mage:'Arcane',cannon:'Cannon'}[type]));b.append(portrait({archer:'ranger',mage:'mage',cannon:'cannon'}[type]),info,el('span',t.cost+' ◆','cost'));$('tower-cards').append(b);}
  for(let i=0;i<12;i++){const b=button(String(i+1),()=>S.selectSite(i));b.id='site-'+i;$('sites').append(b);}
  $('start').onclick=S.startWave;$('upgrade').onclick=S.upgrade;$('sell').onclick=S.sell;
  function pause(){S.paused=!S.paused;refresh();}$('pause').onclick=pause;$('reading-pause').onclick=pause;
  $('next-question').onclick=()=>{if(locked)renderQuestion();};
  $('speed').onclick=()=>{S.speed=S.speed===1?2:1;refresh();};$('help').onclick=()=>help();$('teacher').onclick=openTeacher;$('close-teacher').onclick=closeTeacher;
  $('sound').onclick=()=>{sound=!sound;KDAudio.enable(sound);$('sound').textContent='Sound: '+(sound?'on':'off');$('sound').setAttribute('aria-pressed',String(sound));tone('build');};
  $('restart').onclick=()=>show([el('h2','Start a fresh expedition?'),el('p','Progress resets. Your teacher question bank and reward settings remain in this tab.'),button('Restart expedition',()=>{modal.close();S.reset();KDAudio.duck(false);},'primary wide'),button('Keep playing',close,'wide subtle')]);
  $('menu-open').onclick=openMenu;$('menu-close').onclick=closeMenu;settings.addEventListener('cancel',e=>{e.preventDefault();closeMenu();});
  modal.addEventListener('cancel',e=>{e.preventDefault();if(!S.over&&S.started)close();});teacher.addEventListener('cancel',e=>{e.preventDefault();closeTeacher();});
  $('selection-close').onclick=()=>{S.selected=-1;S.redraw();refresh();};
  function sitesOpen(open){$('sites-panel').hidden=!open;$('sites-toggle').setAttribute('aria-expanded',String(open));}
  $('sites-toggle').onclick=()=>sitesOpen($('sites-panel').hidden);$('sites-close').onclick=()=>sitesOpen(false);
  $('audio-volume').oninput=e=>KDAudio.setVolume(e.target.value);$('music-toggle').onchange=e=>{KDAudio.music(e.target.checked);$('music-status').textContent=e.target.checked?'On':'Off';};
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('fullscreen').textContent='Use browser fullscreen';}};
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&S.started){S.paused=true;refresh();}});
  document.addEventListener('keydown',e=>{
    if(modal.open||teacher.open||settings.open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
    if(e.key==='Escape'){sitesOpen(false);S.selected=-1;S.redraw();refresh();}
    if(e.repeat)return;
    if(['1','2','3','4'].includes(e.key)){e.preventDefault();$('live-answers').children[Number(e.key)-1]?.click();}
    if(['q','w','e'].includes(e.key.toLowerCase()))S.choose(['archer','mage','cannon'][['q','w','e'].indexOf(e.key.toLowerCase())]);
    if(e.code==='Space'&&!/BUTTON/.test(e.target.tagName)){e.preventDefault();pause();}
  });
  let hintTimer;const hintChanged=()=>{$('hint-toast').classList.remove('faded');clearTimeout(hintTimer);hintTimer=setTimeout(()=>$('hint-toast').classList.add('faded'),3500);};new MutationObserver(hintChanged).observe($('hint'),{childList:true,characterData:true,subtree:true});hintChanged();
  new ResizeObserver(()=>{document.body.style.setProperty('--question-height',$('question-tray').getBoundingClientRect().height+'px');S.resize();}).observe($('question-tray'));
  window.KDUI={refresh,end,tone,getBank:()=>JSON.parse(JSON.stringify(bank)),getCurrentQuestion:()=>JSON.parse(JSON.stringify(currentQuestion)),resetQuestions(){bag=[];lastQuestion=-1;renderQuestion();}};
  refresh();intro();
})();
