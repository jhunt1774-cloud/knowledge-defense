/* Shared bank format. No network, accounts, storage, or third-party imports. */
(function(root){
  'use strict';
  const columns=['topic','prompt','a','b','c','d','answer','explanation'];
  function validate(input){
    const raw=Array.isArray(input)?input:input?.questions;
    if(!Array.isArray(raw)||!raw.length)throw Error('Include at least one question in an array or a questions property.');
    if(raw.length>500)throw Error('A bank can contain up to 500 questions.');
    return raw.map((q,i)=>{
      const fail=m=>{throw Error(`Question ${i+1}: ${m}`);};
      if(!q||typeof q!=='object')fail('must be an object.');
      const str=(v,name,max)=>{if(typeof v!=='string'||!v.trim()||v.length>max)fail(`${name} must be text (1–${max} characters).`);return v.trim();};
      q={...q,choices:q.choices??q.answers};
      if(!Array.isArray(q.choices)||q.choices.length!==4)fail('provide exactly four choices.');
      q={...q,prompt:q.prompt??q.text,choices:q.choices??q.answers,answer:q.answer??q.correct};
      const choices=q.choices.map(v=>str(v,'choice',500));
      if(new Set(choices).size!==4)fail('choices must be different.');
      if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)fail('answer must be an integer 0, 1, 2, or 3.');
      const metadata={};for(const key of ['standard','mathGrade','mathLevel','mathFormat','generatorVersion','origin','subject','source','standardMeta','mathModel','visual','mathConcept'])if(q[key]!==undefined)metadata[key]=JSON.parse(JSON.stringify(q[key]));
      return {...metadata,topic:str(q.topic||'Math','topic',100),prompt:str(q.prompt,'prompt',2000),choices,answer:q.answer,explanation:str(q.explanation,'explanation',2000)};
    });
  }
  function parseCSV(text){
    text=text.replace(/^\uFEFF/,'');let rows=[],row=[],value='',quoted=false,closed=false;
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(quoted){if(c==='"'){if(text[i+1]==='"'){value+='"';i++;}else{quoted=false;closed=true;}}else value+=c;}
      else if(c==='"'){if(value||closed)throw Error('Unexpected quote in CSV. Quote the entire field.');quoted=true;}
      else if(c===','||c==='\n'||c==='\r'){row.push(value);value='';closed=false;if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(x=>x.trim()))rows.push(row);row=[];}}
      else {if(closed)throw Error('Unexpected text after a quoted CSV field.');value+=c;}
    }
    if(quoted)throw Error('CSV has an unclosed quoted field.');
    row.push(value);if(row.some(x=>x.trim()))rows.push(row);
    if(!rows.length)throw Error('CSV is empty.');
    const header=rows.shift().map(s=>s.trim().toLowerCase());
    if(columns.some(c=>!header.includes(c)))throw Error('CSV headers must include: '+columns.join(','));
    return validate(rows.map((r,i)=>{if(r.length!==header.length)throw Error(`CSV row ${i+2} has the wrong number of fields.`);const q=Object.fromEntries(header.map((h,j)=>[h,r[j]]));const a=q.answer.trim().toUpperCase();if(!/^[ABCD]$/.test(a))throw Error(`CSV row ${i+2}: answer must be A, B, C, or D.`);let metadata={};if(q.metadata){try{metadata=JSON.parse(q.metadata);}catch{throw Error(`CSV row ${i+2}: invalid metadata JSON.`);}if(!metadata||typeof metadata!=='object'||Array.isArray(metadata))throw Error('CSV metadata must be an object.');}return {...metadata,topic:q.topic,prompt:q.prompt,choices:[q.a,q.b,q.c,q.d],answer:'ABCD'.indexOf(a),explanation:q.explanation};}));
  }
  function toCSV(bank){const quote=s=>'"'+String(s).replace(/"/g,'""')+'"';return [...columns,'metadata'].join(',')+'\r\n'+validate(bank).map(q=>{const {topic,prompt,choices,answer,explanation,...metadata}=q;return [topic,prompt,...choices,'ABCD'[answer],explanation,JSON.stringify(metadata)].map(quote).join(',');}).join('\r\n');}
  const api={validate,parseCSV,toCSV,parse(text,filename){if(text.length>2000000)throw Error('Files must be smaller than 2 MB.');return /\.csv$/i.test(filename)?parseCSV(text):validate(JSON.parse(text));}};
  root.QuestionBank=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
