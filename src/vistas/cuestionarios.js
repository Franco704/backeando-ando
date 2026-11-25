// Práctica con preguntas: cuestionario de un módulo, simulacro y repaso de lo fallado.
import { $, shuffle } from '../nucleo/dom.js';
import { MODULOS, LECCIONES, PREGUNTAS, preguntaPorId, leccionesDe } from '../temario/indice.js';
import { montarCuestionario } from '../estudio/opcion-multiple.js';
import { mejorarCodigo } from '../ui/codigo.js';
import { hechas, respuestas, mejores, guardarMejor, paraRepasar } from '../estudio/progreso.js';

// Primero las que fallaste, después las que nunca respondiste, al final las que acertaste
const peso = (q) => (respuestas[q.id]?.ok === false ? 0 : respuestas[q.id] ? 2 : 1);

export function vistaCuestionarioModulo(main, m) {
  document.title = `Cuestionario: ${m.title}`;
  const pool = PREGUNTAS.filter((q) => q.module === m.id);
  const qs = shuffle(pool).sort((a, b) => peso(a) - peso(b)).slice(0, 15);
  main.innerHTML = `
    <article class="lesson quiz-page">
      <p class="crumb"><a href="#/${leccionesDe(m.id)[0].id}">${m.title}</a></p>
      <h1>Cuestionario del módulo</h1>
      <p class="tldr">${qs.length} preguntas de las ${pool.length} del módulo. Aparecen primero las que fallaste y las que nunca respondiste.${mejores[m.id] != null ? ` Tu mejor resultado: ${mejores[m.id]} %.` : ''}</p>
      <div class="quiz-mount"></div>
    </article>`;
  montarCuestionario($('.quiz-mount', main), qs, { mode: 'exam', onFinish: (pct) => guardarMejor(m.id, pct) });
  mejorarCodigo(main);
}

export function vistaSimulacro(main) {
  document.title = 'Simulacro, Backeando Ando';
  // Toma los módulos que ya empezaste; si no empezaste ninguno, todo el curso
  const empezados = new Set(LECCIONES.filter((l) => hechas.has(l.id)).map((l) => l.module));
  const pool = empezados.size ? PREGUNTAS.filter((q) => empezados.has(q.module)) : PREGUNTAS;
  // Reparte las preguntas entre módulos para que ninguno domine
  const porMod = MODULOS.map((m) => shuffle(pool.filter((q) => q.module === m.id))).filter((a) => a.length);
  const qs = [];
  for (let i = 0; qs.length < 20 && porMod.some((a) => a[i]); i++) porMod.forEach((a) => a[i] && qs.length < 20 && qs.push(a[i]));
  main.innerHTML = `
    <article class="lesson quiz-page">
      <h1>Simulacro</h1>
      <p class="tldr">${qs.length} preguntas mezcladas ${empezados.size ? `de los ${empezados.size} módulos que ya empezaste` : 'de todo el curso'}. Respondé todas y corregí al final, como en un parcial.</p>
      <div class="quiz-mount"></div>
    </article>`;
  montarCuestionario($('.quiz-mount', main), shuffle(qs), { mode: 'exam' });
  mejorarCodigo(main);
}

export function vistaRepaso(main) {
  document.title = 'Repasar, Backeando Ando';
  const ids = paraRepasar();
  const qs = ids.map((id) => preguntaPorId[id]);
  main.innerHTML = `
    <article class="lesson quiz-page">
      <h1>Repasar</h1>
      ${ids.length ? `<p class="tldr">${ids.length === 1 ? 'Esta es la pregunta que respondiste mal' : `Estas son las ${ids.length} preguntas que respondiste mal`} la última vez. Cuando aciertes una, sale de la lista.</p><div class="quiz-mount"></div>`
        : `<p class="tldr">No tenés preguntas pendientes. Cada vez que falles una, en una lección o en un cuestionario, aparece acá para que la vuelvas a intentar.</p>
           <p class="acciones"><a class="btn primary" href="#/simulacro">Hacer un simulacro</a></p>`}
    </article>`;
  if (qs.length) montarCuestionario($('.quiz-mount', main), qs, { mode: 'review' });
  mejorarCodigo(main);
}
