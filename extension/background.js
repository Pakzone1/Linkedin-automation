importScripts('core.js');
const ready = (async()=>{
  await Promise.all([chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'}),chrome.storage.session.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'})]);
  const saved=await chrome.storage.local.get('apiKey'),previous=await chrome.storage.session.get('apiKey');
  if(!saved.apiKey&&previous.apiKey)await chrome.storage.local.set({apiKey:previous.apiKey});
  await chrome.storage.session.remove(['apiKey']);
})();
let queue = Promise.resolve();
function trusted(sender) { return sender.id === chrome.runtime.id && !sender.tab && sender.url === chrome.runtime.getURL('popup.html'); }
function postPage(sender) { try { const u=new URL(sender.url); return sender.id===chrome.runtime.id && sender.frameId===0 && !!sender.tab && u.origin==='https://www.linkedin.com' && Lens.isSupportedPath(u.pathname); } catch { return false; } }
async function config() { return Lens.settings((await chrome.storage.local.get('settings')).settings); }
async function draft(input,tone,instructions){
  const p=Lens.post(input),s=await config();
  if(!s.enabled || !s.comments)throw Error('Enable AI comment drafts and add a key in LinkedIn Lens settings.');
  if(!s.cloudConsent)throw Error('Review and accept cloud AI processing in LinkedIn Lens settings.');
  if(!p.text)throw Error('No readable post text. A relevant draft cannot be generated.');
  const body=JSON.stringify(Lens.commentPayload(p,s.commentModel,tone,instructions));
  const {apiKey}=await chrome.storage.local.get('apiKey');const {count=0}=await chrome.storage.session.get('count');
  if(!apiKey)throw Error('Add your OpenRouter key in LinkedIn Lens settings.');
  if(count>=s.limit)throw Error('AI request limit reached. Increase or reset it in settings.');
  await chrome.storage.session.set({count:count+1});
  const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},credentials:'omit',signal:AbortSignal.timeout(25000),body});
  if(!r.ok)throw Error(`OpenRouter error ${r.status}. Check your key, credits and model in settings.`);
  const data=await r.json();return Lens.completeDraft(data.choices?.[0]);
}
async function loadImage(url){
  Lens.post({text:'',imageUrl:url});
  const r=await fetch(url,{credentials:'omit',redirect:'error',signal:AbortSignal.timeout(12000)});
  if(!r.ok || !r.body)throw Error('Image unavailable.');
  const mime=(r.headers.get('content-type')||'').split(';')[0].trim();
  if(!['image/jpeg','image/png','image/webp','image/gif'].includes(mime))throw Error('Unsupported image format.');
  const reader=r.body.getReader(),chunks=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>6000000)throw Error('Image too large.');chunks.push(value);}}
  catch(e){await reader.cancel();throw e;}
  if(!size)throw Error('Empty image.');
  let binary='';for(const bytes of chunks)for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));
  return 'data:'+mime+';base64,'+btoa(binary);
}
async function classify(input) {
  const p=Lens.post(input), s=await config();
  if (!s.enabled) throw Error('LinkedIn Lens is paused.');
  if (!s.cloudConsent) throw Error('Review and accept cloud AI processing in LinkedIn Lens settings.');
  const key=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([4,Lens.MODEL,Lens.classificationVersion(s),p])))),x=>x.toString(16).padStart(2,'0')).join('');
  const {apiKey}=await chrome.storage.local.get('apiKey');const {count=0,cache={}}=await chrome.storage.session.get(['count','cache']);
  if (cache[key]) return cache[key];
  if (!apiKey) throw Error('Add your OpenRouter key in LinkedIn Lens settings.');
  if (count>=s.limit) throw Error('AI request limit reached. The post remains unclassified.');
  if(p.text&&!Lens.activeIds(s).length)return Lens.validateResult({},false,s);
  let image;
  if(!p.text){
    if(!p.imageUrl)return Lens.unreadable('No readable text or attached image.');
    try{image=await loadImage(p.imageUrl);}catch{return Lens.unreadable('No readable text; the attached image could not be loaded.');}
  }
  await chrome.storage.session.set({count:count+1});
  const response=await fetch('https://openrouter.ai/api/alpha/decisions',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},credentials:'omit',signal:AbortSignal.timeout(25000),body:JSON.stringify(Lens.payload(p,image,s))});
  if (!response.ok) throw Error(({401:'OpenRouter key rejected.',402:'OpenRouter credits exhausted.',429:'OpenRouter rate limit reached.'})[response.status] || `OpenRouter error ${response.status}.`);
  let result;
  try { result=Lens.validateResult((await response.json()).answers,!!image,s); } catch { throw Error('AI response could not be validated. No fallback classification was applied.'); }
  cache[key]=result;
  while (Object.keys(cache).length>300) delete cache[Object.keys(cache)[0]];
  await chrome.storage.session.set({cache}); return result;
}
async function handle(m,sender) {
  await ready;
  if (!trusted(sender) && !postPage(sender)) throw Error('Unsupported sender.');
  if (m?.type==='settings') return config();
  if (m?.type==='analyze' && postPage(sender)) return classify(m.post);
  if (m?.type==='draft' && postPage(sender)) return draft(m.post,m.tone,m.instructions);
  if (!trusted(sender)) throw Error('Settings changes require the extension popup.');
  if (m?.type==='status') { const {apiKey}=await chrome.storage.local.get('apiKey');const {count=0}=await chrome.storage.session.get('count'); return {settings:await config(),hasKey:!!apiKey,count}; }
  if (m?.type==='save') {
    if (typeof m.settings?.commentModel==='string' && m.settings.commentModel.includes('decider')) throw Error('Decider cannot write comments. Choose a generative comment model.');
    const next=Lens.settings(m.settings);
    if ((next.enabled || next.comments) && !next.cloudConsent) throw Error('Review and accept cloud AI processing before enabling Lens.');
    if (m.apiKey && (typeof m.apiKey!=='string' || !/^sk-or-[\w-]{10,200}$/.test(m.apiKey))) throw Error('Enter a valid OpenRouter key.');
    if (m.apiKey) await chrome.storage.local.set({apiKey:m.apiKey});
    if ((next.enabled || next.comments) && !(await chrome.storage.local.get('apiKey')).apiKey) throw Error('Add an OpenRouter key before enabling AI.');
    await chrome.storage.local.set({settings:next}); return next;
  }
  if (m?.type==='forget') { await chrome.storage.local.remove(['apiKey']); await chrome.storage.session.remove(['apiKey','cache']); await chrome.storage.local.set({settings:{...await config(),enabled:false,comments:false}}); return true; }
  if (m?.type==='reset') { await chrome.storage.session.set({count:0}); return true; }
  throw Error('Unknown action.');
}
chrome.runtime.onMessage.addListener((m,sender,reply)=>{
  // Read-only settings must not wait behind a slow provider; AI budgets and writes stay serialized.
  const readOnly=m?.type==='settings'||m?.type==='status';
  const task=readOnly?handle(m,sender):queue.then(()=>handle(m,sender));if(!readOnly)queue=task.catch(()=>{});
  task.then(value=>reply({ok:true,value}),error=>reply({ok:false,error:error.name==='TimeoutError'?'AI timed out. No fallback classification was applied.':error.message})); return true;
});
