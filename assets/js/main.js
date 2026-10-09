(function(){
  "use strict";
  document.documentElement.classList.add("js");
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- BOOT ---------- */
  var boot = document.getElementById("boot");
  var seen = false;
  try{ seen = sessionStorage.getItem("tsiolkovsky_boot") === "1"; }catch(e){}
  function killBoot(){
    if(!boot) return;
    boot.classList.add("off");
    setTimeout(function(){ if(boot) boot.hidden = true; }, 520);
    try{ sessionStorage.setItem("tsiolkovsky_boot","1"); }catch(e){}
  }
  if(seen || RM){ boot.hidden = true; }
  else{
    setTimeout(killBoot, 2000);
    document.getElementById("bootSkip").addEventListener("click", killBoot);
    document.addEventListener("keydown", function k(e){
      if(e.key === "Enter" || e.key === "Escape"){ killBoot(); document.removeEventListener("keydown", k); }
    });
  }

  /* ---------- HEADER / DRAWER / STICKY ---------- */
  var hdr = document.getElementById("hdr");
  var sticky = document.getElementById("stickyCta");
  function onScroll(){
    var y = window.scrollY;
    hdr.classList.toggle("stuck", y > 40);
    sticky.classList.toggle("on", y > 700);
  }
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  var drawer = document.getElementById("drawer");
  function setDrawer(v){ drawer.setAttribute("data-open", v ? "true" : "false"); }
  document.getElementById("burger").addEventListener("click", function(){ setDrawer(true); });
  document.getElementById("drawerClose").addEventListener("click", function(){ setDrawer(false); });
  drawer.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", function(){ setDrawer(false); }); });

  /* ---------- REVEAL ---------- */
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  }, {rootMargin:"0px 0px -8% 0px", threshold:.06}) : null;
  document.querySelectorAll(".rv").forEach(function(el){ io ? io.observe(el) : el.classList.add("in"); });

  /* ---------- COUNTERS ---------- */
  function animateCount(el){
    var target = parseFloat(el.getAttribute("data-count"));
    if(RM){ el.textContent = target; return; }
    var t0 = null, dur = 1100;
    function step(ts){
      if(!t0) t0 = ts;
      var p = Math.min((ts - t0)/dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e);
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var cio = ("IntersectionObserver" in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); } });
  }, {threshold:.5}) : null;
  document.querySelectorAll("[data-count]").forEach(function(el){ cio ? cio.observe(el) : (el.textContent = el.getAttribute("data-count")); });

  /* ---------- PRICING SWITCH ---------- */
  var PRICE = {
    standard:{
      wd:{h1:130,h3:360,h5:550,places:7},
      we:{h1:150,h3:420,h5:650,places:7}
    },
    comfort:{
      wd:{h1:150,h3:420,h5:650,places:10},
      we:{h1:170,h3:480,h5:750,places:10}
    },
    vip:{
      wd:{h1:200,h3:570,h5:900,places:10},
      we:{h1:230,h3:660,h5:1050,places:10}
    },
    ps5:{
      wd:{h1:300,h3:750,h5:1000,places:4},
      we:{h1:350,h3:900,h5:1250,places:4}
    }
  };
  var state = {zone:"standard", day:"wd"};
  function fmt(n){ return n.toLocaleString("ru-RU").replace(/ /g," "); }
  function renderPrices(){
    var base = PRICE[state.zone][state.day];
    Object.keys(base).forEach(function(k){
      var el = document.querySelector('[data-p="'+k+'"]');
      if(!el) return;
      el.textContent = base[k] == null ? "—" : fmt(base[k]);
    });
  }
  document.querySelectorAll(".switch button").forEach(function(b){
    b.addEventListener("click", function(){
      var grp = b.parentElement;
      grp.querySelectorAll("button").forEach(function(x){ x.setAttribute("aria-pressed","false"); });
      b.setAttribute("aria-pressed","true");
      if(b.dataset.zone) state.zone = b.dataset.zone;
      if(b.dataset.day) state.day = b.dataset.day;
      renderPrices();
    });
  });
  renderPrices();

  /* ---------- MARQUEE: duplicate track for seamless loop ---------- */
  var mq = document.getElementById("mq");
  if(mq) mq.innerHTML += mq.innerHTML;

  /* ---------- CARD TILT ---------- */
  if(!RM && window.matchMedia("(pointer:fine)").matches){
    document.querySelectorAll(".tilt").forEach(function(card){
      card.addEventListener("mousemove", function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left)/r.width - .5;
        var py = (e.clientY - r.top)/r.height - .5;
        card.style.transform = "perspective(900px) rotateY("+(px*6)+"deg) rotateX("+(-py*6)+"deg) translateY(-6px)";
      });
      card.addEventListener("mouseleave", function(){ card.style.transform = ""; });
    });
  }



  /* ---------- HERO CANVAS FX ---------- */
  var cv = document.getElementById("fx");
  if(cv && !RM && window.matchMedia("(min-width:701px)").matches){
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var parts = [];
    function resize(){
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W*dpr; cv.height = H*dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      var n = Math.round(Math.min(W*H/9000, 130));
      parts = [];
      for(var i=0;i<n;i++){
        parts.push({
          x:Math.random()*W, y:Math.random()*H,
          z:Math.random()*.8+.2,
          r:Math.random()*1.7+.4,
          vy:-(Math.random()*.32+.07),
          vx:(Math.random()-.5)*.12,
          c:Math.random() > .62 ? "255,30,147" : "34,240,255",
          a:Math.random()*.5+.18
        });
      }
    }
    resize();
    window.addEventListener("resize", resize);

    var t = 0, mx = .5, my = .5;
    cv.parentElement.addEventListener("mousemove", function(e){
      var r = cv.getBoundingClientRect();
      mx = (e.clientX - r.left)/r.width;
      my = (e.clientY - r.top)/r.height;
    });

    function grid(){
      /* perspective floor grid, slowly scrolling toward viewer */
      var hz = H*0.58;
      ctx.lineWidth = 1;
      var off = (t*0.5) % 44;
      for(var i=0;i<16;i++){
        var yy = hz + Math.pow(i + off/44, 2.15) * 3.2;
        if(yy > H+4) break;
        var alpha = Math.max(0, .17 * (1 - (yy-hz)/(H-hz)));
        ctx.strokeStyle = "rgba(34,240,255,"+alpha.toFixed(3)+")";
        ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke();
      }
      var vpx = W*(0.5 + (mx-.5)*0.08);
      for(var k=-14;k<=14;k++){
        var xb = vpx + k*(W/9);
        ctx.strokeStyle = "rgba(34,240,255,0.055)";
        ctx.beginPath(); ctx.moveTo(vpx + k*10, hz); ctx.lineTo(xb, H); ctx.stroke();
      }
    }

    function frame(){
      t += 1;
      ctx.clearRect(0,0,W,H);
      /* perspective grid intentionally disabled */
      for(var i=0;i<parts.length;i++){
        var p = parts[i];
        p.y += p.vy * p.z * 2.1;
        p.x += p.vx + (mx-.5)*0.28*p.z;
        if(p.y < -8){ p.y = H+8; p.x = Math.random()*W; }
        if(p.x < -8) p.x = W+8;
        if(p.x > W+8) p.x = -8;
        var fl = .78 + Math.sin((t+i*17)*0.045)*.22;
        ctx.beginPath();
        ctx.fillStyle = "rgba("+p.c+","+(p.a*fl).toFixed(3)+")";
        ctx.arc(p.x, p.y, p.r*p.z, 0, 6.2832);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }


  /* ---------- ZONE LOADOUT SELECTOR ---------- */
  var ZONES = {
    standard:{
      code:"SECTOR 01 // STANDARD",
      title:"STANDARD",
      desc:"7 игровых ПК.",
      price:"130",
      places:"7 PC",
      render:"zone-standard",
      slot:"<b>IMG 02 · STANDARD</b>Арт / фото зоны Standard. Для изображения: интерьер или игрок справа, HUD-safe зона снизу-слева, cinematic cyberpunk, 16:10.",
      oneWd:"130 ₽",
      oneWe:"150 ₽",
      three:"360 / 420 ₽",
      five:"550 / 650 ₽",
      cta:"Выбрать Standard",
      accent:"#19E6FF"
    },
    comfort:{
      code:"SECTOR 02 // COMFORT",
      title:"COMFORT",
      desc:"10 игровых ПК.",
      price:"150",
      places:"10 PC",
      render:"zone-comfort",
      slot:"<b>IMG 03 · COMFORT</b>Арт / фото зоны Comfort: более премиальный интерьер, мягкий cyan-magenta свет, 16:10.",
      oneWd:"150 ₽",
      oneWe:"170 ₽",
      three:"420 / 480 ₽",
      five:"650 / 750 ₽",
      cta:"Выбрать Comfort",
      accent:"#55F0FF"
    },
    vip:{
      code:"SECTOR 03 // VIP",
      title:"VIP",
      desc:"10 игровых ПК по тарифной сетке клуба.",
      price:"200",
      places:"10 PC",
      render:"zone-vip",
      slot:"<b>IMG 04 · VIP</b>Арт / фото VIP: приватный тёмный интерьер, магента + violet ambient, premium cyberpunk, 16:10.",
      oneWd:"200 ₽",
      oneWe:"230 ₽",
      three:"570 / 660 ₽",
      five:"900 / 1 050 ₽",
      cta:"Выбрать VIP",
      accent:"#FF2B88"
    },
    ps5:{
      code:"SECTOR 04 // PS5",
      title:"PS5",
      desc:"4 консоли с современными играми.",
      price:"300",
      places:"4 PS5",
      render:"zone-ps5",
      slot:"<b>IMG 05 · PLAYSTATION 5</b>Арт / фото консольной зоны: динамика футбола / файтинга / гонок, neon cyberpunk, 16:10.",
      oneWd:"300 ₽",
      oneWe:"350 ₽",
      three:"750 / 900 ₽",
      five:"1 000 / 1 250 ₽",
      cta:"Забронировать PS5",
      accent:"#7A63FF"
    }
  };

  var zoneConsole = document.getElementById("zoneConsole");
  var zoneTabs = document.querySelectorAll(".zone-tab");
  function setZone(key){
    var z = ZONES[key];
    if(!z) return;

    zoneTabs.forEach(function(btn){
      var active = btn.dataset.zoneKey === key;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    if(zoneConsole) zoneConsole.style.setProperty("--zone-accent", z.accent);

    var media = document.getElementById("zoneStageMedia");
    if(media) {
      media.setAttribute("data-render", z.render);
      media.querySelectorAll("[data-zone-photo]").forEach(function(img){
        img.hidden = img.getAttribute("data-zone-photo") !== key;
      });
    }

    var map = {
      zoneCode:z.code,
      zoneStageTitle:z.title,
      zoneStageDesc:z.desc,
      zoneStagePrice:z.price,
      zonePlaces:z.places,
      zone1wd:z.oneWd,
      zone1we:z.oneWe,
      zone3h:z.three,
      zone5h:z.five
    };
    Object.keys(map).forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.textContent = map[id];
    });

    var cta = document.getElementById("zoneStageCta");
    if(cta){
      cta.childNodes[0].nodeValue = z.cta;
    }
  }

  zoneTabs.forEach(function(btn){
    btn.addEventListener("click", function(){ setZone(btn.dataset.zoneKey); });
  });
  setZone("standard");


  /* ---------- REVIEWS CAROUSEL ---------- */
  var reviewsCarousel = document.getElementById("reviewsCarousel");
  var reviewsPrev = document.getElementById("reviewsPrev");
  var reviewsNext = document.getElementById("reviewsNext");

  function reviewStep(){
    if(!reviewsCarousel) return 0;
    var card = reviewsCarousel.querySelector(".rev");
    if(!card) return reviewsCarousel.clientWidth;
    var styles = window.getComputedStyle(reviewsCarousel);
    var gap = parseFloat(styles.columnGap || styles.gap || 0) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  if(reviewsPrev && reviewsCarousel){
    reviewsPrev.addEventListener("click", function(){
      reviewsCarousel.scrollBy({left:-reviewStep(), behavior:"smooth"});
    });
  }
  if(reviewsNext && reviewsCarousel){
    reviewsNext.addEventListener("click", function(){
      reviewsCarousel.scrollBy({left:reviewStep(), behavior:"smooth"});
    });
  }


  /* ---------- DOCUMENT MODALS ---------- */
  var activeDocModal = null;
  var activeDocTrigger = null;

  function openDocModal(modal, trigger){
    if(!modal) return;
    activeDocModal = modal;
    activeDocTrigger = trigger || null;
    modal.hidden = false;
    modal.setAttribute("aria-hidden","false");
    document.body.classList.add("doc-modal-open");
    requestAnimationFrame(function(){
      modal.classList.add("is-open");
      var panel = modal.querySelector(".doc-modal__panel");
      if(panel) panel.focus({preventScroll:true});
    });
  }

  function closeDocModal(modal){
    modal = modal || activeDocModal;
    if(!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden","true");
    document.body.classList.remove("doc-modal-open");
    setTimeout(function(){
      modal.hidden = true;
      if(activeDocTrigger && document.contains(activeDocTrigger)){
        activeDocTrigger.focus({preventScroll:true});
      }
      if(activeDocModal === modal) activeDocModal = null;
      activeDocTrigger = null;
    },230);
  }

  document.querySelectorAll("[data-doc-modal]").forEach(function(trigger){
    trigger.addEventListener("click", function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      var modal = document.getElementById(trigger.getAttribute("data-doc-modal"));
      openDocModal(modal, trigger);
    });
  });

  document.querySelectorAll("[data-doc-close]").forEach(function(closeEl){
    closeEl.addEventListener("click", function(){
      closeDocModal(closeEl.closest(".doc-modal"));
    });
  });

  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && activeDocModal){
      closeDocModal(activeDocModal);
    }
  });

  /* ---------- SMOOTH ANCHORS ---------- */
  document.querySelectorAll('a[href^="#"]:not([data-doc-modal])').forEach(function(a){
    a.addEventListener("click", function(e){
      var id = a.getAttribute("href");
      if(id.length < 2) return;
      var el = document.querySelector(id);
      if(!el) return;
      e.preventDefault();
      el.scrollIntoView({behavior: RM ? "auto" : "smooth", block:"start"});
    });
  });
})();
