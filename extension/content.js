(() => {
  'use strict';
  const POST='[role="listitem"][componentkey^="update-card-focus"],.feed-shared-update-v2[data-urn],.occludable-update[data-id]';
  const TEXT='[data-testid="expandable-text-box"],.update-components-text,.feed-shared-update-v2__description';
  const states=new Map();
  let config=Lens.settings(),timer,active=true,analyzing=0,lastPath=location.pathname;
  let categories,categoryOptions,classifierVersion;
  function configure(next){config=next;categories=Lens.categoryMap(config);categoryOptions=Object.keys(categories).map(id=>[id,Lens.labelName({category:id},config)]);classifierVersion=Lens.classificationVersion(config);}
  configure(config);
  const isPostPage=()=>Lens.isSupportedPath(location.pathname);
  async function message(m) { const r=await chrome.runtime.sendMessage(m); if(!r?.ok) throw Error(r?.error||'Extension unavailable. Refresh LinkedIn.'); return r.value; }
  function extract(el) {
    const body=[...el.querySelectorAll(TEXT)].find(n=>!n.closest('[componentkey^="replaceableComment"],.comments-comment-item')), clone=body?.cloneNode(true);
    clone?.querySelectorAll('button,[aria-hidden="true"]').forEach(n=>n.remove());
    clone?.querySelectorAll('br').forEach(n=>n.replaceWith('\n'));
    const text=(clone?.textContent||'').replace(/(?:…|\.\.\.)\s*more\s*$/i,'').trim().slice(0,8000);
    // shortcut: English platform disclosure labels; add localized labels with observed fixtures.
    const sponsored=[...el.querySelectorAll('span,p')].some(n=>!n.closest('.ll-controls') && !body?.contains(n) && !n.closest('[componentkey^="replaceableComment"],[class*="comments-"]') && /^(promoted|sponsored|paid partnership)$/i.test(n.textContent.trim()));
    const img=[...el.querySelectorAll('img')].find(i=>!i.closest('[componentkey^="replaceableComment"],.comments-comment-item') && (/feedshare|article-cover/.test(i.currentSrc||i.src)||i.alt==='View image') && /^https:\/\/media\.licdn\.com\/dms\/image\//.test(i.currentSrc||i.src));
    let notPostReason='';
    // shortcut: observed English module titles; add localized fixtures when supporting more languages.
    if(!body&&!el.querySelector('button[aria-label^="Open control menu for post"],button[aria-label^="Hide post by"],.social-details-social-actions')){
      const titles=[...el.querySelectorAll('p,h2,h3')].map(n=>n.textContent.trim());
      if(el.querySelector('a[href*="/jobs/"]')&&(el.querySelector('[data-testid="carousel"]')||titles.some(t=>/^jobs recommended for you$/i.test(t))))notPostReason='LinkedIn job recommendations, rather than an authored feed post.';
      else if(titles.some(t=>/^your offers are waiting$/i.test(t))&&el.querySelector('a[href^="https://business.linkedin.com/"]'))notPostReason='LinkedIn offers module, rather than an authored feed post.';
    }
    return {text,sponsored,imageUrl:text?'':(img?.currentSrc||img?.src||''),video:!!el.querySelector('video,[data-testid*="video"],.update-components-linkedin-video'),notPostReason};
  }
  function maskChildren(el,s,masked){
    s.maskedNodes??=new Map();
    for(const [node,inert]of s.maskedNodes){if(!masked||!node.isConnected||node.parentElement!==el){node.inert=inert;s.maskedNodes.delete(node);}}
    if(masked)for(const node of el.children){if(node!==s.host&&!s.maskedNodes.has(node)){s.maskedNodes.set(node,node.inert);node.inert=true;}}
  }
  function cleanup(el,s) { maskChildren(el,s,false);s.host.remove(); s.assistant?.remove(); s.assistantPanel?.remove(); el.classList.remove('ll-post','ll-masked'); el.style.removeProperty('--ll-color'); }
  function commentAssistant(el,s){
    const editor=el.querySelector('[contenteditable="true"][role="textbox"],.comments-comment-box [contenteditable="true"]');
    if(!editor || !editor.getClientRects().length){s.assistant?.remove();s.assistantPanel?.remove();s.assistant=null;return;}
    let composer=editor.parentElement,emoji;
    while(composer && composer!==el){emoji=composer.querySelector('button[aria-label*="emoji" i]');if(emoji)break;composer=composer.parentElement;}
    if(!emoji)return;
    if(s.assistant?.isConnected && s.assistantPanel?.isConnected && s.assistant.nextElementSibling===emoji)return;
    s.assistant?.remove();s.assistantPanel?.remove();
    const host=document.createElement('div');host.className='ll-assistant';s.assistant=host;
    const panelHost=document.createElement('div');panelHost.className='ll-assistant-panel';s.assistantPanel=panelHost;
    const panelRoot=panelHost.attachShadow({mode:'open'});
    const root=host.attachShadow({mode:'open'}),style=document.createElement('style');
    style.textContent=':host{display:block;flex-basis:100%;font:13px/1.5 "Segoe UI",sans-serif;color:#191919;color-scheme:light}:host([hidden]){display:none}*{box-sizing:border-box}button,select,textarea{font:inherit;color:inherit;background:#ffffff;border:1px solid #b6b6b6;border-radius:18px;padding:8px 12px}button{cursor:pointer;display:inline-flex;align-items:center;gap:6px;min-height:34px;font-weight:600}button:hover{background:#eaf3fc}button:disabled{opacity:.5;cursor:not-allowed}button:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid #0a66c2;outline-offset:2px}svg{width:16px;height:16px}.panel{padding:18px;background:#ffffff;border:1px solid #ddd;border-radius:14px;margin:10px 0}.actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.primary{background:#0a66c2;color:white;border-color:#0a66c2}.primary:hover{background:#004182}textarea{display:block;width:100%;min-height:100px;resize:vertical;margin:12px 0;caret-color:#0a66c2}textarea::placeholder{color:#666}.custom{min-height:72px}.title{font-size:17px;font-weight:650;margin:0 0 12px}p{font-size:12px;margin:8px 0;overflow-wrap:anywhere;color:#5e5e5e}[hidden]{display:none!important}::selection{background:#f4d58b;color:#191919}';
    const toggle=button('',()=>{panel.hidden=!panel.hidden;panelHost.hidden=panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));});
    toggle.className='toggle';panelHost.hidden=true;
    toggle.setAttribute('aria-label','Suggest a comment with LinkedIn Lens');toggle.setAttribute('aria-expanded','false');toggle.title='Suggest a comment';
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M4 20l1-5L16 4a2.1 2.1 0 0 1 3 3L8 18l-4 2zm10-14l4 4');path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.8');path.setAttribute('stroke-linejoin','round');svg.append(path);toggle.append(svg);
    const panel=document.createElement('div');panel.className='panel';panel.hidden=true;
    const actions=document.createElement('div');actions.className='actions';const tone=document.createElement('select');tone.setAttribute('aria-label','Comment tone');
    for(const [id,name]of Object.entries({positive:'Positive',critical:'Constructive critique',question:'Thoughtful question',insight:'Add insight',balanced:'Balanced',custom:'Custom direction'})){const o=document.createElement('option');o.value=id;o.textContent=name;tone.append(o);}
    const title=document.createElement('h3');title.className='title';title.textContent='Make it your own';
    const custom=document.createElement('textarea');custom.className='custom';custom.hidden=true;custom.maxLength=1500;custom.setAttribute('aria-label','Custom comment direction');custom.placeholder='For example: ask about the cost, keep it friendly, two sentences…';
    tone.addEventListener('change',()=>{custom.hidden=tone.value!=='custom';if(!custom.hidden)custom.focus();});
    const note=document.createElement('p');note.textContent='Review your draft. You decide when to post.';
    const status=document.createElement('p');status.setAttribute('role','status');
    const output=document.createElement('textarea');output.setAttribute('aria-label','Suggested comment draft');output.placeholder='Your draft will appear here.';
    const copy=button('Copy draft',async()=>{try{await navigator.clipboard.writeText(output.value);status.textContent='Copied. Paste into LinkedIn when you’re ready.';}catch{output.focus();output.select();status.textContent='Select and copy the draft with Ctrl+C.';}});copy.disabled=true;
    const insert=button('Insert',()=>{
      if(!editor.isConnected||!el.contains(editor)){status.textContent='Reopen the comment box, or copy the draft.';return;}
      const draft=output.value.trim();if(!draft)return;
      editor.focus();const range=document.createRange();range.selectNodeContents(editor);range.collapse(false);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
      // execCommand preserves the rich editor undo stack and dispatches its input event.
      const ok=document.execCommand('insertText',false,(editor.textContent.trim()?'\n\n':'')+draft);
      if(ok && editor.textContent.includes(draft)){insert.disabled=true;status.textContent='Inserted. Review it in LinkedIn, then post when ready.';}else{status.textContent='This editor could not accept the draft. Use Copy draft instead.';}
    });insert.className='primary';insert.disabled=true;
    output.addEventListener('input',()=>{copy.disabled=insert.disabled=!output.value.trim();});
    const generate=button('Generate draft',async()=>{
      if(tone.value==='custom'&&!custom.value.trim()){status.textContent='Describe the comment you want first.';custom.focus();return;}
      generate.disabled=true;tone.disabled=true;status.textContent='Drafting…';
      try{const text=await message({type:'draft',post:extract(el),tone:tone.value,instructions:custom.value});if(s.assistant===host && host.isConnected){output.value=text;copy.disabled=insert.disabled=false;status.textContent='Draft ready. Check the claims and make it your own.';}}
      catch(e){status.textContent=e.message;}finally{generate.disabled=false;tone.disabled=false;}
    });
    generate.className='primary';const draftActions=document.createElement('div');draftActions.className='actions';draftActions.append(copy,insert);
    actions.append(tone,generate);panel.append(title,actions,custom,output,draftActions,note,status);panelRoot.append(style.cloneNode(true),panel);
    style.textContent+=':host{display:inline-flex;flex:0 0 auto;vertical-align:middle;color:inherit}.toggle{width:32px;height:32px;padding:5px;border:0;border-radius:50%;background:transparent;color:inherit;justify-content:center}.toggle svg{width:22px;height:22px}.toggle:hover{background:rgba(128,128,128,.16)}';
    root.append(style,toggle);emoji.before(host);composer.after(panelHost);
  }
  function button(text,fn) {const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',fn);return b;}
  function render(el,s) {
    if(!el.isConnected || !config.enabled || !isPostPage()) return;
    const result=s.manual?{labels:[{category:s.manual,reason:'You chose this label for this post.'}],source:'Your label'}:s.result;
    const color=config.colors[result.labels[0]?.category] || '#727b85';
    el.classList.toggle('ll-post',result.labels.length>0); el.style.setProperty('--ll-color',color);
    const reasons=Lens.maskReasons(result,config,!!s.manual);
    const collapsed=!s.revealed && reasons.length>0;
    el.classList.toggle('ll-masked',collapsed);maskChildren(el,s,collapsed);
    const root=s.host.shadowRoot;
    root.replaceChildren();
    const style=document.createElement('style');
    style.textContent=':host{display:block;font:12px/1.45 "Segoe UI",sans-serif;color:#191919;color-scheme:light}*{box-sizing:border-box}section{padding:7px 12px;display:flex;justify-content:flex-end;gap:6px;flex-wrap:wrap;align-items:center;background:transparent}button,select{font:inherit;color:#191919;background:#ffffff;border:1px solid #ccc;border-radius:16px;min-height:28px;padding:4px 8px;cursor:pointer}button:hover,select:hover{background:#eaf3fc}button:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid #0a66c2;outline-offset:2px}button:disabled{opacity:.5;cursor:wait}.badge{max-width:100%;white-space:normal;text-align:left;border:1px solid var(--tag);font-weight:600;background:#ffffff}.badge:before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--tag);margin-right:6px}details{width:100%;text-align:right}details[open]{background:#ffffff;padding:12px;border-radius:12px}summary{cursor:pointer;display:inline-block;padding:3px;color:#0a66c2;background:#ffffff;border-radius:5px}p{margin:8px 0;text-align:left;overflow-wrap:anywhere}.error{color:#9d2946}select{max-width:170px}label{display:flex;align-items:center;gap:6px;justify-content:flex-end;margin:8px 0}::selection{background:#f4d58b;color:#191919}';
    const bar=document.createElement('section');
    if(!result.labels.length){const pending=document.createElement('span');pending.textContent=result.unreadable?(result.reason||'Unreadable post'):(s.pending?'Reviewing…':'Waiting for review');bar.append(pending);}
    for(const l of result.labels){
      let name=categories[l.category].name;
      if(l.category==='sponsored'&&name==='Sponsored')name='Sponsored ad';
      if(l.category==='worthwhile'&&s.post.video)name='Worth watching';
      const b=button(name,()=>{details.open=!details.open;});b.className='badge';b.style.setProperty('--tag',config.colors[l.category]);b.title=Lens.labelName(l,config)+'\n'+l.reason;bar.append(b);
    }
    if(collapsed) bar.append(button(result.notPost?'Show card':'Show post',()=>{s.revealed=true;render(el,s);}));
    const details=document.createElement('details');details.open=s.detailsOpen||false;
    const summary=document.createElement('summary');summary.textContent=collapsed?'Masked: '+reasons.map(id=>categories[id].name).join(', '):'Details';summary.title='Open classification details';details.append(summary);
    details.addEventListener('toggle',()=>{s.detailsOpen=details.open;});
    for(const l of result.labels){const p=document.createElement('p');p.textContent=Lens.labelName(l,config)+': '+l.reason;details.append(p);}
    const note=document.createElement('p');note.textContent=result.notPost?'Detected from the card structure. No AI request was needed.':'AI suggestions can be wrong. Review the category or choose your own.';details.append(note);
    const label=document.createElement('label');label.textContent='Correct label';const select=document.createElement('select');select.setAttribute('aria-label','Correct post category');
    for(const [id,name] of [['','Use automatic label'],...categoryOptions]){const o=document.createElement('option');o.value=id;o.textContent=name;select.append(o);}select.value=s.manual||'';
    select.addEventListener('change',()=>{s.manual=select.value;s.revealed=false;render(el,s);});label.append(select);details.append(label);
    if(config.enabled&&!s.post.notPostReason){const ai=button(s.pending?'Analyzing…':'Analyze with AI',()=>analyze(el,s,true));ai.disabled=s.pending;details.append(ai);}
    if(s.error){const p=document.createElement('p');p.className='error';p.setAttribute('role','status');p.textContent=s.error;details.append(p);details.open=true;}
    bar.append(details);root.append(style,bar);
  }
  async function analyze(el,s,manual=false) {
    if(s.pending || !config.enabled || s.post.notPostReason)return;
    if(!s.post.text&&!s.post.imageUrl){if(s.result.unreadable||Date.now()-s.created<2500)return;s.result=Lens.unreadable('No readable text or attached image');render(el,s);return;}
    const version=classifierVersion;
    if(!manual && s.attempt===version) return;
    s.attempt=version;s.pending=true;analyzing++;s.error='';render(el,s);
    try {const result=await message({type:'analyze',post:s.post});if(states.get(el)===s && version===classifierVersion){s.result=result;}}
    catch(e){s.error=e.message;}
    finally{analyzing--;s.pending=false;if(states.get(el)===s){render(el,s);schedule();}}
  }
  function scan() {
    if(!active)return;
    lastPath=location.pathname;
    for(const [el,s] of states){if(!el.isConnected || !isPostPage() || !config.enabled || !config.cloudConsent){cleanup(el,s);states.delete(el);}}
    if(!isPostPage() || !config.enabled || !config.cloudConsent)return;
    const candidates=[...document.querySelectorAll(POST)].filter(el=>!el.parentElement?.closest(POST));
    for(const el of candidates){
      let s=states.get(el);const needsExtract=!s||s.dirty;
      const p=needsExtract?extract(el):s.post,key=needsExtract?JSON.stringify(p):s.key;
      if(!s || s.key!==key){if(s)cleanup(el,s);const host=document.createElement('div');host.className='ll-controls';host.attachShadow({mode:'open'});s={post:p,key,host,result:p.notPostReason?Lens.notPost(p.notPostReason):{labels:[],source:'Awaiting AI'},revealed:false,created:Date.now()};states.set(el,s);el.prepend(host);render(el,s);}
      else if(!s.host.isConnected){el.prepend(s.host);render(el,s);}
      s.dirty=false;
      if(!p.notPostReason)commentAssistant(el,s);
      if(el.classList.contains('ll-masked'))maskChildren(el,s,true);
    }
    const posts=candidates.filter(el=>!states.get(el).post.notPostReason);
    const window=Lens.prefetchIndices(posts.map(el=>el.getBoundingClientRect()),innerHeight);
    for(const index of window){if(analyzing>=2)break;const el=posts[index];analyze(el,states.get(el));}
  }
  function schedule(){if(timer!==undefined)return;timer=setTimeout(()=>{timer=undefined;scan();},100);}
  const observer=new MutationObserver(records=>{
    let relevant=false;
    for(const r of records){
      const target=r.target.nodeType===1?r.target:r.target.parentElement;
      if(target?.closest('.ll-controls,.ll-assistant,.ll-assistant-panel') || (r.type==='attributes'&&r.attributeName==='class'&&states.has(target)) || (r.type==='childList' && [...r.addedNodes,...r.removedNodes].every(n=>n.nodeType===1 && n.matches('.ll-controls,.ll-assistant,.ll-assistant-panel'))))continue;
      const state=states.get(target?.closest(POST));if(state)state.dirty=true;relevant=true;
    }
    if(relevant)schedule();
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-urn','data-id','componentkey','hidden','aria-hidden','contenteditable','src','srcset','href','aria-label','data-testid','alt','class','role']});
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('popstate',schedule);
  const navigation=setInterval(()=>{if(location.pathname!==lastPath||(!isPostPage() && states.size)||[...states.values()].some(s=>!s.post.text&&!s.post.imageUrl&&!s.post.notPostReason&&!s.result.unreadable))scan();},1500);
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local' && changes.settings){message({type:'settings'}).then(s=>{const changed=classifierVersion!==Lens.classificationVersion(s);configure(s);for(const state of states.values()){if(changed){state.attempt=null;state.result=state.post.notPostReason?Lens.notPost(state.post.notPostReason):{labels:[],source:'Awaiting AI'};if(state.manual&&!Object.hasOwn(categories,state.manual))state.manual='';}if(state.error){state.attempt=null;state.error='';}}scan();for(const [el,state] of states)render(el,state);}).catch(stop);}});
  function stop(){active=false;observer.disconnect();clearInterval(navigation);clearTimeout(timer);window.removeEventListener('scroll',schedule);window.removeEventListener('popstate',schedule);for(const [el,s] of states)cleanup(el,s);states.clear();}
  message({type:'settings'}).then(s=>{configure(s);scan();}).catch(stop);
})();
