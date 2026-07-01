
let DATA;
document.addEventListener('DOMContentLoaded', async()=>{
  DATA=await loadData();
  window.__DATA_VERSION__ = DATA?.updatedAt || Date.now();
  route();
  window.addEventListener('hashchange', route);
});

function currentPackageId(){
  const id = new URLSearchParams(location.search).get('package');
  return id || getPackage(DATA)?.id;
}

function route(){
  if(location.pathname.endsWith('package.html')) return renderSections();
  if(location.pathname.endsWith('bots.html')) return renderBots();
  renderHome();
}

function packageBotCount(pkg){
  return (pkg.sections||[]).reduce((n,s)=>n+(s.bots||[]).length,0);
}

function renderHome(){
  const root=document.getElementById('app');
  const packages=DATA.packages||[];
  const totalSections = packages.reduce((n,p)=>n+(p.sections||[]).length,0);
  const totalBots = packages.reduce((n,p)=>n+packageBotCount(p),0);
  root.innerHTML=`
    <section class="hero portal-hero">
      <div class="shell">
        <div class="portal-title">
          <span class="chip">${packages.length} باقات قابلة للتوسع</span>
          <h2>بوابة النماذج الذكية</h2>
          <p>واجهة عامة لتنظيم الباقات، ثم الانتقال إلى تقسيمات كل باقة، ثم الوصول إلى البوتات التابعة لها.</p>
          <div class="portal-summary">
            <span class="chip">الباقات: ${packages.length}</span>
            <span class="chip">التقسيمات الحالية: ${totalSections}</span>
            <span class="chip">البوتات الحالية: ${totalBots}</span>
          </div>
        </div>
      </div>
    </section>
    <section class="shell">
      <div class="section-head">
        <div>
          <h2>الباقات</h2>
          <p>اختر الباقة المطلوبة. اختر الباقة المطلوبة، ثم ادخل إلى تقسيماتها، وبعدها اختر التقسيم للوصول إلى البوتات التابعة له.</p>
        </div>
      </div>
      <div class="toolbar"><input class="search" id="pkgSearch" placeholder="ابحث في الباقات..."></div>
      <div id="packagesGrid" class="grid"></div>
    </section>`;
  const draw=()=>{
    const q=(document.getElementById('pkgSearch')?.value||'').trim();
    const items=packages.filter(p=>!q||p.title.includes(q)||String(p.description||'').includes(q));
    document.getElementById('packagesGrid').innerHTML=items.length?items.map(p=>`
      <article class="card package-card" onclick="location.href='package.html?package=${encodeURIComponent(p.id)}'">
        ${imageOrPlaceholder(p.image,p.title,'media-wide')}
        <div class="card-body">
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.description||'')}</p>
          <div class="chips"><span class="chip">${(p.sections||[]).length} تقسيم</span><span class="chip">${packageBotCount(p)} بوت</span></div>
          <div class="card-cta"><span class="btn primary">الدخول للتقسيمات</span></div>
        </div>
      </article>`).join(''):`<div class="empty">لا توجد باقات مطابقة.</div>`;
  };
  document.getElementById('pkgSearch').addEventListener('input',draw);
  draw();
}

function renderSections(){
  const pkg=getPackage(DATA,currentPackageId());
  const root=document.getElementById('app');
  if(!pkg){
    root.innerHTML=`<section class="shell"><div class="empty">لم يتم العثور على الباقة. <a class="btn" href="index.html">العودة للباقات</a></div></section>`;
    return;
  }
  root.innerHTML=`
    <section class="shell">
      <div class="section-head">
        <div>
          <span class="chip">الباقة المختارة</span>
          <h2>${escapeHtml(pkg.title)}</h2>
          <p>${escapeHtml(pkg.description||'اختر تقسيمًا للوصول إلى البوتات التابعة له.')}</p>
        </div>
        <div class="toolbar"><a class="btn" href="index.html">العودة للباقات</a><span class="btn primary no-pointer">الدخول للتقسيمات</span></div>
      </div>
      <div class="toolbar"><input class="search" id="q" placeholder="ابحث في التقسيمات..."></div>
      <div id="sections" class="grid"></div>
    </section>`;
  const draw=()=>{
    const q=document.getElementById('q').value.trim();
    const sections=(pkg.sections||[]);
    const items=sections.filter(s=>!q||s.title.includes(q)||String(s.description||'').includes(q));
    document.getElementById('sections').innerHTML=items.length?items.map(s=>`
      <article class="card" onclick="location.href='bots.html?package=${encodeURIComponent(pkg.id)}&section=${encodeURIComponent(s.id)}'">
        ${imageOrPlaceholder(s.image,s.title,'media-square')}
        <div class="card-body">
          <h3>${escapeHtml(s.title)}</h3>
          <p>${escapeHtml(s.description||'')}</p>
          <div class="chips"><span class="chip">${(s.bots||[]).length} بوت</span></div>
          <div class="card-cta"><span class="btn primary">الدخول للبوتات</span></div>
        </div>
      </article>`).join(''):`<div class="empty">لم تُدرج تقسيمات هذه الباقة بعد. يمكن إضافتها لاحقًا من ملف البيانات أو من أداة الإدارة المستقلة.</div>`;
  };
  document.getElementById('q').addEventListener('input',draw);
  draw();
}

