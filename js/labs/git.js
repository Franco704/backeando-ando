/* Laboratorio Git: un simulador de Git y bash en memoria (motor puro) + interfaz con terminal,
   explorador de archivos y grafo de commits. Reproduce los mensajes reales de Git (en inglés). */
(() => {
  // ---------- .gitignore ----------
  function compileIgnore(text) {
    return text.split('\n').map((raw) => raw.replace(/\r$/, '')).filter((l) => l.trim() && !l.startsWith('#')).map((line) => {
      let p = line.replace(/\s+$/, '');
      let neg = false;
      if (p.startsWith('!')) { neg = true; p = p.slice(1); }
      if (p.startsWith('\\')) p = p.slice(1); // \# y \! escapan el primer carácter
      const dirOnly = p.endsWith('/');
      if (dirOnly) p = p.slice(0, -1);
      const anchored = p.includes('/');
      if (p.startsWith('/')) p = p.slice(1);
      let re = '';
      for (let i = 0; i < p.length; i++) {
        const c = p[i];
        if (c === '*') { if (p[i + 1] === '*') { re += '.*'; i++; if (p[i + 1] === '/') i++; } else re += '[^/]*'; }
        else if (c === '?') re += '[^/]';
        else if (c === '[') { const j = p.indexOf(']', i); if (j > i) { re += p.slice(i, j + 1).replace('[!', '[^'); i = j; } else re += '\\['; }
        else re += c.replace(/[.+^${}()|\\]/g, '\\$&');
      }
      return { neg, dirOnly, anchored, re: new RegExp(`^${re}$`), src: line };
    });
  }
  function isIgnored(path, rules) {
    if (!rules.length) return false;
    const parts = path.split('/');
    const test = (target, isDir) => {
      let ign = false;
      const name = target.split('/').pop();
      for (const r of rules) {
        if (r.dirOnly && !isDir) continue;
        if ((r.anchored ? r.re.test(target) : r.re.test(name))) ign = !r.neg;
      }
      return ign;
    };
    // Si una carpeta está ignorada, nada de adentro se puede volver a incluir
    for (let i = 1; i < parts.length; i++) if (test(parts.slice(0, i).join('/'), true)) return true;
    return test(path, false);
  }

  // ---------- Diff de líneas (LCS) ----------
  function diffLines(a, b) {
    const x = a === null || a === undefined ? [] : a.split('\n');
    const y = b === null || b === undefined ? [] : b.split('\n');
    const n = x.length, m = y.length;
    const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const out = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (x[i] === y[j]) { out.push([' ', x[i]]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) out.push(['-', x[i++]]);
      else out.push(['+', y[j++]]);
    }
    while (i < n) out.push(['-', x[i++]]);
    while (j < m) out.push(['+', y[j++]]);
    return out;
  }

  // ---------- Tokenizador de comandos (respeta comillas y redirecciones) ----------
  function tokenize(line) {
    const out = [];
    let cur = '', q = null, has = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === q) q = null; else if (c === '\\' && q === '"' && line[i + 1] === '"') { cur += '"'; i++; } else cur += c; continue; }
      if (c === '"' || c === "'") { q = c; has = true; continue; }
      if (c === '>' ) { if (has || cur) { out.push(cur); cur = ''; has = false; } if (line[i + 1] === '>') { out.push('>>'); i++; } else out.push('>'); continue; }
      if (/\s/.test(c)) { if (has || cur) { out.push(cur); cur = ''; has = false; } continue; }
      cur += c; has = true;
    }
    if (q) throw new Error('comillas sin cerrar');
    if (has || cur) out.push(cur);
    return out;
  }

  const hex = () => Math.floor(Math.random() * 0xfffffff).toString(16).padStart(7, '0');
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const eqTree = (a, b) => JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());

  // ---------- Motor ----------
  class GitSim {
    constructor(preset = {}) {
      this.fs = {};               // ruta (desde el workspace) -> contenido
      this.dirs = new Set();      // carpetas creadas explícitamente
      this.cwd = '';
      this.repo = null;           // { root, index, commits, order, branches, head, remote, tracking, merge, config }
      this.remotes = {};          // url -> { name, branches: {}, commits: {} }
      this.zips = {};             // nombre de zip -> { ruta: contenido }
      this.globalConfig = {};
      this.requireIdentity = !!preset.requireIdentity;
      this.clock = Date.UTC(2026, 3, 6, 14, 0);
      if (preset.build) preset.build(this);
    }

    // --- utilidades de rutas ---
    resolve(p) {
      const parts = (p.startsWith('/') ? p.slice(1) : (this.cwd ? this.cwd + '/' : '') + p).split('/');
      const out = [];
      for (const s of parts) { if (!s || s === '.') continue; if (s === '..') out.pop(); else if (s === '~') out.length = 0; else out.push(s); }
      return out.join('/');
    }
    isDir(path) { if (path === '') return true; const pre = path + '/'; return this.dirs.has(path) || Object.keys(this.fs).some((f) => f.startsWith(pre)); }
    rel(abs) { const r = this.repo.root; return r ? abs.slice(r.length + 1) : abs; }
    abs(rel) { return this.repo.root ? `${this.repo.root}/${rel}` : rel; }
    inRepo(abs) { const r = this.repo?.root; return this.repo && (r === '' || abs === r || abs.startsWith(r + '/')); }
    repoFiles() { // archivos del working tree (rutas relativas al repo)
      const r = this.repo.root;
      return Object.keys(this.fs).filter((f) => r === '' || f.startsWith(r + '/')).map((f) => this.rel(f));
    }
    work(rel) { return this.fs[this.abs(rel)]; }
    rules() { const gi = this.work('.gitignore'); return gi ? compileIgnore(gi) : []; }
    headId() { const h = this.repo.head; return this.repo.branches[h] ?? null; }
    headTree() { const id = this.headId(); return id ? this.repo.commits[id].tree : {}; }
    ancestors(id) { const seen = new Set(); const st = id ? [id] : []; while (st.length) { const c = st.pop(); if (seen.has(c)) continue; seen.add(c); st.push(...this.repo.commits[c].parents); } return seen; }
    mergeBase(a, b) {
      const A = this.ancestors(a);
      const B = this.ancestors(b);
      const common = [...A].filter((x) => B.has(x));
      return common.sort((x, y) => this.repo.commits[y].time - this.repo.commits[x].time)[0] || null;
    }
    // pathspec del usuario -> lista de rutas relativas al repo que coinciden
    match(spec, pool) {
      const abs = this.resolve(spec);
      if (!this.inRepo(abs) && abs !== this.repo.root) return null;
      const rel = abs === this.repo.root ? '' : this.rel(abs);
      if (rel === '') return [...pool];
      if (/[*?]/.test(rel)) { const re = compileIgnore(rel)[0].re; return pool.filter((p) => re.test(p) || re.test(p.split('/').pop())); }
      return pool.filter((p) => p === rel || p.startsWith(rel + '/'));
    }

    // --- estado (lo que muestra git status) ---
    status() {
      const head = this.headTree(), idx = this.repo.index, rules = this.rules();
      const work = this.repoFiles();
      const staged = [], unstaged = [], untracked = [], ignored = [];
      const unmerged = new Set(this.repo.merge?.conflicts || []);
      const allIdx = new Set([...Object.keys(head), ...Object.keys(idx)]);
      const added = [], deleted = [];
      for (const p of [...allIdx].sort()) {
        if (unmerged.has(p)) continue;
        if (!(p in head) && p in idx) added.push(p);
        else if (p in head && !(p in idx)) deleted.push(p);
        else if (head[p] !== idx[p]) staged.push(['modified', p]);
      }
      // Detección de renombres: borrado + nuevo con el mismo contenido
      for (const d of [...deleted]) {
        const a = added.find((x) => idx[x] === head[d]);
        if (a) { staged.push(['renamed', `${d} -> ${a}`]); deleted.splice(deleted.indexOf(d), 1); added.splice(added.indexOf(a), 1); }
      }
      added.forEach((p) => staged.push(['new file', p]));
      deleted.forEach((p) => staged.push(['deleted', p]));
      staged.sort((a, b) => a[1].localeCompare(b[1]));
      for (const p of Object.keys(idx).sort()) {
        if (unmerged.has(p)) continue;
        const w = this.work(p);
        if (w === undefined) unstaged.push(['deleted', p]);
        else if (w !== idx[p]) unstaged.push(['modified', p]);
      }
      for (const p of work.sort()) {
        if (p in idx || unmerged.has(p)) continue;
        (isIgnored(p, rules) ? ignored : untracked).push(p);
      }
      return { staged, unstaged, untracked, ignored, unmerged: [...unmerged] };
    }

    // --- comandos ---
    run(line) {
      line = line.trim();
      if (!line) return '';
      let t;
      try { t = tokenize(line); } catch (e) { return `bash: ${e.message}`; }
      const redir = t.findIndex((x) => x === '>' || x === '>>');
      if (redir > -1) {
        if (t[0] !== 'echo' && t[0] !== 'printf') return 'bash: en este laboratorio solo se puede redirigir la salida de echo';
        const file = t[redir + 1];
        if (!file) return 'bash: syntax error near unexpected token `newline\'';
        const text = t.slice(1, redir).join(' ').replace(/\\n/g, '\n');
        const p = this.resolve(file);
        if (this.isDir(p) && !(p in this.fs)) return `bash: ${file}: Is a directory`;
        this.fs[p] = t[redir] === '>>' && p in this.fs ? `${this.fs[p]}\n${text}` : text;
        return '';
      }
      const [cmd, ...a] = t;
      if (cmd === 'git') return this.git(a);
      const sh = this.shell[cmd];
      if (!sh) return `bash: ${cmd}: command not found. Escribí help para ver los comandos disponibles.`;
      return sh.call(this, a);
    }

    git(a) {
      const [sub, ...args] = a;
      if (!sub || sub === '--help' || sub === 'help') return 'usage: git <command> [<args>]\nComandos: init, clone, config, status, add, commit, log, diff, restore, rm, mv, branch, checkout, switch, merge, remote, fetch, pull, push';
      if (sub === 'version' || sub === '--version') return 'git version 2.51.0';
      if (sub === 'config') return this.gitConfig(args);
      if (sub === 'init') return this.gitInit();
      if (sub === 'clone') return this.gitClone(args);
      if (!this.repo || !this.inRepo(this.cwd || '')) return 'fatal: not a git repository (or any of the parent directories): .git';
      const fn = {
        status: this.gitStatus, add: this.gitAdd, commit: this.gitCommit, log: this.gitLog, diff: this.gitDiff,
        restore: this.gitRestore, rm: this.gitRm, mv: this.gitMv, branch: this.gitBranch, checkout: this.gitCheckout,
        switch: this.gitSwitch, merge: this.gitMerge, remote: this.gitRemote, fetch: this.gitFetch, pull: this.gitPull,
        push: this.gitPush, reset: this.gitReset, show: this.gitShow,
      }[sub];
      if (!fn) return `git: '${sub}' is not a git command. See 'git --help'.`;
      return fn.call(this, args);
    }

    gitConfig(args) {
      const global = args.includes('--global'), system = args.includes('--system');
      const rest = args.filter((x) => !x.startsWith('--'));
      const target = global || system || !this.repo ? this.globalConfig : this.repo.config;
      if (args.includes('--list') || args.includes('-l')) return Object.entries({ ...this.globalConfig, ...(this.repo?.config || {}) }).map(([k, v]) => `${k}=${v}`).join('\n');
      const [key, ...val] = rest;
      if (!key) return 'usage: git config [<options>]';
      if (!val.length) return target[key] ?? this.globalConfig[key] ?? '';
      if (!global && !system && !this.repo) return 'fatal: not in a git directory';
      target[key] = val.join(' ');
      return global || system ? `(Aviso de la cátedra: en las computadoras del laboratorio no se usa git config --${global ? 'global' : 'system'}. En tu compu personal sí.)` : '';
    }

    gitInit() {
      if (this.repo && this.inRepo(this.cwd)) return `Reinitialized existing Git repository in /home/estudiante/${this.repo.root ? this.repo.root + '/' : ''}.git/`;
      this.repo = { root: this.cwd, index: {}, commits: {}, order: [], branches: {}, head: 'main', tracking: {}, remoteRefs: {}, merge: null, config: {}, url: null };
      this.dirs.add(this.cwd);
      return `Initialized empty Git repository in /home/estudiante/${this.cwd ? this.cwd + '/' : ''}.git/`;
    }

    gitClone(args) {
      const url = args.find((x) => !x.startsWith('-'));
      if (!url) return 'fatal: You must specify a repository to clone.';
      const remote = this.remotes[url.replace(/\.git$/, '')];
      if (!remote) return `Cloning into '${url.split('/').pop().replace(/\.git$/, '')}'...\nfatal: repository '${url}' not found`;
      const name = args.filter((x) => !x.startsWith('-'))[1] || url.split('/').pop().replace(/\.git$/, '');
      const root = this.resolve(name);
      if (this.isDir(root) && Object.keys(this.fs).some((f) => f.startsWith(root + '/'))) return `fatal: destination path '${name}' already exists and is not an empty directory.`;
      const def = remote.branches.main ? 'main' : Object.keys(remote.branches)[0];
      this.repo = { root, index: {}, commits: clone(remote.commits), order: Object.keys(remote.commits).sort((x, y) => remote.commits[x].time - remote.commits[y].time), branches: { [def]: remote.branches[def] }, head: def, tracking: { [def]: def }, remoteRefs: { ...remote.branches }, merge: null, config: {}, url: url.replace(/\.git$/, '') };
      this.dirs.add(root);
      const tree = this.repo.commits[remote.branches[def]].tree;
      this.repo.index = { ...tree };
      for (const [p, c] of Object.entries(tree)) this.fs[this.abs(p)] = c;
      const n = Object.keys(remote.commits).length;
      return `Cloning into '${name}'...\nremote: Enumerating objects: ${n * 3}, done.\nremote: Total ${n * 3} (delta 0), reused 0 (delta 0)\nReceiving objects: 100% (${n * 3}/${n * 3}), done.`;
    }

    gitStatus(args) {
      const s = this.status();
      const short = args.includes('-s') || args.includes('--short');
      if (short) {
        const lines = [];
        s.staged.forEach(([k, p]) => lines.push(`${{ 'new file': 'A', modified: 'M', deleted: 'D', renamed: 'R' }[k]}  ${p}`));
        s.unstaged.forEach(([k, p]) => lines.push(` ${k === 'deleted' ? 'D' : 'M'} ${p}`));
        s.unmerged.forEach((p) => lines.push(`UU ${p}`));
        s.untracked.forEach((p) => lines.push(`?? ${p}`));
        return lines.join('\n');
      }
      const out = [`On branch ${this.repo.head}`];
      const tr = this.repo.tracking[this.repo.head];
      if (tr && this.repo.remoteRefs[tr] !== undefined) {
        const local = this.headId(), remote = this.repo.remoteRefs[tr];
        const ahead = [...this.ancestors(local)].filter((x) => !this.ancestors(remote).has(x)).length;
        const behind = [...this.ancestors(remote)].filter((x) => !this.ancestors(local).has(x)).length;
        out.push(ahead && behind ? `Your branch and 'origin/${tr}' have diverged.` : ahead ? `Your branch is ahead of 'origin/${tr}' by ${ahead} commit${ahead > 1 ? 's' : ''}.\n  (use "git push" to publish your local commits)` : behind ? `Your branch is behind 'origin/${tr}' by ${behind} commit${behind > 1 ? 's' : ''}, and can be fast-forwarded.\n  (use "git pull" to update your local branch)` : `Your branch is up to date with 'origin/${tr}'.`);
      }
      if (!this.headId()) out.push('', 'No commits yet');
      if (this.repo.merge) out.push('', 'You have unmerged paths.', '  (fix conflicts and run "git commit")', '  (use "git merge --abort" to abort the merge)');
      if (s.staged.length) out.push('', 'Changes to be committed:', '  (use "git restore --staged <file>..." to unstage)', ...s.staged.map(([k, p]) => `\t${(k + ':').padEnd(12)}${p}`));
      if (s.unmerged.length) out.push('', 'Unmerged paths:', '  (use "git add <file>..." to mark resolution)', ...s.unmerged.map((p) => `\tboth modified:   ${p}`));
      if (s.unstaged.length) out.push('', 'Changes not staged for commit:', '  (use "git add <file>..." to update what will be committed)', '  (use "git restore <file>..." to discard changes in working directory)', ...s.unstaged.map(([k, p]) => `\t${(k + ':').padEnd(12)}${p}`));
      if (s.untracked.length) {
        // Igual que git: las carpetas sin seguimiento se muestran colapsadas
        const shown = [...new Set(s.untracked.map((p) => { const d = p.split('/'); const idxDirs = Object.keys(this.repo.index); return d.length > 1 && !idxDirs.some((x) => x.startsWith(d[0] + '/')) ? d[0] + '/' : p; }))];
        out.push('', 'Untracked files:', '  (use "git add <file>..." to include in what will be committed)', ...shown.map((p) => `\t${p}`));
      }
      if (!s.staged.length && !s.unstaged.length && !s.untracked.length && !s.unmerged.length) out.push(this.headId() ? 'nothing to commit, working tree clean' : '\nnothing to commit (create/copy files and use "git add" to track)');
      else if (!s.staged.length && !s.unmerged.length) out.push('', s.unstaged.length ? 'no changes added to commit (use "git add" and/or "git commit -a")' : 'nothing added to commit but untracked files present (use "git add" to track)');
      return out.join('\n');
    }

    gitAdd(args) {
      const force = args.includes('-f');
      const all = args.includes('-A') || args.includes('--all');
      const specs = args.filter((x) => !x.startsWith('-'));
      if (!specs.length && !all) return 'Nothing specified, nothing added.\nhint: Maybe you wanted to say \'git add .\'?';
      const rules = this.rules();
      const work = this.repoFiles();
      const pool = [...new Set([...work, ...Object.keys(this.repo.index), ...(this.repo.merge?.conflicts || [])])];
      const targets = new Set();
      for (const spec of all && !specs.length ? ['.'] : specs) {
        const m = this.match(spec, pool);
        if (m === null) return `fatal: ${spec}: '${spec}' is outside repository`;
        if (!m.length) return `fatal: pathspec '${spec}' did not match any files`;
        const explicitIgnored = m.filter((p) => !(p in this.repo.index) && isIgnored(p, rules));
        const isFileSpec = m.length === 1 && this.rel(this.resolve(spec)) === m[0];
        if (isFileSpec && explicitIgnored.length && !force) return `The following paths are ignored by one of your .gitignore files:\n${m[0]}\nhint: Use -f if you really want to add them.`;
        m.forEach((p) => { if (force || p in this.repo.index || !isIgnored(p, rules)) targets.add(p); });
      }
      for (const p of targets) {
        const w = this.work(p);
        if (w === undefined) delete this.repo.index[p];
        else this.repo.index[p] = w;
        if (this.repo.merge) this.repo.merge.conflicts = this.repo.merge.conflicts.filter((x) => x !== p);
      }
      return '';
    }

    identity() {
      const c = { ...this.globalConfig, ...this.repo.config };
      return c['user.name'] && c['user.email'] ? `${c['user.name']} <${c['user.email']}>` : null;
    }

    gitCommit(args) {
      let msg = null;
      for (let i = 0; i < args.length; i++) if (args[i] === '-m' || args[i] === '-am') msg = args[i + 1];
      if (args.includes('-a') || args.includes('-am')) {
        for (const p of Object.keys(this.repo.index)) { const w = this.work(p); if (w === undefined) delete this.repo.index[p]; else this.repo.index[p] = w; }
      }
      if (this.repo.merge) {
        if (this.repo.merge.conflicts.length) return `error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add <file>'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.`;
        msg ||= `Merge branch '${this.repo.merge.name}'${this.repo.head !== 'main' && this.repo.head !== 'master' ? ` into ${this.repo.head}` : ''}`;
      }
      if (msg === null) return 'Aborting commit due to empty commit message.\n(En este laboratorio usá: git commit -m "mensaje")';
      if (msg !== undefined && !msg.trim()) return 'Aborting commit due to empty commit message.';
      if (this.requireIdentity && !this.identity()) return 'Author identity unknown\n\n*** Please tell me who you are.\n\nRun\n\n  git config user.email "you@example.com"\n  git config user.name "Your Name"\n\nto set your account\'s default identity.\nfatal: unable to auto-detect email address';
      if (!this.repo.merge && eqTree(this.repo.index, this.headTree())) {
        const s = this.status();
        return `On branch ${this.repo.head}\n${s.unstaged.length ? 'Changes not staged for commit:\n' + s.unstaged.map(([k, p]) => `\t${k}: ${p}`).join('\n') + '\n\nno changes added to commit (use "git add" and/or "git commit -a")' : s.untracked.length ? 'Untracked files:\n' + s.untracked.map((p) => '\t' + p).join('\n') + '\n\nnothing added to commit but untracked files present (use "git add" to track)' : 'nothing to commit, working tree clean'}`;
      }
      const parents = [this.headId(), this.repo.merge?.theirs].filter(Boolean);
      const id = this.newCommit(parents, { ...this.repo.index }, msg, this.repo.head);
      const root = parents.length ? '' : ' (root-commit)';
      const before = parents[0] ? this.repo.commits[parents[0]].tree : {};
      const changed = new Set([...Object.keys(before), ...Object.keys(this.repo.index)].filter((p) => before[p] !== this.repo.index[p]));
      this.repo.merge = null;
      return `[${this.repo.head}${root} ${id}] ${msg}\n ${changed.size} file${changed.size === 1 ? '' : 's'} changed`;
    }

    newCommit(parents, tree, msg, lane) {
      let id;
      do id = hex(); while (this.repo.commits[id]);
      this.clock += 60000 * 7;
      this.repo.commits[id] = { id, parents, tree, msg, lane, time: this.clock, author: this.identity() || 'Estudiante <estudiante@frt.utn.edu.ar>' };
      this.repo.order.push(id);
      this.repo.branches[this.repo.head] = id;
      return id;
    }

    refsAt(id) {
      const out = [];
      for (const [b, c] of Object.entries(this.repo.branches)) if (c === id) out.push(b === this.repo.head ? `HEAD -> ${b}` : b);
      for (const [b, c] of Object.entries(this.repo.remoteRefs)) if (c === id) out.push(`origin/${b}`);
      return out.sort((a, b) => (b.startsWith('HEAD') ? 1 : 0) - (a.startsWith('HEAD') ? 1 : 0));
    }

    gitLog(args) {
      const all = args.includes('--all');
      const one = args.includes('--oneline');
      const nIdx = args.findIndex((x) => /^-\d+$/.test(x) || x === '-n');
      const limit = nIdx > -1 ? parseInt(args[nIdx] === '-n' ? args[nIdx + 1] : args[nIdx].slice(1), 10) : Infinity;
      const starts = all ? [...Object.values(this.repo.branches), ...Object.values(this.repo.remoteRefs)] : [this.headId()];
      const reach = new Set();
      starts.filter(Boolean).forEach((s) => this.ancestors(s).forEach((x) => reach.add(x)));
      if (!reach.size) return `fatal: your current branch '${this.repo.head}' does not have any commits yet`;
      const list = [...reach].sort((x, y) => this.repo.commits[y].time - this.repo.commits[x].time).slice(0, limit);
      return list.map((id) => {
        const c = this.repo.commits[id];
        const refs = this.refsAt(id);
        const deco = refs.length ? ` (${refs.join(', ')})` : '';
        if (one) return `${id}${deco} ${c.msg}`;
        return `commit ${id}${'0'.repeat(33)}${deco}\n${c.parents.length > 1 ? `Merge: ${c.parents.join(' ')}\n` : ''}Author: ${c.author}\nDate:   ${new Date(c.time).toUTCString().replace('GMT', '-0300')}\n\n    ${c.msg}\n`;
      }).join('\n');
    }

    renderDiff(a, b, path, label = '') {
      if (a === b) return '';
      const lines = diffLines(a, b);
      return [`diff --git a/${path} b/${path}${label}`, a === undefined ? 'new file mode 100644' : b === undefined ? 'deleted file mode 100644' : '', `--- ${a === undefined ? '/dev/null' : 'a/' + path}`, `+++ ${b === undefined ? '/dev/null' : 'b/' + path}`, ...lines.filter((l, i) => l[0] !== ' ' || lines.slice(Math.max(0, i - 2), i + 3).some((x) => x[0] !== ' ')).map(([k, l]) => k + l)].filter(Boolean).join('\n');
    }

    gitDiff(args) {
      const staged = args.includes('--staged') || args.includes('--cached');
      const specs = args.filter((x) => !x.startsWith('-'));
      const from = staged ? this.headTree() : this.repo.index;
      const pool = [...new Set([...Object.keys(from), ...(staged ? Object.keys(this.repo.index) : Object.keys(this.repo.index))])];
      const paths = specs.length ? specs.flatMap((s) => this.match(s, pool) || []) : pool;
      return paths.sort().map((p) => this.renderDiff(from[p], staged ? this.repo.index[p] : this.work(p), p)).filter(Boolean).join('\n');
    }

    gitRestore(args) {
      const staged = args.includes('--staged') || args.includes('-S');
      const specs = args.filter((x) => !x.startsWith('-'));
      if (!specs.length) return 'fatal: you must specify path(s) to restore';
      const head = this.headTree();
      for (const s of specs) {
        const pool = [...new Set([...Object.keys(this.repo.index), ...Object.keys(head)])];
        const m = this.match(s, pool);
        if (!m || !m.length) return `error: pathspec '${s}' did not match any file(s) known to git`;
        for (const p of m) {
          if (staged) { if (p in head) this.repo.index[p] = head[p]; else delete this.repo.index[p]; }
          else if (p in this.repo.index) this.fs[this.abs(p)] = this.repo.index[p];
        }
      }
      return '';
    }

    gitReset(args) {
      const specs = args.filter((x) => !x.startsWith('-') && x !== 'HEAD');
      if (args.includes('--hard')) return 'En este laboratorio no está habilitado git reset --hard: borra cambios sin vuelta atrás.';
      if (!specs.length) { this.repo.index = { ...this.headTree() }; return 'Unstaged changes after reset.'; }
      return this.gitRestore(['--staged', ...specs]);
    }

    gitRm(args) {
      const cached = args.includes('--cached');
      const specs = args.filter((x) => !x.startsWith('-'));
      if (!specs.length) return 'usage: git rm [<options>] [--] <file>...';
      const out = [];
      for (const s of specs) {
        const m = this.match(s, Object.keys(this.repo.index));
        if (!m || !m.length) return `fatal: pathspec '${s}' did not match any files`;
        if (m.length > 1 && !args.includes('-r')) return `fatal: not removing '${s}' recursively without -r`;
        for (const p of m) { delete this.repo.index[p]; if (!cached) delete this.fs[this.abs(p)]; out.push(`rm '${p}'`); }
      }
      return out.join('\n');
    }

    gitMv(args) {
      const [src, dst] = args.filter((x) => !x.startsWith('-'));
      if (!src || !dst) return 'usage: git mv [<options>] <source>... <destination>';
      const a = this.rel(this.resolve(src)), b = this.rel(this.resolve(dst));
      if (!(a in this.repo.index)) return `fatal: not under version control, source=${a}, destination=${b}`;
      if (this.work(b) !== undefined) return `fatal: destination exists, source=${a}, destination=${b}`;
      this.repo.index[b] = this.repo.index[a]; delete this.repo.index[a];
      this.fs[this.abs(b)] = this.work(a); delete this.fs[this.abs(a)];
      return '';
    }

    gitBranch(args) {
      const del = args.includes('-d') || args.includes('-D');
      const names = args.filter((x) => !x.startsWith('-'));
      if (args.includes('-r')) return Object.keys(this.repo.remoteRefs).map((b) => `  origin/${b}`).join('\n');
      if (del) {
        const n = names[0];
        if (!(n in this.repo.branches)) return `error: branch '${n}' not found`;
        if (n === this.repo.head) return `error: cannot delete branch '${n}' used by worktree`;
        if (args.includes('-d') && !this.ancestors(this.headId()).has(this.repo.branches[n])) return `error: the branch '${n}' is not fully merged.\nhint: If you are sure you want to delete it, run 'git branch -D ${n}'`;
        const id = this.repo.branches[n]; delete this.repo.branches[n];
        return `Deleted branch ${n} (was ${id}).`;
      }
      if (names.length) {
        const [n, start] = names;
        if (!this.headId()) return `fatal: not a valid object name: '${this.repo.head}'`;
        if (n in this.repo.branches) return `fatal: a branch named '${n}' already exists`;
        if (!/^[\w.\-/]+$/.test(n) || n.endsWith('/') || n.includes('..')) return `fatal: '${n}' is not a valid branch name`;
        const base = start ? this.resolveRef(start) : this.headId();
        if (!base) return `fatal: not a valid object name: '${start}'`;
        this.repo.branches[n] = base;
        return '';
      }
      const local = Object.keys(this.repo.branches).sort().map((b) => `${b === this.repo.head ? '* ' : '  '}${b}`);
      if (!local.length && !this.headId()) local.push(`* ${this.repo.head}`);
      const remotes = args.includes('-a') ? Object.keys(this.repo.remoteRefs).map((b) => `  remotes/origin/${b}`) : [];
      return [...local, ...remotes].join('\n');
    }

    resolveRef(r) {
      if (r in this.repo.branches) return this.repo.branches[r];
      if (r.startsWith('origin/') && r.slice(7) in this.repo.remoteRefs) return this.repo.remoteRefs[r.slice(7)];
      if (this.repo.commits[r]) return r;
      const pre = Object.keys(this.repo.commits).filter((id) => id.startsWith(r));
      return r.length >= 4 && pre.length === 1 ? pre[0] : null;
    }

    // Cambia de rama actualizando índice y working tree (falla si se pisarían cambios)
    moveTo(branch) {
      const target = this.repo.commits[this.repo.branches[branch]]?.tree || {};
      const cur = this.headTree();
      const s = this.status();
      const dirty = new Set([...s.staged.map((x) => x[1].split(' -> ').pop()), ...s.unstaged.map((x) => x[1])]);
      const clash = [...dirty].filter((p) => cur[p] !== target[p]);
      if (clash.length) return `error: Your local changes to the following files would be overwritten by checkout:\n${clash.map((p) => '\t' + p).join('\n')}\nPlease commit your changes or stash them before you switch branches.\nAborting`;
      const untrackedClash = s.untracked.filter((p) => p in target && this.work(p) !== target[p]);
      if (untrackedClash.length) return `error: The following untracked working tree files would be overwritten by checkout:\n${untrackedClash.map((p) => '\t' + p).join('\n')}\nPlease move or remove them before you switch branches.\nAborting`;
      for (const p of Object.keys(cur)) if (!(p in target) && !dirty.has(p)) delete this.fs[this.abs(p)];
      for (const [p, c] of Object.entries(target)) if (!dirty.has(p)) this.fs[this.abs(p)] = c;
      const newIndex = { ...target };
      for (const p of dirty) { if (p in this.repo.index) newIndex[p] = this.repo.index[p]; else delete newIndex[p]; }
      this.repo.index = newIndex;
      this.repo.head = branch;
      return null;
    }

    switchTo(name, create, startPoint) {
      if (this.repo.merge) return 'error: you need to resolve your current index first';
      if (create) {
        if (name in this.repo.branches) return `fatal: a branch named '${name}' already exists`;
        if (!this.headId() && !startPoint) { this.repo.head = name; return `Switched to a new branch '${name}'`; }
        const base = startPoint ? this.resolveRef(startPoint) : this.headId();
        if (!base) return `fatal: invalid reference: ${startPoint}`;
        this.repo.branches[name] = base;
        const err = this.moveTo(name);
        if (err) { delete this.repo.branches[name]; return err; }
        if (startPoint?.startsWith('origin/')) { this.repo.tracking[name] = startPoint.slice(7); return `branch '${name}' set up to track '${startPoint}'.\nSwitched to a new branch '${name}'`; }
        return `Switched to a new branch '${name}'`;
      }
      if (name === this.repo.head) return `Already on '${name}'`;
      if (!(name in this.repo.branches)) {
        // Igual que git: si existe origin/<name>, crea la rama local que la sigue
        if (name in this.repo.remoteRefs) {
          this.repo.branches[name] = this.repo.remoteRefs[name];
          const err = this.moveTo(name);
          if (err) { delete this.repo.branches[name]; return err; }
          this.repo.tracking[name] = name;
          return `branch '${name}' set up to track 'origin/${name}'.\nSwitched to a new branch '${name}'`;
        }
        return `error: pathspec '${name}' did not match any file(s) known to git`;
      }
      const err = this.moveTo(name);
      return err || `Switched to branch '${name}'`;
    }

    gitCheckout(args) {
      const dd = args.indexOf('--');
      if (dd > -1) return this.gitRestore(args.slice(dd + 1));
      const b = args.indexOf('-b');
      if (b > -1) { const rest = args.filter((x, i) => i !== b && !x.startsWith('-')); return this.switchTo(rest[0], true, rest[1]); }
      const name = args.find((x) => !x.startsWith('-'));
      if (!name) return 'Usá: git checkout <rama>, git checkout -b <rama-nueva> o git checkout -- <archivo>';
      if (!(name in this.repo.branches) && !(name in this.repo.remoteRefs) && this.work(this.rel(this.resolve(name))) !== undefined) return this.gitRestore([name]);
      return this.switchTo(name, false);
    }

    gitSwitch(args) {
      const c = args.findIndex((x) => x === '-c' || x === '--create');
      if (c > -1) { const rest = args.filter((x, i) => i !== c && !x.startsWith('-')); return this.switchTo(rest[0], true, rest[1]); }
      const name = args.find((x) => !x.startsWith('-'));
      if (!name) return 'fatal: missing branch or commit argument';
      return this.switchTo(name, false);
    }

    gitMerge(args) {
      if (args.includes('--abort')) {
        if (!this.repo.merge) return 'fatal: There is no merge to abort (MERGE_HEAD missing).';
        const tree = this.headTree();
        for (const p of this.repoFiles()) if (!(p in tree) && p in this.repo.index) delete this.fs[this.abs(p)];
        for (const [p, c] of Object.entries(tree)) this.fs[this.abs(p)] = c;
        for (const p of this.repo.merge.conflicts) if (!(p in tree)) delete this.fs[this.abs(p)];
        this.repo.index = { ...tree };
        this.repo.merge = null;
        return '';
      }
      const name = args.find((x) => !x.startsWith('-'));
      if (!name) return 'fatal: No remote for the current branch.';
      if (this.repo.merge) return 'error: Merging is not possible because you have unmerged files.';
      const theirs = this.resolveRef(name);
      if (!theirs) return `merge: ${name} - not something we can merge`;
      const ours = this.headId();
      const s = this.status();
      if (s.staged.length || s.unstaged.length) return `error: Your local changes to the following files would be overwritten by merge:\n${[...s.staged, ...s.unstaged].map((x) => '\t' + x[1]).join('\n')}\nPlease commit your changes or stash them before you merge.\nAborting`;
      if (this.ancestors(ours).has(theirs)) return 'Already up to date.';
      const label = name;
      if (!ours || this.ancestors(theirs).has(ours)) {
        const before = this.headTree();
        const tree = this.repo.commits[theirs].tree;
        for (const p of Object.keys(before)) if (!(p in tree)) delete this.fs[this.abs(p)];
        for (const [p, c] of Object.entries(tree)) this.fs[this.abs(p)] = c;
        this.repo.index = { ...tree };
        this.repo.branches[this.repo.head] = theirs;
        const changed = [...new Set([...Object.keys(before), ...Object.keys(tree)])].filter((p) => before[p] !== tree[p]);
        return `Updating ${ours ? ours : '0000000'}..${theirs}\nFast-forward\n${changed.map((p) => ` ${p}`).join('\n')}\n ${changed.length} file${changed.length === 1 ? '' : 's'} changed`;
      }
      const base = this.mergeBase(ours, theirs);
      const B = base ? this.repo.commits[base].tree : {}, O = this.headTree(), T = this.repo.commits[theirs].tree;
      const result = {}, conflicts = [], msgs = [];
      for (const p of [...new Set([...Object.keys(B), ...Object.keys(O), ...Object.keys(T)])].sort()) {
        const b = B[p], o = O[p], t = T[p];
        let r;
        if (o === t) r = o;
        else if (o === b) r = t;
        else if (t === b) r = o;
        else {
          conflicts.push(p);
          msgs.push(`CONFLICT (${b === undefined ? 'add/add' : o === undefined || t === undefined ? 'modify/delete' : 'content'}): Merge conflict in ${p}`);
          r = `<<<<<<< HEAD\n${o ?? ''}\n=======\n${t ?? ''}\n>>>>>>> ${label}`;
        }
        if (r !== undefined) result[p] = r;
      }
      for (const p of Object.keys(O)) if (!(p in result)) delete this.fs[this.abs(p)];
      for (const [p, c] of Object.entries(result)) this.fs[this.abs(p)] = c;
      const idx = { ...result };
      conflicts.forEach((p) => { if (p in O) idx[p] = O[p]; else delete idx[p]; });
      this.repo.index = idx;
      if (conflicts.length) {
        this.repo.merge = { theirs, name: label, conflicts };
        return `Auto-merging ${conflicts.join('\nAuto-merging ')}\n${msgs.join('\n')}\nAutomatic merge failed; fix conflicts and then commit the result.`;
      }
      this.repo.index = result;
      this.repo.merge = { theirs, name: label, conflicts: [] };
      const out = this.gitCommit([]);
      return `Merge made by the 'ort' strategy.\n${out.split('\n').slice(1).join('\n')}`;
    }

    gitRemote(args) {
      if (!this.repo.url) return args.includes('add') ? this.gitRemoteAdd(args) : '';
      return args.includes('-v') ? `origin\t${this.repo.url} (fetch)\norigin\t${this.repo.url} (push)` : 'origin';
    }
    gitRemoteAdd(args) {
      const url = args[args.indexOf('add') + 2];
      if (!url) return 'usage: git remote add <name> <url>';
      this.repo.url = url.replace(/\.git$/, '');
      this.remotes[this.repo.url] ||= { branches: {}, commits: {} };
      return '';
    }

    gitFetch() {
      const remote = this.remotes[this.repo.url];
      if (!remote) return "fatal: 'origin' does not appear to be a git repository";
      const out = [];
      for (const [id, c] of Object.entries(remote.commits)) if (!this.repo.commits[id]) { this.repo.commits[id] = clone(c); this.repo.order.push(id); }
      for (const [b, id] of Object.entries(remote.branches)) {
        const old = this.repo.remoteRefs[b];
        if (old !== id) out.push(old ? `   ${old}..${id}  ${b.padEnd(16)} -> origin/${b}` : ` * [new branch]      ${b.padEnd(16)} -> origin/${b}`);
        this.repo.remoteRefs[b] = id;
      }
      return out.length ? `From ${this.repo.url}\n${out.join('\n')}` : '';
    }

    gitPull() {
      const tr = this.repo.tracking[this.repo.head];
      if (!tr) return `There is no tracking information for the current branch.\nPlease specify which branch you want to merge with.\n\n    git branch --set-upstream-to=origin/<branch> ${this.repo.head}`;
      const f = this.gitFetch();
      const m = this.gitMerge([`origin/${tr}`]);
      return [f, m].filter(Boolean).join('\n');
    }

    gitPush(args) {
      const remote = this.remotes[this.repo.url];
      if (!remote) return "fatal: No configured push destination.";
      const pos = args.filter((x) => !x.startsWith('-'));
      const branch = pos[1] || this.repo.head;
      const setUp = args.includes('-u') || args.includes('--set-upstream');
      if (!pos[1] && !this.repo.tracking[branch]) return `fatal: The current branch ${branch} has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push --set-upstream origin ${branch}\n`;
      const local = this.repo.branches[branch];
      if (!local) return `error: src refspec ${branch} does not match any`;
      const rid = remote.branches[branch];
      if (rid && !this.ancestors(local).has(rid)) return ` ! [rejected]        ${branch} -> ${branch} (fetch first)\nerror: failed to push some refs to '${this.repo.url}'\nhint: Updates were rejected because the remote contains work that you do not\nhint: have locally. Integrate the remote changes (e.g. 'git pull') before pushing again.`;
      if (rid === local) return 'Everything up-to-date';
      for (const id of this.ancestors(local)) remote.commits[id] = clone(this.repo.commits[id]);
      remote.branches[branch] = local;
      this.repo.remoteRefs[branch] = local;
      if (setUp) this.repo.tracking[branch] = branch;
      return `To ${this.repo.url}\n ${rid ? `  ${rid}..${local}  ${branch} -> ${branch}` : `* [new branch]      ${branch} -> ${branch}`}${setUp ? `\nbranch '${branch}' set up to track 'origin/${branch}'.` : ''}`;
    }

    gitShow(args) {
      const id = this.resolveRef(args[0] || 'HEAD') || this.headId();
      if (!id) return 'fatal: bad revision';
      const c = this.repo.commits[id];
      const p = c.parents[0] ? this.repo.commits[c.parents[0]].tree : {};
      return `commit ${id}\nAuthor: ${c.author}\n\n    ${c.msg}\n\n` + [...new Set([...Object.keys(p), ...Object.keys(c.tree)])].sort().map((f) => this.renderDiff(p[f], c.tree[f], f)).filter(Boolean).join('\n');
    }

    // --- API para los objetivos de cada escenario ---
    api() {
      const r = this.repo;
      const self = this;
      return {
        sim: self,
        get inited() { return !!r; },
        get head() { return r?.head; },
        branch: (b) => r?.branches[b] ?? null,
        remoteBranch: (b) => r?.remoteRefs[b] ?? null,
        pushed: (b) => !!(r && self.remotes[r.url]?.branches[b] && self.remotes[r.url].branches[b] === r.branches[b]),
        commits: (b) => (r && r.branches[b ?? r.head] ? self.ancestors(r.branches[b ?? r.head]).size : 0),
        tree: (b) => (r && r.branches[b ?? r.head] ? r.commits[r.branches[b ?? r.head]].tree : {}),
        merged: (a, into) => !!(r && r.branches[a] && r.branches[into] && self.ancestors(r.branches[into]).has(r.branches[a])),
        hasMergeCommit: (b) => !!(r && r.branches[b] && [...self.ancestors(r.branches[b])].some((id) => r.commits[id].parents.length > 1)),
        clean: () => { if (!r) return false; const s = self.status(); return !s.staged.length && !s.unstaged.length && !s.unmerged.length; },
        status: () => (r ? self.status() : null),
        file: (p) => self.fs[p],
        ignored: (p) => !!r && isIgnored(p, self.rules()),
        config: (k) => ({ ...self.globalConfig, ...(r?.config || {}) })[k],
        cwd: () => self.cwd,
        lastMsg: (b) => (r && r.branches[b ?? r.head] ? r.commits[r.branches[b ?? r.head]].msg : ''),
        inMerge: () => !!r?.merge,
      };
    }
  }

  // ---------- Comandos de bash ----------
  GitSim.prototype.shell = {
    help() {
      return [
        'Comandos de bash: ls [-a], cd <carpeta>, pwd, mkdir <carpeta>, touch <archivo>, cat <archivo>,',
        '  echo "texto" > archivo, echo "texto" >> archivo, rm <archivo>, mv <origen> <destino>,',
        '  nano <archivo> (abre el editor), tree, unzip <archivo.zip> [-d carpeta], clear',
        'Comandos de git: init, clone, config, status, add, commit, log, diff, restore, rm, mv,',
        '  branch, checkout, switch, merge, remote, fetch, pull, push, show',
        'Tip: flechas ↑ ↓ recorren el historial de comandos.',
      ].join('\n');
    },
    pwd() { return '/home/estudiante' + (this.cwd ? '/' + this.cwd : ''); },
    ls(a) {
      const showAll = a.includes('-a') || a.includes('-la');
      const target = this.resolve(a.find((x) => !x.startsWith('-')) || '.');
      if (target in this.fs) return target.split('/').pop();
      if (!this.isDir(target)) return `ls: cannot access '${a.find((x) => !x.startsWith('-'))}': No such file or directory`;
      const pre = target ? target + '/' : '';
      const names = new Set();
      for (const f of [...Object.keys(this.fs), ...this.dirs]) {
        if (!f.startsWith(pre) || f === target) continue;
        const rest = f.slice(pre.length).split('/');
        names.add(rest.length > 1 || this.dirs.has(f) && rest.length === 1 && !(f in this.fs) ? rest[0] + '/' : rest[0]);
      }
      if (showAll && this.repo && this.repo.root === target) names.add('.git/');
      return [...names].filter((n) => showAll || !n.startsWith('.')).sort().join('  ');
    },
    cd(a) {
      const t = this.resolve(a[0] || '~');
      if (t in this.fs) return `bash: cd: ${a[0]}: Not a directory`;
      if (!this.isDir(t)) return `bash: cd: ${a[0]}: No such file or directory`;
      this.cwd = t;
      return '';
    },
    mkdir(a) {
      const names = a.filter((x) => !x.startsWith('-'));
      if (!names.length) return 'mkdir: missing operand';
      for (const n of names) { const p = this.resolve(n); if (this.isDir(p) && !a.includes('-p')) return `mkdir: cannot create directory '${n}': File exists`; this.dirs.add(p); }
      return '';
    },
    touch(a) { if (!a.length) return 'touch: missing file operand'; a.forEach((n) => { const p = this.resolve(n); if (!(p in this.fs)) this.fs[p] = ''; }); return ''; },
    cat(a) {
      if (!a.length) return 'cat: missing file operand';
      return a.map((n) => { const p = this.resolve(n); return p in this.fs ? this.fs[p] : this.isDir(p) ? `cat: ${n}: Is a directory` : `cat: ${n}: No such file or directory`; }).join('\n');
    },
    echo(a) { return a.join(' '); },
    rm(a) {
      const rec = a.includes('-r') || a.includes('-rf');
      const names = a.filter((x) => !x.startsWith('-'));
      if (!names.length) return 'rm: missing operand';
      for (const n of names) {
        const p = this.resolve(n);
        if (p in this.fs) { delete this.fs[p]; continue; }
        if (this.isDir(p)) {
          if (!rec) return `rm: cannot remove '${n}': Is a directory`;
          if (this.repo && (p === this.repo.root || this.repo.root.startsWith(p + '/') || p === '')) return 'En este laboratorio no se puede borrar la carpeta del repositorio.';
          Object.keys(this.fs).filter((f) => f.startsWith(p + '/')).forEach((f) => delete this.fs[f]);
          [...this.dirs].filter((d) => d === p || d.startsWith(p + '/')).forEach((d) => this.dirs.delete(d));
          continue;
        }
        return `rm: cannot remove '${n}': No such file or directory`;
      }
      return '';
    },
    mv(a) {
      const [s, d] = a;
      if (!s || !d) return 'mv: missing file operand';
      const ps = this.resolve(s), pd = this.resolve(d);
      if (!(ps in this.fs)) return `mv: cannot stat '${s}': No such file or directory`;
      const target = this.isDir(pd) && !(pd in this.fs) ? `${pd}/${ps.split('/').pop()}` : pd;
      this.fs[target] = this.fs[ps]; delete this.fs[ps];
      return '';
    },
    tree() {
      const pre = this.cwd ? this.cwd + '/' : '';
      const files = Object.keys(this.fs).filter((f) => f.startsWith(pre)).map((f) => f.slice(pre.length)).sort();
      return ['.', ...files.map((f) => `├── ${f}`)].join('\n');
    },
    unzip(a) {
      const zip = a.find((x) => x.endsWith('.zip'));
      const di = a.indexOf('-d');
      const content = zip && this.zips[this.resolve(zip)];
      if (!content) return `unzip:  cannot find or open ${zip || ''}`;
      const dest = this.resolve(di > -1 ? a[di + 1] : '.');
      const out = [`Archive:  ${zip}`];
      for (const [p, c] of Object.entries(content)) { const full = dest ? `${dest}/${p}` : p; this.fs[full] = c; out.push(`  inflating: ${full}`); }
      return out.join('\n');
    },
    nano(a) { return a[0] ? { edit: this.resolve(a[0]) } : 'nano: falta el nombre del archivo'; },
    code(a) { return this.shell.nano.call(this, a); },
    clear() { return { clear: true }; },
  };

  // ---------- Escenarios ----------
  // Ayudante para armar un remoto con historia
  function remote(sim, url, build) {
    const commits = {}, branches = {};
    let t = Date.UTC(2026, 2, 20, 12, 0);
    const api = {
      commit(branch, parentBranch, files, msg, del = []) {
        const parent = branches[branch] ?? (parentBranch ? branches[parentBranch] : null);
        const prevTree = parent ? commits[parent].tree : {};
        const tree = { ...prevTree, ...files };
        del.forEach((p) => delete tree[p]);
        let id; do id = hex(); while (commits[id]);
        t += 3600000;
        commits[id] = { id, parents: parent ? [parent] : [], tree, msg, lane: branch, time: t, author: 'Cátedra DSW <dsw@frt.utn.edu.ar>' };
        branches[branch] = id;
        return id;
      },
    };
    build(api);
    sim.remotes[url] = { branches, commits };
  }

  const JAVA = {
    elec: `public class VehiculoElectrico extends Vehiculo {
    private double kwhBase;

    public double calcularConsumo() {
        double total = kwhBase;
        if (capacidadCarga >= 1200) {
            total = total + 0.15;
        }
        return total;
    }
}`,
    comb: `public class VehiculoCombustible extends Vehiculo {
    private double kilometrosPorLitro;
    private double litrosExtra;

    @Override
    public double calcularConsumo(double kilometros) {
        double total = kilometrosPorLitro - litrosExtra;
        return total;
    }
}`,
    veh: `public abstract class Vehiculo {
    protected String patente;
    protected String marca;
    protected String modelo;
    protected int anio;
    protected double capacidadCarga;

    public double calcularConsumo(double kilometros) {
        return 0;
    }
}`,
    marcaRemota: `public class Marca {
    private String descripcion;

    public Marca(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return nombre;
    }
}`,
  };

  const LOREM1 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas fringilla erat a turpis commodo.';
  const LOREM2 = 'Pellentesque interdum, dolor vel aliquam congue, orci ipsum accumsan lacus, vitae maximus diam arcu id leo.';

  const SCENARIOS = {
    // Carpeta vacía para practicar desde cero
    blank: { build(s) { s.dirs.add('EJ02'); s.cwd = 'EJ02'; } },
    // EJ02 parte 3: repo remoto con .gitignore vacío y un zip para descomprimir
    ej02: {
      requireIdentity: true,
      build(s) {
        s.dirs.add('EJ02'); s.dirs.add('EJ02/Parte3'); s.cwd = 'EJ02/Parte3';
        remote(s, 'https://github.com/dsw-frt-utn/dsw2026-ej02', (r) => {
          r.commit('main', null, { '.gitignore': '' }, 'Initial commit');
        });
        s.fs['EJ02/Parte3/DSW2026_EJ02.zip'] = '(archivo comprimido: usá unzip para extraerlo)';
        s.zips['EJ02/Parte3/DSW2026_EJ02.zip'] = {
          'seg.vsp': 'segmentos', '#trash.gb': 'archivo a conservar', 'temp/temp.txt': 'temporal', 'rb/#trash1.tr': 'basura', 'rb/#trash2.tr': 'basura', 'rb/#trash.txt': 'basura', 'rb/config': 'config=1',
          'docs/analysis/analysis.txt': `${LOREM1}\n\n${LOREM2}`, 'docs/analysis/main.vsp': 'vsp', 'docs/analysis/temp/tempa.txt': 'temporal',
          'docs/design/design.txt': 'Sed faucibus ultrices scelerisque. Ut id magna nibh.', 'docs/design/model.vsp': 'vsp', 'docs/design/Temp/tempd.txt': 'temporal',
          'code/domain/Sector.java': 'public class Sector { }', 'code/domain/Especie.java': 'public class Especie { }', 'code/domain/Empleado.java': 'public class Empleado { }',
          'code/data/script.sql': 'CREATE TABLE Empleado (Id INT PRIMARY KEY);', 'code/bin/library.dll': 'binario', 'code/bin/executable.exe': 'binario',
        };
      },
    },
    // EJ03: repo con código del EJ01 y una rama remota feature/marcas
    ej03: {
      build(s) {
        s.dirs.add('EJ03'); s.cwd = 'EJ03';
        remote(s, 'https://github.com/dsw-frt-utn/dsw2026-ej03', (r) => {
          r.commit('main', null, { 'README.md': '# Desarrollo de Software - 2026 - Ejercicio N° 3' }, 'Initial commit');
          r.commit('main', null, { 'src/domain/Vehiculo.java': JAVA.veh, 'src/domain/VehiculoElectrico.java': JAVA.elec, 'src/domain/VehiculoCombustible.java': JAVA.comb }, 'Código base de la solución');
          r.commit('feature/marcas', 'main', { 'src/domain/Marca.java': 'public class Marca {\n    private String nombre;\n\n    public Marca(String nombre) {\n        this.nombre = nombre;\n    }\n\n    public String getNombre() {\n        return nombre;\n    }\n}' }, 'Nueva clase para representar las marcas de vehículos');
          r.commit('feature/marcas', null, { 'src/domain/Marca.java': JAVA.marcaRemota }, 'Refactor Marca class to use descripcion instead of nombre');
        });
      },
    },
    // Conflicto mínimo para practicar la resolución
    conflict: {
      build(s) {
        s.dirs.add('demo'); s.cwd = 'demo';
        s.run('git init');
        s.repo.config['user.name'] = 'Estudiante'; s.repo.config['user.email'] = 'estudiante@frt.utn.edu.ar';
        s.fs['demo/saludo.txt'] = 'Hola mundo';
        s.run('git add .'); s.run('git commit -m "Saludo inicial"');
        s.run('git switch -c feature/ingles');
        s.fs['demo/saludo.txt'] = 'Hello world'; s.run('git commit -am "Saludo en inglés"');
        s.run('git switch main');
        s.fs['demo/saludo.txt'] = 'Hola, Tucumán'; s.run('git commit -am "Saludo local"');
      },
    },
    // EJ04: trabajo en equipo con GitHub; otro integrante ya subió su rama
    team: {
      build(s) {
        s.dirs.add('EJ04'); s.cwd = 'EJ04';
        remote(s, 'https://github.com/dsw-frt-utn/12345-23456-34567-ej04', (r) => {
          r.commit('main', null, { 'README.md': '# Ejercicio 4' }, 'Initial commit');
          r.commit('development', 'main', { 'README.md': '# Desarrollo de Software\nEjercicio N° 4\n\nIntegrantes:\n- 12345 Pérez, Ana (ana@frt.utn.edu.ar)\n- 23456 Gómez, Luis\n- 34567 Díaz, Sofía' }, 'Update README.md');
        });
      },
    },
  };
  // El segundo integrante sube su trabajo mientras vos trabajás (para practicar pull)
  SCENARIOS.team.teammate = (s) => {
    const rem = s.remotes['https://github.com/dsw-frt-utn/12345-23456-34567-ej04'];
    if (rem.teammateDone) return false;
    const parent = rem.branches.development;
    const id = hex();
    rem.commits[id] = { id, parents: [parent], tree: { ...rem.commits[parent].tree, 'src/Menu.java': 'public class Menu { /* menú principal */ }' }, msg: 'Agregar menú principal (feature/menu)', lane: 'development', time: Date.UTC(2026, 3, 6, 15, 30), author: 'Sofía Díaz <sofia@frt.utn.edu.ar>' };
    rem.branches.development = id;
    rem.teammateDone = true;
    return true;
  };

  // ---------- Interfaz ----------
  const LANE_COLORS = ['var(--accent)', 'var(--ok)', 'var(--warn)', 'var(--tok-t)', 'var(--err)', 'var(--tok-n)'];

  function graphSvg(sim, esc) {
    const r = sim.repo;
    if (!r || !r.order.length) return '<p class="git-empty">Todavía no hay commits. El historial aparece acá cuando hagas el primero.</p>';
    const reach = new Set();
    [...Object.values(r.branches), ...Object.values(r.remoteRefs)].filter(Boolean).forEach((s) => sim.ancestors(s).forEach((x) => reach.add(x)));
    const list = r.order.filter((id) => reach.has(id)).sort((a, b) => r.commits[b].time - r.commits[a].time);
    const lanes = [];
    const laneOf = (c) => { let i = lanes.indexOf(c.lane); if (i < 0) { lanes.push(c.lane); i = lanes.length - 1; } return i; };
    [...list].reverse().forEach((id) => laneOf(r.commits[id]));
    const RH = 30, LW = 18, X0 = 14;
    const y = (i) => 18 + i * RH;
    const pos = Object.fromEntries(list.map((id, i) => [id, { x: X0 + laneOf(r.commits[id]) * LW, y: y(i) }]));
    const textX = X0 + lanes.length * LW + 8;
    let edges = '', dots = '', labels = '';
    list.forEach((id) => {
      const c = r.commits[id], p = pos[id];
      c.parents.forEach((pid) => {
        const q = pos[pid];
        if (!q) return;
        const col = LANE_COLORS[laneOf(r.commits[pid === c.parents[0] ? id : pid]) % LANE_COLORS.length];
        edges += p.x === q.x ? `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="${col}" stroke-width="2"/>`
          : `<path d="M${p.x} ${p.y} C ${p.x} ${p.y + RH * .8}, ${q.x} ${q.y - RH * .8}, ${q.x} ${q.y}" stroke="${col}" stroke-width="2" fill="none"/>`;
      });
      const col = LANE_COLORS[laneOf(c) % LANE_COLORS.length];
      const isHead = id === sim.headId();
      dots += `<circle cx="${p.x}" cy="${p.y}" r="${c.parents.length > 1 ? 6 : 5}" fill="${c.parents.length > 1 ? 'var(--surface)' : col}" stroke="${col}" stroke-width="2"/>${isHead ? `<circle cx="${p.x}" cy="${p.y}" r="9" fill="none" stroke="var(--ink)" stroke-width="1.5"/>` : ''}`;
      const refs = sim.refsAt(id);
      const refTxt = refs.map((x) => `<tspan class="${x.startsWith('origin/') ? 'g-remote' : x.startsWith('HEAD') ? 'g-head' : 'g-branch'}">${esc(x)}</tspan>`).join('<tspan class="g-sep">, </tspan>');
      labels += `<text x="${textX}" y="${p.y + 4}"><tspan class="g-id">${id}</tspan> ${refs.length ? `<tspan class="g-sep">(</tspan>${refTxt}<tspan class="g-sep">) </tspan>` : ''}<tspan class="g-msg">${esc(c.msg.length > 46 ? c.msg.slice(0, 45) + '…' : c.msg)}</tspan></text>`;
    });
    const H = y(list.length - 1) + 18;
    return `<svg class="git-graph" viewBox="0 0 640 ${H}" width="640" height="${H}" role="img" aria-label="Grafo de commits">${edges}${dots}${labels}</svg>`;
  }

  function filesPanel(sim, esc) {
    const pre = '';
    const all = Object.keys(sim.fs).filter((f) => !sim.zips[f] || true).sort();
    if (!all.length) return '<p class="git-empty">La carpeta está vacía. Creá un archivo con <code>touch</code> o <code>echo "texto" > archivo.txt</code>.</p>';
    const st = sim.repo ? sim.status() : null;
    const badge = (abs) => {
      if (!sim.repo || !sim.inRepo(abs)) return '';
      const p = sim.rel(abs);
      if (st.unmerged.includes(p)) return '<span class="fb err" title="En conflicto">C</span>';
      if (st.untracked.includes(p)) return '<span class="fb warn" title="Sin seguimiento (untracked)">U</span>';
      if (st.ignored.includes(p)) return '<span class="fb dim" title="Ignorado por .gitignore">I</span>';
      const stg = st.staged.find((x) => x[1].split(' -> ').pop() === p);
      const uns = st.unstaged.find((x) => x[1] === p);
      return `${stg ? `<span class="fb ok" title="Preparado (staged): ${stg[0]}">${{ 'new file': 'A', modified: 'M', renamed: 'R' }[stg[0]] || 'M'}</span>` : ''}${uns ? '<span class="fb warn" title="Modificado sin preparar">M</span>' : ''}`;
    };
    return `<ul class="git-files">${all.map((f) => `<li class="${sim.repo && sim.inRepo(f) && st.ignored.includes(sim.rel(f)) ? 'is-ign' : ''}"><button type="button" class="file-btn" data-file="${esc(f)}">${esc(pre + f)}</button>${badge(f)}</li>`).join('')}</ul>
      <p class="git-legend"><span class="fb warn">U</span> sin seguimiento <span class="fb ok">A</span> preparado <span class="fb warn">M</span> modificado <span class="fb dim">I</span> ignorado <span class="fb err">C</span> conflicto</p>`;
  }

  window.GUIDE.LABS.git = (el, cfg, { esc }) => {
    const preset = SCENARIOS[cfg.scenario || 'blank'];
    let sim;
    const hist = [];
    let hi = 0;
    el.innerHTML = `
      ${cfg.goals ? `<ul class="goals-list git-goals"></ul>` : ''}
      <div class="git-lab">
        <div class="term" role="region" aria-label="Terminal">
          <pre class="term-out" aria-live="polite"></pre>
          <form class="term-in"><label class="term-prompt" for="${(cfg.uid = 'g' + Math.random().toString(36).slice(2, 7))}"></label><input id="${cfg.uid}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="escribí un comando y Enter"></form>
        </div>
        <div class="git-side">
          <div class="git-tabs" role="tablist"><button type="button" role="tab" aria-selected="true" data-tab="graph">Historial</button><button type="button" role="tab" aria-selected="false" data-tab="files">Archivos</button></div>
          <div class="git-panel" data-panel="graph"></div>
          <div class="git-panel" data-panel="files" hidden></div>
          <div class="git-editor" hidden><p class="file-name"></p><textarea rows="8" spellcheck="false"></textarea><div class="lab-row"><button class="btn sm primary" type="button" data-act="save">Guardar</button><button class="btn sm" type="button" data-act="close">Cerrar</button></div></div>
        </div>
      </div>
      <div class="lab-row"><button class="btn sm" type="button" data-act="reset">Reiniciar laboratorio</button>${cfg.hint ? `<details class="hint git-hint"><summary>Ver una solución posible</summary><pre class="lab-out">${esc(cfg.hint)}</pre></details>` : ''}</div>`;
    const out = el.querySelector('.term-out');
    const input = el.querySelector('.term-in input');
    const prompt = el.querySelector('.term-prompt');
    const editor = el.querySelector('.git-editor');
    let editing = null;

    const print = (cmd, res) => {
      if (cmd !== null) out.insertAdjacentHTML('beforeend', `<span class="t-cmd"><span class="t-ps">${esc(promptText())}</span>${esc(cmd)}</span>\n`);
      if (res) out.insertAdjacentHTML('beforeend', `<span class="${/^(fatal|error|bash|CONFLICT|Automatic merge failed| ! \[rejected\])/m.test(res) ? 't-err' : ''}">${colorize(esc(res))}</span>\n`);
      out.scrollTop = out.scrollHeight;
    };
    const colorize = (s) => s.replace(/^(\t(?:modified|new file|deleted|renamed|both modified):.*)$/gm, (m) => `<span class="${/both/.test(m) ? 't-err' : ''}">${m}</span>`)
      .replace(/^(\+(?!\+\+).*)$/gm, '<span class="t-add">$1</span>').replace(/^(-(?!--).*)$/gm, '<span class="t-del">$1</span>');
    const promptText = () => `~${sim.cwd ? '/' + sim.cwd.split('/').slice(-2).join('/') : ''}${sim.repo && sim.inRepo(sim.cwd) ? ` (${sim.repo.merge ? sim.repo.head + '|MERGING' : sim.repo.head})` : ''} $ `;
    const refresh = () => {
      prompt.textContent = promptText();
      el.querySelector('[data-panel="graph"]').innerHTML = graphSvg(sim, esc);
      el.querySelector('[data-panel="files"]').innerHTML = filesPanel(sim, esc);
      if (cfg.goals) {
        const api = sim.api();
        el.querySelector('.git-goals').innerHTML = cfg.goals.map((g) => { let ok = false; try { ok = !!g.test(api); } catch {} return `<li class="${ok ? 'met' : ''}">${g.text}</li>`; }).join('');
      }
    };
    const openEditor = (path) => {
      editing = path;
      editor.hidden = false;
      editor.querySelector('.file-name').textContent = `Editando ${path}`;
      const ta = editor.querySelector('textarea');
      ta.value = sim.fs[path] ?? '';
      ta.focus();
    };
    const reset = () => {
      sim = new GitSim(preset);
      out.innerHTML = '';
      editor.hidden = true;
      print(null, cfg.welcome || 'Terminal lista. Escribí help para ver los comandos.');
      refresh();
    };
    el.querySelector('.term-in').addEventListener('submit', (e) => {
      e.preventDefault();
      const cmd = input.value;
      input.value = '';
      if (cmd.trim()) { hist.push(cmd); hi = hist.length; }
      let res;
      try { res = sim.run(cmd); } catch (err) { res = `error interno del simulador: ${err.message}`; console.error(err); }
      if (res && res.clear) { out.innerHTML = ''; refresh(); return; }
      if (res && res.edit) { print(cmd, ''); openEditor(res.edit); refresh(); return; }
      print(cmd, res);
      // Evento del escenario: un compañero sube cambios después de tu primer push
      if (preset.teammate && /^git push/.test(cmd.trim()) && !/rejected|fatal/.test(res) && preset.teammate(sim)) print(null, '(Mientras tanto, Sofía subió un commit a development desde su computadora. Probá git fetch o git pull.)');
      refresh();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' && hi > 0) { input.value = hist[--hi]; e.preventDefault(); }
      if (e.key === 'ArrowDown') { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; e.preventDefault(); }
    });
    el.querySelector('.git-tabs').addEventListener('click', (e) => {
      const b = e.target.closest('[data-tab]');
      if (!b) return;
      el.querySelectorAll('.git-tabs button').forEach((x) => x.setAttribute('aria-selected', x === b));
      el.querySelectorAll('.git-panel').forEach((p) => (p.hidden = p.dataset.panel !== b.dataset.tab));
    });
    el.querySelector('[data-panel="files"]').addEventListener('click', (e) => { const b = e.target.closest('[data-file]'); if (b) openEditor(b.dataset.file); });
    editor.querySelector('[data-act="save"]').addEventListener('click', () => { sim.fs[editing] = editor.querySelector('textarea').value.replace(/\n$/, ''); editor.hidden = true; print(null, `(guardado ${editing})`); refresh(); input.focus(); });
    editor.querySelector('[data-act="close"]').addEventListener('click', () => { editor.hidden = true; input.focus(); });
    el.querySelector('[data-act="reset"]').addEventListener('click', reset);
    el.querySelector('.term').addEventListener('click', (e) => { if (!window.getSelection().toString() && e.target.closest('.term-out')) input.focus({ preventScroll: true }); });
    reset();
  };

  window.GUIDE.GitSim = GitSim;
  window.GUIDE.GitSim.SCENARIOS = SCENARIOS;
  window.GUIDE.GitSim.isIgnored = (p, text) => isIgnored(p, compileIgnore(text));
})();
