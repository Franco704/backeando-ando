/* Laboratorios de persistencia y calidad: carga de datos en EF Core, change tracker,
   pruebas por mutantes y niveles de log. */
(() => {
  const L = window.GUIDE.LABS;

  // ---------- EF Core: estrategias para cargar datos relacionados ----------
  const STRAT = {
    none: {
      label: 'Sin Include',
      code: `var doctors = await _context.Doctors.ToListAsync();\nforeach (var d in doctors)\n    Console.WriteLine($"{d.Name}: {d.Speciality.Name}");`,
      queries: (n) => [`SELECT [d].[Id], [d].[Name], [d].[LicenseNumber], [d].[SpecialityId], [d].[IsActive]\nFROM [Doctors] AS [d]`],
      result: 'NullReferenceException: d.Speciality es null. EF Core no carga las navegaciones si no se lo pedís.',
      bad: true,
    },
    eager: {
      label: 'Carga diligente (Include)',
      code: `var doctors = await _context.Doctors\n    .Include(d => d.Speciality)\n    .ToListAsync();`,
      queries: () => [`SELECT [d].[Id], [d].[Name], [d].[LicenseNumber], [d].[SpecialityId], [d].[IsActive],\n       [s].[Id], [s].[Name], [s].[Description]\nFROM [Doctors] AS [d]\nINNER JOIN [Specialities] AS [s] ON [d].[SpecialityId] = [s].[Id]`],
      result: 'Una sola consulta con JOIN trae médicos y especialidades.',
    },
    lazy: {
      label: 'Carga diferida (lazy loading)',
      code: `// UseLazyLoadingProxies() y navegación virtual:\n// public virtual Speciality Speciality { get; set; }\nvar doctors = await _context.Doctors.ToListAsync();\nforeach (var d in doctors)\n    Console.WriteLine(d.Speciality.Name); // consulta oculta`,
      queries: (n, specs) => [`SELECT [d].[Id], [d].[Name], [d].[LicenseNumber], [d].[SpecialityId], [d].[IsActive]\nFROM [Doctors] AS [d]`, ...Array.from({ length: Math.min(n, specs) }, (_, i) => `SELECT [s].[Id], [s].[Name], [s].[Description]\nFROM [Specialities] AS [s]\nWHERE [s].[Id] = @__p_0   -- especialidad ${i + 1}`)],
      result: 'Funciona, pero cada vez que tocás d.Speciality de una especialidad que todavía no cargó, EF dispara otra consulta oculta. Acá hay 3 especialidades: 1 + 3 consultas. Si cada médico tuviera una distinta (por ejemplo, su consultorio), serían 1 + N: el problema N+1.',
      warn: true,
    },
    explicit: {
      label: 'Carga explícita',
      code: `var doctors = await _context.Doctors.ToListAsync();\nforeach (var d in doctors)\n    await _context.Entry(d)\n        .Reference(x => x.Speciality)\n        .LoadAsync();`,
      queries: (n, specs) => [`SELECT [d].[Id], [d].[Name], [d].[LicenseNumber], [d].[SpecialityId], [d].[IsActive]\nFROM [Doctors] AS [d]`, ...Array.from({ length: n }, (_, i) => `SELECT [s].[Id], [s].[Name], [s].[Description]\nFROM [Specialities] AS [s]\nWHERE [s].[Id] = @__p_0   -- médico ${i + 1}`)],
      result: 'Vos decidís cuándo cargar. Útil para casos puntuales, pero en un bucle es N+1 explícito.',
      warn: true,
    },
    project: {
      label: 'Proyección con Select',
      code: `var doctors = await _context.Doctors\n    .Where(d => d.IsActive)\n    .Select(d => new DoctorResponse(d.Name, d.LicenseNumber, d.Speciality.Name))\n    .AsNoTracking()\n    .ToListAsync();`,
      queries: () => [`SELECT [d].[Name], [d].[LicenseNumber], [s].[Name]\nFROM [Doctors] AS [d]\nINNER JOIN [Specialities] AS [s] ON [d].[SpecialityId] = [s].[Id]\nWHERE [d].[IsActive] = CAST(1 AS bit)`],
      result: 'Una consulta que trae solo las columnas que la respuesta necesita. Lo ideal para un GET de solo lectura.',
    },
  };
  L.efload = (el, cfg, { esc, highlight }) => {
    el.innerHTML = `
      <div class="lab-row" role="radiogroup" aria-label="Estrategia">${Object.entries(STRAT).map(([k, s], i) => `<label class="seg"><input type="radio" name="ef-${(cfg.uid ||= Math.random().toString(36).slice(2, 7))}" value="${k}" ${i === 0 ? 'checked' : ''}><span>${s.label}</span></label>`).join('')}</div>
      <label class="api-field ef-n">Médicos en la tabla: <output>20</output><input type="range" min="1" max="60" value="20"></label>
      <pre class="code ef-code" data-lang="cs" data-ready="1"><code></code></pre>
      <div class="ef-meter" aria-live="polite"></div>
      <details class="ef-sql"><summary>Ver el SQL que envía EF Core</summary><div class="ef-sql-body"></div></details>`;
    const $ = (s) => el.querySelector(s);
    const draw = () => {
      const s = STRAT[el.querySelector('input:checked').value];
      const n = +$('.ef-n input').value;
      $('.ef-n output').textContent = n;
      const q = s.queries(n, 3);
      $('.ef-code code').innerHTML = highlight(s.code, 'cs');
      $('.ef-meter').innerHTML = `<div class="ef-bars">${q.map((_, i) => `<span class="${i ? 'extra' : ''}"></span>`).join('')}</div>
        <p><span class="chip ${s.bad ? 'err' : s.warn ? 'warn' : 'ok'}">${q.length} consulta${q.length > 1 ? 's' : ''} a la base</span> ${s.result}</p>`;
      $('.ef-sql-body').innerHTML = q.slice(0, 6).map((x) => `<pre class="code" data-lang="sql" data-ready="1"><code>${highlight(x, 'sql')}</code></pre>`).join('') + (q.length > 6 ? `<p class="api-note">… y ${q.length - 6} consultas más iguales.</p>` : '');
    };
    el.addEventListener('input', draw);
    el.addEventListener('change', draw);
    draw();
  };

  // ---------- EF Core: estados del change tracker ----------
  L.tracker = (el, cfg, { esc, highlight }) => {
    let ent, tracked, db, log, codeLines;
    const reset = () => { ent = null; tracked = false; db = [{ id: 1, name: 'Laura Pérez', lic: 'MP-1234' }]; log = []; codeLines = []; };
    const ACTIONS = [
      ['new', 'var d = new Doctor("Martín Ruiz", "MP-5678");'],
      ['add', '_context.Doctors.Add(d);'],
      ['find', 'var d = await _context.Doctors.FindAsync(1);'],
      ['notrack', 'var d = await _context.Doctors.AsNoTracking().FirstAsync(x => x.Id == 1);'],
      ['edit', 'd.Name = "Laura B. Pérez";'],
      ['remove', '_context.Doctors.Remove(d);'],
      ['save', 'await _context.SaveChangesAsync();'],
    ];
    el.innerHTML = `
      <div class="lab-row tr-actions">${ACTIONS.map(([k, c]) => `<button class="btn sm" type="button" data-a="${k}"><code>${esc(c)}</code></button>`).join('')}</div>
      <div class="api-cols">
        <div><p class="mem-h">Tu código</p><pre class="code" data-lang="cs" data-ready="1"><code class="tk-code"></code></pre>
          <p class="mem-h">Estado de <code>d</code> según el change tracker</p><p class="tk-state"></p></div>
        <div><p class="mem-h">SQL enviado al llamar SaveChanges</p><pre class="lab-out tk-sql"></pre>
          <p class="mem-h">Tabla Doctors</p><div class="tk-db"></div></div>
      </div>
      <div class="lab-row"><button class="btn sm" type="button" data-act="reset">Empezar de nuevo</button></div>`;
    const $ = (s) => el.querySelector(s);
    const draw = (msg) => {
      $('.tk-code').innerHTML = highlight(codeLines.join('\n') || '// elegí acciones arriba', 'cs');
      const stName = !ent ? 'no existe la variable' : !tracked ? 'Detached (EF no la sigue)' : ent.state;
      $('.tk-state').innerHTML = `<span class="chip ${!ent ? '' : !tracked ? 'warn' : { Added: 'acc', Modified: 'warn', Deleted: 'err', Unchanged: 'ok' }[ent.state]}">${stName}</span>${msg ? ` <span class="api-note">${msg}</span>` : ''}`;
      $('.tk-sql').innerHTML = log.length ? log.map((l) => highlight(l, 'sql')).join('\n\n') : '(todavía nada)';
      $('.tk-db').innerHTML = `<div class="table-wrap"><table><thead><tr><th>Id</th><th>Name</th><th>LicenseNumber</th></tr></thead><tbody>${db.map((r) => `<tr><td>${r.id}</td><td>${esc(r.name)}</td><td>${r.lic}</td></tr>`).join('') || '<tr><td colspan="3">(vacía)</td></tr>'}</tbody></table></div>`;
    };
    el.querySelector('.tr-actions').addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = b.dataset.a;
      const line = ACTIONS.find((x) => x[0] === a)[1];
      let msg = '';
      if (['add', 'edit', 'remove'].includes(a) && !ent) { draw('Primero creá u obtené un médico.'); return; }
      if ((a === 'new' || a === 'find' || a === 'notrack') && ent) { draw('Ya tenés una variable d. Empezá de nuevo para probar otra.'); return; }
      codeLines.push(line);
      switch (a) {
        case 'new': ent = { id: null, name: 'Martín Ruiz', lic: 'MP-5678', state: 'Detached' }; tracked = false; msg = 'Un objeto recién creado no está en el contexto.'; break;
        case 'add': tracked = true; ent.state = ent.id ? 'Modified' : 'Added'; msg = 'Add no toca la base: solo marca la entidad para insertar.'; break;
        case 'find': { const r = db.find((x) => x.id === 1); if (!r) { codeLines.pop(); draw('No hay fila con Id 1.'); return; } ent = { ...r, state: 'Unchanged', orig: { ...r } }; tracked = true; msg = 'Consulta con seguimiento: EF guarda una copia de los valores originales.'; break; }
        case 'notrack': { const r = db.find((x) => x.id === 1); if (!r) { codeLines.pop(); draw('No hay fila con Id 1.'); return; } ent = { ...r, state: 'Unchanged', orig: { ...r } }; tracked = false; msg = 'AsNoTracking: más rápido para leer, pero EF no detecta cambios.'; break; }
        case 'edit': ent.name = 'Laura B. Pérez'; if (tracked && ent.state === 'Unchanged') ent.state = 'Modified'; msg = tracked ? 'EF compara con los valores originales y detecta el cambio en Name.' : 'Cambiaste el objeto en memoria, pero nadie lo está siguiendo.'; break;
        case 'remove': if (!tracked) { tracked = true; } ent.state = ent.state === 'Added' ? 'Detached' : 'Deleted'; if (ent.state === 'Detached') { tracked = false; msg = 'Remove sobre una entidad Added simplemente la descarta: nunca llegó a la base.'; } else msg = 'Remove marca para borrar. Ojo: el EJ15 pide borrado lógico (IsActive = false), no DELETE.'; break;
        case 'save': {
          if (!ent || !tracked || ent.state === 'Unchanged') { log.push('-- SaveChanges no encontró cambios: no se envía nada'); msg = !tracked && ent ? 'Como la entidad no está seguida, el cambio se pierde.' : ''; break; }
          if (ent.state === 'Added') { const id = Math.max(0, ...db.map((x) => x.id)) + 1; log.push(`INSERT INTO [Doctors] ([Name], [LicenseNumber])\nVALUES (@p0, @p1);\n-- @p0='${ent.name}', @p1='${ent.lic}'\nSELECT [Id] FROM [Doctors] WHERE @@ROWCOUNT = 1 AND [Id] = scope_identity();`); ent.id = id; db.push({ id, name: ent.name, lic: ent.lic }); msg = `La base generó Id = ${id} y EF lo copió en d.Id.`; }
          else if (ent.state === 'Modified') { log.push(`UPDATE [Doctors] SET [Name] = @p0\nWHERE [Id] = @p1;\n-- solo la columna que cambió`); db = db.map((r) => (r.id === ent.id ? { ...r, name: ent.name } : r)); }
          else if (ent.state === 'Deleted') { log.push(`DELETE FROM [Doctors]\nWHERE [Id] = @p0;`); db = db.filter((r) => r.id !== ent.id); tracked = false; ent.state = 'Detached'; }
          if (ent.state !== 'Detached') ent.state = 'Unchanged';
          ent.orig = { ...ent };
        }
      }
      draw(msg);
    });
    $('[data-act="reset"]').addEventListener('click', () => { reset(); draw(); });
    reset(); draw();
  };

  // ---------- Pruebas por mutantes: diseñar casos que detecten errores ----------
  // cfg: { code, params: [{ name, label, type, def }], fn, out: 'number'|'string', mutants: [{ desc, fn }], seed?: [[...args, expected]] }
  L.mutants = (el, cfg, { esc, highlight }) => {
    const rows = (cfg.seed || []).map((r) => [...r]);
    el.innerHTML = `
      <pre class="code" data-lang="cs" data-ready="1"><code>${highlight(cfg.code.trim(), 'cs')}</code></pre>
      <p class="mem-h">Tus casos de prueba (como un [Theory] con [InlineData])</p>
      <div class="table-wrap"><table class="mut-table"><thead><tr>${cfg.params.map((p) => `<th>${p.label}</th>`).join('')}<th>Resultado esperado</th><th></th></tr></thead><tbody></tbody></table></div>
      <div class="lab-row"><button class="btn sm" type="button" data-act="add">Agregar caso</button><button class="btn sm primary" type="button" data-act="run">Ejecutar las pruebas</button></div>
      <div class="mut-res" aria-live="polite"></div>`;
    const $ = (s) => el.querySelector(s);
    const draw = () => {
      $('.mut-table tbody').innerHTML = rows.map((r, i) => `<tr>${cfg.params.map((p, j) => `<td><input type="${p.type === 'text' ? 'text' : 'number'}" step="any" data-r="${i}" data-c="${j}" value="${esc(r[j] ?? '')}" aria-label="${p.label}, caso ${i + 1}"></td>`).join('')}<td><input type="${cfg.out === 'string' ? 'text' : 'number'}" step="any" data-r="${i}" data-c="${cfg.params.length}" value="${esc(r[cfg.params.length] ?? '')}" aria-label="Esperado, caso ${i + 1}"></td><td><button type="button" class="icon-btn sm" data-del="${i}" aria-label="Borrar caso ${i + 1}">✕</button></td></tr>`).join('') || `<tr><td colspan="${cfg.params.length + 2}" class="api-placeholder">Agregá al menos un caso.</td></tr>`;
    };
    const parse = (v, t) => (t === 'text' || t === 'string' ? String(v) : parseFloat(v));
    const show = (v) => (typeof v === 'number' ? String(+v.toFixed(4)) : String(v));
    const same = (a, b) => (typeof a === 'number' ? Math.abs(a - b) < 0.01 : a === b);
    $('.mut-table').addEventListener('input', (e) => { const i = e.target; if (i.dataset.r !== undefined) rows[+i.dataset.r][+i.dataset.c] = i.value; });
    $('.mut-table').addEventListener('click', (e) => { const b = e.target.closest('[data-del]'); if (b) { rows.splice(+b.dataset.del, 1); draw(); } });
    $('[data-act="add"]').addEventListener('click', () => { rows.push(cfg.params.map((p) => p.def ?? '').concat([''])); draw(); });
    $('[data-act="run"]').addEventListener('click', () => {
      const cases = rows.filter((r) => r.every((x) => x !== '' && x !== undefined)).map((r) => ({ args: cfg.params.map((p, j) => parse(r[j], p.type)), exp: parse(r[cfg.params.length], cfg.out) }));
      if (!cases.length) { $('.mut-res').innerHTML = '<p class="chip warn">Completá al menos un caso entero.</p>'; return; }
      const wrong = cases.filter((c) => !same(cfg.fn(...c.args), c.exp));
      const killed = cfg.mutants.map((m) => cases.some((c) => { try { return !same(m.fn(...c.args), c.exp); } catch { return true; } }));
      const k = killed.filter(Boolean).length;
      $('.mut-res').innerHTML = `
        ${wrong.length ? `<div class="note warn"><p>${wrong.length} caso${wrong.length > 1 ? 's' : ''} falla${wrong.length > 1 ? 'n' : ''} contra el código correcto: revisá el resultado esperado. ${wrong.map((c) => `Con (${c.args.join(', ')}) el método devuelve <code>${esc(show(cfg.fn(...c.args)))}</code>.`).join(' ')}</p></div>` : `<p class="chip ok">Las ${cases.length} pruebas pasan contra el código correcto.</p>`}
        <p class="mem-h">Versiones con errores (mutantes) que tus pruebas detectan: ${k} de ${cfg.mutants.length}</p>
        <ul class="goals-list">${cfg.mutants.map((m, i) => `<li class="${killed[i] ? 'met' : 'fail'}">${m.desc}${killed[i] ? '' : ' <span class="api-note">(sobrevive: ninguna prueba lo nota)</span>'}</li>`).join('')}</ul>
        ${k === cfg.mutants.length && !wrong.length ? '<p class="note tip">Excelente: tus pruebas detectan todos los errores. Fijate cuáles casos fueron necesarios: suelen ser los valores límite.</p>' : ''}`;
    });
    draw();
  };

  // ---------- Logging: niveles y filtros ----------
  const LEVELS = ['Trace', 'Debug', 'Information', 'Warning', 'Error', 'Critical', 'None'];
  const CALLS = [
    ['Microsoft.AspNetCore.Hosting', 'Information', 'Request starting HTTP/1.1 GET https://localhost:7001/api/doctors'],
    ['Microsoft.EntityFrameworkCore.Database.Command', 'Information', 'Executed DbCommand (3ms) SELECT [d].[Id], [d].[Name] FROM [Doctors] AS [d]'],
    ['Dsw2026Ej15.Api.DoctorsController', 'Debug', 'Buscando médicos activos'],
    ['Dsw2026Ej15.Api.DoctorsController', 'Information', 'Se devolvieron {Count} médicos', { Count: 4 }],
    ['Dsw2026Ej15.Domain.DoctorService', 'Warning', 'Intento de crear médico con especialidad inexistente {SpecialityId}', { SpecialityId: '00000000-0000-0000-0000-000000000000' }],
    ['Dsw2026Ej15.Api.ExceptionMiddleware', 'Error', 'Error no controlado procesando {Path}', { Path: '/api/doctors' }],
    ['Dsw2026Ej15.Domain.DoctorService', 'Trace', 'Entrando a CreateDoctor'],
    ['Microsoft.AspNetCore.Hosting', 'Critical', 'La aplicación no pudo iniciar: falta la cadena de conexión'],
  ];
  L.loglevels = (el, cfg, { esc, highlight }) => {
    el.innerHTML = `
      <div class="di-cfg">
        <label>LogLevel "Default"<select data-k="def">${LEVELS.map((l) => `<option ${l === 'Information' ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label>LogLevel "Microsoft.AspNetCore"<select data-k="asp">${LEVELS.map((l) => `<option ${l === 'Warning' ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label>LogLevel "Microsoft.EntityFrameworkCore"<select data-k="ef">${['(sin regla)', ...LEVELS].map((l) => `<option>${l}</option>`).join('')}</select></label>
      </div>
      <div class="api-cols">
        <div><p class="mem-h">appsettings.json</p><pre class="code" data-lang="json" data-ready="1"><code class="lg-json"></code></pre></div>
        <div><p class="mem-h">Lo que sale por consola</p><pre class="lab-out lg-out"></pre></div>
      </div>
      <p class="api-note">Regla: se escribe un mensaje si su nivel es mayor o igual al mínimo configurado para la categoría más específica que coincida con su nombre.</p>`;
    const $ = (s) => el.querySelector(s);
    const draw = () => {
      const c = {}; el.querySelectorAll('[data-k]').forEach((s) => (c[s.dataset.k] = s.value));
      const rules = { Default: c.def, 'Microsoft.AspNetCore': c.asp };
      if (c.ef !== '(sin regla)') rules['Microsoft.EntityFrameworkCore'] = c.ef;
      $('.lg-json').innerHTML = highlight(JSON.stringify({ Logging: { LogLevel: rules } }, null, 2), 'json');
      const min = (cat) => { const k = Object.keys(rules).filter((r) => r !== 'Default' && cat.startsWith(r)).sort((a, b) => b.length - a.length)[0]; return rules[k || 'Default']; };
      const short = { Trace: 'trce', Debug: 'dbug', Information: 'info', Warning: 'warn', Error: 'fail', Critical: 'crit' };
      $('.lg-out').innerHTML = CALLS.map(([cat, lvl, tpl, props]) => {
        const shown = LEVELS.indexOf(lvl) >= LEVELS.indexOf(min(cat));
        const msg = tpl.replace(/\{(\w+)\}/g, (_, k) => props?.[k] ?? `{${k}}`);
        return `<span class="${shown ? '' : 'lg-hidden'}">${shown ? '' : '<s>'}${short[lvl]}: ${esc(cat)}\n      ${esc(msg)}${props ? `\n      <span class="t-add">propiedades: ${esc(JSON.stringify(props))}</span>` : ''}${shown ? '' : '</s>'}</span>`;
      }).join('\n');
    };
    el.addEventListener('change', draw);
    draw();
  };
})();
