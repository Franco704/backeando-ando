// Registro de laboratorios: cada lección pide uno por su tipo (labs: [{ type, title, ... }]).
import { $, esc } from '../nucleo/dom.js';
import { resaltar as highlight, mejorarCodigo as enhanceCode } from '../ui/codigo.js';
import { L as genericos } from './genericos.js';
import { L as git } from './git.js';
import { L as http } from './http.js';
import { L as dotnet } from './dotnet.js';
import { L as datos } from './datos.js';

export const LABORATORIOS = { ...genericos, ...git, ...http, ...dotnet, ...datos };

export function montarLaboratorio(el, cfg) {
  const fn = LABORATORIOS[cfg.type];
  if (!fn) { el.innerHTML = `<p class="note warn">Laboratorio desconocido: ${esc(cfg.type)}</p>`; return; }
  el.innerHTML = `<section class="lab" aria-label="Laboratorio: ${esc(cfg.title)}">
    <header class="lab-head"><span class="lab-kind">Laboratorio</span><h3 class="lab-title">${cfg.title}</h3></header>
    ${cfg.intro ? `<p class="lab-intro">${cfg.intro}</p>` : ''}
    <div class="lab-body"></div></section>`;
  try { fn($('.lab-body', el), cfg, { esc, highlight, enhanceCode }); }
  catch (err) { $('.lab-body', el).innerHTML = `<p class="note warn">No se pudo iniciar el laboratorio: ${esc(err.message)}</p>`; console.error(err); }
  enhanceCode(el);
}
