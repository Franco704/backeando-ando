/* Motor de la guía: índice, rutas por hash, progreso, cuestionarios, repaso y laboratorios. */
(() => {
  const { UNITS, LESSONS, LABS } = window.GUIDE;
  // Solo los módulos que ya tienen lecciones cargadas
  const MODULES = window.GUIDE.MODULES.filter((m) => LESSONS.some((l) => l.module === m.id));
  const $ = (s, el = document) => el.querySelector(s);
  // Guías hermanas: página publicada y repositorio de cada una
  const SIBLINGS = [
    ['Fronteando Ando', 'Desarrollo frontend (HTML, CSS, JavaScript, React)', 'fronteando-ando'],
    ['Diseñando Ando', 'Diseño de Sistemas de Información (UML, GRASP, GoF)', 'disenando-ando'],
    ['Iterando Ando', 'Matemática Superior (Laplace, métodos numéricos, Fourier)', 'iterando-ando'],
    ['Economizar', 'Economía (micro y macro con gráficas)', 'economizar'],
    ['Modulando Ando', 'Comunicación de Datos (señales, Shannon, errores, modulación)', 'modulando-ando'],
  ];
  const main = $('#main');
  const toc = $('#toc');
  const rail = $('#rail');
  const sidebar = $('#sidebar');
  const scrim = $('#scrim');
  const menuBtn = $('#menuBtn');

  // ---------- Almacenamiento (puede fallar en modo privado) ----------
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  let done = new Set(store.get('ba-done', []));
  // Resultado por pregunta: { [qid]: { ok, tries } }. qid = leccion:indice
  let answers = store.get('ba-answers', {});
  let best = store.get('ba-best', {});
  const saveAnswers = () => store.set('ba-answers', answers);

  // Todas las preguntas con su id, módulo y lección
  const QUESTIONS = LESSONS.flatMap((l) => (l.quiz || []).map((q, i) => ({ ...q, id: `${l.id}:${i}`, lesson: l, module: l.module })));
  const qById = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

  // ---------- Resaltado de sintaxis mínimo ----------
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const CS_KW = 'abstract|as|async|await|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|get|goto|if|implicit|in|init|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|partial|private|protected|public|readonly|record|ref|required|return|sealed|set|short|sizeof|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|using|var|virtual|void|when|where|while|yield|nameof|value|with|from|select|orderby|group|by|into|join|on|equals|let|descending|ascending|and|or|not';
  const JS_KW = 'const|let|var|function|return|if|else|for|while|of|in|new|class|extends|import|from|export|default|async|await|try|catch|finally|throw|typeof|null|undefined|true|false|this|switch|case|break';
  const RULES = {
    cs: new RegExp(`(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|(\\$?@?"(?:[^"\\\\\\n]|\\\\.|"")*"|'(?:[^'\\\\\\n]|\\\\.)')|\\b(${CS_KW})\\b|(\\[[A-Z]\\w*(?:\\([^\\]\\n]*\\))?\\]|\\b[A-Z]\\w*)|\\b(\\d+(?:\\.\\d+)?[mMfFdDL]?)\\b`, 'g'),
    js: new RegExp(`(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|("(?:[^"\\\\\\n]|\\\\.)*"|'(?:[^'\\\\\\n]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\`)|\\b(${JS_KW})\\b|(\\b[A-Z]\\w*)|\\b(\\d+(?:\\.\\d+)?)\\b`, 'g'),
    json: /()("(?:[^"\\\n]|\\.)*"(?=\s*:))|("(?:[^"\\\n]|\\.)*")|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?\b)/g,
    bash: /(#[^\n]*)|("[^"]*"|'[^']*')|(^\$ |\b(?:git|dotnet|cd|mkdir|ls|cat|echo|touch|rm|mv|curl|npm)\b)|(\s--?[\w-]+)/gm,
    http: /(#[^\n]*)|("(?:[^"\\\n]|\\.)*")|(^(?:GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b|HTTP\/[\d.]+)|(^[\w-]+(?=:))|(\b[1-5]\d\d\b)/gm,
    sql: /(--[^\n]*)|('(?:[^'\n]|'')*')|\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|INNER|LEFT|JOIN|ON|AS|AND|OR|NOT|NULL|ORDER|BY|GROUP|TOP|CREATE|TABLE|PRIMARY|KEY|FOREIGN|REFERENCES|OFFSET|ROWS|FETCH|NEXT|ONLY|IN|IS|COUNT|CASCADE)\b|(\[[^\]]+\]|"[^"]+")|\b(\d+)\b/gi,
    xml: /(<!--[\s\S]*?-->)|("[^"]*")|()(<\/?[A-Za-z][\w.:-]*|\/?>)|(\s[\w:.-]+(?==))/g,
  };
  const CLASS = {
    cs: ['tok-c', 'tok-s', 'tok-k', 'tok-t', 'tok-n'],
    js: ['tok-c', 'tok-s', 'tok-k', 'tok-t', 'tok-n'],
    json: ['tok-c', 'tok-a', 'tok-s', 'tok-k', 'tok-n'],
    bash: ['tok-c', 'tok-s', 'tok-k', 'tok-a'],
    http: ['tok-c', 'tok-s', 'tok-k', 'tok-a', 'tok-n'],
    sql: ['tok-c', 'tok-s', 'tok-k', 'tok-t', 'tok-n'],
    xml: ['tok-c', 'tok-s', 'tok-k', 'tok-t', 'tok-a'],
  };
  const ALIAS = { csharp: 'cs', 'c#': 'cs', jsx: 'js', html: 'xml', csproj: 'xml', java: 'cs', text: '', console: '' };
  function highlight(src, lang) {
    const key = ALIAS[lang] ?? lang;
    const re = RULES[key];
    if (!re) return esc(src);
    let out = '', last = 0;
    re.lastIndex = 0;
    for (const m of src.matchAll(re)) {
      if (!m[0]) continue;
      out += esc(src.slice(last, m.index));
      const g = m.slice(1).findIndex((x) => x !== undefined && x !== '');
      out += g < 0 ? esc(m[0]) : `<span class="${CLASS[key][g]}">${esc(m[0])}</span>`;
      last = m.index + m[0].length;
    }
    return out + esc(src.slice(last));
  }

  // Bloques de código: resaltado + botón copiar
  function enhanceCode(root) {
    root.querySelectorAll('pre.code:not([data-ready])').forEach((pre) => {
      const src = pre.textContent;
      pre.dataset.ready = '1';
      pre.innerHTML = `<code>${highlight(src, pre.dataset.lang)}</code>`;
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.textContent = 'Copiar';
      btn.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(src); btn.textContent = 'Copiado'; }
        catch { btn.textContent = 'No se pudo copiar'; }
        setTimeout(() => (btn.textContent = 'Copiar'), 1500);
      });
      pre.appendChild(btn);
    });
  }

  // ---------- Índice ----------
  const lessonsOf = (modId) => LESSONS.filter((l) => l.module === modId);
  const modOf = (id) => MODULES.find((m) => m.id === id);
  const modDone = (m) => lessonsOf(m.id).filter((l) => done.has(l.id)).length;

  function renderToc(filter = '') {
    const q = norm(filter.trim());
    let html = '';
    let n = 0;
    for (const u of UNITS) {
      let unitHtml = '';
      for (const mod of MODULES.filter((m) => m.unit === u.id)) {
        const items = LESSONS.map((l, i) => ({ l, i })).filter(({ l }) => l.module === mod.id);
        const visible = items.filter(({ l }) => !q || norm(`${l.title} ${l.keywords || ''} ${mod.title}`).includes(q));
        n += visible.length;
        if (!visible.length) continue;
        const open = q || visible.some(({ l }) => l.id === currentId()) || currentId() === `quiz/${mod.id}`;
        unitHtml += `<details class="toc-module" ${open ? 'open' : ''}>
          <summary><span>${mod.title}</span><span class="toc-count">${modDone(mod)}/${items.length}</span></summary>
          <ol>${visible.map(({ l, i }) => `<li><a class="toc-link${done.has(l.id) ? ' is-done' : ''}" href="#/${l.id}" data-id="${l.id}">
            <span class="n">${i + 1}</span><span class="t">${l.title}</span><span class="check" aria-hidden="true"></span>${done.has(l.id) ? '<span class="sr-only"> (completada)</span>' : ''}</a></li>`).join('')}
            ${q ? '' : `<li><a class="toc-link toc-quiz" href="#/quiz/${mod.id}" data-id="quiz/${mod.id}"><span class="n" aria-hidden="true">?</span><span class="t">Cuestionario del módulo</span>${best[mod.id] != null ? `<span class="toc-score">${best[mod.id]}%</span>` : ''}</a></li>`}
          </ol></details>`;
      }
      if (unitHtml) html += `<section class="toc-unit"><h2>${u.title}<span>${u.name}</span></h2>${unitHtml}</section>`;
    }
    toc.innerHTML = n ? html : `<p class="toc-empty">No hay temas con “${esc(filter)}”. Probá con otra palabra.</p>`;
    markCurrent();
  }
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function markCurrent() {
    const id = currentId();
    toc.querySelectorAll('.toc-link').forEach((a) => {
      if (a.dataset.id === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  function updateProgress() {
    const total = LESSONS.length;
    const count = LESSONS.filter((l) => done.has(l.id)).length;
    $('#progressFill').style.width = `${(count / total) * 100}%`;
    $('#progressText').textContent = `${count} de ${total}`;
    const pending = reviewIds().length;
    const badge = $('#reviewCount');
    badge.hidden = !pending;
    badge.textContent = pending;
  }
  const reviewIds = () => Object.keys(answers).filter((id) => qById[id] && !answers[id].ok);

  // ---------- Rutas ----------
  const currentId = () => decodeURIComponent(location.hash.replace(/^#\/?/, ''));

  let firstLoad = true;
  async function route() {
    const id = currentId();
    const idx = LESSONS.findIndex((l) => l.id === id);
    // Pantalla de entrada al cambiar de módulo; si mientras tanto cambió el hash, gana la ruta nueva
    if (idx !== -1) { await ANIM.intro(id, firstLoad); if (currentId() !== id) return; }
    firstLoad = false;
    rail.innerHTML = '';
    document.body.dataset.view = 'page';
    if (idx !== -1) renderLesson(idx);
    else if (id.startsWith('quiz/') && modOf(id.slice(5))) renderModuleQuiz(modOf(id.slice(5)));
    else if (id === 'repaso') renderReview();
    else if (id === 'simulacro') renderExam();
    else renderHome();
    renderToc($('#search').value);   // abre el módulo de la página actual
    closeMenu();
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  // ---------- Portada: el curso como el recorrido de un request ----------
  function moduleScore(modId) {
    const qs = QUESTIONS.filter((q) => q.module === modId && answers[q.id]);
    if (qs.length < 3) return null;
    return Math.round((qs.filter((q) => answers[q.id].ok).length / qs.length) * 100);
  }

  function renderHome() {
    document.title = 'Backeando Ando';
    document.body.dataset.view = 'home';
    const resume = LESSONS.find((l) => !done.has(l.id)) || LESSONS[0];
    const curMod = resume.module;
    const curIdx = MODULES.findIndex((m) => m.id === curMod);
    const nEx = LESSONS.reduce((a, l) => a + (l.exercises?.length || 0), 0);
    const nOfficial = LESSONS.reduce((a, l) => a + (l.exercises || []).filter((e) => e.official).length, 0);
    const nLabs = LESSONS.reduce((a, l) => a + (l.labs?.length || 0), 0);

    const stops = MODULES.map((m, i) => {
      const total = lessonsOf(m.id).length;
      const d = modDone(m);
      const state = d === total ? 'done' : i === curIdx ? 'current' : i < curIdx ? 'partial' : '';
      return `<li class="stop ${state}" style="--p:${total ? d / total : 0}">
        <a href="#/${lessonsOf(m.id)[0].id}"><span class="stop-dot" aria-hidden="true"></span><span class="stop-name">${m.stop}</span><span class="sr-only">: ${m.title}, ${d} de ${total} lecciones</span></a></li>`;
    }).join('');

    // Punto débil: módulo con peor resultado en preguntas respondidas
    const scored = MODULES.map((m) => ({ m, s: moduleScore(m.id) })).filter((x) => x.s != null).sort((a, b) => a.s - b.s);
    const weak = scored[0] && scored[0].s < 70 ? scored[0] : null;

    const units = UNITS.map((u) => `
      <section class="home-unit">
        <h2>${u.title}: ${u.name}</h2>
        <ul class="mod-list">${MODULES.filter((m) => m.unit === u.id).map((m) => {
          const total = lessonsOf(m.id).length; const d = modDone(m); const s = moduleScore(m.id);
          return `<li><a href="#/${lessonsOf(m.id)[0].id}">
            <span class="mod-title">${m.title}</span>
            <span class="mod-blurb">${total} lecciones: ${m.blurb}</span>
            <span class="mod-meter" aria-hidden="true"><span style="width:${(d / total) * 100}%"></span></span>
            <span class="mod-meta">${d === total ? 'Completo' : d ? `${d} de ${total} hechas` : 'Sin empezar'}${s != null ? `, ${s}% de aciertos` : ''}</span>
          </a></li>`;
        }).join('')}</ul>
      </section>`).join('');

    main.innerHTML = `
      <article class="home">
        <header class="hero">
          <p class="hero-kicker">Desarrollo de Software 2026, UTN-FRT</p>
          <h1>Backend desde cero, del primer objeto al <code>200 OK</code>.</h1>
          <p class="lede">Un pedido HTTP atraviesa capas hasta llegar a la base de datos y volver. Este curso recorre el mismo camino: ${LESSONS.length} lecciones, ${nLabs} laboratorios interactivos, ${QUESTIONS.length} preguntas de repaso y ${nEx} ejercicios con solución, entre ellos ${nOfficial === 1 ? 'el de la cátedra' : `los ${nOfficial} de la cátedra`}.</p>
          <ol class="route" aria-label="Recorrido del curso">
            <li class="end" aria-hidden="true"><span class="verb">GET</span></li>
            ${stops}
            <li class="end ok" aria-hidden="true"><span class="verb">200</span></li>
          </ol>
          <div class="hero-actions">
            <a class="btn primary" href="#/${resume.id}">${done.size ? 'Seguir con' : 'Empezar con'} “${resume.title}”</a>
            <button class="btn" type="button" data-act="also">También probá…</button>
            ${reviewIds().length ? `<a class="btn" href="#/repaso">Repasar ${reviewIds().length} preguntas falladas</a>` : `<a class="btn" href="#/simulacro">Hacer un simulacro</a>`}
          </div>
          ${weak ? `<p class="weak">Tu punto más flojo por ahora es <a href="#/quiz/${weak.m.id}">${weak.m.title}</a>, con ${weak.s}% de aciertos. Conviene repasarlo antes de seguir.</p>` : ''}
        </header>
        ${units}
        <section class="home-links">
          <h2 class="also-h" id="tambien">También probá:</h2>
          <ul class="also">${SIBLINGS.map(([n, d, slug]) => `<li><a class="also-main" href="https://franco704.github.io/${slug}/" target="_blank" rel="noopener"><b>${n}</b><span>${d}</span></a><a class="also-repo" href="https://github.com/Franco704/${slug}" target="_blank" rel="noopener" aria-label="Repositorio de ${n}">repositorio</a></li>`).join('')}</ul>
        </section>
        <section class="home-how">
          <h2>Cómo estudiar con esta guía</h2>
          <ol>
            <li>Leé la teoría de cada lección en orden: cada tema se apoya en el anterior.</li>
            <li>Tocá los laboratorios. Están para romper cosas y ver qué pasa.</li>
            <li>Respondé las preguntas del final. Las que falles van a la sección <a href="#/repaso">Repasar</a>.</li>
            <li>Intentá los ejercicios sin mirar la solución. Los de la cátedra están marcados.</li>
            <li>Al cerrar un módulo, hacé su cuestionario. Antes de un parcial, el <a href="#/simulacro">simulacro</a>.</li>
          </ol>
          <p class="kbd-line">Atajos: <kbd>←</kbd> <kbd>→</kbd> para moverte entre lecciones, <kbd>/</kbd> para buscar.</p>
        </section>
      </article>`;
    // El paquete recorre la ruta una sola vez y se detiene en el módulo actual
    const route = $('.route', main);
    route.style.setProperty('--cols', MODULES.length + 2);
    route.style.setProperty('--stop', curIdx + 1);
    $('[data-act="also"]', main).addEventListener('click', () => $('#tambien').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
    requestAnimationFrame(() => route.classList.add('go'));
  }

  // ---------- Lección ----------
  function renderSources(l) {
    return (l.sources || []).map((s) => `
      <details class="source">
        <summary><span>${s.title}</span><span class="host">${s.url ? new URL(s.url).hostname.replace('www.', '') : s.ref || ''}</span></summary>
        <div class="source-body">
          <ul>${s.points.map((p) => `<li>${p}</li>`).join('')}</ul>
          ${s.url ? `<p><a href="${s.url}" target="_blank" rel="noopener">Abrir la fuente</a></p>` : ''}
        </div>
      </details>`).join('');
  }

  const LEVEL = { 1: 'Básico', 2: 'Intermedio', 3: 'Desafío' };
  function renderExercises(l) {
    let practice = 0;
    return (l.exercises || []).map((ex) => {
      const s = ex.solution;
      const files = (s.files || []).map((f) => `
        <div class="sol-file">
          ${f.name ? `<p class="file-name">${f.name}</p>` : ''}
          <pre class="code" data-lang="${f.lang}">${esc(f.code.trim())}</pre>
        </div>`).join('');
      const tag = ex.official ? `Ejercicio ${ex.official} de la cátedra` : `Práctica ${++practice}`;
      return `
        <article class="exercise${ex.official ? ' official' : ''}">
          <header class="ex-head">
            <span class="ex-tag">${tag}</span>
            ${ex.level ? `<span class="ex-level" data-level="${ex.level}">${LEVEL[ex.level]}</span>` : ''}
          </header>
          <h3>${ex.title}</h3>
          <div class="ex-prompt">${ex.prompt}</div>
          ${ex.hints ? `<details class="hint"><summary>Ver pistas</summary><ul>${ex.hints.map((h) => `<li>${h}</li>`).join('')}</ul></details>` : ''}
          <details class="solution">
            <summary>Ver solución</summary>
            <div class="sol-body">
              ${s.explain ? `<div class="sol-explain">${s.explain}</div>` : ''}
              ${files}
            </div>
          </details>
        </article>`;
    }).join('');
  }

  function renderLesson(idx) {
    const l = LESSONS[idx];
    const mod = modOf(l.module);
    const prev = LESSONS[idx - 1];
    const next = LESSONS[idx + 1];
    const labs = l.labs || [];
    document.title = `${l.title}, Backeando Ando`;

    // Laboratorios no ubicados en el cuerpo se agregan al final de la teoría
    const where = l.body + (l.exercises || []).map((e) => e.prompt).join('');
    const placed = new Set([...where.matchAll(/data-lab="(\d+)"/g)].map((m) => +m[1]));
    const rest = labs.map((_, i) => i).filter((i) => !placed.has(i)).map((i) => `<div class="lab-mount" data-lab="${i}"></div>`).join('');
    const exercises = renderExercises(l);
    const sources = renderSources(l);
    const quiz = QUESTIONS.filter((q) => q.lesson === l);

    main.innerHTML = `
      <article class="lesson">
        <div class="lesson-glyph" aria-hidden="true">${ANIM.glyph(mod.id)}</div>
        <p class="crumb"><a href="#/${lessonsOf(mod.id)[0].id}">${mod.title}</a>, lección ${idx + 1} de ${LESSONS.length}</p>
        <h1>${l.title}</h1>
        <p class="tldr">${l.tldr}</p>
        ${l.goals ? `<div class="goals"><p>Al terminar vas a poder:</p><ul>${l.goals.map((g) => `<li>${g}</li>`).join('')}</ul></div>` : ''}
        <div class="body">${l.body}${rest}</div>
        ${quiz.length ? `<section class="check-sec" id="comprobar"><h2>Comprobá lo que entendiste</h2><p class="sec-lede">Elegí una respuesta: la corrección es inmediata. Lo que falles queda guardado para repasar.</p><div class="quiz-mount"></div></section>` : ''}
        ${exercises ? `<section class="practice" id="ejercicios"><h2>Ejercicios</h2><p class="sec-lede">Intentalos antes de abrir la solución. Equivocarse acá es gratis.</p>${exercises}</section>` : ''}
        ${sources ? `<section class="sources" id="bibliografia"><h2>Bibliografía</h2><p class="sec-lede">Qué dice cada fuente sobre este tema.</p>${sources}</section>` : ''}
        <div class="done-row">
          <button class="btn done-btn" id="doneBtn" type="button" aria-pressed="${done.has(l.id)}">${done.has(l.id) ? 'Lección completada' : 'Marcar como completada'}</button>
        </div>
        <nav class="pager" aria-label="Lecciones">
          ${prev ? `<a class="prev" href="#/${prev.id}"><small>Anterior</small><strong>${prev.title}</strong></a>` : '<span></span>'}
          ${next ? `<a class="next" href="#/${next.id}"><small>Siguiente</small><strong>${next.title}</strong></a>` : `<a class="next" href="#/quiz/${mod.id}"><small>Para cerrar</small><strong>Cuestionario del módulo</strong></a>`}
        </nav>
      </article>`;

    enhanceCode(main);
    main.querySelectorAll('.lab-mount').forEach((el) => {
      const cfg = labs[+el.dataset.lab];
      if (cfg) mountLab(el, cfg);
    });
    if (quiz.length) renderQuiz($('.quiz-mount', main), quiz, { mode: 'inline' });

    $('#doneBtn').addEventListener('click', (e) => {
      done.has(l.id) ? done.delete(l.id) : done.add(l.id);
      store.set('ba-done', [...done]);
      const on = done.has(l.id);
      e.currentTarget.setAttribute('aria-pressed', on);
      e.currentTarget.textContent = on ? 'Lección completada' : 'Marcar como completada';
      renderToc($('#search').value);
      updateProgress();
    });
    renderRail();
  }

  // Índice de la página a la derecha (pantallas anchas)
  function renderRail() {
    const hs = [...main.querySelectorAll('.lesson > .body > h2, .lesson > section > h2')];
    if (hs.length < 3) return;
    hs.forEach((h, i) => { if (!h.id) h.id = `s-${i}-${norm(h.textContent).replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`; });
    rail.innerHTML = `<p>En esta lección</p><ol>${hs.map((h) => `<li><a href="#${h.id}" data-target="${h.id}">${h.textContent}</a></li>`).join('')}</ol>`;
    rail.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(a.dataset.target).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }));
    const links = new Map([...rail.querySelectorAll('a')].map((a) => [a.dataset.target, a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((a) => a.removeAttribute('aria-current'));
          links.get(en.target.id)?.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '0px 0px -70% 0px' });
    hs.forEach((h) => io.observe(h));
  }

  // ---------- Cuestionarios ----------
  const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // mode 'inline': corrige cada pregunta al responder. 'exam': corrige todo al final.
  function renderQuiz(el, qs, { mode, onFinish } = {}) {
    const letters = 'ABCDEF';
    // Las opciones se muestran en orden aleatorio para que la posición no delate la respuesta
    const order = Object.fromEntries(qs.map((q) => [q.id, shuffle(q.o.map((_, i) => i))]));
    el.innerHTML = `<ol class="quiz ${mode}">${qs.map((q, n) => `
      <li class="q" data-id="${q.id}">
        <fieldset>
          <legend><span class="q-n">${n + 1}.</span> ${q.q}${mode === 'exam' || mode === 'review' ? `<span class="q-from">${q.lesson.title}</span>` : ''}</legend>
          <div class="q-opts">${order[q.id].map((i, k) => `
            <label class="opt"><input type="radio" name="q-${q.id}" value="${i}"><span class="opt-l" aria-hidden="true">${letters[k]}</span><span class="opt-t">${q.o[i]}</span></label>`).join('')}
          </div>
          <div class="q-feedback" aria-live="polite"></div>
        </fieldset>
      </li>`).join('')}</ol>
      ${mode === 'exam' ? '<div class="exam-actions"><button class="btn primary" type="button" data-act="grade">Corregir</button><p class="exam-left"></p></div><div class="exam-result" aria-live="polite"></div>' : ''}`;
    enhanceCode(el);

    const record = (q, ok) => {
      const prev = answers[q.id] || { tries: 0 };
      answers[q.id] = { ok, tries: prev.tries + 1 };
      saveAnswers();
      updateProgress();
    };
    const showFeedback = (li, q, chosen) => {
      const ok = chosen === q.a;
      li.classList.add(ok ? 'is-ok' : 'is-bad');
      li.querySelectorAll('.opt').forEach((lab) => {
        const input = lab.querySelector('input');
        const i = +input.value;
        if (i === q.a) lab.classList.add('right');
        else if (i === chosen) lab.classList.add('wrong');
        input.disabled = true;
      });
      const correctLetter = letters[order[q.id].indexOf(q.a)];
      li.querySelector('.q-feedback').innerHTML = `<p><strong>${ok ? 'Correcto.' : chosen < 0 ? `Sin responder: la respuesta es la ${correctLetter}.` : `Incorrecto: la respuesta es la ${correctLetter}.`}</strong> ${q.e || ''}</p>
        ${!ok ? `<p class="q-link"><a href="#/${q.lesson.id}">Releer “${q.lesson.title}”</a></p>` : ''}`;
      return ok;
    };

    if (mode !== 'exam') {
      el.querySelectorAll('.q').forEach((li) => {
        const q = qById[li.dataset.id];
        li.addEventListener('change', (e) => {
          const ok = showFeedback(li, q, +e.target.value);
          record(q, ok);
        });
      });
      return;
    }

    const left = $('.exam-left', el);
    const updateLeft = () => {
      const n = el.querySelectorAll('.q input:checked').length;
      left.textContent = n < qs.length ? `Respondiste ${n} de ${qs.length}.` : 'Respondiste todas.';
    };
    el.addEventListener('change', updateLeft);
    updateLeft();
    $('[data-act="grade"]', el).addEventListener('click', (e) => {
      let ok = 0;
      const byMod = {};
      el.querySelectorAll('.q').forEach((li) => {
        const q = qById[li.dataset.id];
        const chosen = li.querySelector('input:checked');
        const good = chosen ? showFeedback(li, q, +chosen.value) : (showFeedback(li, q, -1), false);
        record(q, good);
        ok += good;
        (byMod[q.module] ||= { ok: 0, n: 0 }).n++;
        if (good) byMod[q.module].ok++;
      });
      const pct = Math.round((ok / qs.length) * 100);
      e.currentTarget.remove();
      left.remove();
      const C = 2 * Math.PI * 52;   // circunferencia del anillo
      const rows = Object.entries(byMod).map(([m, r]) => `<li><span>${modOf(m).title}</span><span>${r.ok} de ${r.n}</span></li>`).join('');
      $('.exam-result', el).innerHTML = `
        <div class="score ${pct >= 60 ? 'pass' : 'fail'}">
          <svg class="ring" viewBox="0 0 120 120" role="img" aria-label="${pct}% de respuestas correctas"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" cx="60" cy="60" r="52" style="--c:${C};stroke-dasharray:${C};stroke-dashoffset:${C * (1 - pct / 100)}"/><text x="60" y="69">${pct}%</text></svg>
          <p>${ok} de ${qs.length} correctas. ${pct >= 80 ? 'Muy bien: este tema está firme.' : pct >= 60 ? 'Aprobado, pero repasá las que fallaste.' : 'Todavía no: volvé a las lecciones marcadas y repetí.'}</p>
          ${Object.keys(byMod).length > 1 ? `<ul class="score-mods">${rows}</ul>` : ''}
          <p><a class="btn" href="#/${currentId()}" data-act="again">Hacer otro intento</a></p>
        </div>`;
      $('[data-act="again"]', el).addEventListener('click', (ev) => { ev.preventDefault(); route(); });
      onFinish?.(pct);
      $('.exam-result', el).scrollIntoView({ block: 'center' });
    });
  }


  function renderModuleQuiz(mod) {
    document.title = `Cuestionario: ${mod.title}`;
    const pool = QUESTIONS.filter((q) => q.module === mod.id);
    // Prioriza las que fallaste o nunca respondiste
    const weight = (q) => (answers[q.id]?.ok === false ? 0 : answers[q.id] ? 2 : 1);
    const qs = shuffle(pool).sort((a, b) => weight(a) - weight(b)).slice(0, 15);
    main.innerHTML = `
      <article class="lesson quiz-page">
        <p class="crumb"><a href="#/${lessonsOf(mod.id)[0].id}">${mod.title}</a>, cuestionario</p>
        <h1>Cuestionario: ${mod.title}</h1>
        <p class="tldr">${qs.length} preguntas de las ${pool.length} del módulo. Aparecen primero las que fallaste y las que nunca respondiste. ${best[mod.id] != null ? `Tu mejor resultado: ${best[mod.id]}%.` : ''}</p>
        <div class="quiz-mount"></div>
      </article>`;
    renderQuiz($('.quiz-mount', main), qs, {
      mode: 'exam',
      onFinish: (pct) => { best[mod.id] = Math.max(best[mod.id] ?? 0, pct); store.set('ba-best', best); renderToc($('#search').value); },
    });
  }

  function renderReview() {
    document.title = 'Repasar, Backeando Ando';
    const ids = reviewIds();
    const qs = ids.map((id) => qById[id]);
    main.innerHTML = `
      <article class="lesson quiz-page">
        <p class="crumb">Práctica personalizada</p>
        <h1>Repasar</h1>
        ${qs.length ? `<p class="tldr">Estas son las ${qs.length} preguntas que respondiste mal la última vez. Cuando aciertes una, sale de la lista.</p><div class="quiz-mount"></div>`
          : `<p class="tldr">No tenés preguntas pendientes. Cada vez que falles una, en una lección o en un cuestionario, aparece acá para que la vuelvas a intentar.</p>
             <p><a class="btn primary" href="#/simulacro">Hacer un simulacro</a></p>`}
      </article>`;
    if (qs.length) renderQuiz($('.quiz-mount', main), qs, { mode: 'review' });
  }

  function renderExam() {
    document.title = 'Simulacro, Backeando Ando';
    const reached = new Set(LESSONS.filter((l) => done.has(l.id)).map((l) => l.module));
    const scope = reached.size ? QUESTIONS.filter((q) => reached.has(q.module)) : QUESTIONS;
    // Reparte las preguntas entre módulos para que ninguno domine
    const byMod = MODULES.map((m) => shuffle(scope.filter((q) => q.module === m.id))).filter((a) => a.length);
    const qs = [];
    for (let i = 0; qs.length < 20 && byMod.some((a) => a[i]); i++) byMod.forEach((a) => a[i] && qs.length < 20 && qs.push(a[i]));
    main.innerHTML = `
      <article class="lesson quiz-page">
        <p class="crumb">Práctica personalizada</p>
        <h1>Simulacro</h1>
        <p class="tldr">${qs.length} preguntas mezcladas ${reached.size ? `de los ${reached.size} módulos que ya empezaste` : 'de todo el curso'}. Respondé todas y corregí al final, como en un parcial.</p>
        <div class="quiz-mount"></div>
      </article>`;
    renderQuiz($('.quiz-mount', main), shuffle(qs), { mode: 'exam' });
  }

  // ---------- Laboratorios ----------
  function mountLab(el, cfg) {
    const fn = LABS[cfg.type];
    if (!fn) { el.innerHTML = `<p class="note warn">Laboratorio desconocido: ${esc(cfg.type)}</p>`; return; }
    el.innerHTML = `<section class="lab" aria-label="Laboratorio: ${esc(cfg.title)}">
      <header class="lab-head"><span class="lab-kind">Laboratorio</span><h3 class="lab-title">${cfg.title}</h3></header>
      ${cfg.intro ? `<p class="lab-intro">${cfg.intro}</p>` : ''}
      <div class="lab-body"></div></section>`;
    try { fn($('.lab-body', el), cfg, { esc, highlight, enhanceCode }); }
    catch (err) { $('.lab-body', el).innerHTML = `<p class="note warn">No se pudo iniciar el laboratorio: ${esc(err.message)}</p>`; console.error(err); }
  }

  // ---------- Menú móvil ----------
  function openMenu() { sidebar.classList.add('open'); scrim.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); }
  function closeMenu() { sidebar.classList.remove('open'); scrim.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', () => (sidebar.classList.contains('open') ? closeMenu() : openMenu()));
  scrim.addEventListener('click', closeMenu);

  // ---------- Tema ----------
  $('#themeBtn').addEventListener('click', () => {
    const root = document.documentElement;
    const isDark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = isDark ? 'light' : 'dark';
    try { localStorage.setItem('ba-theme', root.dataset.theme); } catch {}
  });

  // ---------- Teclado ----------
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select, [contenteditable]') || e.altKey || e.ctrlKey || e.metaKey) return;
    const idx = LESSONS.findIndex((l) => l.id === currentId());
    if (e.key === 'ArrowRight' && idx > -1 && idx < LESSONS.length - 1) location.hash = `#/${LESSONS[idx + 1].id}`;
    if (e.key === 'ArrowLeft' && idx > 0) location.hash = `#/${LESSONS[idx - 1].id}`;
    if (e.key === 'Escape') closeMenu();
    if (e.key === '/') { e.preventDefault(); openMenu(); $('#search').focus(); }
  });

  $('#search').addEventListener('input', (e) => renderToc(e.target.value));
  window.addEventListener('hashchange', route);
  renderToc();
  updateProgress();
  route();
})();
