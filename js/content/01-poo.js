/* Módulo: Programación orientada a objetos (Unidad 1, Booch caps. 2 y 3) */
(() => {
  const { code, table, note, lab, def, fig, sol } = window.GUIDE.h;
  const BOOCH = 'Booch, <em>Análisis y diseño orientado a objetos con aplicaciones</em>, 2ª ed., cap. 2';

  window.GUIDE.LESSONS.push(
    {
      id: 'modelo-de-objetos',
      module: 'poo',
      title: 'El modelo de objetos',
      keywords: 'poo programacion orientada objetos clase objeto instancia estado comportamiento identidad paradigma booch complejidad',
      tldr: 'La orientación a objetos es una forma de <mark>manejar la complejidad</mark>: en vez de pensar el programa como una lista de pasos, lo pensamos como un conjunto de objetos que colaboran, cada uno con su estado y su comportamiento.',
      goals: [
        'Explicar con tus palabras qué es la programación orientada a objetos según Booch.',
        'Distinguir clase de objeto, y estado, comportamiento e identidad.',
        'Nombrar los cuatro elementos fundamentales y los tres secundarios del modelo de objetos.',
      ],
      body: `
        <h2>El problema: el software es complejo</h2>
        <p>Booch abre su libro con una idea que atraviesa toda la materia: el software es complejo por naturaleza. No porque los programadores lo compliquen, sino porque los problemas que resuelve lo son. Una empresa de logística tiene vehículos, sucursales, responsables, fórmulas de consumo que cambian con el tiempo… y todo eso tiene que convivir en un programa que muchas personas van a modificar durante años.</p>
        <p>Los seres humanos manejamos la complejidad con tres herramientas: <strong>descomponer</strong> (partir el problema en piezas), <strong>abstraer</strong> (quedarnos solo con lo importante de cada pieza) y <strong>jerarquizar</strong> (ordenar las piezas en niveles). El modelo de objetos aplica esas tres herramientas al software.</p>

        <h2>Dos formas de descomponer un programa</h2>
        <p>Hay dos maneras clásicas de partir un sistema:</p>
        ${table(['Descomposición', 'Pregunta que guía', 'Unidad básica', 'Ejemplo con la empresa de logística'], [
          ['Algorítmica (estructurada)', '¿Qué pasos hay que hacer?', 'Procedimientos y funciones', '<code>leerVehiculos()</code>, <code>calcularConsumos()</code>, <code>imprimirTotales()</code>'],
          ['Orientada a objetos', '¿Qué cosas hay en el problema y qué saben hacer?', 'Objetos que colaboran', 'Un <code>Vehiculo</code> sabe calcular su consumo; una <code>Sucursal</code> conoce a su responsable'],
        ])}
        <p>La descomposición orientada a objetos tiene una ventaja enorme: los objetos imitan el <strong>vocabulario del problema</strong>. Si mañana aparece un vehículo a hidrógeno, agregás una clase nueva sin tocar el resto. En la versión algorítmica tendrías que revisar cada función que pregunta “¿qué tipo de vehículo es?”.</p>

        <h2>Qué es la programación orientada a objetos</h2>
        ${def('Programación orientada a objetos', 'La programación orientada a objetos es un método de implementación en el que los programas se organizan como colecciones cooperativas de objetos, cada uno de los cuales representa una instancia de alguna clase, y cuyas clases son, todas ellas, miembros de una jerarquía de clases unidas mediante relaciones de herencia.', BOOCH)}
        <p>Booch subraya tres partes de esta definición. Si falta alguna, el programa puede parecer orientado a objetos, pero no lo es:</p>
        <ol>
          <li>Usa <strong>objetos</strong>, no algoritmos, como bloques básicos de construcción.</li>
          <li>Cada objeto es una <strong>instancia de una clase</strong>.</li>
          <li>Las clases se relacionan entre sí por <strong>herencia</strong>.</li>
        </ol>
        <p>El libro distingue también tres actividades que van de la mano:</p>
        <ul>
          <li><strong>Análisis orientado a objetos (AOO):</strong> examina los requisitos desde la perspectiva de las clases y objetos que aparecen en el vocabulario del problema.</li>
          <li><strong>Diseño orientado a objetos (DOO):</strong> descompone el sistema en objetos y usa una notación (hoy, UML) para describir sus modelos lógico y físico, estático y dinámico.</li>
          <li><strong>Programación orientada a objetos (POO):</strong> implementa ese diseño en un lenguaje como C# o Java.</li>
        </ul>
        <p>Los productos del análisis alimentan al diseño, y los del diseño se convierten en el plano para programar.</p>

        <h2>Clase y objeto</h2>
        <p>Una <mark>clase</mark> es un molde: describe qué datos y qué operaciones tienen todos los objetos de un tipo. Un <mark>objeto</mark> es una cosa concreta construida con ese molde, que ocupa memoria mientras el programa corre.</p>
        ${code('cs', `// La clase: el molde
public class Vehiculo
{
    public string Patente;
    public int Anio;

    public double CalcularConsumo(double kilometros) => kilometros * 0.16;
}

// Los objetos: instancias concretas
var kangoo = new Vehiculo { Patente = "AE123FG", Anio = 2020 };
var transit = new Vehiculo { Patente = "AF456HI", Anio = 2021 };`)}
        <p>Todo objeto tiene tres características:</p>
        ${table(['Característica', 'Qué es', 'En el ejemplo'], [
          ['<strong>Estado</strong>', 'Los valores actuales de sus datos (atributos). Cambia con el tiempo.', '<code>Patente = "AE123FG"</code>, <code>Anio = 2020</code>'],
          ['<strong>Comportamiento</strong>', 'Cómo actúa y reacciona cuando le piden algo (sus operaciones).', '<code>CalcularConsumo(100)</code>'],
          ['<strong>Identidad</strong>', 'Lo que lo distingue de cualquier otro objeto, aunque tengan el mismo estado.', '<code>kangoo</code> y <code>transit</code> son dos objetos distintos'],
        ])}
        ${note('La identidad no depende del estado. Si creás dos vehículos con la misma patente, siguen siendo dos objetos diferentes en memoria. Vas a volver a esta idea en C# cuando veas la diferencia entre tipos por valor y por referencia.', 'tip')}

        <h2>Los siete elementos del modelo de objetos</h2>
        <p>Booch organiza el modelo de objetos en cuatro elementos <strong>fundamentales</strong> (sin ellos no hay orientación a objetos) y tres <strong>secundarios</strong> (son útiles, pero no imprescindibles). Los vas a estudiar uno por uno en las próximas lecciones.</p>
        ${table(['Fundamentales', 'Secundarios'], [
          ['Abstracción', 'Tipos (tipificación)'],
          ['Encapsulamiento', 'Concurrencia'],
          ['Modularidad', 'Persistencia'],
          ['Jerarquía', ''],
        ])}
        ${note('Es una pregunta clásica: “enumere los elementos fundamentales y secundarios del modelo de objetos”. Una regla para recordarlos: los fundamentales responden a <em>cómo organizo</em> (abstraigo, encapsulo, modularizo, jerarquizo). Los secundarios responden a <em>propiedades extra</em> de los objetos (tienen tipo, pueden estar activos, pueden sobrevivir al programa).', 'exam')}
        ${lab(0)}
      `,
      labs: [
        {
          type: 'classify',
          title: 'Fundamental o secundario',
          intro: 'Clasificá cada elemento del modelo de objetos según Booch.',
          buckets: ['Fundamental', 'Secundario'],
          items: [
            { t: 'Abstracción', b: 0, why: 'Es el primero de los cuatro fundamentales.' },
            { t: 'Persistencia', b: 1, why: 'Un objeto puede existir sin persistir: es útil, pero no esencial.' },
            { t: 'Jerarquía', b: 0, why: 'Sin jerarquía (herencia) no hay programación orientada a objetos según la definición de Booch.' },
            { t: 'Concurrencia', b: 1, why: 'Muchos sistemas orientados a objetos tienen un solo hilo de control.' },
            { t: 'Modularidad', b: 0, why: 'Agrupa abstracciones en módulos cohesivos y débilmente acoplados.' },
            { t: 'Tipos (tipificación)', b: 1, why: 'Hay lenguajes orientados a objetos con tipado débil o sin tipos.' },
            { t: 'Encapsulamiento', b: 0, why: 'Separa la interfaz de la implementación: es fundamental.' },
          ],
        },
      ],
      quiz: [
        { q: 'Según Booch, ¿cuál de estas condiciones NO forma parte de la definición de programación orientada a objetos?', o: ['Los programas se organizan como colecciones cooperativas de objetos.', 'Cada objeto es instancia de alguna clase.', 'Las clases se relacionan mediante herencia.', 'Cada objeto se ejecuta en su propio hilo.'], a: 3, e: 'El hilo propio es concurrencia, un elemento secundario. Las otras tres son las partes de la definición.' },
        { q: 'Dos objetos <code>Vehiculo</code> tienen exactamente los mismos valores en todos sus atributos. ¿Qué característica los sigue distinguiendo?', o: ['El estado', 'La identidad', 'El comportamiento', 'La clase'], a: 1, e: 'La identidad distingue a un objeto de todos los demás aunque el estado sea idéntico.' },
        { q: '¿Cuál es la ventaja principal de la descomposición orientada a objetos frente a la algorítmica?', o: ['Siempre produce programas más rápidos.', 'Los objetos reflejan el vocabulario del problema y los cambios quedan más localizados.', 'Elimina la necesidad de escribir funciones.', 'No requiere diseño previo.'], a: 1, e: 'Modelar las cosas del dominio permite agregar o cambiar una pieza sin revisar todo el programa.' },
        { q: '¿Cuál de estos es un elemento secundario del modelo de objetos?', o: ['Encapsulamiento', 'Modularidad', 'Persistencia', 'Abstracción'], a: 2, e: 'Los secundarios son tipos, concurrencia y persistencia.' },
        { q: 'El análisis orientado a objetos (AOO)…', o: ['…escribe el código en un lenguaje orientado a objetos.', '…examina los requisitos desde las clases y objetos del vocabulario del problema.', '…elige la base de datos.', '…define la interfaz gráfica.'], a: 1, e: 'El AOO modela el problema; el DOO diseña la solución; la POO la implementa.' },
      ],
      sources: [
        { title: 'Análisis y diseño orientado a objetos con aplicaciones', ref: 'Booch, cap. 2.1', points: ['La POO se define por tres condiciones: objetos como bloques, instancias de clases, clases unidas por herencia.', 'Distingue análisis (AOO), diseño (DOO) y programación (POO) orientados a objetos.', 'Si a un lenguaje le falta la herencia, Booch lo llama “basado en objetos” y no “orientado a objetos”.'] },
      ],
    },

    {
      id: 'abstraccion-encapsulamiento',
      module: 'poo',
      title: 'Abstracción y encapsulamiento',
      keywords: 'abstraccion encapsulamiento interfaz implementacion contrato invariante precondicion postcondicion excepcion responsabilidad minimo compromiso minima sorpresa ocultamiento',
      tldr: 'La <mark>abstracción</mark> decide qué muestra un objeto hacia afuera; el <mark>encapsulamiento</mark> esconde cómo lo hace por dentro. Juntas separan el contrato (lo que prometo) de la implementación (cómo lo cumplo).',
      goals: [
        'Citar y explicar las definiciones de abstracción y encapsulamiento de Booch.',
        'Explicar el modelo contractual: cliente, servidor, responsabilidades, invariantes, pre y poscondiciones y excepciones.',
        'Aplicar los principios de mínimo compromiso y mínima sorpresa al diseñar una clase.',
      ],
      body: `
        <h2>Abstracción</h2>
        <p>Un mismo gato es, para su dueña, algo que ronronea y come; para el veterinario, un conjunto de órganos. Ninguno de los dos está equivocado: cada uno se queda con las características que le importan según su perspectiva. Eso es abstraer.</p>
        ${def('Abstracción', 'Una abstracción denota las características esenciales de un objeto que lo distinguen de todos los demás tipos de objeto y proporciona así fronteras conceptuales nítidamente definidas respecto a la perspectiva del observador.', BOOCH)}
        <p>La abstracción se centra en la <strong>vista externa</strong> de un objeto: separa su comportamiento esencial de su implementación. Esa separación se llama <em>barrera de abstracción</em>.</p>

        <h3>Mínimo compromiso y mínima sorpresa</h3>
        <ul>
          <li><strong>Principio de mínimo compromiso:</strong> la interfaz de un objeto muestra su comportamiento esencial <em>y nada más</em>. Cuanto menos promete, más libertad hay para cambiar la implementación.</li>
          <li><strong>Principio de mínima sorpresa:</strong> la abstracción captura el comportamiento completo del objeto, ni más ni menos, y no ofrece sorpresas o efectos laterales que vayan más allá de su ámbito. Un método <code>CalcularConsumo</code> que además borra el vehículo de la lista sorprendería a cualquiera.</li>
        </ul>

        <h3>Tipos de abstracción</h3>
        <p>Booch, citando a Seidewitz y Stark, ordena las abstracciones de más útil a menos útil:</p>
        ${table(['Tipo', 'Qué representa', 'Ejemplo'], [
          ['De entidades', 'Un modelo útil de una entidad del dominio del problema o de la solución', '<code>Vehiculo</code>, <code>Sucursal</code>'],
          ['De acciones', 'Un conjunto generalizado de operaciones que cumplen funciones del mismo tipo', '<code>CalculadoraDeConsumos</code>'],
          ['De máquinas virtuales', 'Agrupa operaciones usadas por un nivel superior de control, u operaciones que usan un nivel inferior', 'Un <code>PuertoSerie</code> que habla con el hardware'],
          ['De coincidencia', 'Operaciones que no tienen relación entre sí', 'Una clase <code>Utilidades</code> con de todo un poco (a evitar)'],
        ])}
        <p>Se persigue construir <strong>abstracciones de entidades</strong>, porque imitan directamente el vocabulario del dominio.</p>

        <h3>El modelo contractual</h3>
        <p>Un <strong>cliente</strong> es cualquier objeto que usa los recursos de otro, llamado <strong>servidor</strong>. Meyer propone pensar esa relación como un contrato: la vista exterior de cada objeto define un contrato del que pueden depender otros objetos.</p>
        <ul>
          <li><strong>Responsabilidades:</strong> el comportamiento del que un objeto es responsable. Es lo que el contrato abarca.</li>
          <li><strong>Protocolo:</strong> el conjunto de operaciones que un cliente puede invocar, con sus formas de invocación.</li>
          <li><strong>Invariante:</strong> una condición booleana que debe mantenerse siempre verdadera.</li>
          <li><strong>Precondición:</strong> invariante que la operación <em>asume</em> (lo que el cliente debe cumplir antes de llamar).</li>
          <li><strong>Poscondición:</strong> invariante que la operación <em>satisface</em> (lo que el servidor garantiza al terminar).</li>
          <li><strong>Excepción:</strong> la indicación de que no se satisfizo, o no puede satisfacerse, algún invariante.</li>
        </ul>
        ${code('cs', `public class CuentaBancaria
{
    // Invariante: el saldo nunca baja del límite de descubierto
    public decimal Saldo { get; private set; }
    public decimal LimiteDescubierto { get; init; }

    public void Retirar(decimal monto)
    {
        // Precondición: el cliente debe pedir un monto positivo
        if (monto <= 0)
            throw new ArgumentException("El monto debe ser mayor a cero"); // excepción: se violó la precondición

        if (Saldo - monto < -LimiteDescubierto)
            throw new InvalidOperationException("Saldo insuficiente");    // excepción: se rompería el invariante

        Saldo -= monto;
        // Poscondición: el saldo bajó exactamente en "monto" y el invariante sigue valiendo
    }
}`, 'Contrato de una cuenta (lo vas a implementar en el EJ09)')}
        <p>Si el cliente viola una precondición, el servidor no puede proceder con fiabilidad. Si el servidor viola una poscondición, sus clientes ya no pueden confiar en él. En ambos casos, se avisa con una excepción.</p>

        <h2>Encapsulamiento</h2>
        <p>La abstracción dice <em>qué</em> hace un objeto. El encapsulamiento se ocupa de que nadie de afuera dependa de <em>cómo</em> lo hace.</p>
        ${def('Encapsulamiento', 'El encapsulamiento es el proceso de almacenar en un mismo compartimento los elementos de una abstracción que constituyen su estructura y su comportamiento; sirve para separar el interfaz contractual de una abstracción y su implantación.', BOOCH)}
        <p>En la práctica, cada clase tiene dos partes:</p>
        <ul>
          <li>La <strong>interfaz</strong>: su vista externa, lo único sobre lo que un cliente puede hacer suposiciones.</li>
          <li>La <strong>implementación</strong>: la representación interna y los mecanismos que logran el comportamiento. Son los “secretos” de la abstracción.</li>
        </ul>
        ${code('cs', `public class Vehiculo
{
    private readonly List<double> _registrosDeConsumo = new();   // secreto: podría ser un arreglo, una base de datos…

    public double ConsumoPromedio()                               // interfaz: lo que el cliente ve
        => _registrosDeConsumo.Count == 0 ? 0 : _registrosDeConsumo.Average();
}`)}
        <p>El beneficio esencial del encapsulamiento es poder <strong>cambiar la representación de una abstracción sin alterar a ninguno de sus clientes</strong>. Si mañana guardás los consumos en otro lado, nadie que llame a <code>ConsumoPromedio()</code> se entera.</p>
        ${note('Abstracción y encapsulamiento son complementarios, no sinónimos. La abstracción se enfoca en el comportamiento observable; el encapsulamiento, en la implementación que lo produce. Como dice Stroustrup, citado por Booch: el ocultamiento es para prevenir accidentes, no para prevenir el fraude.', 'exam')}
        ${lab(0)}
        ${lab(1)}
      `,
      labs: [
        {
          type: 'classify',
          title: '¿Interfaz o implementación?',
          intro: 'Para la clase <code>Sucursal</code>, decidí qué parte debería ser pública (interfaz) y cuál privada (implementación).',
          buckets: ['Interfaz (public)', 'Implementación (private)'],
          items: [
            { t: 'Obtener el código de la sucursal', b: 0, why: 'Otros objetos (vehículos, reportes) necesitan conocerlo.' },
            { t: 'La lista interna donde se guardan los vehículos asignados', b: 1, why: 'Si es pública, cualquiera puede agregar o borrar sin control.' },
            { t: 'Asignar un vehículo a la sucursal', b: 0, why: 'Es una responsabilidad de la sucursal: va en su contrato.' },
            { t: 'Un método auxiliar que normaliza la dirección antes de guardarla', b: 1, why: 'Es un detalle de cómo lo hace, no de qué ofrece.' },
            { t: 'Consultar el responsable a cargo', b: 0, why: 'Forma parte de lo que la sucursal sabe y comparte.' },
            { t: 'El contador que genera números internos de registro', b: 1, why: 'Es estado interno que nadie de afuera debe tocar.' },
          ],
        },
        {
          type: 'classify',
          title: 'Precondición, poscondición o invariante',
          intro: 'Para el método <code>Retirar(monto)</code> de una cuenta bancaria, clasificá cada afirmación.',
          buckets: ['Precondición', 'Poscondición', 'Invariante'],
          items: [
            { t: 'El monto recibido es mayor a cero', b: 0, why: 'Lo debe garantizar quien llama, antes de llamar.' },
            { t: 'Al terminar, el saldo es el saldo anterior menos el monto', b: 1, why: 'Es lo que el método promete al terminar.' },
            { t: 'El saldo nunca es menor que menos el límite de descubierto', b: 2, why: 'Debe ser verdadero siempre, antes y después de cualquier operación.' },
            { t: 'La cuenta está activa cuando se llama', b: 0, why: 'Es una condición que la operación asume.' },
            { t: 'Si el saldo no alcanzaba, la cuenta queda suspendida', b: 1, why: 'Es el estado que garantiza la operación al terminar en ese caso.' },
          ],
        },
      ],
      quiz: [
        { q: 'Completá la definición de Booch: “Una abstracción denota las características <em>esenciales</em> de un objeto que lo distinguen de todos los demás tipos de objeto y proporciona fronteras conceptuales nítidamente definidas…”', o: ['…respecto a la implementación.', '…respecto a la perspectiva del observador.', '…respecto a la base de datos.', '…respecto a su clase padre.'], a: 1, e: 'La abstracción depende de quién mira: dueña y veterinario abstraen distinto al mismo gato.' },
        { q: '¿Qué dice el principio de mínima sorpresa?', o: ['Una clase debe tener la menor cantidad de métodos posible.', 'Una abstracción captura el comportamiento completo de un objeto, sin efectos laterales que vayan más allá de su ámbito.', 'Los errores deben ocultarse al usuario.', 'Los atributos deben ser siempre privados.'], a: 1, e: 'Que un método haga exactamente lo que su nombre y contrato prometen.' },
        { q: 'Una precondición es…', o: ['…un invariante que la operación satisface al terminar.', '…un invariante que la operación asume al empezar.', '…una excepción que se lanza siempre.', '…el valor inicial de un atributo.'], a: 1, e: 'Precondición = lo que se asume; poscondición = lo que se garantiza.' },
        { q: '¿Cuál es el beneficio esencial del encapsulamiento según Booch?', o: ['Que el código sea más corto.', 'Poder cambiar la representación de una abstracción sin alterar a sus clientes.', 'Evitar que otros programadores lean el código.', 'Que los objetos sean más rápidos.'], a: 1, e: 'Las decisiones de implementación quedan locales: cambian sin romper a nadie.' },
        { q: 'Una clase <code>Helpers</code> con un método para formatear fechas, otro para calcular IVA y otro para enviar mails es una abstracción…', o: ['…de entidades.', '…de acciones.', '…de máquina virtual.', '…de coincidencia.'], a: 3, e: 'Agrupa operaciones sin relación entre sí: es la menos útil de las cuatro.' },
        { q: 'Si un cliente llama a un método sin cumplir la precondición, lo correcto es que el servidor…', o: ['…continúe igual y devuelva cualquier valor.', '…lo indique, por ejemplo lanzando una excepción.', '…cierre la aplicación.', '…corrija silenciosamente los datos del cliente.'], a: 1, e: 'Una excepción indica que no se satisfizo un invariante del contrato.' },
      ],
      sources: [
        { title: 'Análisis y diseño orientado a objetos con aplicaciones', ref: 'Booch, cap. 2.2, págs. 46-60', points: ['Define abstracción y la ilustra con el gato visto por su dueña y por el veterinario.', 'Presenta los tipos de abstracción (entidades, acciones, máquinas virtuales, coincidencia).', 'Explica el modelo contractual de Meyer: responsabilidades, protocolo, invariantes, pre y poscondiciones, excepciones.', 'Define encapsulamiento y la separación interfaz/implementación con el ejemplo del calentador.'] },
      ],
    },

    {
      id: 'modularidad-jerarquia',
      module: 'poo',
      title: 'Modularidad y jerarquía',
      keywords: 'modularidad modulo cohesion acoplamiento jerarquia herencia es un parte de agregacion composicion generalizacion especializacion superclase subclase polimorfismo',
      tldr: 'La <mark>modularidad</mark> agrupa abstracciones en piezas cohesivas y poco acopladas. La <mark>jerarquía</mark> las ordena en niveles: “es un” (herencia) y “parte de” (agregación).',
      goals: [
        'Definir modularidad y explicar cohesión y acoplamiento con ejemplos.',
        'Distinguir la jerarquía “es un” (herencia) de la jerarquía “parte de” (agregación).',
        'Usar la prueba “B es un A” para decidir si corresponde heredar.',
      ],
      body: `
        <h2>Modularidad</h2>
        <p>Partir un programa en módulos reduce su complejidad, pero la razón más fuerte es otra: crea <strong>fronteras bien definidas y documentadas</strong> dentro del programa. Esas fronteras (interfaces) permiten entender, compilar y cambiar cada parte por separado.</p>
        ${def('Modularidad', 'La modularidad es la propiedad que tiene un sistema que ha sido descompuesto en un conjunto de módulos cohesivos y débilmente acoplados.', BOOCH)}
        <p>Las dos palabras clave de la definición:</p>
        ${table(['Concepto', 'Qué mide', 'Lo que buscamos'], [
          ['<strong>Cohesión</strong>', 'Cuánto se relacionan entre sí los elementos de un mismo módulo', '<strong>Alta</strong>: todo lo que está junto tiene una razón para estar junto'],
          ['<strong>Acoplamiento</strong>', 'Cuánto depende un módulo de los detalles de otros', '<strong>Bajo</strong>: cada módulo conoce lo mínimo de los demás'],
        ])}
        <p>En C# y .NET, la clase es la unidad lógica y el <strong>proyecto</strong> (que compila a un <code>.dll</code> o <code>.exe</code>) es la unidad física de modularidad. En la Unidad 3 vas a separar una solución en proyectos <code>Domain</code>, <code>Data</code> y <code>Api</code>: eso es modularidad aplicada.</p>
        ${note('Booch aclara que la identificación de clases y objetos es parte del <strong>diseño lógico</strong>, mientras que la identificación de módulos es parte del <strong>diseño físico</strong>. Ambas decisiones se toman de forma iterativa.', 'tip')}
        <p>Abstracción, encapsulamiento y modularidad son <strong>sinérgicos</strong>: un objeto da una frontera bien definida alrededor de una abstracción, y el encapsulamiento y la modularidad levantan barreras alrededor de ella.</p>

        <h2>Jerarquía</h2>
        <p>Incluso con buenas abstracciones encapsuladas en módulos, puede haber más abstracciones de las que una persona entiende a la vez. Ordenarlas en niveles ayuda muchísimo.</p>
        ${def('Jerarquía', 'La jerarquía es una clasificación u ordenación de abstracciones.', BOOCH)}
        <p>Las dos jerarquías más importantes en un sistema complejo son:</p>
        ${fig(`<svg viewBox="0 0 620 230" width="620" role="img" aria-label="Jerarquía es un y jerarquía parte de">
          <text x="150" y="20" text-anchor="middle" font-weight="700" font-size="14">“Es un” (herencia)</text>
          <rect class="box-a" x="95" y="34" width="110" height="34" rx="6"/><text x="150" y="56" text-anchor="middle" font-size="13">Vehiculo</text>
          <rect class="box" x="20" y="128" width="120" height="34" rx="6"/><text x="80" y="150" text-anchor="middle" font-size="13">VehiculoElectrico</text>
          <rect class="box" x="160" y="128" width="130" height="34" rx="6"/><text x="225" y="150" text-anchor="middle" font-size="13">VehiculoCombustible</text>
          <path class="stroke" d="M80 128 V100 H225 V128 M150 100 V82" stroke-width="1.5"/>
          <path class="fill-a" d="M150 68 l-8 14 h16 z"/>
          <text x="150" y="196" text-anchor="middle" font-size="12" class="muted">Generalización / especialización</text>
          <text x="470" y="20" text-anchor="middle" font-weight="700" font-size="14">“Parte de” (agregación)</text>
          <rect class="box-a" x="415" y="34" width="110" height="34" rx="6"/><text x="470" y="56" text-anchor="middle" font-size="13">Sucursal</text>
          <rect class="box" x="345" y="128" width="110" height="34" rx="6"/><text x="400" y="150" text-anchor="middle" font-size="13">Responsable</text>
          <rect class="box" x="485" y="128" width="110" height="34" rx="6"/><text x="540" y="150" text-anchor="middle" font-size="13">Vehiculo</text>
          <path class="stroke" d="M400 128 V100 H540 V128 M470 100 V82" stroke-width="1.5"/>
          <path class="box-a" d="M470 68 l-7 7 l7 7 l7 -7 z"/>
          <text x="470" y="196" text-anchor="middle" font-size="12" class="muted">El todo está formado por partes</text>
        </svg>`, 'A la izquierda, la jerarquía de clases (triángulo = herencia). A la derecha, la jerarquía de objetos (rombo = agregación).')}

        <h3>Herencia: la jerarquía “es un”</h3>
        <p>La herencia define una relación entre clases en la que una <strong>subclase</strong> comparte la estructura y el comportamiento de una o más <strong>superclases</strong>, y los aumenta o redefine. Con una superclase es <em>herencia simple</em>; con varias, <em>herencia múltiple</em> (C# no la permite entre clases, sí entre interfaces).</p>
        <p>La piedra de toque: <strong>si B “no es un” tipo de A, entonces B no debería heredar de A</strong>. Un vehículo eléctrico <em>es un</em> vehículo: hereda. Una sucursal <em>no es un</em> responsable: no hereda aunque comparta “nombre” y “teléfono”.</p>
        ${code('cs', `public abstract class Vehiculo
{
    public string Patente { get; init; }
    public double CapacidadCarga { get; init; }

    // Cada tipo de vehículo calcula distinto: se redefine en las subclases
    public abstract double CalcularConsumo(double kilometros);
}

public class VehiculoElectrico : Vehiculo
{
    public double KwhBase { get; init; } = 16;

    public override double CalcularConsumo(double kilometros)
    {
        double total = kilometros / 100 * KwhBase;
        return CapacidadCarga > 1200 ? total * 1.15 : total;
    }
}`)}
        <p>Cuando el programa llama a <code>vehiculo.CalcularConsumo(100)</code> sin saber qué tipo concreto es, se ejecuta la versión de la subclase real. Eso es <strong>polimorfismo</strong>, y es lo que hace que agregar un tipo de vehículo no obligue a tocar el código que los recorre.</p>

        <h3>Agregación: la jerarquía “parte de”</h3>
        <p>La agregación relaciona objetos: un objeto está formado por otros. Una sucursal tiene un responsable; un pedido tiene líneas. Booch señala que la agregación plantea el problema de la <strong>propiedad</strong>: ¿si destruyo el todo, se destruyen las partes? Si las partes pueden vivir sin el todo (un vehículo puede cambiar de sucursal), es agregación por referencia; si no (las líneas no existen sin su pedido), se la suele llamar composición.</p>
        ${note('Error típico: usar herencia para reutilizar código cuando la relación real es “tiene un”. Si dudás, aplicá la prueba “es un” en voz alta.', 'warn')}
        ${lab(0)}
      `,
      labs: [
        {
          type: 'classify',
          title: '¿“Es un” o “parte de”?',
          intro: 'Decidí qué relación corresponde en cada par.',
          buckets: ['Herencia (es un)', 'Agregación (parte de)', 'Ninguna'],
          items: [
            { t: '<code>CuentaCorriente</code> y <code>CuentaBancaria</code>', b: 0, why: 'Una cuenta corriente es un tipo de cuenta bancaria (EJ09).' },
            { t: '<code>Sucursal</code> y <code>Responsable</code>', b: 1, why: 'La sucursal tiene un responsable a cargo.' },
            { t: '<code>Constelacion</code> y <code>Estrella</code>', b: 1, why: 'Una constelación agrupa estrellas (EJ12).' },
            { t: '<code>Doctor</code> y <code>BaseEntity</code>', b: 0, why: 'Todo médico es una entidad con Id (EJ15).' },
            { t: '<code>Vehiculo</code> y <code>Marca</code>', b: 1, why: 'Un vehículo tiene una marca (EJ03): no “es una” marca.' },
            { t: '<code>Responsable</code> y <code>Sucursal</code> (heredar porque ambas tienen dirección)', b: 2, why: 'Compartir un atributo no justifica herencia: un responsable no es una sucursal.' },
          ],
        },
      ],
      quiz: [
        { q: 'Según Booch, la modularidad es la propiedad de un sistema descompuesto en módulos…', o: ['…grandes y autónomos.', '…cohesivos y débilmente acoplados.', '…acoplados y con baja cohesión.', '…que se compilan juntos.'], a: 1, e: 'Alta cohesión adentro, bajo acoplamiento hacia afuera.' },
        { q: 'Una clase <code>VehiculoService</code> que calcula consumos, manda mails y genera PDFs tiene…', o: ['…alta cohesión.', '…baja cohesión.', '…bajo acoplamiento.', '…herencia múltiple.'], a: 1, e: 'Mezcla responsabilidades sin relación: baja cohesión.' },
        { q: '¿Cuál es la “piedra de toque” de Booch para la herencia?', o: ['Si B tiene los mismos atributos que A, B hereda de A.', 'Si B no “es un” tipo de A, B no debería heredar de A.', 'Si A y B están en el mismo módulo, se heredan.', 'Toda clase debe heredar de al menos otra.'], a: 1, e: 'La herencia expresa generalización/especialización, no reutilización de atributos.' },
        { q: 'La identificación de módulos forma parte del…', o: ['…diseño lógico.', '…diseño físico.', '…análisis de requisitos.', '…testing.'], a: 1, e: 'Clases y objetos: diseño lógico. Módulos: diseño físico.' },
        { q: 'Que se ejecute la versión de <code>CalcularConsumo</code> de la subclase real aunque la variable sea de tipo <code>Vehiculo</code> se llama…', o: ['Encapsulamiento', 'Polimorfismo', 'Agregación', 'Persistencia'], a: 1, e: 'El polimorfismo permite tratar subclases distintas a través de la misma interfaz.' },
      ],
      sources: [
        { title: 'Análisis y diseño orientado a objetos con aplicaciones', ref: 'Booch, cap. 2.2, págs. 60-73', points: ['Define modularidad con la cita de Parnas: las conexiones entre módulos son las suposiciones que cada uno hace de los demás.', 'Distingue diseño lógico (clases) de diseño físico (módulos).', 'Define jerarquía y presenta herencia simple, múltiple y agregación con el sistema de cultivo hidropónico.'] },
      ],
    },

    {
      id: 'tipos-concurrencia-persistencia',
      module: 'poo',
      title: 'Tipos, concurrencia y persistencia',
      keywords: 'tipos tipificacion tipado estricto debil estatico dinamico ligadura concurrencia hilo objeto activo persistencia base de datos tiempo espacio',
      tldr: 'Los tres elementos secundarios: los <mark>tipos</mark> impiden mezclar abstracciones incompatibles, la <mark>concurrencia</mark> permite objetos activos que actúan a la vez, y la <mark>persistencia</mark> hace que un objeto sobreviva al programa que lo creó.',
      goals: [
        'Citar las definiciones de tipos, concurrencia y persistencia.',
        'Diferenciar comprobación de tipos estricta y débil, y ligadura estática y dinámica.',
        'Ubicar estos conceptos en C# (tipado estático, async/await, Entity Framework).',
      ],
      body: `
        <h2>Tipos (tipificación)</h2>
        ${def('Tipos', 'Los tipos son la puesta en vigor de la clase de los objetos, de modo que los objetos de tipos distintos no pueden intercambiarse o, como mucho, pueden intercambiarse sólo de formas muy restringidas.', BOOCH)}
        <p>La idea central es la <strong>congruencia</strong>: dividir distancia por tiempo da velocidad, no peso. Un sistema de tipos deja que el lenguaje te ayude a no mezclar cosas que no tienen sentido juntas.</p>
        ${table(['Concepto', 'Qué significa', 'C#'], [
          ['Comprobación <strong>estricta</strong>', 'No se puede invocar una operación sobre un objeto si su clase no la define. Los errores aparecen al compilar.', 'Sí: <code>vehiculo.Volar()</code> no compila'],
          ['Comprobación <strong>débil</strong>', 'Los errores de tipo aparecen recién al ejecutar.', 'Solo con <code>dynamic</code>'],
          ['Ligadura <strong>estática</strong> (temprana)', 'Se decide al compilar qué código se ejecuta.', 'Métodos no virtuales'],
          ['Ligadura <strong>dinámica</strong> (tardía)', 'Se decide al ejecutar, según el tipo real del objeto.', 'Métodos <code>virtual</code>/<code>override</code>'],
        ])}
        <p>Comprobación de tipos y ligadura son conceptos independientes. C# es <strong>estrictamente tipado</strong> y usa <strong>ligadura dinámica</strong> para los métodos virtuales: esa combinación es la que hace posible el polimorfismo seguro.</p>
        ${code('cs', `Vehiculo v = new VehiculoElectrico();   // tipo estático: Vehiculo. Tipo real: VehiculoElectrico
double c = v.CalcularConsumo(100);      // ligadura dinámica: corre la versión de VehiculoElectrico
// v.KwhBase;                           // error de compilación: el tipo estático Vehiculo no tiene KwhBase
int km = "cien";                        // error CS0029: no se puede convertir string en int`)}
        <p>Booch enumera beneficios de los lenguajes con tipos estrictos: detectan errores temprano, la declaración de tipos documenta el programa, y el compilador puede generar código más eficiente.</p>

        <h2>Concurrencia</h2>
        <p>Un programa tiene al menos un <strong>hilo de control</strong>. Un sistema concurrente puede tener muchos. Mientras la POO se centra en la abstracción de datos, la concurrencia se centra en la abstracción de procesos y la sincronización. El objeto unifica ambas ideas: cada objeto puede representar un hilo de control separado. A esos objetos se los llama <strong>activos</strong>.</p>
        ${def('Concurrencia', 'La concurrencia es la propiedad que distingue un objeto activo de uno que no está activo.', BOOCH)}
        <p>Booch distingue el <strong>proceso pesado</strong> (manejado por el sistema operativo, con su propio espacio de direcciones) del <strong>proceso ligero</strong> o hilo (comparte el espacio de direcciones con otros). Cuando varios objetos activos tocan el mismo objeto hay que sincronizarlos para no corromper su estado.</p>
        <p>En C# vas a trabajar la concurrencia de forma moderna con <code>Task</code> y <code>async</code>/<code>await</code> (EJ13), y con temporizadores que disparan eventos (EJ12).</p>

        <h2>Persistencia</h2>
        <p>Un objeto ocupa espacio y existe durante cierto tiempo. Atkinson propone un espectro continuo de persistencia:</p>
        <ol>
          <li>Resultados transitorios en la evaluación de expresiones.</li>
          <li>Variables locales en la activación de procedimientos.</li>
          <li>Variables globales y elementos del heap cuya duración difiere de su ámbito.</li>
          <li>Datos que existen entre ejecuciones de un programa.</li>
          <li>Datos que existen entre varias versiones de un programa.</li>
          <li>Datos que sobreviven al programa.</li>
        </ol>
        <p>Los lenguajes tradicionales se ocupan de los tres primeros; los tres últimos son terreno de las bases de datos.</p>
        ${def('Persistencia', 'La persistencia es la propiedad de un objeto por la que su existencia trasciende el tiempo (es decir, el objeto continúa existiendo después de que su creador deja de existir) y/o el espacio (es decir, la posición del objeto varía con respecto al espacio de direcciones en el que fue creado).', BOOCH)}
        <p>En la Unidad 3 vas a resolver la persistencia con <strong>Entity Framework Core</strong>, un mapeador objeto-relacional: trabajás con objetos C# y EF los guarda en tablas de una base relacional. Es exactamente la unificación que Booch describe: una interfaz orientada a objetos sobre tecnología de bases de datos probada.</p>
        ${lab(0)}
      `,
      labs: [
        {
          type: 'classify',
          title: '¿Qué elemento del modelo de objetos aparece?',
          intro: 'Cada situación pone en juego un elemento. Identificalo.',
          buckets: ['Tipos', 'Concurrencia', 'Persistencia', 'Encapsulamiento'],
          items: [
            { t: 'El compilador rechaza <code>int edad = "veinte";</code>', b: 0, why: 'La comprobación estricta de tipos impide mezclar abstracciones.' },
            { t: 'Los médicos cargados en la API siguen ahí después de reiniciar el servidor', b: 2, why: 'Su existencia trasciende la ejecución del programa.' },
            { t: 'Las tres cotizaciones del dólar se piden al mismo tiempo con <code>Task.WhenAll</code>', b: 1, why: 'Varias operaciones activas en paralelo.' },
            { t: 'El saldo solo se modifica a través de <code>Depositar</code> y <code>Retirar</code>', b: 3, why: 'El estado interno queda oculto detrás de la interfaz.' },
            { t: 'Un temporizador dispara cada 250 ms la evolución de las estrellas', b: 1, why: 'Un objeto activo con su propio ritmo (EJ12).' },
            { t: 'El objeto se serializa a JSON y se envía a otra computadora', b: 2, why: 'El objeto cambia de espacio de direcciones: persistencia en el espacio.' },
          ],
        },
      ],
      quiz: [
        { q: 'C# detecta al compilar que llamás a un método que la clase no tiene. Eso es…', o: ['…comprobación débil de tipos.', '…comprobación estricta de tipos.', '…ligadura dinámica.', '…persistencia.'], a: 1, e: 'Estricta: los errores de tipo se detectan antes de ejecutar.' },
        { q: 'La ligadura dinámica significa que…', o: ['…el tipo de una variable cambia durante la ejecución.', '…se decide en tiempo de ejecución qué implementación de un método se ejecuta.', '…el programa se conecta a una base de datos.', '…los objetos se crean en el heap.'], a: 1, e: 'Es lo que permite el polimorfismo con métodos virtuales.' },
        { q: '“La propiedad que distingue un objeto activo de uno que no está activo” define…', o: ['Persistencia', 'Concurrencia', 'Modularidad', 'Tipos'], a: 1, e: 'Un objeto activo tiene su propio hilo de control.' },
        { q: 'Según Booch, la existencia de un objeto persistente trasciende…', o: ['…el tiempo y/o el espacio.', '…la clase y el módulo.', '…el compilador.', '…la herencia.'], a: 0, e: 'Sobrevive a su creador (tiempo) o cambia de espacio de direcciones (espacio).' },
        { q: 'Un proceso ligero (hilo)…', o: ['…tiene su propio espacio de direcciones.', '…comparte el espacio de direcciones con otros procesos ligeros.', '…no puede comunicarse con otros.', '…solo existe en sistemas con varios procesadores.'], a: 1, e: 'Por eso la comunicación entre hilos es barata, pero requiere sincronización.' },
      ],
      sources: [
        { title: 'Análisis y diseño orientado a objetos con aplicaciones', ref: 'Booch, cap. 2.2, págs. 73-86', points: ['Tipos: comprobación estricta y débil; ligadura estática y dinámica; polimorfismo.', 'Concurrencia: hilo de control, procesos pesados y ligeros, objetos activos.', 'Persistencia: espectro de Atkinson y bases de datos orientadas a objetos.'] },
      ],
    },

    {
      id: 'depuracion',
      module: 'poo',
      title: 'Depuración de código',
      keywords: 'depuracion debug debugger breakpoint punto de interrupcion paso a paso step over into out watch inspeccion pila de llamadas call stack errores sintaxis ejecucion logica ej01',
      tldr: 'Depurar es encontrar por qué un programa hace algo distinto de lo esperado. El <mark>depurador</mark> te deja frenar la ejecución en cualquier línea, mirar el valor de cada variable y avanzar de a un paso.',
      goals: [
        'Distinguir errores de compilación, de ejecución y de lógica.',
        'Usar puntos de interrupción, la ejecución paso a paso y la inspección de variables.',
        'Resolver el EJ01: encontrar y corregir los errores del cálculo de consumos.',
      ],
      body: `
        <h2>Tres tipos de errores</h2>
        ${table(['Tipo', 'Cuándo aparece', 'Cómo se detecta', 'Ejemplo'], [
          ['De compilación (sintaxis o tipos)', 'Antes de ejecutar', 'El compilador se niega a compilar y marca la línea', 'Falta un <code>;</code>, se usa una variable no declarada'],
          ['De ejecución', 'Mientras el programa corre', 'Una excepción detiene el programa', 'División por cero, <code>NullReferenceException</code>'],
          ['De lógica', 'Nunca “explota”', 'El resultado es incorrecto: hay que compararlo con lo esperado', 'Restar en vez de dividir, usar <code>&gt;=</code> donde va <code>&gt;</code>'],
        ])}
        <p>Los de lógica son los más difíciles, porque el programa “funciona”. Para encontrarlos necesitás saber qué resultado esperar (un caso de ejemplo calculado a mano) y un depurador.</p>

        <h2>El depurador</h2>
        <p>Visual Studio, VS Code, NetBeans o IntelliJ traen un depurador con las mismas herramientas básicas:</p>
        ${table(['Herramienta', 'Para qué sirve', 'Visual Studio'], [
          ['Punto de interrupción (breakpoint)', 'Frena la ejecución justo antes de esa línea', 'Clic en el margen o <kbd>F9</kbd>'],
          ['Iniciar depuración', 'Ejecuta el programa con el depurador conectado', '<kbd>F5</kbd>'],
          ['Paso a paso por procedimientos (step over)', 'Ejecuta la línea actual completa, sin entrar a los métodos que llama', '<kbd>F10</kbd>'],
          ['Paso a paso por instrucciones (step into)', 'Entra al método que se llama en la línea actual', '<kbd>F11</kbd>'],
          ['Paso a paso para salir (step out)', 'Termina el método actual y vuelve a quien lo llamó', '<kbd>Shift</kbd>+<kbd>F11</kbd>'],
          ['Ventanas Locales / Inspección (watch)', 'Muestran el valor de las variables en este momento', 'Depurar > Ventanas'],
          ['Pila de llamadas (call stack)', 'Muestra qué método llamó a cuál hasta llegar acá', 'Depurar > Ventanas'],
          ['Breakpoint condicional', 'Frena solo si se cumple una condición (ej. <code>patente == "AF456HI"</code>)', 'Clic derecho sobre el breakpoint'],
        ])}

        <h2>Un método para depurar</h2>
        ${lab(0)}
        <p>La clave está en el paso 1: sin un resultado esperado no sabés si lo que ves está bien o mal. El enunciado del EJ01 te lo da: <strong>34,40 kWh</strong> y <strong>33,45 litros</strong>.</p>

        <h2>El caso del EJ01</h2>
        <p>La empresa de logística calcula el consumo diario así:</p>
        <ul>
          <li><strong>Eléctricos:</strong> 16 kWh cada 100 km. Si la capacidad de carga <em>supera</em> los 1200 kg, se suma un 15 % al consumo.</li>
          <li><strong>A combustible:</strong> kilómetros a recorrer divididos por los km/litro. Si tienen <em>más de</em> 5 años de antigüedad, se suman los litros extra cada 15 km recorridos.</li>
        </ul>
        <p>Probá la fórmula correcta con los datos del enunciado antes de buscar los errores:</p>
        ${lab(1)}
        ${note('Fijate en las palabras exactas: “supera los 1200 kg” es <code>&gt; 1200</code>, no <code>&gt;= 1200</code>. “Más de 5 años” es <code>&gt; 5</code>. Muchos errores de lógica son fronteras mal traducidas.', 'warn')}
      `,
      labs: [
        {
          type: 'order',
          title: 'Los pasos para cazar un error de lógica',
          intro: 'Ordená los pasos de un proceso de depuración sistemático.',
          items: [
            'Conseguir un caso con el resultado esperado calculado a mano',
            'Reproducir el error: ejecutar con ese caso y ver que el resultado no coincide',
            'Poner un punto de interrupción antes de la parte sospechosa',
            'Avanzar paso a paso mirando las variables hasta encontrar el primer valor incorrecto',
            'Corregir la causa en el código',
            'Volver a ejecutar el caso (y los demás) para confirmar que quedó bien',
          ],
          explain: '<p>Encontrar el <strong>primer</strong> valor incorrecto es lo importante: los siguientes suelen ser consecuencia. Y volver a probar todos los casos evita que el arreglo rompa otra cosa.</p>',
        },
        {
          type: 'calc',
          title: 'Consumo esperado de un vehículo (EJ01)',
          intro: 'Calculadora con la fórmula correcta. Cargá los cuatro vehículos del enunciado y verificá los totales.',
          fields: [
            { id: 'tipo', label: 'Tipo', options: ['Eléctrico', 'Combustible'], value: 'Eléctrico' },
            { id: 'km', label: 'Km a recorrer', value: 100 },
            { id: 'carga', label: 'Capacidad de carga (kg)', value: 1300 },
            { id: 'anio', label: 'Año', value: 2021 },
            { id: 'kml', label: 'Km por litro', value: 7 },
            { id: 'extra', label: 'Litros extra', value: 1 },
          ],
          run: (v) => {
            const f = (n, d = 2) => n.toFixed(d).replace('.', ',');
            const age = 2026 - v.anio;
            if (v.tipo === 'Eléctrico') {
              const base = (v.km / 100) * 16;
              const total = v.carga > 1200 ? base * 1.15 : base;
              return `Base: ${v.km} / 100 × 16 = ${f(base)} kWh\n${v.carga > 1200 ? `Carga ${v.carga} > 1200 → × 1,15` : `Carga ${v.carga} no supera 1200 → sin recargo`}\nConsumo: <strong>${f(total)} kWh</strong>`;
            }
            const base = v.km / v.kml;
            const extras = age > 5 ? (v.km / 15) * v.extra : 0;
            return `Base: ${v.km} / ${v.kml} = ${f(base, 4)} l\nAntigüedad: ${age} años → ${age > 5 ? `más de 5: ${v.km} / 15 × ${v.extra} = ${f(extras, 4)} l extra` : 'no tiene más de 5, sin extra'}\nConsumo: <strong>${f(base + extras)} litros</strong>`;
          },
        },
      ],
      exercises: [
        {
          official: 'N° 1',
          level: 1,
          title: 'Repaso POO: encontrar y corregir los errores',
          prompt: `<p>El código del EJ01 (Java, en el zip de la cátedra) lista los vehículos de la empresa, permite ingresar los kilómetros de cada uno y calcula el total de consumo de los eléctricos (kWh) y de los de combustible (litros). Con 100 km cada uno, el resultado esperado es <strong>34,40 kWh</strong> y <strong>33,45 litros</strong>, pero el programa muestra otra cosa.</p>
          <p>Encontrá y corregí los errores de codificación. El código relevante es este:</p>
          ${code('java', `public class VehiculoElectrico extends Vehiculo {
    private double kwhBase;
    // …
    public double calcularConsumo() {
        double total = kwhBase;
        if (capacidadCarga >= 1200) {
            total = total + 0.15;
        }
        return total;
    }
}

public class VehiculoCombustible extends Vehiculo {
    private double kilometrosPorLitro;
    private double litrosExtra;
    // …
    @Override
    public double calcularConsumo(double kilometros) {
        double total = kilometrosPorLitro - litrosExtra;
        return total;
    }
}

public abstract class Vehiculo {
    // …
    public double calcularConsumo(double kilometros) {
        return 0;
    }
}`)}`,
          hints: [
            '¿El método de <code>VehiculoElectrico</code> sobrescribe realmente al de <code>Vehiculo</code>? Compará las firmas.',
            'Si una subclase no sobrescribe, ¿qué versión se ejecuta cuando el controlador llama a <code>calcularConsumo(km)</code>?',
            'Revisá cada fórmula contra el enunciado: ¿dónde están los kilómetros? ¿“supera” es <code>&gt;=</code>?',
            'Un 15 % adicional no es sumar 0.15.',
          ],
          solution: sol(`<p>Hay errores de los tres tipos que vimos:</p>
            <ol>
              <li><strong>Firma equivocada en <code>VehiculoElectrico</code>.</strong> <code>calcularConsumo()</code> no recibe los kilómetros, así que <em>no sobrescribe</em> a <code>calcularConsumo(double)</code>: es otro método (sobrecarga). El controlador llama a la versión con parámetro y se ejecuta la de <code>Vehiculo</code>, que devuelve 0. Por eso el total de eléctricos da 0. Agregar <code>@Override</code> lo habría detectado al compilar.</li>
              <li><strong>Fórmula eléctrica.</strong> Faltan los kilómetros (<code>km / 100 * kwhBase</code>), la condición es <code>&gt; 1200</code> (“supera”) y el 15 % es multiplicar por 1,15, no sumar 0,15.</li>
              <li><strong>Fórmula de combustible.</strong> Debe dividir los kilómetros por los km/l y, solo si la antigüedad supera los 5 años, sumar <code>km / 15 * litrosExtra</code>.</li>
              <li><strong>Diseño.</strong> Como cada vehículo calcula distinto, <code>calcularConsumo</code> debería ser <code>abstract</code> en la clase base: así el compilador obliga a cada subclase a implementarlo y es imposible el error 1.</li>
            </ol>
            <p>Verificación con 100 km: eléctricos 16 + 18,4 = <strong>34,40 kWh</strong>; combustible 12,5 + (14,2857 + 6,6667) = <strong>33,45 l</strong>.</p>`, [
            ['Vehiculo.java', 'java', `public abstract class Vehiculo {
    // …
    public abstract double calcularConsumo(double kilometros);
}`],
            ['VehiculoElectrico.java', 'java', `@Override
public double calcularConsumo(double kilometros) {
    double total = kilometros / 100 * kwhBase;
    if (capacidadCarga > 1200) {
        total = total * 1.15;
    }
    return total;
}`],
            ['VehiculoCombustible.java', 'java', `@Override
public double calcularConsumo(double kilometros) {
    int antiguedad = java.time.Year.now().getValue() - anio;
    double extras = antiguedad > 5 ? (kilometros / 15) * litrosExtra : 0;
    return kilometros / kilometrosPorLitro + extras;
}`],
          ]),
        },
      ],
      quiz: [
        { q: 'Un programa compila y no lanza ninguna excepción, pero el total da 0 cuando debería dar 34,40. Es un error…', o: ['…de compilación.', '…de ejecución.', '…de lógica.', '…del sistema operativo.'], a: 2, e: 'Los errores de lógica no detienen el programa: producen resultados incorrectos.' },
        { q: 'Estás detenido en una línea que llama a <code>CalcularConsumo(km)</code> y querés ver qué pasa adentro de ese método. Usás…', o: ['Step over (F10)', 'Step into (F11)', 'Step out (Shift+F11)', 'Continuar (F5)'], a: 1, e: 'Step into entra al método llamado.' },
        { q: '¿Para qué sirve un breakpoint condicional?', o: ['Para frenar solo cuando se cumple una condición, por ejemplo una patente específica.', 'Para que el programa no compile si hay errores.', 'Para ejecutar más rápido.', 'Para borrar variables.'], a: 0, e: 'Evita frenar en cada vuelta de un bucle cuando solo te interesa un caso.' },
        { q: 'En el EJ01, ¿por qué el consumo de los eléctricos da 0?', o: ['Porque kwhBase vale 0.', 'Porque <code>calcularConsumo()</code> sin parámetros no sobrescribe al de la clase base y se ejecuta el que devuelve 0.', 'Porque la lista de vehículos está vacía.', 'Porque falta un try/catch.'], a: 1, e: 'Firmas distintas: es sobrecarga, no sobrescritura.' },
        { q: '“Si la capacidad de carga supera los 1200 kg” se traduce como…', o: ['<code>capacidad >= 1200</code>', '<code>capacidad > 1200</code>', '<code>capacidad == 1200</code>', '<code>capacidad < 1200</code>'], a: 1, e: '“Supera” excluye el 1200: un vehículo de 1200 kg exactos no tiene recargo.' },
      ],
    },
  );
})();
