// Per Francesco — main.js vanilla
const LS_KEYS = { storiesPending:'pf_stories_pending', storiesApproved:'pf_stories_approved', thoughtsPending:'pf_thoughts_pending', thoughtsApproved:'pf_thoughts_approved' };
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>[...r.querySelectorAll(s)];

function loadJSON(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback }catch{ return fallback } }
function saveJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)) }

// Menu dropdown a tendina in alto a sinistra
const toggle = $('#dropdownToggle');
const menu = $('#dropdownMenu');
toggle?.addEventListener('click', ()=>{
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
document.addEventListener('click', (e)=>{
  if(!e.target.closest('.nav-dropdown')){ menu?.classList.remove('open'); toggle?.setAttribute('aria-expanded','false'); }
});
$$('.dropdown-item').forEach(a=>{
  a.addEventListener('click', ()=>{ menu?.classList.remove('open'); });
});

// Smooth scroll offset per header sticky
$$('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const id=a.getAttribute('href');
    if(id.length>1){
      const el=$(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth',block:'start'}); history.pushState(null,'',id); }
    }
  });
});

// Galleries + Banner — priorità a foto caricate da admin (localStorage), poi /images/
const PHOTO_KEYS = { banner:'pf_photos_banner', hero:'pf_photos_hero', 'chi-era':'pf_photos_chi-era', 'nostra-storia':'pf_photos_nostra-storia', lettera:'pf_photos_lettera' };
function getAdminPhotos(panel){ try{ return JSON.parse(localStorage.getItem(PHOTO_KEYS[panel]))||null }catch{ return null } }
const galleries = [
  {id:'chi-era', count:6, title:'Chi era Francesco'},
  {id:'nostra-storia', count:6, title:'La nostra storia'},
];
function renderGallery(g){
  const grid = document.getElementById(`grid-${g.id}`);
  if(!grid) return;
  const admin = getAdminPhotos(g.id);
  grid.innerHTML='';
  const total = admin && admin.length ? admin.length : g.count;
  for(let i=1;i<=total;i++){
    const item=document.createElement('div');
    item.className='gallery-item';
    const img=document.createElement('img');
    const src = admin && admin[i-1] ? admin[i-1] : `images/${g.id}/${i}.jpg`;
    img.src=src;
    img.alt=`${g.title} — foto ${i}`;
    img.loading='lazy';
    img.onerror=()=>{
      item.innerHTML=`<div class="gallery-placeholder">Aggiungi da admin o<br><code>images/${g.id}/${i}.jpg</code><br>(${g.title})</div>`;
    };
    item.appendChild(img);
    item.addEventListener('click', ()=> openLightbox(g.id, i));
    grid.appendChild(item);
  }
}
galleries.forEach(renderGallery);
// Banner 3 foto + Hero + Lettera
(function renderBanner(){
  const admin = getAdminPhotos('banner');
  if(admin && admin.length){
    const items=document.querySelectorAll('.banner-item');
    items.forEach((fig, idx)=>{
      if(admin[idx]){
        fig.innerHTML=`<img src="${admin[idx]}" alt="Banner ${idx+1}" style="width:100%;height:100%;object-fit:cover">`;
      }
    });
  }
  const hero = getAdminPhotos('hero');
  if(hero && hero[0]){
    const hb=document.querySelector('.hero-background');
    if(hb){ hb.style.background=`url('${hero[0]}') center/cover no-repeat`; hb.style.opacity='0.9'; }
  }
  const lettera = getAdminPhotos('lettera');
  if(lettera && lettera[0]){
    const wrap=document.getElementById('letteraPhotoWrap');
    const img=document.getElementById('letteraPhoto');
    if(wrap && img){ img.src=lettera[0]; wrap.style.display='block'; }
  }
})();

