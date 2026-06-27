
const STORAGE_KEY = 'smartModelsPortalData.v1';
async function loadData(){
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved){ try { return JSON.parse(saved); } catch(e){} }
  if(window.RESEARCH_DATA) return JSON.parse(JSON.stringify(window.RESEARCH_DATA));
  const res = await fetch('data/research-dynamic-data.json', {cache:'no-store'});
  return await res.json();
}
function saveData(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function resetData(){ localStorage.removeItem(STORAGE_KEY); location.reload(); }
function slugify(text){
  return String(text||'item').trim().toLowerCase().replace(/[\s_]+/g,'-').replace(/[^\u0600-\u06FFa-z0-9-]/g,'').replace(/-+/g,'-').replace(/^-+|-+$/g,'').slice(0,60) || ('item-'+Date.now());
}
function normalizeImagePath(src){
  let value = String(src || '').trim();
  if(!value) return '';
  value = value.replace(/\\/g, '/');
  value = value.replace(/^\.\//, '');
  return value;
}
function versionedImageSrc(src){
  const value = normalizeImagePath(src);
  if(!value || /^([a-zA-Z]:\\|[a-zA-Z]:\/|file:)/.test(value)) return '';
  // لا نضيف رقم إصدار للصور المضمّنة أو الروابط الخارجية الطويلة.
  if(value.startsWith('data:') || /^https?:\/\//.test(value)) return value;
  const v = encodeURIComponent(window.__DATA_VERSION__ || '1');
  return value + (value.includes('?') ? '&' : '?') + 'v=' + v;
}
function imageOrPlaceholder(src, label, cls='media-square'){
  const clean = normalizeImagePath(src);
  const finalSrc = versionedImageSrc(clean);
  const safeLabel = escapeHtml(label);
  if(finalSrc){
    return `<img class="${cls}" loading="lazy" src="${escapeHtml(finalSrc)}" alt="${safeLabel}" onerror="this.outerHTML='<div class=&quot;${cls}&quot;><div class=&quot;placeholder&quot;>لم تظهر الصورة<br><small>${escapeHtml(clean)}</small></div></div>'">`;
  }
  return `<div class="${cls}"><div class="placeholder">${safeLabel}</div></div>`;
}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function getPackage(data,id){
  const packages = data?.packages || [];
  if(id) return packages.find(p=>p.id===id) || packages[0];
  return packages[0];
}
function findSection(data,id,pkgId){ return getPackage(data,pkgId)?.sections?.find(s=>s.id===id); }
function downloadJSON(data, filename='research-dynamic-data.json'){
  if(!data){ alert('لا توجد بيانات جاهزة للتصدير.'); return; }
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json;charset=utf-8'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); if(window.confirmSave) window.confirmSave('تم تصدير ملف JSON. استبدل به data/research-dynamic-data.json للحفظ النهائي.');
}
function readJSONFile(file){ return new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>{try{resolve(JSON.parse(r.result))}catch(e){reject(e)}}; r.onerror=reject; r.readAsText(file,'utf-8'); }); }
