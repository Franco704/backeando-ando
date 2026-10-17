/* Laboratorios web: cliente REST contra una API simulada (la de médicos del EJ15), pipeline de
   middleware, CORS y JWT con firma HMAC real (WebCrypto). */
(() => {
  const L = window.GUIDE.LABS;
  const REASON = { 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed', 415: 'Unsupported Media Type', 429: 'Too Many Requests', 500: 'Internal Server Error' };
  const cls = (s) => (s < 300 ? 'ok' : s < 500 ? 'warn' : 'err');

  // ---------- JWT (HS256) con WebCrypto ----------
  const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64urlText = (s) => b64url(new TextEncoder().encode(s));
  const fromB64url = (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0))); };
  async function hmac(secret, data) {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return b64url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)));
  }
  async function signJwt(payload, secret) {
    const h = b64urlText(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const p = b64urlText(JSON.stringify(payload));
    return `${h}.${p}.${await hmac(secret, `${h}.${p}`)}`;
  }
  async function verifyJwt(token, secret, { issuer, audience } = {}) {
    const checks = [];
    const parts = (token || '').split('.');
    if (parts.length !== 3) return { ok: false, checks: [['Formato header.payload.firma', false]] };
    let header, payload;
    try { header = JSON.parse(fromB64url(parts[0])); payload = JSON.parse(fromB64url(parts[1])); } catch { return { ok: false, checks: [['El token se puede decodificar', false]] }; }
    const sigOk = header.alg === 'HS256' && (await hmac(secret, `${parts[0]}.${parts[1]}`)) === parts[2];
    checks.push(['Firma válida (nadie alteró header ni payload)', sigOk]);
    if (issuer) checks.push([`Emisor (iss) = ${issuer}`, payload.iss === issuer]);
    if (audience) checks.push([`Audiencia (aud) = ${audience}`, payload.aud === audience]);
    const now = Math.floor(Date.now() / 1000);
    checks.push(['No expiró (exp en el futuro)', typeof payload.exp === 'number' && payload.exp > now]);
    return { ok: checks.every((c) => c[1]), checks, header, payload };
  }
  window.GUIDE.jwt = { signJwt, verifyJwt, fromB64url };

  // ---------- API simulada: médicos y especialidades (EJ15) ----------
  const SPECS = [
    { id: '3f0c8a2e-1b7d-4c2a-9e51-0a6b2c7d9e11', name: 'Cardiología', description: 'Corazón y sistema circulatorio' },
    { id: '8b2d4f61-7c3e-4a9b-b0d2-5e6f7a8b9c22', name: 'Pediatría', description: 'Atención de niños y adolescentes' },
    { id: 'c4e5f6a7-2d3b-4e8f-a1b2-c3d4e5f6a733', name: 'Dermatología', description: 'Piel, pelo y uñas' },
  ];
  const SECRET = 'clave-secreta-de-al-menos-32-caracteres!!';
  const ISS = 'https://dsw2026.frt.utn.edu.ar';
  const guid = () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => ((Math.random() * 16) | 0).toString(16));

  function makeApi(feat) {
    const db = {
      specialities: SPECS.map((s) => ({ ...s })),
      doctors: [{ id: '5a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c44', name: 'Laura Pérez', licenseNumber: 'MP-1234', specialityId: SPECS[0].id, isActive: true }],
    };
    const state = { dbDown: false, hits: 0 };
    const vEx = (msg) => Object.assign(new Error(msg), { kind: 'ValidationException' });
    const nfEx = (msg) => Object.assign(new Error(msg), { kind: 'NotFound' });

    // Capa de persistencia (PersistenceInMemory, Singleton)
    const persistence = {
      getDoctors(trace) { trace('PersistenceInMemory.GetDoctors()'); if (state.dbDown) throw new Error('No se pudo conectar con el almacenamiento.'); return db.doctors; },
      getSpeciality(id, trace) { trace(`PersistenceInMemory.GetSpeciality(${id.slice(0, 8)}…)`); return db.specialities.find((s) => s.id === id); },
      add(d, trace) { trace('PersistenceInMemory.AddDoctor(doctor)'); if (state.dbDown) throw new Error('No se pudo conectar con el almacenamiento.'); db.doctors.push(d); },
    };
    const toDto = (d) => ({ id: d.id, name: d.name, licenseNumber: d.licenseNumber, specialityName: db.specialities.find((s) => s.id === d.specialityId)?.name });

    // Controladores: devuelven { status, body, headers }
    const routes = [
      { m: 'GET', re: /^\/health-check$/, ctrl: 'HealthChecks', act: 'MapHealthChecks("/health-check")', fn: () => ({ status: state.dbDown ? 503 : 200, body: state.dbDown ? 'Unhealthy' : 'Healthy', type: 'text/plain' }), anon: true, off: !feat.health },
      { m: 'POST', re: /^\/api\/auth\/login$/, ctrl: 'AuthController', act: 'Login(LoginModel)', anon: true, off: !feat.auth, fn: async (req, t) => {
        const b = req.json || {};
        t('AuthenticationService.Login()');
        const users = { admin: { pass: 'Admin123!', role: 'Admin' }, recepcion: { pass: 'Recep123!', role: 'Recepcion' } };
        const u = users[b.username];
        if (!u || u.pass !== b.password) return { status: 401, body: { title: 'Unauthorized', status: 401, detail: 'Usuario o contraseña incorrectos.' } };
        const now = Math.floor(Date.now() / 1000);
        const token = await signJwt({ sub: b.username, role: u.role, iss: ISS, aud: 'dsw-api', iat: now, exp: now + 30 * 60 }, SECRET);
        return { status: 200, body: { token, expiresIn: 1800 } };
      } },
      { m: 'GET', re: /^\/api\/specialities$/, ctrl: 'SpecialitiesController', act: 'GetAll()', anon: true, fn: () => ({ status: 200, body: db.specialities }) },
      { m: 'GET', re: /^\/api\/doctors$/, ctrl: 'DoctorsController', act: 'GetDoctors()', anon: true, fn: (req, t) => {
        t('DoctorService.GetActiveDoctors()');
        return { status: 200, body: persistence.getDoctors(t).filter((d) => d.isActive).map(toDto) };
      } },
      { m: 'GET', re: /^\/api\/doctors\/([^/]+)$/, ctrl: 'DoctorsController', act: 'GetDoctor(Guid id)', anon: true, fn: (req, t, [id]) => {
        if (!/^[0-9a-f-]{36}$/i.test(id)) return { status: 404, body: '', note: `La ruta es api/doctors/{id:guid}: "${id}" no es un Guid, así que ningún endpoint coincide.` };
        t('DoctorService.GetActiveDoctor(id)');
        const d = persistence.getDoctors(t).find((x) => x.id === id && x.isActive);
        if (!d) throw nfEx('No existe un médico activo con ese id.');
        const dto = toDto(d);
        return { status: 200, body: { name: dto.name, licenseNumber: dto.licenseNumber, specialityName: dto.specialityName } };
      } },
      { m: 'POST', re: /^\/api\/doctors$/, ctrl: 'DoctorsController', act: 'CreateDoctor(DoctorModel.Request)', fn: (req, t) => {
        const b = req.json;
        t('DoctorService.CreateDoctor(request)');
        if (!b.name || !String(b.name).trim()) throw vEx('El nombre es obligatorio.');
        if (!b.licenseNumber || !String(b.licenseNumber).trim()) throw vEx('La matrícula (licenseNumber) es obligatoria.');
        if (!b.specialityId || !persistence.getSpeciality(String(b.specialityId), t)) throw vEx('La especialidad indicada no existe.');
        const d = { id: guid(), name: b.name.trim(), licenseNumber: b.licenseNumber.trim(), specialityId: b.specialityId, isActive: true };
        persistence.add(d, t);
        return { status: 201, body: toDto(d), headers: { Location: `/api/doctors/${d.id}` } };
      } },
      { m: 'DELETE', re: /^\/api\/doctors\/([^/]+)$/, ctrl: 'DoctorsController', act: 'DeleteDoctor(Guid id)', role: 'Admin', fn: (req, t, [id]) => {
        t('DoctorService.DeactivateDoctor(id)');
        const d = persistence.getDoctors(t).find((x) => x.id === id && x.isActive);
        if (!d) throw nfEx('No existe un médico activo con ese id.');
        d.isActive = false;
        t('doctor.IsActive = false (borrado lógico)');
        return { status: 204, body: '' };
      } },
    ];

    async function handle(req) {
      const trace = [];
      const t = (s) => trace.push(s);
      let url;
      try { url = new URL(req.url, 'https://localhost:7001'); } catch { return { status: 400, body: 'URL inválida', trace }; }
      const path = url.pathname.replace(/\/+$/, '') || '/';
      t(`Kestrel recibe ${req.method} ${path}`);
      if (feat.rateLimit) {
        // Ventana fija de 10 segundos
        if (!state.windowStart || Date.now() - state.windowStart > 10000) { state.windowStart = Date.now(); state.hits = 0; }
        state.hits++;
        t(`RateLimiter: pedido ${state.hits} de 5 en la ventana de 10 segundos`);
        if (state.hits > 5) return { status: 429, body: { title: 'Too Many Requests', status: 429 }, headers: { 'Retry-After': '10' }, trace };
      }
      const exec = async () => {
        const cand = routes.filter((r) => !r.off && r.re.test(path));
        if (!cand.length) { t('Routing: ningún endpoint coincide con la ruta'); return { status: 404, body: '' }; }
        const route = cand.find((r) => r.m === req.method);
        if (!route) { t(`Routing: la ruta existe pero no acepta ${req.method}`); return { status: 405, body: '', headers: { Allow: cand.map((r) => r.m).join(', ') } }; }
        t(`Routing: ${route.ctrl}.${route.act}`);
        if (feat.auth) {
          const auth = req.headers.authorization || '';
          let user = null;
          if (auth.startsWith('Bearer ')) {
            const v = await verifyJwt(auth.slice(7).trim(), SECRET, { issuer: ISS, audience: 'dsw-api' });
            t(`Authentication (JwtBearer): ${v.ok ? `token válido, usuario ${v.payload.sub} con rol ${v.payload.role}` : `token rechazado (${v.checks.filter((c) => !c[1]).map((c) => c[0]).join('; ')})`}`);
            if (v.ok) user = v.payload;
          } else t('Authentication: el pedido no trae encabezado Authorization');
          const needs = !route.anon && req.method !== 'GET';
          if (needs) {
            if (!user) { t('Authorization: el endpoint tiene [Authorize] y no hay usuario autenticado'); return { status: 401, body: '', headers: { 'WWW-Authenticate': 'Bearer' } }; }
            if (route.role && user.role !== route.role) { t(`Authorization: se requiere rol ${route.role} y el usuario tiene ${user.role}`); return { status: 403, body: '' }; }
            t(`Authorization: permitido${route.role ? ` (rol ${route.role})` : ''}`);
          }
        }
        if (['POST', 'PUT', 'PATCH'].includes(req.method) && route.ctrl !== 'HealthChecks') {
          if (!/application\/json/i.test(req.headers['content-type'] || '')) { t('[ApiController]: el cuerpo no es JSON'); return { status: 415, body: { title: 'Unsupported Media Type', status: 415 } }; }
          try { req.json = JSON.parse(req.body || ''); } catch (e) {
            t('[ApiController]: el JSON del cuerpo está mal formado, se responde 400 automáticamente');
            return { status: 400, body: { type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1', title: 'One or more validation errors occurred.', status: 400, errors: { $: ['The JSON value could not be converted. ' + e.message] } } };
          }
        }
        const m = path.match(route.re).slice(1);
        return await route.fn(req, t, m);
      };
      try {
        const res = await exec();
        return { ...res, trace };
      } catch (err) {
        t(`Excepción ${err.kind || 'Exception'}: ${err.message}`);
        if (!feat.middleware) {
          t('No hay middleware de excepciones: la excepción llega hasta el servidor');
          return { status: 500, body: `System.${err.kind === 'ValidationException' ? 'ValidationException' : 'Exception'}: ${err.message}\n   at DoctorService...\n   at DoctorsController...\n   at Microsoft.AspNetCore.Mvc...`, type: 'text/plain', trace };
        }
        t('ExceptionHandlingMiddleware captura la excepción y arma la respuesta');
        if (err.kind === 'ValidationException') return { status: 400, body: { title: 'Bad Request', status: 400, detail: err.message }, trace };
        if (err.kind === 'NotFound') return { status: 404, body: { title: 'Not Found', status: 404, detail: err.message }, trace };
        return { status: 500, body: { title: 'Internal Server Error', status: 500, detail: 'Ocurrió un error inesperado.' }, trace };
      }
    }
    return { handle, db, state };
  }

  const PRESETS = (feat) => [
    { label: 'Listar médicos activos', method: 'GET', url: '/api/doctors' },
    { label: 'Listar especialidades', method: 'GET', url: '/api/specialities' },
    { label: 'Crear médico (válido)', method: 'POST', url: '/api/doctors', body: `{\n  "name": "Martín Ruiz",\n  "licenseNumber": "MP-5678",\n  "specialityId": "${SPECS[1].id}"\n}` },
    { label: 'Crear médico sin nombre', method: 'POST', url: '/api/doctors', body: `{\n  "name": "",\n  "licenseNumber": "MP-9999",\n  "specialityId": "${SPECS[0].id}"\n}` },
    { label: 'Crear con especialidad inexistente', method: 'POST', url: '/api/doctors', body: '{\n  "name": "Pedro Sosa",\n  "licenseNumber": "MP-1111",\n  "specialityId": "00000000-0000-0000-0000-000000000000"\n}' },
    { label: 'Crear con JSON roto', method: 'POST', url: '/api/doctors', body: '{ "name": "Ana", ' },
    { label: 'Obtener médico por id', method: 'GET', url: '/api/doctors/5a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c44' },
    { label: 'Obtener médico inexistente', method: 'GET', url: '/api/doctors/11111111-2222-4333-8444-555555555555' },
    { label: 'Dar de baja médico', method: 'DELETE', url: '/api/doctors/5a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c44' },
    { label: 'Método no permitido', method: 'PUT', url: '/api/doctors', body: '{}' },
    ...(feat.health ? [{ label: 'Sondeo de estado', method: 'GET', url: '/health-check' }] : []),
    ...(feat.auth ? [
      { label: 'Login como admin', method: 'POST', url: '/api/auth/login', body: '{\n  "username": "admin",\n  "password": "Admin123!"\n}' },
      { label: 'Login como recepción', method: 'POST', url: '/api/auth/login', body: '{\n  "username": "recepcion",\n  "password": "Recep123!"\n}' },
    ] : []),
  ];

  // Cliente REST tipo Postman/Swagger
  // cfg: { features: { auth, middleware, health, rateLimit, dbToggle }, goals?: [{ text, test(log) }] }
  L.api = (el, cfg, { esc, highlight }) => {
    const feat = { middleware: true, health: true, ...cfg.features };
    const api = makeApi(feat);
    const presets = PRESETS(feat);
    const log = [];
    el.innerHTML = `
      ${cfg.goals ? '<ul class="goals-list api-goals"></ul>' : ''}
      <form class="api-req">
        <div class="api-line">
          <label class="sr-only" for="m-${(cfg.uid = Math.random().toString(36).slice(2, 7))}">Método</label>
          <select id="m-${cfg.uid}" class="api-method">${['GET', 'POST', 'PUT', 'DELETE'].map((m) => `<option>${m}</option>`).join('')}</select>
          <label class="sr-only" for="u-${cfg.uid}">URL</label>
          <div class="api-url"><span>https://localhost:7001</span><input id="u-${cfg.uid}" value="/api/doctors" spellcheck="false" autocomplete="off"></div>
          <button class="btn sm primary" type="submit">Enviar</button>
        </div>
        <div class="api-opts">
          <label>Ejemplos <select class="api-preset"><option value="">Elegí un pedido…</option>${presets.map((p, i) => `<option value="${i}">${p.label}</option>`).join('')}</select></label>
          ${feat.dbToggle ? '<label class="api-check"><input type="checkbox" class="api-db"> Simular caída del almacenamiento</label>' : ''}
        </div>
        ${feat.auth ? `<label class="api-field">Encabezado Authorization<input class="api-auth" placeholder="Bearer eyJhbGciOi…" spellcheck="false" autocomplete="off"></label>` : ''}
        <label class="api-field api-body-l" hidden>Cuerpo (JSON)<textarea class="api-body" rows="6" spellcheck="false"></textarea></label>
      </form>
      <div class="api-res" aria-live="polite"><p class="api-placeholder">Elegí un ejemplo o escribí un pedido y presioná Enviar.</p></div>`;
    const $ = (s) => el.querySelector(s);
    const syncBody = () => { $('.api-body-l').hidden = !['POST', 'PUT'].includes($('.api-method').value); };
    $('.api-method').addEventListener('change', syncBody);
    $('.api-preset').addEventListener('change', (e) => {
      const p = presets[+e.target.value];
      if (!p) return;
      $('.api-method').value = p.method; $('.api-url input').value = p.url; $('.api-body').value = p.body || '';
      syncBody();
    });
    $('.api-db')?.addEventListener('change', (e) => (api.state.dbDown = e.target.checked));
    const drawGoals = () => {
      if (!cfg.goals) return;
      $('.api-goals').innerHTML = cfg.goals.map((g) => `<li class="${log.some((x) => { try { return g.test(x, log); } catch { return false; } }) ? 'met' : ''}">${g.text}</li>`).join('');
    };
    $('.api-req').addEventListener('submit', async (e) => {
      e.preventDefault();
      const method = $('.api-method').value;
      const req = { method, url: $('.api-url input').value.trim(), body: $('.api-body').value, headers: { 'content-type': 'application/json' } };
      const auth = $('.api-auth')?.value.trim();
      if (auth) req.headers.authorization = auth.startsWith('Bearer ') || auth.startsWith('bearer ') ? 'Bearer ' + auth.slice(7) : auth;
      const t0 = performance.now();
      const res = await api.handle(req);
      const ms = Math.round(performance.now() - t0 + 3 + Math.random() * 9);
      log.push({ req, res });
      const isJson = res.body && typeof res.body === 'object';
      const bodyTxt = isJson ? JSON.stringify(res.body, null, 2) : res.body || '';
      const headers = { 'content-type': res.status === 204 || !bodyTxt ? null : isJson ? (res.status >= 400 ? 'application/problem+json; charset=utf-8' : 'application/json; charset=utf-8') : 'text/plain; charset=utf-8', ...(res.headers || {}) };
      $('.api-res').innerHTML = `
        <div class="api-status"><span class="chip ${cls(res.status)}">${res.status} ${REASON[res.status] || ''}</span><span class="api-time">${ms} ms</span></div>
        ${res.note ? `<p class="api-note">${res.note}</p>` : ''}
        <div class="api-cols">
          <div><p class="mem-h">Cuerpo de la respuesta</p><pre class="lab-out">${bodyTxt ? highlight(bodyTxt, isJson ? 'json' : 'text') : '<span class="muted-s">(sin cuerpo)</span>'}</pre>
            <p class="mem-h">Encabezados</p><pre class="lab-out">${Object.entries(headers).filter(([, v]) => v).map(([k, v]) => `${k}: ${esc(v)}`).join('\n') || '(ninguno relevante)'}</pre></div>
          <div><p class="mem-h">Recorrido dentro del servidor</p><ol class="api-trace">${res.trace.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
        </div>`;
      // Si el login devolvió un token, ofrecer pegarlo
      if (res.body?.token && $('.api-auth')) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'btn sm'; b.textContent = 'Usar este token en Authorization';
        b.addEventListener('click', () => { $('.api-auth').value = 'Bearer ' + res.body.token; b.textContent = 'Token cargado'; });
        $('.api-status').appendChild(b);
      }
      drawGoals();
    });
    syncBody();
    drawGoals();
  };

  // ---------- Pipeline de middleware ----------
  const MW = {
    exception: { name: 'UseExceptionHandler()', desc: 'Captura excepciones de lo que viene después' },
    https: { name: 'UseHttpsRedirection()', desc: 'Redirige http a https' },
    logger: { name: 'app.Use(…) registro propio', desc: 'Escribe antes y después de next()' },
    routing: { name: 'UseRouting()', desc: 'Elige el endpoint según la ruta' },
    cors: { name: 'UseCors()', desc: 'Agrega encabezados CORS y responde preflight' },
    authn: { name: 'UseAuthentication()', desc: 'Lee el token y arma el usuario' },
    authz: { name: 'UseAuthorization()', desc: 'Aplica [Authorize] del endpoint' },
    run: { name: 'app.Run(…) terminal', desc: 'Responde siempre y corta la cadena' },
  };
  const REQS = [
    { id: 'ok', label: 'GET https://…/api/doctors/1 con token válido', scheme: 'https', token: true },
    { id: 'notoken', label: 'GET https://…/api/doctors/1 sin token', scheme: 'https', token: false },
    { id: 'http', label: 'GET http://…/api/doctors/1 (sin https)', scheme: 'http', token: true },
    { id: 'boom', label: 'GET https://…/api/doctors/explota (el controlador lanza una excepción)', scheme: 'https', token: true, boom: true },
    { id: 'preflight', label: 'OPTIONS preflight desde http://localhost:5173', scheme: 'https', preflight: true },
  ];

  L.pipeline = (el, cfg, { esc }) => {
    let order = (cfg.order || ['exception', 'https', 'logger', 'routing', 'cors', 'authn', 'authz']).map((id) => ({ id, on: true }));
    const optional = Object.keys(MW).filter((k) => !order.some((o) => o.id === k));
    order.push(...optional.map((id) => ({ id, on: false })));
    el.innerHTML = `
      <div class="pipe">
        <div><p class="mem-h">Program.cs (en orden)</p><ol class="pipe-list"></ol></div>
        <div>
          <label class="api-field">Pedido de prueba<select class="pipe-req">${REQS.map((r) => `<option value="${r.id}">${r.label}</option>`).join('')}</select></label>
          <p class="mem-h">Qué pasa con el pedido</p>
          <pre class="lab-out pipe-out" aria-live="polite"></pre>
        </div>
      </div>`;
    const list = el.querySelector('.pipe-list');
    const draw = () => {
      list.innerHTML = order.map((m, k) => `<li class="${m.on ? '' : 'off'}">
        <label class="pipe-on"><input type="checkbox" ${m.on ? 'checked' : ''} data-on="${k}"><code>${MW[m.id].name}</code></label>
        <span class="pipe-desc">${MW[m.id].desc}</span>
        <span class="ord-btns"><button type="button" class="icon-btn sm" data-up="${k}" aria-label="Subir" ${k === 0 ? 'disabled' : ''}>↑</button><button type="button" class="icon-btn sm" data-down="${k}" aria-label="Bajar" ${k === order.length - 1 ? 'disabled' : ''}>↓</button></span>
      </li>`).join('') + '<li class="pipe-end"><code>app.MapControllers()</code><span class="pipe-desc">El endpoint: DoctorsController.Get(id) con [Authorize]</span></li>';
      simulate();
    };
    const simulate = () => {
      const req = REQS.find((r) => r.id === el.querySelector('.pipe-req').value);
      const active = order.filter((m) => m.on).map((m) => m.id);
      const out = [];
      const ctx = { endpoint: null, user: null, status: null };
      let depth = 0;
      const pad = () => '  '.repeat(depth);
      const call = (i) => {
        if (i >= active.length) {
          if (!ctx.endpoint) { out.push(`${pad()}Endpoint: como nadie ejecutó UseRouting antes, no hay endpoint elegido.`); ctx.status = 404; return; }
          if (req.preflight) { out.push(`${pad()}Endpoint: el controlador no maneja OPTIONS → 405`); ctx.status = 405; return; }
          if (!ctx.authzRan) out.push(`${pad()}⚠ El endpoint tiene [Authorize] pero UseAuthorization no se ejecutó después de UseRouting: queda SIN proteger.`);
          if (req.boom) { out.push(`${pad()}DoctorsController lanza InvalidOperationException`); throw new Error('boom'); }
          out.push(`${pad()}DoctorsController.Get(1) → 200 OK con el médico`);
          ctx.status = 200;
          return;
        }
        const id = active[i];
        const n = MW[id].name;
        const next = () => { depth++; call(i + 1); depth--; };
        switch (id) {
          case 'exception':
            out.push(`${pad()}→ ${n}`);
            try { next(); } catch { out.push(`${pad()}  ${n} atrapó la excepción → 500 con ProblemDetails`); ctx.status = 500; }
            out.push(`${pad()}← ${n}`);
            break;
          case 'https':
            if (req.scheme === 'http') { out.push(`${pad()}→ ${n}: el pedido es http → 307 Temporary Redirect a https. Corta la cadena.`); ctx.status = 307; return; }
            out.push(`${pad()}→ ${n}: ya es https, sigue`); next(); out.push(`${pad()}← ${n}`);
            break;
          case 'logger':
            out.push(`${pad()}→ registro: "Inicio ${req.preflight ? 'OPTIONS' : 'GET'} /api/doctors/1"`); next(); out.push(`${pad()}← registro: "Fin, estado ${ctx.status ?? '(excepción)'}"`);
            break;
          case 'routing':
            ctx.endpoint = 'DoctorsController.Get'; out.push(`${pad()}→ ${n}: endpoint elegido DoctorsController.Get (metadatos: [Authorize])`); next(); out.push(`${pad()}← ${n}`);
            break;
          case 'cors':
            if (req.preflight) { out.push(`${pad()}→ ${n}: es un preflight permitido → 204 con Access-Control-Allow-Origin. Corta la cadena.`); ctx.status = 204; return; }
            out.push(`${pad()}→ ${n}: agrega Access-Control-Allow-Origin a la respuesta`); next(); out.push(`${pad()}← ${n}`);
            break;
          case 'authn':
            ctx.user = req.token ? 'ana (rol Admin)' : null;
            out.push(`${pad()}→ ${n}: ${ctx.user ? `token válido, usuario ${ctx.user}` : 'sin token, usuario anónimo'}`); next(); out.push(`${pad()}← ${n}`);
            break;
          case 'authz':
            if (!ctx.endpoint) { out.push(`${pad()}→ ${n}: todavía no hay endpoint (UseRouting va después), no sabe que hay [Authorize] y deja pasar`); next(); out.push(`${pad()}← ${n}`); break; }
            ctx.authzRan = true;
            if (req.preflight) { out.push(`${pad()}→ ${n}: el preflight no trae token`); }
            if (!ctx.user) { out.push(`${pad()}→ ${n}: [Authorize] y usuario anónimo → 401 Unauthorized. Corta la cadena.${active.indexOf('authn') > i || !active.includes('authn') ? ' (UseAuthentication no se ejecutó antes: aunque el token sea válido, nadie lo leyó)' : ''}`); ctx.status = 401; return; }
            out.push(`${pad()}→ ${n}: usuario autenticado, permitido`); next(); out.push(`${pad()}← ${n}`);
            break;
          case 'run':
            out.push(`${pad()}→ ${n}: responde "Hola" con 200 y NO llama a next(). Lo que sigue nunca se ejecuta.`); ctx.status = 200;
            break;
        }
      };
      try { call(0); } catch { out.push('La excepción llegó al servidor sin que nadie la atrape → 500 y la conexión se corta sin cuerpo útil.'); ctx.status = 500; }
      el.querySelector('.pipe-out').innerHTML = `${esc(out.join('\n'))}\n\n<span class="chip ${cls(ctx.status)}">Respuesta final: ${ctx.status} ${REASON[ctx.status] || (ctx.status === 307 ? 'Temporary Redirect' : '')}</span>`;
    };
    list.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const k = +(b.dataset.up ?? b.dataset.down);
      const j = b.dataset.up !== undefined ? k - 1 : k + 1;
      [order[k], order[j]] = [order[j], order[k]];
      draw();
      list.querySelector(`[data-${b.dataset.up !== undefined ? 'up' : 'down'}="${j}"]`)?.focus();
    });
    list.addEventListener('change', (e) => { if (e.target.dataset.on !== undefined) { order[+e.target.dataset.on].on = e.target.checked; draw(); } });
    el.querySelector('.pipe-req').addEventListener('change', simulate);
    draw();
  };

  // ---------- CORS ----------
  L.cors = (el, cfg, { esc, highlight }) => {
    el.innerHTML = `
      <div class="cors">
        <fieldset class="cors-box"><legend>Política del servidor (Program.cs)</legend>
          <label class="api-check"><input type="checkbox" data-k="anyOrigin"> AllowAnyOrigin()</label>
          <label class="api-field">WithOrigins(…)<input data-k="origins" value="http://localhost:5173" spellcheck="false"></label>
          <label class="api-check"><input type="checkbox" data-k="anyMethod" checked> AllowAnyMethod()</label>
          <label class="api-check"><input type="checkbox" data-k="anyHeader" checked> AllowAnyHeader()</label>
          <label class="api-check"><input type="checkbox" data-k="creds"> AllowCredentials()</label>
        </fieldset>
        <fieldset class="cors-box"><legend>Pedido del navegador</legend>
          <label class="api-field">Página que hace el fetch (origen)<select data-k="from"><option>http://localhost:5173</option><option>https://dsw-frontend.vercel.app</option><option>https://sitio-malicioso.com</option><option>https://localhost:7001</option></select></label>
          <label class="api-field">Método<select data-k="method"><option>GET</option><option>POST</option><option>DELETE</option></select></label>
          <label class="api-check"><input type="checkbox" data-k="json" checked> Envía Content-Type: application/json</label>
          <label class="api-check"><input type="checkbox" data-k="sendCreds"> credentials: 'include' (cookies)</label>
        </fieldset>
      </div>
      <pre class="code cors-code" data-lang="cs" data-ready="1"><code></code></pre>
      <div class="cors-res" aria-live="polite"></div>`;
    const v = () => {
      const o = {};
      el.querySelectorAll('[data-k]').forEach((i) => (o[i.dataset.k] = i.type === 'checkbox' ? i.checked : i.value));
      return o;
    };
    const run = () => {
      const c = v();
      const api = 'https://localhost:7001';
      const sameOrigin = c.from === api;
      const origins = c.origins.split(',').map((s) => s.trim()).filter(Boolean);
      const lines = [`builder.Services.AddCors(options =>`, `{`, `    options.AddPolicy("Frontend", policy =>`, `        policy${c.anyOrigin ? '.AllowAnyOrigin()' : `.WithOrigins(${origins.map((x) => `"${x}"`).join(', ')})`}${c.anyMethod ? '\n              .AllowAnyMethod()' : '\n              .WithMethods("GET")'}${c.anyHeader ? '\n              .AllowAnyHeader()' : ''}${c.creds ? '\n              .AllowCredentials()' : ''});`, `});`, `// …`, `app.UseRouting();`, `app.UseCors("Frontend");`, `app.UseAuthorization();`];
      el.querySelector('.cors-code code').innerHTML = highlight(lines.join('\n'), 'cs');
      const steps = [];
      let verdict, ok = false;
      if (c.anyOrigin && c.creds) {
        verdict = 'Configuración inválida: AllowAnyOrigin() junto con AllowCredentials() no está permitido por la especificación. ASP.NET Core lo rechaza (la política no se puede construir) y ninguna respuesta lleva los encabezados.';
      } else if (sameOrigin) {
        ok = true;
        verdict = 'Mismo origen (esquema, host y puerto iguales): CORS no interviene. El navegador entrega la respuesta.';
      } else {
        const simple = c.method === 'GET' && !c.json;
        const originOk = c.anyOrigin || origins.some((x) => x.replace(/\/$/, '') === c.from) ;
        const slash = origins.some((x) => x.endsWith('/'));
        const methodOk = c.anyMethod || c.method === 'GET';
        const headerOk = c.anyHeader || !c.json;
        const credOk = !c.sendCreds || c.creds;
        if (!simple) {
          steps.push(`1. El navegador envía primero un preflight:\n   OPTIONS /api/doctors\n   Origin: ${c.from}\n   Access-Control-Request-Method: ${c.method}${c.json ? '\n   Access-Control-Request-Headers: content-type' : ''}`);
          const preOk = originOk && methodOk && headerOk && !slash;
          steps.push(preOk ? `2. El servidor responde 204 con:\n   Access-Control-Allow-Origin: ${c.anyOrigin ? '*' : c.from}\n   Access-Control-Allow-Methods: ${c.anyMethod ? c.method : 'GET'}${c.json ? '\n   Access-Control-Allow-Headers: content-type' : ''}${c.creds ? '\n   Access-Control-Allow-Credentials: true' : ''}`
            : `2. El servidor responde 204 pero SIN encabezados CORS (${!originOk || slash ? 'el origen no está en la lista' : !methodOk ? `el método ${c.method} no está permitido` : 'el encabezado content-type no está permitido'}).`);
          if (!preOk) {
            verdict = `El navegador bloquea: el preflight falló, así que el ${c.method} real nunca se envía.${slash ? ' Ojo: un origen en WithOrigins no puede terminar en “/”.' : ''}`;
          }
        } else steps.push('1. Es un pedido “simple” (GET sin encabezados especiales): no hay preflight.');
        if (!verdict) {
          steps.push(`${steps.length + 1}. El navegador envía el ${c.method} real con Origin: ${c.from}. El servidor LO EJECUTA y responde.`);
          if (!originOk || slash) verdict = 'El navegador bloquea la lectura: la respuesta llegó sin Access-Control-Allow-Origin. Ojo: el servidor sí ejecutó el pedido. CORS no protege al servidor, protege al usuario del navegador.';
          else if (!credOk) verdict = 'El navegador bloquea: pediste enviar cookies (credentials: include) y el servidor no respondió Access-Control-Allow-Credentials: true.';
          else { ok = true; verdict = 'Permitido: la respuesta trae Access-Control-Allow-Origin y el JavaScript de la página puede leerla.'; }
        }
      }
      el.querySelector('.cors-res').innerHTML = `${steps.length ? `<pre class="lab-out">${esc(steps.join('\n\n'))}</pre>` : ''}<p class="cors-verdict ${ok ? 'ok' : 'bad'}">${verdict}</p>`;
    };
    el.addEventListener('input', run);
    el.addEventListener('change', run);
    run();
  };

  // ---------- JWT: generar, decodificar, alterar y validar ----------
  L.jwt = (el, cfg, { esc, highlight }) => {
    const now = Math.floor(Date.now() / 1000);
    el.innerHTML = `
      <div class="jwt">
        <div>
          <label class="api-field">Payload (claims)<textarea class="jwt-payload" rows="9" spellcheck="false">${esc(JSON.stringify({ sub: 'ana', name: 'Ana Pérez', role: 'Admin', iss: ISS, aud: 'dsw-api', iat: now, exp: now + 1800 }, null, 2))}</textarea></label>
          <label class="api-field">Clave secreta del servidor<input class="jwt-secret" value="${SECRET}" spellcheck="false"></label>
          <div class="lab-row"><button class="btn sm primary" type="button" data-act="sign">Firmar token</button><button class="btn sm" type="button" data-act="exp">Hacer que expire</button></div>
        </div>
        <div>
          <label class="api-field">Token (podés editarlo)<textarea class="jwt-token" rows="6" spellcheck="false"></textarea></label>
          <div class="jwt-parts"></div>
          <p class="mem-h">Validación que hace la API con su clave</p>
          <ul class="goals-list jwt-checks"></ul>
        </div>
      </div>`;
    const $ = (s) => el.querySelector(s);
    const decode = async () => {
      const tok = $('.jwt-token').value.trim();
      const p = tok.split('.');
      $('.jwt-parts').innerHTML = p.length === 3 ? `<p class="jwt-colored"><span class="jh">${esc(p[0])}</span>.<span class="jp">${esc(p[1])}</span>.<span class="js">${esc(p[2])}</span></p>` + (() => {
        try { return `<div class="api-cols"><div><p class="mem-h">Header</p><pre class="lab-out">${highlight(JSON.stringify(JSON.parse(fromB64url(p[0])), null, 2), 'json')}</pre></div><div><p class="mem-h">Payload: cualquiera puede leerlo</p><pre class="lab-out">${highlight(JSON.stringify(JSON.parse(fromB64url(p[1])), null, 2), 'json')}</pre></div></div>`; } catch { return '<p class="chip err">No se puede decodificar</p>'; }
      })() : '';
      const v = await verifyJwt(tok, SECRET, { issuer: ISS, audience: 'dsw-api' });
      $('.jwt-checks').innerHTML = v.checks.map(([t, ok]) => `<li class="${ok ? 'met' : 'fail'}">${t}</li>`).join('') + `<li class="${v.ok ? 'met' : 'fail'}"><strong>${v.ok ? 'Resultado: la API acepta el token' : 'Resultado: 401 Unauthorized'}</strong></li>`;
    };
    const sign = async () => {
      let payload;
      try { payload = JSON.parse($('.jwt-payload').value); } catch { $('.jwt-checks').innerHTML = '<li class="fail">El payload no es JSON válido.</li>'; return; }
      $('.jwt-token').value = await signJwt(payload, $('.jwt-secret').value);
      decode();
    };
    $('[data-act="sign"]').addEventListener('click', sign);
    $('[data-act="exp"]').addEventListener('click', () => {
      try { const p = JSON.parse($('.jwt-payload').value); p.exp = Math.floor(Date.now() / 1000) - 60; $('.jwt-payload').value = JSON.stringify(p, null, 2); sign(); } catch {}
    });
    $('.jwt-token').addEventListener('input', decode);
    sign();
  };
})();