// Lightbox
const lightbox=$('#lightbox'), lbImg=$('#lightboxImage'), lbCaption=$('#lightboxCaption'), lbCounter=$('#lightboxCounter');
let lbState={gallery:null,index:1,total:6};
function openLightbox(gallery, index){
  const g=galleries.find(x=>x.id===gallery); if(!g) return;
  lbState={gallery,index,total:g.count};
  updateLightbox();
  lightbox.classList.add('open');
}
function updateLightbox(){
  const admin = getAdminPhotos(lbState.gallery);
  lbImg.src = admin && admin[lbState.index-1] ? admin[lbState.index-1] : `images/${lbState.gallery}/${lbState.index}.jpg`;
  lbImg.alt=`${lbState.gallery} — foto ${lbState.index}`;
  lbCaption.textContent=`${lbState.gallery} — ${lbState.index} / ${lbState.total}`;
  lbCounter.textContent=`${lbState.index} / ${lbState.total}`;
  lbImg.onerror=()=>{ lbCaption.textContent=`Aggiungi da admin o images/${lbState.gallery}/${lbState.index}.jpg`; };
}
$('#lightboxClose')?.addEventListener('click', ()=> lightbox.classList.remove('open'));
$('#lightboxPrev')?.addEventListener('click', ()=>{ lbState.index = lbState.index>1? lbState.index-1: lbState.total; updateLightbox(); });
$('#lightboxNext')?.addEventListener('click', ()=>{ lbState.index = lbState.index<lbState.total? lbState.index+1: 1; updateLightbox(); });
lightbox?.addEventListener('click', (e)=>{ if(e.target===lightbox) lightbox.classList.remove('open'); });
document.addEventListener('keydown', (e)=>{
  if(!lightbox.classList.contains('open')) return;
  if(e.key==='Escape') lightbox.classList.remove('open');
  if(e.key==='ArrowLeft') $('#lightboxPrev').click();
  if(e.key==='ArrowRight') $('#lightboxNext').click();
});
$$('.btn-gallery-expand').forEach(btn=>{
  btn.addEventListener('click', ()=> openLightbox(btn.dataset.gallery, 1));
});

// Toast + Modal
function toast(msg){
  const c=$('#toastContainer'); const el=document.createElement('div'); el.className='toast'; el.textContent=msg; c.appendChild(el);
  setTimeout(()=> el.remove(), 3200);
}
const modal=$('#confirmModal');
function openModal(msg){
  if(msg) $('#modalMessage').textContent=msg;
  modal.classList.add('open');
}
$('#modalClose')?.addEventListener('click', ()=> modal.classList.remove('open'));
modal?.addEventListener('click', (e)=>{ if(e.target===modal) modal.classList.remove('open'); });

// Form anonimo toggle
function wireAnonymous(formId, nameId, anonId){
  const form=$('#'+formId), name=$('#'+nameId), anon=$('#'+anonId);
  if(!form||!name||!anon) return;
  anon.addEventListener('change', ()=>{
    if(anon.checked){ name.value=''; name.disabled=true; name.placeholder='Anonimo'; }
    else { name.disabled=false; name.placeholder=name.getAttribute('data-ph')||''; }
  });
  name.setAttribute('data-ph', name.placeholder);
}
wireAnonymous('storyForm','storyName','storyAnonymous');
wireAnonymous('thoughtForm','thoughtName','thoughtAnonymous');

// Submit storia/pensiero -> pending in localStorage, da approvare in admin
function handleSubmission(form, type){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd=new FormData(form);
    const anonymous = fd.get('anonymous')==='true';
    const name = anonymous ? 'Anonimo' : (fd.get('name')?.toString().trim() || 'Anonimo');
    const title = fd.get('title')?.toString().trim();
    const content = fd.get('content')?.toString().trim();
    if(!content) return;
    const entry={ id:Date.now().toString(36)+Math.random().toString(36).slice(2,6), name, title: title||'', content, anonymous, createdAt:new Date().toISOString(), type };
    const pendingKey = type==='story'? LS_KEYS.storiesPending: LS_KEYS.thoughtsPending;
    const pending=loadJSON(pendingKey, []);
    pending.unshift(entry);
    saveJSON(pendingKey, pending);
    form.reset();
    // riabilita campo nome se era disabilitato
    form.querySelectorAll('input[type="text"]').forEach(i=> i.disabled=false);
    openModal(type==='story' ? 'La tua storia è stata inviata. Sarà pubblicata dopo la nostra approvazione. Grazie di cuore.' : 'Il tuo pensiero è stato inviato. Sarà pubblicato dopo la nostra approvazione.');
    renderApproved();
  });
}
const storyForm=$('#storyForm'), thoughtForm=$('#thoughtForm');
if(storyForm) handleSubmission(storyForm,'story');
if(thoughtForm) handleSubmission(thoughtForm,'thought');

