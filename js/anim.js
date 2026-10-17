/* Animaciones: pantalla de entrada al cambiar de módulo y glifo animado en la cabecera de cada lección.
   Adaptadas del "Laboratorio Frontend DSW" de Mateo Rusconi. Expone window.ANIM; app.js lo usa en route() y renderLesson(). */
(() => {
  const { LESSONS, MODULES } = window.GUIDE;
  const RM = matchMedia('(prefers-reduced-motion: reduce)');

  // Recorrido que se enciende etapa por etapa: por módulo en la Unidad 1, por unidad en la 2 y la 3
  const PIPES = {
    poo: ['Abstracción', 'Encapsulamiento', 'Modularidad', 'Jerarquía'],
    git: ['Working dir', 'Staging', 'Commit', 'Push', 'GitHub'],
    u2: ['.cs', 'Roslyn', 'IL', 'CLR / JIT', 'Código máquina'],
    u3: ['Request', 'Routing', 'Middleware', 'Controller', 'EF Core', 'DB', 'Response'],
  };

  // cls = nombre de la clase en el texto tipeado; trap = la confusión típica, tomada de las notas del módulo
  const META = {
    poo: { cls: 'Poo', trap: 'Abstracción y encapsulamiento no son sinónimos: la abstracción mira el comportamiento observable; el encapsulamiento oculta la implementación que lo produce.' },
    git: { cls: 'Git', trap: 'En el .gitignore, una línea <code>#trash*</code> es un comentario y no ignora nada: hay que escaparla como <code>\\#trash*</code>.' },
    'cs-base': { cls: 'Fundamentos', trap: '<code>float</code> y <code>double</code> no pueden representar 0,1 exacto. Para dinero se usa <code>decimal</code>.' },
    'cs-oop': { cls: 'Tipos', trap: 'Llamado desde una variable del tipo base, un método con <code>override</code> ejecuta el de la derivada; uno con <code>new</code> solo lo oculta y se ejecuta el de la base.' },
    'cs-adv': { cls: 'Linq', trap: '<code>async</code> no significa paralelo: si esperás cada tarea apenas la iniciás, tarda lo mismo que la versión sincrónica.' },
    arq: { cls: 'Capas', trap: 'Una persistencia en memoria registrada como Transient le da una lista nueva a cada consumidor y los datos se pierden: va como Singleton.' },
    api: { cls: 'Api', trap: '401 es “no sé quién sos”; 403 es “sé quién sos, pero no podés hacer esto”.' },
    ef: { cls: 'EfCore', trap: 'El problema N+1: traer 1000 médicos y después la especialidad de cada uno con carga diferida son 1001 viajes a la base.' },
    sec: { cls: 'Jwt', trap: 'El payload de un JWT no está cifrado: la firma impide que lo modifiquen, no que lo lean.' },
    qa: { cls: 'Tests', trap: 'Verificación pregunta “¿lo construimos correctamente?”; validación, “¿construimos el producto correcto?”.' },
  };

  // Un SVG de 150×120 por módulo. Sin animación (reduced-motion) cada uno queda en un estado final legible.
  const d = (s) => `style="animation-delay:${s}s"`;
  const GLYPHS = {
    poo: `<rect x="37" y="6" width="76" height="26" rx="6" class="gx-soft"/><text x="75" y="23" class="gx-t gx-tc">class Auto</text>
      <path d="M75 32V48M25 48H125M25 48V78M75 48V78M125 48V78" class="gx-line gx-dash"/>
      ${[25, 75, 125].map((x, i) => `<g class="gx-pop" ${d(i * .35)}><rect x="${x - 22}" y="78" width="44" height="24" rx="5" class="gx-box"/><text x="${x}" y="94" class="gx-t">auto${i + 1}</text></g>`).join('')}`,
    git: `<path d="M8 36H142" class="gx-line"/><path d="M48 36C64 36 60 84 80 84H104C122 84 116 36 132 36" class="gx-line gx-draw" pathLength="1"/>
      ${[[16, 36, 'gx-node'], [48, 36, 'gx-node'], [80, 84, 'gx-soft'], [92, 36, 'gx-node'], [104, 84, 'gx-soft'], [132, 36, 'gx-acc']].map(([x, y, c], i) => `<circle cx="${x}" cy="${y}" r="${i === 5 ? 8 : 6}" class="${c} gx-pop" ${d(i * .3)}/>`).join('')}
      <text x="20" y="20" class="gx-t">main</text><text x="92" y="108" class="gx-t">feature</text><text x="132" y="20" class="gx-t gx-tc">merge</text>`,
    'cs-base': `<text x="16" y="76" class="gx-brace">{</text><text x="134" y="76" class="gx-brace">}</text>
      ${[['int', '42', 'gx-num'], ['string', '"hola"', 'gx-str'], ['bool', 'true', 'gx-kwd']].map(([t, v, c], i) => `<g class="gx-kw" ${d(i * 1.2)}><text x="75" y="60" class="gx-type">${t}</text><text x="75" y="84" class="gx-val ${c}">${v}</text></g>`).join('')}`,
    'cs-oop': `<rect x="35" y="6" width="80" height="26" rx="6" class="gx-soft"/><text x="75" y="23" class="gx-t gx-tc">Vehiculo</text>
      <path d="M75 45V86" class="gx-strong gx-draw" pathLength="1"/><path d="M75 33L68 45H82Z" class="gx-tri"/>
      <g class="gx-pop" ${d(.9)}><rect x="35" y="86" width="80" height="26" rx="6" class="gx-box"/><text x="75" y="103" class="gx-t">Electrico</text></g>`,
    'cs-adv': `${[0, 1, 2, 3, 4].map((i) => `<rect x="${15 + i * 26}" y="6" width="14" height="14" rx="3" class="gx-box"/>`).join('')}
      <text x="75" y="40" class="gx-t gx-tc">.Where(…)</text>
      ${[0, 2, 4].map((i) => `<rect x="${15 + i * 26}" y="50" width="14" height="14" rx="3" class="gx-soft gx-stack" ${d(.6)}/>`).join('')}
      <text x="75" y="84" class="gx-t gx-tc">.Select(…)</text>
      ${[0, 2, 4].map((i) => `<circle cx="${22 + i * 26}" cy="101" r="7" class="gx-acc gx-stack" ${d(1.2)}/>`).join('')}`,
    arq: ['Presentación', 'Aplicación', 'Dominio', 'Infraestructura'].map((t, i) => `<g class="gx-stack" ${d(i * .35)}><rect x="8" y="${6 + i * 28}" width="134" height="24" rx="5" class="${i ? 'gx-box' : 'gx-soft'}"/><text x="75" y="${22 + i * 28}" class="gx-t gx-ink">${t}</text></g>`).join(''),
    api: `<rect x="2" y="34" width="36" height="52" rx="6" class="gx-box"/><text x="20" y="102" class="gx-t">cliente</text>
      <rect x="112" y="34" width="36" height="52" rx="6" class="gx-soft"/><text x="130" y="102" class="gx-t gx-tc">API</text>
      <path d="M42 50H108M42 72H108" class="gx-line"/>
      <g class="gx-req"><rect x="42" y="42" width="30" height="16" rx="4" class="gx-acc"/><text x="57" y="53.5" class="gx-t gx-on">GET</text></g>
      <g class="gx-res"><rect x="78" y="64" width="30" height="16" rx="4" class="gx-okf"/><text x="93" y="75.5" class="gx-t gx-on">200</text></g>`,
    ef: `<rect x="20" y="54" width="110" height="60" rx="5" class="gx-box"/><path d="M20 69H130M20 84H130M20 99H130M50 69V114" class="gx-line"/>
      <text x="75" y="65" class="gx-t gx-tc">Medicos</text>
      <text x="35" y="80" class="gx-t">1</text><text x="90" y="80" class="gx-t gx-ink">Ana</text><text x="35" y="95" class="gx-t">2</text><text x="90" y="95" class="gx-t gx-ink">Luis</text>
      <g class="gx-row"><text x="35" y="110" class="gx-t">3</text><text x="90" y="110" class="gx-t gx-tc">Sol</text></g>
      <g class="gx-drop"><rect x="45" y="4" width="60" height="22" rx="5" class="gx-soft"/><text x="75" y="19" class="gx-t gx-tc">Medico</text></g>`,
    sec: `<text x="75" y="30" class="gx-t gx-tc">JWT</text>
      ${[['header', 'gx-errf'], ['payload', 'gx-acc'], ['firma', 'gx-okf']].map(([t, c], i) => `<g class="gx-stack" ${d(i * .4)}><rect x="${6 + i * 48}" y="48" width="42" height="18" rx="4" class="${c}"/><text x="${27 + i * 48}" y="84" class="gx-t">${t}</text></g>`).join('')}
      <text x="51" y="66" class="gx-dot">.</text><text x="99" y="66" class="gx-dot">.</text>`,
    qa: ['Alta_Valida', 'Alta_SinNombre', 'Baja_Inexistente', 'Listar_Vacia'].map((t, i) => {
      const y = 15 + i * 28;
      return `<circle cx="18" cy="${y}" r="9" class="gx-pend"/><g class="gx-pop" ${d(.3 + i * .5)}><circle cx="18" cy="${y}" r="9" class="gx-okf"/><path d="M13.5 ${y}l3 3 6-6" class="gx-check"/></g><text x="34" y="${y + 3.5}" class="gx-t gx-start">${t}</text>`;
    }).join(''),
  };
  const glyph = (modId) => (GLYPHS[modId] ? `<svg viewBox="0 0 150 120" focusable="false">${GLYPHS[modId]}</svg>` : '');

  // Pantalla de entrada: se cierra sola, con un clic o con cualquier tecla
  function interstitial(n, title, mod) {
    return new Promise((res) => {
      const { cls, trap } = META[mod.id];
      const tag = `[Lección(${String(n).padStart(2, '0')})] class ${cls} { }`;
      const stages = PIPES[mod.id] || PIPES[mod.unit];
      const el = document.createElement('div');
      el.className = 'inter';
      el.tabIndex = -1;
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', `Lección ${n}: ${title.replace(/<[^>]*>/g, '')}`);
      el.innerHTML = `<div class="inter-box">
        <p class="inter-typed" style="--steps:${tag.length}" aria-hidden="true">${tag}</p>
        <h2>${title}</h2>
        <p class="inter-pipe" aria-hidden="true">${stages.map((s, i) => `${i ? '<span class="ar">→</span>' : ''}<span class="s" ${d((.35 + i * .16).toFixed(2))}>${s}</span>`).join('')}</p>
        <p class="inter-trap"><span class="lbl">Trampa de este módulo</span>${trap}</p>
        <p class="inter-hint">Tocá o presioná una tecla para entrar</p>
      </div>`;
      let closed = false;
      const end = (e) => {
        if (closed) return;
        closed = true;
        // La tecla que cierra no llega a los atajos de la guía (flechas, /, Escape)
        if (e?.type === 'keydown') { e.preventDefault(); e.stopPropagation(); }
        window.removeEventListener('keydown', end, true);
        el.classList.add('out');
        setTimeout(() => el.remove(), 330);
        res();
      };
      el.addEventListener('click', end);
      window.addEventListener('keydown', end, true);
      document.body.append(el);
      el.focus();
      setTimeout(end, 2700);
    });
  }

  // Al entrar a una lección de otro módulo. skip = true solo registra el módulo (primera carga).
  let lastModule = null;
  function intro(lessonId, skip) {
    const i = LESSONS.findIndex((l) => l.id === lessonId);
    const mod = MODULES.find((m) => m.id === LESSONS[i]?.module);
    if (!mod || mod.id === lastModule) return Promise.resolve();
    lastModule = mod.id;
    if (skip || RM.matches || !META[mod.id]) return Promise.resolve();
    return interstitial(i + 1, LESSONS[i].title, mod);
  }

  window.ANIM = { intro, glyph };
})();
