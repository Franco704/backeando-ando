/* Módulo: Arquitectura de software (Unidad 3, clases 15 a 19) */
(() => {
  const { code, table, note, lab, def, fig, sol, flow } = window.GUIDE.h;
  const UML = 'Booch, Rumbaugh y Jacobson, <em>El Lenguaje Unificado de Modelado</em>, 2ª ed.';
  const NCAPAS = 'De la Torre Llorente et al., <em>Guía de Arquitectura N-Capas Orientada al Dominio con .NET 4.0</em>';
  const SOMM = 'Sommerville, <em>Ingeniería de Software</em>, 9ª ed.';

  window.GUIDE.LESSONS.push(
    {
      id: 'interfaces-componentes',
      module: 'arq',
      title: 'Interfaces, componentes, paquetes y nodos',
      keywords: 'uml interfaz componente paquete artefacto nodo despliegue diagrama logico fisico dll exe import',
      tldr: 'Para hablar de arquitectura necesitamos vocabulario. UML lo da: <mark>interfaces</mark> y <mark>componentes</mark> (piezas lógicas reemplazables), <mark>paquetes</mark> (agrupaciones), <mark>artefactos</mark> (archivos físicos como un .dll) y <mark>nodos</mark> (las computadoras donde se despliegan).',
      goals: [
        'Definir interfaz, componente, paquete, artefacto y nodo según la Guía de UML.',
        'Distinguir la vista lógica (componentes, paquetes) de la física (artefactos, nodos).',
        'Leer un diagrama de componentes y uno de despliegue sencillos.',
      ],
      body: `
        <p>La Unidad 3 parte de un marco teórico con cinco ejes: <strong>conceptos</strong> (esta lección), <strong>principios</strong>, <strong>patrones</strong>, <strong>arquitectura</strong> y <strong>ejemplos</strong> (cliente-servidor, capas, Clean Architecture, monolitos y microservicios).</p>

        <h2>Interfaces</h2>
        ${def('Interfaz', 'Las interfaces definen una línea entre la especificación de lo que una abstracción hace y la implementación de cómo lo hace. Una interfaz es una colección de operaciones que sirven para especificar un servicio de una clase o de un componente.', `${UML}, cap. 11`)}
        <p>Una interfaz bien estructurada separa claramente la vista externa de la interna: se puede entender y usar una abstracción sin conocer su implementación. Es la misma idea del encapsulamiento de Booch, llevada al nivel de las piezas grandes del sistema.</p>

        <h2>Componentes</h2>
        ${def('Componente', 'Un componente es una parte lógica y reemplazable de un sistema, que conforma y proporciona la realización de un conjunto de interfaces.', `${UML}, cap. 15`)}
        <p>Los buenos componentes definen abstracciones precisas con interfaces bien definidas, y facilitan reemplazar los viejos por otros nuevos y compatibles. El ejemplo de la cátedra: un <strong>dispositivo móvil usa</strong> la interfaz <code>IConectorUsb</code> y un <strong>cargador la implementa</strong>. Cualquier cargador que cumpla la interfaz sirve.</p>
        ${fig(`<svg viewBox="0 0 560 140" width="560" role="img" aria-label="Componente que usa y componente que implementa una interfaz">
          <g font-size="13">
          <rect class="box" x="10" y="45" width="150" height="50" rx="6"/><text x="85" y="75" text-anchor="middle">Dispositivo Móvil</text>
          <rect class="box-a" x="205" y="30" width="150" height="80" rx="6"/><text x="280" y="52" text-anchor="middle" class="muted" font-size="11">«interface»</text><text x="280" y="70" text-anchor="middle" font-weight="700">IConectorUsb</text><line x1="205" y1="80" x2="355" y2="80" class="stroke"/><text x="280" y="98" text-anchor="middle">cargar()</text>
          <rect class="box" x="400" y="45" width="150" height="50" rx="6"/><text x="475" y="75" text-anchor="middle">Cargador</text>
          <path class="stroke" d="M160 70 H200" stroke-width="1.5" stroke-dasharray="5 4"/><path d="M205 70 l-9 -5 M205 70 l-9 5" class="stroke" stroke-width="1.5"/><text x="182" y="62" text-anchor="middle" font-size="11">usa</text>
          <path class="stroke" d="M400 70 H366" stroke-width="1.5" stroke-dasharray="5 4"/><path d="M356 70 l11 -7 v14 z" fill="var(--surface)" stroke="var(--muted)" stroke-width="1.5"/><text x="380" y="62" text-anchor="middle" font-size="11">implementa</text>
          </g></svg>`, 'El dispositivo depende de la interfaz, no del cargador concreto. Esta idea es la base de la inversión de dependencias.')}

        <h2>Paquetes</h2>
        ${def('Paquete', 'Los paquetes se utilizan para organizar los elementos de modelado en partes mayores que se pueden manipular como un grupo. La visibilidad de estos elementos puede controlarse para que algunos sean visibles fuera del paquete mientras que otros permanecen ocultos.', `${UML}, cap. 12`)}
        <p>Los paquetes bien diseñados agrupan elementos cercanos semánticamente y que suelen cambiar juntos: son <strong>cohesivos y poco acoplados</strong>, como los módulos de Booch. Un paquete puede <strong>importar</strong> a otro («import») para usar sus elementos públicos. En .NET, un paquete se corresponde con un <em>namespace</em> o con un proyecto: <code>Presentacion</code> importa <code>Dominio</code>, que a su vez contiene <code>Entidades</code> e <code>Interfaces</code>.</p>

        <h2>Artefactos y nodos: la vista física</h2>
        ${def('Artefacto', 'Los artefactos se utilizan para modelar los elementos físicos que pueden hallarse en un nodo, tales como ejecutables, bibliotecas, tablas, archivos y documentos. Normalmente, un artefacto representa el empaquetamiento físico de elementos que por su parte son lógicos, tales como clases, interfaces y colaboraciones.', `${UML}, cap. 26`)}
        ${def('Nodo', 'Un nodo es un elemento físico que existe en tiempo de ejecución y que representa un recurso computacional, que generalmente tiene algo de memoria y, a menudo, capacidad de procesamiento.', `${UML}, cap. 27`)}
        ${fig(`<svg viewBox="0 0 580 170" width="580" role="img" aria-label="Diagrama de despliegue">
          <g font-size="12">
          <path d="M20 40 l15 -15 h170 l-15 15 z M205 25 v120 l-15 15 v-120 z" fill="var(--surface-2)" stroke="var(--line)"/><rect x="20" y="40" width="170" height="120" fill="var(--surface)" stroke="var(--muted)"/>
          <text x="105" y="58" text-anchor="middle" font-weight="700">«device» PC</text>
          <rect class="box-a" x="35" y="75" width="140" height="34" rx="4"/><text x="105" y="96" text-anchor="middle">«artifact» Presentacion.exe</text>
          <path d="M360 40 l15 -15 h190 l-15 15 z M565 25 v120 l-15 15 v-120 z" fill="var(--surface-2)" stroke="var(--line)"/><rect x="360" y="40" width="190" height="120" fill="var(--surface)" stroke="var(--muted)"/>
          <text x="455" y="58" text-anchor="middle" font-weight="700">«device» Servidor</text>
          <rect class="box-a" x="380" y="72" width="150" height="30" rx="4"/><text x="455" y="92" text-anchor="middle">«artifact» Servicios.dll</text>
          <rect class="box-a" x="380" y="112" width="150" height="30" rx="4"/><text x="455" y="132" text-anchor="middle">«artifact» Dominio.dll</text>
          <path class="stroke" d="M190 100 H360" stroke-width="1.5"/><text x="275" y="92" text-anchor="middle">TCP/IP</text>
          </g></svg>`, 'Diagrama de despliegue: los nodos (cajas 3D) contienen artefactos y se conectan por un medio de comunicación.')}
        ${table(['Vista', 'Elementos', 'Pregunta que responde'], [
          ['<strong>Lógica</strong>', 'Clases, interfaces, componentes, paquetes', '¿Cómo se organiza el sistema conceptualmente?'],
          ['<strong>Física</strong>', 'Artefactos, nodos', '¿Qué archivos hay y en qué máquinas corren?'],
        ])}
        ${lab(0)}
      `,
      labs: [
        {
          type: 'classify',
          title: '¿Qué elemento de UML es?',
          buckets: ['Interfaz', 'Componente', 'Paquete', 'Artefacto', 'Nodo'],
          items: [
            { t: '<code>IPersistence</code> con <code>GetDoctors()</code> y <code>AddDoctor()</code>', b: 0, why: 'Una colección de operaciones que especifica un servicio.' },
            { t: 'El servidor de Azure donde corre la API', b: 4, why: 'Un recurso computacional físico en tiempo de ejecución.' },
            { t: '<code>Dsw2026Ej15.Domain.dll</code>', b: 3, why: 'Un archivo físico que empaqueta clases.' },
            { t: 'El namespace <code>Dsw2026Ej15.Domain.Entities</code>', b: 2, why: 'Agrupa elementos de modelado relacionados.' },
            { t: 'El módulo de persistencia que implementa IPersistence y se puede reemplazar por otro', b: 1, why: 'Parte lógica y reemplazable que realiza interfaces.' },
            { t: 'El celular desde el que un usuario usa la app', b: 4, why: 'Un dispositivo: un nodo.' },
          ],
        },
      ],
      quiz: [
        { q: 'Según la Guía de UML, un componente es…', o: ['…un archivo ejecutable.', '…una parte lógica y reemplazable de un sistema que realiza un conjunto de interfaces.', '…una computadora.', '…un paquete de clases.'], a: 1, e: 'Es lógico; su empaquetado físico es un artefacto.' },
        { q: '¿Qué modela un nodo?', o: ['Un archivo .dll.', 'Un recurso computacional físico en tiempo de ejecución.', 'Un namespace.', 'Una clase abstracta.'], a: 1, e: 'Servidores, PCs, dispositivos.' },
        { q: 'Un <code>.dll</code> generado al compilar un proyecto es…', o: ['Un nodo.', 'Un artefacto.', 'Una interfaz.', 'Un paquete.'], a: 1, e: 'Empaquetamiento físico de elementos lógicos.' },
        { q: '¿Qué caracteriza a un paquete bien diseñado?', o: ['Tener muchas clases.', 'Agrupar elementos cercanos que suelen cambiar juntos: cohesivo y poco acoplado.', 'Ser público por completo.', 'Contener un solo archivo.'], a: 1, e: 'Igual que los módulos de Booch.' },
        { q: 'Componentes y paquetes pertenecen a la vista…', o: ['…física.', '…lógica.', '…de despliegue.', '…de pruebas.'], a: 1, e: 'Artefactos y nodos son la vista física.' },
      ],
      sources: [
        { title: 'El Lenguaje Unificado de Modelado', ref: 'Booch, Rumbaugh y Jacobson, caps. 11, 12, 15, 26 y 27', points: ['Cap. 11: interfaces, tipos y roles.', 'Cap. 12: paquetes, visibilidad e importación.', 'Cap. 15: componentes e interfaces proporcionadas y requeridas.', 'Caps. 26 y 27: artefactos, nodos y diagramas de despliegue.'] },
      ],
    },

    {
      id: 'principios-solid',
      module: 'arq',
      title: 'Principios de diseño: SoC, SOLID y dependencias explícitas',
      keywords: 'principios separacion de responsabilidades separation of concerns soc solid responsabilidad unica srp abierto cerrado ocp liskov lsp segregacion interfaz isp inversion dependencias dip dependencias explicitas',
      tldr: 'Los principios son reglas generales para diseñar código mantenible. <mark>Separation of Concerns</mark> pide separar responsabilidades; <mark>SOLID</mark> lo baja a cinco reglas de clases e interfaces; la <mark>inversión de dependencias</mark> es la base de toda la arquitectura en capas.',
      goals: [
        'Definir qué es un principio de desarrollo y para qué sirve.',
        'Explicar Separation of Concerns y los cinco principios SOLID con ejemplos.',
        'Detectar violaciones de SOLID en código.',
        'Aplicar el principio de dependencias explícitas.',
      ],
      body: `
        <h2>Qué es un principio</h2>
        <p>Los principios para el desarrollo de software son guías generales que ayudan a diseñar, escribir y mantener código de buena calidad: mejoran la legibilidad, la mantenibilidad, la escalabilidad y la robustez, y facilitan el trabajo en equipo. Al diseñar un sistema, ayudan a crear una arquitectura que minimiza los costos de mantenimiento y maximiza la extensibilidad.</p>

        <h2>Separation of Concerns (SoC)</h2>
        <p>Separar el sistema en partes que se ocupen, cada una, de un aspecto distinto: la interfaz de usuario no sabe cómo se guardan los datos; la lógica de negocio no sabe cómo se dibuja una pantalla. Cuando una parte cambia, las otras no se enteran. SoC es la idea madre de las capas.</p>

        <h2>SOLID</h2>
        <p>Cinco principios presentados por Robert C. Martin. Como advierte la bibliografía, usarlos de forma dogmática puede complicar el diseño más de lo necesario: aspirá a ellos, pero con pragmatismo.</p>

        <h3>S: Responsabilidad única (SRP)</h3>
        <p><strong>Una clase solo debe tener una razón para cambiar.</strong> El ejemplo: una clase <code>Empleado</code> que gestiona los datos del empleado y además imprime el informe de horas. Si cambia el formato del informe, hay que tocar <code>Empleado</code>. Solución: mover la impresión a otra clase.</p>
        ${code('cs', `// Antes: dos razones para cambiar
public class Empleado
{
    public string Nombre { get; set; }
    public void ImprimirInformeHoras() { /* formato, impresión… */ }
}

// Después
public class Empleado { public string Nombre { get; set; } }
public class InformeHoras { public void Imprimir(Empleado e) { /* … */ } }`)}

        <h3>O: Abierto/cerrado (OCP)</h3>
        <p><strong>Las clases deben estar abiertas a la extensión pero cerradas a la modificación.</strong> Agregar comportamiento no debería obligar a modificar código que ya funciona. El ejemplo: un <code>Pedido</code> que calcula el envío con un <code>if</code> por cada método de envío. Cada método nuevo obliga a tocar <code>Pedido</code>. Con una interfaz <code>IEnvio</code> (patrón Strategy), un método nuevo es una clase nueva.</p>
        ${code('cs', `public interface IEnvio { decimal Costo(Pedido p); }
public class EnvioTerrestre : IEnvio { public decimal Costo(Pedido p) => p.Peso * 120m; }
public class EnvioAereo : IEnvio { public decimal Costo(Pedido p) => p.Peso * 450m; }

public class Pedido
{
    public decimal Peso { get; init; }
    public IEnvio Envio { get; set; } = new EnvioTerrestre();
    public decimal CostoEnvio() => Envio.Costo(this);   // no cambia al agregar envíos
}`)}
        <p>Fijate que la jerarquía de vehículos ya cumplía OCP: un vehículo a hidrógeno es una clase nueva, no un <code>if</code> más en el cálculo de consumos.</p>

        <h3>L: Sustitución de Liskov (LSP)</h3>
        <p><strong>Debe poder usarse un objeto de una subclase en lugar de uno de la superclase sin romper el código cliente.</strong> Requisitos para las subclases: no exigir parámetros más específicos, no devolver tipos más generales, no lanzar excepciones nuevas, no fortalecer precondiciones, no debilitar poscondiciones y preservar los invariantes.</p>
        <p>El ejemplo clásico: <code>DocumentoSoloLectura</code> hereda de <code>Documento</code> y su <code>Guardar()</code> lanza una excepción. El cliente que guardaba cualquier documento ahora explota. Solución: invertir la jerarquía (el de solo lectura es la base y el editable agrega <code>Guardar</code>).</p>

        <h3>I: Segregación de la interfaz (ISP)</h3>
        <p><strong>No se debe forzar a los clientes a depender de métodos que no utilizan.</strong> Las interfaces “gordas” se dividen en interfaces más chicas y específicas. El ejemplo: una biblioteca de proveedores de nube con una interfaz enorme pensada para Amazon; otro proveedor no ofrece la mitad de esas funciones y tendría que implementarlas vacías.</p>
        ${code('cs', `// Mejor varias interfaces chicas que una gorda
public interface IAlmacenamiento { void Subir(string archivo); }
public interface IComputo { void CrearServidor(); }
public class ProveedorSimple : IAlmacenamiento { public void Subir(string a) { } }
public class ProveedorCompleto : IAlmacenamiento, IComputo { /* … */ public void Subir(string a) { } public void CrearServidor() { } }`)}

        <h3>D: Inversión de dependencias (DIP)</h3>
        ${def('Principio de inversión de dependencias', 'Las clases de alto nivel no deben depender de clases de bajo nivel. Ambas deben depender de abstracciones. Las abstracciones no deben depender de detalles. Los detalles deben depender de abstracciones.', 'Martin, citado en <em>Principios SOLID</em> (Refactoring Guru)')}
        <ul>
          <li><strong>Clases de bajo nivel:</strong> operaciones básicas (disco, red, base de datos).</li>
          <li><strong>Clases de alto nivel:</strong> la lógica de negocio que les ordena hacer cosas.</li>
        </ul>
        <p>Sin DIP, el presentador que lista vehículos depende directamente de <code>Persistencia</code>. Con DIP, el dominio define una interfaz <code>IPersistencia</code> en términos de negocio; el presentador depende de ella y la clase concreta la implementa. La flecha de dependencia de la implementación ahora apunta “hacia arriba”: se <strong>invirtió</strong>.</p>
        ${fig(`<svg viewBox="0 0 600 190" width="600" role="img" aria-label="Inversión de dependencias">
          <g font-size="12">
          <text x="140" y="16" text-anchor="middle" font-weight="700">Sin inversión</text>
          <rect class="box" x="60" y="30" width="160" height="34" rx="6"/><text x="140" y="52" text-anchor="middle">ListarVehiculosPresenter</text>
          <rect class="box" x="60" y="130" width="160" height="34" rx="6"/><text x="140" y="152" text-anchor="middle">Persistencia (concreta)</text>
          <path class="stroke" d="M140 64 V124" stroke-width="1.6"/><path class="fill-a" d="M140 130 l-5 -9 h10 z"/>
          <text x="445" y="16" text-anchor="middle" font-weight="700">Con inversión</text>
          <rect class="box" x="300" y="30" width="160" height="34" rx="6"/><text x="380" y="52" text-anchor="middle">ListarVehiculosPresenter</text>
          <rect class="box-a" x="480" y="30" width="110" height="34" rx="6"/><text x="535" y="44" text-anchor="middle" font-size="10" class="muted">«interface»</text><text x="535" y="58" text-anchor="middle">IPersistencia</text>
          <rect class="box" x="455" y="130" width="160" height="34" rx="6" transform="translate(-30 0)"/><text x="505" y="152" text-anchor="middle">Persistencia</text>
          <path class="stroke" d="M460 47 H474" stroke-width="1.6"/><path class="fill-a" d="M480 47 l-9 -5 v10 z"/>
          <path class="stroke" d="M520 130 V76" stroke-width="1.6" stroke-dasharray="5 4"/><path d="M520 66 l-7 11 h14 z" fill="var(--surface)" stroke="var(--muted)" stroke-width="1.5"/>
          <text x="530" y="108" font-size="11">implementa</text>
          </g></svg>`, 'A la derecha, el presentador y la persistencia dependen de la abstracción. La persistencia puede cambiarse por otra (archivo, base de datos, memoria) sin tocar el presentador.')}

        <h2>Dependencias explícitas</h2>
        <p>Los métodos y las clases deben <strong>pedir explícitamente</strong> (por parámetros de constructor o de método) cualquier objeto colaborador que necesiten para funcionar. Una clase que hace <code>new Persistencia()</code> por dentro, o usa un singleton estático, esconde su dependencia: no se ve en la firma, no se puede reemplazar y no se puede probar.</p>
        ${code('cs', `// Dependencia oculta
public class ListarVehiculosPresenter
{
    public void Listar() => Persistencia.GetVehiculos();       // estático: imposible de reemplazar
}

// Dependencia explícita
public class ListarVehiculosPresenter
{
    private readonly IPersistencia _persistencia;
    public ListarVehiculosPresenter(IPersistencia persistencia) => _persistencia = persistencia;
    public void Listar() => _persistencia.GetVehiculos();
}`)}
        ${lab(0)}
      `,
      labs: [
        {
          type: 'classify',
          title: '¿Qué principio se viola?',
          buckets: ['SRP', 'OCP', 'LSP', 'ISP', 'DIP / dependencias explícitas'],
          items: [
            { t: '<code>DoctorService</code> valida datos, guarda en la base, manda mails y genera PDFs', b: 0, why: 'Tiene muchas razones para cambiar.' },
            { t: 'Para agregar un tipo de cuenta hay que sumar un <code>else if (_type == ...)</code> en cada método', b: 1, why: 'Extender obliga a modificar código existente.' },
            { t: '<code>CuentaSoloConsulta</code> hereda de <code>Cuenta</code> y su <code>Retirar</code> lanza NotSupportedException', b: 2, why: 'No se puede sustituir a la clase base sin romper al cliente.' },
            { t: '<code>IRepositorio</code> tiene 25 métodos y la implementación en memoria deja 18 vacíos', b: 3, why: 'La interfaz es demasiado gruesa.' },
            { t: 'El controlador hace <code>var db = new SqlPersistence();</code> dentro de cada acción', b: 4, why: 'Depende de un detalle concreto y además lo oculta.' },
            { t: 'La lógica de negocio llama a <code>File.Open</code>, <code>ReadBytes</code> y <code>Close</code> directamente', b: 4, why: 'El alto nivel depende de operaciones de bajo nivel en vez de una abstracción de negocio.' },
          ],
        },
      ],
      quiz: [
        { q: '“Una clase solo debe tener una razón para cambiar” es…', o: ['OCP', 'SRP', 'LSP', 'DIP'], a: 1, e: 'Principio de responsabilidad única.' },
        { q: 'Agregar un método de envío creando una clase nueva, sin tocar <code>Pedido</code>, cumple…', o: ['ISP', 'OCP', 'LSP', 'SRP'], a: 1, e: 'Abierto a la extensión, cerrado a la modificación.' },
        { q: 'Según DIP, ¿de qué deben depender las clases de alto nivel?', o: ['De las clases de bajo nivel concretas.', 'De abstracciones.', 'De la base de datos.', 'De nada.'], a: 1, e: 'Y los detalles también dependen de abstracciones.' },
        { q: 'Una subclase cuyo método exige un parámetro positivo cuando la base aceptaba cualquier entero viola…', o: ['LSP: fortalece la precondición.', 'SRP.', 'ISP.', 'Ninguno.'], a: 0, e: 'El cliente que pasaba negativos ahora se rompe.' },
        { q: '¿Qué pide el principio de dependencias explícitas?', o: ['Usar variables globales.', 'Recibir los colaboradores por el constructor o por parámetros.', 'Crear todo con new dentro de cada método.', 'Usar clases estáticas.'], a: 1, e: 'Así la dependencia es visible y reemplazable.' },
        { q: 'La interfaz de una biblioteca de nube obliga a implementar funciones que un proveedor no tiene. ¿Qué principio ayuda?', o: ['DIP', 'ISP', 'OCP', 'LSP'], a: 1, e: 'Dividir la interfaz gruesa en interfaces chicas.' },
      ],
      sources: [
        { title: 'Principios SOLID', ref: 'Refactoring Guru, <em>Sumérgete en los patrones de diseño</em>', points: ['SRP con el ejemplo Empleado e informe de horas.', 'OCP con Pedido y los métodos de envío (patrón Strategy).', 'LSP: requisitos formales y la jerarquía de documentos.', 'ISP con los proveedores de computación en la nube.', 'DIP: clases de alto y bajo nivel; el informe de presupuesto y la base de datos.'] },
        { title: 'Separation of Concerns', url: 'https://deviq.com/principles/separation-of-concerns', points: ['Separar un programa en secciones que aborden aspectos distintos.', 'Base de la arquitectura en capas.'] },
        { title: 'Explicit Dependencies Principle', url: 'https://deviq.com/principles/explicit-dependencies-principle', points: ['Las clases deben pedir explícitamente sus colaboradores (normalmente por constructor).', 'Las dependencias ocultas dificultan reemplazar y probar.'] },
      ],
    },

    {
      id: 'patrones-di-mvp',
      module: 'arq',
      title: 'Patrones: Adapter, Facade, MVP e inyección de dependencias',
      keywords: 'patrones de diseño adapter adaptador facade fachada mvp modelo vista presentador inyeccion de dependencias di ioc inversion de control contenedor servicecollection addtransient addsingleton fowler ej14',
      tldr: 'Un <mark>patrón</mark> es una solución probada a un problema de diseño recurrente. Esta lección cubre dos estructurales (Adapter, Facade), uno de presentación (MVP) y el que vas a usar en todo backend .NET: la <mark>inyección de dependencias</mark>.',
      goals: [
        'Definir qué es un patrón de diseño.',
        'Reconocer cuándo aplicar Adapter y Facade.',
        'Separar vistas y presentadores con MVP.',
        'Aplicar inyección de dependencias con un contenedor de .NET.',
        'Resolver el EJ14.',
      ],
      body: `
        <h2>Qué es un patrón</h2>
        <p>Los patrones de diseño son soluciones habituales a problemas comunes en el diseño de software. Cada patrón es como un plano que se puede personalizar para resolver un problema de diseño particular de tu código. No es código para copiar: es una idea con nombre, que además le da al equipo un <strong>vocabulario común</strong> (“acá metamos un adapter”).</p>
        <p>Todo patrón se describe con un <strong>problema</strong> y una <strong>solución</strong> (y sus consecuencias).</p>

        <h2>Adapter</h2>
        <p>Un patrón estructural que permite la colaboración entre objetos con interfaces incompatibles. Como un adaptador de enchufe: tu código espera una interfaz, una biblioteca ofrece otra, y el adapter las traduce.</p>
        ${code('cs', `// Tu dominio espera esto
public interface ICotizacion { Task<decimal> DolarAsync(); }

// La biblioteca externa ofrece otra cosa
public class ApiBancoCentral { public Task<string> GetRateJson(string moneda) => /* … */ Task.FromResult("{\\"rate\\":1250.5}"); }

// El adapter traduce
public class BancoCentralAdapter : ICotizacion
{
    private readonly ApiBancoCentral _api = new();
    public async Task<decimal> DolarAsync()
    {
        string json = await _api.GetRateJson("USD");
        return JsonDocument.Parse(json).RootElement.GetProperty("rate").GetDecimal();
    }
}`)}

        <h2>Facade</h2>
        <p>Un patrón estructural que proporciona una interfaz simplificada a una biblioteca, un framework o cualquier grupo complejo de clases. El cliente llama a un método y la fachada coordina a los demás por dentro.</p>
        ${code('cs', `public class CheckoutFacade
{
    // Por dentro coordina stock, pagos, facturación y envío
    public Recibo Comprar(Carrito carrito) { /* … */ return new Recibo(); }
}`)}

        <h2>MVP: Modelo, Vista, Presentador</h2>
        <p>El patrón separa el modelo del dominio, la presentación y las acciones del usuario en tres clases. La vista le delega al presentador toda la responsabilidad del manejo de los eventos del usuario; el presentador actualiza el modelo y la vista. El modelo no conoce al presentador.</p>
        ${table(['Pieza', 'Responsabilidad'], [
          ['<code>IView</code>', 'La interfaz con la que el presentador se comunica con la vista.'],
          ['<strong>View</strong>', 'Implementa IView y maneja los aspectos visuales (en el EJ14, la consola). Tiene una referencia a su presentador y le delega los eventos.'],
          ['<strong>Presenter</strong>', 'Contiene la lógica para responder a los eventos y maneja el estado de la vista a través de IView. Usa el modelo.'],
          ['<strong>Model</strong>', 'Los objetos que conocen y manejan los datos: las entidades del dominio.'],
        ])}
        <p>Como el presentador solo conoce la <em>interfaz</em> de la vista, podés probarlo sin consola y cambiar la consola por una ventana o una web sin tocarlo.</p>

        <h2>Inyección de dependencias (DI)</h2>
        <p>Si el presentador recibe sus dependencias por constructor (dependencias explícitas), alguien tiene que crearlas y pasárselas. Hacerlo a mano para toda la aplicación es tedioso. La <strong>inyección de dependencias</strong> delega esa tarea en un <strong>contenedor</strong>: vos registrás qué implementación corresponde a cada interfaz, y el contenedor arma los objetos resolviendo toda la cadena.</p>
        <p>Martin Fowler la presenta como una forma de <strong>inversión de control</strong>: no es la clase la que busca a sus colaboradores; se los dan desde afuera.</p>
        ${code('cs', `using Microsoft.Extensions.DependencyInjection;   // paquete NuGet

var services = new ServiceCollection();
services.AddSingleton<IPersistencia, Persistencia>();          // una sola instancia para toda la app
services.AddTransient<IMenuView, MenuView>();                  // una nueva cada vez
services.AddTransient<IMenuPresenter, MenuPresenter>();
services.AddSingleton<GestorPresentadores>();

var provider = services.BuildServiceProvider();
var gestor = provider.GetRequiredService<GestorPresentadores>();   // el contenedor arma todo el árbol`)}
        ${table(['Ciclo de vida', 'Instancias'], [
          ['<code>AddTransient</code>', 'Una nueva cada vez que se pide.'],
          ['<code>AddScoped</code>', 'Una por ámbito (en una API web: una por request).'],
          ['<code>AddSingleton</code>', 'Una sola para toda la aplicación.'],
        ])}
        <p>El lugar donde se registran y conectan todas las piezas se llama <strong>composition root</strong>: en una app de consola, el <code>Main</code>; en ASP.NET Core, el <code>Program.cs</code>. Es el único lugar que conoce las clases concretas.</p>
        ${note('En el EJ14 de la cátedra, <code>Persistencia</code> se registra como Singleton porque guarda los datos en memoria: si fuera Transient, cada presentador recibiría una lista nueva y los vehículos agregados se perderían. Vas a ver el mismo efecto en la API del EJ15.', 'exam')}
      `,
      exercises: [
        {
          official: 'N° 14',
          level: 3,
          title: 'Arquitectura en capas con MVP e inyección de dependencias',
          prompt: `<p>A partir de la solución del EJ05 (empresa de transporte), en el repositorio <code>dsw2026-ej14</code>:</p>
            <ol>
              <li>Organizar las capas con bibliotecas de clases.</li>
              <li>Separar las funcionalidades (incluido el menú) en varias clases (vistas).</li>
              <li>Manejar cada vista con un presentador independiente.</li>
              <li>Conectar presentadores y vistas con el patrón MVP.</li>
              <li>Desacoplar la clase persistencia.</li>
              <li>Implementar inyección de dependencias.</li>
            </ol>
            <p>Estructura esperada: <code>Dsw2026Ej14.Presentation</code> (Presenters, Interfaces, Models, Views), <code>Dsw2026Ej14.Domain</code> (Entities, Interfaces) y <code>Dsw2026Ej14.Data</code> (Dtos, Sources).</p>`,
          hints: ['¿Dónde va la interfaz <code>IPersistencia</code>? Tiene que estar en el proyecto que la usa (Domain), no en el que la implementa (Data). Si no, Domain dependería de Data.', 'Cada presentador recibe su vista y la persistencia por constructor.', 'Para navegar entre pantallas sin que un presentador cree a otro con new, un “gestor” que pide presentadores al contenedor.', 'Una vista base genérica <code>BaseView&lt;T&gt;</code> evita repetir el manejo del presentador en cada vista.'],
          solution: sol(`<p>Esta es la solución oficial de la cátedra (rama <code>feature/version-final</code> del repositorio), resumida en sus piezas clave.</p>
            <ul>
              <li><strong>Domain</strong> no depende de nadie: tiene las entidades y la interfaz <code>IPersistencia</code>.</li>
              <li><strong>Data</strong> depende de Domain: implementa <code>IPersistencia</code> leyendo JSON con DTOs.</li>
              <li><strong>Presentation</strong> depende de las dos, pero solo conoce la clase <code>Persistencia</code> en el <code>Main</code> (composition root).</li>
            </ul>`, [
            ['Dsw2026Ej14.Domain/Interfaces/IPersistencia.cs', 'cs', `namespace Dsw2026Ej14.Domain.Interfaces;

public interface IPersistencia
{
    List<Vehiculo> GetVehiculos();
    Vehiculo? GetVehiculo(string patente);
    List<Sucursal> GetSucursales();
    bool AgregarVehiculo(Vehiculo vehiculo);
}`],
            ['Dsw2026Ej14.Presentation/Program.cs', 'cs', `var services = new ServiceCollection();
services.AddTransient<IMenuView, MenuView>();
services.AddTransient<IMenuPresenter, MenuPresenter>();
services.AddTransient<IListarVehiculosView, ListarVehiculosView>();
services.AddTransient<IListarVehiculosPresenter, ListarVehiculosPresenter>();
services.AddTransient<IAgregarVehiculoView, AgregarVehiculoView>();
services.AddTransient<IAgregarVehiculoPresenter, AgregarVehiculoPresenter>();
services.AddSingleton<GestorPresentadores>();
services.AddSingleton<IPersistencia, Persistencia>();

var provider = services.BuildServiceProvider();
var gestor = provider.GetService<GestorPresentadores>();
gestor?.NavegarA<IMenuPresenter>();`],
            ['Presenters/BasePresenter.cs y GestorPresentadores.cs', 'cs', `public abstract class BasePresenter<T> : IPresenter where T : IBaseView
{
    public T Vista { get; }
    protected BasePresenter(T vista)
    {
        Vista = vista;
        Vista.SetPresentador(this);     // la vista conoce a su presentador
    }
}

public class GestorPresentadores
{
    private readonly IServiceProvider _provider;
    public GestorPresentadores(IServiceProvider provider) => _provider = provider;

    // Navegar = pedirle al contenedor el presentador; él arma vista y dependencias
    public void NavegarA<T>() where T : IPresenter => _ = _provider.GetService(typeof(T));
}`],
            ['Presenters/ListarVehiculosPresenter.cs', 'cs', `public class ListarVehiculosPresenter : BasePresenter<IListarVehiculosView>, IListarVehiculosPresenter
{
    private readonly IPersistencia _persistencia;

    public ListarVehiculosPresenter(IListarVehiculosView vista, IPersistencia persistencia) : base(vista)
    {
        _persistencia = persistencia;
        ListarVehiculos();
    }

    public void ListarVehiculos()
    {
        List<VehiculoViewModel> vehiculos = [];
        foreach (Vehiculo vehiculo in _persistencia.GetVehiculos())
            vehiculos.Add(new VehiculoViewModel(vehiculo));
        Vista.ListarVehiculos(vehiculos);
    }

    public void CalcularConsumos(Dictionary<string, double> vehiculos)
    {
        double consumoElectricos = 0, consumoCombustible = 0;
        foreach (var (patente, km) in vehiculos)
        {
            Vehiculo? vehiculo = _persistencia.GetVehiculo(patente);
            if (vehiculo is null) continue;
            double consumo = vehiculo.CalcularConsumo(km);
            consumoElectricos += vehiculo.EsDe(VehiculoTipo.Electrico) ? consumo : 0;
            consumoCombustible += vehiculo.EsDe(VehiculoTipo.Combustible) ? consumo : 0;
        }
        Vista.MostrarConsumos(consumoElectricos, consumoCombustible);
    }
}`],
            ['Domain/Entities/Vehiculo.cs (fragmento)', 'cs', `public abstract class Vehiculo : EntidadBase
{
    public string Patente { get; init; }
    public double CapacidadCarga { get; init; }
    public VehiculoTipo Tipo { get; init; }
    // …
    public abstract double CalcularConsumo(double kilometros);
    public bool EsDe(VehiculoTipo tipo) => Tipo == tipo;
}`],
          ]),
        },
      ],
      quiz: [
        { q: 'Tu dominio espera <code>ICotizacion</code> y una biblioteca externa ofrece una clase con otra interfaz. ¿Qué patrón aplicás?', o: ['Facade', 'Adapter', 'MVP', 'Singleton'], a: 1, e: 'Adapter traduce interfaces incompatibles.' },
        { q: 'En MVP, ¿quién maneja los eventos del usuario?', o: ['La vista.', 'El presentador, al que la vista se los delega.', 'El modelo.', 'El contenedor de DI.'], a: 1, e: 'La vista solo se ocupa de lo visual.' },
        { q: 'En MVP, ¿por qué el presentador se comunica con la vista a través de <code>IView</code>?', o: ['Por rendimiento.', 'Para poder cambiar la vista o probar el presentador sin interfaz real.', 'Porque C# lo exige.', 'Para que la vista no tenga código.'], a: 1, e: 'Es inversión de dependencias aplicada a la presentación.' },
        { q: '<code>services.AddSingleton&lt;IPersistencia, Persistencia&gt;()</code> significa que…', o: ['…se crea una Persistencia nueva cada vez.', '…habrá una sola instancia de Persistencia para toda la aplicación.', '…Persistencia no se puede usar.', '…se crea una por request.'], a: 1, e: 'Singleton: una instancia compartida.' },
        { q: '¿Qué es el composition root?', o: ['La clase base de todas.', 'El único lugar donde se registran y conectan las implementaciones concretas.', 'La carpeta raíz del proyecto.', 'El primer commit.'], a: 1, e: 'En consola, Main; en ASP.NET Core, Program.cs.' },
        { q: 'En el EJ14, ¿en qué proyecto va <code>IPersistencia</code>?', o: ['En Data, junto a la implementación.', 'En Domain, que la usa; Data la implementa.', 'En Presentation.', 'En un proyecto aparte de interfaces sin referencias.'], a: 1, e: 'Así Domain no depende de Data: la dependencia se invierte.' },
      ],
      sources: [
        { title: 'Patrones de diseño: introducción', url: 'https://refactoring.guru/es/design-patterns/what-is-pattern', points: ['Qué es un patrón y en qué se diferencia de un algoritmo.', 'Partes de la descripción de un patrón; clasificación (creacionales, estructurales, de comportamiento).'] },
        { title: 'Adapter', url: 'https://refactoring.guru/es/design-patterns/adapter', points: ['Permite la colaboración entre objetos con interfaces incompatibles.'] },
        { title: 'Facade', url: 'https://refactoring.guru/es/design-patterns/facade', points: ['Interfaz simplificada a un subsistema complejo.'] },
        { title: 'Inversion of Control Containers and the Dependency Injection pattern', url: 'https://martinfowler.com/articles/injection.html', points: ['Inversión de control y sus variantes.', 'Inyección por constructor, por setter y por interfaz; Service Locator.'] },
        { title: 'Inserción de dependencias en .NET', url: 'https://learn.microsoft.com/es-es/dotnet/core/extensions/dependency-injection', points: ['ServiceCollection, registro de servicios y ciclos de vida.', 'Resolución de dependencias en cadena por constructor.'] },
        { title: 'Guía de Arquitectura N-Capas', ref: `${NCAPAS}, cap. 8, págs. 350-357`, points: ['Patrones de la capa de presentación: MVC, MVP y MVVM.', 'Componentes de MVP: IView, View, Presenter y Model.'] },
      ],
    },

    {
      id: 'que-es-arquitectura',
      module: 'arq',
      title: 'Qué es la arquitectura de software',
      keywords: 'arquitectura definicion rae sommerville pressman booch fowler requisitos funcionales no funcionales atributos de calidad restricciones vistas 4+1 kruchten proceso diseño arquitectonico decisiones patrones arquitectonicos mvc repositorio tuberias filtros',
      tldr: 'La arquitectura son <mark>las decisiones importantes y difíciles de cambiar</mark> sobre cómo se organiza un sistema: sus componentes, cómo se relacionan y los principios que guían su evolución. Se diseña sobre todo a partir de los requisitos no funcionales.',
      goals: [
        'Comparar las definiciones de arquitectura de RAE, Sommerville, Pressman, Booch y Fowler.',
        'Distinguir requisitos funcionales, restricciones y atributos de calidad.',
        'Explicar las vistas de la arquitectura (4+1) y el proceso de diseño.',
        'Reconocer los patrones arquitectónicos de Sommerville.',
      ],
      body: `
        <h2>Requisitos: lo que da forma a la arquitectura</h2>
        <ul>
          <li><strong>Funcionales:</strong> qué debe hacer el sistema (“registrar un médico”).</li>
          <li><strong>No funcionales:</strong>
            <ul>
              <li><strong>Restricciones:</strong> características impuestas por el cliente que no se negocian (“tiene que correr en .NET 10”, “la base es SQL Server”).</li>
              <li><strong>Atributos de calidad:</strong> propiedades que importan a los interesados y afectan su satisfacción: rendimiento, seguridad, disponibilidad, mantenibilidad, escalabilidad, usabilidad…</li>
            </ul>
          </li>
        </ul>
        <p>Sommerville lo resume así: los componentes individuales implementan los requisitos funcionales, pero <strong>los no funcionales dependen de la arquitectura</strong>.</p>
        ${table(['Si el requisito crítico es…', 'La arquitectura debería… (Sommerville)'], [
          ['Rendimiento', 'Localizar las operaciones críticas en pocos componentes, en la misma computadora, con componentes de grano grueso.'],
          ['Seguridad', 'Usar capas, con los activos más críticos protegidos en las capas internas.'],
          ['Protección (safety)', 'Concentrar las operaciones relacionadas con la protección en un componente o en pocos.'],
          ['Disponibilidad', 'Incluir componentes redundantes para reemplazar y actualizar sin detener el sistema.'],
          ['Mantenibilidad', 'Usar componentes autocontenidos de grano fino, fáciles de cambiar.'],
        ])}
        <p>Hay conflictos: grano grueso favorece el rendimiento y grano fino la mantenibilidad. Diseñar la arquitectura es negociar esos compromisos.</p>

        <h2>Definiciones</h2>
        ${table(['Fuente', 'Definición'], [
          ['RAE', 'Estructura lógica y física de los componentes de una computadora.'],
          ['Sommerville', 'Una presentación de alto nivel del sistema, que puede usarse como enfoque para la discusión de un amplio número de participantes. Un modelo de arquitectura es una descripción corta y manejable de cómo se organiza un sistema y cómo interoperan sus componentes.'],
          ['Pressman', 'La estructura o estructuras del sistema, lo que comprende a los componentes del software, sus propiedades externas visibles y las relaciones entre ellos.'],
          ['Booch, Rumbaugh y Jacobson', 'El conjunto de decisiones significativas sobre la organización del sistema, la selección de elementos estructurales y sus interfaces, su comportamiento en colaboración, su composición en subsistemas y el estilo arquitectónico que guía esa organización.'],
          ['Fowler', '“La arquitectura tiene que ver con las cosas importantes. Sean lo que sean.” El entendimiento compartido que tienen los desarrolladores expertos; las decisiones que es difícil cambiar.'],
        ])}
        <p>Sommerville distingue la <strong>arquitectura en pequeño</strong> (cómo se divide un programa en componentes) de la <strong>arquitectura en grande</strong> (sistemas empresariales formados por otros sistemas, distribuidos en varias computadoras).</p>
        <p>Según Bass, documentar la arquitectura tiene tres ventajas: <strong>comunicación con los participantes</strong>, <strong>análisis temprano del sistema</strong> (si puede cumplir rendimiento, fiabilidad…) y <strong>reutilización a gran escala</strong>.</p>

        <h2>Vistas</h2>
        <p>Es imposible representar toda la información de una arquitectura en un solo modelo. El modelo <strong>4+1</strong> de Kruchten propone cuatro vistas, unidas por casos de uso o escenarios (el +1):</p>
        ${table(['Vista', 'Muestra', 'Para quién', 'Diagramas UML'], [
          ['Lógica', 'Las abstracciones clave: objetos, clases', 'Analistas, diseñadores', 'Clases, objetos'],
          ['De proceso', 'Cómo interactúan los procesos en ejecución (concurrencia, rendimiento)', 'Integradores', 'Secuencia, actividades'],
          ['De desarrollo', 'Cómo se descompone el software para el desarrollo (componentes, módulos)', 'Programadores, gestores', 'Componentes, paquetes'],
          ['Física', 'El hardware y cómo se distribuyen los componentes en los procesadores', 'Ingenieros de sistemas', 'Despliegue'],
          ['+1 Escenarios', 'Casos de uso que recorren las otras vistas', 'Todos', 'Casos de uso'],
        ])}
        <p>El Proceso Unificado plantea una variante con cinco vistas: casos de uso, diseño, interacción, implementación y despliegue.</p>

        <h2>El proceso de diseño de la arquitectura</h2>
        <p>La Guía de Arquitectura N-Capas propone un proceso <strong>iterativo</strong>:</p>
        ${lab(0)}
        <p>Las decisiones principales que hay que tomar:</p>
        <ul>
          <li>¿Qué tipo de aplicación se va a construir? (web, móvil, escritorio…)</li>
          <li>¿Qué estructura lógica va a tener? (N-capas, componentes…)</li>
          <li>¿Qué estructura física? (cliente/servidor, N-tier…)</li>
          <li>¿Qué riesgos hay que afrontar y cómo? (seguridad, rendimiento, flexibilidad…)</li>
          <li>¿Qué tecnologías se van a usar? (ASP.NET Core, Entity Framework…)</li>
        </ul>

        <h2>Patrones arquitectónicos</h2>
        <p>Un patrón arquitectónico es una descripción abstracta de una organización de sistema que se probó en distintos sistemas. Los de Sommerville:</p>
        ${table(['Patrón', 'Idea', 'Cuándo'], [
          ['<strong>MVC</strong> (Modelo-Vista-Controlador)', 'Separa la presentación y la interacción de los datos del sistema', 'Varias formas de ver e interactuar con los datos'],
          ['<strong>Arquitectura en capas</strong>', 'Organiza el sistema en capas; cada una ofrece servicios a la de arriba', 'Construir sobre sistemas existentes; equipos separados; seguridad multinivel'],
          ['<strong>Repositorio</strong>', 'Todos los datos se gestionan en un repositorio central al que acceden los componentes', 'Grandes volúmenes de información compartida'],
          ['<strong>Cliente-servidor</strong>', 'Funcionalidad organizada en servicios que ofrecen servidores separados', 'Datos compartidos a los que se accede desde varios lugares'],
          ['<strong>Tubería y filtro</strong>', 'Cada componente transforma su entrada y produce una salida para el siguiente', 'Procesamiento de datos por etapas (lotes, compiladores)'],
        ])}
        ${lab(1)}
      `,
      labs: [
        {
          type: 'order',
          title: 'El proceso iterativo de diseño de la arquitectura',
          intro: 'Ordená los pasos según la Guía de Arquitectura N-Capas.',
          items: [
            'Identificar los objetivos de la iteración',
            'Seleccionar los casos de uso arquitecturalmente importantes',
            'Realizar un esquema del sistema (tipo de aplicación, despliegue, estilo y tecnologías)',
            'Identificar los principales riesgos y definir una solución',
            'Crear arquitecturas candidatas y evaluarlas',
          ],
          explain: '<p>Al terminar, la arquitectura candidata se convierte en la base de la siguiente iteración, que la refina. No se diseña toda de una vez.</p>',
        },
        {
          type: 'classify',
          title: 'Funcional, restricción o atributo de calidad',
          buckets: ['Requisito funcional', 'Restricción', 'Atributo de calidad'],
          items: [
            { t: 'La API debe permitir dar de baja un médico', b: 0, why: 'Describe qué hace el sistema.' },
            { t: 'Debe desarrollarse con .NET 10 y C#', b: 1, why: 'Impuesto por la cátedra, no se negocia.' },
            { t: 'El 95 % de las consultas deben responder en menos de 300 ms', b: 2, why: 'Rendimiento.' },
            { t: 'Solo los administradores pueden eliminar registros', b: 2, why: 'Seguridad (aunque también se implementa como funcionalidad).' },
            { t: 'La base de datos debe ser SQL Server porque el hospital ya tiene licencias', b: 1, why: 'Restricción del cliente.' },
            { t: 'Agregar un tipo de vehículo no debe obligar a modificar el cálculo de consumos', b: 2, why: 'Mantenibilidad / extensibilidad.' },
          ],
        },
      ],
      quiz: [
        { q: 'Según Sommerville, ¿de qué dependen principalmente los requisitos no funcionales?', o: ['De cada componente individual.', 'De la arquitectura del sistema.', 'Del lenguaje de programación.', 'Del usuario final.'], a: 1, e: 'Los componentes implementan lo funcional; lo no funcional depende de cómo se organizan.' },
        { q: '¿Qué es una restricción?', o: ['Un requisito funcional opcional.', 'Una característica impuesta por el cliente que no se negocia.', 'Un atributo de calidad medible.', 'Un error.'], a: 1, e: 'Por ejemplo, la tecnología obligatoria.' },
        { q: 'Para Fowler, la arquitectura es…', o: ['…el diagrama de clases.', '…lo importante, sea lo que sea; las decisiones difíciles de cambiar.', '…la estructura física de la computadora.', '…el código fuente.'], a: 1, e: 'Una visión pragmática.' },
        { q: 'En el modelo 4+1, ¿qué representa el “+1”?', o: ['La vista física.', 'Los escenarios o casos de uso que unen las otras vistas.', 'La documentación.', 'El código.'], a: 1, e: 'Los escenarios validan las cuatro vistas.' },
        { q: 'Si la disponibilidad es crítica, la arquitectura debería…', o: ['…usar componentes redundantes.', '…concentrar todo en un servidor.', '…evitar capas.', '…usar componentes de grano grueso.'], a: 0, e: 'Para reemplazar y actualizar sin detener el sistema.' },
        { q: 'Un compilador que analiza, optimiza y genera código en etapas sucesivas sigue el patrón…', o: ['Repositorio', 'Tubería y filtro', 'Cliente-servidor', 'MVC'], a: 1, e: 'Cada etapa transforma la salida de la anterior.' },
      ],
      sources: [
        { title: 'Ingeniería de Software', ref: `${SOMM}, cap. 6`, points: ['Decisiones en el diseño arquitectónico y su relación con los requisitos no funcionales.', 'Vistas arquitectónicas (4+1).', 'Patrones arquitectónicos: MVC, capas, repositorio, cliente-servidor, tubería y filtro.', 'Arquitecturas de aplicación: transacciones y procesamiento de lenguaje.'] },
        { title: 'Guía de Arquitectura N-Capas', ref: `${NCAPAS}, caps. 1 y 2`, points: ['Fundamentos de arquitectura de aplicaciones.', 'Proceso iterativo de diseño en cinco pasos.'] },
        { title: 'Software Architecture Guide', url: 'https://martinfowler.com/architecture/', points: ['La arquitectura como “las cosas importantes”.', 'Por qué importa una buena arquitectura: la calidad interna reduce el costo de agregar funcionalidades.'] },
      ],
    },

    {
      id: 'cliente-servidor',
      module: 'arq',
      title: 'Sistemas distribuidos y cliente-servidor',
      keywords: 'sistemas distribuidos cliente servidor transparencia apertura escalabilidad seguridad calidad de servicio fallas middleware dos niveles cliente ligero pesado multinivel componentes distribuidos peer to peer saas software como servicio sommerville',
      tldr: 'Un sistema distribuido es una colección de computadoras independientes que el usuario percibe como un solo sistema. El modelo más común es <mark>cliente-servidor</mark>: los clientes piden servicios a servidores por la red, como hace el navegador con una API.',
      goals: [
        'Enumerar las ventajas y los conflictos de diseño de los sistemas distribuidos.',
        'Explicar el modelo cliente-servidor y la arquitectura en capas que lo organiza.',
        'Comparar los patrones de arquitectura distribuida de Sommerville.',
      ],
      body: `
        <h2>Sistemas distribuidos</h2>
        <p>Tanenbaum y Van Steen definen un sistema distribuido como <em>una colección de computadoras independientes que aparecen al usuario como un solo sistema coherente</em>. Sus ventajas (Coulouris): <strong>compartición de recursos</strong>, <strong>apertura</strong> (protocolos estándar), <strong>concurrencia</strong>, <strong>escalabilidad</strong> y <strong>tolerancia a fallas</strong>.</p>
        <p>A cambio, son más complejos. Los conflictos de diseño que destaca Sommerville:</p>
        ${table(['Conflicto', 'Pregunta'], [
          ['Transparencia', '¿En qué medida debe parecer un solo sistema?'],
          ['Apertura', '¿Protocolos estándar o especializados?'],
          ['Escalabilidad', '¿Cómo crecer en tamaño, distribución y administración?'],
          ['Seguridad', '¿Cómo aplicar políticas en sistemas administrados por distintas organizaciones?'],
          ['Calidad de servicio', '¿Cómo garantizar tiempos de respuesta aceptables?'],
          ['Gestión de fallas', '¿Cómo detectar, contener y recuperarse de fallas?'],
        ])}
        <p>Para que los componentes se comuniquen, se usa <strong>middleware</strong>: software que gestiona la comunicación y la interoperabilidad (por ejemplo, un servidor HTTP, un bus de mensajes). Los modelos de interacción son dos: <strong>procedimental</strong> (una computadora llama a un servicio de otra y espera la respuesta, como HTTP) y <strong>basado en mensajes</strong> (se envía un mensaje y no se espera respuesta inmediata).</p>

        <h2>Cliente-servidor</h2>
        <p>Un sistema cliente-servidor se organiza como un conjunto de <strong>servicios</strong> que proveen los <strong>servidores</strong>, a los que acceden los <strong>clientes</strong> por un canal de comunicación. Los clientes conocen a los servidores; los servidores no necesitan conocer a los clientes. Un servidor puede atender a muchos clientes.</p>
        ${fig(`<svg viewBox="0 0 600 170" width="600" role="img" aria-label="Cliente servidor web">
          <g font-size="12">
          <rect class="box" x="10" y="20" width="130" height="34" rx="6"/><text x="75" y="42" text-anchor="middle">Navegador (React)</text>
          <rect class="box" x="10" y="68" width="130" height="34" rx="6"/><text x="75" y="90" text-anchor="middle">App móvil</text>
          <rect class="box" x="10" y="116" width="130" height="34" rx="6"/><text x="75" y="138" text-anchor="middle">Postman</text>
          <rect class="box-a" x="250" y="58" width="150" height="54" rx="8"/><text x="325" y="82" text-anchor="middle" font-weight="700">Servidor web</text><text x="325" y="99" text-anchor="middle" class="muted" font-size="11">API ASP.NET Core</text>
          <rect class="box" x="470" y="58" width="120" height="54" rx="8"/><text x="530" y="82" text-anchor="middle" font-weight="700">Base de datos</text><text x="530" y="99" text-anchor="middle" class="muted" font-size="11">SQL Server</text>
          <path class="stroke-a" d="M140 37 L244 76 M140 85 H244 M140 133 L244 94" stroke-width="1.5"/>
          <path class="stroke-a" d="M400 85 H464" stroke-width="1.5"/>
          <text x="195" y="160" text-anchor="middle" class="muted" font-size="11">HTTP/HTTPS (JSON)</text>
          <text x="432" y="77" text-anchor="middle" class="muted" font-size="11">SQL</text>
          </g></svg>`, 'Un mismo servidor atiende a clientes de distintos tipos. Los clientes inician la comunicación.')}
        <p>Sommerville organiza las aplicaciones cliente-servidor en cuatro capas lógicas: <strong>presentación</strong>, <strong>gestión de datos</strong> (lo que el usuario ve y valida), <strong>procesamiento de la aplicación</strong> (la lógica de negocio) y <strong>base de datos</strong>. Los patrones de distribución difieren en cómo reparten esas capas entre las máquinas.</p>

        <h2>Patrones de arquitectura distribuida</h2>
        ${table(['Patrón', 'Descripción', 'Uso típico'], [
          ['<strong>Maestro-esclavo</strong>', 'Un proceso maestro coordina a esclavos que hacen tareas específicas', 'Sistemas de tiempo real (sensores)'],
          ['<strong>Dos niveles, cliente ligero</strong>', 'El cliente solo presenta; el servidor procesa y guarda', 'Navegador con páginas generadas en el servidor'],
          ['<strong>Dos niveles, cliente pesado</strong>', 'El cliente presenta y procesa; el servidor guarda', 'Apps de escritorio contra una base'],
          ['<strong>Multinivel (N-tier)</strong>', 'Presentación, lógica y datos en servidores distintos', 'Sistemas web grandes con muchos usuarios'],
          ['<strong>Componentes distribuidos</strong>', 'Componentes que se comunican mediante middleware, sin roles fijos de cliente o servidor', 'Integración de sistemas heterogéneos'],
          ['<strong>Peer-to-peer</strong>', 'Nodos iguales que comparten recursos sin servidor central', 'Intercambio de archivos, blockchain'],
        ])}
        <p>Una SPA en React que consume una API ASP.NET Core con una base de datos aparte es una arquitectura <strong>multinivel</strong> con un cliente bastante pesado (la lógica de presentación corre en el navegador).</p>

        <h2>Software como servicio (SaaS)</h2>
        <p>El software se aloja en servidores remotos y se usa a través de internet (normalmente desde el navegador), pagando una suscripción en lugar de comprar una licencia: Gmail, GitHub, Office 365. Exige diseñar para muchos usuarios (escalabilidad) y para que cada organización configure su versión (multiinquilino).</p>
      `,
      quiz: [
        { q: 'Un sistema distribuido, según Tanenbaum y Van Steen, es…', o: ['…un programa que corre en varios hilos.', '…una colección de computadoras independientes que aparecen al usuario como un solo sistema coherente.', '…un sistema sin base de datos.', '…un servidor muy potente.'], a: 1, e: 'La transparencia es uno de sus desafíos.' },
        { q: 'En cliente-servidor, ¿quién inicia la comunicación?', o: ['El servidor.', 'El cliente.', 'La base de datos.', 'Ambos a la vez.'], a: 1, e: 'El cliente pide; el servidor responde.' },
        { q: 'Un navegador que solo muestra páginas generadas completamente en el servidor es un modelo de…', o: ['…cliente pesado.', '…cliente ligero.', '…peer-to-peer.', '…maestro-esclavo.'], a: 1, e: 'El procesamiento está en el servidor.' },
        { q: '¿Qué es el middleware en un sistema distribuido?', o: ['Una capa de la interfaz.', 'Software que gestiona la comunicación y la interoperabilidad entre componentes.', 'Un tipo de base de datos.', 'Un patrón de diseño de clases.'], a: 1, e: 'Por ejemplo, un servidor HTTP o un bus de mensajes.' },
        { q: '¿Cuál NO es uno de los conflictos de diseño de los sistemas distribuidos según Sommerville?', o: ['Transparencia', 'Escalabilidad', 'Herencia múltiple', 'Gestión de fallas'], a: 2, e: 'La herencia es un tema de programación orientada a objetos.' },
      ],
      sources: [
        { title: 'Ingeniería de Software', ref: `${SOMM}, cap. 18`, points: ['Conflictos de los sistemas distribuidos; modelos de interacción; middleware.', 'Computación cliente-servidor y sus capas lógicas.', 'Patrones: maestro-esclavo, dos niveles, multinivel, componentes distribuidos, peer-to-peer.', 'Software como servicio.'] },
      ],
    },

    {
      id: 'capas-clean',
      module: 'arq',
      title: 'Arquitectura en capas y Clean Architecture',
      keywords: 'capas layers tiers niveles n-capas estricto laxo ddd domain driven design dominio aplicacion infraestructura presentacion servicios distribuidos clean architecture onion hexagonal application core composition root monolito todo en uno',
      tldr: 'Las <mark>capas</mark> son agrupaciones horizontales lógicas de componentes. En la arquitectura tradicional las dependencias van de arriba hacia abajo y terminan en la base de datos; en <mark>Clean Architecture</mark> se invierten: todo depende del núcleo de negocio.',
      goals: [
        'Distinguir capas (lógicas) de niveles (físicos).',
        'Explicar el diseño en capas estricto y laxo.',
        'Describir las capas de la arquitectura N-Capas orientada al dominio.',
        'Comparar la arquitectura N-capas tradicional con Clean Architecture.',
      ],
      body: `
        <h2>Capas y niveles</h2>
        <p>La confusión es común, así que conviene precisarlo:</p>
        ${table(['', 'Capas (layers)', 'Niveles (tiers)'], [
          ['Qué dividen', 'Componentes y funcionalidad, de forma <strong>lógica</strong>', 'Componentes y funcionalidad, de forma <strong>física</strong>, en servidores separados'],
          ['Ejemplo', 'Proyectos Api, Domain y Data en una misma solución', 'Navegador, servidor de aplicaciones y servidor de base de datos'],
        ])}
        <p>Toda aplicación con cierta complejidad debería tener una arquitectura lógica en N-capas; no todas necesitan desplegarse en N niveles. Es muy común una aplicación N-Layer desplegada en un solo tier.</p>

        <h2>Por qué capas</h2>
        <p>La Guía N-Capas enumera las “fuerzas” que motivan el patrón: <strong>localizar los cambios</strong> en una parte de la solución, <strong>separar responsabilidades</strong>, <strong>reutilizar</strong> componentes, permitir que <strong>equipos distintos trabajen en paralelo</strong> contra interfaces bien definidas, que cada capa tenga sus propias pruebas. Los componentes de cada capa deben ser cohesivos y tener aproximadamente el mismo nivel de abstracción, y cada capa debe estar débilmente acoplada con las demás.</p>
        <p><strong>La clave de una aplicación en N-Capas está en la gestión de dependencias.</strong></p>
        ${table(['Diseño', 'Regla', 'Pro / contra'], [
          ['<strong>Estricto</strong>', 'Una capa solo se comunica con la inmediatamente inferior', 'Máximo aislamiento; más llamadas intermedias'],
          ['<strong>Laxo</strong>', 'Una capa puede usar cualquier capa inferior', 'Mejor rendimiento; más difícil reemplazar una capa baja'],
        ])}

        <h2>N-Capas orientada al dominio</h2>
        <p>La arquitectura marco de la Guía (inspirada en Domain Driven Design) define estas capas:</p>
        ${table(['Capa', 'Responsabilidad', 'En el EJ15'], [
          ['<strong>Presentación</strong>', 'Interfaz de usuario', 'El frontend en React de la Unidad 5'],
          ['<strong>Servicios distribuidos</strong>', 'Expone la funcionalidad por la red (servicios web, API)', '<code>Dsw2026Ej15.Api</code>: controladores'],
          ['<strong>Aplicación</strong>', 'Coordina los casos de uso: orquesta el dominio y la infraestructura, sin reglas de negocio propias', 'Servicios de aplicación (<code>DoctorService</code>)'],
          ['<strong>Dominio</strong>', 'El corazón: entidades, reglas de negocio, contratos de repositorios. No depende de ninguna tecnología', '<code>Dsw2026Ej15.Domain</code>'],
          ['<strong>Infraestructura de persistencia</strong>', 'Acceso a datos: implementa los repositorios', '<code>Dsw2026Ej15.Data</code>'],
          ['<strong>Transversal (cross-cutting)</strong>', 'Lo que usan todas: seguridad, logging, caché', '<code>ILogger</code>, autenticación'],
        ])}

        <h2>De la arquitectura tradicional a Clean Architecture</h2>
        <p>La guía de Microsoft <em>Common web application architectures</em> recorre la evolución:</p>
        <ol>
          <li><strong>Todo en uno:</strong> un solo proyecto, separación por carpetas. Simple, pero al crecer la lógica queda dispersa y no hay una regla de qué carpeta depende de cuál: se termina en código espagueti.</li>
          <li><strong>N-capas tradicional:</strong> UI → BLL (lógica de negocio) → DAL (acceso a datos). Las dependencias de compilación van de arriba hacia abajo, así que <strong>la lógica de negocio depende del acceso a datos</strong> (y de la existencia de una base): probarla exige una base de datos de prueba.</li>
          <li><strong>Clean Architecture</strong> (también Hexagonal, Puertos y Adaptadores u Onion): aplica la inversión de dependencias. La lógica de negocio y el modelo quedan en el centro, en el <strong>Application Core</strong>; la infraestructura y la UI dependen de él.</li>
        </ol>
        ${fig(`<svg viewBox="0 0 600 270" width="600" role="img" aria-label="Clean Architecture vista de cebolla">
          <g font-size="12">
          <ellipse cx="200" cy="135" rx="190" ry="125" fill="var(--surface-2)" stroke="var(--line)"/>
          <ellipse cx="200" cy="135" rx="120" ry="80" class="box-a"/>
          <ellipse cx="200" cy="140" rx="55" ry="34" fill="var(--surface)" stroke="var(--accent)" stroke-dasharray="4 3"/>
          <text x="200" y="137" text-anchor="middle">Entidades</text><text x="200" y="153" text-anchor="middle">Interfaces</text>
          <text x="200" y="86" text-anchor="middle">Servicios de dominio</text>
          <text x="200" y="205" text-anchor="middle" font-weight="700">Application Core</text>
          <rect x="135" y="18" width="130" height="34" rx="6" class="box"/><text x="200" y="40" text-anchor="middle">UI: Controllers</text>
          <rect x="125" y="228" width="150" height="30" rx="6" class="box"/><text x="200" y="248" text-anchor="middle">Infraestructura: EF Core</text>
          <text x="455" y="70" font-weight="700">Reglas</text>
          <text x="420" y="95">• Las dependencias apuntan</text><text x="430" y="111">hacia el centro.</text>
          <text x="420" y="135">• El núcleo no depende de</text><text x="430" y="151">la UI ni de la base.</text>
          <text x="420" y="175">• La infraestructura implementa</text><text x="430" y="191">interfaces del núcleo.</text>
          </g></svg>`, 'El Application Core no depende de nadie. UI e infraestructura dependen de él (no entre sí, necesariamente).')}
        <p>Consecuencias:</p>
        <ul>
          <li>El núcleo se prueba con pruebas unitarias aisladas, sin base de datos.</li>
          <li>Se puede cambiar SQL Server por otra base, o la persistencia en memoria por EF Core, implementando la misma interfaz.</li>
          <li>La UI usa interfaces del núcleo en tiempo de compilación; las implementaciones de infraestructura se conectan en tiempo de ejecución por <strong>inyección de dependencias</strong>, en el <strong>composition root</strong> (<code>Program.cs</code>). Es el único lugar de la UI que debería referenciar tipos de infraestructura.</li>
        </ul>
        ${table(['Proyecto', 'Contiene'], [
          ['<strong>Application Core</strong>', 'Entidades, agregados, interfaces, servicios de dominio, especificaciones, excepciones y cláusulas de guarda, eventos de dominio, DTOs'],
          ['<strong>Infrastructure</strong>', 'El DbContext de EF Core y sus migraciones, implementaciones de repositorios, servicios de infraestructura (enviar mails, logs a archivo)'],
          ['<strong>UI / Api</strong>', 'Controladores, filtros, middleware propio, ViewModels, Program.cs'],
        ])}
        ${lab(0)}
      `,
      labs: [
        {
          type: 'classify',
          title: '¿En qué proyecto va? (Clean Architecture del EJ15/16)',
          buckets: ['Api (UI)', 'Domain (Application Core)', 'Data (Infraestructura)'],
          items: [
            { t: '<code>DoctorsController</code>', b: 0, why: 'Recibe HTTP: es la capa de servicios distribuidos/UI.' },
            { t: 'La entidad <code>Doctor</code> con su regla “se crea activo”', b: 1, why: 'Modelo y reglas de negocio.' },
            { t: 'La interfaz <code>IPersistence</code>', b: 1, why: 'El núcleo define el contrato; la infraestructura lo implementa.' },
            { t: '<code>PersistenceEf</code> que usa Entity Framework', b: 2, why: 'Detalle tecnológico de acceso a datos.' },
            { t: 'El <code>AppDbContext</code> y las migraciones', b: 2, why: 'Tipos de EF Core: infraestructura.' },
            { t: 'El middleware que traduce excepciones a códigos HTTP', b: 0, why: 'Es un concepto de HTTP: pertenece a la Api.' },
            { t: '<code>ValidationException</code>', b: 1, why: 'Excepción de aplicación/dominio: no sabe nada de HTTP.' },
            { t: 'Los registros <code>builder.Services.AddScoped&lt;IPersistence, PersistenceEf&gt;()</code>', b: 0, why: 'El composition root vive en Program.cs de la Api.' },
          ],
        },
      ],
      quiz: [
        { q: '¿Qué diferencia hay entre capas y niveles?', o: ['Son sinónimos.', 'Las capas son una división lógica; los niveles, física (en servidores separados).', 'Las capas son físicas y los niveles lógicos.', 'Los niveles solo existen en microservicios.'], a: 1, e: 'Una app N-Layer puede desplegarse en un solo tier.' },
        { q: 'En un diseño de capas estricto…', o: ['…cualquier capa usa cualquier otra.', '…una capa solo se comunica con la inmediatamente inferior.', '…no hay dependencias.', '…las capas inferiores llaman a las superiores.'], a: 1, e: 'El laxo permite saltear capas.' },
        { q: '¿Cuál es el problema de la arquitectura N-capas tradicional (UI → BLL → DAL)?', o: ['No separa responsabilidades.', 'La lógica de negocio depende del acceso a datos: es difícil probarla sin base de datos.', 'No permite usar bases de datos.', 'No se puede desplegar.'], a: 1, e: 'Clean Architecture invierte esa dependencia.' },
        { q: 'En Clean Architecture, ¿de qué depende el Application Core?', o: ['De la infraestructura.', 'De la UI.', 'De nadie: los demás dependen de él.', 'De Entity Framework.'], a: 2, e: 'Las dependencias apuntan hacia el centro.' },
        { q: '¿Dónde se conectan las interfaces del núcleo con las implementaciones de infraestructura?', o: ['En cada controlador.', 'En el composition root (Program.cs), con inyección de dependencias.', 'En el dominio.', 'En la base de datos.'], a: 1, e: 'Es el único lugar que conoce las clases concretas.' },
        { q: 'La capa de aplicación en la arquitectura orientada al dominio…', o: ['…contiene las reglas de negocio.', '…coordina los casos de uso orquestando dominio e infraestructura.', '…dibuja la interfaz.', '…es la base de datos.'], a: 1, e: 'Las reglas viven en el dominio.' },
      ],
      sources: [
        { title: 'Guía de Arquitectura N-Capas', ref: `${NCAPAS}, cap. 3`, points: ['Capas contra niveles (layers vs. tiers).', 'Fuerzas del patrón capas; diseño estricto y laxo.', 'Arquitectura marco N-Capas orientada al dominio: presentación, servicios distribuidos, aplicación, dominio, infraestructura y transversales.', 'Desacoplamiento, inyección de dependencias e inversión de control.'] },
        { title: 'Common web application architectures', ref: 'Microsoft, <em>Architect Modern Web Applications with ASP.NET Core and Azure</em>, cap. 4', points: ['Aplicaciones monolíticas y “todo en uno”.', 'Arquitectura N-capas tradicional y su problema de dependencias.', 'Clean Architecture: vista de cebolla, Application Core, infraestructura y UI; composition root.'] },
        { title: 'The Clean Architecture', url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html', points: ['La regla de dependencia: el código solo apunta hacia adentro.', 'Entidades, casos de uso, adaptadores de interfaz, frameworks y drivers.'] },
      ],
    },

    {
      id: 'monolito-microservicios',
      module: 'arq',
      title: 'Monolitos, SOA y microservicios',
      keywords: 'monolito microservicios soa arquitectura orientada a servicios granularidad bounded context api gateway bus de servicios esb middleware mensajeria richards despliegue independiente base de datos por servicio',
      tldr: 'Un <mark>monolito</mark> se despliega como una sola unidad. Los <mark>microservicios</mark> dividen el sistema en servicios chicos, independientes y desplegables por separado, cada uno con sus datos. <mark>SOA</mark> también usa servicios, pero más grandes, compartidos y coordinados por un middleware central.',
      goals: [
        'Explicar ventajas y desventajas de un monolito.',
        'Describir las características de los microservicios.',
        'Comparar microservicios y SOA según Richards.',
        'Decidir cuándo conviene cada enfoque.',
      ],
      body: `
        <h2>El monolito</h2>
        <p>Una aplicación monolítica es autocontenida: aunque interactúe con otros servicios, su comportamiento corre en un solo proceso y se despliega como una unidad. Para escalar, se duplica la aplicación entera en varios servidores.</p>
        ${table(['Ventajas', 'Desventajas'], [
          ['Simple de desarrollar, probar y desplegar al principio', 'Un cambio chico obliga a redesplegar todo'],
          ['Llamadas en memoria: rápidas y sin fallas de red', 'Escala todo junto aunque solo una parte tenga carga'],
          ['Transacciones y consistencia simples (una base)', 'Con el tiempo el acoplamiento crece y cuesta entenderlo'],
          ['Una sola tecnología', 'Difícil adoptar otra tecnología para una parte'],
        ])}
        <p>Un monolito bien organizado (en capas o con Clean Architecture) es la opción correcta para la mayoría de los proyectos que empiezan, incluido el TPI.</p>

        <h2>Microservicios</h2>
        <p>Un estilo en el que la aplicación es un conjunto de <strong>servicios pequeños</strong>, cada uno corriendo en su propio proceso y comunicándose por mecanismos livianos (normalmente HTTP/REST o mensajes). Características habituales:</p>
        <ul>
          <li><strong>Organizados alrededor de capacidades de negocio</strong> (pedidos, pagos, catálogo), no de capas técnicas. En DDD, cada uno se alinea con un <em>bounded context</em>.</li>
          <li><strong>Despliegue independiente:</strong> cada servicio se actualiza sin tocar a los demás.</li>
          <li><strong>Datos descentralizados:</strong> cada servicio es dueño de su base de datos; nadie accede a la base de otro.</li>
          <li><strong>Equipos autónomos</strong> dueños de su servicio de punta a punta.</li>
          <li><strong>Diseño para la falla:</strong> la red falla; cada servicio debe tolerar que otro no responda.</li>
          <li><strong>Automatización:</strong> integración y despliegue continuos, monitoreo, contenedores.</li>
        </ul>
        <p>El precio: complejidad distribuida. Llamadas por red lentas y que fallan, datos duplicados y consistencia eventual, depuración y monitoreo más difíciles.</p>

        <h2>Microservicios contra SOA (Richards)</h2>
        <p>Mark Richards compara las dos arquitecturas basadas en servicios:</p>
        ${table(['Aspecto', 'SOA', 'Microservicios'], [
          ['Filosofía', 'Compartir todo lo posible (reutilización)', 'Compartir lo menos posible'],
          ['Granularidad', 'Servicios grandes; de negocio, empresariales, de aplicación e infraestructura', 'Servicios chicos, de propósito único'],
          ['Coordinación', 'Middleware central: bus de servicios empresarial (ESB) que orquesta, enruta y transforma', 'Una capa de API (API gateway) delgada; los servicios se coordinan entre sí o por coreografía'],
          ['Datos', 'Bases compartidas entre servicios', 'Una base por servicio'],
          ['Contratos', 'Acoplamiento de contratos resuelto en el middleware', 'Contratos simples, versionados por servicio'],
          ['Protocolos', 'Heterogéneos (SOAP, mensajería, JMS…): el ESB los traduce', 'Homogéneos y livianos (REST, gRPC, mensajería)'],
          ['Despliegue', 'Más acoplado', 'Independiente por servicio'],
        ])}
        <p>Richards concluye que SOA encaja en sistemas empresariales grandes que necesitan integrar aplicaciones heterogéneas, y los microservicios en aplicaciones que necesitan agilidad, despliegue independiente y escalabilidad por partes.</p>
        ${note('Regla práctica: empezá con un monolito bien modularizado. Si una parte necesita escalar o evolucionar a otro ritmo, extraela como servicio. Partir en microservicios desde el día uno suele traer los costos sin los beneficios.', 'tip')}
        ${lab(0)}
      `,
      labs: [
        {
          type: 'classify',
          title: '¿Monolito, microservicios o SOA?',
          buckets: ['Monolito', 'Microservicios', 'SOA'],
          items: [
            { t: 'Un TPI de tres estudiantes con una API y una base de datos', b: 0, why: 'Equipo chico, dominio acotado: la complejidad distribuida no se justifica.' },
            { t: 'Un comercio electrónico donde el catálogo recibe 100 veces más tráfico que los pagos y cada área tiene su equipo', b: 1, why: 'Escalar por partes y equipos autónomos.' },
            { t: 'Un banco que integra un mainframe COBOL, un CRM comercial y apps nuevas mediante un bus central', b: 2, why: 'Integración de sistemas heterogéneos con middleware.' },
            { t: 'Cada servicio es dueño de su base y se despliega varias veces por día sin coordinar con otros', b: 1, why: 'Datos descentralizados y despliegue independiente.' },
            { t: 'Un ESB enruta, transforma y orquesta los mensajes entre servicios empresariales compartidos', b: 2, why: 'Middleware central característico de SOA.' },
          ],
        },
      ],
      quiz: [
        { q: '¿Cómo escala horizontalmente un monolito?', o: ['Escalando solo la parte con más carga.', 'Duplicando la aplicación completa en varios servidores.', 'No puede escalar.', 'Partiéndose en microservicios automáticamente.'], a: 1, e: 'Todo escala junto.' },
        { q: 'En microservicios, ¿cómo se manejan los datos?', o: ['Una base compartida por todos.', 'Cada servicio es dueño de su base.', 'No hay bases de datos.', 'Los datos viven en el API gateway.'], a: 1, e: 'Datos descentralizados.' },
        { q: 'Según Richards, la filosofía de SOA es…', o: ['…compartir lo menos posible.', '…compartir todo lo posible (reutilización).', '…no usar servicios.', '…un servicio por clase.'], a: 1, e: 'Microservicios, en cambio, comparte lo menos posible.' },
        { q: '¿Qué componente central caracteriza a SOA?', o: ['El API gateway.', 'El bus de servicios empresarial (ESB) como middleware.', 'Un contenedor de DI.', 'Una SPA.'], a: 1, e: 'Orquesta, enruta y transforma.' },
        { q: '¿Cuál es una desventaja típica de los microservicios?', o: ['No se pueden desplegar por separado.', 'La complejidad distribuida: fallas de red, consistencia eventual, monitoreo.', 'Obligan a usar una sola tecnología.', 'No escalan.'], a: 1, e: 'Se paga en complejidad operativa.' },
      ],
      sources: [
        { title: 'Microservices vs. Service-Oriented Architecture', ref: 'Richards, O’Reilly, 2016', points: ['Características de los servicios: taxonomía, propiedad y granularidad.', 'Características de la arquitectura: topología, middleware contra capa de API, acoplamiento de contratos, heterogeneidad de protocolos.', 'Capacidades: integración de aplicaciones, datos y sistemas heterogéneos.'] },
        { title: 'Microservices', url: 'https://martinfowler.com/articles/microservices.html', points: ['Definición del estilo y sus nueve características comunes.', 'Componentes como servicios, datos descentralizados, diseño para la falla.'] },
        { title: 'Microservicios, un enfoque integrado', ref: 'Martínez et al., 2018, cap. 2', points: ['Del monolito a los microservicios: motivaciones y características.', 'Ventajas y desafíos de la arquitectura de microservicios.'] },
      ],
    },
  );
})();
