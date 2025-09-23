/* app.js - Dordrecht News behavior
   - uses localStorage keys:
     - 'dordrecht_published' (array of published news)
     - 'dordrecht_pending' (array of pending submissions)
   - admin flag is stored in sessionStorage 'dordrecht_admin' after login
   - ADMIN_PASSWORD is client-side; change it before deploying
*/

const ADMIN_PASSWORD = "dordrecht2025"; // <- CHANGE this to your secret BEFORE you share the repo

/* ---------------- storage helpers ---------------- */
function load(key){ try { return JSON.parse(localStorage.getItem(key)||'[]') } catch(e){ return [] } }
function save(key, arr){ localStorage.setItem(key, JSON.stringify(arr||[])) }

function getPublished(){ return load('dordrecht_published') }
function getPending(){ return load('dordrecht_pending') }

function setPublished(arr){ save('dordrecht_published', arr) }
function setPending(arr){ save('dordrecht_pending', arr) }

/* ---------------- utilities ---------------- */
function el(id){ return document.getElementById(id) }
function qs(sel){ return document.querySelector(sel) }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)) }
function fmtDate(dStr){ if(!dStr) return ''; const d = new Date(dStr); return d.toLocaleDateString(); }
function todayIso(){ const d=new Date(); return d.toISOString().slice(0,10) }

/* ---------------- render helpers ---------------- */
function renderCard(item){
  const container = document.createElement('div')
  container.className = 'card'
  const h = document.createElement('h3')
  h.textContent = item.title
  const p = document.createElement('p')
  p.textContent = item.content
  const meta = document.createElement('div')
  meta.className = 'meta'
  meta.textContent = `${item.category} • ${fmtDate(item.date)}`
  container.appendChild(h); container.appendChild(p); container.appendChild(meta)
  return container
}

function renderList(containerId, items){
  const out = el(containerId)
  out.innerHTML = ''
  if(!items.length){ out.innerHTML = '<div class="card"><p class="small">No posts yet.</p></div>'; return }
  items.forEach(it=> out.appendChild(renderCard(it)))
}

/* ---------------- page rendering ---------------- */
function renderHome(){
  // for each category show top 3
  const categories = ['Crime','Sports','Events','Weather','Stories']
  const main = el('main-content')
  main.innerHTML = ''
  const published = getPublished()
  categories.forEach(cat=>{
    const sec = document.createElement('section')
    sec.innerHTML = `<div class="section-title"> ${emojiFor(cat)} <strong>${cat}</strong></div>`
    const list = document.createElement('div'); list.id = `list-${cat.toLowerCase()}`
    sec.appendChild(list)
    main.appendChild(sec)
    const filtered = published.filter(p=>p.category.toLowerCase()===cat.toLowerCase())
    renderList(list.id, filtered)
  })
}

function renderCategoryPage(category){
  const main = el('main-content'); main.innerHTML = ''
  const sec = document.createElement('section')
  sec.innerHTML = `<div class="section-title">${emojiFor(category)} <strong>${category}</strong></div>`
  const list = document.createElement('div'); list.id = 'topic-list'
  sec.appendChild(list)
  main.appendChild(sec)
  const published = getPublished().filter(p=>p.category.toLowerCase()===category.toLowerCase())
  renderList('topic-list', published)
}

function emojiFor(cat){
  const map = {Crime:'🚨',Sports:'⚽',Events:'🎉',Weather:'☀️',Stories:'📝'}
  return map[cat] || '📰'
}

/* ---------------- submit handler ---------------- */
function openAddForm(){
  el('addNewsForm').style.display = 'block'
}
function closeAddForm(){
  el('addNewsForm').style.display = 'none'
}

function submitNews(){
  const title = el('newsTitle').value.trim()
  const content = el('newsContent').value.trim()
  const category = el('newsCategory').value
  const date = el('newsDate').value || todayIso()
  if(!title || !content){ alert('Please fill title and content'); return }
  const pending = getPending()
  const item = { id: Date.now().toString(), title, content, category, date, status:'pending' }
  pending.unshift(item)
  setPending(pending)
  alert('✅ News submitted for approval (pending).')
  el('newsTitle').value = ''; el('newsContent').value = ''; el('newsDate').value = ''
  closeAddForm()
  // if admin on, refresh admin pending list
  if(isAdmin()) renderAdminPending()
}

function showTodayNews(){
  const published = getPublished()
  const today = todayIso()
  const todays = published.filter(p=> (p.date && p.date.slice(0,10)===today) )
  if(!todays.length){ alert("No published items for today.") ; return }
  // show as modal simple alert (or render in a list)
  const box = todays.map(t=> `• ${t.title} (${t.category})\n${t.content}\n`).join('\n\n')
  alert('Today\'s published news:\n\n'+box)
}

/* ---------------- search ---------------- */
function performSearch(q){
  q = (q||'').toLowerCase().trim()
  if(!q){ // if empty, render home or current topic
    renderCurrent()
    return
  }
  const published = getPublished()
  const results = published.filter(p => (p.title+p.content+p.category).toLowerCase().includes(q))
  const main = el('main-content'); main.innerHTML = ''
  const sec = document.createElement('section')
  sec.innerHTML = `<div class="section-title">🔎 <strong>Search results</strong></div>`
  const list = document.createElement('div'); list.id = 'search-results'
  sec.appendChild(list); main.appendChild(sec)
  renderList('search-results', results)
}

