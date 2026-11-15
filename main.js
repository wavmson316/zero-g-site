
(function(){
  var html=document.documentElement;
  try{ document.body.classList.add('loaded'); }catch(e){}
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hoverOK=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var isZh=(html.lang||'').toLowerCase().indexOf('zh')===0;

  /* scroll progress */
  var bar=document.createElement('div');bar.className='progress';document.body.appendChild(bar);
  function updateBar(){
    var h=document.documentElement;
    var max=h.scrollHeight-h.clientHeight;
    var p=max>0?Math.min(1,Math.max(0,h.scrollTop/max)):0;
    bar.style.transform='scaleX('+p+')';
  }

  /* reveal on scroll, staggered per parent */
  var items=[].slice.call(document.querySelectorAll('.reveal'));
  if(reduce||!('IntersectionObserver' in window)){
    items.forEach(function(el){el.classList.add('in');});
  }else{
    var counts=new Map();
    items.forEach(function(el){
      var p=el.parentElement, i=counts.get(p)||0;
      counts.set(p,i+1);
      el.style.transitionDelay=Math.min(i,5)*80+'ms';
    });
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },{rootMargin:'0px 0px -10% 0px',threshold:.06});
    items.forEach(function(el){io.observe(el);});
  }

  /* parallax on the hero figure */
  var figs=[].slice.call(document.querySelectorAll('.figure img'));
  var ticking=false;
  function onScroll(){
    updateBar();
    if(reduce||!figs.length||ticking) return;
    ticking=true;
    requestAnimationFrame(function(){
      ticking=false;
      var vh=window.innerHeight;
      figs.forEach(function(img){
        var host=img.parentElement;
        var r=host.getBoundingClientRect();
        if(r.bottom<-200||r.top>vh+200) return;
        var p=((r.top+r.height/2)-vh/2)/vh;
        img.style.transform='translate3d(0,'+(-p*46).toFixed(2)+'px,0)';
      });
    });
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll);
  onScroll();

  if(reduce) return;

  /* magnetic buttons */
  if(hoverOK){
    [].slice.call(document.querySelectorAll('.btn')).forEach(function(b){
      b.classList.add('mag');
      b.addEventListener('mousemove',function(e){
        var r=b.getBoundingClientRect();
        var x=(e.clientX-r.left-r.width/2)/r.width*16;
        var y=(e.clientY-r.top-r.height/2)/r.height*16;
        b.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px)';
      });
      b.addEventListener('mouseleave',function(){b.style.transform='';});
    });

  }

  /* pause video when off screen */
  var vids=[].slice.call(document.querySelectorAll('video'));
  if(vids.length&&'IntersectionObserver' in window){
    var vio=new IntersectionObserver(function(es){
      es.forEach(function(e){
        var v=e.target;
        if(e.isIntersecting){ if(v.paused){ var pr=v.play(); if(pr&&pr.catch)pr.catch(function(){}); } }
        else if(!v.paused){ v.pause(); }
      });
    },{threshold:.08});
    vids.forEach(function(v){vio.observe(v);});
  }

  /* mobile menu */
  var toggle=document.querySelector('.menu-toggle'), menu=document.querySelector('.mobile-menu');
  if(toggle&&menu){
    var close=function(){
      menu.classList.remove('open'); toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
      document.body.style.overflow='';
      document.body.classList.remove('menu-open');
    };
    toggle.addEventListener('click',function(){
      var open=menu.classList.toggle('open');
      toggle.classList.toggle('is-open',open);
      toggle.setAttribute('aria-expanded',open?'true':'false');
      document.body.classList.toggle('menu-open',open);
      document.body.style.overflow=open?'hidden':'';
    });
    [].slice.call(menu.querySelectorAll('a')).forEach(function(a){
      a.addEventListener('click',function(){ setTimeout(close,120); });
    });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
    window.addEventListener('resize',function(){ if(window.innerWidth>760) close(); });
  }

  /* page transitions */
  document.addEventListener('click',function(e){
    var a=e.target.closest?e.target.closest('a'):null;
    if(!a) return;
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.button!==0) return;
    if(a.target==='_blank') return;
    var href=a.getAttribute('href')||'';
    if(href.indexOf('mailto:')===0||href.indexOf('tel:')===0||href.indexOf('#')===0) return;
    if(!/\.html(\?|#|$)/.test(href)) return;
    var url=new URL(a.href,location.href);
    if(url.href.split('#')[0]===location.href.split('#')[0]) return;
    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(function(){location.href=url.href;},260);
  });
})();
