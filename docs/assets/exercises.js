/* ============================================================
   Banque d'exercices — issue des TD 1 et 2 et des compléments.
   Niveau 1 : numérique  |  2 : graphique  |  3 : littéral  |  4 : problèmes de synthèse
   ============================================================ */
(function () {
  'use strict';
  var PV = window.PV, U = PV.U, f = U.f, pick = U.pick;

  PV.NOTIONS = {
    'maths-deriv': 'D\u00e9riv\u00e9es et primitives',
    'maths-log': 'Logarithmes et exponentielles',
    'maths-opt': 'Optimiser une fonction',
    'syntaxe': 'Saisir une expression',
    'quasi': 'Utilit\u00e9 quasi-lin\u00e9aire',
    'demande': 'Fonction de demande',
    'elasticite': '\u00c9lasticit\u00e9-prix',
    'surplus': 'Surplus du consommateur',
    'graph': 'Lire un graphique',
    'couts': 'Co\u00fbts moyen et marginal',
    'echelle': 'Rendements d\u2019\u00e9chelle',
    'concurrence': '\u00c9quilibre concurrentiel',
    'bienetre': 'Bien-\u00eatre et optimum social',
    'monopole': 'Monopole',
    'perte': 'Perte s\u00e8che',
    'pdg': 'Objectif du dirigeant (\u03b8)'
  };

  var add = function (ex) { PV.EX.push(ex); };
  var ex = function (id, level, theme, section, title, notions, def) { def.id = id; def.level = level; def.theme = theme; def.section = section; def.title = title; def.notions = notions; add(def); };
  var S1 = 'Le consommateur', S2 = 'Le producteur', S3 = 'March\u00e9 concurrentiel et monopole', S4 = 'La soci\u00e9t\u00e9 (bien-\u00eatre)';
  var M = function (s) { return '\\(' + s + '\\)'; };

  // ---------- fonctions communes (monopole : P(q)=a-q, C=cq+(d/2)q^2) ----------
  var T = {
    qc: function (a, c, d) { return (a - c) / (1 + d); }, pc: function (a, c, d) { return a - (a - c) / (1 + d); },
    qm: function (a, c, d) { return (a - c) / (2 + d); }, pm: function (a, c, d) { return a - (a - c) / (2 + d); }
  };
  function mkt(a, c, d, extra) {
    var sp = { xmin: 0, xmax: a, ymin: 0, ymax: Math.round(a * 1.1), xlabel: 'q', ylabel: 'p',
      curves: [{ f: function (q) { return a - q; }, color: '#3D6C99', label: 'D = P(q)', lpos: [a * 0.12] }, { f: function (q) { return c + d * q; }, color: '#9C5518', label: 'Cm', lpos: [a * 0.93] }] };
    return Object.assign(sp, extra || {});
  }
  var abcd = [[10, 2, 1], [10, 2, 3], [12, 2, 1], [14, 2, 2], [14, 2, 3], [12, 4, 3], [10, 4, 2]];
  var abcdM = [[10, 2, 2], [14, 2, 1], [12, 2, 3], [14, 4, 3], [10, 2, 0], [16, 4, 2]];

  /* =========================== NIVEAU 1 =========================== */
  ex('n1-01', 1, 'conso', S1, 'Demande d\u2019un consommateur quadratique', ['quasi', 'demande', 'maths-deriv'], {
    kind: 'num',
    gen: function () { var a = pick([4, 6, 8, 10]); return { a: a, p: pick([1, 2, 3].filter(function (x) { return x < a; })) }; },
    stmt: function (P) { return 'Un consommateur a l\u2019utilit\u00e9 quasi-lin\u00e9aire ' + M('u(x)=x(a-x)') + ' avec ' + M('a=' + P.a) + ' (consommation ' + M('x\\le a/2') + '). Quelle quantit\u00e9 demande-t-il au prix ' + M('p=' + P.p) + '\u00a0?'; },
    answer: function (P) { return (P.a - P.p) / 2; },
    hints: function () { return ['Le consommateur ach\u00e8te jusqu\u2019\u00e0 ce que l\u2019utilit\u00e9 marginale \u00e9gale le prix\u00a0: ' + M('u\u2032(x)=p') + '.', 'Ici ' + M('u(x)=ax-x^2') + ', donc ' + M('u\u2032(x)=a-2x') + '.']; },
    steps: function (P) { return ['Utilit\u00e9 marginale\u00a0: ' + M('u\u2032(x)=a-2x') + '.', 'Condition ' + M('u\u2032(x)=p') + '\u00a0: ' + M('a-2x=p\\Rightarrow x=\\dfrac{a-p}{2}') + '.', 'Application\u00a0: ' + M('x=\\dfrac{' + P.a + '-' + P.p + '}{2}=' + f((P.a - P.p) / 2) + '') + '.']; },
    wrong: [{ v: function (P) { return P.a - P.p; }, msg: 'Tu as r\u00e9solu ' + M('a-x=p') + '. L\u2019utilit\u00e9 marginale est ' + M('a-2x') + ' (d\u00e9rive bien ' + M('ax-x^2') + ').' }]
  });
  ex('n1-02', 1, 'conso', S1, 'Pr\u00e9f\u00e9rences Cobb-Douglas \u2014 demande', ['quasi', 'demande', 'maths-deriv'], {
    kind: 'num',
    gen: function () { return { p: pick([0.25, 0.5, 1, 2]) }; },
    stmt: function (P) { return 'Utilit\u00e9 ' + M('u(x)=x^{\\alpha}') + ' avec ' + M('\\alpha=1/2') + '. La demande est ' + M('D(p)=\\left(\\dfrac{\\alpha}{p}\\right)^{\\frac{1}{1-\\alpha}}') + '. Calcule ' + M('D(' + f(P.p) + ')') + '.'; },
    answer: function (P) { return Math.pow(0.5 / P.p, 2); },
    hints: function () { return ['Avec ' + M('\\alpha=1/2') + ', l\u2019exposant ' + M('\\frac{1}{1-\\alpha}') + ' vaut\u00a0?']; },
    steps: function (P) { return ['' + M('\\frac{1}{1-\\alpha}=\\frac{1}{1/2}=2') + '.', M('D(p)=\\left(\\dfrac{1/2}{p}\\right)^2=\\dfrac{1}{4p^2}') + '.', 'Pour ' + M('p=' + f(P.p)) + '\u00a0: ' + M('D=' + f(Math.pow(0.5 / P.p, 2), 4)) + '.']; },
    wrong: [{ v: function (P) { return 0.5 / P.p; }, msg: 'Tu as calcul\u00e9 ' + M('\\alpha/p') + '\u00a0; il reste \u00e0 \u00e9lever \u00e0 la puissance ' + M('\\frac{1}{1-\\alpha}=2') + '.' }]
  });
  ex('n1-03', 1, 'conso', S1, '\u00c9lasticit\u00e9 d\u2019une demande lin\u00e9aire', ['elasticite', 'maths-deriv'], {
    kind: 'num',
    gen: function () { var a = pick([6, 8, 10]); return { a: a, p: pick([2, 3, 4, 5].filter(function (x) { return x < a; })) }; },
    stmt: function (P) { return 'Pour ' + M('D(p)=a-p') + ' avec ' + M('a=' + P.a) + ', calcule l\u2019\u00e9lasticit\u00e9-prix ' + M('\\varepsilon=-\\dfrac{p}{D(p)}D\u2032(p)') + ' au prix ' + M('p=' + P.p) + '.'; },
    answer: function (P) { return P.p / (P.a - P.p); },
    hints: function () { return ['' + M('D\u2032(p)=-1') + ', donc le signe \u00ab\u00a0\u2212\u00a0\u00bb de la d\u00e9finition donne une \u00e9lasticit\u00e9 positive.']; },
    steps: function (P) { return [M('D\u2032(p)=-1') + '.', M('\\varepsilon=-\\dfrac{p}{a-p}\\times(-1)=\\dfrac{p}{a-p}') + '.', M('\\varepsilon=\\dfrac{' + P.p + '}{' + P.a + '-' + P.p + '}=' + f(P.p / (P.a - P.p)) + '') + '.']; },
    wrong: [{ v: function (P) { return (P.a - P.p) / P.p; }, msg: 'Tu as invers\u00e9 le rapport\u00a0: c\u2019est ' + M('p/D(p)') + ', pas ' + M('D(p)/p') + '.' }, { v: function (P) { return -P.p / (P.a - P.p); }, msg: 'Le signe \u00ab\u00a0\u2212\u00a0\u00bb de la d\u00e9finition compense celui de ' + M('D\u2032') + '\u00a0: ' + M('\\varepsilon') + ' est positive.' }]
  });
  ex('n1-04', 1, 'conso', S1, 'Surplus pour une demande lin\u00e9aire', ['surplus', 'graph', 'maths-deriv'], {
    kind: 'num',
    gen: function () { var a = pick([6, 8, 10]); return { a: a, p: pick([2, 3, 4].filter(function (x) { return x < a; })) }; },
    stmt: function (P) { return 'Pour ' + M('D(p)=a-p') + ' avec ' + M('a=' + P.a) + ', calcule le surplus du consommateur ' + M('\\mathrm{Sc}') + ' au prix ' + M('p=' + P.p) + ' (aire sous la demande, au-dessus du prix).'; },
    answer: function (P) { return (P.a - P.p) * (P.a - P.p) / 2; },
    hints: function () { return ['Dans le plan ' + M('(q,p)') + ', c\u2019est un triangle\u00a0: base ' + M('q=D(p)') + ', hauteur ' + M('a-p') + '.']; },
    steps: function (P) { var q = P.a - P.p; return ['Quantit\u00e9 achet\u00e9e\u00a0: ' + M('q=D(' + P.p + ')=' + q) + '.', 'Triangle\u00a0: base ' + M(q) + ' et hauteur ' + M(P.a + '-' + P.p + '=' + q) + '.', M('\\mathrm{Sc}=\\tfrac12\\times' + q + '\\times' + q + '=' + f(q * q / 2)) + '.']; },
    wrong: [{ v: function (P) { return (P.a - P.p) * (P.a - P.p); }, msg: 'Il manque le facteur ' + M('\\tfrac12') + ' de l\u2019aire du triangle.' }]
  });
  ex('n1-05', 1, 'conso', S1, 'Surplus pour des pr\u00e9f\u00e9rences logarithmiques', ['surplus', 'quasi', 'maths-log'], {
    kind: 'num',
    gen: function () { return { p: pick([0.25, 0.4, 0.5]) }; },
    stmt: function (P) { return 'Utilit\u00e9 ' + M('u(x)=\\ln(1+x)') + ' (\u00ab\u00a0' + M('\\beta=1') + '\u00a0\u00bb). La demande est ' + M('D(p)=\\dfrac1p-1') + '. Calcule le surplus ' + M('\\mathrm{Sc}=U(q)-U(0)-pq') + ' au prix ' + M('p=' + f(P.p)) + '.'; },
    answer: function (P) { return Math.log(1 / P.p) - 1 + P.p; },
    tol: { abs: 0.006 },
    hints: function () { return ['Calcule d\u2019abord ' + M('q=D(p)') + ', puis ' + M('U(q)=\\ln(1+q)') + '.', 'Remarque\u00a0: ' + M('1+q=1/p') + '.']; },
    steps: function (P) { var q = 1 / P.p - 1; return ['' + M('q=\\dfrac1p-1=' + f(q)) + '.', M('U(q)=\\ln(1+q)=\\ln(1/p)=' + f(Math.log(1 / P.p), 4)) + ', ' + M('U(0)=0') + '.', 'D\u00e9pense\u00a0: ' + M('pq=' + f(P.p) + '\\times' + f(q) + '=' + f(P.p * q, 4)) + '.', M('\\mathrm{Sc}=' + f(Math.log(1 / P.p), 4) + '-' + f(P.p * q, 4) + '=' + f(Math.log(1 / P.p) - 1 + P.p, 4)) + '.']; },
    wrong: [{ v: function (P) { return Math.log(1 / P.p); }, msg: 'Tu as calcul\u00e9 ' + M('U(q)-U(0)') + '\u00a0; il faut encore retrancher la d\u00e9pense ' + M('pq') + '.' }]
  });
  ex('n1-06', 1, 'conso', S1, '\u00c9lasticit\u00e9 constante (Cobb-Douglas)', ['elasticite', 'demande'], {
    kind: 'num',
    gen: function () { var al = pick([[0.5, '1/2'], [2 / 3, '2/3'], [0.75, '3/4']]); return { al: al[0], lab: al[1] }; },
    stmt: function (P) { return 'Pour ' + M('u(x)=x^{\\alpha}') + ' avec ' + M('\\alpha=' + P.lab) + ', la demande est ' + M('D(p)=(\\alpha/p)^{\\frac1{1-\\alpha}}') + '. Calcule l\u2019\u00e9lasticit\u00e9-prix (elle ne d\u00e9pend pas de ' + M('p') + ').'; },
    answer: function (P) { return 1 / (1 - P.al); },
    hints: function () { return ['Pour ' + M('D=Kp^{-m}') + ', on a ' + M('D\u2032=-mKp^{-m-1}') + ' donc ' + M('\\varepsilon=m') + '. Ici ' + M('m=\\frac{1}{1-\\alpha}') + '.']; },
    steps: function (P) { return ['' + M('D(p)=Kp^{-m}') + ' avec ' + M('m=\\dfrac{1}{1-\\alpha}') + '.', M('\\varepsilon=-\\dfrac{p}{D}D\u2032=-\\dfrac{p}{Kp^{-m}}(-mKp^{-m-1})=m') + '.', M('\\varepsilon=\\dfrac{1}{1-' + P.lab + '}=' + f(1 / (1 - P.al)) + '') + '.']; }
  });
  ex('n1-07', 1, 'prod', S2, 'Fonction de co\u00fbt \u00e0 un facteur', ['couts', 'echelle'], {
    kind: 'num',
    gen: function () { return { w: pick([2, 3, 4, 5]), q: pick([4, 9, 16, 25]) }; },
    stmt: function (P) { return 'Technologie ' + M('q=l^2') + ' (un seul facteur, salaire ' + M('w=' + P.w) + '). Calcule le co\u00fbt de production de ' + M('q=' + P.q) + ' unit\u00e9s.'; },
    answer: function (P) { return P.w * Math.sqrt(P.q); },
    hints: function () { return ['Pour produire ' + M('q') + ', il faut ' + M('l=\\sqrt q') + '.']; },
    steps: function (P) { return ['' + M('l=\\sqrt{q}=\\sqrt{' + P.q + '}=' + Math.sqrt(P.q)) + '.', M('C=wl=' + P.w + '\\times' + Math.sqrt(P.q) + '=' + P.w * Math.sqrt(P.q)) + '.']; },
    wrong: [{ v: function (P) { return P.w * P.q; }, msg: 'Il faut ' + M('l=\\sqrt q') + ' heures de travail, pas ' + M('l=q') + '.' }]
  });
  ex('n1-08', 1, 'prod', S2, 'Co\u00fbt marginal', ['couts', 'maths-deriv'], {
    kind: 'num',
    gen: function () { return { c: pick([1, 2, 3]), d: pick([1, 2, 3]), q: pick([2, 3, 4]) }; },
    stmt: function (P) { return M('C(q)=cq+\\dfrac d2q^2') + ' avec ' + M('c=' + P.c + ',\\ d=' + P.d) + '. Calcule le co\u00fbt marginal ' + M('Cm(q)') + ' pour ' + M('q=' + P.q) + '.'; },
    answer: function (P) { return P.c + P.d * P.q; },
    hints: function () { return [M('Cm(q)=C\u2019(q)') + '.']; },
    steps: function (P) { return [M('Cm(q)=C\u2019(q)=c+dq') + '.', M('Cm(' + P.q + ')=' + P.c + '+' + P.d + '\\times' + P.q + '=' + (P.c + P.d * P.q)) + '.']; },
    wrong: [{ v: function (P) { return P.c + P.d * P.q / 2; }, msg: 'Tu as calcul\u00e9 le co\u00fbt <em>moyen</em> ' + M('c+\\frac d2q') + '. Le co\u00fbt marginal est la d\u00e9riv\u00e9e du co\u00fbt total.' }]
  });
  ex('n1-09', 1, 'prod', S2, '\u00c9conomies ou d\u00e9s\u00e9conomies d\u2019\u00e9chelle\u00a0?', ['echelle'], {
    kind: 'mcq',
    gen: function () { var m = pick([[0.5, '\\tfrac12'], [2, '2'], [1.5, '\\tfrac32'], [1, '1']]); return { m: m[0], lab: m[1] }; },
    stmt: function (P) { return 'Soit ' + M('C(q)=2q^{' + P.lab + '}') + '. On triple la production (' + M('\\lambda=3') + '). Compare ' + M('C(\\lambda q)') + ' et ' + M('\\lambda C(q)') + '\u00a0: quelle est la nature des rendements\u00a0?'; },
    choices: function () { return ['\u00c9conomies d\u2019\u00e9chelle (' + M('C(\\lambda q)<\\lambda C(q)') + ')', 'Rendements constants (' + M('C(\\lambda q)=\\lambda C(q)') + ')', 'D\u00e9s\u00e9conomies d\u2019\u00e9chelle (' + M('C(\\lambda q)>\\lambda C(q)') + ')']; },
    correct: function (P) { return P.m < 1 ? 0 : P.m === 1 ? 1 : 2; },
    hints: function () { return ['Calcule ' + M('C(\\lambda q)=2\\lambda^{m}q^{m}') + ' et compare \u00e0 ' + M('\\lambda C(q)=2\\lambda q^{m}') + ', donc ' + M('\\lambda^m') + ' contre ' + M('\\lambda') + '.']; },
    steps: function (P) { return [M('C(3q)=2\\cdot3^{' + P.lab + '}q^{' + P.lab + '}') + ' et ' + M('3C(q)=2\\cdot3\\,q^{' + P.lab + '}') + '.', 'On compare ' + M('3^{' + P.lab + '}=' + f(Math.pow(3, P.m), 3)) + ' \u00e0 ' + M('3') + '.', P.m < 1 ? 'Comme ' + M('3^m<3') + ' : \u00e9conomies d\u2019\u00e9chelle.' : P.m === 1 ? 'Egalit\u00e9 : rendements constants.' : 'Comme ' + M('3^m>3') + ' : d\u00e9s\u00e9conomies d\u2019\u00e9chelle.']; }
  });
  ex('n1-10', 1, 'marche', S3, '\u00c9quilibre concurrentiel (num\u00e9rique)', ['concurrence', 'couts'], {
    kind: 'num',
    gen: function () { var t = pick(abcd); return { a: t[0], c: t[1], d: t[2] }; },
    stmt: function (P) { return 'Demande inverse ' + M('P(q)=a-q') + ', co\u00fbt ' + M('C(q)=cq+\\frac d2q^2') + ' avec ' + M('a=' + P.a + ',\\ c=' + P.c + ',\\ d=' + P.d) + '. Une entreprise concurrentielle fixe ' + M('P(q)=Cm(q)') + '. Calcule la quantit\u00e9 ' + M('q_c') + '.'; },
    answer: function (P) { return T.qc(P.a, P.c, P.d); },
    hints: function () { return ['R\u00e9sous ' + M('a-q=c+dq') + '.']; },
    steps: function (P) { return [M('a-q=c+dq\\iff a-c=(1+d)q') + '.', M('q_c=\\dfrac{a-c}{1+d}=\\dfrac{' + P.a + '-' + P.c + '}{1+' + P.d + '}=' + f(T.qc(P.a, P.c, P.d)) + '') + '.']; },
    wrong: [{ v: function (P) { return T.qm(P.a, P.c, P.d); }, msg: 'Tu as calcul\u00e9 la quantit\u00e9 de <em>monopole</em> (' + M('R\u2019=Cm') + ').\u00a0Ici l\u2019entreprise est concurrentielle\u00a0: ' + M('P=Cm') + '.' }]
  });
  ex('n1-11', 1, 'monopole', S3, 'Quantit\u00e9 de monopole (num\u00e9rique)', ['monopole', 'maths-opt'], {
    kind: 'num',
    gen: function () { var t = pick(abcdM); return { a: t[0], c: t[1], d: t[2] }; },
    stmt: function (P) { return 'M\u00eames hypoth\u00e8ses (' + M('P(q)=a-q,\\ C(q)=cq+\\frac d2q^2') + ') avec ' + M('a=' + P.a + ',\\ c=' + P.c + ',\\ d=' + P.d) + '. Le monopole maximise son profit. Calcule ' + M('q_m') + '.'; },
    answer: function (P) { return T.qm(P.a, P.c, P.d); },
    hints: function () { return ['Recette ' + M('R(q)=(a-q)q') + ', donc ' + M('R\u2019(q)=a-2q') + '. Egalise \u00e0 ' + M('Cm(q)=c+dq') + '.']; },
    steps: function (P) { return [M('R\u2019(q)=a-2q') + ' ; ' + M('Cm(q)=c+dq') + '.', M('a-2q=c+dq\\iff a-c=(2+d)q') + '.', M('q_m=\\dfrac{' + P.a + '-' + P.c + '}{2+' + P.d + '}=' + f(T.qm(P.a, P.c, P.d)) + '') + '.']; },
    wrong: [{ v: function (P) { return T.qc(P.a, P.c, P.d); }, msg: 'C\u2019est la quantit\u00e9 concurrentielle (' + M('P=Cm') + '). Le monopole utilise la recette marginale ' + M('R\u2019=a-2q') + '.' }]
  });
  ex('n1-12', 1, 'societe', S4, 'Bien-\u00eatre d\u2019une quantit\u00e9 donn\u00e9e', ['bienetre', 'surplus'], {
    kind: 'num',
    gen: function () { return { a: pick([8, 10]), c: pick([2, 4]), q: pick([2, 3, 4]) }; },
    stmt: function (P) { return 'Demande inverse ' + M('P(q)=a-q') + ', co\u00fbt ' + M('C(q)=cq') + ', ' + M('a=' + P.a + ',\\ c=' + P.c) + '. Calcule le bien-\u00eatre ' + M('W(q)=U(q)-U(0)-C(q)') + ' pour ' + M('q=' + P.q) + ' (rappel\u00a0: ' + M('U\u2019(q)=P(q)') + ').'; },
    answer: function (P) { return (P.a - P.c) * P.q - P.q * P.q / 2; },
    hints: function () { return ['Primitive de ' + M('a-q') + '\u00a0: ' + M('U(q)=aq-\\frac{q^2}{2}') + '.']; },
    steps: function (P) { var q = P.q; return [M('U(q)=aq-\\dfrac{q^2}{2}=' + (P.a * q - q * q / 2) + '') + '.', M('C(q)=' + P.c * q) + '.', M('W=' + (P.a * q - q * q / 2) + '-' + P.c * q + '=' + ((P.a - P.c) * q - q * q / 2)) + '.']; }
  });

  /* =========================== NIVEAU 2 =========================== */
  ex('n2-01', 2, 'marche', S3, 'Rep\u00e9rer l\u2019\u00e9quilibre concurrentiel', ['concurrence', 'graph'], {
    kind: 'click',
    gen: function () { var t = pick([[10, 2, 1], [12, 2, 2], [10, 4, 1], [12, 3, 3]]); return { a: t[0], c: t[1], d: t[2] }; },
    stmt: function (P) { return 'Voici la demande ' + M('D=P(q)') + ' et le co\u00fbt marginal ' + M('Cm') + ' (avec ' + M('a=' + P.a + ',\\ c=' + P.c + ',\\ d=' + P.d) + '). Clique sur le point d\u2019\u00e9quilibre concurrentiel ' + M('(q_c,p_c)') + '.'; },
    plot: function (P) { return mkt(P.a, P.c, P.d); },
    target: function (P) { return { x: T.qc(P.a, P.c, P.d), y: T.pc(P.a, P.c, P.d) }; },
    reveal: function (P) { var q = T.qc(P.a, P.c, P.d), p = T.pc(P.a, P.c, P.d); return { points: [{ x: q, y: p, label: '(q_c, p_c)' }], vlines: [{ x: q, y1: p, label: 'q_c' }], hlines: [{ y: p, x1: q, label: 'p_c' }] }; },
    hints: function () { return ['C\u2019est l\u2019intersection de deux courbes\u00a0: ' + M('P(q)=Cm(q)') + '.']; },
    steps: function (P) { return [M('P(q)=Cm(q)\\iff q_c=\\dfrac{a-c}{1+d}=' + f(T.qc(P.a, P.c, P.d)) + '') + '.', M('p_c=P(q_c)=' + f(T.pc(P.a, P.c, P.d)) + '') + ' : intersection des deux courbes.']; }
  });
  ex('n2-02', 2, 'monopole', S3, 'Mécanisme du monopole', ['monopole', 'graph'], {
    kind: 'click',
    gen: function () { var t = pick([[10, 2, 1], [12, 2, 2], [10, 4, 1], [12, 3, 3]]); return { a: t[0], c: t[1], d: t[2] }; },
    stmt: function (P) { return 'Le graphique montre la demande ' + M('D') + ', la recette marginale ' + M('R\u2019(q)=a-2q') + ' et le co\u00fbt marginal ' + M('Cm') + ' (' + M('a=' + P.a + ',\\ c=' + P.c + ',\\ d=' + P.d) + '). Clique sur le point <strong>(quantit\u00e9, prix)</strong> choisi par le monopole.'; },
    plot: function (P) { var s = mkt(P.a, P.c, P.d); s.curves.push({ f: function (q) { return P.a - 2 * q; }, color: '#5E80A3', dash: [6, 4], label: 'R\u2019', lpos: [P.a * 0.4] }); return s; },
    ptol: { x: 0.035, y: 0.045 },
    target: function (P) { return { x: T.qm(P.a, P.c, P.d), y: T.pm(P.a, P.c, P.d) }; },
    spots: function (P) { var q = T.qm(P.a, P.c, P.d); return [{ x: q, y: P.c + P.d * q, msg: 'Tu as cliqu\u00e9 sur l\u2019intersection ' + M('R\u2019=Cm') + '\u00a0: elle donne bien ' + M('q_m') + ', mais le prix se lit sur la <strong>demande</strong> (on remonte verticalement jusqu\u2019\u00e0 ' + M('D') + ').' }, { x: T.qc(P.a, P.c, P.d), y: T.pc(P.a, P.c, P.d), msg: 'C\u2019est l\u2019\u00e9quilibre concurrentiel (' + M('D=Cm') + '), pas le monopole.' }]; },
    reveal: function (P) { var q = T.qm(P.a, P.c, P.d), p = T.pm(P.a, P.c, P.d); return { points: [{ x: q, y: P.c + P.d * q, r: 3.5, color: '#5E80A3' }, { x: q, y: p, label: '(q_m, p_m)' }], vlines: [{ x: q, y1: p, label: 'q_m' }], hlines: [{ y: p, x1: q, label: 'p_m' }] }; },
    hints: function () { return ['\u00c9tape 1\u00a0: ' + M('R\u2019=Cm') + ' donne la quantit\u00e9.', '\u00c9tape 2\u00a0: on lit le prix sur ' + M('D') + ' (le consommateur paie le prix de la demande).']; },
    steps: function (P) { return [M('R\u2019(q)=Cm(q)\\iff q_m=\\dfrac{a-c}{2+d}=' + f(T.qm(P.a, P.c, P.d)) + '') + '.', M('p_m=P(q_m)=a-q_m=' + f(T.pm(P.a, P.c, P.d)) + '') + '\u00a0: le point est sur la courbe de demande.']; }
  });
  ex('n2-03', 2, 'conso', S1, 'Lire un surplus sur le graphique', ['surplus', 'graph'], {
    kind: 'num',
    gen: function () { var a = pick([6, 8, 10]); return { a: a, p: pick([2, 3, 4]) }; },
    stmt: function (P) { return 'La zone gris\u00e9e est le surplus du consommateur au prix ' + M('p=' + P.p) + '. Lis l\u2019ordonn\u00e9e \u00e0 l\u2019origine ' + M('a') + ' sur le graphique et calcule l\u2019aire.'; },
    plot: function (P) { var a = P.a, p = P.p; return { xmin: 0, xmax: a, ymin: 0, ymax: a + 1, xlabel: 'q', ylabel: 'p', curves: [{ f: function (q) { return a - q; }, label: 'D(q)', lpos: [a * 0.85] }], hlines: [{ y: p, label: 'p = ' + p }], shades: [{ f1: function (q) { return a - q; }, f2: function () { return p; }, x0: 0, x1: a - p, color: 'rgba(61,108,153,.28)', label: 'Sc', lx: (a - p) / 3, ly: p + (a - p) / 3 }] }; },
    answer: function (P) { return (P.a - P.p) * (P.a - P.p) / 2; },
    hints: function () { return ['Triangle rectangle\u00a0: les deux c\u00f4t\u00e9s de l\u2019angle droit valent ' + M('a-p') + '.']; },
    steps: function (P) { return [M('a=' + P.a) + ' (la droite coupe l\u2019axe vertical \u00e0 ' + P.a + ').', 'Base\u00a0: ' + M('q=a-p=' + (P.a - P.p)) + '\u00a0; hauteur\u00a0: ' + M('a-p=' + (P.a - P.p)) + '.', M('\\mathrm{Sc}=\\tfrac12(a-p)^2=' + f((P.a - P.p) * (P.a - P.p) / 2)) + '.']; }
  });
  ex('n2-04', 2, 'conso', S1, 'Où l\u2019\u00e9lasticit\u00e9 vaut-elle 1\u00a0?', ['elasticite', 'graph'], {
    kind: 'click',
    gen: function () { return { a: pick([6, 8, 10]) }; },
    stmt: function (P) { return 'Sur la demande lin\u00e9aire ' + M('q=D(p)=' + P.a + '-p') + ' (trac\u00e9e dans le plan ' + M('(q,p)') + '), clique sur le point o\u00f9 ' + M('\\varepsilon=\\dfrac{p}{a-p}=1') + '.'; },
    plot: function (P) { var a = P.a; return { xmin: 0, xmax: a, ymin: 0, ymax: a + 1, xlabel: 'q', ylabel: 'p', curves: [{ f: function (q) { return a - q; }, label: 'D', lpos: [a * 0.85] }] }; },
    target: function (P) { return { x: P.a / 2, y: P.a / 2 }; },
    ptol: { x: 0.06, y: 0.06 },
    reveal: function (P) { return { points: [{ x: P.a / 2, y: P.a / 2, label: '\u03b5 = 1' }], texts: [{ x: P.a * 0.1, y: P.a * 0.85, t: '\u03b5 > 1 (\u00e9lastique)', color: '#2E6B3C' }, { x: P.a * 0.62, y: P.a * 0.2, t: '\u03b5 < 1 (in\u00e9lastique)', color: '#9C5518' }] }; },
    hints: function () { return ['R\u00e9sous ' + M('p=a-p') + '.']; },
    steps: function (P) { return [M('\\varepsilon=1\\iff p=a-p\\iff p=\\dfrac a2=' + P.a / 2) + '.', M('q=a-p=\\dfrac a2') + '\u00a0: c\u2019est le milieu de la droite, o\u00f9 la recette ' + M('pq') + ' est maximale.']; }
  });
  ex('n2-05', 2, 'conso', S1, 'Tracer la demande inverse', ['quasi', 'demande', 'graph'], {
    kind: 'fit',
    gen: function () { return { a: pick([4, 6, 8]) }; },
    stmt: function (P) { return 'Utilit\u00e9 ' + M('u(x)=x(a-x)') + ' avec ' + M('a=' + P.a) + '. La demande inverse est ' + M('P(q)=u\u2019(q)') + '. R\u00e8gle les curseurs pour tracer la droite ' + M('p=A-B\\,q') + ' qui la repr\u00e9sente, puis valide.'; },
    plot: function (P) { var a = P.a; return { xmin: 0, xmax: a, ymin: 0, ymax: a + 1, xlabel: 'q', ylabel: 'p', curves: [] }; },
    sliders: [{ id: 'A', label: 'A (ordonn\u00e9e \u00e0 l\u2019origine)', min: 0, max: 12, step: 0.5, init: 2 }, { id: 'B', label: 'B (pente)', min: 0, max: 4, step: 0.5, init: 1 }],
    curve: function (v) { return function (q) { return v.A - v.B * q; }; },
    curveLabel: 'ton trac\u00e9',
    fitTarget: function (P) { return { A: P.a, B: 2 }; },
    fitTol: 0.26,
    reveal: function (P) { return { curves: [{ f: function (q) { return P.a - 2 * q; }, color: '#2E6B3C', dash: [6, 4], label: 'P(q)=a\u22122q', lpos: [P.a * 0.15] }] }; },
    hints: function () { return ['D\u00e9rive ' + M('u(x)=ax-x^2') + '.', M('u\u2019(q)=a-2q') + ' donc ' + M('A=a') + ' et ' + M('B=2') + '.']; },
    steps: function (P) { return [M('u\u2019(q)=a-2q') + '.', 'Donc ' + M('A=a=' + P.a) + ' et ' + M('B=2') + '\u00a0: la droite coupe l\u2019axe horizontal en ' + M('q=a/2=' + P.a / 2) + ' (limite de validit\u00e9 du mod\u00e8le).']; }
  });
  ex('n2-06', 2, 'monopole', S3, 'Identifier la perte s\u00e8che', ['perte', 'monopole', 'graph'], {
    kind: 'gchoice',
    gen: function () { var t = pick([[10, 2, 1], [12, 2, 2], [10, 2, 0]]); return { a: t[0], c: t[1], d: t[2] }; },
    stmt: function (P) { return 'Parmi les figures suivantes (' + M('D') + ' en bleu, ' + M('Cm') + ' en ambre, avec ' + M('q_m') + ' et ' + M('q_c') + ' marqu\u00e9s), laquelle gris\u00e8re la <strong>perte s\u00e8che</strong> due au monopole\u00a0?'; },
    options: function (P) {
      var a = P.a, c = P.c, d = P.d, qm = T.qm(a, c, d), qc = T.qc(a, c, d), pm = T.pm(a, c, d), D = function (q) { return a - q; }, Cm = function (q) { return c + d * q; };
      var base = function (sh) { return Object.assign(mkt(a, c, d, { curves: [{ f: D, color: '#3D6C99' }, { f: Cm, color: '#9C5518' }], vlines: [{ x: qm, label: 'q_m', y1: pm }, { x: qc, label: 'q_c', y1: T.pc(a, c, d) }] }), { shades: [sh] }); };
      return [
        { caption: 'Zone entre D et Cm, de q_m \u00e0 q_c', plot: base({ f1: D, f2: Cm, x0: qm, x1: qc, color: 'rgba(40,73,106,.45)' }) },
        { caption: 'Zone sous D, au-dessus de p_m', plot: base({ f1: D, f2: function () { return pm; }, x0: 0, x1: a - pm, color: 'rgba(40,73,106,.45)' }) },
        { caption: 'Zone entre D et Cm, de 0 \u00e0 q_m', plot: base({ f1: D, f2: Cm, x0: 0, x1: qm, color: 'rgba(40,73,106,.45)' }) }
      ];
    },
    correct: function () { return 0; },
    okMsg: function () { return 'La perte s\u00e8che correspond aux unit\u00e9s \u00ab\u00a0non produites\u00a0\u00bb entre ' + M('q_m') + ' et ' + M('q_c') + ' dont la valeur pour le consommateur (' + M('P') + ') d\u00e9passe le co\u00fbt (' + M('Cm') + ').'; },
    wrongMsg: function (P, i) { return i === 2 ? 'Cette zone est le surplus total <em>r\u00e9alis\u00e9</em> sur les unit\u00e9s produites.' : 'Cette zone est un surplus du consommateur\u00a0; la perte s\u00e8che concerne les unit\u00e9s qui ne sont <em>pas</em> produites.'; },
    hints: function () { return ['La perte s\u00e8che = surplus total perdu sur les unit\u00e9s entre ' + M('q_m') + ' et ' + M('q_c') + '.']; },
    steps: function () { return ['Chaque unit\u00e9 entre ' + M('q_m') + ' et ' + M('q_c') + ' vaut ' + M('P(q)') + ' pour le consommateur et co\u00fbte ' + M('Cm(q)<P(q)') + '.', 'Le surplus ' + M('P-Cm') + ' perdu forme le triangle entre ' + M('D') + ' et ' + M('Cm') + '.']; }
  });
  ex('n2-07', 2, 'prod', S2, 'Minimum du co\u00fbt moyen', ['couts', 'echelle', 'graph'], {
    kind: 'click',
    gen: function () { return { F: pick([4, 9, 16]) }; },
    stmt: function (P) { return 'Co\u00fbt ' + M('C(q)=q^2+F') + ' avec ' + M('F=' + P.F) + '. Le graphique montre ' + M('CM(q)') + ' et ' + M('Cm(q)') + '. Clique sur le minimum du co\u00fbt moyen.'; },
    plot: function (P) { var F = P.F, s = Math.sqrt(F); return { xmin: 0, xmax: Math.round(2.4 * s * 10) / 10, ymin: 0, ymax: Math.round(4 * s), xlabel: 'q', ylabel: '\u20ac', curves: [{ f: function (q) { return q + F / q; }, label: 'CM', lpos: [s * 2.2], color: '#3D6C99' }, { f: function (q) { return 2 * q; }, label: 'Cm', color: '#9C5518', lpos: [s * 1.9] }] }; },
    target: function (P) { var s = Math.sqrt(P.F); return { x: s, y: 2 * s }; },
    ptol: { x: 0.05, y: 0.06 },
    spots: function () { return []; },
    reveal: function (P) { var s = Math.sqrt(P.F); return { points: [{ x: s, y: 2 * s, label: 'min CM = Cm' }], vlines: [{ x: s, y1: 2 * s }] }; },
    hints: function () { return ['Le minimum de ' + M('CM') + ' est l\u00e0 o\u00f9 ' + M('Cm') + ' coupe ' + M('CM') + '.']; },
    steps: function (P) { var s = Math.sqrt(P.F); return [M('CM=q+\\dfrac Fq') + ', ' + M('Cm=2q') + '.', M('CM=Cm\\iff \\dfrac Fq=q\\iff q^*=\\sqrt F=' + s) + '.', 'En dessous de ' + M('q^*') + ' : ' + M('Cm<CM') + ' donc ' + M('CM') + ' d\u00e9cro\u00eet (\u00e9conomies d\u2019\u00e9chelle), au-dessus il cro\u00eet (d\u00e9s\u00e9conomies).']; }
  });
  ex('n2-08', 2, 'monopole', S3, 'Le dirigeant et la quantit\u00e9 choisie', ['pdg', 'monopole', 'graph'], {
    kind: 'click',
    gen: function () { var th = pick([[0, '0'], [1 / 3, '1/3'], [2 / 3, '2/3']]); return { a: 10, c: 6, th: th[0], lab: th[1] }; },
    stmt: function (P) { return 'Le dirigeant maximise ' + M('G_\\theta=\\theta R+(1-\\theta)\\Pi') + ' avec ' + M('\\theta=' + P.lab) + ', ' + M('a=10,\\ c=6,\\ d=0') + '. Il \u00e9galise ' + M('R\u2019(q)') + ' au co\u00fbt marginal effectif ' + M('(1-\\theta)c') + ' (droite ambre). Clique sur le couple (quantit\u00e9, prix) qu\u2019il retient.'; },
    plot: function (P) { var a = P.a, c = P.c, e = (1 - P.th) * c; return { xmin: 0, xmax: a, ymin: 0, ymax: 11, xlabel: 'q', ylabel: 'p', curves: [{ f: function (q) { return a - q; }, label: 'D', lpos: [1] }, { f: function (q) { return a - 2 * q; }, color: '#5E80A3', dash: [6, 4], label: 'R\u2019', lpos: [3.2] }], hlines: [{ y: e, color: '#9C5518', label: '(1\u2212\u03b8)c = ' + f(e, 2) }] }; },
    target: function (P) { var q = (P.a - (1 - P.th) * P.c) / 2; return { x: q, y: P.a - q }; },
    ptol: { x: 0.04, y: 0.05 },
    spots: function (P) { var q = (P.a - (1 - P.th) * P.c) / 2; return [{ x: q, y: (1 - P.th) * P.c, msg: 'Tu as cliqu\u00e9 sur l\u2019intersection ' + M('R\u2019=(1-\\theta)c') + ' qui donne ' + M('q_\\theta') + '. Le prix se lit sur la demande.' }]; },
    reveal: function (P) { var q = (P.a - (1 - P.th) * P.c) / 2; return { points: [{ x: q, y: P.a - q, label: '(q\u03b8, p\u03b8)' }], vlines: [{ x: q, y1: P.a - q }] }; },
    hints: function () { return ['' + M('R\u2019(q)=a-2q') + ' ; r\u00e9sous ' + M('a-2q=(1-\\theta)c') + ', puis ' + M('p=a-q') + '.']; },
    steps: function (P) { var q = (P.a - (1 - P.th) * P.c) / 2; return [M('q_\\theta=\\dfrac{a-(1-\\theta)c}{2}=' + f(q, 3)) + '.', M('p_\\theta=a-q_\\theta=' + f(P.a - q, 3)) + '.']; }
  });
  ex('n2-09', 2, 'monopole', S3, 'Quel \u03b8 maximise le bien-\u00eatre\u00a0?', ['pdg', 'bienetre', 'graph'], {
    kind: 'click',
    gen: function () { var t = pick([[10, 6], [9, 6], [8, 6], [10, 8]]); return { a: t[0], c: t[1] }; },
    stmt: function (P) { return 'Courbe du bien-\u00eatre ' + M('W_\\theta') + ' en fonction de ' + M('\\theta\\in[0,1]') + ' (' + M('a=' + P.a + ',\\ c=' + P.c) + '). Clique sur le maximum.'; },
    plot: function (P) { var a = P.a, c = P.c, u = a - c; return { xmin: 0, xmax: 1, ymin: 0, ymax: Math.ceil(u * u / 2 + 1), xlabel: '\u03b8', ylabel: 'W', curves: [{ f: function (t) { return (u + t * c) * (3 * u - t * c) / 8; }, label: 'W\u03b8', lpos: [0.12] }] }; },
    target: function (P) { return { x: (P.a - P.c) / P.c, y: Math.pow(P.a - P.c, 2) / 2 }; },
    ptol: { x: 0.06, y: 0.07 },
    reveal: function (P) { var t = (P.a - P.c) / P.c; return { points: [{ x: t, y: Math.pow(P.a - P.c, 2) / 2, label: '\u03b8* = (a\u2212c)/c' }], vlines: [{ x: t, y1: Math.pow(P.a - P.c, 2) / 2 }] }; },
    hints: function () { return ['Le maximum est atteint quand la quantit\u00e9 choisie \u00e9gale la quantit\u00e9 socialement optimale ' + M('q_c=a-c') + '.']; },
    steps: function (P) { return [M('q_\\theta=q_c\\iff \\dfrac{a-c+\\theta c}{2}=a-c\\iff\\theta^*=\\dfrac{a-c}{c}=' + f((P.a - P.c) / P.c, 3)) + '.', M('W(\\theta^*)=\\dfrac{(a-c)^2}{2}=' + f(Math.pow(P.a - P.c, 2) / 2)) + '.']; }
  });
  ex('n2-10', 2, 'conso', S1, 'Le surplus dans le plan (p, x)', ['surplus', 'graph'], {
    kind: 'gchoice',
    gen: function () { return { a: pick([8, 10]), p: pick([3, 4]) }; },
    stmt: function (P) { return 'Ici le prix est en abscisse et la quantit\u00e9 demand\u00e9e ' + M('x=D(p)=' + P.a + '-p') + ' en ordonn\u00e9e. Quelle figure repr\u00e9sente le surplus du consommateur au prix ' + M('p_0=' + P.p) + '\u00a0?'; },
    options: function (P) {
      var a = P.a, p0 = P.p, D = function (p) { return a - p; };
      var base = function (sh, extra) { return Object.assign({ xmin: 0, xmax: a, ymin: 0, ymax: a + 1, xlabel: 'p', ylabel: 'x', curves: [{ f: D, color: '#3D6C99', label: 'D(p)', lpos: [a * 0.85] }], vlines: [{ x: p0, y1: D(p0), label: 'p0' }], shades: [sh] }, extra || {}); };
      return [
        { caption: 'Aire sous D de p0 \u00e0 a', plot: base({ f1: D, f2: function () { return 0; }, x0: p0, x1: a, color: 'rgba(40,73,106,.45)' }) },
        { caption: 'Aire sous D de 0 \u00e0 p0', plot: base({ f1: D, f2: function () { return 0; }, x0: 0, x1: p0, color: 'rgba(40,73,106,.45)' }) },
        { caption: 'Rectangle p0 \u00d7 D(p0)', plot: base({ f1: function () { return D(p0); }, f2: function () { return 0; }, x0: 0, x1: p0, color: 'rgba(40,73,106,.45)' }) }
      ];
    },
    correct: function () { return 0; },
    okMsg: function () { return M('\\mathrm{Sc}=\\int_{p_0}^{a}D(p)\\,dp') + '\u00a0: pour tous les prix sup\u00e9rieurs \u00e0 ' + M('p_0') + ' (disponibilit\u00e9 \u00e0 payer plus \u00e9lev\u00e9e).'; },
    wrongMsg: function (P, i) { return i === 2 ? 'Le rectangle ' + M('p_0\\times D(p_0)') + ' est la <em>d\u00e9pense</em>, pas le surplus.' : 'Le surplus s\u2019obtient en int\u00e9grant ' + M('D(p)') + ' pour les prix <em>au-dessus</em> de ' + M('p_0') + '.'; },
    hints: function () { return ['Dans ce plan, ' + M('\\mathrm{Sc}=\\int_{p_0}^{a} D(p)\\,dp') + '.']; },
    steps: function () { return ['Surplus = aire sous la demande, \u00e0 droite de ' + M('p_0') + ' (jusqu\u2019au prix maximal ' + M('a') + ').']; }
  });
  ex('n2-11', 2, 'monopole', S3, 'Calculer la perte s\u00e8che sur le graphique', ['perte', 'graph', 'monopole'], {
    kind: 'num',
    gen: function () { var t = pick([[10, 2], [12, 4], [14, 2]]); return { a: t[0], c: t[1] }; },
    stmt: function (P) { return 'Cas ' + M('d=0') + ' (' + M('Cm=c') + ' constant), ' + M('a=' + P.a + ',\\ c=' + P.c) + '. Le triangle gris\u00e9 est la perte s\u00e8che\u00a0; ses sommets sont indiqu\u00e9s. Calcule son aire.'; },
    plot: function (P) { var a = P.a, c = P.c, qm = (a - c) / 2, qc = a - c, pm = a - qm; return { xmin: 0, xmax: a, ymin: 0, ymax: Math.round(a * 1.1), xlabel: 'q', ylabel: 'p', curves: [{ f: function (q) { return a - q; }, label: 'D', lpos: [a * 0.12] }, { f: function () { return c; }, color: '#9C5518', label: 'Cm', lpos: [a * 0.9] }], shades: [{ f1: function (q) { return a - q; }, f2: function () { return c; }, x0: qm, x1: qc, color: 'rgba(40,73,106,.45)', label: 'DWL', lx: qm + (qc - qm) * 0.35, ly: c + (pm - c) * 0.3 }], points: [{ x: qm, y: c, label: '(' + qm + ' ; ' + c + ')' }, { x: qm, y: pm, label: '(' + qm + ' ; ' + pm + ')' }, { x: qc, y: c, label: '(' + qc + ' ; ' + c + ')' }] }; },
    answer: function (P) { var qm = (P.a - P.c) / 2, qc = P.a - P.c; return 0.5 * (qc - qm) * ((P.a - qm) - P.c); },
    hints: function () { return ['Base = diff\u00e9rence des abscisses\u00a0; hauteur = diff\u00e9rence des ordonn\u00e9es des deux sommets align\u00e9s verticalement.']; },
    steps: function (P) { var qm = (P.a - P.c) / 2, qc = P.a - P.c, h = (P.a - qm) - P.c; return ['Base\u00a0: ' + M(qc + '-' + qm + '=' + (qc - qm)) + '. Hauteur\u00a0: ' + M((P.a - qm) + '-' + P.c + '=' + h) + '.', M('DWL=\\tfrac12\\times' + (qc - qm) + '\\times' + h + '=' + f(0.5 * (qc - qm) * h)) + '.', 'V\u00e9rification\u00a0: ' + M('\\dfrac{(a-c)^2}{8}=' + f(Math.pow(P.a - P.c, 2) / 8)) + '.']; }
  });

  /* =========================== NIVEAU 3 (litt\u00e9ral) =========================== */
  var samp = {
    ap: function () { var a = 2 + Math.random() * 4; return { a: a, p: 0.3 + Math.random() * (a - 0.6) }; },
    bp: function () { var b = 2 + Math.random() * 3; return { beta: b, p: 0.3 + Math.random() * (b - 0.5) }; },
    gp: function () { var g = 1.5 + Math.random() * 3; return { gamma: g, p: 0.3 + Math.random() * (g - 0.5) }; },
    al: function () { return { alpha: 0.2 + Math.random() * 0.6, p: 0.5 + Math.random() * 3 }; },
    ac: function () { var c = 0.5 + Math.random() * 2; return { a: c + 0.5 + Math.random() * 5, c: c, d: Math.random() * 3 }; }
  };
  var LIT = function (id, th, sec, title, notions, stmt, vars, ref, sample, extra) {
    ex(id, 3, th, sec, title, notions, Object.assign({
      kind: 'expr', vars: vars, ref: ref, sample: sample, stmt: function () { return stmt; }
    }, extra));
  };
  LIT('n3-01', 'conso', S1, 'Demande quadratique', ['quasi', 'demande', 'maths-deriv', 'syntaxe'],
    'Utilit\u00e9 ' + M('u(x)=x(a-x)') + '. D\u00e9termine la fonction de demande ' + M('D(p)') + ' (en fonction de ' + M('a') + ' et ' + M('p') + ').', ['a', 'p'], function (e) { return (e.a - e.p) / 2; }, samp.ap, {
      hints: function () { return ['Condition d\u2019optimalit\u00e9\u00a0: ' + M('u\u2019(x)=p') + '.', M('u\u2019(x)=a-2x') + '.']; },
      steps: function () { return [M('u\u2019(x)=a-2x') + '.', M('a-2x=p\\Rightarrow D(p)=\\dfrac{a-p}{2}') + '.']; },
      wrong: [{ ref: function (e) { return e.a - e.p; }, msg: 'Tu as r\u00e9solu ' + M('a-x=p') + '\u00a0; la d\u00e9riv\u00e9e de ' + M('ax-x^2') + ' est ' + M('a-2x') + '.' }]
    });
  LIT('n3-02', 'conso', S1, 'Demande logarithmique', ['quasi', 'demande', 'maths-log', 'syntaxe'],
    'Utilit\u00e9 ' + M('u(x)=\\beta\\ln(1+x)') + '. D\u00e9termine ' + M('D(p)') + ' (variables\u00a0: ' + M('\\beta') + ' saisi <span class="pv-kbd">beta</span>, et ' + M('p') + ').', ['beta', 'p'], function (e) { return e.beta / e.p - 1; }, samp.bp, {
      hints: function () { return [M('u\u2019(x)=\\dfrac{\\beta}{1+x}') + ', \u00e9gal \u00e0 ' + M('p') + '.']; },
      steps: function () { return [M('u\u2019(x)=\\dfrac{\\beta}{1+x}=p\\Rightarrow 1+x=\\dfrac{\\beta}{p}') + '.', M('D(p)=\\dfrac{\\beta}{p}-1') + ' (si ' + M('p\\le\\beta') + ', sinon 0).']; },
      wrong: [{ ref: function (e) { return e.beta / e.p; }, msg: 'N\u2019oublie pas le ' + M('1') + '\u00a0: ' + M('1+x=\\beta/p') + ' donc ' + M('x=\\beta/p-1') + '.' }]
    });
  LIT('n3-03', 'conso', S1, 'Demande Cobb-Douglas', ['quasi', 'demande', 'maths-deriv', 'syntaxe'],
    'Utilit\u00e9 ' + M('u(x)=x^{\\alpha}') + ', ' + M('0<\\alpha<1') + '. D\u00e9termine ' + M('D(p)') + ' (saisis <span class="pv-kbd">alpha</span> et ' + M('p') + ' ; puissance avec <span class="pv-kbd">^</span>, par ex. <span class="pv-kbd">(alpha/p)^(1/(1-alpha))</span>).', ['alpha', 'p'], function (e) { return Math.pow(e.alpha / e.p, 1 / (1 - e.alpha)); }, samp.al, {
      hints: function () { return [M('u\u2019(x)=\\alpha x^{\\alpha-1}=p') + ', puis isole ' + M('x') + ' en \u00e9levant \u00e0 la puissance ' + M('\\frac{1}{\\alpha-1}') + '.']; },
      steps: function () { return [M('\\alpha x^{\\alpha-1}=p\\Rightarrow x^{\\alpha-1}=\\dfrac{p}{\\alpha}') + '.', M('x=\\left(\\dfrac p\\alpha\\right)^{\\frac1{\\alpha-1}}=\\left(\\dfrac\\alpha p\\right)^{\\frac1{1-\\alpha}}') + '.']; },
      wrong: [{ ref: function (e) { return e.alpha / e.p; }, msg: 'Il reste \u00e0 \u00e9lever ' + M('\\alpha/p') + ' \u00e0 la puissance ' + M('\\frac1{1-\\alpha}') + '.' }]
    });
  LIT('n3-04', 'conso', S1, 'Demande exponentielle', ['quasi', 'demande', 'maths-log', 'syntaxe'],
    'Utilit\u00e9 ' + M('u(x)=-e^{-\\gamma x}') + '. D\u00e9termine ' + M('D(p)') + ' (saisis <span class="pv-kbd">gamma</span> et ' + M('p') + ' ; logarithme\u00a0: <span class="pv-kbd">ln(...)</span>).', ['gamma', 'p'], function (e) { return Math.log(e.gamma / e.p) / e.gamma; }, samp.gp, {
      hints: function () { return [M('u\u2019(x)=\\gamma e^{-\\gamma x}=p') + ', puis prends le logarithme.']; },
      steps: function () { return [M('\\gamma e^{-\\gamma x}=p\\Rightarrow e^{-\\gamma x}=\\dfrac p\\gamma') + '.', M('-\\gamma x=\\ln\\dfrac p\\gamma\\Rightarrow x=\\dfrac1\\gamma\\ln\\dfrac\\gamma p') + '.']; },
      wrong: [{ ref: function (e) { return Math.log(e.gamma / e.p); }, msg: 'Il manque le facteur ' + M('1/\\gamma') + ' en divisant par ' + M('-\\gamma') + '.' }]
    });
  LIT('n3-05', 'conso', S1, '\u00c9lasticit\u00e9 (demande quadratique)', ['elasticite', 'maths-deriv'],
    'Pour ' + M('D(p)=\\dfrac{a-p}{2}') + ', donne l\u2019\u00e9lasticit\u00e9 ' + M('\\varepsilon(p)=-\\dfrac{p}{D(p)}D\u2019(p)') + '.', ['a', 'p'], function (e) { return e.p / (e.a - e.p); }, samp.ap, {
      hints: function () { return [M('D\u2019(p)=-\\frac12') + '.']; },
      steps: function () { return [M('D\u2019(p)=-\\dfrac12') + '.', M('\\varepsilon=-\\dfrac{p}{(a-p)/2}\\left(-\\dfrac12\\right)=\\dfrac{p}{a-p}') + '.']; },
      wrong: [{ ref: function (e) { return (e.a - e.p) / e.p; }, msg: 'Rapport invers\u00e9\u00a0: c\u2019est ' + M('p/D(p)') + '.' }, { ref: function (e) { return 2 * e.p / (e.a - e.p); }, msg: 'Le facteur ' + M('\\frac12') + ' de ' + M('D\u2019') + ' se simplifie avec celui de ' + M('D') + '.' }]
    });
  LIT('n3-06', 'conso', S1, '\u00c9lasticit\u00e9 (demande logarithmique)', ['elasticite', 'maths-deriv'],
    'Pour ' + M('D(p)=\\dfrac{\\beta}{p}-1') + ', donne ' + M('\\varepsilon(p)') + ' (saisis <span class="pv-kbd">beta</span> et ' + M('p') + ').', ['beta', 'p'], function (e) { return e.beta / (e.beta - e.p); }, samp.bp, {
      hints: function () { return [M('D\u2019(p)=-\\dfrac{\\beta}{p^2}') + '.']; },
      steps: function () { return [M('D\u2019(p)=-\\dfrac{\\beta}{p^2}') + '.', M('\\varepsilon=-\\dfrac{p}{\\beta/p-1}\\left(-\\dfrac\\beta{p^2}\\right)=\\dfrac{\\beta/p}{\\beta/p-1}=\\dfrac{\\beta}{\\beta-p}') + '.']; }
    });
  LIT('n3-07', 'conso', S1, '\u00c9lasticit\u00e9 (demande exponentielle)', ['elasticite', 'maths-log'],
    'Pour ' + M('D(p)=\\dfrac1\\gamma\\ln\\dfrac\\gamma p') + ', donne ' + M('\\varepsilon(p)') + ' (saisis <span class="pv-kbd">gamma</span>, ' + M('p') + ').', ['gamma', 'p'], function (e) { return 1 / Math.log(e.gamma / e.p); }, samp.gp, {
      hints: function () { return [M('D\u2019(p)=-\\dfrac{1}{\\gamma p}') + '.']; },
      steps: function () { return [M('D\u2019(p)=\\dfrac1\\gamma\\cdot\\left(-\\dfrac1p\\right)') + '.', M('\\varepsilon=-\\dfrac{p}{\\frac1\\gamma\\ln(\\gamma/p)}\\left(-\\dfrac1{\\gamma p}\\right)=\\dfrac{1}{\\ln(\\gamma/p)}') + '.']; }
    });
  LIT('n3-08', 'conso', S1, 'Surplus (demande quadratique)', ['surplus', 'quasi', 'maths-deriv'],
    'Pour ' + M('u(x)=x(a-x)') + ' et ' + M('D(p)=\\dfrac{a-p}{2}') + ', calcule ' + M('\\mathrm{Sc}=U(q)-U(0)-pq') + ' au prix ' + M('p') + ' (en fonction de ' + M('a') + ' et ' + M('p') + ').', ['a', 'p'], function (e) { return Math.pow(e.a - e.p, 2) / 4; }, samp.ap, {
      hints: function () { return ['Avec ' + M('q=\\frac{a-p}2') + ' : ' + M('U(q)=aq-q^2') + ' et ' + M('p=a-2q') + '.']; },
      steps: function () { return ['' + M('q=\\dfrac{a-p}{2}') + ', ' + M('U(q)=aq-q^2') + ', ' + M('p=a-2q') + '.', M('\\mathrm{Sc}=aq-q^2-(a-2q)q=q^2=\\dfrac{(a-p)^2}{4}') + '.']; },
      wrong: [{ ref: function (e) { return Math.pow(e.a - e.p, 2) / 2; }, msg: 'Ici ' + M('q=(a-p)/2') + ' et la hauteur du triangle vaut ' + M('a-p') + '\u00a0: v\u00e9rifie base \u00d7 hauteur \u00f7 2 avec la base ' + M('q') + '.' }]
    });
  LIT('n3-09', 'conso', S1, 'Surplus (demande logarithmique)', ['surplus', 'quasi', 'maths-log'],
    'Pour ' + M('u(x)=\\beta\\ln(1+x)') + ' et ' + M('D(p)=\\dfrac\\beta p-1') + ', calcule ' + M('\\mathrm{Sc}') + ' (saisis <span class="pv-kbd">beta</span>, ' + M('p') + ').', ['beta', 'p'], function (e) { return e.beta * Math.log(e.beta / e.p) - e.beta + e.p; }, samp.bp, {
      hints: function () { return [M('U(q)=\\beta\\ln(1+q)=\\beta\\ln(\\beta/p)') + ', ' + M('pq=\\beta-p') + '.']; },
      steps: function () { return [M('q=\\dfrac\\beta p-1') + ', ' + M('1+q=\\dfrac\\beta p') + '.', M('U(q)-U(0)=\\beta\\ln\\dfrac\\beta p') + ' ; ' + M('pq=\\beta-p') + '.', M('\\mathrm{Sc}=\\beta\\ln\\dfrac\\beta p-\\beta+p') + '.']; }
    });
  LIT('n3-10', 'conso', S1, 'Surplus (demande exponentielle)', ['surplus', 'quasi', 'maths-log'],
    'Pour ' + M('u(x)=-e^{-\\gamma x}') + ' et ' + M('D(p)=\\dfrac1\\gamma\\ln\\dfrac\\gamma p') + ', calcule ' + M('\\mathrm{Sc}=U(q)-U(0)-pq') + ' (saisis <span class="pv-kbd">gamma</span>, ' + M('p') + ').', ['gamma', 'p'], function (e) { return 1 - e.p / e.gamma - (e.p / e.gamma) * Math.log(e.gamma / e.p); }, samp.gp, {
      hints: function () { return [M('U(q)-U(0)=1-e^{-\\gamma q}') + ' et ' + M('e^{-\\gamma q}=p/\\gamma') + '.']; },
      steps: function () { return [M('U(q)-U(0)=-e^{-\\gamma q}+1') + ', et ' + M('e^{-\\gamma q}=\\dfrac p\\gamma') + ' (d\u00e9finition de ' + M('q') + ').', M('pq=\\dfrac p\\gamma\\ln\\dfrac\\gamma p') + '.', M('\\mathrm{Sc}=1-\\dfrac p\\gamma-\\dfrac p\\gamma\\ln\\dfrac\\gamma p') + '.']; }
    });
  LIT('n3-11', 'prod', S2, 'Deux facteurs : fonction de co\u00fbt', ['couts', 'echelle', 'maths-opt'],
    'Technologie ' + M('q=\\sqrt{xl}') + ', prix des facteurs ' + M('w') + ' (pour ' + M('x') + ') et ' + M('r') + ' (pour ' + M('l') + '). Fonction de co\u00fbt ' + M('C(q)=\\min\\,wx+rl') + ' sous ' + M('\\sqrt{xl}=q') + '\u00a0? (saisis <span class="pv-kbd">w</span>, <span class="pv-kbd">r</span>, <span class="pv-kbd">q</span> ; racine\u00a0: <span class="pv-kbd">sqrt(...)</span>).', ['w', 'r', 'q'], function (e) { return 2 * e.q * Math.sqrt(e.w * e.r); }, null, {
      hints: function () { return ['TMS = rapport des prix\u00a0: ' + M('\\dfrac{l}{x}=\\dfrac wr') + '.', 'Contrainte ' + M('xl=q^2') + '.']; },
      steps: function () { return [M('l/x=w/r\\Rightarrow l=\\dfrac wr x') + '.', M('xl=q^2\\Rightarrow x=q\\sqrt{r/w},\\ l=q\\sqrt{w/r}') + '.', M('C=wx+rl=q\\sqrt{wr}+q\\sqrt{wr}=2q\\sqrt{wr}') + ' : lin\u00e9aire en ' + M('q') + ', rendements constants.']; },
      wrong: [{ ref: function (e) { return e.q * Math.sqrt(e.w * e.r); }, msg: 'Chacun des deux facteurs co\u00fbte ' + M('q\\sqrt{wr}') + '\u00a0: il y a deux termes \u00e0 additionner.' }]
    });
  LIT('n3-12', 'prod', S2, 'Co\u00fbt fixe : taille minimisant le co\u00fbt moyen', ['couts', 'echelle', 'maths-opt'],
    'Co\u00fbt ' + M('C(q)=wq^2+F') + '. Donne la quantit\u00e9 ' + M('q^*') + ' qui minimise le co\u00fbt moyen (saisis <span class="pv-kbd">F</span> et <span class="pv-kbd">w</span>).', ['F', 'w'], function (e) { return Math.sqrt(e.F / e.w); }, null, {
      hints: function () { return [M('CM=wq+\\dfrac Fq') + ' et ' + M('Cm=2wq') + '.', 'Au minimum de ' + M('CM') + ' on a ' + M('CM=Cm') + '.']; },
      steps: function () { return [M('CM=wq+\\dfrac Fq') + ', ' + M('Cm=2wq') + '.', M('CM=Cm\\iff \\dfrac Fq=wq\\iff q^*=\\sqrt{F/w}') + '.', 'Pour ' + M('q<q^*') + '\u00a0: \u00e9conomies d\u2019\u00e9chelle\u00a0; pour ' + M('q>q^*') + ' : d\u00e9s\u00e9conomies.']; }
    });
  var ACD = function (id, th, sec, title, notions, stmt, ref, extra) { LIT(id, th, sec, title, notions, stmt, ['a', 'c', 'd'], ref, samp.ac, extra); };
  var HEAD = 'Demande inverse ' + M('P(q)=a-q') + ', co\u00fbt ' + M('C(q)=cq+\\dfrac d2q^2') + ' (' + M('a>c>0,\\ d\\ge0') + '). ';
  ACD('n3-13', 'marche', S3, 'Quantit\u00e9 concurrentielle', ['concurrence', 'couts', 'syntaxe'], HEAD + 'Exprime ' + M('q_c') + ' (comportement concurrentiel ' + M('P=Cm') + ').', function (e) { return (e.a - e.c) / (1 + e.d); }, {
    hints: function () { return [M('a-q=c+dq') + '.']; }, steps: function () { return [M('a-q=c+dq\\iff a-c=(1+d)q') + '.', M('q_c=\\dfrac{a-c}{1+d}') + '.']; },
    wrong: [{ ref: function (e) { return (e.a - e.c) / (2 + e.d); }, msg: 'C\u2019est la quantit\u00e9 de monopole. Ici ' + M('P=Cm') + '\u00a0: ' + M('a-q=c+dq') + '.' }]
  });
  ACD('n3-14', 'marche', S3, 'Prix concurrentiel', ['concurrence'], HEAD + 'Exprime le prix ' + M('p_c') + '.', function (e) { return (e.c + e.a * e.d) / (1 + e.d); }, {
    hints: function () { return ['Le prix se lit sur la demande\u00a0: ' + M('p_c=a-q_c') + '.']; }, steps: function () { return [M('p_c=a-\\dfrac{a-c}{1+d}=\\dfrac{a(1+d)-(a-c)}{1+d}=\\dfrac{c+ad}{1+d}') + '.', 'Contr\u00f4le\u00a0: ' + M('Cm(q_c)=c+d q_c=\\dfrac{c+ad}{1+d}') + '.']; }
  });
  ACD('n3-15', 'marche', S3, 'Surplus du consommateur \u00e0 la concurrence', ['surplus', 'quasi', 'concurrence'], HEAD + 'Exprime ' + M('\\mathrm{Sc}_c=U(q_c)-U(0)-p_cq_c') + ' (avec ' + M('U\u2019=P') + ').', function (e) { return Math.pow(e.a - e.c, 2) / (2 * Math.pow(1 + e.d, 2)); }, {
    hints: function () { return [M('U(q)=aq-\\frac{q^2}{2}') + ' et ' + M('p_c=a-q_c') + '.']; },
    steps: function () { return [M('U(q_c)=aq_c-\\dfrac{q_c^2}{2}') + ', ' + M('p_cq_c=aq_c-q_c^2') + '.', M('\\mathrm{Sc}_c=\\dfrac{q_c^2}{2}=\\dfrac{(a-c)^2}{2(1+d)^2}') + '.']; },
    wrong: [{ ref: function (e) { return Math.pow(e.a - e.c, 2) / (2 * (1 + e.d)); }, msg: 'Tu as donn\u00e9 le bien-\u00eatre total ' + M('W_c=\\mathrm{Sc}_c+\\pi_c') + '.' }]
  });
  ACD('n3-16', 'marche', S3, 'Profit \u00e0 la concurrence', ['concurrence', 'couts'], HEAD + 'Exprime le profit ' + M('\\pi_c=p_cq_c-C(q_c)') + '.', function (e) { return e.d * Math.pow(e.a - e.c, 2) / (2 * Math.pow(1 + e.d, 2)); }, {
    hints: function () { return ['Utilise ' + M('p_c=c+dq_c') + '.']; },
    steps: function () { return [M('p_cq_c=cq_c+dq_c^2') + ' et ' + M('C(q_c)=cq_c+\\frac d2q_c^2') + '.', M('\\pi_c=\\dfrac d2q_c^2=\\dfrac{d(a-c)^2}{2(1+d)^2}') + '.']; }
  });
  ACD('n3-17', 'monopole', S3, 'Quantit\u00e9 de monopole', ['monopole', 'maths-opt'], HEAD + 'Exprime ' + M('q_m') + '.', function (e) { return (e.a - e.c) / (2 + e.d); }, {
    hints: function () { return [M('R\u2019(q)=a-2q') + ' ; ' + M('R\u2019=Cm') + '.']; }, steps: function () { return [M('a-2q=c+dq\\iff a-c=(2+d)q') + '.', M('q_m=\\dfrac{a-c}{2+d}') + '.']; },
    wrong: [{ ref: function (e) { return (e.a - e.c) / (1 + e.d); }, msg: 'C\u2019est la quantit\u00e9 concurrentielle. Le monopole utilise ' + M('R\u2019=a-2q') + ' (non ' + M('P') + ').' }]
  });
  ACD('n3-18', 'monopole', S3, 'Prix de monopole', ['monopole'], HEAD + 'Exprime ' + M('p_m') + '.', function (e) { return (e.a * (1 + e.d) + e.c) / (2 + e.d); }, {
    hints: function () { return ['Le prix se lit sur la demande\u00a0: ' + M('p_m=a-q_m') + '.']; }, steps: function () { return [M('p_m=a-\\dfrac{a-c}{2+d}=\\dfrac{a(2+d)-(a-c)}{2+d}=\\dfrac{a(1+d)+c}{2+d}') + '.']; },
    wrong: [{ ref: function (e) { return (e.a - e.c) / (2 + e.d); }, msg: 'Tu as donn\u00e9 ' + M('q_m') + '. Le prix se lit sur la demande\u00a0: ' + M('p_m=a-q_m') + '.' }]
  });
  ACD('n3-19', 'monopole', S3, 'Perte s\u00e8che de monopole', ['perte', 'monopole', 'bienetre'], HEAD + 'Exprime la perte s\u00e8che ' + M('DWL=W(q_c)-W(q_m)') + ', avec ' + M('W(q)=(a-c)q-\\frac{1+d}{2}q^2') + '.', function (e) { return Math.pow(e.a - e.c, 2) / (2 * (1 + e.d) * Math.pow(2 + e.d, 2)); }, {
    hints: function () { return ['Option g\u00e9om\u00e9trique\u00a0: triangle de base ' + M('q_c-q_m') + ' et de hauteur ' + M('P(q_m)-Cm(q_m)') + '.']; },
    steps: function () { return ['Base\u00a0: ' + M('q_c-q_m=\\dfrac{a-c}{(1+d)(2+d)}') + '\u00a0; hauteur\u00a0: ' + M('\\dfrac{a-c}{2+d}') + '.', M('DWL=\\dfrac12\\cdot\\dfrac{a-c}{(1+d)(2+d)}\\cdot\\dfrac{a-c}{2+d}=\\dfrac{(a-c)^2}{2(1+d)(2+d)^2}') + '.']; }
  });
  LIT('n3-20', 'societe', S4, 'Bien-\u00eatre net avec co\u00fbt fixe', ['bienetre', 'maths-opt'],
    'Demande ' + M('D(p)=\\dfrac{a-p}{2}') + ' (donc ' + M('P(q)=a-2q') + '), co\u00fbt ' + M('C(q)=cq+F') + '. Le bien-\u00eatre maximal est atteint pour ' + M('P(q)=c') + '. Donne ' + M('W^*') + ' (saisis <span class="pv-kbd">a</span>, <span class="pv-kbd">c</span>, <span class="pv-kbd">F</span>).', ['a', 'c', 'F'], function (e) { return Math.pow(e.a - e.c, 2) / 4 - e.F; }, function () { var c = 0.5 + Math.random() * 2; return { a: c + 0.5 + Math.random() * 5, c: c, F: Math.random() * 3 }; }, {
      hints: function () { return [M('U(q)=aq-q^2') + ', ' + M('q^*=\\frac{a-c}{2}') + '.']; },
      steps: function () { return [M('P(q)=c\\Rightarrow q^*=\\dfrac{a-c}{2}') + '.', M('W=aq-q^2-cq-F=(a-c)q^*-q^{*2}-F=\\dfrac{(a-c)^2}{4}-F') + '.', 'Il est utile de produire seulement si ' + M('F<\\dfrac{(a-c)^2}{4}') + '.']; }
    });
  ACD('n3-21', 'societe', S4, 'Quantit\u00e9 optimale (rendements d\u00e9croissants)', ['bienetre', 'maths-opt'], 'Demande ' + M('D(p)=\\dfrac{a-p}{2}') + ' (' + M('P(q)=a-2q') + '), co\u00fbt ' + M('C(q)=cq+dq^2') + '. Quantit\u00e9 optimale ' + M('q^*') + ' (maximise ' + M('W=U-C') + ')\u00a0?', function (e) { return (e.a - e.c) / (2 * (1 + e.d)); }, {
    hints: function () { return ['CPO\u00a0: ' + M('P(q)=Cm(q)') + ' avec ' + M('Cm=c+2dq') + '.']; },
    steps: function () { return [M('a-2q=c+2dq\\iff a-c=2(1+d)q') + '.', M('q^*=\\dfrac{a-c}{2(1+d)}') + '.']; },
    wrong: [{ ref: function (e) { return (e.a - e.c) / (2 + e.d); }, msg: 'Le co\u00fbt marginal est ' + M('c+2dq') + ' (et non ' + M('c+dq') + ').' }]
  });
  ACD('n3-22', 'societe', S4, 'Prix optimal (rendements d\u00e9croissants)', ['bienetre'], 'M\u00eame contexte que l\u2019exercice pr\u00e9c\u00e9dent. Exprime le prix optimal ' + M('p^*=P(q^*)') + '.', function (e) { return (e.c + e.a * e.d) / (1 + e.d); }, {
    hints: function () { return [M('p^*=a-2q^*') + '.']; },
    steps: function () { return [M('p^*=a-2q^*=a-\\dfrac{a-c}{1+d}=\\dfrac{c+ad}{1+d}') + '.', 'Contr\u00f4le\u00a0: ' + M('Cm(q^*)=c+2dq^*=\\dfrac{c+ad}{1+d}') + '.']; }
  });

  /* =========================== NIVEAU 4 (probl\u00e8mes) =========================== */
  var vr = function (a, c, d) { return { a: a, c: c, d: d }; };
  ex('n4-01', 4, 'monopole', 'Probl\u00e8mes de synth\u00e8se', 'Monopole et rendements d\u00e9croissants (TD 2, ex. 1.1)', ['monopole', 'perte', 'echelle'], {
    gen: function () { var t = pick([[10, 2, 1], [12, 2, 2], [14, 2, 1], [10, 4, 2]]); return { a: t[0], c: t[1], d: t[2] }; },
    intro: function (P) { return 'Un monopole a le co\u00fbt ' + M('C(q)=cq+\\dfrac d2q^2') + ' face \u00e0 ' + M('D(p)=\\max\\{a-p,0\\}') + '. Valeurs de l\u2019instance\u00a0: ' + M('a=' + P.a + ',\\ c=' + P.c + ',\\ d=' + P.d) + '.'; },
    parts: [
      { label: '1) Rendements', kind: 'mcq', stmt: function () { return 'Les rendements d\u2019\u00e9chelle sont constants si et seulement si\u2026'; }, choices: function () { return [M('d=0'), M('d>0'), M('c=0'), M('d=c')]; }, correct: function () { return 0; },
        hints: function () { return ['Compare ' + M('CM=c+\\frac d2q') + ' et ' + M('Cm=c+dq') + '.']; }, steps: function () { return [M('CM=Cm\\iff d=0') + '.']; } },
      { label: '2) Bien-\u00eatre concurrentiel', kind: 'expr', vars: ['a', 'c', 'd'], sample: samp.ac, stmt: function () { return 'Exprime ' + M('W_c=\\mathrm{Sc}_c+\\pi_c') + ' (saisie\u00a0: <span class="pv-kbd">a</span>, <span class="pv-kbd">c</span>, <span class="pv-kbd">d</span>).'; }, ref: function (e) { return Math.pow(e.a - e.c, 2) / (2 * (1 + e.d)); },
        hints: function () { return [M('\\mathrm{Sc}_c=\\frac{q_c^2}{2}') + ', ' + M('\\pi_c=\\frac d2q_c^2') + ' avec ' + M('q_c=\\frac{a-c}{1+d}') + '.']; },
        steps: function () { return [M('W_c=\\dfrac{1+d}{2}q_c^2=\\dfrac{(a-c)^2}{2(1+d)}') + '.']; } },
      { label: '3) Perte s\u00e8che relative', kind: 'expr', vars: ['d'], sample: function () { return { d: Math.random() * 4 }; }, stmt: function () { return 'Exprime ' + M('DWL/W_c') + ' uniquement en fonction de ' + M('d') + ' (on rappelle ' + M('DWL=\\dfrac{(a-c)^2}{2(1+d)(2+d)^2}') + ').'; }, ref: function (e) { return 1 / Math.pow(2 + e.d, 2); },
        hints: function () { return ['Divise ' + M('DWL') + ' par ' + M('W_c') + ' et simplifie.']; }, steps: function () { return [M('\\dfrac{DWL}{W_c}=\\dfrac{(a-c)^2}{2(1+d)(2+d)^2}\\times\\dfrac{2(1+d)}{(a-c)^2}=\\dfrac1{(2+d)^2}') + '.']; } },
      { label: '4) Application', kind: 'num', stmt: function (P) { return 'Avec ' + M('d=' + P.d) + ', quelle est la perte s\u00e8che relative en pourcentage\u00a0?'; }, answer: function (P) { return 100 / Math.pow(2 + P.d, 2); }, unit: '%', tol: { abs: 0.1 },
        hints: function () { return [M('100/(2+d)^2') + '.']; }, steps: function (P) { return [M('\\dfrac{100}{(2+' + P.d + ')^2}=' + f(100 / Math.pow(2 + P.d, 2), 2) + '\\,\\%') + '.']; } },
      { label: '5) Interpr\u00e9tation', kind: 'mcq', stmt: function () { return 'La perte s\u00e8che relative est la plus forte lorsque\u2026'; }, choices: function () { return ['les rendements sont constants (' + M('d=0') + ')', 'les rendements sont tr\u00e8s d\u00e9croissants (' + M('d') + ' grand)', 'elle ne d\u00e9pend pas de ' + M('d')]; }, correct: function () { return 0; },
        steps: function () { return [M('1/(2+d)^2') + ' est d\u00e9croissante en ' + M('d') + '\u00a0: 25\u00a0% pour ' + M('d=0') + '. Un co\u00fbt marginal croissant limite l\u2019\u00e9cart ' + M('q_c-q_m') + '.']; } }
    ]
  });
  ex('n4-02', 4, 'monopole', 'Probl\u00e8mes de synth\u00e8se', 'Le dirigeant et le chiffre d\u2019affaires (TD 2, ex. 1.2)', ['pdg', 'monopole', 'bienetre', 'elasticite'], {
    gen: function () { var t = pick([[10, 6], [9, 6], [8, 6], [10, 8]]); return { a: t[0], c: t[1] }; },
    intro: function (P) { return 'Un dirigeant maximise ' + M('G_\\theta=\\theta R+(1-\\theta)\\Pi') + ' avec ' + M('P(q)=a-q') + ', ' + M('C(q)=cq') + ', ' + M('a=' + P.a + ',\\ c=' + P.c) + '.'; },
    parts: [
      { label: '1) Quantit\u00e9', kind: 'expr', vars: ['a', 'c', 'theta'], sample: function () { var c = 1 + Math.random() * 3; return { a: c + 0.5 + Math.random() * 4, c: c, theta: Math.random() }; }, stmt: function () { return 'Exprime ' + M('q_\\theta') + ' (saisis <span class="pv-kbd">a</span>, <span class="pv-kbd">c</span>, <span class="pv-kbd">theta</span>).'; }, ref: function (e) { return (e.a - (1 - e.theta) * e.c) / 2; },
        hints: function () { return [M('G_\\theta=R-(1-\\theta)cq') + ', puis CPO.']; }, steps: function () { return [M('G_\\theta(q)=(a-(1-\\theta)c)q-q^2') + '.', M('G_\\theta\u2019=0\\Rightarrow q_\\theta=\\dfrac{a-(1-\\theta)c}{2}') + '.']; },
        wrong: [{ ref: function (e) { return (e.a - e.c) / 2; }, msg: 'C\u2019est la quantit\u00e9 de monopole (' + M('\\theta=0') + '). Tiens compte de ' + M('\\theta') + '\u00a0: le co\u00fbt marginal effectif est ' + M('(1-\\theta)c') + '.' }] },
      { label: '2) Prix', kind: 'expr', vars: ['a', 'c', 'theta'], sample: function () { var c = 1 + Math.random() * 3; return { a: c + 0.5 + Math.random() * 4, c: c, theta: Math.random() }; }, stmt: function () { return 'Exprime le prix ' + M('p_\\theta') + '.'; }, ref: function (e) { return (e.a + (1 - e.theta) * e.c) / 2; },
        hints: function () { return [M('p_\\theta=a-q_\\theta') + '.']; }, steps: function () { return [M('p_\\theta=a-\\dfrac{a-(1-\\theta)c}{2}=\\dfrac{a+(1-\\theta)c}{2}') + ', d\u00e9croissant en ' + M('\\theta') + '.']; } },
      { label: '3) \u03b8 optimal', kind: 'expr', vars: ['a', 'c'], sample: function () { var c = 1 + Math.random() * 3; return { a: c + 0.5 + Math.random() * 4, c: c }; }, stmt: function () { return 'Exprime la valeur ' + M('\\theta^*') + ' pour laquelle ' + M('q_\\theta') + ' co\u00efncide avec l\u2019optimum social ' + M('q_c=a-c') + '.'; }, ref: function (e) { return (e.a - e.c) / e.c; },
        hints: function () { return ['R\u00e9sous ' + M('\\dfrac{a-(1-\\theta)c}{2}=a-c') + '.']; }, steps: function () { return [M('a-c+\\theta c=2(a-c)\\Rightarrow\\theta^*=\\dfrac{a-c}{c}') + '.']; } },
      { label: '4) Condition', kind: 'mcq', stmt: function () { return 'Ce ' + M('\\theta^*') + ' est r\u00e9alisable (' + M('\\theta^*\\le1') + ') si et seulement si\u2026'; }, choices: function () { return [M('a\\le 2c'), M('a\\ge2c'), M('a\\le c'), 'toujours']; }, correct: function () { return 0; },
        steps: function () { return [M('\\dfrac{a-c}{c}\\le1\\iff a\\le2c') + '.']; } },
      { label: '5) Application', kind: 'num', stmt: function (P) { return 'Pour ' + M('a=' + P.a + ',\\ c=' + P.c) + ', calcule le bien-\u00eatre atteint en ' + M('\\theta^*') + ' (' + M('W=\\frac{(a-c)^2}{2}') + ').'; }, answer: function (P) { return Math.pow(P.a - P.c, 2) / 2; }, steps: function (P) { return [M('\\theta^*=' + f((P.a - P.c) / P.c, 3) + '\\le1') + '\u00a0; ' + M('W=\\dfrac{(' + (P.a - P.c) + ')^2}{2}=' + f(Math.pow(P.a - P.c, 2) / 2)) + '.']; } },
      { label: '6) Discussion', kind: 'mcq', stmt: function () { return 'La maximisation du profit pur (' + M('\\theta=0') + ') est-elle souhaitable pour le bien-\u00eatre\u00a0?'; }, choices: function () { return ['Non\u00a0: le monopole produit trop peu (' + M('q_m<q_c') + ') et un l\u00e9ger biais pour le volume am\u00e9liore ' + M('W'), 'Oui\u00a0: le profit mesure toujours la valeur sociale', 'Oui, car ' + M('p=c') + ' \u00e0 l\u2019optimum du monopole'];  }, correct: function () { return 0; },
        steps: function () { return [M('DWL_\\theta=\\dfrac{(a-c-\\theta c)^2}{8}') + ' est strictement positive en ' + M('\\theta=0') + ' et d\u00e9cro\u00eet avec ' + M('\\theta') + ' jusqu\u2019\u00e0 ' + M('\\theta^*') + '.']; } }
    ]
  });
  ex('n4-03', 4, 'societe', 'Probl\u00e8mes de synth\u00e8se', 'Prix optimal et rendements d\u00e9croissants (TD 1, ex. 3.4)', ['bienetre', 'maths-opt', 'couts'], {
    gen: function () { var t = pick([[10, 2, 1], [12, 4, 3], [8, 2, 2]]); return { a: t[0], c: t[1], d: t[2] }; },
    intro: function (P) { return M('D(p)=\\dfrac{a-p}{2}') + ' (donc ' + M('P(q)=a-2q') + '), ' + M('C(q)=cq+dq^2') + ' avec ' + M('a=' + P.a + ',\\ c=' + P.c + ',\\ d=' + P.d) + '. On cherche l\u2019optimum social (' + M('P=Cm') + ').'; },
    parts: [
      { label: '1) Quantit\u00e9', kind: 'expr', vars: ['a', 'c', 'd'], sample: samp.ac, stmt: function () { return 'Exprime ' + M('q^*') + '.'; }, ref: function (e) { return (e.a - e.c) / (2 * (1 + e.d)); }, hints: function () { return [M('a-2q=c+2dq') + '.']; }, steps: function () { return [M('q^*=\\dfrac{a-c}{2(1+d)}') + '.']; } },
      { label: '2) Prix', kind: 'expr', vars: ['a', 'c', 'd'], sample: samp.ac, stmt: function () { return 'Exprime ' + M('p^*=P(q^*)') + '.'; }, ref: function (e) { return (e.c + e.a * e.d) / (1 + e.d); }, steps: function () { return [M('p^*=a-2q^*=\\dfrac{c+ad}{1+d}') + '.']; } },
      { label: '3) Sensibilit\u00e9', kind: 'expr', vars: ['a', 'c', 'd'], sample: samp.ac, stmt: function () { return 'Calcule ' + M('\\dfrac{\\partial p^*}{\\partial d}') + '.'; }, ref: function (e) { return (e.a - e.c) / Math.pow(1 + e.d, 2); },
        hints: function () { return ['Quotient\u00a0: ' + M('\\left(\\frac{u}{v}\\right)\u2019=\\frac{u\u2019v-uv\u2019}{v^2}') + ' avec ' + M('u=c+ad') + ', ' + M('v=1+d') + '.']; }, steps: function () { return [M('\\dfrac{a(1+d)-(c+ad)}{(1+d)^2}=\\dfrac{a-c}{(1+d)^2}') + '.']; } },
      { label: '4) Interpr\u00e9tation', kind: 'mcq', stmt: function () { return 'Quand ' + M('d') + ' augmente (rendements plus d\u00e9croissants), le prix optimal\u2026'; }, choices: function () { return ['augmente (car ' + M('a>c') + ')', 'diminue', 'ne change pas']; }, correct: function () { return 0; }, steps: function () { return ['Le co\u00fbt marginal croissant plus vite rend les unit\u00e9s suppl\u00e9mentaires plus ch\u00e8res\u00a0: ' + M('p^*') + ' monte, ' + M('q^*') + ' baisse.']; } }
    ]
  });
  ex('n4-04', 4, 'societe', 'Probl\u00e8mes de synth\u00e8se', 'Faut-il produire\u00a0? (co\u00fbt fixe, TD 1 ex. 3.2)', ['bienetre', 'couts'], {
    gen: function () { var F = pick([6, 12, 20]); return { a: 10, c: 2, F: F }; },
    intro: function (P) { return M('D(p)=\\dfrac{a-p}{2}') + ', ' + M('C(q)=cq+F') + ', ' + M('a=' + P.a + ',\\ c=' + P.c + ',\\ F=' + P.F) + '.'; },
    parts: [
      { label: '1) Quantit\u00e9 optimale', kind: 'expr', vars: ['a', 'c'], sample: function () { var c = 1 + Math.random() * 2; return { a: c + 1 + Math.random() * 5, c: c }; }, stmt: function () { return 'Exprime ' + M('q^*') + ' (o\u00f9 ' + M('P(q)=c') + ').'; }, ref: function (e) { return (e.a - e.c) / 2; }, steps: function () { return [M('a-2q=c\\Rightarrow q^*=\\dfrac{a-c}{2}') + '.']; } },
      { label: '2) Bien-\u00eatre net', kind: 'expr', vars: ['a', 'c', 'F'], sample: function () { var c = 1 + Math.random() * 2; return { a: c + 1 + Math.random() * 5, c: c, F: Math.random() * 4 }; }, stmt: function () { return 'Exprime ' + M('W^*') + ' (co\u00fbt fixe inclus).'; }, ref: function (e) { return Math.pow(e.a - e.c, 2) / 4 - e.F; }, steps: function () { return [M('W^*=\\dfrac{(a-c)^2}{4}-F') + '.']; } },
      { label: '3) Seuil', kind: 'num', stmt: function (P) { return 'Quelle valeur maximale de ' + M('F') + ' rend la production socialement utile pour ' + M('a=' + P.a + ',\\ c=' + P.c) + '\u00a0?'; }, answer: function (P) { return Math.pow(P.a - P.c, 2) / 4; }, steps: function (P) { return [M('F_{max}=\\dfrac{(a-c)^2}{4}=\\dfrac{' + Math.pow(P.a - P.c, 2) + '}{4}=' + Math.pow(P.a - P.c, 2) / 4) + '.']; } },
      { label: '4) D\u00e9cision', kind: 'mcq', stmt: function (P) { return 'Avec ' + M('F=' + P.F) + ', la production est-elle socialement souhaitable\u00a0?'; }, choices: function () { return ['Oui', 'Non']; }, correct: function (P) { return P.F < 16 ? 0 : 1; }, steps: function (P) { return [M('F=' + P.F + (P.F < 16 ? '<' : '>') + '16') + ', donc ' + (P.F < 16 ? 'oui\u00a0: ' + M('W^*>0') + '.' : 'non\u00a0: ' + M('W^*<0') + ' (le co\u00fbt fixe n\u2019est pas couvert par le surplus).')]; } }
    ]
  });
  ex('n4-05', 4, 'societe', 'Probl\u00e8mes de synth\u00e8se', 'Demande logarithmique (TD 1, ex. 3.3)', ['bienetre', 'maths-log', 'quasi'], {
    gen: function () { return { g: pick([2, 3, 4]), c: pick([0.5, 1]) }; },
    intro: function (P) { return M('D(p)=\\dfrac1\\gamma\\ln\\dfrac\\gamma p') + ' (' + M('u(x)=-e^{-\\gamma x}') + '), co\u00fbt unitaire ' + M('c') + '. Instance\u00a0: ' + M('\\gamma=' + P.g + ',\\ c=' + f(P.c)) + '.'; },
    parts: [
      { label: '1) Utilit\u00e9', kind: 'expr', vars: ['gamma', 'q'], sample: function () { return { gamma: 1 + Math.random() * 3, q: 0.2 + Math.random() * 2 }; }, stmt: function () { return 'Avec ' + M('U\u2019(q)=P(q)=\\gamma e^{-\\gamma q}') + ' et ' + M('U(0)=0') + ' (utilit\u00e9 normalis\u00e9e), exprime ' + M('U(q)') + ' (saisie\u00a0: <span class="pv-kbd">exp(...)</span>).'; }, ref: function (e) { return 1 - Math.exp(-e.gamma * e.q); }, steps: function () { return [M('U(q)=\\int_0^q\\gamma e^{-\\gamma t}dt=1-e^{-\\gamma q}') + '.']; } },
      { label: '2) Optimum', kind: 'expr', vars: ['gamma', 'c'], sample: function () { var g = 1.5 + Math.random() * 3; return { gamma: g, c: 0.2 + Math.random() * (g - 0.4) }; }, stmt: function () { return 'Quantit\u00e9 optimale ' + M('q^*') + ' (\u00e9gale ' + M('P(q)=c') + ').'; }, ref: function (e) { return Math.log(e.gamma / e.c) / e.gamma; }, steps: function () { return [M('\\gamma e^{-\\gamma q}=c\\Rightarrow q^*=\\dfrac1\\gamma\\ln\\dfrac\\gamma c') + '.']; } },
      { label: '3) Bien-\u00eatre', kind: 'num', stmt: function (P) { return 'Calcule ' + M('W^*=U(q^*)-cq^*') + ' pour ' + M('\\gamma=' + P.g + ',\\ c=' + f(P.c)) + '.'; }, answer: function (P) { return 1 - P.c / P.g - (P.c / P.g) * Math.log(P.g / P.c); }, tol: { abs: 0.006 },
        hints: function () { return [M('U(q^*)=1-e^{-\\gamma q^*}=1-c/\\gamma') + '.']; }, steps: function (P) { var q = Math.log(P.g / P.c) / P.g; return [M('q^*=' + f(q, 4)) + ', ' + M('U(q^*)=1-c/\\gamma=' + f(1 - P.c / P.g, 4)) + '.', M('W^*=' + f(1 - P.c / P.g, 4) + '-' + f(P.c, 2) + '\\times' + f(q, 4) + '=' + f(1 - P.c / P.g - P.c * q, 4)) + '.']; } },
      { label: '4) Cas limite', kind: 'mcq', stmt: function () { return 'Si ' + M('c\\ge\\gamma') + ' (co\u00fbt sup\u00e9rieur \u00e0 la disposition \u00e0 payer maximale ' + M('P(0)=\\gamma') + '), que vaut ' + M('q^*') + '\u00a0?'; }, choices: function () { return [M('q^*=0') + ' : il ne faut pas produire', M('q^*>0') + ' mais petit', 'Impossible \u00e0 dire']; }, correct: function () { return 0; }, steps: function () { return ['Le prix maximal que paie le consommateur est ' + M('\\gamma') + '\u00a0: aucune unit\u00e9 ne vaut son co\u00fbt, donc ' + M('q^*=0') + '.']; } }
    ]
  });
  ex('n4-06', 4, 'conso', 'Probl\u00e8mes de synth\u00e8se', 'Quatre pr\u00e9f\u00e9rences, un m\u00eame prix (bilan TD 1)', ['surplus', 'quasi', 'maths-log'], {
    gen: function () { return {}; },
    intro: function () { return 'Prix ' + M('p_0=0{,}4') + '. Param\u00e8tres\u00a0: Cobb-Douglas ' + M('\\alpha=\\tfrac12') + ', quadratique ' + M('a=1') + ', logarithmique ' + M('\\beta=1') + ', exponentielle ' + M('\\gamma=1') + '. Calcule le surplus dans chaque cas (' + M('\\mathrm{Sc}=U(q)-U(0)-p_0q') + ').'; },
    parts: [
      { label: '1) Cobb-Douglas', kind: 'num', stmt: function () { return M('u=\\sqrt x') + ', ' + M('q=(0{,}5/0{,}4)^2') + '. Calcule ' + M('\\mathrm{Sc}') + '.'; }, answer: function () { return 0.625; }, tol: { abs: 0.006 }, steps: function () { return [M('q=1{,}5625') + ', ' + M('U=\\sqrt q=1{,}25') + ', ' + M('p_0q=0{,}625') + '.', M('\\mathrm{Sc}=0{,}625') + '.']; } },
      { label: '2) Quadratique', kind: 'num', stmt: function () { return M('D(p)=\\frac{1-p}2') + '. Calcule ' + M('\\mathrm{Sc}=\\dfrac{(a-p)^2}{4}') + '.'; }, answer: function () { return 0.09; }, tol: { abs: 0.004 }, steps: function () { return [M('\\dfrac{(1-0{,}4)^2}{4}=0{,}09') + '.']; } },
      { label: '3) Logarithmique', kind: 'num', stmt: function () { return 'Calcule ' + M('\\mathrm{Sc}=\\ln(1/p_0)-1+p_0') + '.'; }, answer: function () { return Math.log(2.5) - 0.6; }, tol: { abs: 0.006 }, steps: function () { return [M('\\ln(2{,}5)-1+0{,}4=0{,}3163') + '.']; } },
      { label: '4) Exponentielle', kind: 'num', stmt: function () { return 'Calcule ' + M('\\mathrm{Sc}=1-p_0-p_0\\ln(1/p_0)') + '.'; }, answer: function () { return 1 - 0.4 - 0.4 * Math.log(2.5); }, tol: { abs: 0.006 }, steps: function () { return [M('1-0{,}4-0{,}4\\times0{,}9163=0{,}2335') + '.']; } },
      { label: '5) Classement', kind: 'mcq', stmt: function () { return 'Classe par surplus d\u00e9croissant.'; }, choices: function () { return ['Cobb-Douglas > logarithmique > exponentielle > quadratique', 'Quadratique > exponentielle > logarithmique > Cobb-Douglas', 'Logarithmique > Cobb-Douglas > exponentielle > quadratique']; }, correct: function () { return 0; }, steps: function () { return [M('0{,}625>0{,}316>0{,}234>0{,}09') + '.']; } }
    ]
  });
  ex('n4-07', 4, 'societe', 'Probl\u00e8mes de synth\u00e8se', 'Optimum social Cobb-Douglas (TD 1, ex. 3.1)', ['bienetre', 'demande', 'surplus'], {
    gen: function () { return { al: 0.5, c: pick([0.25, 0.5]) }; },
    intro: function (P) { return M('D(p)=(\\alpha/p)^{\\frac1{1-\\alpha}}') + ' (' + M('u(x)=x^{\\alpha}') + '), co\u00fbt unitaire ' + M('c') + '. Instance\u00a0: ' + M('\\alpha=\\tfrac12,\\ c=' + f(P.c, 2)) + '.'; },
    parts: [
      { label: '1) Optimum', kind: 'expr', vars: ['alpha', 'c'], sample: function () { return { alpha: 0.2 + Math.random() * 0.6, c: 0.2 + Math.random() * 1.2 }; }, stmt: function () { return 'L\u2019optimum social impose ' + M('P(q)=c') + ', donc ' + M('D(c)') + '. Exprime ' + M('q^*') + ' (saisie <span class="pv-kbd">(alpha/c)^(1/(1-alpha))</span>).'; }, ref: function (e) { return Math.pow(e.alpha / e.c, 1 / (1 - e.alpha)); }, steps: function () { return [M('q^*=D(c)=\\left(\\dfrac\\alpha c\\right)^{\\frac1{1-\\alpha}}') + '.']; } },
      { label: '2) Bien-\u00eatre', kind: 'num', stmt: function (P) { return 'Calcule ' + M('W^*=U(q^*)-cq^*') + ' pour ' + M('\\alpha=\\frac12,\\ c=' + f(P.c, 2)) + '.'; }, answer: function (P) { var q = Math.pow(0.5 / P.c, 2); return Math.sqrt(q) - P.c * q; }, tol: { abs: 0.006 },
        hints: function () { return ['On a ' + M('cq^*=\\alpha q^{*\\alpha}') + ' donc ' + M('W^*=(1-\\alpha)q^{*\\alpha}') + '.']; }, steps: function (P) { var q = Math.pow(0.5 / P.c, 2); return [M('q^*=(0{,}5/' + f(P.c, 2) + ')^2=' + f(q, 4)) + '.', M('U=\\sqrt{q^*}=' + f(Math.sqrt(q), 4) + ',\\ cq^*=' + f(P.c * q, 4)) + '.', M('W^*=' + f(Math.sqrt(q) - P.c * q, 4)) + '.']; } }
    ]
  });
})();