/* ---------------- admin status ---------------- */
function isAdmin(){ return sessionStorage.getItem('dordrecht_admin') === '1' }
function promptAdminLogin(){
  const pass = prompt('Admin password:')
  if(pass===ADMIN_PASSWORD){
    sessionStorage.setItem('dordrecht_admin','1')
    alert('✅ Admin unlocked for this session.')
    // if on admin page, render
    if(document.body.datasetPage === 'admin') renderAdminPage()
  } else {
    alert('Wrong password.')
  }
}

/* ---------------- admin actions ---------------- */
function renderAdminPage(){
  if(!isAdmin()){ alert('You must log in as admin.'); promptAdminLogin(); if(!isAdmin()) return }
  // simple admin page rendering: pending + published
  const main = el('main-content'); main.innerHTML = ''
  const pendingSec = document.createElement('section')
  pendingSec.innerHTML = `<div class="section-title">⚙️ <strong>Pending Submissions</strong></div><div id="pending-list" class="pending-list"></div>`
  const publishedSec = document.createElement('section')
  publishedSec.innerHTML = `<div class="section-title">📣 <strong>Published</strong></div><div id="published-list"></div>`
  main.appendChild(pendingSec); main.appendChild(publishedSec)
  renderAdminPending(); renderAdminPublished()
}

function renderAdminPending(){
  const list = el('pending-list'); if(!list) return
  const pending = getPending()
  list.innerHTML = ''
  if(!pending.length){ list.innerHTML = '<div class="card small">No pending items</div>'; return }
  pending.forEach(item=>{
    const node = document.createElement('div'); node.className='item'
    const left = document.createElement('div'); left.className='left'
    left.innerHTML = `<strong>${item.title}</strong><div class="small">${item.category} • ${fmtDate(item.date)}</div><p class="small" style="margin-top:8px">${item.content}</p>`
    const right = document.createElement('div'); right.className='pending-actions'
    const a = document.createElement('button'); a.className='btn btn-primary'; a.textContent='Approve'
    a.onclick = ()=>{ approveItem(item.id) }
    const r = document.createElement('button'); r.className='btn btn-ghost'; r.textContent='Reject'
    r.onclick = ()=>{ rejectItem(item.id) }
    right.appendChild(a); right.appendChild(r)
    node.appendChild(left); node.appendChild(right)
    list.appendChild(node)
  })
}

function renderAdminPublished(){
  const list = el('published-list'); if(!list) return
  const published = getPublished()
  list.innerHTML = ''
  if(!published.length){ list.innerHTML = '<div class="card small">No published items yet</div>'; return }
  published.forEach(item=>{
    const node = document.createElement('div'); node.className='item'
    node.style.marginBottom='10px'
    node.innerHTML = `<div><strong>${item.title}</strong> <div class="small">${item.category} • ${fmtDate(item.date)}</div><p class="small" style="margin-top:8px">${item.content}</p></div>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="btn btn-ghost" onclick="deletePublished('${item.id}')">Delete</button>
      </div>`
    list.appendChild(node)
  })
}

function approveItem(id){
  let pending = getPending(); let published = getPublished()
  const idx = pending.findIndex(p=>p.id===id); if(idx<0) return
  const item = pending.splice(idx,1)[0]; item.status='published'
  published.unshift(item)
  setPending(pending); setPublished(published)
  renderAdminPending(); renderAdminPublished()
  alert('Item approved & published.')
}

function rejectItem(id){
  let pending = getPending(); const idx = pending.findIndex(p=>p.id===id); if(idx<0) return
  pending.splice(idx,1); setPending(pending); renderAdminPending()
  alert('Rejected and removed.')
}

function deletePublished(id){
  if(!confirm('Delete this published item?')) return
  let published = getPublished(); published = published.filter(p=>p.id!==id); setPublished(published); renderAdminPublished()
}

/* ---------------- small helpers for page routing ---------------- */
function renderCurrent(){
  const page = document.body.datasetPage
  if(!page || page==='home') return renderHome()
  if(page==='admin') return renderAdminPage()
  // for topic pages
  return renderCategoryPage(capitalize(page))
}

function capitalize(s){ if(!s) return ''; return s.charAt(0).toUpperCase()+s.slice(1) }

/* ---------------- wire DOM events ---------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  // wire open/close add form
  const openBtn = el('showFormBtn'); if(openBtn) openBtn.addEventListener('click', openAddForm)
  const cancelBtn = el('cancelBtn'); if(cancelBtn) cancelBtn.addEventListener('click', closeAddForm)
  const submitBtn = el('submitNewsBtn'); if(submitBtn) submitBtn.addEventListener('click', submitNews)
  const showTodayBtn = el('showTodayBtn'); if(showTodayBtn) showTodayBtn.addEventListener('click', showTodayNews)
  const searchInput = el('searchInput'); if(searchInput){
    searchInput.addEventListener('input', e => performSearch(e.target.value))
  }
  // admin link
  qsa('.admin-link').forEach(elm=>{
    elm.addEventListener('click', (ev)=>{
      ev.preventDefault()
      promptAdminLogin()
      if(isAdmin() && document.body.datasetPage==='admin') renderAdminPage()
      else if(isAdmin()) window.location.href = './admin.html'
    })
  })

  // initial render
  renderCurrent()
})
