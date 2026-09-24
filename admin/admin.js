// Admin semplice — localStorage moderation
const ADMIN_PASSWORD = 'sarafrancesco90';
const LS_KEYS = { storiesPending:'pf_stories_pending', storiesApproved:'pf_stories_approved', thoughtsPending:'pf_thoughts_pending', thoughtsApproved:'pf_thoughts_approved' };
const $ = s=>document.querySelector(s);
function load(k,f){ try{ return JSON.parse(localStorage.getItem(k)) ?? f }catch{ return f } }
function save(k,v){ localStorage.setItem(k, JSON.stringify(v)) }
function isAuthed(){ return sessionStorage.getItem('pf_admin')==='1' }
function setAuthed(v){ sessionStorage.setItem('pf_admin', v?'1':'0') }

const loginView=$('#loginView'), appView=$('#appView');
function renderAuth(){
  const ok=isAuthed();
  loginView.style.display = ok?'none':'block';
  appView.style.display = ok?'block':'none';
  if(ok) renderAll();
}
$('#loginBtn').addEventListener('click', ()=>{
  if($('#pwd').value===ADMIN_PASSWORD){ setAuthed(true); $('#loginErr').style.display='none'; renderAuth(); }
  else $('#loginErr').style.display='block';
});
$('#pwd').addEventListener('keydown', e=>{ if(e.key==='Enter') $('#loginBtn').click(); });
$('#logoutBtn').addEventListener('click', ()=>{ setAuthed(false); renderAuth(); });
$('#exportBtn').addEventListener('click', ()=>{
  const data={ storiesPending:load(LS_KEYS.storiesPending,[]), storiesApproved:load(LS_KEYS.storiesApproved,[]), thoughtsPending:load(LS_KEYS.thoughtsPending,[]), thoughtsApproved:load(LS_KEYS.thoughtsApproved,[]) };
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='per-francesco-export.json'; a.click();
});
$('#clearBtn').addEventListener('click', ()=>{
  if(!confirm('Svuotare tutti i contenuti?')) return;
  Object.values(LS_KEYS).forEach(k=> localStorage.removeItem(k));
  localStorage.removeItem('pf_contacts');
  renderAll();
});

document.querySelectorAll('.tab[data-tab]').forEach(t=>{
  t.addEventListener('click', ()=>{
    document.querySelectorAll('.tab[data-tab]').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    const tab=t.dataset.tab;
    document.getElementById('panelStories').style.display = tab==='stories'?'block':'none';
    document.getElementById('panelThoughts').style.display = tab==='thoughts'?'block':'none';
  });
});
// Photo panels tabs
document.querySelectorAll('.tab[data-ptab]').forEach(t=>{
  t.addEventListener('click', ()=>{
    document.querySelectorAll('.tab[data-ptab]').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.querySelectorAll('.photo-panel').forEach(p=> p.style.display='none');
    document.getElementById('photoPanel-'+t.dataset.ptab).style.display='block';
  });
});

