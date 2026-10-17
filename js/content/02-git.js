/* Módulo: Control de versiones con Git (Unidad 1, Pro Git caps. 1-3, 5 y 6) */
(() => {
  const { code, table, note, lab, fig, sol, flow } = window.GUIDE.h;

  window.GUIDE.LESSONS.push(
    {
      id: 'git-fundamentos',
      module: 'git',
      title: 'Qué es el control de versiones',
      keywords: 'git vcs control de versiones local centralizado distribuido snapshot instantanea sha-1 hash tres estados modificado preparado confirmado staging area directorio de trabajo config instalacion',
      tldr: 'Un sistema de control de versiones guarda la historia de tus archivos para que puedas volver atrás, ver quién cambió qué y trabajar en equipo sin pisarte. Git es <mark>distribuido</mark>: cada copia es un repositorio completo.',
      goals: [
        'Comparar los sistemas de control de versiones locales, centralizados y distribuidos.',
        'Explicar cómo guarda Git la información: instantáneas y no diferencias.',
        'Nombrar los tres estados de un archivo y las tres secciones de un proyecto Git.',
        'Configurar tu identidad respetando la consigna del laboratorio.',
      ],
      body: `
        <h2>Por qué versionar</h2>
        <p>Sin control de versiones, el historial de un proyecto termina siendo una carpeta con <code>Trabajo_final.cs</code>, <code>Trabajo_final_v2.cs</code> y <code>Trabajo_final_AHORA_SI.cs</code>. Un <mark>sistema de control de versiones</mark> (VCS) registra los cambios de un conjunto de archivos a lo largo del tiempo para que puedas recuperar versiones específicas, comparar cambios, ver quién modificó algo que está fallando y deshacer errores sin perder trabajo.</p>

        <h2>Tres generaciones de sistemas</h2>
        ${table(['Tipo', 'Cómo funciona', 'Problema'], [
          ['Local', 'Una base de datos simple en tu computadora guarda los cambios de los archivos (por ejemplo, RCS).', 'No sirve para colaborar con otras personas.'],
          ['Centralizado (CVCS)', 'Un único servidor guarda todas las versiones y los clientes descargan archivos de ahí (CVS, Subversion).', 'Es un punto único de falla: si el servidor cae, nadie puede trabajar; si se pierde el disco, se pierde la historia.'],
          ['Distribuido (DVCS)', 'Cada cliente replica el repositorio completo con toda su historia (Git, Mercurial).', 'Ninguno grave: cualquier copia puede restaurar el servidor.'],
        ])}

        <h2>Cómo piensa Git</h2>
        <h3>Instantáneas, no diferencias</h3>
        <p>La mayoría de los sistemas anteriores guardaban, para cada archivo, la lista de cambios respecto de la versión anterior. Git piensa distinto: cada vez que confirmás, toma una <strong>instantánea</strong> (snapshot) de cómo se ven todos tus archivos en ese momento. Si un archivo no cambió, no lo vuelve a guardar: apunta a la versión idéntica anterior.</p>
        <h3>Casi todo es local</h3>
        <p>Como tenés la historia completa en tu disco, ver el log, comparar versiones o confirmar cambios es instantáneo y funciona sin conexión.</p>
        <h3>Integridad</h3>
        <p>Todo se verifica con una suma de comprobación (<strong>hash SHA-1</strong>) antes de guardarse, y se referencia por ese hash: una cadena de 40 caracteres hexadecimales como <code>24b9da6552252987aa493b52f8696cd6d3b00373</code>. Es imposible cambiar un archivo sin que Git lo sepa. En el día a día vas a ver los primeros 7 caracteres: <code>24b9da6</code>.</p>

        <h2>Los tres estados</h2>
        <p>Esto es lo más importante para entender Git. Un archivo rastreado puede estar en tres estados:</p>
        ${table(['Estado', 'Significa'], [
          ['<strong>Modificado</strong> (modified)', 'Cambiaste el archivo pero todavía no lo confirmaste.'],
          ['<strong>Preparado</strong> (staged)', 'Marcaste el archivo modificado para que vaya en la próxima confirmación.'],
          ['<strong>Confirmado</strong> (committed)', 'Los datos están almacenados de forma segura en tu base de datos local.'],
        ])}
        <p>Eso da lugar a las tres secciones de un proyecto Git:</p>
        ${fig(`<svg viewBox="0 0 620 210" width="620" role="img" aria-label="Directorio de trabajo, área de preparación y repositorio">
          <rect class="box" x="10" y="20" width="170" height="150" rx="10"/><text x="95" y="48" text-anchor="middle" font-weight="700" font-size="14">Directorio de trabajo</text><text x="95" y="70" text-anchor="middle" font-size="12" class="muted">Los archivos que editás</text>
          <rect class="box" x="225" y="20" width="170" height="150" rx="10"/><text x="310" y="48" text-anchor="middle" font-weight="700" font-size="14">Área de preparación</text><text x="310" y="70" text-anchor="middle" font-size="12" class="muted">(staging area o índice)</text><text x="310" y="88" text-anchor="middle" font-size="12" class="muted">Lo que irá en el commit</text>
          <rect class="box-a" x="440" y="20" width="170" height="150" rx="10"/><text x="525" y="48" text-anchor="middle" font-weight="700" font-size="14">Repositorio (.git)</text><text x="525" y="70" text-anchor="middle" font-size="12" class="muted">La historia confirmada</text>
          <path class="stroke-a" d="M180 112 H220" stroke-width="2"/><path class="fill-a" d="M225 112 l-9 -5 v10 z"/><text x="202" y="104" text-anchor="middle" font-size="11">git add</text>
          <path class="stroke-a" d="M395 112 H435" stroke-width="2"/><path class="fill-a" d="M440 112 l-9 -5 v10 z"/><text x="417" y="104" text-anchor="middle" font-size="11">git commit</text>
          <path class="stroke" d="M525 170 V192 H95 V176" stroke-width="1.5" stroke-dasharray="4 3"/><path class="fill-a" d="M95 172 l-5 9 h10 z"/><text x="310" y="205" text-anchor="middle" font-size="11">git checkout / git switch / git restore</text>
        </svg>`, 'El flujo básico: modificás en el directorio de trabajo, preparás con git add y confirmás con git commit.')}
        ${flow('Modificás archivos', 'Preparás los que querés incluir (git add)', 'Confirmás: Git guarda la instantánea preparada (git commit)')}

        <h2>Configurar Git por primera vez</h2>
        <p>Cada commit registra quién lo hizo, así que lo primero es decirle a Git tu nombre y correo. El comando <code>git config</code> trabaja en tres niveles:</p>
        ${table(['Opción', 'Alcance', 'Dónde se guarda'], [
          ['<code>--system</code>', 'Todos los usuarios de la computadora', '<code>/etc/gitconfig</code>'],
          ['<code>--global</code>', 'Tu usuario, en todos tus repositorios', '<code>~/.gitconfig</code>'],
          ['(sin opción)', 'Solo el repositorio actual', '<code>.git/config</code>'],
        ])}
        ${code('bash', `# En tu computadora personal (una sola vez)
git config --global user.name "Ana Pérez"
git config --global user.email ana.perez@frt.utn.edu.ar

# En las computadoras del laboratorio: SIN --global ni --system, dentro de cada repositorio
git config user.name "Ana Pérez"
git config user.email ana.perez@frt.utn.edu.ar

git config --list        # ver la configuración
git help config          # ayuda de cualquier comando`)}
        ${note('Consigna de la cátedra: en las computadoras del laboratorio no se usa <code>git config</code> con <code>--system</code> ni <code>--global</code>, porque las comparten varios estudiantes y tus commits quedarían firmados con el nombre de otra persona.', 'warn')}
        ${note('Directorio de trabajo en el laboratorio: usá la estructura <code>$legajo/$ejercicio</code>, por ejemplo <code>51234/EJ02</code>.', '')}
      `,
      quiz: [
        { q: '¿Cuál es la principal desventaja de un sistema de control de versiones centralizado?', o: ['No permite trabajar en equipo.', 'El servidor es un punto único de falla.', 'No guarda la historia.', 'Solo funciona con archivos de texto.'], a: 1, e: 'Si el servidor central cae o pierde su disco, todos quedan sin historia.' },
        { q: '¿Cómo guarda Git la información de cada confirmación?', o: ['Como una lista de diferencias respecto de la versión anterior.', 'Como una instantánea del estado de todos los archivos.', 'Como un archivo zip por commit.', 'Solo guarda el último estado.'], a: 1, e: 'Git piensa en instantáneas; los archivos sin cambios se referencian, no se duplican.' },
        { q: 'Modificaste <code>Program.cs</code> y ejecutaste <code>git add Program.cs</code>. ¿En qué estado está?', o: ['Modificado', 'Preparado (staged)', 'Confirmado', 'Ignorado'], a: 1, e: 'git add lo pasa al área de preparación; recién con git commit queda confirmado.' },
        { q: 'En una computadora del laboratorio, ¿cómo configurás tu nombre?', o: ['<code>git config --global user.name "Ana"</code>', '<code>git config --system user.name "Ana"</code>', '<code>git config user.name "Ana"</code> dentro del repositorio', 'No hace falta configurarlo.'], a: 2, e: 'Sin opciones, la configuración queda solo en ese repositorio (.git/config).' },
        { q: '¿Para qué usa Git el hash SHA-1?', o: ['Para comprimir los archivos.', 'Para garantizar la integridad e identificar cada objeto.', 'Para cifrar el repositorio.', 'Para numerar las ramas.'], a: 1, e: 'Todo se verifica con su suma de comprobación: no se puede cambiar nada sin que Git lo detecte.' },
        { q: '¿Por qué en Git casi todas las operaciones son rápidas y funcionan sin internet?', o: ['Porque usan un servidor muy veloz.', 'Porque cada copia tiene la historia completa del proyecto en el disco local.', 'Porque Git no guarda historia.', 'Porque los archivos se guardan en la nube.'], a: 1, e: 'Es un sistema distribuido: la base de datos completa está en tu máquina.' },
      ],
      sources: [
        { title: 'Pro Git, 2ª ed.', ref: 'Chacon y Straub, cap. 1', points: ['Historia del control de versiones: local, centralizado y distribuido.', 'Fundamentos de Git: instantáneas, operaciones locales, integridad, tres estados.', 'Configuración inicial: niveles system, global y local; identidad; ayuda.'] },
        { title: 'Sitio oficial de Git', url: 'https://git-scm.com/', points: ['Descargas para cada sistema operativo.', 'Documentación de referencia de cada comando (<code>git help &lt;comando&gt;</code> muestra la misma).', 'El libro Pro Git completo y gratuito.'] },
      ],
    },

    {
      id: 'git-basico',
      module: 'git',
      title: 'Git básico: del primer commit al historial',
      keywords: 'git init clone status add commit gitignore ignorar diff staged rm cached mv renombrar log oneline graph restore amend deshacer',
      tldr: 'El ciclo de todos los días: <code>git status</code> para ver qué cambió, <code>git add</code> para preparar, <code>git commit</code> para confirmar y <code>git log</code> para mirar la historia. Con <code>.gitignore</code> le decís a Git qué archivos no rastrear nunca.',
      goals: [
        'Crear o clonar un repositorio y registrar cambios con el ciclo status, add y commit.',
        'Escribir un .gitignore con comodines, carpetas y excepciones.',
        'Ver diferencias, borrar y renombrar archivos con Git, y deshacer cambios.',
        'Resolver el EJ02 completo.',
      ],
      body: `
        <h2>Obtener un repositorio</h2>
        <p>Hay dos formas:</p>
        ${code('bash', `# 1. Convertir una carpeta existente en repositorio
cd EJ02/Parte2
git init                      # crea la carpeta oculta .git

# 2. Clonar un repositorio remoto (trae toda la historia)
git clone https://github.com/dsw-frt-utn/dsw2026-ej02
git clone https://github.com/dsw-frt-utn/dsw2026-ej02 otro-nombre   # en otra carpeta`)}

        <h2>El ciclo de vida de un archivo</h2>
        <p>Cada archivo de tu directorio está <strong>rastreado</strong> (tracked: Git lo conocía en la última instantánea) o <strong>sin rastrear</strong> (untracked). Los rastreados pueden estar sin modificar, modificados o preparados.</p>
        ${code('bash', `git status                 # estado detallado
git status -s              # versión corta:
#  ?? nuevo.txt            sin rastrear
#  A  agregado.txt         nuevo y preparado
#   M modificado.txt       modificado sin preparar
#  M  preparado.txt        modificado y preparado
#  MM ambos.txt            preparado y vuelto a modificar`)}
        <p><code>git add</code> sirve para varias cosas: empezar a rastrear archivos nuevos, preparar archivos modificados y marcar conflictos como resueltos. Pensalo como “agregá este contenido a la próxima confirmación”.</p>
        ${note('Si modificás un archivo después de hacer <code>git add</code>, aparece dos veces en <code>git status</code>: preparado (la versión de cuando hiciste add) y modificado (lo nuevo). Si confirmás ahora, va la versión preparada. Tenés que volver a hacer <code>git add</code>.', 'warn')}

        <h2>Ignorar archivos: .gitignore</h2>
        <p>Siempre hay archivos que no querés en el repositorio: compilados (<code>bin/</code>, <code>obj/</code>), temporales, configuraciones locales. Se listan en un archivo <code>.gitignore</code> con estas reglas:</p>
        ${table(['Regla', 'Ejemplo', 'Efecto'], [
          ['Líneas en blanco o que empiezan con <code>#</code> se ignoran', '<code># comentario</code>', 'Sirven para comentar'],
          ['Patrones glob estándar', '<code>*.vsp</code>', 'Todos los archivos que terminan en .vsp, en cualquier carpeta'],
          ['Terminar con <code>/</code> indica una carpeta', '<code>bin/</code>', 'La carpeta bin y todo su contenido, en cualquier nivel'],
          ['Empezar con <code>/</code> evita la recursividad', '<code>/TODO</code>', 'Solo el TODO de la raíz'],
          ['Empezar con <code>!</code> niega el patrón', '<code>!importante.log</code>', 'Vuelve a incluir un archivo excluido antes'],
          ['<code>[abc]</code> coincide con un carácter del conjunto', '<code>[Tt]emp/</code>', 'temp/ o Temp/'],
          ['<code>?</code> coincide con un carácter', '<code>doc?.txt</code>', 'doc1.txt, docA.txt'],
          ['<code>**</code> coincide con carpetas anidadas', '<code>a/**/z</code>', 'a/z, a/b/z, a/b/c/z'],
          ['<code>\\</code> escapa un carácter especial', '<code>\\#trash*</code>', 'Archivos que empiezan con #'],
        ])}
        ${note('La trampa del EJ02: los archivos que empiezan con <code>#</code>. Una línea <code>#trash*</code> es un <strong>comentario</strong> y no ignora nada. Hay que escaparla: <code>\\#trash*</code>. Lo mismo para la excepción: <code>!\\#trash.gb</code>. Y ojo: si ignorás una carpeta entera, no podés volver a incluir un archivo de adentro con <code>!</code>.', 'exam')}
        ${lab(1)}
        ${note('El <code>.gitignore</code> solo afecta a archivos <em>sin rastrear</em>. Si un archivo ya estaba confirmado, agregarlo al .gitignore no lo saca del repositorio: hay que hacer <code>git rm --cached archivo</code>.', 'tip')}

        <h2>Ver los cambios: git diff</h2>
        ${code('bash', `git diff              # directorio de trabajo vs área de preparación (lo que NO preparaste)
git diff --staged     # área de preparación vs último commit (lo que VA a confirmarse)
git diff --cached     # sinónimo de --staged`)}
        <p>Las líneas que empiezan con <code>-</code> se borraron y las que empiezan con <code>+</code> se agregaron.</p>

        <h2>Confirmar: git commit</h2>
        ${code('bash', `git commit                          # abre el editor para escribir el mensaje
git commit -m "Agrega clase Marca"  # mensaje en la misma línea
git commit -a -m "Corrige consumo"  # prepara automáticamente los archivos RASTREADOS modificados y confirma`)}
        <p><code>-a</code> te ahorra el <code>git add</code>, pero solo para archivos que Git ya conocía: los nuevos siguen necesitando <code>git add</code>.</p>

        <h2>Borrar y renombrar</h2>
        ${code('bash', `# Borrar: del disco Y del área de preparación
git rm docs/design/design.txt

# Dejar de rastrear pero conservar el archivo en el disco
git rm --cached config.local.json

# Renombrar (forma abreviada)
git mv code/data/script.sql code/data/script_2026.sql
# equivale a:
#   mv code/data/script.sql code/data/script_2026.sql
#   git rm code/data/script.sql
#   git add code/data/script_2026.sql`)}
        <p>Si borrás un archivo solo con <code>rm</code> (sin Git), aparece en <code>git status</code> como “Changes not staged for commit: deleted”. Tenés que preparar el borrado con <code>git rm</code> o <code>git add</code>.</p>

        <h2>Ver la historia: git log</h2>
        ${code('bash', `git log                    # historial completo: hash, autor, fecha y mensaje
git log --oneline          # una línea por commit
git log -p -2              # los 2 últimos con sus diferencias
git log --stat             # cuántas líneas cambió cada archivo
git log --oneline --graph --all   # grafo de todas las ramas
git log --author="Ana" --since=2.weeks`)}

        <h2>Deshacer cosas</h2>
        ${table(['Querés…', 'Comando'], [
          ['Rehacer el último commit (cambiar el mensaje o agregar un archivo olvidado)', '<code>git commit --amend</code>'],
          ['Sacar un archivo del área de preparación (sin perder los cambios)', '<code>git restore --staged archivo</code> (antes: <code>git reset HEAD archivo</code>)'],
          ['Descartar los cambios del directorio de trabajo (volver a lo preparado o confirmado)', '<code>git restore archivo</code> (antes: <code>git checkout -- archivo</code>)'],
        ])}
        ${note('<code>git restore archivo</code> es peligroso: los cambios locales descartados no se pueden recuperar, porque nunca se confirmaron.', 'warn')}

        <h2>Practicá en la terminal</h2>
        <p>Esta terminal simula Git y bash: los comandos y los mensajes son los reales. Hacé la Parte 2 del EJ02.</p>
        ${lab(0)}
        <h2>Trabajar con remotos (primer contacto)</h2>
        <p>Los remotos son versiones de tu proyecto alojadas en otro lado (GitHub). Al clonar, Git llama <code>origin</code> al remoto. Los vas a usar a fondo en las próximas lecciones:</p>
        ${code('bash', `git remote -v              # ver remotos
git fetch origin           # traer lo nuevo del remoto (no toca tu trabajo)
git pull                   # fetch + merge de la rama que seguís
git push origin main       # subir tus commits`)}
      `,
      labs: [
        {
          type: 'git',
          title: 'Tu primer repositorio (EJ02, parte 2)',
          scenario: 'blank',
          intro: 'Estás en <code>~/EJ02</code>. Seguí los objetivos; se marcan solos a medida que los cumplís.',
          goals: [
            { text: 'Crear la carpeta Parte2 y entrar en ella', test: (r) => r.cwd() === 'EJ02/Parte2' || r.inited && r.sim.repo.root === 'EJ02/Parte2' },
            { text: 'Crear el archivo HolaDesarrolloDeSoftware.txt', test: (r) => r.file('EJ02/Parte2/HolaDesarrolloDeSoftware.txt') !== undefined },
            { text: 'Iniciar un repositorio Git en Parte2', test: (r) => r.inited && r.sim.repo.root === 'EJ02/Parte2' },
            { text: 'Preparar el archivo (staging area)', test: (r) => r.inited && ('HolaDesarrolloDeSoftware.txt' in r.sim.repo.index) },
            { text: 'Confirmar el archivo con un mensaje', test: (r) => r.commits() >= 1 && 'HolaDesarrolloDeSoftware.txt' in r.tree() },
          ],
          hint: 'mkdir Parte2\ncd Parte2\ntouch HolaDesarrolloDeSoftware.txt\ngit init\ngit status\ngit add HolaDesarrolloDeSoftware.txt\ngit status\ngit config user.name "Tu Nombre"\ngit config user.email tu@correo.com\ngit commit -m "Primer commit"\ngit log',
        },
        {
          type: 'classify',
          title: '¿Lo ignora este .gitignore?',
          intro: 'Con este .gitignore: <code>\\#trash*</code>, <code>!\\#trash.gb</code>, <code>[Tt]emp/</code>, <code>bin/</code>, <code>*.vsp</code>. Decidí qué pasa con cada archivo.',
          buckets: ['Ignorado', 'Se rastrea'],
          items: [
            { t: '<code>rb/#trash1.tr</code>', b: 0, why: 'Coincide con \\#trash* en cualquier carpeta.' },
            { t: '<code>#trash.gb</code>', b: 1, why: 'La excepción !\\#trash.gb lo vuelve a incluir.' },
            { t: '<code>docs/design/Temp/tempd.txt</code>', b: 0, why: '[Tt]emp/ ignora la carpeta Temp en cualquier nivel.' },
            { t: '<code>code/bin/library.dll</code>', b: 0, why: 'Está dentro de una carpeta bin.' },
            { t: '<code>docs/analysis/main.vsp</code>', b: 0, why: '*.vsp coincide en cualquier carpeta.' },
            { t: '<code>rb/config</code>', b: 1, why: 'No coincide con ningún patrón.' },
            { t: '<code>code/data/script.sql</code>', b: 1, why: 'No coincide con ningún patrón.' },
          ],
        },
        {
          type: 'git',
          title: 'EJ02, parte 3',
          scenario: 'ej02',
          intro: 'Estás en <code>~/EJ02/Parte3</code> con el zip del ejercicio. El remoto existe de verdad en el simulador.',
          goals: [
            { text: 'Clonar dsw2026-ej02 y entrar a la carpeta', test: (r) => r.inited },
            { text: 'Descomprimir el zip dentro del repositorio', test: (r) => r.file('EJ02/Parte3/dsw2026-ej02/rb/config') !== undefined },
            { text: 'Ignorar #trash* (salvo #trash.gb), temp/Temp, bin y *.vsp', test: (r) => r.ignored('rb/#trash1.tr') && !r.ignored('#trash.gb') && r.ignored('docs/design/Temp/tempd.txt') && r.ignored('temp/temp.txt') && r.ignored('code/bin/library.dll') && r.ignored('seg.vsp') && !r.ignored('rb/config') },
            { text: 'Confirmar los archivos (sin los ignorados)', test: (r) => '#trash.gb' in r.tree() && 'rb/config' in r.tree() && !('seg.vsp' in r.tree()) },
            { text: 'Confirmar analysis.txt sin su último párrafo', test: (r) => { const t = r.tree()['docs/analysis/analysis.txt']; return t !== undefined && !/Pellentesque/.test(t); } },
            { text: 'Borrar design.txt y recuperarlo del área de preparación y del disco', test: (r) => r.file('EJ02/Parte3/dsw2026-ej02/docs/design/design.txt') !== undefined && r.sim.repo && r.sim.repo.order.length >= 3 },
            { text: 'Renombrar script.sql a script_2026.sql con git mv y confirmar', test: (r) => 'code/data/script_2026.sql' in r.tree() && !('code/data/script.sql' in r.tree()) },
          ],
          hint: 'Ver la solución del ejercicio, más abajo.',
        },
      ],
      exercises: [
        {
          official: 'N° 2',
          level: 1,
          title: 'Control de versiones: .gitignore, diff, rm, restore y mv',
          prompt: `<p>Hacé la Parte 3 del EJ02 en la terminal de abajo. El repositorio remoto y el zip ya están preparados.</p>
            <ol>
              <li>En <code>~/EJ02/Parte3</code>, clonar <code>https://github.com/dsw-frt-utn/dsw2026-ej02</code>.</li>
              <li>Descomprimir <code>DSW2026_EJ02.zip</code> dentro de la carpeta clonada.</li>
              <li>Revisar el estado.</li>
              <li>Editar el <code>.gitignore</code> para ignorar: los archivos que empiezan con <code>#trash</code> excepto <code>#trash.gb</code>; las carpetas <code>temp</code> o <code>Temp</code>; la carpeta <code>bin</code>; los archivos <code>.vsp</code>.</li>
              <li>Preparar y confirmar.</li>
              <li>Eliminar el último párrafo de <code>docs/analysis/analysis.txt</code>, revisar las diferencias, preparar y confirmar.</li>
              <li>Eliminar <code>docs/design/design.txt</code> primero del sistema de archivos y luego desde Git.</li>
              <li>Recuperarlo del área de preparación y luego del sistema de archivos.</li>
              <li>Renombrar <code>code/data/script.sql</code> a <code>script_2026.sql</code> de forma abreviada y confirmar.</li>
              <li>Listar los commits.</li>
            </ol>
            ${lab(2)}`,
          hints: ['Para descomprimir: <code>unzip ../DSW2026_EJ02.zip -d .</code> estando dentro de la carpeta clonada.', 'Para editar un archivo: <code>nano .gitignore</code> o clic en el archivo en la pestaña Archivos.', 'Recordá escapar el <code>#</code> en el .gitignore.', 'Este repositorio pide identidad: <code>git config user.name</code> y <code>user.email</code>.'],
          solution: sol(`<p>La clave está en el .gitignore (el <code>#</code> escapado) y en el orden de las recuperaciones: primero se saca el borrado del área de preparación (<code>restore --staged</code>), con lo que el archivo vuelve a figurar como “borrado sin preparar”, y después se lo recupera del último commit (<code>restore</code>).</p>`, [
            ['.gitignore', 'text', '\\#trash*\n!\\#trash.gb\n[Tt]emp/\nbin/\n*.vsp'],
            ['Comandos', 'bash', `git clone https://github.com/dsw-frt-utn/dsw2026-ej02
cd dsw2026-ej02
unzip ../DSW2026_EJ02.zip -d .
git status
nano .gitignore                 # escribir las reglas de arriba
git status                      # ya no aparecen los ignorados
git config user.name "Tu Nombre"
git config user.email tu@correo.com
git add .
git commit -m "Agrega archivos del ejercicio y reglas de .gitignore"
nano docs/analysis/analysis.txt # borrar el último párrafo
git diff
git add docs/analysis/analysis.txt
git commit -m "Elimina el último párrafo del análisis"
rm docs/design/design.txt
git rm docs/design/design.txt
git restore --staged docs/design/design.txt
git restore docs/design/design.txt
git mv code/data/script.sql code/data/script_2026.sql
git commit -m "Renombra script.sql a script_2026.sql"
git log --oneline`],
          ]),
        },
      ],
      quiz: [
        { q: '¿Qué hace <code>git add</code>?', o: ['Sube los cambios a GitHub.', 'Agrega el contenido a la próxima confirmación (lo prepara).', 'Crea un commit.', 'Crea una rama.'], a: 1, e: 'Prepara: empieza a rastrear archivos nuevos o pasa cambios al área de preparación.' },
        { q: 'Un .gitignore tiene la línea <code>#trash*</code>. ¿Qué ignora?', o: ['Los archivos que empiezan con #trash.', 'Nada: es un comentario.', 'La carpeta trash.', 'Los archivos .trash.'], a: 1, e: 'Las líneas que empiezan con # son comentarios. Hay que escribir \\#trash*.' },
        { q: '¿Qué muestra <code>git diff --staged</code>?', o: ['Lo modificado que todavía no preparaste.', 'Lo preparado comparado con el último commit.', 'El historial.', 'Las diferencias con el remoto.'], a: 1, e: '--staged (o --cached) compara el área de preparación con el último commit.' },
        { q: 'Querés dejar de rastrear <code>appsettings.Development.json</code> pero conservarlo en tu disco. Usás…', o: ['<code>git rm appsettings.Development.json</code>', '<code>git rm --cached appsettings.Development.json</code>', '<code>rm appsettings.Development.json</code>', '<code>git restore appsettings.Development.json</code>'], a: 1, e: '--cached lo saca del índice sin borrarlo del directorio de trabajo.' },
        { q: '<code>git commit -a -m "msg"</code> con un archivo nuevo que nunca agregaste…', o: ['…lo incluye en el commit.', '…no lo incluye: -a solo prepara archivos ya rastreados.', '…da error.', '…lo borra.'], a: 1, e: 'Los archivos sin rastrear siempre necesitan git add.' },
        { q: 'Hiciste <code>git add Program.cs</code> por error. ¿Cómo lo sacás del área de preparación sin perder los cambios?', o: ['<code>git restore Program.cs</code>', '<code>git restore --staged Program.cs</code>', '<code>git rm Program.cs</code>', '<code>git commit --amend</code>'], a: 1, e: 'restore --staged lo devuelve a modificado; restore a secas descartaría los cambios.' },
        { q: '¿Qué hace <code>git commit --amend</code>?', o: ['Crea una rama nueva.', 'Reemplaza el último commit por uno nuevo con lo preparado y/o otro mensaje.', 'Deshace todos los commits.', 'Sube el commit al remoto.'], a: 1, e: 'Sirve para corregir el último commit (mensaje o un archivo olvidado).' },
        { q: 'Agregaste <code>bin/</code> al .gitignore, pero la carpeta bin ya estaba confirmada. ¿Qué pasa?', o: ['Git la borra del repositorio automáticamente.', 'Git la sigue rastreando: el .gitignore solo afecta archivos sin rastrear.', 'Git da un error.', 'La carpeta desaparece del disco.'], a: 1, e: 'Hay que sacarla del índice con git rm -r --cached bin.' },
      ],
      sources: [
        { title: 'Pro Git, 2ª ed.', ref: 'Chacon y Straub, cap. 2 (sin etiquetado)', points: ['Obtener un repositorio: git init y git clone.', 'Guardar cambios: status, add, .gitignore, diff, commit, rm, mv.', 'Ver el historial con git log y sus opciones.', 'Deshacer cosas: --amend, restore --staged, restore.', 'Trabajar con remotos: remote, fetch, pull, push.'] },
        { title: 'Documentación de gitignore', url: 'https://git-scm.com/docs/gitignore', points: ['Formato de los patrones y precedencia de las reglas.', 'Una barra al final indica carpeta; \\ escapa # y ! al inicio.', 'No es posible volver a incluir un archivo si su carpeta padre está excluida.'] },
      ],
    },

    {
      id: 'git-ramas',
      module: 'git',
      title: 'Ramas, fusiones y conflictos',
      keywords: 'git branch rama head switch checkout merge fusion fast-forward avance rapido tres vias conflicto resolver ramas remotas origin tracking seguimiento fetch pull push rebase flujo largo plazo feature bugfix development',
      tldr: 'Una rama es solo un <mark>puntero móvil a un commit</mark>. Crearla es instantáneo, por eso en Git se trabaja con ramas todo el tiempo: una para cada funcionalidad o corrección, que después se fusiona.',
      goals: [
        'Explicar qué es una rama y qué es HEAD.',
        'Crear, cambiar, fusionar y borrar ramas.',
        'Distinguir una fusión fast-forward de una de tres vías.',
        'Resolver un conflicto de fusión.',
        'Trabajar con ramas remotas y de seguimiento.',
      ],
      body: `
        <h2>Qué es una rama</h2>
        <p>Cada commit guarda un puntero a la instantánea y a su commit padre (o padres, si es una fusión). Una <strong>rama</strong> no es una copia de los archivos: es un archivo de 41 bytes con el hash de un commit. Cuando confirmás, la rama en la que estás avanza sola al nuevo commit.</p>
        <p>¿Cómo sabe Git en qué rama estás? Con un puntero especial, <strong>HEAD</strong>, que apunta a la rama actual.</p>
        ${code('bash', `git branch development           # crea la rama (HEAD no se mueve)
git switch development           # cambia a la rama (antes: git checkout development)
git switch -c bugfix/consumos    # crea Y cambia (antes: git checkout -b bugfix/consumos)
git branch                       # lista las ramas; * marca la actual
git branch -v                    # con el último commit de cada una
git branch --merged              # las ya fusionadas en la actual
git branch -d bugfix/consumos    # borra una rama ya fusionada`)}
        <p>Al cambiar de rama, Git reemplaza los archivos del directorio de trabajo por la instantánea a la que apunta esa rama. Si tenés cambios sin confirmar que chocarían, no te deja cambiar: confirmalos antes.</p>

        <h2>Fusionar ramas</h2>
        <p>Para incorporar los cambios de una rama en otra, te parás en la que <strong>recibe</strong> y fusionás la otra:</p>
        ${code('bash', `git switch development
git merge bugfix/consumos`)}
        <h3>Avance rápido (fast-forward)</h3>
        <p>Si <code>development</code> no avanzó desde que se creó <code>bugfix/consumos</code>, no hay nada que combinar: Git simplemente mueve el puntero hacia adelante. No crea un commit nuevo.</p>
        <h3>Fusión de tres vías</h3>
        <p>Si las dos ramas avanzaron por separado, Git busca su <strong>ancestro común</strong> y hace una fusión de tres vías (ancestro, una rama, la otra). El resultado es un <strong>commit de fusión</strong> con dos padres.</p>
        ${fig(`<svg viewBox="0 0 600 170" width="600" role="img" aria-label="Fusión de tres vías">
          <g font-size="12">
          <circle cx="40" cy="90" r="9" class="fill-a"/><circle cx="110" cy="90" r="9" class="fill-a"/><circle cx="180" cy="90" r="9" class="fill-a"/>
          <circle cx="260" cy="40" r="9" fill="var(--ok)"/><circle cx="330" cy="40" r="9" fill="var(--ok)"/>
          <circle cx="260" cy="130" r="9" class="fill-a"/>
          <circle cx="420" cy="90" r="11" fill="var(--surface)" stroke="var(--accent)" stroke-width="3"/>
          <path class="stroke-a" d="M49 90 H101 M119 90 H171 M188 86 L252 44 M269 40 H321 M188 94 L252 126 M269 130 L410 94 M339 42 L410 86" stroke-width="2"/>
          <text x="180" y="118" text-anchor="middle">ancestro común</text>
          <text x="330" y="22" text-anchor="middle">bugfix/consumos</text>
          <text x="260" y="158" text-anchor="middle">development</text>
          <text x="420" y="122" text-anchor="middle">commit de fusión</text>
          <text x="420" y="138" text-anchor="middle" class="muted">(dos padres)</text>
          </g></svg>`, 'Las dos ramas avanzaron desde el ancestro común: Git combina las tres versiones y crea un commit de fusión.')}

        <h2>Conflictos</h2>
        <p>Si las dos ramas cambiaron <strong>la misma parte del mismo archivo</strong> de forma diferente, Git no puede decidir solo. Frena la fusión y marca el archivo:</p>
        ${code('text', `<<<<<<< HEAD
public String getNombre() { return nombre; }
=======
public String getDescripcion() { return descripcion; }
>>>>>>> feature/marcas`)}
        <p>Arriba del <code>=======</code> está tu versión (HEAD, la rama en la que estás); abajo, la de la rama que estás fusionando. Para resolver:</p>
        ${flow('git status: ver qué archivos están en conflicto', 'Editar cada archivo: dejar la versión correcta y borrar los marcadores', 'git add archivo: marcar como resuelto', 'git commit: confirmar la fusión')}
        <p>Si te arrepentís, <code>git merge --abort</code> vuelve todo a como estaba antes de fusionar.</p>
        ${lab(0)}

        <h2>Flujos de trabajo con ramas</h2>
        <ul>
          <li><strong>Ramas de largo recorrido:</strong> viven siempre. <code>main</code> tiene solo código estable; <code>development</code> recibe lo que se está integrando y, cuando está estable, se fusiona en main. Así trabaja la cátedra.</li>
          <li><strong>Ramas puntuales (topic branches):</strong> viven poco, una por tarea: <code>feature/marcas</code>, <code>bugfix/calculo-consumos</code>. Se fusionan en development y se borran.</li>
        </ul>

        <h2>Ramas remotas</h2>
        <p>Las <strong>ramas de seguimiento remoto</strong> son referencias al estado de las ramas del remoto la última vez que te comunicaste: <code>origin/main</code>, <code>origin/feature/marcas</code>. No las movés vos: se actualizan con <code>git fetch</code>.</p>
        ${code('bash', `git branch -a                     # ramas locales y remotas
git fetch origin                  # actualiza origin/* (no toca tus ramas)
git switch feature/marcas         # si existe origin/feature/marcas, crea la local que la sigue
git push origin development       # sube tu rama
git push -u origin feature/x      # sube y configura el seguimiento (después alcanza con git push)
git pull                          # fetch + merge de la rama que sigue la actual
git push origin --delete feature/x   # borra la rama del remoto`)}
        ${note('<code>git pull</code> es <code>git fetch</code> seguido de <code>git merge</code>. Si preferís ver qué llegó antes de fusionar, hacé <code>git fetch</code> y después <code>git log --oneline --graph --all</code>.', 'tip')}

        <h2>Reorganizar: rebase</h2>
        <p>La otra forma de integrar cambios es <code>git rebase</code>: toma los commits de tu rama y los vuelve a aplicar, uno por uno, encima de otra. El historial queda lineal, como si hubieras trabajado en serie. La regla de oro: <strong>nunca reorganices commits que ya subiste a un repositorio público</strong> y que otros pueden haber descargado, porque reescribe la historia.</p>
      `,
      labs: [
        {
          type: 'git',
          title: 'Resolver un conflicto',
          scenario: 'conflict',
          intro: 'En <code>main</code> el saludo dice “Hola, Tucumán” y en <code>feature/ingles</code> dice “Hello world”. Fusioná feature/ingles en main y resolvé el conflicto dejando el saludo local.',
          welcome: 'Repositorio demo listo en la rama main. Mirá el historial a la derecha y probá git log --oneline --all.',
          goals: [
            { text: 'Fusionar feature/ingles en main (va a haber conflicto)', test: (r) => r.inMerge() || r.hasMergeCommit('main') },
            { text: 'Editar saludo.txt y quitar los marcadores <<<<<<<, ======= y >>>>>>>', test: (r) => r.hasMergeCommit('main') || (r.inMerge() && !/<<<<<<<|>>>>>>>|=======/.test(r.file('demo/saludo.txt') || '<')) },
            { text: 'Marcar el conflicto como resuelto y confirmar la fusión', test: (r) => r.hasMergeCommit('main') && r.clean() },
            { text: 'Borrar la rama ya fusionada', test: (r) => r.hasMergeCommit('main') && r.branch('feature/ingles') === null },
          ],
          hint: 'git merge feature/ingles\ngit status\nnano saludo.txt        # dejar solo: Hola, Tucumán\ngit add saludo.txt\ngit commit\ngit log --oneline --graph --all\ngit branch -d feature/ingles',
        },
        {
          type: 'git',
          title: 'EJ03 en la terminal',
          scenario: 'ej03',
          intro: 'Estás en <code>~/EJ03</code>. El remoto tiene <code>main</code> y <code>feature/marcas</code>.',
          goals: [
            { text: 'Clonar el repositorio', test: (r) => r.inited },
            { text: 'Crear development y bugfix/consumos', test: (r) => r.branch('development') !== null && r.branch('bugfix/consumos') !== null },
            { text: 'Confirmar una corrección en bugfix/consumos', test: (r) => r.commits('bugfix/consumos') > 2 },
            { text: 'Fusionar bugfix/consumos en development', test: (r) => r.commits('bugfix/consumos') > 2 && r.merged('bugfix/consumos', 'development') },
            { text: 'Agregar y confirmar src/domain/Marca.java en development', test: (r) => 'src/domain/Marca.java' in r.tree('development') },
            { text: 'Fusionar feature/marcas en development resolviendo el conflicto', test: (r) => r.branch('feature/marcas') !== null && r.merged('feature/marcas', 'development') },
          ],
          hint: 'Ver la solución del ejercicio, más abajo.',
        },
      ],
      exercises: [
        {
          official: 'N° 3',
          level: 2,
          title: 'Ramas, fusión y conflicto con una rama remota',
          prompt: `<p>Sobre el código del EJ01 (repositorio <code>https://github.com/dsw-frt-utn/dsw2026-ej03</code>):</p>
            <ol>
              <li>Clonar el repositorio.</li>
              <li>Crear la rama <code>development</code>. Crear y saltar a <code>bugfix/consumos</code>.</li>
              <li>En <code>bugfix/consumos</code>, corregir el cálculo de consumo (alcanza con editar <code>src/domain/VehiculoElectrico.java</code>) y confirmar.</li>
              <li>Fusionar <code>bugfix/consumos</code> en <code>development</code>.</li>
              <li>En <code>development</code>, agregar la clase <code>Marca</code> (nombre y país) en <code>src/domain/Marca.java</code> y confirmar.</li>
              <li>Inspeccionar las ramas remotas y descargar <code>feature/marcas</code>.</li>
              <li>Fusionar <code>feature/marcas</code> en <code>development</code> resolviendo los conflictos a favor de la rama activa.</li>
            </ol>
            ${lab(1)}
            <p class="sec-lede">La Parte 3 (ventana para agregar vehículos y menú principal) es código Java y se resuelve en tu IDE: la vas a rehacer en C# en el EJ14.</p>`,
          hints: ['Si hacés <code>git switch feature/marcas</code> estando en development, Git crea la rama local que sigue a <code>origin/feature/marcas</code>.', 'El conflicto es add/add: las dos ramas crearon Marca.java. “Prevalecen los cambios de la rama activa” significa quedarte con la parte de HEAD.', 'Mirá el contenido remoto de Marca.java: ¡tiene un error! <code>getDescripcion()</code> devuelve <code>nombre</code>, un campo que ya no existe.'],
          solution: sol(`<p>La primera fusión es <strong>fast-forward</strong> (development no había avanzado). La segunda es de <strong>tres vías</strong> con conflicto add/add en <code>Marca.java</code>. Al quedarte con la versión de HEAD, también evitás el error de compilación que traía la rama remota.</p>`, [
            ['Comandos', 'bash', `git clone https://github.com/dsw-frt-utn/dsw2026-ej03
cd dsw2026-ej03
git branch development
git switch -c bugfix/consumos
nano src/domain/VehiculoElectrico.java     # corregir la fórmula
git commit -am "Corrige el cálculo de consumo"
git switch development
git merge bugfix/consumos                  # Fast-forward
nano src/domain/Marca.java                 # clase con nombre y pais
git add src/domain/Marca.java
git commit -m "Agrega la clase Marca"
git branch -a                              # aparece remotes/origin/feature/marcas
git switch feature/marcas                  # la descarga y la sigue
git switch development
git merge feature/marcas                   # CONFLICT (add/add)
nano src/domain/Marca.java                 # dejar la parte de HEAD
git add src/domain/Marca.java
git commit
git log --oneline --graph --all`],
            ['Marca.java (resultado)', 'java', `public class Marca {
    private String nombre;
    private String pais;

    public Marca(String nombre, String pais) {
        this.nombre = nombre;
        this.pais = pais;
    }

    public String getNombre() { return nombre; }
    public String getPais() { return pais; }
}`],
          ]),
        },
      ],
      quiz: [
        { q: '¿Qué es una rama en Git?', o: ['Una copia completa de los archivos del proyecto.', 'Un puntero móvil a un commit.', 'Una carpeta dentro de .git con todos los archivos.', 'Un repositorio remoto.'], a: 1, e: 'Por eso crear ramas es instantáneo y barato.' },
        { q: '¿A qué apunta HEAD normalmente?', o: ['Al primer commit.', 'A la rama en la que estás trabajando.', 'Al remoto origin.', 'Al último commit de main.'], a: 1, e: 'HEAD indica la rama actual; al confirmar, esa rama avanza.' },
        { q: 'Estás en development y ejecutás <code>git merge bugfix/x</code>. development no tuvo commits nuevos desde que se creó bugfix/x. ¿Qué pasa?', o: ['Fusión de tres vías con un commit de fusión.', 'Fast-forward: el puntero de development avanza hasta bugfix/x.', 'Conflicto seguro.', 'Git se niega a fusionar.'], a: 1, e: 'Si no hay trabajo divergente, Git solo mueve el puntero.' },
        { q: 'En un archivo con conflicto, ¿qué hay entre <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> y <code>=======</code>?', o: ['La versión de la rama que estás fusionando.', 'La versión de la rama en la que estás (la actual).', 'La versión del ancestro común.', 'Un comentario de Git.'], a: 1, e: 'Arriba: HEAD (tu rama). Abajo: la rama entrante.' },
        { q: 'Después de editar el archivo en conflicto, ¿cómo le avisás a Git que está resuelto?', o: ['<code>git resolve archivo</code>', '<code>git add archivo</code>', '<code>git merge --continue-all</code>', '<code>git push</code>'], a: 1, e: 'git add marca la resolución; después git commit cierra la fusión.' },
        { q: '<code>git pull</code> equivale a…', o: ['<code>git fetch</code> + <code>git merge</code>', '<code>git push</code> + <code>git fetch</code>', '<code>git clone</code>', '<code>git add .</code> + <code>git commit</code>'], a: 0, e: 'Trae los cambios y los fusiona en la rama actual.' },
        { q: '¿Qué hace <code>git fetch origin</code>?', o: ['Fusiona los cambios remotos en tu rama.', 'Actualiza las ramas de seguimiento remoto (origin/*) sin tocar tu trabajo.', 'Sube tus commits.', 'Borra las ramas remotas.'], a: 1, e: 'Solo descarga; integrar es otro paso.' },
        { q: '¿Cuál es la regla de oro del rebase?', o: ['Siempre hacer rebase antes de un merge.', 'No reorganizar commits que ya publicaste y otros pueden tener.', 'Solo se puede hacer rebase en main.', 'El rebase borra las ramas.'], a: 1, e: 'Rebase reescribe la historia; si otros ya la tienen, les rompe su trabajo.' },
      ],
      sources: [
        { title: 'Pro Git, 2ª ed.', ref: 'Chacon y Straub, cap. 3', points: ['Ramas en pocas palabras: commits, punteros y HEAD.', 'Procedimientos básicos de ramificación y fusión; conflictos.', 'Gestión de ramas y flujos de trabajo (largo recorrido y puntuales).', 'Ramas remotas: seguimiento, push, pull, borrado.', 'Reorganizar el trabajo (rebase) y sus peligros.'] },
      ],
    },

    {
      id: 'git-github',
      module: 'git',
      title: 'Git distribuido y GitHub',
      keywords: 'github pull request pr fork colaborador classroom flujo centralizado gestor de integracion dictador tenientes readme markdown issues commits mensajes equipo',
      tldr: 'En un equipo, cada integrante trabaja en su rama y la propone para integrar con un <mark>pull request</mark> en GitHub, donde se revisa y se fusiona. Así nadie toca main directamente.',
      goals: [
        'Comparar los flujos de trabajo distribuidos: centralizado, gestor de integración y dictador con tenientes.',
        'Escribir buenos mensajes de commit.',
        'Colaborar en GitHub con ramas, pull requests y README en Markdown.',
        'Resolver el EJ04 en equipo.',
      ],
      body: `
        <h2>Flujos de trabajo distribuidos</h2>
        ${table(['Flujo', 'Cómo funciona', 'Para quién'], [
          ['<strong>Centralizado</strong>', 'Un repositorio central donde todos tienen permiso de escritura. Antes de subir hay que integrar lo que subieron los demás (si no, el push se rechaza).', 'Equipos chicos. Es el que usan ustedes en el EJ04.'],
          ['<strong>Gestor de integración</strong>', 'Cada desarrollador tiene su copia pública (fork). Pide al responsable que integre sus cambios en el repositorio oficial.', 'El modelo de GitHub con forks y pull requests.'],
          ['<strong>Dictador y tenientes</strong>', 'Varios gestores de integración (tenientes) se ocupan de partes del proyecto; un dictador benevolente integra lo de los tenientes.', 'Proyectos enormes, como el kernel de Linux.'],
        ])}

        <h2>Contribuir bien</h2>
        <ul>
          <li><strong>Commits pequeños y enfocados:</strong> un commit por cambio lógico. Así son fáciles de revisar y de revertir.</li>
          <li><strong>Sin errores de espacios:</strong> <code>git diff --check</code> los detecta antes de confirmar.</li>
          <li><strong>Mensajes claros:</strong> una primera línea corta (unos 50 caracteres) que resuma el cambio en imperativo, una línea en blanco y, si hace falta, una explicación de qué y por qué.</li>
        </ul>
        ${code('text', `Corrige el cálculo de consumo de vehículos eléctricos

El método no recibía los kilómetros y no sobrescribía al de la
clase base, por lo que siempre devolvía 0. Ahora aplica 16 kWh
cada 100 km y el recargo del 15 % solo si la carga supera 1200 kg.`, 'Un buen mensaje de commit')}
        ${note('Las revisiones del EJ08 marcaron como problema recurrente los commits con comentarios de IA sin revisar y los repositorios vacíos o sin la rama development. El historial también se evalúa.', 'warn')}

        <h2>GitHub</h2>
        <p>GitHub es el servicio de alojamiento de repositorios Git más usado. Suma a Git una capa de colaboración: permisos, revisión de código, issues, Actions y más.</p>
        <h3>Pull requests</h3>
        <p>Un <strong>pull request</strong> (PR) es un pedido para fusionar una rama en otra, con un espacio para discutir y revisar el código antes de hacerlo.</p>
        ${lab(0)}
        <h3>Colaboradores y forks</h3>
        <ul>
          <li>Si el repositorio es tuyo o te agregaron como <strong>colaborador</strong>, podés subir ramas directamente y abrir PRs entre ramas del mismo repo. Es el caso de los repos de GitHub Classroom.</li>
          <li>Si no tenés permiso de escritura, hacés un <strong>fork</strong> (tu copia en tu cuenta), trabajás ahí y abrís un PR hacia el original.</li>
        </ul>
        <h3>GitHub Classroom</h3>
        <p>La cátedra usa GitHub Classroom: al aceptar una asignación se crea un repositorio para vos (o tu grupo) a partir de una plantilla. En los trabajos grupales, el primer integrante crea el grupo con el formato <code>legajo1-legajo2-legajo3</code> y los demás se unen con el mismo link.</p>
        <h3>README.md</h3>
        <p>El README es la portada del repositorio y se escribe en Markdown:</p>
        ${code('text', `# Desarrollo de Software
## Ejercicio N° 4

### Integrantes
| Legajo | Apellido y nombre | GitHub |
|-------:|-------------------|--------|
| 51234  | Pérez, Ana        | ana.perez@frt.utn.edu.ar |
| 52345  | Gómez, Luis       | luisgomez |

- **Negrita**, *cursiva*, \`código\`
- [Enlace](https://git-scm.com)`, 'README.md')}

        <h2>Practicá en equipo</h2>
        <p>Sos el integrante 1 del EJ04. Clonás el repo, trabajás en <code>feature/marcas</code> y la subís. Cuando hagas tu primer push, otra integrante sube un commit a <code>development</code>: vas a tener que traerlo.</p>
        ${lab(1)}
      `,
      labs: [
        {
          type: 'order',
          title: 'El ciclo de un pull request',
          intro: 'Ordená los pasos para proponer un cambio con un pull request en un repositorio donde sos colaborador.',
          items: [
            'Actualizar development con git pull',
            'Crear una rama puntual: git switch -c feature/menu',
            'Hacer los cambios en commits pequeños',
            'Subir la rama: git push -u origin feature/menu',
            'En GitHub, abrir un pull request de feature/menu hacia development',
            'Un compañero revisa, comenta y se corrige lo necesario',
            'Fusionar el pull request y borrar la rama',
          ],
          explain: '<p>Fijate que nadie fusiona su propia rama en development desde la consola: todo pasa por el PR, que queda como registro de qué se integró y quién lo revisó.</p>',
        },
        {
          type: 'git',
          title: 'Trabajo en equipo con un remoto (EJ04)',
          scenario: 'team',
          intro: 'El repo del grupo ya tiene la rama <code>development</code> con el README. Trabajá como integrante 1.',
          goals: [
            { text: 'Clonar el repositorio del grupo', test: (r) => r.inited },
            { text: 'Crear la rama feature/marcas a partir de development', test: (r) => r.branch('feature/marcas') !== null && /Integrantes/.test(r.tree('feature/marcas')['README.md'] || '') },
            { text: 'Agregar Marca.java y confirmarlo en feature/marcas', test: (r) => 'Marca.java' in r.tree('feature/marcas') || Object.keys(r.tree('feature/marcas')).some((p) => p.endsWith('Marca.java')) },
            { text: 'Subir feature/marcas con seguimiento (-u)', test: (r) => r.pushed('feature/marcas') },
            { text: 'Traer a tu development local el commit que subió Sofía', test: (r) => Object.keys(r.tree('development')).some((p) => p.endsWith('Menu.java')) },
          ],
          hint: 'git clone https://github.com/dsw-frt-utn/12345-23456-34567-ej04\ncd 12345-23456-34567-ej04\ngit config user.name "Tu Nombre"\ngit config user.email tu@correo.com\ngit switch development\ngit switch -c feature/marcas\necho "public class Marca { }" > Marca.java\ngit add Marca.java\ngit commit -m "Agrega la clase Marca"\ngit push -u origin feature/marcas\ngit switch development\ngit pull\ngit log --oneline --graph --all',
        },
      ],
      exercises: [
        {
          official: 'N° 4',
          level: 2,
          title: 'Trabajo grupal con GitHub (3 integrantes)',
          prompt: `<p>En grupos de tres, de la misma clase:</p>
            <ol>
              <li>Crear una cuenta de GitHub (preferentemente la institucional) y aceptar la asignación de fundamentos.</li>
              <li>El integrante 1 acepta la asignación del EJ04 y crea el grupo <code>XXXXX-YYYYY-ZZZZZ</code> (legajos). Los demás se unen al mismo grupo.</li>
              <li>El integrante 1, desde GitHub, crea la rama de largo recorrido <code>development</code> basada en master y edita el README con: materia, número de ejercicio e integrantes (legajo, apellidos y nombres, cuenta de GitHub).</li>
              <li>Desde la consola, cada integrante clona el repositorio y, en paralelo, trabaja desde development en su rama:
                <ul><li>Integrante 1: <code>feature/marcas</code> (la clase Marca del EJ03, Parte 2).</li><li>Integrante 2: <code>feature/alta-vehiculo</code> (ventana para agregar vehículos).</li><li>Integrante 3: <code>feature/menu</code> (menú principal).</li></ul></li>
              <li>Fusionar las tres ramas mediante pull requests desde GitHub.</li>
            </ol>`,
          hints: ['Cada uno debe partir de development actualizado: <code>git switch development</code> y <code>git pull</code> antes de crear su rama.', 'El PR va de tu rama hacia <code>development</code>, no hacia master.', 'Si dos PRs tocan el mismo archivo (por ejemplo el Program o la vista principal), el segundo va a tener conflictos: GitHub te deja resolverlos en el navegador o podés hacerlo local (merge de development en tu rama y push).'],
          solution: sol(`<p>La secuencia de cada integrante es la misma, cambiando el nombre de la rama. Lo importante es el orden: actualizar development, crear la rama, confirmar, subir con <code>-u</code> y abrir el PR hacia development. Cuando se fusiona un PR, los demás deben traer development actualizado antes de seguir.</p>`, [
            ['Integrante 1', 'bash', `git clone https://github.com/<org>/XXXXX-YYYYY-ZZZZZ-ej04
