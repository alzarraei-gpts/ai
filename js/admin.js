
let DATA;
let selectedPackageId = null;
let selectedSectionId = null;
let selectedBotId = null;


function normalizeImagePathValue(value){
  value = String(value || '').trim();
  if(!value) return '';
  value = value.replace(/\\/g, '/');
  value = value.replace(/^\.\//, '');
  return value;
}
function selectedItemFromImageInput(inputId){
  if(String(inputId).startsWith('package')) return pkg();
  if(String(inputId).startsWith('section')) return sec();
  return bot();
}
function persistImagePathFromInput(inputId){
  const input = document.getElementById(inputId);
  const item = selectedItemFromImageInput(inputId);
  if(!input || !item) return false;
  input.value = normalizeImagePathValue(input.value);
  item.image = input.value;
  DATA.updatedAt = new Date().toISOString();
  saveData(DATA);
  return true;
}

const LEVELS = {
  package: { label: 'الباقة', ratio: '16:9', folder: 'images/packages', color: 'wide' },
  section: { label: 'التقسيم', ratio: '1:1', folder: 'images/sections', color: 'square' },
  bot: { label: 'البوت', ratio: '1:1', folder: 'images/bots', color: 'square' }
};

document.addEventListener('DOMContentLoaded', async()=>{
  try{
    DATA = await loadData();
    ensureDataShape();
    hydrateSelection();
    renderAdmin();
    confirmSave('لوحة التحكم جاهزة.', false);
  }catch(err){
    console.error(err);
    renderImportGate(err);
  }
});

function renderImportGate(err){
  const reason = err && err.message ? err.message : 'لم يتم تحميل ملف البيانات تلقائيًا.';
  const control = document.getElementById('adminControl');
  if(control){
    control.innerHTML = `
      <div class="load-state load-waiting">
        <h2>لم يتم تحميل بيانات الإدراج بعد</h2>
        <p>حتى تظهر حقول <b>تحرير الباقة</b> و<b>تحرير التقسيم</b> و<b>تحرير البوت</b>، اضغط الزر التالي واختر ملف البيانات الأساسي.</p>
        <div class="notice"><b>الملف المطلوب تحديدًا:</b> <code>data/research-dynamic-data.json</code></div>
        <div class="toolbar">
          <label class="btn primary">استيراد JSON للبدء
            <input type="file" accept="application/json,.json" hidden onchange="importJSON(this)">
          </label>
          <button type="button" onclick="resetData()">مسح الحفظ المؤقت</button>
        </div>
        <p class="small">السبب التقني الظاهر: ${escapeHtml(reason)}</p>
      </div>
    `;
  }
  const editor = document.getElementById('editor');
  if(editor){
    editor.innerHTML = `
      <section class="panel load-help">
        <h2>أين بيانات الإدراج؟</h2>
        <p>البيانات ليست في هذه المساحة بعد. بعد نجاح الاستيراد ستظهر تلقائيًا ثلاث بطاقات تحرير كاملة:</p>
        <div class="policy-grid">
          <article><b>1. تحرير الباقة</b><p>صورة 16:9 + عنوان + وصف + حفظ.</p></article>
          <article><b>2. تحرير التقسيم</b><p>صورة 1:1 + عنوان + وصف + حفظ.</p></article>
          <article><b>3. تحرير البوت</b><p>صورة 1:1 + عنوان + وصف + روابط + حدود + مثال.</p></article>
        </div>
      </section>
    `;
  }
}

window.addEventListener('error', e=>{
  console.error(e.error || e.message);
  showStatus('حدث خطأ في التشغيل. افتح Console لمعرفة التفاصيل.', true);
});

function ensureDataShape(){
  DATA = DATA || { version: 1, packages: [] };
  if(!Array.isArray(DATA.packages)) DATA.packages = [];
  if(!DATA.packages.length){
    DATA.packages.push({id:'research', title:'باقة الباحث العلمي', image:'images/packages/research.webp', description:'', sections:[]});
  }
  DATA.packages.forEach((p, pi)=>{
    p.id = p.id || uniqueId('package', p.title || ('package-'+pi));
    p.title = p.title || 'باقة جديدة';
    p.image = p.image || `images/packages/${p.id}.webp`;
    p.description = p.description || '';
    if(!Array.isArray(p.sections)) p.sections = [];
    p.sections.forEach((s, si)=>{
      s.id = s.id || uniqueId('section', s.title || ('section-'+si));
      s.title = s.title || 'تقسيم جديد';
      s.image = s.image || `images/sections/${s.id}.webp`;
      s.description = s.description || '';
      if(!Array.isArray(s.bots)) s.bots = [];
      s.bots.forEach((b, bi)=>{
        b.id = b.id || uniqueId('bot', b.title || ('bot-'+bi));
        b.title = b.title || 'بوت جديد';
        b.image = b.image || `images/bots/${b.id}.webp`;
        b.description = b.description || '';
        b.limits = b.limits || '';
        b.example = b.example || '';
        b.chatgpt = b.chatgpt || '';
        b.gemini = b.gemini || '';
      });
    });
  });
}

function hydrateSelection(){
  const p = DATA.packages.find(x=>x.id===selectedPackageId) || DATA.packages[0];
  selectedPackageId = p?.id || null;
  const s = p?.sections?.find(x=>x.id===selectedSectionId) || p?.sections?.[0] || null;
  selectedSectionId = s?.id || null;
  const b = s?.bots?.find(x=>x.id===selectedBotId) || s?.bots?.[0] || null;
  selectedBotId = b?.id || null;
}

function pkg(){ return DATA.packages.find(p=>p.id===selectedPackageId) || DATA.packages[0]; }
function sec(){ return pkg()?.sections?.find(s=>s.id===selectedSectionId) || null; }
function bot(){ return sec()?.bots?.find(b=>b.id===selectedBotId) || null; }
function totalBots(p=pkg()){ return (p?.sections||[]).reduce((sum,s)=>sum+(s.bots||[]).length,0); }

function renderAdmin(){ hydrateSelection(); renderControl(); renderEditor(); }

function dataLoadedSummary(){
  const p = pkg();
  const packagesCount = DATA?.packages?.length || 0;
  const sectionsCount = p?.sections?.length || 0;
  const botsCount = totalBots(p);
  return `
    <div class="load-state load-success">
      <h2>تم تحميل بيانات الإدراج بنجاح</h2>
      <p>يمكنك الآن تعديل الصور والنصوص والروابط. الصور تقبل أسماءها الأصلية داخل مجلدات images دون فرض أسماء ثابتة.</p>
      <div class="admin-stats">
        <span>الباقات: <b>${packagesCount}</b></span>
        <span>تقسيمات الباقة: <b>${sectionsCount}</b></span>
        <span>إجمالي بوتات الباقة: <b>${botsCount}</b></span>
      </div>
    </div>`;
}

function renderControl(){
  const p = pkg();
  const s = sec();
  const b = bot();
  const packages = DATA.packages || [];
  const sections = p?.sections || [];
  const bots = s?.bots || [];
  document.getElementById('adminControl').innerHTML = `
    ${dataLoadedSummary()}
    <div class="controlbar-head">
      <div><h2>مركز التحكم المختصر</h2><p class="small">اختر العنصر من هنا، ثم عدّل تفاصيله في البطاقات الثلاث أسفل الشريط.</p></div>
      <div class="admin-stats">
        <span>الباقات: <b>${packages.length}</b></span>
        <span>تقسيمات الباقة: <b>${sections.length}</b></span>
        <span>بوتات التقسيم: <b>${bots.length}</b></span>
        <span>إجمالي بوتات الباقة: <b>${totalBots(p)}</b></span>
      </div>
    </div>
    <div class="admin-picker-grid unified-picker">
      <div class="field"><label>الباقة الحالية</label><select id="packageSelect">${packages.map(x=>`<option value="${escapeHtml(x.id)}" ${x.id===selectedPackageId?'selected':''}>${escapeHtml(x.title)}</option>`).join('')}</select></div>
      <div class="field"><label>التقسيم الحالي</label><select id="sectionSelect">${sections.length?sections.map(x=>`<option value="${escapeHtml(x.id)}" ${x.id===selectedSectionId?'selected':''}>${escapeHtml(x.title)} (${(x.bots||[]).length})</option>`).join(''):'<option value="">لا توجد تقسيمات</option>'}</select></div>
      <div class="field"><label>البوت الحالي</label><select id="botSelect">${bots.length?bots.map(x=>`<option value="${escapeHtml(x.id)}" ${x.id===selectedBotId?'selected':''}>${escapeHtml(x.title)}</option>`).join(''):'<option value="">لا توجد بوتات</option>'}</select></div>
    </div>
    <div class="control-actions">
      <button class="btn" type="button" onclick="addPackage()">＋ إضافة باقة</button>
      <button class="btn" type="button" onclick="addSection()" ${p?'':'disabled'}>＋ إضافة تقسيم</button>
      <button class="btn" type="button" onclick="addBot()" ${s?'':'disabled'}>＋ إضافة بوت</button>
      <a class="btn" href="index.html">معاينة الرئيسية</a>
      <a class="btn" href="package.html?package=${encodeURIComponent(selectedPackageId||'')}">معاينة التقسيمات</a>
      <a class="btn" href="bots.html?package=${encodeURIComponent(selectedPackageId||'')}&section=${encodeURIComponent(selectedSectionId||'')}">معاينة البوتات</a>
    </div>`;

  document.getElementById('packageSelect')?.addEventListener('change', e=>{ selectedPackageId=e.target.value; selectedSectionId=null; selectedBotId=null; renderAdmin(); });
  document.getElementById('sectionSelect')?.addEventListener('change', e=>{ selectedSectionId=e.target.value || null; selectedBotId=null; renderAdmin(); });
  document.getElementById('botSelect')?.addEventListener('change', e=>{ selectedBotId=e.target.value || null; renderEditor(); });
}

function renderEditor(){
  const p = pkg(), s = sec(), b = bot();
  document.getElementById('editor').innerHTML = `
    <div id="adminStatus" class="notice success">جاهز.</div>
    <div class="unified-editor-grid">
      ${editorCard('package', p)}
      ${s ? editorCard('section', s) : emptyCard('section', 'لا يوجد تقسيم بعد', 'أضف تقسيمًا جديدًا من الشريط العلوي أو من زر البطاقة.')}
      ${b ? editorCard('bot', b) : emptyCard('bot', 'لا يوجد بوت بعد', 'اختر تقسيمًا يحتوي على بوتات أو أضف بوتًا جديدًا داخل التقسيم الحالي.')}
    </div>
    <section class="panel image-center">
      <h2>سياسة موحّدة للصور والنصوص</h2>
      <div class="policy-grid">
        <article><b>1. الاسم الأصلي</b><p>ضع الصورة داخل المجلد المناسب، ويمكنك إبقاء اسمها كما هو.</p></article>
        <article><b>2. المسار النسبي</b><p>يحفظ النظام مسار الصورة المكتوب مثل: images/sections/my-image.webp.</p></article>
        <article><b>3. التعديل المستقبلي</b><p>لتغيير الصورة لاحقًا استبدل الملف أو عدّل المسار ثم صدّر JSON.</p></article>
      </div>
    </section>`;
}

function emptyCard(level, title, text){
  const meta = LEVELS[level];
  return `<section class="panel unified-card ${level}">
    <div class="unified-card-head"><span class="level-badge">${meta.label}</span><h2>${title}</h2></div>
    <div class="empty unified-empty">${text}</div>
    <div class="toolbar"><button class="btn primary" type="button" onclick="${level==='section'?'addSection()':'addBot()'}">＋ إضافة ${meta.label}</button></div>
  </section>`;
}

function editorCard(level, item){
  const meta = LEVELS[level];
  const isPackage = level === 'package';
  const isSection = level === 'section';
  const isBot = level === 'bot';
  const saveFn = isPackage ? 'savePackage' : isSection ? 'saveSection' : 'saveBot';
  const addFn = isPackage ? 'addPackage' : isSection ? 'addSection' : 'addBot';
  const prefix = level;
  return `<section class="panel unified-card ${level}">
    <div class="unified-card-head">
      <div><span class="level-badge">${meta.label}</span><h2>تحرير ${meta.label}</h2><p class="small">نفس طريقة الإدراج المعتمدة في كل المستويات.</p></div>
      <button class="btn" type="button" onclick="${addFn}()">＋ إضافة ${meta.label}</button>
    </div>
    <div class="asset-editor">
      ${imageEditor(prefix+'Image', `${meta.label}: الصورة ${meta.ratio}`, item.image || '', meta.color, suggestedPath(level, item))}
      <div class="text-editor">
        ${input(prefix+'Title', `عنوان ${meta.label}`, item.title || '')}
        ${textarea(prefix+'Desc', `وصف ${meta.label}`, item.description || '')}
        ${isBot ? input(prefix+'Chatgpt', 'رابط ChatGPT', item.chatgpt || '') : ''}
        ${isBot ? input(prefix+'Gemini', 'رابط Gemini', item.gemini || '') : ''}
        ${isBot ? textarea(prefix+'Limits', 'حدود البوت', item.limits || '') : ''}
        ${isBot ? textarea(prefix+'Example', 'مثال الاستخدام', item.example || '') : ''}
      </div>
    </div>
    <div class="toolbar unified-save-row"><button class="btn primary" type="button" onclick="${saveFn}()">حفظ ${meta.label}</button><button class="btn" type="button" onclick="adoptCurrentPath('${prefix}Image')">اعتماد المسار</button><button class="btn" type="button" onclick="copyCurrentPath('${prefix}Image')">نسخ المسار</button></div>
  </section>`;
}

function input(id,label,value){ return `<div class="field"><label for="${id}">${label}</label><input id="${id}" value="${escapeHtml(value)}"></div>`; }
function textarea(id,label,value){ return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}">${escapeHtml(value)}</textarea></div>`; }
function imageEditor(id,label,value,ratioClass,suggested){
  value = normalizeImagePathValue(value);
  const safe = escapeHtml(value || '');
  const cls = ratioClass === 'wide' ? 'admin-preview wide' : 'admin-preview square';
  const isBad = /^([a-zA-Z]:\\|[a-zA-Z]:\/|file:)/.test(value||'');
  const cacheSrc = value && !isBad && !value.startsWith('data:') && !/^https?:\/\//.test(value) ? value + (value.includes('?')?'&':'?') + 'v=' + encodeURIComponent(DATA?.updatedAt || '1') : value;
  const preview = value && !isBad ? `<img id="${id}Preview" class="${cls}" src="${escapeHtml(cacheSrc)}" alt="${escapeHtml(label)}" onerror="this.outerHTML='<div id=&quot;${id}Preview&quot; class=&quot;${cls}&quot;>لم تظهر الصورة<br><small>${safe}</small></div>'">` : `<div id="${id}Preview" class="${cls}">${isBad?'مسار Windows غير صالح للنشر':'لا توجد صورة'}</div>`;
  const folder = folderForInput(id);
  return `<div class="asset-box">
    <label class="asset-label" for="${id}">${label}</label>
    ${preview}
    <div class="asset-path-card"><span>مجلد الصورة المعتمد</span><code>${escapeHtml(folder)}/</code><small>ضع الصورة في هذا المجلد، ثم اكتب اسمها/مسارها.</small></div>
    <div class="image-row"><input id="${id}" value="${safe}" placeholder="${escapeHtml(suggested)}" oninput="previewImagePath('${id}')"><label class="btn upload-btn">اختيار صورة<input type="file" accept="image/*" hidden onchange="pickImage(event,'${id}','${ratioClass}')"></label><button class="btn" type="button" onclick="testImagePath('${id}')">اختبار الظهور</button></div>
    <p class="small">ضع الصورة داخل <code>${escapeHtml(folder)}</code>، ثم اعتمد مسارها. لا توجد أسماء مفروضة.</p>
  </div>`;
}

function suggestedPath(level, item){
  const folder = LEVELS[level]?.folder || 'images';
  const name = item?.image ? String(item.image).split('/').pop() : 'اسم-الصورة-الأصلي.webp';
  return `${folder}/${name}`;
}
function folderForInput(id){
  if(String(id).startsWith('package')) return LEVELS.package.folder;
  if(String(id).startsWith('section')) return LEVELS.section.folder;
  return LEVELS.bot.folder;
}

function val(id){ return document.getElementById(id)?.value.trim() || ''; }

function savePackage(){
  const p = pkg(); if(!p) return showStatus('لا توجد باقة للحفظ.', true);
  p.title = val('packageTitle');
  p.description = val('packageDesc');
  p.image = val('packageImage');
  persist('تم حفظ الباقة مؤقتًا. صدّر JSON للحفظ النهائي.');
}
function saveSection(){
  const s = sec(); if(!s) return showStatus('لا يوجد تقسيم للحفظ.', true);
  s.title = val('sectionTitle');
  s.description = val('sectionDesc');
  s.image = val('sectionImage');
  persist('تم حفظ التقسيم مؤقتًا. صدّر JSON للحفظ النهائي.');
}
function saveBot(){
  const b = bot(); if(!b) return showStatus('لا يوجد بوت للحفظ.', true);
  b.title = val('botTitle');
  b.description = val('botDesc');
  b.image = val('botImage');
  b.chatgpt = val('botChatgpt');
  b.gemini = val('botGemini');
  b.limits = val('botLimits');
  b.example = val('botExample');
  persist('تم حفظ البوت مؤقتًا. صدّر JSON للحفظ النهائي.');
}

function addPackage(){
  const title = (prompt('اكتب عنوان الباقة الجديدة:', 'باقة جديدة') || '').trim();
  if(!title) return showStatus('تم إلغاء إضافة الباقة.', true);
  const id = makeUniqueId(DATA.packages, slugify(title) || 'package');
  const p = { id, title, description:'', image:'', sections:[] };
  DATA.packages.push(p);
  selectedPackageId = id; selectedSectionId = null; selectedBotId = null;
  persist('تمت إضافة الباقة: ' + title);
}
function addSection(){
  const p = pkg(); if(!p) return showStatus('أضف باقة أولًا.', true);
  const title = (prompt('اكتب عنوان التقسيم الجديد:', 'تقسيم جديد') || '').trim();
  if(!title) return showStatus('تم إلغاء إضافة التقسيم.', true);
  const id = makeUniqueId(p.sections, slugify(title) || 'section');
  const s = { id, title, description:'', image:'', bots:[] };
  p.sections.push(s);
  selectedSectionId = id; selectedBotId = null;
  persist('تمت إضافة التقسيم: ' + title);
}
function addBot(){
  const s = sec(); if(!s) return showStatus('اختر تقسيمًا أو أضف تقسيمًا أولًا.', true);
  const title = (prompt('اكتب عنوان البوت الجديد:', 'بوت جديد') || '').trim();
  if(!title) return showStatus('تم إلغاء إضافة البوت.', true);
  const id = makeUniqueId(s.bots, slugify(title) || 'bot');
  const b = { id, title, description:'', limits:'', example:'', image:'', chatgpt:'', gemini:'' };
  s.bots.push(b);
  selectedBotId = id;
  persist('تمت إضافة البوت: ' + title);
}

function persist(msg){
  DATA.updatedAt = new Date().toISOString();
  saveData(DATA);
  renderAdmin();
  confirmSave(msg || 'تم الحفظ مؤقتًا.');
}

function showStatus(msg, isError=false){
  const el = document.getElementById('adminStatus');
  if(!el) return;
  el.textContent = msg || '';
  el.className = isError ? 'notice danger' : 'notice success';
}

function confirmSave(msg='تم الحفظ', animate=true){
  showStatus('✓ ' + msg, false);
  if(!animate) return;
  document.body.classList.remove('save-confirm');
  void document.body.offsetWidth;
  document.body.classList.add('save-confirm');
  clearTimeout(window.__saveConfirmTimer);
  window.__saveConfirmTimer = setTimeout(()=>document.body.classList.remove('save-confirm'), 1200);
}

function adoptCurrentPath(inputId){
  const input = document.getElementById(inputId); if(!input) return;
  input.value = normalizeImagePathValue(input.value);
  const value = input.value;
  if(!value) return showStatus('اكتب مسار الصورة أولًا أو اختر صورة باسمها الأصلي.', true);
  if(/^([a-zA-Z]:\\|[a-zA-Z]:\/|file:)/.test(value)) return showStatus('لا تعتمد مسار Windows. استخدم مسارًا نسبيًا داخل images.', true);
  if(!persistImagePathFromInput(inputId)) return showStatus('لم أستطع تحديد العنصر الحالي لحفظ مسار الصورة.', true);
  previewImagePath(inputId);
  confirmSave('تم اعتماد وحفظ مسار الصورة داخل البيانات: ' + value);
}
function copyCurrentPath(inputId){
  const input = document.getElementById(inputId); if(!input) return;
  const text = input.value.trim() || input.placeholder || '';
  copyText(text);
}
function copyText(text){
  if(navigator.clipboard) navigator.clipboard.writeText(text).then(()=>confirmSave('تم نسخ المسار.')).catch(()=>alert(text));
  else alert(text);
}
function previewImagePath(id){
  const input = document.getElementById(id);
  const old = document.getElementById(id+'Preview');
  if(!input || !old) return;
  input.value = normalizeImagePathValue(input.value);
  const value = input.value;
  const cls = old.className;
  if(/^([a-zA-Z]:\\|[a-zA-Z]:\/|file:)/.test(value)){
    old.outerHTML = `<div id="${id}Preview" class="${cls}">مسار Windows لن يعمل بعد النشر</div>`; return;
  }
  if(!value){ old.outerHTML = `<div id="${id}Preview" class="${cls}">لا توجد صورة</div>`; return; }
  const cacheSrc = value.startsWith('data:') || /^https?:\/\//.test(value) ? value : value + (value.includes('?') ? '&' : '?') + 'v=' + encodeURIComponent(DATA?.updatedAt || Date.now());
  old.outerHTML = `<img id="${id}Preview" class="${cls}" src="${escapeHtml(cacheSrc)}" alt="معاينة الصورة" onerror="this.outerHTML='<div id=&quot;${id}Preview&quot; class=&quot;${cls}&quot;>لم تظهر الصورة؛ تحقق من وجود الملف في المسار<br><small>${escapeHtml(value)}</small></div>'">`;
}
async function pickImage(event,id,ratioClass){
  const file = event.target.files?.[0]; if(!file) return;
  const folder = folderForInput(id);
  const path = `${folder}/${file.name}`;
  const input = document.getElementById(id);
  if(input) input.value = normalizeImagePathValue(path);
  const old = document.getElementById(id+'Preview');
  if(old){
    const url = URL.createObjectURL(file);
    old.outerHTML = `<img id="${id}Preview" class="${ratioClass==='wide'?'admin-preview wide':'admin-preview square'}" src="${url}" alt="معاينة الصورة">`;
  }
  persistImagePathFromInput(id);
  confirmSave('تم حفظ مسار الصورة باسمها الأصلي: ' + path + ' — انسخ الملف نفسه داخل هذا المجلد للحفظ الدائم.');
}
function resizeImage(file,maxW,maxH){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = ()=>{
      const img = new Image();
      img.onerror = reject;
      img.onload = ()=>{
        let w = img.width, h = img.height;
        const scale = Math.min(maxW/w, maxH/h, 1);
        w = Math.round(w*scale); h = Math.round(h*scale);
        const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d'); ctx.drawImage(img,0,0,w,h);
        try{ resolve(canvas.toDataURL('image/webp', .82)); }
        catch(e){ resolve(canvas.toDataURL('image/jpeg', .82)); }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}


function testImagePath(id){
  const input = document.getElementById(id);
  if(!input) return;
  input.value = normalizeImagePathValue(input.value);
  const value = input.value;
  if(!value) return showStatus('لا يوجد مسار صورة لاختباره.', true);
  const img = new Image();
  const src = value.startsWith('data:') || /^https?:\/\//.test(value) ? value : value + (value.includes('?') ? '&' : '?') + 'v=' + encodeURIComponent(Date.now());
  img.onload = () => confirmSave('الصورة موجودة وتظهر من هذا المسار: ' + value);
  img.onerror = () => showStatus('الصورة لا تظهر. تأكد أن الملف موجود فعليًا هنا: ' + value, true);
  img.src = src;
}

async function importJSON(input){
  const file = input.files?.[0];
  if(!file) return;
  try{
    const imported = await readProjectDataFile(file);
    if(Array.isArray(imported)){
      throw new Error('يبدو أنك اخترت image-map.json أو ملف خريطة صور، وليس ملف بيانات الباقة.');
    }
    if(imported && imported.type === 'image-map'){
      throw new Error('هذا ملف خريطة صور وليس ملف بيانات الباقة.');
    }
    if(!imported || !Array.isArray(imported.packages)){
      throw new Error('الملف لا يحتوي على الحقل packages المطلوب.');
    }
    const hasResearch = imported.packages.some(p => String(p.title || '').includes('باقة الباحث العلمي') || String(p.id || '').includes('research'));
    if(!hasResearch){
      throw new Error('الملف لا يظهر أنه خاص بباقة الباحث العلمي.');
    }
    DATA = imported;
    ensureDataShape();
    selectedPackageId = null; selectedSectionId = null; selectedBotId = null;
    hydrateSelection();
    saveData(DATA);
    renderAdmin();
    confirmSave('تم استيراد ملف بيانات باقة الباحث العلمي بنجاح، وظهرت حقول الإدراج الآن.');
    input.value = '';
  }catch(e){
    console.error(e);
    alert('تعذر استيراد الملف. السبب: ' + (e.message || 'ملف غير صالح') + '\n\nاختر ملف: data/research-dynamic-data.json');
    input.value = '';
  }
}

function readProjectDataFile(file){
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onload = () => {
      try{
        let text = String(r.result || '').trim();
        if(text.charCodeAt(0) === 0xFEFF) text = text.slice(1).trim();
        // يدعم JSON الصريح
        if(text.startsWith('{') || text.startsWith('[')){
          return resolve(JSON.parse(text));
        }
        // يدعم ملف JS مثل: window.RESEARCH_DATA = {...};
        const match = text.match(/window\.RESEARCH_DATA\s*=\s*([\s\S]*?);?\s*$/);
        if(match){
          return resolve(JSON.parse(match[1]));
        }
        // محاولة استخراج أول كائن JSON من الملف
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if(start !== -1 && end !== -1 && end > start){
          return resolve(JSON.parse(text.slice(start, end + 1)));
        }
        reject(new Error('لا يمكن قراءة بنية JSON من الملف.'));
      }catch(err){
        reject(err);
      }
    };
    r.onerror = () => reject(new Error('تعذر قراءة الملف من الجهاز.'));
    r.readAsText(file, 'utf-8');
  });
}
function downloadImageMap(){
  const rows = [];
  (DATA.packages||[]).forEach(p=>{
    rows.push({type:'package', id:p.id, title:p.title, ratio:'16:9', path:(p.image || suggestedPath('package', p))});
    (p.sections||[]).forEach(s=>{
      rows.push({type:'section', id:s.id, title:s.title, ratio:'1:1', path:(s.image || suggestedPath('section', s))});
      (s.bots||[]).forEach(b=>rows.push({type:'bot', id:b.id, title:b.title, ratio:'1:1', path:(b.image || suggestedPath('bot', b))}));
    });
  });
  downloadJSON(rows, 'image-map.json');
}
function makeUniqueId(list, base){
  base = String(base || 'item').replace(/^-+|-+$/g,'') || 'item';
  const used = new Set((list||[]).map(x=>x.id));
  let id = base, i = 2;
  while(used.has(id)){ id = `${base}-${i++}`; }
  return id;
}
function uniqueId(level, title){ return `${level}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`; }


function escapeJs(s){
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E');
}
