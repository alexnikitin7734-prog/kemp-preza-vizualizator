(function () {
  var stage = document.getElementById('stage'), slides = [].slice.call(document.querySelectorAll('.slide'));
  var pager = document.getElementById('pager'), black = document.getElementById('black'), nump = document.getElementById('nump');
  var deck = document.getElementById('deck'), rows = [].slice.call(deck.children), ledger = stage.querySelector('.ledger');
  var demo = document.getElementById('demo'), music = document.getElementById('music');
  var cur = -1, outT, demoT, last = slides.length - 1;
  if (/still/.test(location.search)) document.documentElement.classList.add('still');

  // строки сметы: на заставке стоят таблицей, дальше разлетаются мини-слайдами по краям и меняются местами
  var EDGE = [[-120, -172], [420, -170], [1050, -174], [1450, -172], [1878, 260], [1880, 640], [1000, 1018], [620, 1016], [-318, 600], [-320, 240]];
  var NW = ['72%', '55%', '80%', '62%', '48%', '76%', '58%', '68%'];
  function place(i) {
    deck.classList.toggle('cards', i > 0);
    rows.forEach(function (d, j) {
      var x, y, w, h, r = 0;
      if (i === 0) { x = 1060; y = 250 + j * 78; w = 780; h = 62; }
      else { var p = EDGE[(j * 3 + i * 7) % EDGE.length]; x = p[0]; y = p[1]; w = 360; h = 203; r = ((j * 7 + i * 3) % 9 - 4) * 2.5; }
      d.style.cssText = '--x:' + x + 'px;--y:' + y + 'px;--w:' + w + 'px;--h:' + h + 'px;--r:' + r + 'deg;--nw:' + NW[j] + ';--dl:' + (j * 0.06) + 's;--a:' + (i === 3 ? 0 : 1);
    });
    ledger.style.setProperty('--ly', (i * 23 % 64) + 'px');
    ledger.style.setProperty('--lx', (-i * 41 % 320) + 'px');
    stage.style.setProperty('--p', (i / last * 100) + '%');
    var hero = i === 0, spot = SPOT[i];
    stage.classList.toggle('hero', hero);
    stage.style.setProperty('--lgx', (hero ? 96 : spot ? spot[0] : 1746) + 'px');
    stage.style.setProperty('--lgy', (hero ? 190 : spot ? spot[1] : 64) + 'px');
    stage.style.setProperty('--lw', (hero ? 150 : spot ? spot[2] : 104) + 'px');
  }

  // на титуле логотип перелетает в карточку команды
  var SPOT = {};
  // каждая карточка сначала появляется строкой сметы и разворачивается в своё место
  function prep() {
    slides.forEach(function (s, i) {
      var sp = s.querySelector('.logo-spot');
      if (sp) { var r = sp.getBoundingClientRect(), b = stage.getBoundingClientRect(), k = b.width / 1920; SPOT[i] = [(r.left - b.left) / k, (r.top - b.top) / k, r.width / k]; }
      var grid = s.querySelector('.grid'); if (!grid) return;
      var cs = [].slice.call(s.querySelectorAll('.c')), solid = cs.filter(function (c) { return !c.classList.contains('bare'); });
      var top0 = 540 - solid.length * 72 / 2;
      cs.forEach(function (c, k) {
        c.style.setProperty('--dl', (0.15 + k * 0.09) + 's');
        var n = solid.indexOf(c); if (n < 0) return;
        var x = grid.offsetLeft + c.offsetLeft, y = grid.offsetTop + c.offsetTop;
        c.style.setProperty('--fx', (70 - x) + 'px');
        c.style.setProperty('--fy', (top0 + n * 72 - y) + 'px');
        c.style.setProperty('--sx', 1780 / c.offsetWidth);
        c.style.setProperty('--sy', 52 / c.offsetHeight);
      });
    });
  }

  function fit() {
    var k = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = 'scale(' + k + ') translate(-50%, -50%)';
  }

  function go(i) {
    i = Math.max(0, Math.min(last, i));
    if (i === cur) return;
    var first = cur < 0;
    if (cur >= 0) {
      var old = slides[cur];
      old.classList.remove('on'); old.classList.add('out');
      clearTimeout(outT);
      outT = setTimeout(function () { slides.forEach(function (s) { if (!s.classList.contains('on')) s.classList.remove('out'); }); }, 900);
    }
    cur = i;
    slides[i].classList.remove('out');
    if (first) stage.classList.add('boot');
    place(i);
    if (first) requestAnimationFrame(function () { requestAnimationFrame(function () { stage.classList.remove('boot'); }); });
    setTimeout(function () { if (cur === i) slides[i].classList.add('on'); }, first ? 0 : 380);
    [].forEach.call(pager.children, function (d, k) { d.classList.toggle('on', k === i - 1); });
    nump.textContent = i ? (i < 10 ? '0' + i : i) + ' / 10' : '';
    history.replaceState(null, '', location.search + '#' + i);
    clearTimeout(demoT);
    if (slides[i].contains(demo)) { demo.pause(); demo.currentTime = 0; demoT = setTimeout(function () { demo.play().catch(function () {}); }, 1600); }
    else demo.pause();
    sync();
  }

  // музыка — петля «хулиган качает». Браузер не даёт звук без действия человека, поэтому старт с первого нажатия.
  // Молчит на чёрном экране и на слайде с роликом, M — выключить или включить совсем
  var started = false, musicOn = true, fadeT, VOL = .4;
  music.volume = 0;
  function sync() {
    var want = started && musicOn && black.hidden && cur >= 0 && !slides[cur].classList.contains('silent');
    clearInterval(fadeT);
    if (want && music.paused) music.play().catch(function () {});
    fadeT = setInterval(function () {
      var v = music.volume + (want ? .02 : -.03);
      if (want && v >= VOL) { music.volume = VOL; clearInterval(fadeT); return; }
      if (!want && v <= 0) { music.volume = 0; music.pause(); clearInterval(fadeT); return; }
      music.volume = Math.max(0, Math.min(VOL, v));
    }, 40);
  }
  function wake() { if (!started) { started = true; sync(); } }

  addEventListener('keydown', function (e) {
    var k = e.key;
    wake();
    if (k === 'm' || k === 'M' || k === 'ь' || k === 'Ь') { musicOn = !musicOn; sync(); return; }
    if (k === 'b' || k === 'B' || k === 'и' || k === 'И' || k === '.' || k === 'ю') {
      black.hidden = !black.hidden;
      if (!black.hidden) demo.pause(); else if (slides[cur].contains(demo)) demo.play().catch(function () {});
      sync(); return;
    }
    if (k === 'F5' || k === 'f' || k === 'F' || k === 'а' || k === 'А') {
      e.preventDefault();
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {}); else document.exitFullscreen();
      return;
    }
    if (!black.hidden) { black.hidden = true; sync(); }
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].indexOf(k) >= 0) { e.preventDefault(); go(cur + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].indexOf(k) >= 0) { e.preventDefault(); go(cur - 1); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(last);
  });
  addEventListener('pointerdown', function (e) {
    wake();
    if (e.button !== 0) return;
    if (!black.hidden) { black.hidden = true; sync(); return; }
    go(cur + 1);
  });

  var hideT;
  addEventListener('mousemove', function () {
    document.body.classList.add('mouse');
    clearTimeout(hideT); hideT = setTimeout(function () { document.body.classList.remove('mouse'); }, 1500);
  });
  addEventListener('resize', fit);
  addEventListener('hashchange', function () { go(parseInt(location.hash.slice(1), 10) || 0); });
  fit();
  for (var p = 1; p <= last; p++) pager.appendChild(document.createElement('i'));
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
    prep();
    go(parseInt(location.hash.slice(1), 10) || 0);
  });
})();
