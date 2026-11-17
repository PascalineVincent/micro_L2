/* ============================================================
   Plateforme d'entraînement — moteur (aucune dépendance, hors KaTeX)
   Types d'exercices : num, expr, mcq, click, gchoice, fit, et "parts" (multi-étapes)
   ============================================================ */
(function () {
  'use strict';
  var PV = window.PV = { EX: [], NOTIONS: {}, version: '1.0' };
  var STORE_KEY = 'microplat:v1';

  /* ---------------- utilitaires ---------------- */
  var U = PV.U = {
    pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    shuffle: function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
    // formatage français : 2,5 ; arrondi à 'd' décimales maximum (zéros inutiles supprimés)
    f: function (x, d) {
      d = (d === undefined) ? 3 : d;
      var s = (Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toString();
      return s.replace('.', ',').replace('-', '\u2212');
    },
    clamp: function (x, a, b) { return Math.max(a, Math.min(b, x)); }
  };

  /* ---------------- stockage de la progression ---------------- */
  function loadStore() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; } }
  function saveStore(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) { /* stockage indisponible : on continue sans */ } }
  var store = loadStore();
  function rec(id) { return store[id] || (store[id] = { solved: false, clean: false, wrong: 0, hints: 0, sol: false, tries: 0 }); }
  PV.getStore = function () { return store; };
  PV.resetStore = function () { store = {}; saveStore(store); };

  /* ---------------- analyseur d'expressions littérales ---------------- */
  var FUNCS = { sqrt: Math.sqrt, ln: Math.log, log: Math.log, exp: Math.exp, abs: Math.abs };
  var GREEK = ['alpha', 'beta', 'gamma', 'theta', 'lambda', 'delta', 'epsilon'];
  var GMAP = { '\u03b1': 'alpha', '\u03b2': 'beta', '\u03b3': 'gamma', '\u03b8': 'theta', '\u03bb': 'lambda', '\u03b4': 'delta', '\u03b5': 'epsilon' };

  function normalize(s) {
    s = String(s).replace(/\u2212|\u2013|\u2014/g, '-').replace(/[\u00d7\u00b7\u22c5]/g, '*').replace(/\u00f7/g, '/')
      .replace(/\u00b2/g, '^2').replace(/\u00b3/g, '^3').replace(/\u221a/g, 'sqrt').replace(/\*\*/g, '^');
    s = s.replace(/[\u03b1\u03b2\u03b3\u03b8\u03bb\u03b4\u03b5]/g, function (m) { return GMAP[m]; });
    s = s.replace(/(\d),(\d)/g, '$1.$2');
    s = s.replace(/\[/g, '(').replace(/\]/g, ')').replace(/\{/g, '(').replace(/\}/g, ')');
    return s;
  }
  function tokenize(src) {
    var t = [], i = 0, m;
    while (i < src.length) {
      var ch = src[i];
      if (/\s/.test(ch)) { i++; continue; }
      if ((m = /^\d+(\.\d*)?|^\.\d+/.exec(src.slice(i)))) { t.push({ k: 'num', v: parseFloat(m[0]) }); i += m[0].length; continue; }
      if (/[A-Za-z]/.test(ch)) {
        var rest = src.slice(i).toLowerCase(), done = false, j;
        for (j = 0; j < GREEK.length; j++) if (rest.indexOf(GREEK[j]) === 0) { t.push({ k: 'id', v: GREEK[j] }); i += GREEK[j].length; done = true; break; }
        if (done) continue;
        for (var fn in FUNCS) if (rest.indexOf(fn) === 0) { t.push({ k: 'fn', v: fn }); i += fn.length; done = true; break; }
        if (done) continue;
        t.push({ k: 'id', v: ch }); i++; continue;
      }
      if ('+-*/^(),'.indexOf(ch) >= 0) { t.push({ k: 'op', v: ch }); i++; continue; }
      throw new Error('Caractère non reconnu : « ' + ch + ' »');
    }
    return t;
  }
  // renvoie { fn: (env)->nombre, vars: [noms utilisés] }
  function compile(str) {
    var tk = tokenize(normalize(str)), p = 0, used = {};
    function peek() { return tk[p]; }
    function isOp(v) { return tk[p] && tk[p].k === 'op' && tk[p].v === v; }
    function expr() {
      var l = term();
      while (isOp('+') || isOp('-')) { var o = tk[p++].v, r = term(); l = bin(o, l, r); }
      return l;
    }
    function startsFactor() { var q = tk[p]; return q && (q.k === 'num' || q.k === 'id' || q.k === 'fn' || (q.k === 'op' && q.v === '(')); }
    function term() {
      var l = unary();
      for (;;) {
        if (isOp('*') || isOp('/')) { var o = tk[p++].v, r = unary(); l = bin(o, l, r); }
        else if (startsFactor()) { var r2 = power(); l = bin('*', l, r2); }
        else break;
      }
      return l;
    }
    function unary() {
      if (isOp('-')) { p++; var u = unary(); return function (e) { return -u(e); }; }
      if (isOp('+')) { p++; return unary(); }
      return power();
    }
    function power() {
      var b = atom();
      if (isOp('^')) { p++; var ex = unary(); return function (e) { return Math.pow(b(e), ex(e)); }; }
      return b;
    }
    function atom() {
      var q = tk[p];
      if (!q) throw new Error('Expression incomplète');
      if (q.k === 'num') { p++; return function () { return q.v; }; }
      if (q.k === 'id') { p++; used[q.v] = 1; return function (e) { var v = e[q.v]; if (v === undefined) throw new Error('Variable inconnue : ' + q.v); return v; }; }
      if (q.k === 'fn') {
        p++;
        if (!isOp('(')) throw new Error('Il manque une parenthèse après ' + q.v);
        p++; var a = expr(); if (!isOp(')')) throw new Error('Parenthèse fermante manquante'); p++;
        var f = FUNCS[q.v]; return function (e) { return f(a(e)); };
      }
      if (isOp('(')) { p++; var inner = expr(); if (!isOp(')')) throw new Error('Parenthèse fermante manquante'); p++; return inner; }
      throw new Error('Symbole inattendu : « ' + q.v + ' »');
    }
    function bin(o, l, r) {
      return o === '+' ? function (e) { return l(e) + r(e); } : o === '-' ? function (e) { return l(e) - r(e); } :
        o === '*' ? function (e) { return l(e) * r(e); } : function (e) { return l(e) / r(e); };
    }
    if (!tk.length) throw new Error('Réponse vide');
    var f = expr();
    if (p < tk.length) throw new Error('Symbole inattendu : « ' + tk[p].v + ' »');
    return { fn: f, vars: Object.keys(used) };
  }
  PV.compile = compile;

  function evalNumber(str) {
    var s = String(str).trim().replace(/%$/, '');
    var c = compile(s);
    if (c.vars.length) throw new Error('Une valeur numérique est attendue (pas de lettres).');
    var v = c.fn({});
    if (!isFinite(v)) throw new Error('Valeur non définie');
    return v;
  }
  PV.evalNumber = evalNumber;

  // compare une expression de l'étudiant à une fonction de référence ref(env) sur des tirages aléatoires
  function compareExpr(studentFn, refFn, sampler, n) {
    var ratios = [], allEqual = true, valid = 0;
    for (var i = 0; i < (n || 14); i++) {
      var env = sampler(), r = refFn(env), s;
      if (!isFinite(r)) continue;
      try { s = studentFn(env); } catch (e) { return { equal: false, err: e.message }; }
      valid++;
      if (!isFinite(s) || Math.abs(s - r) > 1e-6 * (1 + Math.abs(r))) allEqual = false;
      if (isFinite(s) && Math.abs(r) > 1e-9) ratios.push(s / r);
    }
    var res = { equal: allEqual && valid > 0, ratio: null };
    if (!res.equal && ratios.length > 3) {
      var r0 = ratios[0], same = ratios.every(function (x) { return Math.abs(x - r0) < 1e-6 * (1 + Math.abs(r0)); });
      if (same) res.ratio = r0;
    }
    return res;
  }

  /* ---------------- tracés (canvas) ---------------- */
  function niceStep(range, target) {
    var raw = range / target, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
    return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * mag;
  }
  function fmtTick(v) { var s = (Math.round(v * 1000) / 1000).toString(); return s.replace('.', ',').replace('-', '\u2212'); }

  function drawPlot(canvas, spec, extra) {
    var W = spec.w || 560, H = spec.h || 340, dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = '100%'; canvas.style.maxWidth = W + 'px';
    var g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    var m = { l: 46, r: 16, t: 14, b: 38 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    var xs = spec, X = function (x) { return m.l + (x - xs.xmin) / (xs.xmax - xs.xmin) * pw; }, Y = function (y) { return m.t + ph - (y - xs.ymin) / (xs.ymax - xs.ymin) * ph; };
    canvas._map = { m: m, pw: pw, ph: ph, W: W, H: H, spec: spec, inv: function (px, py) { return { x: xs.xmin + (px - m.l) / pw * (xs.xmax - xs.xmin), y: xs.ymin + (m.t + ph - py) / ph * (xs.ymax - xs.ymin) }; }, X: X, Y: Y };
    var all = Object.assign({}, spec);
    if (extra) ['shades', 'vlines', 'hlines', 'points', 'texts', 'curves'].forEach(function (k) { all[k] = (spec[k] || []).concat(extra[k] || []); });
    // grille + graduations
    var sx = niceStep(xs.xmax - xs.xmin, 8), sy = niceStep(xs.ymax - xs.ymin, 6), v;
    g.strokeStyle = '#E6EDF4'; g.lineWidth = 1; g.fillStyle = '#6B7A8C'; g.font = '11px sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'top';
    for (v = Math.ceil(xs.xmin / sx) * sx; v <= xs.xmax + 1e-9; v += sx) { g.beginPath(); g.moveTo(X(v), m.t); g.lineTo(X(v), m.t + ph); g.stroke(); g.fillText(fmtTick(v), X(v), m.t + ph + 4); }
    g.textAlign = 'right'; g.textBaseline = 'middle';
    for (v = Math.ceil(xs.ymin / sy) * sy; v <= xs.ymax + 1e-9; v += sy) { g.beginPath(); g.moveTo(m.l, Y(v)); g.lineTo(m.l + pw, Y(v)); g.stroke(); g.fillText(fmtTick(v), m.l - 5, Y(v)); }
    // zones (aires)
    (all.shades || []).forEach(function (s) {
      g.beginPath(); var n = 80, i, x;
      for (i = 0; i <= n; i++) { x = s.x0 + (s.x1 - s.x0) * i / n; g[i ? 'lineTo' : 'moveTo'](X(x), Y(U.clamp(s.f1(x), xs.ymin, xs.ymax))); }
      for (i = n; i >= 0; i--) { x = s.x0 + (s.x1 - s.x0) * i / n; g.lineTo(X(x), Y(U.clamp(s.f2(x), xs.ymin, xs.ymax))); }
      g.closePath(); g.fillStyle = s.color || 'rgba(61,108,153,.25)'; g.fill();
      if (s.label) { g.fillStyle = s.lcolor || '#28496A'; g.font = 'bold 12px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s.label, X(s.lx), Y(s.ly)); }
    });
    // axes
    g.strokeStyle = '#28496A'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(m.l, m.t); g.lineTo(m.l, m.t + ph); g.lineTo(m.l + pw, m.t + ph); g.stroke();
    g.fillStyle = '#28496A'; g.font = '12px sans-serif'; g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText(xs.xlabel || '', W - 4, H - 3);
    g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(xs.ylabel || '', m.l + 6, 1);
    // droites repères
    g.setLineDash([5, 4]); g.lineWidth = 1.1;
    (all.vlines || []).forEach(function (l) { g.strokeStyle = l.color || '#6B7A8C'; g.beginPath(); g.moveTo(X(l.x), Y(l.y0 !== undefined ? l.y0 : xs.ymin)); g.lineTo(X(l.x), Y(l.y1 !== undefined ? l.y1 : xs.ymax)); g.stroke(); if (l.label) { g.fillStyle = l.color || '#6B7A8C'; g.font = '11px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.fillText(l.label, X(l.x), Y(xs.ymin) - 3); } });
    (all.hlines || []).forEach(function (l) { g.strokeStyle = l.color || '#6B7A8C'; g.beginPath(); g.moveTo(X(l.x0 !== undefined ? l.x0 : xs.xmin), Y(l.y)); g.lineTo(X(l.x1 !== undefined ? l.x1 : xs.xmax), Y(l.y)); g.stroke(); if (l.label) { g.fillStyle = l.color || '#6B7A8C'; g.font = '11px sans-serif'; g.textAlign = 'left'; g.textBaseline = 'bottom'; g.fillText(l.label, m.l + 4, Y(l.y) - 2); } });
    g.setLineDash([]);
    // courbes
    (all.curves || []).forEach(function (c) {
      g.strokeStyle = c.color || '#3D6C99'; g.lineWidth = c.w || 2.2; if (c.dash) g.setLineDash(c.dash); g.beginPath();
      var x0 = c.x0 !== undefined ? c.x0 : xs.xmin, x1 = c.x1 !== undefined ? c.x1 : xs.xmax, n = 220, pen = false, lastP = null;
      for (var i = 0; i <= n; i++) {
        var x = x0 + (x1 - x0) * i / n, y = c.f(x);
        if (!isFinite(y) || y < xs.ymin - 1e-9 || y > xs.ymax + 1e-9) { pen = false; continue; }
        g[pen ? 'lineTo' : 'moveTo'](X(x), Y(y)); pen = true; lastP = { x: x, y: y };
      }
      g.stroke(); g.setLineDash([]);
      if (c.label && lastP) {
        g.fillStyle = c.color || '#3D6C99'; g.font = 'bold 12px sans-serif'; g.textAlign = 'left'; g.textBaseline = 'bottom';
        var lp = lastP; if (c.lpos) { var ly = c.f(c.lpos[0]); if (isFinite(ly) && ly >= xs.ymin && ly <= xs.ymax) lp = { x: c.lpos[0], y: ly }; }
        g.fillText(c.label, X(lp.x) + 6, Y(lp.y) - 7);
      }
    });
    // points & textes
    (all.points || []).forEach(function (pt) {
      g.fillStyle = pt.color || '#28496A'; g.beginPath(); g.arc(X(pt.x), Y(pt.y), pt.r || 4.5, 0, 6.2832); g.fill();
      if (pt.label) { g.font = 'bold 12px sans-serif'; g.textAlign = 'left'; g.textBaseline = 'bottom'; g.fillText(pt.label, X(pt.x) + 7, Y(pt.y) - 5); }
    });
    (all.texts || []).forEach(function (t) { g.fillStyle = t.color || '#28496A'; g.font = '12px sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(t.t, X(t.x), Y(t.y)); });
    if (extra && extra.marker) { g.strokeStyle = '#9C5518'; g.lineWidth = 2; var mx = X(extra.marker.x), my = Y(extra.marker.y); g.beginPath(); g.moveTo(mx - 8, my); g.lineTo(mx + 8, my); g.moveTo(mx, my - 8); g.lineTo(mx, my + 8); g.stroke(); g.beginPath(); g.arc(mx, my, 6, 0, 6.2832); g.stroke(); }
  }
  PV.drawPlot = drawPlot;

  /* ---------------- construction du DOM ---------------- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  var MATH_RE = /\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g;
  function typeset(node) {
    if (!window.katex || !node) return;
    var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null), todo = [], n;
    while ((n = walker.nextNode())) { if (n.nodeValue.indexOf('\\(') >= 0 || n.nodeValue.indexOf('\\[') >= 0) { var p = n.parentNode; if (p && !/^(SCRIPT|STYLE|TEXTAREA|CODE)$/.test(p.nodeName) && !(p.closest && p.closest('.katex'))) todo.push(n); } }
    todo.forEach(function (t) {
      var txt = t.nodeValue, frag = document.createDocumentFragment(), last = 0, m; MATH_RE.lastIndex = 0;
      while ((m = MATH_RE.exec(txt))) {
        if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        var holder = document.createElement('span');
        try { holder.innerHTML = window.katex.renderToString(m[1] !== undefined ? m[1] : m[2], { displayMode: m[1] === undefined, throwOnError: false }); } catch (e) { holder.textContent = m[0]; }
        frag.appendChild(holder); last = m.index + m[0].length;
      }
      if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
      t.parentNode.replaceChild(frag, t);
    });
  }
  PV.typeset = typeset;

  function notionLinks(ids) {
    var out = [];
    (ids || []).forEach(function (id) { var n = PV.NOTIONS[id]; if (n) out.push('<a href="cours.html#' + id + '">' + n + '</a>'); });
    return out.length ? '<div class="pv-review">Pour t\u2019aider, revois\u00a0: ' + out.join(' ') + '</div>' : '';
  }

  var KIND_LABEL = { num: 'Num\u00e9rique', expr: 'Litt\u00e9ral', mcq: 'QCM', click: 'Graphique', gchoice: 'Graphique', fit: 'Trac\u00e9', parts: 'Probl\u00e8me' };
  var THEME_LABEL = { conso: 'Consommateur', prod: 'Producteur', marche: 'March\u00e9 concurrentiel', monopole: 'Monopole', societe: 'Soci\u00e9t\u00e9', maths: 'Outils' };

  // ---- Une "partie" = question atomique avec sa logique de vérification ----
  function buildPart(def, P, ctx) {
    var box = el('div', 'pv-part'), nTry = 0, hintIdx = 0, solved = false, selected = null, marker = null, done = false;
    var hints = def.hints ? def.hints(P) : [];
    var stmt = el('div', 'pv-stmt', def.stmt(P)); box.appendChild(stmt);
    var cv = null, ans = null, fbBox = el('div'), hintBox = el('div'), solBox = el('div'), revBox = el('div');

    function plotSpec() { return def.plot ? def.plot(P) : null; }
    function redraw(extra) { if (cv) drawPlot(cv, plotSpec(), extra); }

    // zone de réponse selon le type
    var kind = def.kind, zone = el('div'), row = el('div', 'pv-row'), checkBtn;
    if (def.plot && kind !== 'gchoice') {
      cv = el('canvas', 'pv-canvas' + (kind === 'click' ? '' : ' nocursor')); box.appendChild(cv);
    }
    if (kind === 'num' || kind === 'expr') {
      ans = el('input', 'pv-input'); ans.type = 'text'; ans.autocomplete = 'off'; ans.spellcheck = false;
      ans.placeholder = kind === 'num' ? 'ta r\u00e9ponse (ex. 2,5 ou 8/3)' : (def.placeholder || 'ex. (a-c)/(1+d)');
      row.appendChild(ans);
      if (def.unit) row.appendChild(el('span', 'pv-note', def.unit));
      ans.addEventListener('keydown', function (e) { if (e.key === 'Enter') verify(); });
    } else if (kind === 'mcq') {
      var chs = def.choices(P), order = U.shuffle(chs.map(function (c, i) { return i; })), wrap = el('div', 'pv-choices');
      var gid = 'g' + Math.random().toString(36).slice(2, 8);
      order.forEach(function (oi) {
        var lab = el('label'), inp = el('input'); inp.type = 'radio'; inp.name = gid; inp.value = oi; inp.style.marginRight = '.5rem';
        inp.addEventListener('change', function () { selected = oi; });
        lab.appendChild(inp); var sp = el('span', '', chs[oi]); lab.appendChild(sp); wrap.appendChild(lab);
      });
      zone.appendChild(wrap);
    } else if (kind === 'gchoice') {
      var opts = def.options(P), gw = el('div', 'pv-gchoices'), gid2 = 'g' + Math.random().toString(36).slice(2, 8);
      U.shuffle(opts.map(function (o, i) { return i; })).forEach(function (oi, pos) {
        var lab = el('label'), c2 = el('canvas'), inp = el('input'); inp.type = 'radio'; inp.name = gid2; inp.value = oi; inp.addEventListener('change', function () { selected = oi; });
        var sp = Object.assign({}, opts[oi].plot, { w: 300, h: 200 }); drawPlot(c2, sp);
        lab.appendChild(c2); lab.appendChild(el('div', '', '<small>' + (opts[oi].caption || ('Figure ' + String.fromCharCode(65 + pos))) + '</small>')); lab.appendChild(inp); gw.appendChild(lab);
      });
      zone.appendChild(gw);
    } else if (kind === 'fit') {
      var vals = {}; def.sliders.forEach(function (s) {
        vals[s.id] = s.init; var r = el('div', 'pv-slider'), sl = el('input'); sl.type = 'range'; sl.min = s.min; sl.max = s.max; sl.step = s.step; sl.value = s.init;
        var out = el('span', 'pv-kbd', U.f(s.init, 2)); r.appendChild(el('span', '', s.label)); r.appendChild(sl); r.appendChild(out);
        sl.addEventListener('input', function () { vals[s.id] = parseFloat(sl.value); out.textContent = U.f(vals[s.id], 2); redraw({ curves: [{ f: def.curve(vals, P), color: '#9C5518', label: def.curveLabel || 'ton trac\u00e9' }] }); });
        zone.appendChild(r);
      });
      box._vals = vals;
    }
    box.appendChild(zone);
    checkBtn = el('button', 'pv-btn', kind === 'click' ? 'Valider ce point' : 'V\u00e9rifier'); row.appendChild(checkBtn);
    var hintBtn = el('button', 'pv-btn ghost', 'Indice'); var solBtn = el('button', 'pv-btn ghost', 'Voir la correction');
    row.appendChild(hintBtn); row.appendChild(solBtn);
    box.appendChild(row); box.appendChild(fbBox); box.appendChild(hintBox); box.appendChild(revBox); box.appendChild(solBox);

    // tracé initial + clic
    function baseFit() { return kind === 'fit' ? { curves: [{ f: def.curve(box._vals, P), color: '#9C5518', label: def.curveLabel || 'ton trac\u00e9' }] } : null; }
    if (cv) {
      redraw(baseFit());
      if (kind === 'click') {
        cv.addEventListener('click', function (ev) {
          if (done) return; var r = cv.getBoundingClientRect(), sx = cv._map.W / r.width, sy = cv._map.H / r.height;
          var pt = cv._map.inv((ev.clientX - r.left) * sx, (ev.clientY - r.top) * sy); marker = pt; redraw({ marker: pt });
          fbBox.innerHTML = ''; fbBox.appendChild(el('div', 'pv-fb info', 'Point choisi\u00a0: clique sur \u00ab\u00a0Valider ce point\u00a0\u00bb pour v\u00e9rifier, ou clique ailleurs pour le d\u00e9placer.'));
        });
      }
    }

    function setFb(ok, html) { fbBox.innerHTML = ''; fbBox.appendChild(el('div', 'pv-fb ' + (ok ? 'ok' : 'ko'), html)); typeset(fbBox); }
    function showReview() { revBox.innerHTML = notionLinks(def.notions); }
    function markWrong() {
      nTry++; var r = rec(ctx.id); r.wrong++; r.tries++; saveStore(store); showReview(); ctx.onChange();
    }
    function markSolved() {
      if (solved) return; solved = true; done = true; var r = rec(ctx.id); r.tries++;
      var clean = (nTry === 0 && hintIdx === 0 && !box._sol);
      ctx.partSolved(clean); revBox.innerHTML = '';
      checkBtn.disabled = true; if (ans) ans.disabled = true;
      box.classList.add('pv-done');
    }
    function showSolution() {
      if (!def.steps) return; box._sol = true;
      var r = rec(ctx.id); r.sol = true; saveStore(store);
      var st = def.steps(P); solBox.innerHTML = '<div class="pv-sol"><strong>Correction d\u00e9taill\u00e9e</strong><ol>' + st.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol></div>';
      typeset(solBox); showReview(); ctx.onChange();
      if (cv && def.reveal) redraw(Object.assign({}, def.reveal(P)));
    }

    function verify() {
      if (done) return;
      var ok = false, msg = '';
      try {
        if (kind === 'num') {
          if (!ans.value.trim()) { setFb(false, 'Entre une r\u00e9ponse num\u00e9rique.'); return; }
          var v = evalNumber(ans.value), t = def.answer(P), tol = def.tol || {}, ta = tol.abs !== undefined ? tol.abs : 0.005, tr = tol.rel !== undefined ? tol.rel : 0.01;
          if (Math.abs(v - t) <= Math.max(ta, tr * Math.abs(t))) { ok = true; msg = 'Exact. ' + (def.okMsg ? def.okMsg(P) : ''); }
          else {
            msg = 'Ce n\u2019est pas la bonne valeur.'; var spec = false;
            (def.wrong || []).forEach(function (w) { if (spec) return; var wv = w.v(P); if (Math.abs(v - wv) <= Math.max(ta, tr * Math.abs(wv))) { msg = w.msg; spec = true; } });
            if (!spec) msg += ' V\u00e9rifie les unit\u00e9s, les arrondis (au moins 2 d\u00e9cimales) et reprends le calcul.';
          }
        } else if (kind === 'expr') {
          var comp = compile(ans.value), allowed = def.vars || [];
          for (var i = 0; i < comp.vars.length; i++) if (allowed.indexOf(comp.vars[i]) < 0) throw new Error('Variable non pr\u00e9vue\u00a0: \u00ab\u00a0' + comp.vars[i] + '\u00a0\u00bb. Utilise seulement ' + allowed.join(', ') + '.');
          if (!comp.vars.length) throw new Error('Ta r\u00e9ponse ne contient aucun param\u00e8tre\u00a0: une expression en ' + allowed.join(', ') + ' est attendue.');
          var sampler = function () { return def.sample ? def.sample(P) : defaultSample(allowed); };
          var res = compareExpr(comp.fn, function (e) { return def.ref(e, P); }, sampler);
          if (res.err) throw new Error(res.err);
          if (res.equal) { ok = true; msg = 'Exact\u00a0: ton expression est \u00e9quivalente \u00e0 la r\u00e9ponse attendue.'; }
          else {
            msg = 'Ton expression n\u2019est pas \u00e9quivalente \u00e0 la r\u00e9ponse attendue.';
            var matched = false;
            (def.wrong || []).forEach(function (w) { if (matched) return; var r2 = compareExpr(comp.fn, function (e) { return w.ref(e, P); }, sampler); if (r2.equal) { msg = w.msg; matched = true; } });
            if (!matched && res.ratio !== null && Math.abs(res.ratio - 1) > 1e-6) msg += ' Elle est proportionnelle \u00e0 la bonne r\u00e9ponse (rapport \u2248 ' + U.f(res.ratio, 3) + ')\u00a0: v\u00e9rifie un facteur multiplicatif.';
            if (!matched) msg += ' Astuce\u00a0: mets des parenth\u00e8ses autour des num\u00e9rateurs et d\u00e9nominateurs, ex. <span class="pv-kbd">a/(2*(1+d))</span>.';
          }
        } else if (kind === 'mcq' || kind === 'gchoice') {
          if (selected === null) { setFb(false, 'Choisis une r\u00e9ponse.'); return; }
          var cor = def.correct(P);
          if (selected === cor) { ok = true; msg = 'Exact. ' + (def.okMsg ? def.okMsg(P) : ''); }
          else msg = (def.wrongMsg ? def.wrongMsg(P, selected) : 'Ce n\u2019est pas la bonne r\u00e9ponse.');
        } else if (kind === 'click') {
          if (!marker) { setFb(false, 'Clique d\u2019abord sur le graphique.'); return; }
          var sp0 = plotSpec(), rx = sp0.xmax - sp0.xmin, ry = sp0.ymax - sp0.ymin, tg = def.target(P), tt = def.ptol || { x: 0.04, y: 0.05 };
          var near = function (a, tol) { return Math.sqrt(Math.pow((marker.x - a.x) / rx / (tol.x || tt.x), 2) + Math.pow((marker.y - a.y) / ry / (tol.y || tt.y), 2)) <= 1; };
          if (near(tg, tt)) { ok = true; msg = 'Bien vu. ' + (def.okMsg ? def.okMsg(P) : ''); }
          else { msg = 'Ce n\u2019est pas le bon point.'; var found = false; (def.spots ? def.spots(P) : []).forEach(function (s) { if (!found && near(s, tt)) { msg = s.msg; found = true; } }); }
        } else if (kind === 'fit') {
          var tv = def.fitTarget(P), ft = def.fitTol || 0.15, good = true;
          def.sliders.forEach(function (s) { if (Math.abs(box._vals[s.id] - tv[s.id]) > ft) good = false; });
          if (good) { ok = true; msg = 'Ton trac\u00e9 co\u00efncide avec la bonne courbe.'; } else msg = 'Ton trac\u00e9 ne co\u00efncide pas encore. Rappelle-toi que la demande inverse est l\u2019utilit\u00e9 marginale\u00a0: \\(P(q)=u\u2019(q)\\).';
        }
      } catch (e) { setFb(false, e.message); return; }
      if (ok) {
        if (def.reveal && cv) redraw(def.reveal(P));
        setFb(true, msg); markSolved();
      } else { setFb(false, msg); markWrong(); }
    }

    checkBtn.addEventListener('click', verify);
    hintBtn.addEventListener('click', function () {
      if (!hints.length) { hintBox.innerHTML = '<div class="pv-hint">Pas d\u2019indice pour cette question\u00a0: regarde les notions li\u00e9es.</div>'; showReview(); typeset(hintBox); return; }
      if (hintIdx < hints.length) { var d = el('div', 'pv-hint', '<strong>Indice ' + (hintIdx + 1) + '/' + hints.length + '</strong> \u2014 ' + hints[hintIdx]); hintBox.appendChild(d); hintIdx++; var r = rec(ctx.id); r.hints++; saveStore(store); typeset(d); showReview(); ctx.onChange(); }
      else { var d2 = el('div', 'pv-hint', 'Plus d\u2019indice. Tu peux consulter la correction d\u00e9taill\u00e9e.'); hintBox.appendChild(d2); }
    });
    solBtn.addEventListener('click', function () { showSolution(); });
    if (!def.steps) solBtn.style.display = 'none';
    typeset(box);
    box._solved = function () { return solved; };
    box._lock = function (lock) { box.classList.toggle('locked', lock); };
    return box;
  }
  function defaultSample(vars) { var e = {}; vars.forEach(function (v) { e[v] = 0.8 + Math.random() * 4.5; }); return e; }

  // ---- Carte d'exercice (peut contenir plusieurs parties) ----
  function buildCard(ex, onChange) {
    var card = el('div', 'pv-card'), P = ex.gen ? ex.gen() : {};
    var head = el('div', 'pv-head');
    head.appendChild(el('span', 'pv-badge kind', ex.parts ? 'Probl\u00e8me' : (KIND_LABEL[ex.kind] || ex.kind)));
    head.appendChild(el('span', 'pv-badge', THEME_LABEL[ex.theme] || ex.theme));
    head.appendChild(el('span', 'pv-title', ex.title));
    var state = el('span', 'pv-state', ''); head.appendChild(state); card.appendChild(head);
    if (ex.intro) card.appendChild(el('div', 'pv-stmt', ex.intro(P)));
    var partsWrap = el('div', 'pv-parts'); card.appendChild(partsWrap);
    var defs = ex.parts || [ex], built = [], nSolved = 0, allClean = true;
    function refreshState() {
      var r = rec(ex.id);
      state.textContent = r.solved ? (r.clean ? '\u2605 r\u00e9ussi du premier coup' : '\u2713 r\u00e9ussi') : (r.wrong ? '\u00e0 retravailler' : '');
      card.classList.toggle('solved', !!r.solved); card.classList.toggle('failed', !r.solved && r.wrong > 0);
    }
    defs.forEach(function (d, i) {
      var ctx = {
        id: ex.id, onChange: function () { saveStore(store); refreshState(); onChange(); },
        partSolved: function (clean) {
          nSolved++; if (!clean) allClean = false;
          if (built[i + 1]) built[i + 1]._lock(false);
          if (nSolved === defs.length) { var r = rec(ex.id); r.solved = true; r.clean = r.clean || (allClean && !r.sol && r.wrong === 0); saveStore(store); }
          refreshState(); onChange();
        }
      };
      var part = buildPart(Object.assign({ notions: ex.notions, theme: ex.theme }, d), P, ctx);
      if (d.label) { var lbl = el('div', 'pv-note', '<strong>' + d.label + '</strong>'); part.insertBefore(lbl, part.firstChild); }
      built.push(part); partsWrap.appendChild(part); if (i > 0) part._lock(true);
    });
    if (!ex.parts) partsWrap.firstChild.style.borderTop = 'none';
    var tools = el('div', 'pv-row'); var nb = el('button', 'pv-btn ghost', 'Nouvelle instance (autres valeurs)');
    nb.addEventListener('click', function () { var n = buildCard(ex, onChange); card.replaceWith(n); typeset(n); });
    if (ex.gen) tools.appendChild(nb); card.appendChild(tools);
    refreshState(); typeset(card);
    card._built = built; card._P = P;
    return card;
  }
  PV.buildCard = buildCard;

  /* ---------------- progression ---------------- */
  function levelStats(level) {
    var list = PV.EX.filter(function (e) { return e.level === level; }), s = 0, st = 0;
    list.forEach(function (e) { var r = store[e.id]; if (r && r.solved) { s++; if (r.clean) st++; } });
    return { total: list.length, solved: s, stars: st, pct: list.length ? Math.round(100 * s / list.length) : 0 };
  }
  PV.levelStats = levelStats;
  function weakNotions() {
    var cnt = {};
    PV.EX.forEach(function (e) {
      var r = store[e.id]; if (!r) return;
      var struggle = (r.wrong > 0 && !r.solved) || (r.sol && !r.clean) || r.wrong >= 2;
      if (struggle) (e.notions || []).forEach(function (n) { cnt[n] = (cnt[n] || 0) + 1 + r.wrong * 0.2; });
    });
    return Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; });
  }
  PV.weakNotions = weakNotions;

  function summaryText() {
    var lines = ['Bilan \u2014 Micro\u00e9conomie (plateforme d\u2019entra\u00eenement)', 'Date\u00a0: ' + new Date().toLocaleDateString('fr-FR')];
    for (var l = 1; l <= 4; l++) { var s = levelStats(l); lines.push('Niveau ' + l + '\u00a0: ' + s.solved + '/' + s.total + ' r\u00e9ussis (' + s.stars + ' du premier coup)'); }
    var w = weakNotions().map(function (id) { return PV.NOTIONS[id] || id; });
    lines.push('Notions \u00e0 revoir\u00a0: ' + (w.length ? w.join(', ') : 'aucune pour l\u2019instant'));
    return lines.join('\n');
  }

  /* ---------------- pages ---------------- */
  function renderLevelPage(host) {
    var level = parseInt(host.getAttribute('data-level'), 10), list = PV.EX.filter(function (e) { return e.level === level; });
    var top = el('div'); host.appendChild(top);
    var cardsHost = el('div'); host.appendChild(cardsHost);
    function refreshTop() {
      var s = levelStats(level), prev = level > 1 ? levelStats(level - 1) : null, html = '';
      html += '<div class="pv-card"><div class="pv-row" style="justify-content:space-between"><div><strong>Ta progression au niveau ' + level + '</strong> \u2014 ' + s.solved + '/' + s.total + ' exercices r\u00e9ussis (' + s.stars + ' \u2605)</div></div><div class="pv-bar"><span style="width:' + s.pct + '%"></span></div></div>';
      if (prev && prev.pct < 60) html += '<div class="pv-gate"><strong>Conseil\u00a0:</strong> tu n\u2019as r\u00e9ussi que ' + prev.pct + '\u00a0% du niveau ' + (level - 1) + '. Il est recommand\u00e9 d\u2019atteindre 60\u00a0% avant d\u2019aborder celui-ci (rien n\u2019est bloqu\u00e9\u00a0: tu restes libre).</div>';
      var w = weakNotions(); if (w.length) html += '<div class="pv-key pv-weak"><strong class="t">Notions \u00e0 revoir\u00a0:</strong> ' + w.slice(0, 5).map(function (id) { return '<a href="cours.html#' + id + '">' + (PV.NOTIONS[id] || id) + '</a>'; }).join(' \u00b7 ') + '</div>';
      top.innerHTML = html;
    }
    refreshTop();
    var cur = null;
    list.forEach(function (ex) {
      if (ex.section && ex.section !== cur) { cur = ex.section; cardsHost.appendChild(el('h2', 'pv-sectionh', ex.section)); }
      cardsHost.appendChild(buildCard(ex, refreshTop));
    });
    var nav = el('div', 'pv-toolbar');
    if (level < 4) nav.innerHTML = '<a class="pv-btn" style="text-decoration:none" href="niveau' + (level + 1) + '.html">Niveau suivant \u2192</a>';
    host.appendChild(nav);
  }

  function renderDashboard(host) {
    function draw() {
      var html = '<div class="pv-levels">';
      var meta = [['Niveau 1', 'Calculs num\u00e9riques', 'Appliquer une formule \u00e0 des valeurs'], ['Niveau 2', 'Lire et tracer', 'Cliquer, lire, tracer sur un graphique'], ['Niveau 3', 'Calculs litt\u00e9raux', 'D\u00e9montrer en fonction des param\u00e8tres'], ['Niveau 4', 'Probl\u00e8mes de synth\u00e8se', 'Encha\u00eener et interpr\u00e9ter']];
      for (var l = 1; l <= 4; l++) { var s = levelStats(l); html += '<div class="pv-level"><h3><a href="niveau' + l + '.html">' + meta[l - 1][0] + ' \u2014 ' + meta[l - 1][1] + '</a></h3><small>' + meta[l - 1][2] + '</small><div class="pv-bar" style="margin:.6rem 0 .3rem"><span style="width:' + s.pct + '%"></span></div><small>' + s.solved + '/' + s.total + ' r\u00e9ussis \u00b7 ' + s.stars + ' \u2605</small></div>'; }
      html += '</div>';
      var w = weakNotions();
      html += '<div class="pv-key pv-weak"><strong class="t">Notions \u00e0 revoir\u00a0:</strong> ' + (w.length ? w.slice(0, 6).map(function (id) { return '<a href="cours.html#' + id + '">' + (PV.NOTIONS[id] || id) + '</a>'; }).join(' \u00b7 ') : 'rien \u00e0 signaler pour l\u2019instant \u2014 commence par le niveau 1.') + '</div>';
      html += '<div class="pv-toolbar"><button class="pv-btn ghost" id="pv-copy">Copier mon bilan (texte)</button><button class="pv-btn ghost" id="pv-reset">R\u00e9initialiser ma progression</button></div><div id="pv-copyfb" class="pv-note"></div>';
      host.innerHTML = html;
      document.getElementById('pv-copy').addEventListener('click', function () {
        var t = summaryText(), fb = document.getElementById('pv-copyfb');
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { fb.textContent = 'Bilan copi\u00e9 \u2014 tu peux le coller dans un message \u00e0 ton enseignant.'; }, function () { fb.textContent = t; });
        else fb.textContent = t;
      });
      document.getElementById('pv-reset').addEventListener('click', function () { if (confirm('Effacer toute ta progression sur cet appareil ?')) { PV.resetStore(); draw(); } });
    }
    draw();
  }

  function init() {
    var lv = document.getElementById('pv-level'); if (lv) renderLevelPage(lv);
    var db = document.getElementById('pv-dashboard'); if (db) renderDashboard(db);
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }
  PV.init = init;
  function withKatex(cb) {
    if (window.katex) return cb();
    var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'assets/katex/katex.min.css'; document.head.appendChild(css);
    var sc = document.createElement('script'); sc.src = 'assets/katex/katex.min.js'; sc.onload = cb; sc.onerror = cb; document.head.appendChild(sc);
  }
  window.addEventListener('load', function () { setTimeout(function () { withKatex(init); }, 0); });
})();