function escapeHtml(s){ return s.replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function renderList(containerId, items, mode){
  const el=document.getElementById(containerId);
  el.innerHTML='';
  if(!items.length){ el.innerHTML='<p><small>Nessun elemento.</small></p>'; return; }
  items.forEach((it, idx)=>{
    const div=document.createElement('div'); div.className='item';
    div.innerHTML=`
      <div class="meta">${escapeHtml(it.name)} · ${new Date(it.createdAt).toLocaleString('it-IT')} ${it.anonymous?'· anonimo':''}</div>
      ${it.title?`<div><strong>${escapeHtml(it.title)}</strong></div>`:''}
      <div style="white-space:pre-wrap;margin-top:6px">${escapeHtml(it.content)}</div>
      <div class="actions"></div>
    `;
    const actions=div.querySelector('.actions');
    if(mode==='pending'){
      const ok=document.createElement('button'); ok.className='btn btn-ok'; ok.textContent='Approva';
      const no=document.createElement('button'); no.className='btn btn-no'; no.textContent='Rifiuta';
      ok.onclick=()=> approve(it, idx, containerId);
      no.onclick=()=> reject(idx, containerId);
      actions.append(ok,no);
    } else {
      const del=document.createElement('button'); del.className='btn btn-no'; del.textContent='Rimuovi';
      del.onclick=()=> removeApproved(idx, containerId);
      actions.append(del);
    }
    el.appendChild(div);
  });
}

function approve(item, idx, containerId){
  if(containerId==='listStoriesPending'){
    const p=load(LS_KEYS.storiesPending,[]); p.splice(idx,1); save(LS_KEYS.storiesPending,p);
    const a=load(LS_KEYS.storiesApproved,[]); a.unshift(item); save(LS_KEYS.storiesApproved,a);
  } else {
    const p=load(LS_KEYS.thoughtsPending,[]); p.splice(idx,1); save(LS_KEYS.thoughtsPending,p);
    const a=load(LS_KEYS.thoughtsApproved,[]); a.unshift(item); save(LS_KEYS.thoughtsApproved,a);
  }
  renderAll();
}
function reject(idx, containerId){
  if(!confirm('Rifiutare ed eliminare?')) return;
  if(containerId==='listStoriesPending'){ const p=load(LS_KEYS.storiesPending,[]); p.splice(idx,1); save(LS_KEYS.storiesPending,p); }
  else { const p=load(LS_KEYS.thoughtsPending,[]); p.splice(idx,1); save(LS_KEYS.thoughtsPending,p); }
  renderAll();
}
function removeApproved(idx, containerId){
  if(!confirm('Rimuovere dai pubblicati?')) return;
  if(containerId==='listStoriesApproved'){ const a=load(LS_KEYS.storiesApproved,[]); a.splice(idx,1); save(LS_KEYS.storiesApproved,a); }
  else { const a=load(LS_KEYS.thoughtsApproved,[]); a.splice(idx,1); save(LS_KEYS.thoughtsApproved,a); }
  renderAll();
}
function renderAll(){
  const sp=load(LS_KEYS.storiesPending,[]), sa=load(LS_KEYS.storiesApproved,[]);
  const tp=load(LS_KEYS.thoughtsPending,[]), ta=load(LS_KEYS.thoughtsApproved,[]);
  document.getElementById('cStories').textContent=sp.length;
  document.getElementById('cThoughts').textContent=tp.length;
  document.getElementById('bStories').textContent=sp.length+' pending';
  document.getElementById('bThoughts').textContent=tp.length+' pending';
  renderList('listStoriesPending', sp, 'pending');
  renderList('listStoriesApproved', sa, 'approved');
  renderList('listThoughtsPending', tp, 'pending');
  renderList('listThoughtsApproved', ta, 'approved');
  renderPhotoPreviews();
}
renderAuth();

// --- Foto: gestione per pannello, salvate in localStorage come base64 ---
const PHOTO_KEYS = { banner:'pf_photos_banner', 'chi-era':'pf_photos_chi-era', 'sua-storia':'pf_photos_sua-storia', 'nostra-storia':'pf_photos_nostra-storia' };
function loadPhotos(panel){ return load(PHOTO_KEYS[panel], []); }
function savePhotos(panel, arr){ save(PHOTO_KEYS[panel], arr); }
function renderPhotoPreviews(){
  Object.keys(PHOTO_KEYS).forEach(panel=>{
    const el=document.getElementById('preview-'+panel);
    if(!el) return;
    const arr=loadPhotos(panel);
    el.innerHTML='';
    if(!arr.length){ el.innerHTML='<small>Nessuna foto caricata da admin. Verranno usate quelle in images/'+panel+'/ se presenti.</small>'; return; }
    arr.forEach((src, idx)=>{
      const wrap=document.createElement('div'); wrap.className='item'; wrap.style.display='flex'; wrap.style.gap='10px'; wrap.style.alignItems='center';
      wrap.innerHTML=`<img src="${src}" style="width:90px;height:90px;object-fit:cover;border-radius:10px;border:2px solid #FFECB3"><span style="flex:1"><small>${panel} — ${idx+1}</small></span>`;
      const del=document.createElement('button'); del.className='btn btn-no'; del.textContent='Rimuovi';
      del.onclick=()=>{ const a=loadPhotos(panel); a.splice(idx,1); savePhotos(panel,a); renderPhotoPreviews(); };
      wrap.appendChild(del);
      el.appendChild(wrap);
    });
  });
}
function handleFileInput(panel){
  const input=document.getElementById('file-'+panel);
  if(!input) return;
  input.addEventListener('change', async ()=>{
    const files=[...input.files];
    if(!files.length) return;
    const arr=loadPhotos(panel);
    for(const f of files){
      const b64=await fileToDataURL(f);
      // ridimensiona client-side per non esplodere localStorage (max ~5MB)
      const resized=await resizeDataUrl(b64, 1200);
      arr.push(resized);
    }
    savePhotos(panel, arr);
    input.value='';
    renderPhotoPreviews();
    alert('Foto aggiunte per '+panel+'. Ricarica il sito per vederle.');
  });
}
['banner','chi-era','sua-storia','nostra-storia'].forEach(handleFileInput);
document.getElementById('exportPhotosBtn')?.addEventListener('click', ()=>{
  const data={};
  Object.keys(PHOTO_KEYS).forEach(k=> data[k]=loadPhotos(k));
  const blob=new Blob([JSON.stringify(data)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='per-francesco-photos.json'; a.click();
});
document.getElementById('clearPhotosBtn')?.addEventListener('click', ()=>{
  if(!confirm('Svuotare tutte le foto caricate da admin?')) return;
  Object.values(PHOTO_KEYS).forEach(k=> localStorage.removeItem(k));
  renderPhotoPreviews();
});
function fileToDataURL(file){
  return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); });
}
function resizeDataUrl(dataUrl, maxSide){
  return new Promise(res=>{
    const img=new Image(); img.onload=()=>{
      let w=img.width, h=img.height;
      if(w>maxSide || h>maxSide){
        const s=Math.min(maxSide/w, maxSide/h); w=Math.round(w*s); h=Math.round(h*s);
      } else return res(dataUrl);
      const c=document.createElement('canvas'); c.width=w; c.height=h;
      c.getContext('2d').drawImage(img,0,0,w,h);
      res(c.toDataURL('image/jpeg', 0.8));
    }; img.src=dataUrl;
  });
}
