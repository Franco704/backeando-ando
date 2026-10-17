/* Laboratorios de C# y .NET: trazador de ejecución, lifetimes de DI, LINQ, async/await y eventos. */
(() => {
  const L = window.GUIDE.LABS;

  // ---------- Trazador: qué líneas se ejecutan según el escenario ----------
  // cfg: { code, lang?, scenarios: [{ label, lines: [n], output, note }] }
  L.trace = (el, cfg, { esc, highlight }) => {
    const lines = cfg.code.trim().split('\n');
    el.innerHTML = `
      <label class="api-field">Escenario<select class="tr-sel">${cfg.scenarios.map((s, i) => `<option value="${i}">${s.label}</option>`).join('')}</select></label>
      <pre class="code tr-code" data-lang="cs" data-ready="1"><code></code></pre>
      <div class="api-cols"><div><p class="mem-h">Consola</p><pre class="lab-out tr-out"></pre></div><div class="tr-note"></div></div>`;
    const draw = () => {
      const s = cfg.scenarios[+el.querySelector('.tr-sel').value];
      const on = new Set(s.lines);
      el.querySelector('.tr-code code').innerHTML = lines.map((ln, i) => `<span class="ln${on.has(i + 1) ? ' cur' : s.lines.length ? ' dim' : ''}">${highlight(ln, cfg.lang || 'cs') || ' '}</span>`).join('\n');
      el.querySelector('.tr-out').textContent = s.output || '(nada)';
      el.querySelector('.tr-note').innerHTML = s.note ? `<p class="mem-h">Por qué</p><p>${s.note}</p>` : '';
    };
    el.querySelector('.tr-sel').addEventListener('change', draw);
    draw();
  };

  // ---------- Inyección de dependencias: lifetimes ----------
  L.di = (el, cfg, { esc, highlight }) => {
    const LT = ['Transient', 'Scoped', 'Singleton'];
    let st = { pers: cfg.pers || 'Transient', svc: cfg.svc || 'Scoped' };
    let requests = [];
    el.innerHTML = `
      <div class="di-cfg">
        <label>IPersistence → PersistenceInMemory<select data-k="pers">${LT.map((x) => `<option ${x === st.pers ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
        <label>IDoctorService → DoctorService<select data-k="svc">${LT.map((x) => `<option ${x === st.svc ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      </div>
      <pre class="code di-code" data-lang="cs" data-ready="1"><code></code></pre>
      <div class="lab-row"><button class="btn sm primary" type="button" data-act="req">Simular un request: POST de un médico y luego GET</button><button class="btn sm" type="button" data-act="clear">Reiniciar la aplicación</button></div>
      <div class="di-out" aria-live="polite"></div>`;
    const $ = (s) => el.querySelector(s);
    let app;
    const boot = () => { app = { singletons: {}, n: { P: 0, S: 0 } }; requests = []; };
    const resolve = (name, scope, path) => {
      const lt = name === 'P' ? st.pers : st.svc;
      if (name === 'P' && st.svc === 'Singleton' && lt === 'Scoped' && path.includes('S')) throw new Error("Cannot consume scoped service 'IPersistence' from singleton 'IDoctorService'.");
      const make = () => {
        const id = `${name === 'P' ? 'PersistenceInMemory' : 'DoctorService'} #${++app.n[name]}`;
        const inst = { id, doctors: name === 'P' ? [] : null };
        if (name === 'S') inst.dep = resolve('P', scope, [...path, 'S']);
        return inst;
      };
      if (lt === 'Singleton') return (app.singletons[name] ||= make());
      if (lt === 'Scoped') return (scope[name] ||= make());
      return make();
    };
    const draw = () => {
      $('.di-code code').innerHTML = highlight(`builder.Services.Add${st.pers}<IPersistence, PersistenceInMemory>();\nbuilder.Services.Add${st.svc}<IDoctorService, DoctorService>();\n\n// DoctorsController(IDoctorService service, IPersistence persistence)\n// DoctorService(IPersistence persistence)`, 'cs');
      $('.di-out').innerHTML = requests.length ? `<div class="table-wrap"><table><thead><tr><th>Request</th><th>Controlador recibe IDoctorService</th><th>DoctorService usa IPersistence</th><th>Controlador recibe IPersistence</th><th>Médicos visibles en el GET</th></tr></thead><tbody>${requests.map((r, i) => r.error ? `<tr><td>${i + 1}</td><td colspan="4" class="t-err">InvalidOperationException: ${esc(r.error)}</td></tr>` : `<tr><td>${i + 1}</td><td><code>${r.s}</code></td><td><code>${r.sp}</code></td><td><code>${r.p}</code></td><td>${r.count}</td></tr>`).join('')}</tbody></table></div>${insight()}` : '<p class="api-placeholder">Cada request crea un scope nuevo. Simulá varios y compará los números de instancia.</p>';
    };
    const insight = () => {
      const last = requests[requests.length - 1];
      if (last.error) return '<p class="note warn">Dependencia cautiva: un Singleton vive toda la aplicación y no puede quedarse con un servicio Scoped, que debería morir al terminar cada request. En Development, ASP.NET Core valida los scopes y lanza esta excepción al resolver.</p>';
      const msgs = [];
      if (st.pers !== 'Singleton') msgs.push(`Con <code>${st.pers}</code>, cada request recibe una persistencia en memoria nueva y vacía: el médico que se guardó en el POST de un request desaparece en el siguiente. Por eso el EJ15 pide registrar <code>PersistenceInMemory</code> como <strong>Singleton</strong>.`);
      if (st.pers === 'Transient' && last.sp !== last.p) msgs.push('Además, dentro del mismo request el controlador y el servicio reciben instancias distintas: lo que guarda uno no lo ve el otro.');
      if (st.pers === 'Singleton') msgs.push('Con Singleton hay una sola instancia para toda la aplicación: los datos se acumulan entre requests, como en una base de datos.');
      if (st.svc === 'Singleton' && st.pers === 'Transient') msgs.push('Ojo: un Singleton que recibe un Transient se queda con esa instancia para siempre (el Transient deja de ser “nuevo cada vez”).');
      return `<div class="note">${msgs.map((m) => `<p>${m}</p>`).join('')}</div>`;
    };
    el.querySelector('.di-cfg').addEventListener('change', (e) => { st[e.target.dataset.k] = e.target.value; boot(); draw(); });
    $('[data-act="req"]').addEventListener('click', () => {
      const scope = {};
      try {
        const s = resolve('S', scope, []);
        const p = resolve('P', scope, []);
        s.dep.doctors.push('Médico ' + (requests.length + 1));
        requests.push({ s: s.id, sp: s.dep.id, p: p.id, count: p.doctors.length });
      } catch (err) { requests.push({ error: err.message }); }
      draw();
    });
    $('[data-act="clear"]').addEventListener('click', () => { boot(); draw(); });
    boot(); draw();
  };

  // ---------- LINQ: armar una consulta encadenando operadores ----------
  const PRODUCTS = [
    { Code: 35, Description: 'Galletas merengadas', Category: 'Almacén', Price: 2107.5, Stock: 12 },
    { Code: 36, Description: 'Galletas de vainilla', Category: 'Almacén', Price: 1849.75, Stock: 0 },
    { Code: 40, Description: 'Yerba 1 kg', Category: 'Almacén', Price: 4200, Stock: 30 },
    { Code: 51, Description: 'Detergente 750 ml', Category: 'Limpieza', Price: 1650, Stock: 8 },
    { Code: 52, Description: 'Lavandina 2 l', Category: 'Limpieza', Price: 1290, Stock: 15 },
    { Code: 70, Description: 'Auriculares', Category: 'Electrónica', Price: 15000, Stock: 3 },
    { Code: 71, Description: 'Cargador USB-C', Category: 'Electrónica', Price: 8900, Stock: 0 },
    { Code: 72, Description: 'Mouse inalámbrico', Category: 'Electrónica', Price: 11250, Stock: 6 },
  ];
  const FILTERS = {
    'p.Stock > 0': (p) => p.Stock > 0,
    'p.Price > 5000': (p) => p.Price > 5000,
    'p.Category == "Electrónica"': (p) => p.Category === 'Electrónica',
    'p.Description.StartsWith("Galletas")': (p) => p.Description.startsWith('Galletas'),
  };
  const KEYS = { 'p.Price': 'Price', 'p.Description': 'Description', 'p.Stock': 'Stock', 'p.Category': 'Category' };
  const PROJ = {
    'p.Description': (p) => p.Description,
    'new { p.Code, p.Price }': (p) => ({ Code: p.Code, Price: p.Price }),
    'p.Price * 1.21m': (p) => +(p.Price * 1.21).toFixed(2),
  };
  const OPS = {
    Where: { args: Object.keys(FILTERS) },
    OrderBy: { args: Object.keys(KEYS) },
    OrderByDescending: { args: Object.keys(KEYS) },
    ThenBy: { args: Object.keys(KEYS) },
    Select: { args: Object.keys(PROJ) },
    Take: { args: ['2', '3'] },
    Skip: { args: ['1', '2'] },
    GroupBy: { args: ['p.Category'], last: true },
    Count: { args: [''], last: true },
    Sum: { args: ['p.Price', 'p.Stock'], last: true },
    Average: { args: ['p.Price'], last: true },
    Max: { args: ['p.Price'], last: true },
    First: { args: [''], last: true },
    FirstOrDefault: { args: ['p => p.Price > 99999'], last: true },
    Any: { args: ['p => p.Stock == 0'], last: true },
  };

  L.linq = (el, cfg, { esc, highlight }) => {
    let chain = cfg.start ? [...cfg.start] : [['Where', 'p.Stock > 0'], ['OrderBy', 'p.Price']];
    el.innerHTML = `
      <p class="mem-h">Datos: <code>List&lt;Product&gt; products</code> (${PRODUCTS.length} elementos)</p>
      <div class="table-wrap linq-src"><table><thead><tr><th>Code</th><th>Description</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead><tbody>${PRODUCTS.map((p) => `<tr><td>${p.Code}</td><td>${p.Description}</td><td>${p.Category}</td><td>${p.Price}</td><td>${p.Stock}</td></tr>`).join('')}</tbody></table></div>
      <ol class="linq-chain"></ol>
      <div class="lab-row linq-add">
        <select class="linq-op" aria-label="Operador">${Object.keys(OPS).map((o) => `<option>${o}</option>`).join('')}</select>
        <select class="linq-arg" aria-label="Argumento"></select>
        <button class="btn sm" type="button" data-act="add">Agregar operador</button>
      </div>
      <div class="api-cols">
        <div><p class="mem-h">Sintaxis de métodos</p><pre class="code linq-m" data-lang="cs" data-ready="1"><code></code></pre>
             <p class="mem-h">Sintaxis de consulta (cuando existe)</p><pre class="code linq-q" data-lang="cs" data-ready="1"><code></code></pre></div>
        <div><p class="mem-h">Resultado</p><div class="linq-res"></div></div>
      </div>`;
    const $ = (s) => el.querySelector(s);
    const fillArgs = () => { const op = $('.linq-op').value; $('.linq-arg').innerHTML = OPS[op].args.map((a) => `<option value="${esc(a)}">${a ? esc(a) : '(sin argumento)'}</option>`).join(''); $('.linq-arg').hidden = OPS[op].args.length === 1 && !OPS[op].args[0]; };
    const lambda = (op, a) => {
      if (!a) return '';
      if (a.startsWith('p =>')) return a;
      if (['Take', 'Skip'].includes(op)) return a;
      return `p => ${a}`;
    };
    const run = () => {
      let data = PRODUCTS.map((p) => ({ ...p }));
      let projected = false, sortKeys = [];
      for (const [op, a] of chain) {
        if (projected && !['Take', 'Skip', 'Count', 'First', 'FirstOrDefault', 'Any'].includes(op)) throw new Error(`Después de Select los elementos ya no son Product: ${op}(p => p…) no compila en este ejemplo.`);
        switch (op) {
          case 'Where': data = data.filter(FILTERS[a]); break;
          case 'OrderBy': case 'OrderByDescending': sortKeys = [[KEYS[a], op === 'OrderBy' ? 1 : -1]]; data = sort(data, sortKeys); break;
          case 'ThenBy': if (!sortKeys.length) throw new Error('ThenBy solo existe sobre IOrderedEnumerable: va después de OrderBy.'); sortKeys.push([KEYS[a], 1]); data = sort(data, sortKeys); break;
          case 'Select': data = data.map(PROJ[a]); projected = true; break;
          case 'Take': data = data.slice(0, +a); break;
          case 'Skip': data = data.slice(+a); break;
          case 'GroupBy': { const g = {}; data.forEach((p) => (g[p.Category] ||= []).push(p)); return { groups: g }; }
          case 'Count': return { scalar: data.length };
          case 'Sum': return { scalar: +data.reduce((s, p) => s + p[a.slice(2)], 0).toFixed(2) };
          case 'Average': if (!data.length) throw new Error('InvalidOperationException: Sequence contains no elements'); return { scalar: +(data.reduce((s, p) => s + p.Price, 0) / data.length).toFixed(2) };
          case 'Max': if (!data.length) throw new Error('InvalidOperationException: Sequence contains no elements'); return { scalar: Math.max(...data.map((p) => p.Price)) };
          case 'First': if (!data.length) throw new Error('InvalidOperationException: Sequence contains no elements'); return { item: data[0] };
          case 'FirstOrDefault': { const f = data.find((p) => p.Price > 99999); return { item: f ?? null }; }
          case 'Any': return { scalar: data.some((p) => p.Stock === 0) };
        }
      }
      return { list: data };
    };
    const sort = (d, keys) => [...d].sort((x, y) => { for (const [k, dir] of keys) { if (x[k] < y[k]) return -dir; if (x[k] > y[k]) return dir; } return 0; });
    const methodSyntax = () => `var resultado = products${chain.map(([op, a]) => `\n    .${op}(${lambda(op, a)})`).join('')}${chain.some(([op]) => OPS[op].last) ? '' : '\n    .ToList();'}${chain.some(([op]) => OPS[op].last) ? ';' : ''}`;
    const NOKW = ['Take', 'Skip', 'Count', 'Sum', 'Average', 'Max', 'First', 'FirstOrDefault', 'Any'];
    const querySyntax = () => {
      const firstNo = chain.findIndex(([op]) => NOKW.includes(op));
      if (firstNo === -1) return `var resultado = ${build(chain)};`;
      const inner = chain.slice(0, firstNo), tail = chain.slice(firstNo);
      if (tail.some(([op]) => !NOKW.includes(op))) return '// No hay equivalente directo: después de Take o Skip\n// se vuelve a filtrar u ordenar. Quedate con la sintaxis de métodos.';
      return `// Take, Skip y los agregados no tienen palabra clave:\n// se combinan los dos estilos\nvar resultado = (${build(inner).replace(/\n/g, '\n    ')})${tail.map(([op, a]) => `.${op}(${lambda(op, a)})`).join('')};`;
    };
    const build = (ch) => {
      const parts = ['from p in products'];
      const orders = [];
      let sel = 'select p';
      for (const [op, a] of ch) {
        if (op === 'Where') parts.push(`where ${a}`);
        if (op === 'OrderBy' || op === 'ThenBy') orders.push(a);
        if (op === 'OrderByDescending') orders.push(`${a} descending`);
        if (op === 'Select') sel = `select ${a}`;
        if (op === 'GroupBy') sel = `group p by ${a}`;
      }
      if (orders.length) parts.push(`orderby ${orders.join(', ')}`);
      parts.push(sel);
      return parts.join('\n    ');
    };
    const fmt = (v) => (v && typeof v === 'object' ? `{ ${Object.entries(v).map(([k, x]) => `${k} = ${x}`).join(', ')} }` : String(v));
    const draw = () => {
      $('.linq-chain').innerHTML = chain.map(([op, a], i) => `<li><code>.${op}(${esc(lambda(op, a))})</code><button type="button" class="icon-btn sm" data-del="${i}" aria-label="Quitar ${op}">✕</button></li>`).join('') || '<li class="api-placeholder">products (sin operadores)</li>';
      const terminal = chain.some(([op]) => OPS[op].last);
      $('.linq-add').hidden = terminal;
      $('.linq-m code').innerHTML = highlight(methodSyntax(), 'cs');
      $('.linq-q code').innerHTML = highlight(querySyntax(), 'cs');
      let res;
      try { res = run(); } catch (e) { $('.linq-res').innerHTML = `<p class="chip err">${esc(e.message)}</p>`; return; }
      if (res.groups) $('.linq-res').innerHTML = Object.entries(res.groups).map(([k, ps]) => `<p class="mem-h">Grupo Key = "${k}" (${ps.length})</p><pre class="lab-out">${ps.map((p) => p.Description).join('\n')}</pre>`).join('');
      else if ('scalar' in res) $('.linq-res').innerHTML = `<pre class="lab-out">${esc(String(res.scalar))}</pre><p class="api-note">Un operador de agregación ejecuta la consulta en el momento y devuelve un solo valor.</p>`;
      else if ('item' in res) $('.linq-res').innerHTML = `<pre class="lab-out">${res.item ? esc(fmt(res.item.Description ? { Code: res.item.Code, Description: res.item.Description, Price: res.item.Price } : res.item)) : 'null'}</pre>`;
      else $('.linq-res').innerHTML = `<pre class="lab-out">${res.list.length ? res.list.map((x) => esc(typeof x === 'object' && x.Description !== undefined ? `${x.Code}  ${x.Description}  $${x.Price}  (stock ${x.Stock})` : fmt(x))).join('\n') : '(secuencia vacía)'}</pre><p class="api-note">${res.list.length} elemento${res.list.length === 1 ? '' : 's'}. Ejecución diferida: la consulta recién corre al recorrerla (foreach) o al llamar a ToList().</p>`;
    };
    $('.linq-op').addEventListener('change', fillArgs);
    $('[data-act="add"]').addEventListener('click', () => { chain.push([$('.linq-op').value, $('.linq-arg').value]); draw(); });
    $('.linq-chain').addEventListener('click', (e) => { const b = e.target.closest('[data-del]'); if (b) { chain.splice(+b.dataset.del, 1); draw(); } });
    fillArgs();
    draw();
  };

  // ---------- async/await: línea de tiempo del EJ13 ----------
  const TASKS = [
    { id: 'file', label: 'Leer Products.json', ms: 400, kind: 'io' },
    { id: 'web', label: 'DataManager.GetProducts() (web)', ms: 1500, kind: 'io' },
    { id: 'q1', label: 'Cotización opción 1', ms: 900, kind: 'io' },
    { id: 'q2', label: 'Cotización opción 2', ms: 1200, kind: 'io' },
    { id: 'q3', label: 'Cotización opción 3', ms: 700, kind: 'io' },
    { id: 'calc', label: 'Calcular precios en dólares', ms: 150, kind: 'cpu' },
  ];
  const MODES = {
    sync: {
      label: 'Original sincrónico',
      code: `public void UpdatePrices()
{
    var quote = GetAverageDollarQuote();   // q1, q2, q3 una tras otra
    var products = GetProducts();          // web y después archivo
    products.ForEach(p => p.UpdatePrice(quote));
}`,
      plan: [['q1'], ['q2'], ['q3'], ['web'], ['file'], ['calc']], blocked: true,
      note: 'Cada llamada bloquea el hilo hasta que termina. El tiempo total es la suma de todas las esperas, y mientras tanto el hilo no puede hacer nada más.',
    },
    seq: {
      label: 'async/await, uno por uno',
      code: `public async Task UpdatePricesAsync()
{
    var q1 = await QuoteManager.GetDollarQuoteOptionOneAsync();
    var q2 = await QuoteManager.GetDollarQuoteOptionTwoAsync();
    var q3 = await QuoteManager.GetDollarQuoteOptionThreeAsync();
    var web = await DataManager.GetProductsAsync();
    var file = await DataService.GetProductsFromFileAsync();
    // calcular…
}`,
      plan: [['q1'], ['q2'], ['q3'], ['web'], ['file'], ['calc']], blocked: false,
      note: 'Ya no bloquea el hilo (queda libre durante cada espera), pero cada await espera al anterior: el tiempo total es el mismo que el sincrónico. async no es lo mismo que paralelo.',
    },
    all: {
      label: 'Task.WhenAll',
      code: `public async Task UpdatePricesAsync()
{
    // Se inician todas las tareas sin esperar
    var q1 = QuoteManager.GetDollarQuoteOptionOneAsync();
    var q2 = QuoteManager.GetDollarQuoteOptionTwoAsync();
    var q3 = QuoteManager.GetDollarQuoteOptionThreeAsync();
    var web = DataManager.GetProductsAsync();
    var file = DataService.GetProductsFromFileAsync();

    // Se espera a que terminen todas juntas
    var quotes = await Task.WhenAll(q1, q2, q3);
    await Task.WhenAll(web, file);

    var quote = quotes.Average();
    // calcular con web.Result y file.Result (ya terminaron)…
}`,
      plan: [['q1', 'q2', 'q3', 'web', 'file'], ['calc']], blocked: false,
      note: 'Las cinco operaciones de entrada/salida esperan al mismo tiempo. El total es aproximadamente la más lenta (la web, 1,5 s) más el cálculo. Esta es la mejora que pide el EJ13.',
    },
    result: {
      label: 'Error común: .Result',
      code: `public void UpdatePrices()
{
    // .Result bloquea el hilo hasta que la tarea termina
    var q1 = QuoteManager.GetDollarQuoteOptionOneAsync().Result;
    var q2 = QuoteManager.GetDollarQuoteOptionTwoAsync().Result;
    var q3 = QuoteManager.GetDollarQuoteOptionThreeAsync().Result;
    // …
}`,
      plan: [['q1'], ['q2'], ['q3'], ['web'], ['file'], ['calc']], blocked: true,
      note: 'Usar .Result o .Wait() convierte el código asincrónico en sincrónico: bloquea el hilo y en aplicaciones con contexto de sincronización (UI, ASP.NET clásico) puede causar un deadlock. Regla: async hasta arriba.',
    },
  };
  L.async = (el, cfg, { esc, highlight }) => {
    el.innerHTML = `
      <div class="lab-row" role="radiogroup" aria-label="Versión del código">${Object.entries(MODES).map(([k, mo], i) => `<label class="seg"><input type="radio" name="am-${(cfg.uid ||= Math.random().toString(36).slice(2, 7))}" value="${k}" ${i === 0 ? 'checked' : ''}><span>${mo.label}</span></label>`).join('')}</div>
      <pre class="code as-code" data-lang="cs" data-ready="1"><code></code></pre>
      <div class="lab-row"><button class="btn sm primary" type="button" data-act="run">Ejecutar</button><span class="as-total" aria-live="polite"></span></div>
      <div class="gantt"></div>
      <p class="as-note"></p>`;
    const $ = (s) => el.querySelector(s);
    let timer;
    const mode = () => MODES[el.querySelector('input:checked').value];
    const layout = (mo) => {
      let t = 0;
      const rows = {};
      mo.plan.forEach((group) => {
        const end = t + Math.max(...group.map((id) => TASKS.find((x) => x.id === id).ms));
        group.forEach((id) => (rows[id] = { start: t, end: t + TASKS.find((x) => x.id === id).ms }));
        t = end;
      });
      return { rows, total: t };
    };
    const SCALE = 5400;
    const draw = (progress = null) => {
      const mo = mode();
      const { rows, total } = layout(mo);
      $('.as-code code').innerHTML = highlight(mo.code, 'cs');
      $('.gantt').innerHTML = TASKS.map((tk) => {
        const r = rows[tk.id];
        const vis = progress === null ? 1 : Math.max(0, Math.min(1, (progress - r.start) / (r.end - r.start)));
        return `<div class="g-row"><span class="g-label">${tk.label}</span><span class="g-track"><span class="g-bar ${tk.kind}" style="left:${(r.start / SCALE) * 100}%;width:${((r.end - r.start) / SCALE) * 100 * vis}%"></span></span></div>`;
      }).join('') + `<div class="g-row"><span class="g-label">Hilo principal</span><span class="g-track"><span class="g-bar ${mo.blocked ? 'blocked' : 'free'}" style="left:0;width:${((progress === null ? total : Math.min(progress, total)) / SCALE) * 100}%"></span></span></div>
        <div class="g-legend"><span><i class="io"></i> espera de E/S</span><span><i class="cpu"></i> cálculo</span><span><i class="blocked"></i> hilo bloqueado</span><span><i class="free"></i> hilo libre para otras tareas</span></div>`;
      $('.as-total').textContent = progress === null || progress >= total ? `Tiempo total: ${(total / 1000).toFixed(2).replace('.', ',')} s` : `${(progress / 1000).toFixed(1).replace('.', ',')} s…`;
      $('.as-note').textContent = mo.note;
    };
    el.addEventListener('change', (e) => { if (e.target.type === 'radio') { clearInterval(timer); draw(); } });
    $('[data-act="run"]').addEventListener('click', () => {
      clearInterval(timer);
      const { total } = layout(mode());
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(); return; }
      let p = 0;
      timer = setInterval(() => { p += 60; draw(p); if (p >= total) { clearInterval(timer); draw(); } }, 30);
    });
    draw();
  };

  // ---------- Delegados y eventos: la constelación del EJ12 ----------
  L.events = (el, cfg, { esc, highlight }) => {
    let stars = [], next = 1, useEvent = true, age = 0;
    const LUM = ['Nula', 'Baja', 'Media', 'Alta'];
    el.innerHTML = `
      <div class="lab-row">
        <label class="api-check"><input type="checkbox" class="ev-kw" checked> Declarar con la palabra <code>event</code></label>
      </div>
      <pre class="code ev-code" data-lang="cs" data-ready="1"><code></code></pre>
      <div class="lab-row">
        <button class="btn sm" type="button" data-act="add">CrearEstrella() (se suscribe con +=)</button>
        <button class="btn sm primary" type="button" data-act="tick">Pasan 10 años (Timer.Elapsed)</button>
        <button class="btn sm" type="button" data-act="hack">Código de afuera: PasoDelTiempo = null</button>
        <button class="btn sm" type="button" data-act="hack2">Código de afuera: PasoDelTiempo()</button>
      </div>
      <div class="api-cols">
        <div><p class="mem-h">Lista de invocación del delegado</p><ol class="ev-list"></ol><div class="ev-sky" aria-hidden="true"></div></div>
        <div><p class="mem-h">Consola</p><pre class="lab-out ev-out"></pre></div>
      </div>`;
    const $ = (s) => el.querySelector(s);
    const out = (s) => { $('.ev-out').textContent = (s + '\n' + $('.ev-out').textContent).slice(0, 3000); };
    const lum = (s) => (s.edad > s.vida ? 0 : s.edad <= s.vida * 0.1 ? 2 : s.edad <= s.vida * 0.8 ? 3 : 1);
    const draw = () => {
      $('.ev-code code').innerHTML = highlight(`public delegate void PasoDelTiempoDelegate();\n\npublic class Constelacion\n{\n    public ${useEvent ? 'event ' : ''}PasoDelTiempoDelegate? PasoDelTiempo;\n\n    private void OnTimerElapsed(object? s, ElapsedEventArgs e)\n        => PasoDelTiempo?.Invoke();   // solo la clase dueña dispara\n\n    public void CrearEstrella()\n    {\n        var estrella = new Estrella();\n        PasoDelTiempo += estrella.EvolucionEstelar;\n        Estrellas.Add(estrella);\n    }\n}`, 'cs');
      $('.ev-list').innerHTML = stars.length ? stars.map((s) => `<li><code>Estrella#${s.n}.EvolucionEstelar</code> <span class="chip ${['err', 'warn', 'acc', 'ok'][lum(s)]}">${LUM[lum(s)]}</span> <button type="button" class="icon-btn sm" data-rm="${s.n}" aria-label="Desuscribir estrella ${s.n}">−=</button></li>`).join('') : '<li class="api-placeholder">Nadie está suscripto: Invoke no llama a nadie (por eso se usa ?.)</li>';
      $('.ev-sky').innerHTML = stars.map((s) => `<span class="star l${lum(s)}" style="left:${s.x}%;top:${s.y}%"></span>`).join('');
    };
    $('.ev-kw').addEventListener('change', (e) => { useEvent = e.target.checked; draw(); });
    $('[data-act="add"]').addEventListener('click', () => { const s = { n: next++, edad: 0, vida: 50 + Math.floor(Math.random() * 250), x: 5 + Math.random() * 88, y: 8 + Math.random() * 80 }; stars.push(s); out(`Estrella#${s.n} creada (vida ${s.vida} años) y suscripta: PasoDelTiempo += estrella.EvolucionEstelar`); draw(); });
    $('[data-act="tick"]').addEventListener('click', () => {
      age += 10;
      if (!stars.length) { out(`Año ${age}: PasoDelTiempo?.Invoke() → null, no se llama a nadie`); return; }
      stars.forEach((s) => (s.edad = Math.min(s.edad + 10, s.vida + 1)));
      out(`Año ${age}: Invoke() llamó a ${stars.length} método${stars.length > 1 ? 's' : ''} en orden de suscripción`);
      draw();
    });
    $('[data-act="hack"]').addEventListener('click', () => {
      if (useEvent) out("error CS0070: The event 'Constelacion.PasoDelTiempo' can only appear on the left hand side of += or -= (except when used from within the type 'Constelacion')");
      else { out(`PasoDelTiempo = null → ¡se ${stars.length === 1 ? 'borró la única suscripción' : `borraron las ${stars.length} suscripciones de golpe`}! Las estrellas quedaron congeladas.`); stars.forEach((s) => (s.frozen = true)); stars = []; draw(); }
    });
    $('[data-act="hack2"]').addEventListener('click', () => {
      if (useEvent) out("error CS0070: The event 'Constelacion.PasoDelTiempo' can only appear on the left hand side of += or -= (except when used from within the type 'Constelacion')");
      else { stars.forEach((s) => (s.edad = Math.min(s.edad + 10, s.vida + 1))); out('Cualquier clase pudo disparar el “evento” como si fuera la constelación. Con un delegado público no hay control.'); draw(); }
    });
    $('.ev-list').addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) { stars = stars.filter((s) => s.n !== +b.dataset.rm); out(`PasoDelTiempo -= Estrella#${b.dataset.rm}.EvolucionEstelar`); draw(); } });
    draw();
  };
})();
