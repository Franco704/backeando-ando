// Todo el temario listo para las vistas, más las consultas que usan.
import { UNIDADES, MODULOS as TODOS_LOS_MODULOS } from './catalogo.js';
import { LESSONS } from './lecciones.js';

export { UNIDADES };
export const LECCIONES = LESSONS;
// Solo los módulos que ya tienen lecciones cargadas
export const MODULOS = TODOS_LOS_MODULOS.filter((m) => LECCIONES.some((l) => l.module === m.id));

// Todas las preguntas con id estable (lección:índice): el progreso guardado depende de estos ids.
export const PREGUNTAS = LECCIONES.flatMap((l) => (l.quiz || []).map((q, i) => ({ ...q, id: `${l.id}:${i}`, lesson: l, module: l.module })));
export const preguntaPorId = Object.fromEntries(PREGUNTAS.map((q) => [q.id, q]));
export const EJERCICIOS = LECCIONES.flatMap((l) => (l.exercises || []).map((ex) => ({ ex, l })));

export const unidad = (id) => UNIDADES.find((u) => u.id === id);
export const modulo = (id) => MODULOS.find((m) => m.id === id);
export const leccionesDe = (modId) => LECCIONES.filter((l) => l.module === modId);
