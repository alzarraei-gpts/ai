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
  function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
  function buildDock(){
    if(document.querySelector('.smart-social-dock')) return;
    var dock=el('aside','smart-social-dock');
    dock.setAttribute('aria-label','روابط التواصل الاجتماعي الرسمية');
    dock.appendChild(el('div','smart-social-dock__label','تواصل'));
    var list=el('nav','smart-social-dock__links');
    list.setAttribute('aria-label','أيقونات وسائل التواصل');
    links.forEach(function(item){
      var a=el('a','smart-social-link',item[2]);
      a.href=item[1];
      a.setAttribute('aria-label',item[0]);
      a.setAttribute('title',item[0]);
      if(item[3]) a.setAttribute('data-primary','true');
      if(item[1].indexOf('mailto:')!==0){a.target='_blank';a.rel='noopener noreferrer';}
      list.appendChild(a);
    });
    dock.appendChild(list);
    document.body.appendChild(dock);
  }
  function tuneFooter(){
    var footer=document.querySelector('footer.footer .shell');
    if(!footer || footer.dataset.smartSocialFooter) return;
    footer.textContent='';
    var wrap=el('div','smart-social-footer');
    wrap.appendChild(el('span','smart-social-footer__text','© بوابة النماذج الذكية - 2026 - جميع الحقوق محفوظة.'));
    footer.appendChild(wrap);
    footer.dataset.smartSocialFooter='1';
  }
  function run(){buildDock();tuneFooter();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();
