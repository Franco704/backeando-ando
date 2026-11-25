// Portada: un pedido HTTP real contra la API simulada del EJ15 (la misma del cliente REST de la guía), capa por capa;
// después, las tres unidades con sus módulos y su avance, y las otras guías.
import { $, esc } from '../nucleo/dom.js';
import { UNIDADES, MODULOS, LECCIONES, PREGUNTAS, EJERCICIOS, leccionesDe } from '../temario/indice.js';
import { hechas, hechasDe, aciertos, paraRepasar, siguienteLeccion } from '../estudio/progreso.js';
import { OTRAS_GUIAS } from '../estudio/otras-guias.js';
import { makeApi, PRESETS } from '../laboratorios/http.js';
import { resaltar } from '../ui/codigo.js';
import { icono } from '../ui/iconos.js';

const REPO = 'https://github.com/Franco704/backeando-ando';
const RAZON = { 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 404: 'Not Found', 405: 'Method Not Allowed', 500: 'Internal Server Error' };
// Tres pedidos de los ejemplos del cliente REST: uno que sale bien, uno que no valida y uno que no encuentra nada
const PEDIDOS = ['Listar médicos activos', 'Crear médico sin nombre', 'Obtener médico inexistente'];

function pedido(fig) {
  const feat = { middleware: true, health: true };
  const presets = PRESETS(feat).filter((p) => PEDIDOS.includes(p.label));
  const mostrar = async (i) => {
    const p = presets[i];
    const res = await makeApi(feat).handle({ method: p.method, url: p.url, body: p.body || '', headers: { 'content-type': 'application/json' } });
    const cuerpo = res.body && typeof res.body === 'object' ? JSON.stringify(res.body, null, 2) : String(res.body || '');
    const clase = res.status < 300 ? 'ok' : res.status < 500 ? 'warn' : 'err';
    $('.pedido-linea', fig).innerHTML = `<b>${p.method}</b> ${esc(p.url.replace(/[0-9a-f-]{36}$/, (id) => `${id.slice(0, 8)}…`))}`;
    $('.pedido-capas', fig).innerHTML = res.trace.map((t) => `<li>${esc(t)}</li>`).join('');
    $('.pedido-estado', fig).className = `pedido-estado ${clase}`;
    $('.pedido-estado', fig).textContent = `${res.status} ${RAZON[res.status] || ''}`;
    $('.pedido-cuerpo', fig).innerHTML = cuerpo ? `<code>${resaltar(cuerpo, 'json')}</code>` : '<code>(sin cuerpo)</code>';
  };
  fig.querySelector('.toggle').addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    fig.querySelectorAll('[data-i]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    mostrar(+b.dataset.i);
  });
  fig.querySelector('.toggle').innerHTML = presets.map((p, i) => `<button type="button" data-i="${i}" aria-pressed="${!i}">${p.label}</button>`).join('');
  mostrar(0);
}

function filaModulo(m) {
  const total = leccionesDe(m.id).length, h = hechasDe(m.id), a = aciertos(m.id);
  return `<li><a class="mod" href="#/${leccionesDe(m.id)[0].id}">
    <span class="mod-tit">${m.title}</span>
    <span class="mod-blurb">${m.blurb[0].toUpperCase()}${m.blurb.slice(1)}.</span>
    <span class="mod-estado"><span class="mod-medidor" aria-hidden="true"><span style="width:${(h / total) * 100}%"></span></span><small>${h === total ? 'Completo' : h ? `${h} de ${total} lecciones` : `${total} lecciones`}${a != null ? `, ${a} % de aciertos` : ''}</small></span>
  </a></li>`;
}