cd XXXXX-YYYYY-ZZZZZ-ej04
git config user.name "Ana Pérez"
git config user.email ana.perez@frt.utn.edu.ar
git switch development
git switch -c feature/marcas
# … agregar la clase Marca y modificar Vehiculo …
git add .
git commit -m "Agrega la clase Marca a los vehículos"
git push -u origin feature/marcas
# En GitHub: Compare & pull request, base: development, compare: feature/marcas`],
            ['Si development avanzó mientras tanto', 'bash', `git switch development
git pull
git switch feature/menu
git merge development        # resolver conflictos si aparecen
git push                     # el PR se actualiza solo`],
          ]),
        },
      ],
      quiz: [
        { q: 'En el flujo centralizado, intentás hacer push pero un compañero subió antes. ¿Qué pasa?', o: ['Tu push pisa sus cambios.', 'Git rechaza el push hasta que integres sus cambios (fetch/pull).', 'GitHub fusiona automáticamente.', 'Se crea una rama nueva.'], a: 1, e: 'Git no permite un push que no sea un avance del historial remoto.' },
        { q: '¿Qué es un pull request?', o: ['Un comando para descargar cambios.', 'Una propuesta para fusionar una rama en otra, con revisión y discusión.', 'Un tipo de rama.', 'Un error de GitHub.'], a: 1, e: 'Se abre en GitHub y se fusiona cuando el código fue revisado.' },
        { q: 'No tenés permiso de escritura en un repositorio público y querés proponer un cambio. ¿Qué hacés?', o: ['Clonar y hacer push directo.', 'Hacer un fork, trabajar en tu copia y abrir un pull request.', 'Pedir la contraseña al dueño.', 'Usar git rebase.'], a: 1, e: 'Es el flujo de gestor de integración que GitHub facilita.' },
        { q: '¿Cuál es el mejor mensaje de commit?', o: ['<code>cambios</code>', '<code>Arreglos varios y otras cosas</code>', '<code>Corrige el recargo de carga en vehículos eléctricos</code>', '<code>asdf</code>'], a: 2, e: 'Corto, en imperativo y dice qué cambió.' },
        { q: 'El proyecto del kernel de Linux usa el flujo…', o: ['…centralizado.', '…de gestor de integración.', '…de dictador y tenientes.', '…sin control de versiones.'], a: 2, e: 'Varios tenientes integran subsistemas y el dictador integra a los tenientes.' },
        { q: 'Un compañero ya fusionó su PR en development. Antes de seguir trabajando en tu rama, conviene…', o: ['…borrar tu rama.', '…traer development (pull) y fusionarlo en tu rama.', '…hacer push --force.', '…nada.'], a: 1, e: 'Así resolvés los conflictos de tu lado y tu PR queda al día.' },
      ],
      sources: [
        { title: 'Pro Git, 2ª ed.', ref: 'Chacon y Straub, cap. 5', points: ['Flujos de trabajo distribuidos: centralizado, gestor de integración, dictador y tenientes.', 'Contribuir a un proyecto: commits, mensajes, equipos pequeños y grandes.'] },
        { title: 'Pro Git, 2ª ed.', ref: 'Chacon y Straub, cap. 6', points: ['Configurar una cuenta de GitHub y claves SSH.', 'Participar en proyectos: forks, pull requests, Markdown.', 'Mantener un proyecto: colaboradores, gestión de PRs, README y CONTRIBUTING.'] },
      ],
    },
  );
})();