// Render approved lists
function renderList(containerId, items){
  const el=document.getElementById(containerId);
  if(!el) return;
  if(!items.length){ el.innerHTML='<p class="form-note">Ancora nessun contenuto approvato.</p>'; return; }
  el.innerHTML='';
  items.forEach(it=>{
    const div=document.createElement('div'); div.className='submission';
    const title = it.title ? `<div class="submission-title">${escapeHtml(it.title)}</div>` : '';
    div.innerHTML = `${title}<div class="submission-meta">${escapeHtml(it.name)} · ${new Date(it.createdAt).toLocaleDateString('it-IT')}</div><div class="submission-content">${escapeHtml(it.content)}</div>`;
    el.appendChild(div);
  });
}
function escapeHtml(s){ return s.replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function renderApproved(){
  renderList('storiesList', loadJSON(LS_KEYS.storiesApproved, []));
  renderList('thoughtsList', loadJSON(LS_KEYS.thoughtsApproved, []));
}
renderApproved();

// Seed demo approved se vuoto (così il visitatore vede esempio)
(function seedDemo(){
  if(loadJSON(LS_KEYS.storiesApproved, []).length===0 && loadJSON(LS_KEYS.thoughtsApproved, []).length===0){
    saveJSON(LS_KEYS.storiesApproved, [
      {id:'demo1', name:'Marco R.', title:'Mio padre operaio', content:'Mio padre ha perso due dita in fabbrica nel 2019. Da allora non è più lo stesso. Grazie per dare voce a chi non ce l\'ha.', anonymous:false, createdAt:new Date().toISOString(), type:'story'}
    ]);
    saveJSON(LS_KEYS.thoughtsApproved, [
      {id:'demo2', name:'Anonimo', title:'', content:'Francesco non vi conosco ma la vostra forza mi commuove. Un abbraccio grande.', anonymous:true, createdAt:new Date().toISOString(), type:'thought'}
    ]);
    renderApproved();
  }
})();

// Lettera aperta: condividi
$('#shareLetter')?.addEventListener('click', async ()=>{
  const text=document.getElementById('letterContent')?.innerText.slice(0,1200) || 'Lettera aperta sulla sicurezza sul lavoro';
  const url=location.href;
  if(navigator.share){ try{ await navigator.share({title:'Lettera aperta — Per Francesco', text, url}); toast('Condiviso'); }catch{} }
  else if(navigator.clipboard){ await navigator.clipboard.writeText(url); toast('Link copiato negli appunti'); }
  else toast('Condividi: '+url);
});
$('#supportLetter')?.addEventListener('click', ()=>{ document.getElementById('contatti')?.scrollIntoView({behavior:'smooth'}); toast('Grazie per voler supportare — scrivimi nei contatti'); });

// Contact form (solo frontend — salva in localStorage e apre mailto)
const contactForm=$('#contactForm');
contactForm?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd=new FormData(contactForm);
  const data=Object.fromEntries(fd.entries());
  const existing=loadJSON('pf_contacts',[]); existing.unshift({...data, createdAt:new Date().toISOString()}); saveJSON('pf_contacts', existing);
  // mailto fallback
  const subject=encodeURIComponent(`[Per Francesco] ${data.subject||'Messaggio dal sito'}`);
  const body=encodeURIComponent(`Nome: ${data.name}\nEmail: ${data.email}\n\n${data.message}`);
  window.location.href=`mailto:walter@perfrancesco.it?subject=${subject}&body=${body}`;
  openModal('Messaggio preparato. Si aprirà il tuo client email. Grazie per avermi scritto.');
  contactForm.reset();
});

// Aggiorna contatore pending in header se admin
(function pendingBadge(){
  const pending = loadJSON(LS_KEYS.storiesPending,[]).length + loadJSON(LS_KEYS.thoughtsPending,[]).length;
  if(pending>0){
    const a=document.querySelector('.admin-link');
    if(a) a.textContent+=` (${pending} da approvare)`;
  }
})();
