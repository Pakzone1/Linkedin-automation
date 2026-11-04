const $=id=>document.getElementById(id);
let draft,undoTree=null,editing=null,expanded=new Set();
async function send(type,extra={}){const r=await chrome.runtime.sendMessage({type,...extra});if(!r?.ok)throw Error(r?.error||'Extension unavailable.');return r.value;}
function status(text){$('status').textContent=text;}
function action(text,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',fn);return b;}
function descendants(id){return draft.taxonomy.filter(c=>Lens.categoryPath(c.id,draft).includes(id)).map(c=>c.id);}
function normalize(){draft=Lens.settings(draft);}
function remember(){undoTree=structuredClone(draft);$('undo-categories').hidden=false;}
function check(label,checked,onChange){const box=document.createElement('input');box.type='checkbox';box.checked=checked;box.setAttribute('aria-label',label);box.addEventListener('change',()=>onChange(box.checked));return box;}
function setMask(id,value){draft.collapse=draft.collapse.filter(k=>k!==id);if(value)draft.collapse.push(id);if(id==='unreadable'){draft.hideUnreadable=value;$('hide-unreadable').checked=value;}if(id==='not_post'){draft.hideNonPosts=value;$('hide-non-posts').checked=value;}}
function categoryControls(c,system=false){
 const controls=document.createElement('span');controls.className='tree-controls';
 const color=document.createElement('input');color.type='color';color.value=draft.colors[c.id];color.setAttribute('aria-label',c.name+' color');
 color.addEventListener('input',()=>{draft.colors[c.id]=color.value;if(!system)draft.taxonomy.find(n=>n.id===c.id).color=color.value;});
 controls.append(color);
 if(!system)controls.append(check('Enable '+c.name,c.enabled!==false,value=>{draft.taxonomy.find(n=>n.id===c.id).enabled=value;normalize();renderCategories();}));
 const mask=document.createElement('label');mask.className='mask-check';mask.append(check('Mask '+c.name,draft.collapse.includes(c.id),value=>setMask(c.id,value)),'Mask');controls.append(mask);
 return controls;
}
function renderCategories(){
 if(!draft)return;
 const query=$('category-search').value.trim().toLowerCase(),all=Lens.categoryMap(draft),active=new Set(Lens.activeIds(draft));
 $('category-count').textContent=draft.taxonomy.length+' categories';$('category-tree').replaceChildren();
 const matches=new Set(draft.taxonomy.filter(c=>!query||(c.name+' '+c.description).toLowerCase().includes(query)).map(c=>c.id));
 const show=new Set();for(const id of matches)for(const p of Lens.categoryPath(id,draft))show.add(p);
 function node(c){
  const children=draft.taxonomy.filter(n=>n.parent===c.id&&show.has(n.id));
  const branch=document.createElement(children.length?'details':'div');branch.className=children.length?'tree-branch':'tree-leaf';branch.dataset.category=c.id;
  const row=document.createElement(children.length?'summary':'div');row.className='tree-row';
  const name=document.createElement('span');name.className='tree-name';name.textContent=c.name;name.title=c.description;if(!active.has(c.id))name.classList.add('inactive');
  row.append(name,categoryControls(c));
  const edit=action('Edit',()=>openEditor(c.id));edit.className='edit-category';edit.setAttribute('aria-label','Edit '+c.name);row.append(edit);branch.append(row);
  if(children.length){branch.open=query?true:expanded.has(c.id);branch.addEventListener('toggle',()=>{if(!query){if(branch.open)expanded.add(c.id);else expanded.delete(c.id);}});const inner=document.createElement('div');inner.className='tree-children';for(const child of children)inner.append(node(child));branch.append(inner);}
  return branch;
 }
 for(const c of draft.taxonomy.filter(c=>c.parent===null&&show.has(c.id)))$('category-tree').append(node(c));
 if(!$('category-tree').children.length){const p=document.createElement('p');p.className='empty-tree';p.textContent=query?'No matching categories.':'Add a category to start.';$('category-tree').append(p);}
 $('system-categories').replaceChildren();for(const c of Object.values(Lens.systemCategories)){const row=document.createElement('div');row.className='tree-row';const name=document.createElement('span');name.className='tree-name';name.textContent=c.name;row.append(name,categoryControls(c,true));$('system-categories').append(row);}
 $('category-count').title=active.size+' enabled, including children of enabled parents';
}
function closeEditor(){editing=null;$('category-editor').hidden=true;}
function openEditor(id=null,parent=null){
 if(editing&&($('category-name').value!==editing.node.name||$('category-description').value!==editing.node.description||($('category-parent').value||null)!==editing.node.parent||$('category-color').value!==editing.node.color)){$('editor-error').textContent='Apply or cancel your current edit first.';return;}
 if(id===null&&draft.taxonomy.length>=200){status('Up to 200 categories.');return;}
 editing={id,newNode:id===null};const node=id?draft.taxonomy.find(c=>c.id===id):{id:'custom_'+crypto.randomUUID().replaceAll('-',''),name:'',description:'',parent,color:parent?draft.colors[parent]:'#0a66c2',enabled:true};editing.node=structuredClone(node);
 $('editor-title').textContent=id?'Edit category':'Add category';$('category-name').value=node.name;$('category-description').value=node.description;$('category-color').value=node.color;
 const blocked=id?new Set(descendants(id)):new Set();$('category-parent').replaceChildren();
 for(const [value,label]of [['','Broad category'],...draft.taxonomy.filter(c=>!blocked.has(c.id)&&Lens.categoryPath(c.id,draft).length<3).map(c=>[c.id,Lens.labelName({category:c.id},draft)])]){const o=document.createElement('option');o.value=value;o.textContent=label;$('category-parent').append(o);}
 $('category-parent').value=node.parent??'';
 $('remove-category').hidden=!id;$('remove-category').textContent=id&&descendants(id).length>1?'Remove branch ('+descendants(id).length+')':'Remove';
 $('add-child').hidden=!id||Lens.categoryPath(id,draft).length>=3;
 $('editor-error').textContent='';$('category-editor').hidden=false;$('category-name').focus();$('category-editor').scrollIntoView({block:'nearest'});
}
$('apply-category').addEventListener('click',()=>{
 try{
  const node={...(draft.taxonomy.find(c=>c.id===editing.id)||editing.node),name:$('category-name').value.trim(),description:$('category-description').value.trim(),parent:$('category-parent').value||null,color:$('category-color').value};
  const taxonomy=editing.newNode?[...draft.taxonomy,node]:draft.taxonomy.map(c=>c.id===node.id?node:c);
  const next=Lens.settings({...draft,taxonomy});remember();draft=next;for(const p of Lens.categoryPath(node.id,draft))expanded.add(p);$('category-search').value='';closeEditor();renderCategories();document.querySelector('[data-category="'+node.id+'"]')?.scrollIntoView({block:'nearest'});status('Category updated. Save to apply.');
 }catch(e){$('editor-error').textContent=e.message;}
});
$('cancel-category').addEventListener('click',closeEditor);
$('add-child').addEventListener('click',()=>openEditor(null,editing.id));
$('remove-category').addEventListener('click',()=>{const remove=new Set(descendants(editing.id));remember();draft.taxonomy=draft.taxonomy.filter(c=>!remove.has(c.id));normalize();closeEditor();renderCategories();status('Removed. Undo or Save.');});
$('undo-categories').addEventListener('click',()=>{if(!undoTree)return;draft=undoTree;undoTree=null;$('undo-categories').hidden=true;$('hide-unreadable').checked=draft.hideUnreadable;$('hide-non-posts').checked=draft.hideNonPosts;closeEditor();renderCategories();status('Restored.');});
$('reset-categories').addEventListener('click',()=>{remember();draft=Lens.settings({...draft,taxonomy:structuredClone(Lens.defaultTaxonomy),collapse:[],hideUnreadable:true,hideNonPosts:true,colors:{}});$('hide-unreadable').checked=true;$('hide-non-posts').checked=true;closeEditor();renderCategories();status('Default categories restored. Save to apply.');});
$('add-category').addEventListener('click',()=>openEditor());
$('category-search').addEventListener('input',renderCategories);
$('expand-categories').addEventListener('click',()=>{expanded=new Set(draft.taxonomy.map(c=>c.id));renderCategories();});
$('fold-categories').addEventListener('click',()=>{expanded.clear();$('category-search').value='';renderCategories();});
$('hide-unreadable').addEventListener('change',()=>{setMask('unreadable',$('hide-unreadable').checked);renderCategories();});
$('hide-non-posts').addEventListener('change',()=>{setMask('not_post',$('hide-non-posts').checked);renderCategories();});
async function load(){
 const r=await send('status');draft=r.settings;undoTree=null;$('undo-categories').hidden=true;
 $('enabled').checked=draft.enabled&&draft.cloudConsent;$('cloud-consent').checked=draft.cloudConsent;$('hide-unreadable').checked=draft.hideUnreadable;$('hide-non-posts').checked=draft.hideNonPosts;$('comments').checked=draft.comments;$('model').value=draft.commentModel;$('limit').value=draft.limit;$('usage').textContent=`${r.count} used`;$('key-state').textContent=r.hasKey?'Key saved on this device.':'Key needed. Saved on this device.';
 closeEditor();renderCategories();
}
$('settings').addEventListener('submit',async e=>{
 e.preventDefault();const b=e.submitter;b.disabled=true;
 try{
  if(editing)throw Error('Apply or cancel the category edit first.');
  if(!Number.isInteger(Number($('limit').value))||Number($('limit').value)<1||Number($('limit').value)>500)throw Error('Request limit: 1 to 500.');
  if(($('enabled').checked||$('comments').checked)&&!$('cloud-consent').checked){$('cloud-consent').focus();throw Error('Accept cloud AI processing before enabling Lens.');}
  const settings=Lens.settings({...draft,enabled:$('enabled').checked,cloudConsent:$('cloud-consent').checked,hideUnreadable:$('hide-unreadable').checked,hideNonPosts:$('hide-non-posts').checked,comments:$('comments').checked,commentModel:$('model').value.trim(),limit:Number($('limit').value)});
  await send('save',{settings,apiKey:$('key').value.trim()});$('key').value='';await load();status('Saved.');
 }catch(e){status(e.message);}finally{b.disabled=false;}
});
for(const id of ['forget','reset'])$(id).addEventListener('click',async()=>{try{await send(id);$('key').value='';await load();status(id==='forget'?'Key removed.':'Count reset.');}catch(e){status(e.message);}});
load().catch(e=>status(e.message));
$('cloud-consent').addEventListener('change',()=>{if(!$('cloud-consent').checked){$('enabled').checked=false;$('comments').checked=false;status('Save to stop cloud AI processing.');}});
for(const tab of document.querySelectorAll('.tab'))tab.addEventListener('click',()=>{for(const b of document.querySelectorAll('.tab')){const on=b===tab;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));document.getElementById(b.dataset.panel).hidden=!on;}});
