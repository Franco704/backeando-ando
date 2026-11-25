// Resaltado de sintaxis mínimo (C#, JS, JSON, bash, HTTP, SQL, XML) y botón Copiar en los bloques de código.
import { esc } from '../nucleo/dom.js';

const CS_KW = 'abstract|as|async|await|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|get|goto|if|implicit|in|init|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|partial|private|protected|public|readonly|record|ref|required|return|sealed|set|short|sizeof|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|using|var|virtual|void|when|where|while|yield|nameof|value|with|from|select|orderby|group|by|into|join|on|equals|let|descending|ascending|and|or|not';
const JS_KW = 'const|let|var|function|return|if|else|for|while|of|in|new|class|extends|import|from|export|default|async|await|try|catch|finally|throw|typeof|null|undefined|true|false|this|switch|case|break';
const RULES = {
  cs: new RegExp(`(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|(\\$?@?"(?:[^"\\\\\\n]|\\\\.|"")*"|'(?:[^'\\\\\\n]|\\\\.)')|\\b(${CS_KW})\\b|(\\[[A-Z]\\w*(?:\\([^\\]\\n]*\\))?\\]|\\b[A-Z]\\w*)|\\b(\\d+(?:\\.\\d+)?[mMfFdDL]?)\\b`, 'g'),
  js: new RegExp(`(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|("(?:[^"\\\\\\n]|\\\\.)*"|'(?:[^'\\\\\\n]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\`)|\\b(${JS_KW})\\b|(\\b[A-Z]\\w*)|\\b(\\d+(?:\\.\\d+)?)\\b`, 'g'),
  json: /()("(?:[^"\\\n]|\\.)*"(?=\s*:))|("(?:[^"\\\n]|\\.)*")|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?\b)/g,
  bash: /(#[^\n]*)|("[^"]*"|'[^']*')|(^\$ |\b(?:git|dotnet|cd|mkdir|ls|cat|echo|touch|rm|mv|curl|npm)\b)|(\s--?[\w-]+)/gm,
  http: /(#[^\n]*)|("(?:[^"\\\n]|\\.)*")|(^(?:GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b|HTTP\/[\d.]+)|(^[\w-]+(?=:))|(\b[1-5]\d\d\b)/gm,
  sql: /(--[^\n]*)|('(?:[^'\n]|'')*')|\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|INNER|LEFT|JOIN|ON|AS|AND|OR|NOT|NULL|ORDER|BY|GROUP|TOP|CREATE|TABLE|PRIMARY|KEY|FOREIGN|REFERENCES|OFFSET|ROWS|FETCH|NEXT|ONLY|IN|IS|COUNT|CASCADE)\b|(\[[^\]]+\]|"[^"]+")|\b(\d+)\b/gi,
  xml: /(<!--[\s\S]*?-->)|("[^"]*")|()(<\/?[A-Za-z][\w.:-]*|\/?>)|(\s[\w:.-]+(?==))/g,
};
const CLASS = {
  cs: ['tok-c', 'tok-s', 'tok-k', 'tok-t', 'tok-n'],
  js: ['tok-c', 'tok-s', 'tok-k', 'tok-t', 'tok-n'],
  json: ['tok-c', 'tok-a', 'tok-s', 'tok-k', 'tok-n'],
  bash: ['tok-c', 'tok-s', 'tok-k', 'tok-a'],
  http: ['tok-c', 'tok-s', 'tok-k', 'tok-a', 'tok-n'],
  sql: ['tok-c', 'tok-s', 'tok-k', 'tok-t', 'tok-n'],
  xml: ['tok-c', 'tok-s', 'tok-k', 'tok-t', 'tok-a'],
};
const ALIAS = { csharp: 'cs', 'c#': 'cs', jsx: 'js', html: 'xml', csproj: 'xml', java: 'cs', text: '', console: '' };
export function resaltar(src, lang) {
  const key = ALIAS[lang] ?? lang;
  const re = RULES[key];
  if (!re) return esc(src);
  let out = '', last = 0;
  re.lastIndex = 0;
  for (const m of src.matchAll(re)) {
    if (!m[0]) continue;
    out += esc(src.slice(last, m.index));
    const g = m.slice(1).findIndex((x) => x !== undefined && x !== '');
    out += g < 0 ? esc(m[0]) : `<span class="${CLASS[key][g]}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(src.slice(last));
}

// Bloques de código: resaltado + botón copiar
export function mejorarCodigo(root) {
  root.querySelectorAll('pre.code:not([data-ready])').forEach((pre) => {
    const src = pre.textContent;
    pre.dataset.ready = '1';
    pre.innerHTML = `<code>${resaltar(src, pre.dataset.lang)}</code>`;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = 'Copiar';
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(src); btn.textContent = 'Copiado'; }
      catch { btn.textContent = 'No se pudo copiar'; }
      setTimeout(() => (btn.textContent = 'Copiar'), 1500);
    });
    pre.appendChild(btn);
  });
}

