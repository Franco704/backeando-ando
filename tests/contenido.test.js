// Autocomprobación del contenido y de los motores de los laboratorios. Uso: node tests/contenido.test.js
import assert from 'node:assert';
import { LECCIONES, MODULOS, PREGUNTAS } from '../src/temario/indice.js';
import { MODULOS as TODOS } from '../src/temario/catalogo.js';
import { LABORATORIOS } from '../src/laboratorios/indice.js';
import { GitSim } from '../src/laboratorios/git.js';
import { makeApi } from '../src/laboratorios/http.js';
import { resaltar } from '../src/ui/codigo.js';

const ids = new Set();
for (const l of LECCIONES) {
  assert(!ids.has(l.id), `id repetido ${l.id}`); ids.add(l.id);
  assert(TODOS.some((m) => m.id === l.module), `módulo inexistente en ${l.id}`);
  assert(l.title && l.tldr && l.body, `lección incompleta ${l.id}`);
  for (const c of l.labs || []) assert(LABORATORIOS[c.type], `laboratorio ${c.type} sin registrar en ${l.id}`);
  [...l.body.matchAll(/data-lab="(\d+)"/g)].forEach((m) => assert(l.labs?.[+m[1]], `lab(${m[1]}) sin definir en ${l.id}`));
  for (const q of l.quiz || []) {
    assert(q.a >= 0 && q.a < q.o.length && q.e, `respuesta fuera de rango o sin explicación en ${l.id}: ${q.q}`);
    assert(new Set(q.o).size === q.o.length, `opciones repetidas en ${l.id}: ${q.q}`);
  }
  for (const e of l.exercises || []) assert(e.title && e.prompt && e.solution && (e.solution.explain || e.solution.files?.length), `ejercicio incompleto en ${l.id}`);
  assert(!/NaN|undefined|\[object Object\]/.test(l.body + JSON.stringify(l.exercises || []) + JSON.stringify(l.quiz || [])), `NaN/undefined en ${l.id}`);
}
assert.strictEqual(MODULOS.length, TODOS.length, 'hay módulos sin lecciones');

// Motores: la terminal Git, la API simulada del EJ15 y el resaltado
const sim = new GitSim();
sim.run('git init');
assert(sim.repo, 'git init no crea el repositorio');
sim.run('echo hola > a.txt'); sim.run('git add a.txt');
assert(/a\.txt/.test(sim.run('git status')), 'git status no muestra el archivo preparado');
const api = makeApi({ middleware: true, health: true });
assert.strictEqual((await api.handle({ method: 'GET', url: '/api/doctors', headers: {} })).status, 200);
assert.strictEqual((await api.handle({ method: 'POST', url: '/api/doctors', body: '{"name":""}', headers: { 'content-type': 'application/json' } })).status, 400);
assert.match(resaltar('public class A { }', 'cs'), /tok-k/);

const n = (k) => LECCIONES.reduce((a, l) => a + (l[k]?.length || 0), 0);
console.log(`contenido OK: ${LECCIONES.length} lecciones, ${n('labs')} laboratorios, ${PREGUNTAS.length} preguntas, ${n('exercises')} ejercicios; terminal Git, API simulada y resaltado OK`);
