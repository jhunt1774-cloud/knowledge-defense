/* Run against node serve.cjs. Set KD_BROWSER to a Chrome executable if needed. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const server=process.env.KD_START_SERVER?require('../serve.cjs'):null;
 const chrome=process.env.KD_BROWSER||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
 const browser=await chromium.launch({headless:true,...(fs.existsSync(chrome)?{executablePath:chrome}:{})});
 const page=await browser.newPage({viewport:{width:1366,height:900}}),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8080')&&!r.url().startsWith('file:')&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
 try{
 await page.goto('http://127.0.0.1:8080');await page.waitForFunction(()=>window.KD?.ready);
 await page.getByRole('button',{name:'Begin expedition →',exact:true}).click();
 assert.equal(await page.evaluate(()=>Phaser.VERSION),'3.90.0');
 await page.locator('#sound').click();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
 await page.locator('#site-0').focus();await page.keyboard.press('Enter');await page.locator('#site-1').click();assert.equal(await page.evaluate(()=>KD.towers.length),2);assert.equal(await page.evaluate(()=>KD.gold),40);
 // Correct answer, wrong answer, feedback and paused battle.
 async function answerRendered(correct=true,wave=false){const gold=await page.evaluate(()=>KD.gold);assert.equal(await page.evaluate(()=>KD.blocked),true);const prompt=await page.locator('.question-prompt').textContent();const choice=await page.evaluate(({prompt,correct})=>{const q=KDUI.getBank().find(q=>q.prompt===prompt);return correct?q.answer:(q.answer+1)%4;},{prompt,correct});await page.locator(`.answer[data-choice="${choice}"]`).click();assert.equal(await page.evaluate(()=>KD.gold),gold+(correct?60:15));await page.getByRole('button',{name:wave?'Continue to wave →':'Return to the battlefield →',exact:true}).click();}
 async function answer(correct=true){await page.locator('#quiz').click();await answerRendered(correct);}
 await answer(true);await answer(false);assert.equal(await page.evaluate(()=>KD.answered),2);
 await page.locator('#site-0').click();await page.locator('#upgrade').click();assert.equal(await page.evaluate(()=>KD.towers[0].level),2);await page.locator('#sell').click();assert.equal(await page.evaluate(()=>KD.towers.length),1);
 await page.locator('#tower-cannon').click();const canvas=await page.locator('#game canvas').boundingBox();await page.mouse.click(canvas.x+560/900*canvas.width,canvas.y+350/600*canvas.height);assert.equal(await page.evaluate(()=>KD.towers.find(t=>t.site===6)?.type),'cannon');
 await page.locator('#teacher').click();await page.locator('#frequency').selectOption('manual');await page.locator('#difficulty').selectOption('relaxed');
 await page.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('[{"prompt":"bad"}]')});await page.waitForFunction(()=>document.getElementById('teacher-message').textContent.includes('Import failed'));assert.equal(await page.evaluate(()=>KDUI.getBank().length),32);
 await page.locator('#import').setInputFiles(path.join(__dirname,'../data/sample-bank.csv'));await page.waitForFunction(()=>document.getElementById('teacher-message').textContent.includes('Imported 32'));
 await page.locator('#edit-topic').fill('Edited topic');await page.getByRole('button',{name:'Apply question',exact:true}).click();assert.equal(await page.evaluate(()=>KDUI.getBank()[0].topic),'Edited topic');
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#export-pack').click()]);const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(exported.questions.length,32);assert.equal(exported.settings.frequency,'manual');
 await page.locator('#import').setInputFiles({name:'classroom.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await page.waitForFunction(()=>document.getElementById('teacher-message').textContent.includes('classroom settings'));
 await page.locator('#add-question').click();await page.locator('#edit-topic').fill('Testing');await page.locator('#edit-prompt').fill('Which number is two?');for(let i=0;i<4;i++)await page.locator('#edit-choice-'+i).fill(String(i+1));await page.locator('#edit-answer').selectOption('1');await page.locator('#edit-explanation').fill('Two is the second positive integer.');await page.getByRole('button',{name:'Apply question',exact:true}).click();assert.equal(await page.evaluate(()=>KDUI.getBank().length),33);await page.locator('#delete-question').click();assert.equal(await page.evaluate(()=>KDUI.getBank().length),32);
 await page.locator('#close-teacher').click();await page.locator('#start').click();await page.waitForFunction(()=>KD.enemies.length>0);
 await page.locator('#pause').click();const distance=await page.evaluate(()=>KD.enemies[0].distance);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>KD.enemies[0].distance),distance);await page.locator('#pause').click();
 // Step the actual Phaser scene update to test wave resolution without a long wait.
 const first=await page.evaluate(()=>{const scene=KD.game.scene.getScene('Battle');let ticks=0;while(KD.running&&!KD.over&&ticks++<12000)scene.update(0,80);return {wave:KD.wave,running:KD.running,lives:KD.lives,kills:KD.kills};});assert.equal(first.running,false);assert.ok(first.kills>0);assert.ok(first.lives>0);
 // Loss branch: remove defenses and let a wave reach the castle.
 await page.evaluate(()=>{KD.towers.forEach(t=>t.sprite.destroy());KD.towers=[];KD.lives=1;KD.startWave();const scene=KD.game.scene.getScene('Battle');let n=0;while(!KD.over&&n++<12000)scene.update(0,80);});await page.getByRole('heading',{name:'The castle has fallen.'}).waitFor();
 await page.getByRole('button',{name:'Play a new expedition →'}).click();
 // Before-wave and timed prompts hold the simulation until answered.
 await page.locator('#teacher').click();await page.locator('#frequency').selectOption('wave');await page.locator('#close-teacher').click();await page.locator('#start').click();assert.equal(await page.evaluate(()=>KD.wave),0);await answerRendered(true,true);assert.equal(await page.evaluate(()=>KD.wave),1);
 await page.locator('#teacher').click();await page.locator('#frequency').selectOption('15');await page.locator('#close-teacher').click();await page.evaluate(()=>{KD.questionClock=14.99;KD.game.scene.getScene('Battle').update(0,80);});await page.locator('.question-prompt').waitFor();assert.equal(await page.evaluate(()=>KD.blocked),true);await answerRendered(true);await page.evaluate(()=>KD.reset());
 await page.locator('#teacher').click();await page.locator('#frequency').selectOption('manual');await page.locator('#close-teacher').click();
 // Campaign soak: max-level mixed defenses, then every wave across all three maps.
 const results=[];
 for(let realm=0;realm<3;realm++){
 await page.evaluate(()=>{KD.gold=100000;for(let i=0;i<12;i++){KD.choose(['archer','mage','cannon'][i%3]);KD.selectSite(i);KD.upgrade();KD.upgrade();}KDUI.refresh();});
 for(let wave=1;wave<=6;wave++){
 await page.locator('#start').click();const result=await page.evaluate(()=>{const scene=KD.game.scene.getScene('Battle');let n=0;while(KD.running&&!KD.over&&n++<20000)scene.update(0,80);return {level:KD.level,wave:KD.wave,lives:KD.lives,kills:KD.kills,remaining:KD.enemies.length,pending:KD.pending};});results.push(result);assert.equal(result.remaining,0);assert.equal(result.pending,0);assert.ok(result.lives>0);
 }
 if(realm<2)await page.getByRole('button',{name:'Travel to next realm →'}).click();
 }
 await page.getByRole('heading',{name:'A kingdom of knowledge.'}).waitFor();
 console.log('Max-defense campaign passed: '+results.length+' waves.');
 await page.getByRole('button',{name:'Play a new expedition →'}).click();
 await page.locator('#teacher').click();await page.locator('#difficulty').selectOption('standard');await page.locator('#close-teacher').click();
 // A resource-constrained playthrough: two correct review questions per wave,
 // no injected gold, ordinary kill/wave rewards, and a fixed building strategy.
 const balanced=[];
 for(let realm=0;realm<3;realm++){
 for(let wave=1;wave<=6;wave++){
 await answer(true);await answer(true);
 await page.evaluate(()=>{const order=[1,3,6,9,5,8,0,7,4,10,11,2];for(const i of order){if(KD.towers.some(t=>t.site===i))continue;const type=i===3||i===8?'mage':i===6||i===9?'cannon':'archer';if(KD.gold>=KDCore.towers[type].cost){KD.choose(type);KD.selectSite(i);}}for(const i of order){const t=KD.towers.find(t=>t.site===i);if(t){KD.selected=i;while(t.level<3&&KD.gold>=KDCore.stats(t.type,t.level).upgrade)KD.upgrade();}}KDUI.refresh();});
 await page.locator('#start').click();const result=await page.evaluate(()=>{const scene=KD.game.scene.getScene('Battle');let n=0;while(KD.running&&!KD.over&&n++<20000)scene.update(0,80);return {level:KD.level,wave:KD.wave,lives:KD.lives,gold:KD.gold,kills:KD.kills};});balanced.push(result);assert.ok(result.lives>0,'Resource-constrained campaign should survive');
 }
 if(realm<2)await page.getByRole('button',{name:'Travel to next realm →'}).click();
 }
 await page.getByRole('heading',{name:'A kingdom of knowledge.'}).waitFor();
 await page.getByRole('button',{name:'Play a new expedition →'}).click();await page.locator('#site-0').click();await page.locator('#tower-mage').click();
 const shot=process.env.KD_SCREENSHOT;if(shot)await page.screenshot({path:shot,fullPage:true});
 for(const width of [768,390]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('#teacher').click();assert.ok(await page.locator('#teacher-modal').isVisible());await page.locator('#close-teacher').click();if(shot&&width===390)await page.screenshot({path:shot.replace('.png','-mobile.png'),fullPage:true});}
 await page.goto('file:///'+path.resolve(__dirname,'../index.html').replace(/\\/g,'/'));await page.waitForFunction(()=>KD.ready);await page.getByRole('button',{name:'Begin expedition →',exact:true}).click();await page.locator('#site-0').click();assert.equal(await page.evaluate(()=>KD.towers.length),1);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log(JSON.stringify({result:'PASS',browser:await browser.version(),checks:['bundled Phaser','build/upgrade/sell','correct and incorrect rewards','invalid import preserves bank','CSV and classroom import','teacher editing/add/delete','classroom export','before-wave and timed questions','pause','actual wave combat','loss and restart','18-wave max-defense combat soak','18-wave standard resource-constrained campaign, two correct answers per wave','768px and 390px layouts','file:// offline launch','no external runtime requests','no uncaught browser errors'],campaign:results,balancedCampaign:balanced},null,2));
 }finally{await browser.close();server?.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
