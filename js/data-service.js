window.__DATA_VERSION__ = window.__DATA_VERSION__ || '2026-06-28-01';
const STORAGE_KEY = 'researchPackageData.v1';

function isAdminPage(){
  return /(^|\/)admin\.html$/i.test(location.pathname) || location.pathname.endsWith('/admin.html');
}

function cloneData(data){
  return JSON.parse(JSON.stringify(data));
}

function packageCount(data){
  return Array.isArray(data?.packages) ? data.packages.length : 0;
}

function validData(data){
  return data && Array.isArray(data.packages) && data.packages.length > 0;
}

async function loadProjectFileData(){
  if(window.RESEARCH_DATA && validData(window.RESEARCH_DATA)){
    return cloneData(window.RESEARCH_DATA);
  }
  const res = await fetch('data/research-dynamic-data.json?v=' + encodeURIComponent(window.__DATA_VERSION__ || '1'), {cache:'no-store'});
  if(!res.ok) throw new Error('تعذر تحميل data/research-dynamic-data.json');
  const data = await res.json();
  if(!validData(data)) throw new Error('ملف data/research-dynamic-data.json لا يحتوي على packages صحيحة');
  return data;
}

async function loadData(){
  const fileData = await loadProjectFileData();

  // صفحات الزائر تقرأ ملفات المشروع فقط، ولا تتأثر بالحفظ المؤقت في المتصفح.
  if(!isAdminPage()) return fileData;

  // لوحة التحكم تستخدم الحفظ المؤقت فقط إذا كان أحدث/أوسع من ملف المشروع.
  // إذا كان الحفظ المؤقت يحتوي باقة واحدة بينما ملف المشروع يحتوي عشر باقات، نتجاهله تلقائيًا.
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved){
    try{
      const savedData = JSON.parse(saved);
      if(validData(savedData)){
        const savedCount = packageCount(savedData);
        const fileCount = packageCount(fileData);
        if(savedCount >= fileCount){
          return savedData;
        }
        console.warn('تم تجاهل الحفظ المؤقت لأنه يحتوي باقات أقل من ملف المشروع.', {savedCount, fileCount});
        localStorage.removeItem(STORAGE_KEY);
      }
    }catch(e){
      console.warn('تعذر قراءة الحفظ المؤقت، سيتم تجاهله.', e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // بعد استعادة ملف العشر باقات، نخزنه مؤقتًا للوحة التحكم حتى تظهر القوائم كاملة.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fileData));
  return fileData;
}

function saveData(data){
  if(isAdminPage()){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

function resetData(){
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function clearTemporaryAdminData(){
  localStorage.removeItem(STORAGE_KEY);
}

function slugify(text){
  return String(text||'item')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g,'-')
    .replace(/[^\u0600-\u06FFa-z0-9-]/g,'')
    .replace(/-+/g,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0,60) || ('item-'+Date.now());
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

function escapeHtml(s){
  return String(s??'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function getPackage(data,id){
  const packages = data?.packages || [];
  if(id) return packages.find(p=>p.id===id) || packages[0];
  return packages[0];
}

function findSection(data,id,pkgId){
  return getPackage(data,pkgId)?.sections?.find(s=>s.id===id);
}

function downloadJSON(data, filename='research-dynamic-data.json'){
  if(!data){ alert('لا توجد بيانات جاهزة للتصدير.'); return; }
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=filename;
  a.click();
  URL.revokeObjectURL(url);
  if(window.confirmSave) window.confirmSave('تم تصدير ملف JSON. استبدل به data/research-dynamic-data.json للحفظ النهائي.');
}

function downloadJS(data, filename='research-dynamic-data.js'){
  if(!data){ alert('لا توجد بيانات جاهزة للتصدير.'); return; }
  const content = 'window.RESEARCH_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
  const blob = new Blob([content], {type:'application/javascript;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=filename;
  a.click();
  URL.revokeObjectURL(url);
  if(window.confirmSave) window.confirmSave('تم تصدير ملف JS. استبدل به data/research-dynamic-data.js للحفظ النهائي.');
}

function readJSONFile(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>{try{resolve(JSON.parse(r.result))}catch(e){reject(e)}};
    r.onerror=reject;
    r.readAsText(file,'utf-8');
  });
}