function renderBots(){
  const params=new URLSearchParams(location.search);
  const pkgId=params.get('package') || currentPackageId();
  const id=params.get('section');
  const pkg=getPackage(DATA,pkgId);
  const section=findSection(DATA,id,pkgId);
  const root=document.getElementById('app');
  if(!section){
    root.innerHTML=`<section class="shell"><div class="empty">لم يتم العثور على التقسيم. <a class="btn" href="package.html?package=${encodeURIComponent(pkgId||'')}">العودة للتقسيمات</a></div></section>`;
    return;
  }
  root.innerHTML=`<section class="shell"><div class="section-head"><div><span class="chip">${escapeHtml(pkg?.title||'')}</span><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.description||'')}</p></div><a class="btn" href="package.html?package=${encodeURIComponent(pkgId||'')}">العودة للتقسيمات</a></div><div class="toolbar"><input class="search" id="q" placeholder="ابحث في البوتات..."><select class="btn" id="limit"><option value="6">6 بوتات</option><option value="9">9 بوتات</option><option value="12">12 بوتًا</option><option value="999">الكل</option></select></div><div id="bots" class="grid"></div><div class="toolbar" id="pager"></div></section>`;
  let page=1;
  const draw=()=>{
    const q=document.getElementById('q').value.trim();
    const limit=+document.getElementById('limit').value;
    const all=(section.bots||[]).filter(b=>!q||b.title.includes(q)||String(b.description||'').includes(q));
    const pages=Math.max(1,Math.ceil(all.length/limit)); page=Math.min(page,pages);
    const slice=all.slice((page-1)*limit,page*limit);
    document.getElementById('bots').innerHTML=slice.length?slice.map(b=>`<article class="card bot-card">${imageOrPlaceholder(b.image,b.title,'media-square')}<div class="card-body"><h3>${escapeHtml(b.title)}</h3><p>${escapeHtml(b.description||'')}</p><div class="bot-actions"><button onclick='showDetails(${JSON.stringify(b).replace(/'/g,"&#039;")})'>وصف البوت</button>${b.chatgpt?`<a class="primary" target="_blank" rel="noopener" href="${escapeHtml(b.chatgpt)}">ChatGPT</a>`:''}${b.gemini?`<a target="_blank" rel="noopener" href="${escapeHtml(b.gemini)}">Gemini</a>`:''}</div></div></article>`).join(''):`<div class="empty">لا توجد بوتات مطابقة.</div>`;
    document.getElementById('pager').innerHTML=pages>1?`<button class="btn" ${page<=1?'disabled':''} onclick="page--;(${draw})()">السابق</button><span class="chip">صفحة ${page} من ${pages}</span><button class="btn" ${page>=pages?'disabled':''} onclick="page++;(${draw})()">التالي</button>`:'';
  };
  document.getElementById('q').addEventListener('input',()=>{page=1;draw()});
  document.getElementById('limit').addEventListener('change',()=>{page=1;draw()});
  draw();
}

function showDetails(b){
  const m=document.getElementById('modal');
  m.classList.add('open');
  m.innerHTML=`<div class="modal-box"><button class="btn" onclick="document.getElementById('modal').classList.remove('open')">إغلاق</button><h2>${escapeHtml(b.title)}</h2><p>${escapeHtml(b.description||'')}</p><h3>الحدود</h3><p>${escapeHtml(b.limits||'غير مدرج.')}</p><h3>مثال الاستخدام</h3><p>${escapeHtml(b.example||'غير مدرج.')}</p></div>`;
}
