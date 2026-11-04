let testConfig=Lens.settings({comments:true,cloudConsent:true});let changed;
globalThis.chrome={runtime:{sendMessage:async m=>{
 if(m.type==='analyze'){(globalThis.analysisRequests??=[]).push(m.post.text);}
 if(m.type==='analyze' && m.post.text==='Unavailable provider')return {ok:false,error:'Mock provider unavailable. No fallback classification.'};
 if(m.type==='analyze'){
  const category=m.post.text==='Custom category post'&&testConfig.taxonomy.some(n=>n.id.startsWith('custom_'))?testConfig.taxonomy.find(n=>n.id.startsWith('custom_')).id:m.post.sponsored?'sponsored':m.post.text==='We are hiring. Apply now.'?'hiring':m.post.video?'worthwhile':'jargon';
  const scenarios={'Hierarchy broad':{technology:0.5},'Hierarchy subcategory':{technology:0.85,ai:0.8},'Hierarchy detail':{technology:0.98,ai:0.99,ai_agents:0.97}};
  scenarios['Advertising sample']={news:1,product_launches:1,promotion:1,sales:0.99,personal:1,achievement:0.98,sponsored:0.95};
  scenarios['Promotion sample']={...scenarios['Advertising sample'],sponsored:0.1};
  scenarios['Hidden fourth match']={news:1,product_launches:1,technology:0.97,ai:0.98,personal:1,achievement:0.99,content_style:0.95,jargon:0.8};
  const values=scenarios[m.post.text];
  const answers=Object.fromEntries(Lens.activeIds(testConfig).map(id=>[id,{type:'noul',noul:values?(values[id]??0.1):(Lens.categoryPath(category,testConfig).includes(id)?0.95:0.1)}]));
  return {ok:true,value:Lens.validateResult(answers,false,testConfig)};
 }
 if(m.type==='settings')return {ok:true,value:testConfig};
 if(m.type==='draft'){globalThis.lastDraftRequest=m;return {ok:true,value:'Which trade-off proved hardest to manage in practice?'};}
 if(m.type==='status')return {ok:true,value:{settings:testConfig,count:0,hasKey:false}};
 if(m.type==='save'){testConfig=Lens.settings(m.settings);return {ok:true,value:testConfig};}
 return {ok:false,error:'Mock service: no live API requests.'};
}},storage:{onChanged:{addListener:fn=>changed=fn}}};
globalThis.changeTestSettings=values=>{const raw={...testConfig,...values};if(Object.hasOwn(values,'custom'))delete raw.taxonomy;testConfig=Lens.settings(raw);changed({settings:{newValue:testConfig}},'local');};
