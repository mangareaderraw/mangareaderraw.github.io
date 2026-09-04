(()=>{
const save=$('saveChapter');
const ok=['image/jpeg','image/png','image/webp'];
async function uploadOnly(id,files){
 const {data:c,error}=await client.from('chapters').select('id,manga_id,chapter_number,title,pages,manga(title)').eq('id',id).single();
 if(error){toast(error.message);return}
 files=[...files].filter(f=>f.type);
 const bad=files.find(f=>!ok.includes(f.type)||f.size>25*1024*1024);
 if(!files.length){toast('Select image files first.');return}
 if(bad){toast(`Image not accepted: ${bad.name}. Use JPG, PNG or WebP under 25MB.`);return}
 if(c.pages?.length&&!confirm(`Replace existing ${c.pages.length} images with ${files.length} new images?`))return;
 const uploaded=[],pages=[];
 for(let i=0;i<files.length;i++){
  const f=files[i],ext=f.name.split('.').pop().toLowerCase(),path=`${c.manga_id}/chapter-${c.chapter_number}/pending-${crypto.randomUUID()}-${String(i+1).padStart(4,'0')}.${ext}`;
  toast(`Uploading ${c.manga?.title||'chapter'} ${c.chapter_number}: ${i+1}/${files.length}`);
  const up=await client.storage.from('chapter-pages').upload(path,f,{upsert:false,contentType:f.type,cacheControl:'31536000'});
  if(up.error){if(uploaded.length)await client.storage.from('chapter-pages').remove(uploaded);toast(up.error.message);return}
  uploaded.push(path);pages.push({url:client.storage.from('chapter-pages').getPublicUrl(path).data.publicUrl,alt:c.title||`Chapter ${c.chapter_number}`,order:i+1});
 }
 const oldPaths=(c.pages||[]).map(p=>{try{return decodeURIComponent(new URL(typeof p==='string'?JSON.parse(p).url:p.url).pathname.split('/storage/v1/object/public/chapter-pages/')[1])}catch{return null}}).filter(Boolean);
 const r=await client.from('chapters').update({pages}).eq('id',id);
 if(r.error){await client.storage.from('chapter-pages').remove(uploaded);toast(r.error.message);return}
 if(oldPaths.length)await client.storage.from('chapter-pages').remove(oldPaths);
 toast(`Images uploaded: ${pages.length} pages`);loadChapters();
}
function controls(){
 const list=$('chapterList');if(!list)return;
 const table=list.querySelector('table');if(!table)return;
 if(!table.querySelector('.bulk-check')){
  const th=table.querySelector('thead tr');const h=document.createElement('th');h.innerHTML='<input class="bulk-check" type="checkbox" title="Select all">';th.prepend(h);
  table.querySelectorAll('tbody tr').forEach(tr=>{const id=(tr.querySelector('button[onclick^="editChapter"]')?.getAttribute('onclick')||'').match(/'([^']+)'/)?.[1];const td=document.createElement('td');td.innerHTML=`<input class="chapter-check" type="checkbox" data-id="${id||''}">`;tr.prepend(td);
   const actions=tr.lastElementChild;const b=document.createElement('button');b.className='btn secondary';b.textContent='Upload Images';b.onclick=()=>pickFiles(id);actions.prepend(b);actions.insertBefore(document.createTextNode(' '),b.nextSibling);
  });
  table.querySelector('.bulk-check').onchange=e=>table.querySelectorAll('.chapter-check').forEach(x=>x.checked=e.target.checked);
 }
 if(!$('chapterBulkTools')){
  const bar=document.createElement('div');bar.id='chapterBulkTools';bar.className='toolbar';bar.innerHTML='<button class="btn secondary" id="bulkEditBtn">✏️ Edit Selected</button><button class="btn" id="bulkUploadBtn">🖼️ Upload Images to Selected</button><input id="bulkFolderInput" type="file" webkitdirectory directory multiple accept="image/jpeg,image/png,image/webp" style="display:none">';list.parentElement.insertBefore(bar,list);
  $('bulkEditBtn').onclick=bulkEdit;$('bulkUploadBtn').onclick=()=>{const s=selected();if(!s.length){toast('Select chapters first.');return}$('bulkFolderInput').value='';$('bulkFolderInput').click()};$('bulkFolderInput').onchange=()=>bulkFolders($('bulkFolderInput').files);
 }
}
function selected(){return [...document.querySelectorAll('#chapterList .chapter-check:checked')].map(x=>x.dataset.id).filter(Boolean)}
function pickFiles(id){const i=document.createElement('input');i.type='file';i.multiple=true;i.accept=ok.join(',');i.onchange=()=>uploadOnly(id,i.files);i.click()}
async function bulkFolders(files){
 const ids=selected();if(!ids.length||!files.length)return;
 const {data:cs,error}=await client.from('chapters').select('id,manga_id,chapter_number,title,pages,manga(title)');if(error){toast(error.message);return}
 const chosen=cs.filter(c=>ids.includes(c.id));
 const groups=new Map();
 for(const f of [...files]){
  const path=(f.webkitRelativePath||f.name).replace(/\\/g,'/');const m=path.match(/(?:^|\/)(?:第\s*)?(\d+(?:\.\d+)?)\s*話/);const n=m?Number(m[1]):(path.match(/chapter[-_ ](\d+(?:\.\d+)?)/i)?.[1]*1);
  if(n==null)continue;
  const candidates=chosen.filter(c=>Number(c.chapter_number)===n);
  if(candidates.length===1){if(!groups.has(candidates[0].id))groups.set(candidates[0].id,[]);groups.get(candidates[0].id).push(f)}
  else if(candidates.length>1){const hit=candidates.find(c=>path.toLowerCase().includes(String(c.manga?.title||'').toLowerCase()));if(hit){if(!groups.has(hit.id))groups.set(hit.id,[]);groups.get(hit.id).push(f)}}
 }
 if(!groups.size){toast('No folders matched the selected chapter numbers. Folder names must contain 第###話.');return}
 for(const [id,fs] of groups)await uploadOnly(id,fs);
}
async function bulkEdit(){
 const ids=selected();if(!ids.length){toast('Select chapters first.');return}
 const {data,error}=await client.from('chapters').select('id,manga_id,chapter_number,title,url_slug,manga(title)').in('id',ids);if(error){toast(error.message);return}
 const box=document.createElement('div');box.id='bulkEditModal';box.style='position:fixed;inset:0;background:#000b;z-index:9999;overflow:auto;padding:30px';box.innerHTML=`<div class="panel" style="max-width:1000px;margin:auto"><h2>✏️ Edit Selected Chapters</h2><p class="muted">Edit each selected chapter. Images are not changed here.</p><div id="bulkRows"></div><div class="actions"><button class="btn" id="bulkSave">Save All Changes</button><button class="btn secondary" id="bulkClose">Cancel</button></div></div>`;
document.body.appendChild(box);const rows=$('bulkRows');rows.innerHTML=data.map(c=>`<div class="panel" style="margin:10px 0"><strong>${esc(c.manga?.title||'')} · Chapter ${esc(c.chapter_number)}</strong><div class="formgrid" style="margin-top:10px"><div><label>Chapter name</label><input data-title="${c.id}" value="${esc(c.title||'').replace(/"/g,'&quot;')}"></div><div><label>Slug</label><input data-slug="${c.id}" value="${esc(c.url_slug||'').replace(/"/g,'&quot;')}"></div></div></div>`).join('');
 $('bulkClose').onclick=()=>box.remove();$('bulkSave').onclick=async()=>{for(const c of data){const title=rows.querySelector(`[data-title="${c.id}"]`).value.trim(),slug=rows.querySelector(`[data-slug="${c.id}"]`).value.trim();if(!title||!slug){toast('Chapter name and slug are required.');return}const r=await client.from('chapters').update({title,url_slug:slug}).eq('id',c.id);if(r.error){toast(r.error.message);return}}toast('Selected chapters updated successfully.');box.remove();loadChapters()}
}
const oldSave=save?.onclick; if(save)save.onclick=oldSave;
const observer=new MutationObserver(()=>controls());observer.observe($('chapterList'),{childList:true,subtree:true});setTimeout(controls,300);
})();