(function(){
  'use strict';
  var links=[
    ['لينكدين','https://www.linkedin.com/in/ArabAIModels','in',false],
    ['يوتيوب','https://www.youtube.com/@ArabAIModels','▶',false],
    ['فيس بوك','https://www.facebook.com/ArabAIModels','f',false],
    ['منصة X','https://x.com/arabaimodels','𝕏',false],
    ['انستغرام','https://www.instagram.com/ArabAIModels','◎',false],
    ['تيك توك','https://www.tiktok.com/@ArabAIModels','♪',false],
    ['تليغرام','https://t.me/ArabAIModels','✈',false],
    ['سناب شات','https://www.snapchat.com/@arabaimodels','◌',false],
    ['واتساب','https://wa.me/966552191598','☏',true],
    ['البريد الإلكتروني','mailto:zraieee@gmail.com','✉',false],
    ['باي بال','https://www.paypal.com/paypalme/zraiee','$',false],
    ['سكول','https://www.skool.com/zraiee-3956/about','S',false]
  ];
  function el(tag, cls, text){var e=document.createElement(tag); if(cls)e.className=cls; if(text!=null)e.textContent=text; return e;}
  function buildStaticSocialBar(){
    var footerShell=document.querySelector('footer.footer .shell');
    if(!footerShell || footerShell.dataset.smartSocialFooter==='static-bottom') return;
    footerShell.textContent='';
    var panel=el('section','smart-social-footer-panel');
    panel.setAttribute('aria-label','منطقة روابط التواصل الاجتماعي');
    var head=el('div','smart-social-footer-panel__head');
    head.appendChild(el('strong','smart-social-footer-panel__title','تواصل معنا'));
    head.appendChild(el('span','smart-social-footer-panel__subtitle','روابط رسمية في شريط سفلي مستقل'));
    var dock=el('nav','smart-social-dock smart-social-dock--static');
    dock.setAttribute('aria-label','أيقونات وسائل التواصل الاجتماعي الرسمية');
    var label=el('div','smart-social-dock__label','وسائل التواصل');
    var list=el('div','smart-social-dock__links');
    links.forEach(function(item){
      var a=el('a','smart-social-link',item[2]);
      a.href=item[1]; a.setAttribute('aria-label',item[0]); a.setAttribute('title',item[0]);
      if(item[3]) a.setAttribute('data-primary','true');
      if(item[1].indexOf('mailto:')!==0){a.target='_blank'; a.rel='noopener noreferrer';}
      list.appendChild(a);
    });
    dock.appendChild(label); dock.appendChild(list);
    var copy=el('div','smart-social-footer-copy','© بوابة النماذج الذكية - 2026 - جميع الحقوق محفوظة.');
    panel.appendChild(head); panel.appendChild(dock); panel.appendChild(copy);
    footerShell.appendChild(panel);
    footerShell.dataset.smartSocialFooter='static-bottom';
    document.documentElement.classList.add('has-static-social-footer');
    document.documentElement.classList.remove('has-bottom-social-dock');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',buildStaticSocialBar,{once:true}); else buildStaticSocialBar();
})();