export function vistaInicio(main) {
  document.title = 'Backeando Ando, guía de backend con C# y ASP.NET Core';
  const sigue = siguienteLeccion();
  const nLabs = LECCIONES.reduce((n, l) => n + (l.labs?.length || 0), 0);
  const nCat = EJERCICIOS.filter(({ ex }) => ex.official).length;
  const repasar = paraRepasar().length;
  const flojo = MODULOS.map((m) => ({ m, s: aciertos(m.id) })).filter((x) => x.s != null && x.s < 70).sort((a, b) => a.s - b.s)[0];

  main.innerHTML = `
    <article class="inicio">
      <section class="hero">
        <div class="hero-texto">
          <p class="hero-materia">Desarrollo de Software 2026, UTN-FRT</p>
          <h1>Del primer objeto al 200 OK</h1>
          <p class="lede">Un pedido HTTP atraviesa capas hasta llegar a los datos y volver. La guía recorre el mismo camino, de POO y Git a ASP.NET Core, Entity Framework, seguridad y pruebas: ${LECCIONES.length} lecciones, ${nLabs} laboratorios, ${PREGUNTAS.length} preguntas y ${EJERCICIOS.length} ejercicios, ${nCat} de ellos de la cátedra, con la solución verificada con .NET.</p>
          <div class="hero-acciones">
            <a class="btn primary" href="#/${sigue.id}">${hechas.size ? 'Seguir con' : 'Empezar con'} “${sigue.title}”</a>
            ${repasar ? `<a class="btn" href="#/repaso">Repasar ${repasar} ${repasar === 1 ? 'pregunta fallada' : 'preguntas falladas'}</a>` : '<a class="btn" href="#/laboratorios">Ver los laboratorios</a>'}
          </div>
          ${flojo ? `<p class="flojo">Tu punto más flojo por ahora es <a href="#/quiz/${flojo.m.id}">${flojo.m.title}</a>, con ${flojo.s} % de aciertos.</p>` : ''}
        </div>
        <figure class="pedido">
          <div class="toggle" role="group" aria-label="Pedido de ejemplo"></div>
          <p class="pedido-linea"></p>
          <ol class="pedido-capas" aria-label="Por dónde pasa el pedido"></ol>
          <p class="pedido-respuesta"><span class="pedido-estado"></span></p>
          <pre class="pedido-cuerpo" aria-live="polite"></pre>
          <figcaption>La API de médicos del EJ15 corriendo en la página, la misma del <a href="#/laboratorios">cliente REST</a>: cada línea es una capa que atraviesa el pedido, del servidor Kestrel al controlador, el servicio y la persistencia, con el middleware de excepciones armando la respuesta cuando algo falla.</figcaption>
        </figure>
      </section>

      ${UNIDADES.map((u) => `
        <section class="parcial" data-u="${u.id}" aria-labelledby="t-${u.id}">
          <header class="parcial-cabeza">
            <h2 id="t-${u.id}">${u.title}<span>${u.name}</span></h2>
          </header>
          <ul class="mods">${MODULOS.filter((m) => m.unit === u.id).map(filaModulo).join('')}</ul>
        </section>`).join('')}

      <section class="practica" aria-labelledby="t-practica">
        <h2 id="t-practica">Para practicar</h2>
        <ul>
          ${[
            ['#/laboratorios', 'lab', 'Laboratorios', `Los ${nLabs} juntos: terminal Git, cliente REST, JWT, LINQ, async y EF Core.`],
            ['#/simulacro', 'simulacro', 'Simulacro', 'Veinte preguntas de los módulos que ya empezaste, corregidas al final.'],
            ['#/repaso', 'repasar', 'Repasar', 'Las preguntas que fallaste, hasta que las aciertes.'],
          ].map(([h, i, t, d]) => `<li><a href="${h}">${icono(i, 22)}<span><b>${t}</b>${d}</span></a></li>`).join('')}
        </ul>
      </section>

      <section class="como" aria-labelledby="t-como">
        <h2 id="t-como">Cómo estudiar con esta guía</h2>
        <ol>
          <li>Leé la teoría de cada lección en orden: cada tema se apoya en el anterior.</li>
          <li>Tocá los laboratorios. Están para romper cosas y ver qué pasa.</li>
          <li>Respondé las preguntas del final. Las que falles van a la sección <a href="#/repaso">Repasar</a>.</li>
          <li>Intentá los ejercicios sin mirar la solución. Los de la cátedra están marcados.</li>
          <li>Al cerrar un módulo, hacé su cuestionario. Antes de un parcial, el <a href="#/simulacro">simulacro</a>.</li>
        </ol>
        <p class="atajos">Atajos de teclado: <kbd>←</kbd> y <kbd>→</kbd> para moverte entre lecciones, <kbd>/</kbd> para buscar.</p>
      </section>

      <section class="otras" aria-labelledby="t-otras">
        <div class="repo">
          <div><h2>El código está abierto</h2><p>Si encontrás un error o querés proponer una pregunta, abrí un issue en el repositorio.</p></div>
          <a class="btn" href="${REPO}" target="_blank" rel="noopener">Ver el repositorio en GitHub</a>
        </div>
        <h2 id="t-otras">Otras guías de la UTN</h2>
        ${OTRAS_GUIAS.map((g) => `<h3>${g.anio}</h3><ul class="guias">${g.guias.map(([n, d, slug]) => `<li><a href="https://franco704.github.io/${slug}/" target="_blank" rel="noopener"><b>${n}</b><span>${d}</span></a><a class="guia-repo" href="https://github.com/Franco704/${slug}" target="_blank" rel="noopener" aria-label="Repositorio de ${n}">Repositorio</a></li>`).join('')}</ul>`).join('')}
      </section>
    </article>`;
  pedido($('.pedido', main));
  return null;
}
