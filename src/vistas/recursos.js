// Todos los laboratorios en un solo lugar, agrupados por unidad.
import { $, irA } from '../nucleo/dom.js';
import { UNIDADES, LECCIONES, modulo } from '../temario/indice.js';
import { montarLaboratorio } from '../laboratorios/indice.js';

export function vistaLaboratorios(main) {
  document.title = 'Laboratorios, Backeando Ando';
  const todos = LECCIONES.flatMap((l) => (l.labs || []).map((c) => ({ c, l, m: modulo(l.module) })));
  main.innerHTML = `
    <article class="lesson labs-page">
      <h1>Laboratorios</h1>
      <p class="tldr">Los ${todos.length} laboratorios de la guía en un solo lugar: la terminal Git, el cliente REST contra la API del EJ15, el pipeline de middleware, JWT, LINQ, async, EF Core y las pruebas. En cada uno, <mark>predecí</mark> qué va a pasar antes de ejecutar.</p>
      <nav class="filtro" aria-label="Ir a una unidad">${UNIDADES.map((u) => `<a class="btn sm" href="#lab-${u.id}" data-salto data-u="${u.id}">${u.title}</a>`).join('')}</nav>
      ${UNIDADES.map((u) => `<section class="labs-parcial" data-u="${u.id}" id="lab-${u.id}"><h2>${u.title}<span>${u.name}</span></h2>
        ${todos.filter((x) => x.m.unit === u.id).map((x) => `<div class="labs-item"><p class="labs-de">${x.m.title}, <a href="#/${x.l.id}">${x.l.title}</a></p><div class="lab-mount" data-g="${todos.indexOf(x)}"></div></div>`).join('')}
      </section>`).join('')}
    </article>`;
  main.querySelectorAll('[data-g]').forEach((el) => montarLaboratorio(el, todos[+el.dataset.g].c));
  main.querySelectorAll('[data-salto]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); irA($(a.getAttribute('href'), main)); }));
}
