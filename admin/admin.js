// Admin semplice — localStorage moderation
const ADMIN_PASSWORD = 'francesco';
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

document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    const tab=t.dataset.tab;
    document.getElementById('panelStories').style.display = tab==='stories'?'block':'none';
    document.getElementById('panelThoughts').style.display = tab==='thoughts'?'block':'none';
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
}
renderAuth();
