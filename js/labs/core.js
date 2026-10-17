/* Laboratorios genéricos: predecir salida, clasificar, ordenar y visor de memoria paso a paso. */
(() => {
  const L = window.GUIDE.LABS;
  const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  window.GUIDE.util = { shuffle };

  // ¿Qué imprime? El estudiante escribe la salida y se compara línea por línea
  // cfg: { code, lang, expected, explain }
  L.predict = (el, cfg, { esc, enhanceCode }) => {
    el.innerHTML = `
      <pre class="code" data-lang="${cfg.lang || 'cs'}">${esc(cfg.code.trim())}</pre>
      <label class="lab-label" for="${(cfg.id ||= 'p' + Math.random().toString(36).slice(2, 7))}">¿Qué muestra la consola? Escribí una línea por cada <code>WriteLine</code>.</label>
      <textarea id="${cfg.id}" rows="${Math.min(8, cfg.expected.split('\n').length + 1)}" spellcheck="false" placeholder="Salida esperada"></textarea>
      <div class="lab-row" style="margin-top:10px"><button class="btn sm primary" type="button" data-act="check">Comprobar</button><button class="btn sm" type="button" data-act="show">Ver la salida real</button></div>
      <div class="lab-result" aria-live="polite"></div>`;
    enhanceCode(el);
    const ta = el.querySelector('textarea');
    const out = el.querySelector('.lab-result');
    const normalize = (s) => s.trim().split('\n').map((x) => x.trim().replace(/\s+/g, ' ')).filter(Boolean);
    const reveal = (msg, ok) => {
      const exp = normalize(cfg.expected);
      const got = normalize(ta.value);
      const rows = exp.map((line, i) => `<li class="${got[i] === line ? 'met' : ''}"><code>${esc(line)}</code>${got[i] !== undefined && got[i] !== line ? ` <span class="muted-s">escribiste: <code>${esc(got[i])}</code></span>` : ''}</li>`).join('');
      out.innerHTML = `<p class="chip ${ok ? 'ok' : 'warn'}">${msg}</p><ul class="goals-list" style="margin-top:8px">${rows}</ul>${cfg.explain ? `<div class="lab-explain">${cfg.explain}</div>` : ''}`;
    };
    el.querySelector('[data-act="check"]').addEventListener('click', () => {
      const exp = normalize(cfg.expected), got = normalize(ta.value);
      const hits = exp.filter((l, i) => got[i] === l).length;
      if (!got.length) { out.innerHTML = '<p class="chip warn">Escribí tu predicción antes de comprobar.</p>'; return; }
      reveal(hits === exp.length && got.length === exp.length ? 'Exacto: esa es la salida.' : `Acertaste ${hits} de ${exp.length} líneas.`, hits === exp.length);
    });
    el.querySelector('[data-act="show"]').addEventListener('click', () => reveal('Salida real', true));
  };

  // Clasificar elementos en categorías con un selector por elemento
  // cfg: { buckets: [nombres], items: [{ t, b, why }] }
  L.classify = (el, cfg) => {
    const items = cfg.keepOrder ? cfg.items : shuffle(cfg.items);
    el.innerHTML = `
      <ol class="cls-list">${items.map((it, i) => `
        <li data-i="${i}">
          <span class="cls-t">${it.t}</span>
          <select aria-label="Categoría"><option value="">Elegí…</option>${cfg.buckets.map((b, j) => `<option value="${j}">${b}</option>`).join('')}</select>
          <p class="cls-why" hidden></p>
        </li>`).join('')}</ol>
      <div class="lab-row"><button class="btn sm primary" type="button" data-act="check">Comprobar</button><span class="lab-score" aria-live="polite"></span></div>`;
    el.querySelector('[data-act="check"]').addEventListener('click', () => {
      let ok = 0;
      el.querySelectorAll('.cls-list li').forEach((li) => {
        const it = items[+li.dataset.i];
        const v = li.querySelector('select').value;
        const good = v !== '' && +v === it.b;
        ok += good;
        li.className = v === '' ? '' : good ? 'is-ok' : 'is-bad';
        const why = li.querySelector('.cls-why');
        why.hidden = v === '';
        why.innerHTML = v === '' ? '' : `${good ? 'Bien.' : `Es <strong>${cfg.buckets[it.b]}</strong>.`} ${it.why || ''}`;
      });
      el.querySelector('.lab-score').innerHTML = `<span class="chip ${ok === items.length ? 'ok' : 'warn'}">${ok} de ${items.length} correctas</span>`;
    });
  };

  // Ordenar pasos con botones subir/bajar (accesible sin arrastrar)
  // cfg: { items: [en orden correcto], explain }
  L.order = (el, cfg) => {
    let cur = shuffle(cfg.items.map((t, i) => ({ t, i })));
    if (cur.every((x, k) => x.i === k)) cur.reverse();
    const draw = (checked) => {
      el.querySelector('.ord-list').innerHTML = cur.map((x, k) => `
        <li class="${checked ? (x.i === k ? 'is-ok' : 'is-bad') : ''}">
          <span class="ord-n">${k + 1}</span><span class="ord-t">${x.t}</span>
          <span class="ord-btns"><button type="button" class="icon-btn sm" data-up="${k}" aria-label="Subir" ${k === 0 ? 'disabled' : ''}>↑</button><button type="button" class="icon-btn sm" data-down="${k}" aria-label="Bajar" ${k === cur.length - 1 ? 'disabled' : ''}>↓</button></span>
        </li>`).join('');
    };
    el.innerHTML = `<ol class="ord-list"></ol>
      <div class="lab-row"><button class="btn sm primary" type="button" data-act="check">Comprobar el orden</button><span class="lab-score" aria-live="polite"></span></div>
      <div class="lab-explain" hidden>${cfg.explain || ''}</div>`;
    draw(false);
    el.querySelector('.ord-list').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const k = +(b.dataset.up ?? b.dataset.down);
      const j = b.dataset.up !== undefined ? k - 1 : k + 1;
      [cur[k], cur[j]] = [cur[j], cur[k]];
      draw(false);
      el.querySelector(`[data-${b.dataset.up !== undefined ? 'up' : 'down'}="${j}"]`)?.focus();
    });
    el.querySelector('[data-act="check"]').addEventListener('click', () => {
      draw(true);
      const ok = cur.filter((x, k) => x.i === k).length;
      el.querySelector('.lab-score').innerHTML = `<span class="chip ${ok === cur.length ? 'ok' : 'warn'}">${ok === cur.length ? 'Orden correcto' : `${ok} de ${cur.length} en su lugar`}</span>`;
      if (ok === cur.length) el.querySelector('.lab-explain').hidden = false;
    });
  };

  // Visor de memoria: código a la izquierda, stack y heap a la derecha, paso a paso
  // cfg: { code, steps: [{ line, stack: [[nombre, valor, refId?]], heap: [{ id, label, rows: [[campo, valor, refId?]] }], note }] }
  L.memory = (el, cfg, { esc, highlight }) => {
    let k = 0;
    const lines = cfg.code.trim().split('\n');
    el.innerHTML = `
      <div class="mem">
        <pre class="code mem-code" data-lang="cs" data-ready="1"><code></code></pre>
        <div class="mem-diagram">
          <div class="mem-col"><p class="mem-h">Stack</p><div class="mem-stack"></div></div>
          <div class="mem-col"><p class="mem-h">Heap</p><div class="mem-heap"></div></div>
        </div>
      </div>
      <p class="mem-note" aria-live="polite"></p>
      <div class="lab-row"><button class="btn sm" type="button" data-act="prev">Paso anterior</button><button class="btn sm primary" type="button" data-act="next">Siguiente paso</button><span class="lab-score"></span></div>`;
    const draw = () => {
      const s = cfg.steps[k];
      el.querySelector('.mem-code code').innerHTML = lines.map((ln, i) => `<span class="ln${i + 1 === s.line ? ' cur' : ''}">${highlight(ln, 'cs') || ' '}</span>`).join('\n');
      el.querySelector('.mem-stack').innerHTML = (s.stack || []).map(([n, v, ref]) => `<div class="slot${ref ? ' is-ref' : ''}"><span class="slot-n">${esc(n)}</span><span class="slot-v">${ref ? `ref <b>${ref}</b>` : esc(v)}</span></div>`).join('') || '<p class="mem-empty">vacío</p>';
      el.querySelector('.mem-heap').innerHTML = (s.heap || []).map((o) => `<div class="obj${s.hot === o.id ? ' hot' : ''}"><p class="obj-h"><b>${o.id}</b> ${esc(o.label)}</p>${(o.rows || []).map(([n, v, ref]) => `<div class="slot"><span class="slot-n">${esc(n)}</span><span class="slot-v">${ref ? `ref <b>${ref}</b>` : esc(v)}</span></div>`).join('')}</div>`).join('') || '<p class="mem-empty">vacío</p>';
      el.querySelector('.mem-note').innerHTML = s.note || '';
      el.querySelector('[data-act="prev"]').disabled = k === 0;
      el.querySelector('[data-act="next"]').disabled = k === cfg.steps.length - 1;
      el.querySelector('.lab-score').textContent = `Paso ${k + 1} de ${cfg.steps.length}`;
    };
    el.querySelector('[data-act="prev"]').addEventListener('click', () => { k--; draw(); });
    el.querySelector('[data-act="next"]').addEventListener('click', () => { k++; draw(); });
    draw();
  };

  // Calculadora guiada: campos de entrada y una función que devuelve HTML (para fórmulas del dominio)
  // cfg: { fields: [{ id, label, type, value, options? }], run: (valores) => html }
  L.calc = (el, cfg) => {
    el.innerHTML = `<div class="calc-grid">${cfg.fields.map((f) => `
      <label>${f.label}${f.options ? `<select data-id="${f.id}">${f.options.map((o) => `<option ${o === f.value ? 'selected' : ''}>${o}</option>`).join('')}</select>`
        : `<input type="${f.type || 'number'}" data-id="${f.id}" value="${f.value}" step="any">`}</label>`).join('')}</div>
      <div class="lab-out calc-out" aria-live="polite"></div>`;
    const run = () => {
      const v = {};
      el.querySelectorAll('[data-id]').forEach((i) => (v[i.dataset.id] = i.type === 'number' ? parseFloat(i.value) : i.value));
      try { el.querySelector('.calc-out').innerHTML = cfg.run(v); } catch (e) { el.querySelector('.calc-out').textContent = e.message; }
    };
    el.addEventListener('input', run);
    run();
  };
})();
