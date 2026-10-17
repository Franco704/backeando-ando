/* Base del contenido: unidades, módulos, array de lecciones y ayudantes para escribir lecciones.
   Cada lección: { id, module, title, keywords, tldr, goals?, body, labs?, exercises?, quiz?, sources? }
   - body puede incluir lab(i) para ubicar el laboratorio i dentro de la teoría.
   - labs: [{ type, title, ...config }] (los tipos se registran en js/labs/*.js)
   - exercises: { title, official?, level (1-3), prompt, hints?, solution: { explain, files } }
   - quiz: [{ q, o: [opciones], a: índice correcto, e: explicación }]
   - sources: [{ title, ref?, url?, points: [] }] (ref = cita de libro, url = fuente web) */
(() => {
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const code = (lang, src, name) => `${name ? `<p class="file-name">${name}</p>` : ''}<pre class="code" data-lang="${lang}">${esc(src.trim())}</pre>`;
  const table = (head, rows) => `<div class="table-wrap"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  // kind: '' (nota), 'tip', 'warn', 'exam' (lo que suele tomarse)
  const note = (html, kind = '') => `<div class="note ${kind}">${html.trim().startsWith('<') ? html : `<p>${html}</p>`}</div>`;
  const lab = (i) => `<div class="lab-mount" data-lab="${i}"></div>`;
  const flow = (...steps) => `<ol class="flow">${steps.map((s) => `<li>${s}</li>`).join('')}</ol>`;
  // Definición textual de la bibliografía
  const def = (term, text, source) => `<figure class="def"><figcaption>${term}</figcaption><blockquote><p>${text}</p></blockquote>${source ? `<p class="def-src">${source}</p>` : ''}</figure>`;
  // Diagrama SVG o HTML con epígrafe
  const fig = (inner, caption) => `<figure class="fig">${inner}${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
  // Solución de solo lectura con varios archivos
  const sol = (explain, files) => ({ explain, files: files.map(([name, lang, src]) => ({ name, lang, code: src })) });

  const UNITS = [
    { id: 'u1', title: 'Unidad 1', name: 'Introducción' },
    { id: 'u2', title: 'Unidad 2', name: 'Lenguaje backend: C#' },
    { id: 'u3', title: 'Unidad 3', name: 'Desarrollo backend' },
  ];

  // stop = nombre corto para el recorrido de la portada
  const MODULES = [
    { id: 'poo', unit: 'u1', title: 'Programación orientada a objetos', stop: 'POO', blurb: 'el modelo de objetos de Booch y la depuración' },
    { id: 'git', unit: 'u1', title: 'Control de versiones con Git', stop: 'Git', blurb: 'commits, ramas, conflictos y GitHub' },
    { id: 'cs-base', unit: 'u2', title: 'C#: fundamentos', stop: 'C#', blurb: '.NET, tipos, métodos, decisiones y excepciones' },
    { id: 'cs-oop', unit: 'u2', title: 'C#: clases y tipos', stop: 'Tipos', blurb: 'clases, referencias, herencia, propiedades, interfaces y genéricos' },
    { id: 'cs-adv', unit: 'u2', title: 'C#: colecciones y más', stop: 'LINQ', blurb: 'colecciones, LINQ, delegados, eventos y async' },
    { id: 'arq', unit: 'u3', title: 'Arquitectura de software', stop: 'Capas', blurb: 'principios, patrones, capas y microservicios' },
    { id: 'api', unit: 'u3', title: 'APIs web con ASP.NET Core', stop: 'API', blurb: 'REST, controladores, middleware e inyección de dependencias' },
    { id: 'ef', unit: 'u3', title: 'Persistencia con Entity Framework Core', stop: 'EF Core', blurb: 'ORM, modelo, relaciones, consultas' },
    { id: 'sec', unit: 'u3', title: 'Seguridad', stop: 'JWT', blurb: 'autenticación, autorización, CORS, CSRF, XSS' },
    { id: 'qa', unit: 'u3', title: 'Logs, pruebas y código limpio', stop: 'Tests', blurb: 'ILogger, xUnit, mocks y clean code' },
  ];

  window.GUIDE = { UNITS, MODULES, LESSONS: [], LABS: {}, h: { esc, code, table, note, lab, flow, def, fig, sol } };
})();
