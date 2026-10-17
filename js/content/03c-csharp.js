/* Módulo: C# colecciones, LINQ, delegados, eventos y async (Unidad 2, clases 12 a 14: caps. 18, 20, 21 y Microsoft Learn) */
(() => {
  const { code, table, note, lab, fig, sol, flow } = window.GUIDE.h;
  const VCS = (c) => `Sharp, <em>Microsoft Visual C# Step by Step</em>, 10ª ed., cap. ${c}`;

  window.GUIDE.LESSONS.push(
    {
      id: 'colecciones',
      module: 'cs-adv',
      title: 'Colecciones',
      keywords: 'colecciones list linkedlist queue cola stack pila dictionary diccionario sortedlist hashset priorityqueue inicializadores find predicate lambda foreach ej11',
      tldr: 'Las colecciones de <code>System.Collections.Generic</code> guardan grupos de objetos que crecen y se achican. Elegir bien importa: <code>List&lt;T&gt;</code> para una secuencia, <code>Dictionary&lt;K,V&gt;</code> para buscar por clave, <code>HashSet&lt;T&gt;</code> para valores únicos.',
      goals: [
        'Elegir la colección adecuada para cada situación.',
        'Usar List, Dictionary, Queue, Stack y HashSet con sus operaciones principales.',
        'Inicializar colecciones y buscar con predicados y expresiones lambda.',
      ],
      body: `
        <h2>¿Por qué no alcanza con arreglos?</h2>
        <p>Un arreglo tiene tamaño fijo: para agregar un elemento hay que crear otro más grande y copiar. Las clases de colección resuelven eso y suman operaciones listas para usar. Las genéricas (<code>List&lt;T&gt;</code>) reemplazan a las viejas no genéricas (<code>ArrayList</code>), que guardaban <code>object</code>.</p>

        <h2>Las colecciones principales</h2>
        ${table(['Colección', 'Qué es', 'Operaciones clave', 'Usala para'], [
          ['<code>List&lt;T&gt;</code>', 'Lista ordenada por índice que crece sola', '<code>Add</code>, <code>Insert</code>, <code>Remove</code>, <code>[i]</code>, <code>Count</code>, <code>Find</code>, <code>Sort</code>', 'El caso general'],
          ['<code>Dictionary&lt;K,V&gt;</code>', 'Pares clave-valor, búsqueda muy rápida por clave', '<code>Add</code>, <code>[clave]</code>, <code>TryGetValue</code>, <code>ContainsKey</code>, <code>Remove</code>', 'Buscar por patente, por código, por id'],
          ['<code>HashSet&lt;T&gt;</code>', 'Conjunto sin repetidos', '<code>Add</code> (devuelve false si ya estaba), <code>Contains</code>, <code>UnionWith</code>, <code>IntersectWith</code>', 'Valores únicos'],
          ['<code>Queue&lt;T&gt;</code>', 'Cola FIFO: el primero que entra sale primero', '<code>Enqueue</code>, <code>Dequeue</code>, <code>Peek</code>', 'Turnos, tareas pendientes'],
          ['<code>Stack&lt;T&gt;</code>', 'Pila LIFO: el último que entra sale primero', '<code>Push</code>, <code>Pop</code>, <code>Peek</code>', 'Deshacer, historial'],
          ['<code>PriorityQueue&lt;E,P&gt;</code>', 'Cola donde sale primero el de mayor prioridad', '<code>Enqueue(e, p)</code>, <code>Dequeue</code>', 'Guardia médica por gravedad'],
          ['<code>LinkedList&lt;T&gt;</code>', 'Lista doblemente enlazada', '<code>AddFirst</code>, <code>AddLast</code>, <code>AddBefore</code>', 'Inserciones frecuentes en el medio'],
          ['<code>SortedList&lt;K,V&gt;</code>', 'Diccionario siempre ordenado por clave', 'Como Dictionary', 'Necesitás recorrer en orden'],
        ])}

        <h2>List y Dictionary en acción</h2>
        ${code('cs', `var vehiculos = new List<Vehiculo>
{
    new VehiculoElectrico("AE123FG", 1000),      // inicializador de colección
    new VehiculoElectrico("AF456HI", 1300),
};
vehiculos.Add(new VehiculoCombustible("AC789JK", 1200));
Console.WriteLine(vehiculos.Count);             // 3
Vehiculo? buscado = vehiculos.Find(v => v.Patente == "AF456HI");
vehiculos.RemoveAll(v => v.Anio < 2015);
vehiculos.Sort((a, b) => a.Patente.CompareTo(b.Patente));

var porPatente = new Dictionary<string, Vehiculo>();
foreach (var v in vehiculos) porPatente[v.Patente] = v;   // [] agrega o reemplaza
// porPatente.Add("AE123FG", otro);   // Add con clave repetida: ArgumentException

if (porPatente.TryGetValue("AE123FG", out var encontrado))
    Console.WriteLine(encontrado.Patente);

foreach (KeyValuePair<string, Vehiculo> par in porPatente)
    Console.WriteLine($"{par.Key}: {par.Value.CalcularConsumo(100)}");`)}
        ${note('Leer <code>diccionario["XX"]</code> con una clave que no existe lanza <code>KeyNotFoundException</code>. Usá <code>TryGetValue</code> o <code>ContainsKey</code> cuando la clave puede faltar.', 'warn')}
        ${lab(0)}

        <h2>Expresiones lambda</h2>
        <p>Muchos métodos de las colecciones reciben un <strong>predicado</strong>: una función que dice si un elemento cumple una condición. Las lambdas son la forma corta de escribirlas:</p>
        ${code('cs', `v => v.Anio > 2020                       // un parámetro, una expresión
(a, b) => a.Patente.CompareTo(b.Patente)  // dos parámetros
v => { var c = v.CalcularConsumo(100); return c > 20; }   // cuerpo con instrucciones
() => Console.WriteLine("sin parámetros")`)}
        <p>Las vas a usar todo el tiempo en LINQ y, en la próxima lección, vas a ver que una lambda no es otra cosa que un delegado.</p>
        ${lab(1)}
      `,
      labs: [
        {
          type: 'classify',
          title: '¿Qué colección usarías?',
          buckets: ['List', 'Dictionary', 'HashSet', 'Queue', 'Stack', 'PriorityQueue'],
          items: [
            { t: 'Turnos de un consultorio atendidos por orden de llegada', b: 3, why: 'FIFO: el primero que llega es el primero en ser atendido.' },
            { t: 'Buscar rápido un médico por su número de matrícula', b: 1, why: 'Búsqueda por clave.' },
            { t: 'Las acciones de un editor para poder deshacer la última', b: 4, why: 'LIFO: se deshace la más reciente.' },
            { t: 'Las especialidades distintas que aparecen en una lista de médicos', b: 2, why: 'Valores sin repetir.' },
            { t: 'Pacientes de una guardia atendidos según la gravedad', b: 5, why: 'Sale primero el de mayor prioridad, no el que llegó antes.' },
            { t: 'Los vehículos de la flota para listarlos y ordenarlos', b: 0, why: 'Una secuencia general.' },
          ],
        },
        {
          type: 'predict',
          title: '¿Qué imprime? Colecciones',
          code: `var cola = new Queue<string>();
cola.Enqueue("Ana"); cola.Enqueue("Luis"); cola.Enqueue("Sofía");
Console.WriteLine(cola.Dequeue());

var pila = new Stack<int>();
pila.Push(1); pila.Push(2); pila.Push(3);
Console.WriteLine(pila.Pop());

var unicos = new HashSet<string> { "Pediatría" };
Console.WriteLine(unicos.Add("Pediatría"));

var stock = new Dictionary<string, int> { ["yerba"] = 3 };
stock["yerba"] += 2;
Console.WriteLine(stock["yerba"]);
Console.WriteLine(stock.ContainsKey("azúcar"));`,
          expected: 'Ana\n3\nFalse\n5\nFalse',
          explain: '<p>La cola devuelve el primero que entró; la pila, el último. <code>HashSet.Add</code> devuelve false porque el elemento ya estaba. El indexador del diccionario lee y escribe por clave.</p>',
        },
      ],
      exercises: [
        {
          official: 'N° 11',
          level: 2,
          title: 'Colecciones y LINQ (CasoList, CasoDictionary, CasoLinq, Ejemplos)',
          prompt: `<p>Aceptar la asignación, clonar, crear <code>development</code>, completar el README y completar las clases <code>CasoList</code>, <code>CasoDictionary</code>, <code>CasoLinq</code> y <code>Ejemplos</code> siguiendo las instrucciones de cada una (están en los comentarios del repositorio). Confirmar, subir development y actualizar main con un pull request.</p>
            <p class="sec-lede">Las instrucciones detalladas están dentro de tu repositorio de Classroom, que es privado. Las prácticas de esta lección y de la siguiente cubren cada tipo de operación que suelen pedir.</p>`,
          hints: ['Antes de escribir un <code>foreach</code>, fijate si la colección ya tiene el método: <code>Find</code>, <code>Exists</code>, <code>RemoveAll</code>, <code>TrueForAll</code>.', 'En los diccionarios, decidí si la clave puede faltar: <code>TryGetValue</code>.', 'Para CasoLinq, mirá la lección siguiente: cada consulta se puede escribir en sintaxis de métodos o de consulta.'],
          solution: sol(`<p>Patrón general para cada caso: identificar si la tarea es <strong>buscar</strong> (Find, TryGetValue, FirstOrDefault), <strong>filtrar</strong> (FindAll, Where), <strong>transformar</strong> (ConvertAll, Select), <strong>agrupar o contar</strong> (diccionario acumulador o GroupBy) u <strong>ordenar</strong> (Sort, OrderBy). Estos son los equivalentes más comunes entre la API de las colecciones y LINQ:</p>`, [
            ['Equivalencias', 'cs', `// Buscar el primero que cumple
var a = lista.Find(p => p.Precio > 1000);
var b = lista.FirstOrDefault(p => p.Precio > 1000);

// Filtrar
List<Producto> c = lista.FindAll(p => p.Stock == 0);
var d = lista.Where(p => p.Stock == 0).ToList();

// ¿Alguno / todos?
bool e = lista.Exists(p => p.Stock == 0);   bool f = lista.Any(p => p.Stock == 0);
bool g = lista.TrueForAll(p => p.Precio > 0); bool h = lista.All(p => p.Precio > 0);

// Contar por categoría con un diccionario acumulador
var porCategoria = new Dictionary<string, int>();
foreach (var p in lista)
    porCategoria[p.Categoria] = porCategoria.GetValueOrDefault(p.Categoria) + 1;

// Lo mismo con LINQ
var porCategoria2 = lista.GroupBy(p => p.Categoria).ToDictionary(g => g.Key, g => g.Count());`],
          ]),
        },
      ],
      quiz: [
        { q: '¿Qué colección devuelve primero el último elemento que agregaste?', o: ['Queue', 'Stack', 'List', 'HashSet'], a: 1, e: 'Stack es LIFO.' },
        { q: '¿Qué pasa con <code>dic.Add("A", 1)</code> si la clave "A" ya existe?', o: ['Reemplaza el valor.', 'Lanza ArgumentException.', 'No hace nada.', 'Agrega un duplicado.'], a: 1, e: 'Add no admite claves repetidas; el indexador [] sí reemplaza.' },
        { q: '¿Cuál es la forma segura de leer una clave que puede no existir?', o: ['<code>dic[clave]</code>', '<code>dic.TryGetValue(clave, out var v)</code>', '<code>dic.Add(clave)</code>', '<code>dic.Find(clave)</code>'], a: 1, e: 'Devuelve false en lugar de lanzar KeyNotFoundException.' },
        { q: '<code>HashSet&lt;T&gt;.Add</code> devuelve…', o: ['…void.', '…true si lo agregó y false si ya estaba.', '…la cantidad de elementos.', '…el elemento.'], a: 1, e: 'Por eso sirve para detectar repetidos.' },
        { q: '¿Qué hace <code>lista.Find(v =&gt; v.Anio &gt; 2020)</code>?', o: ['Devuelve todos los que cumplen.', 'Devuelve el primero que cumple, o el valor por defecto (null) si ninguno.', 'Devuelve true o false.', 'Ordena la lista.'], a: 1, e: 'Para todos: FindAll.' },
      ],
      sources: [
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(18), points: ['Qué son las clases de colección.', 'List<T>, LinkedList<T>, Queue<T>, PriorityQueue, Stack<T>, Dictionary, SortedList, HashSet.', 'Inicializadores de colección; Find, predicados y la forma de las lambdas.', 'El juego de cartas reescrito con colecciones.'] },
        { title: 'Colecciones y estructuras de datos', url: 'https://learn.microsoft.com/es-es/dotnet/standard/collections/', points: ['Cómo elegir una colección.', 'Colecciones genéricas frente a las no genéricas.'] },
      ],
    },

    {
      id: 'linq',
      module: 'cs-adv',
      title: 'LINQ: consultas sobre colecciones',
      keywords: 'linq where select orderby thenby groupby join count sum average max min first firstordefault any all take skip tolist sintaxis de consulta metodos de extension evaluacion diferida ej11',
      tldr: 'LINQ (Language Integrated Query) te deja consultar cualquier colección con operadores como <code>Where</code>, <code>Select</code>, <code>OrderBy</code> y <code>GroupBy</code>, en sintaxis de métodos o de consulta. Las consultas se ejecutan recién cuando recorrés el resultado: <mark>evaluación diferida</mark>.',
      goals: [
        'Filtrar, proyectar, ordenar, agrupar y agregar datos con LINQ.',
        'Traducir entre la sintaxis de métodos y la sintaxis de consulta.',
        'Explicar la evaluación diferida y cuándo forzar la ejecución con ToList.',
      ],
      body: `
        <h2>Los operadores esenciales</h2>
        ${table(['Operador', 'Qué hace', 'Ejemplo'], [
          ['<code>Where</code>', 'Filtra', '<code>.Where(p =&gt; p.Stock &gt; 0)</code>'],
          ['<code>Select</code>', 'Proyecta: transforma cada elemento', '<code>.Select(p =&gt; p.Description)</code>'],
          ['<code>OrderBy</code> / <code>OrderByDescending</code> / <code>ThenBy</code>', 'Ordena', '<code>.OrderBy(p =&gt; p.Category).ThenBy(p =&gt; p.Price)</code>'],
          ['<code>GroupBy</code>', 'Agrupa por una clave', '<code>.GroupBy(p =&gt; p.Category)</code>'],
          ['<code>Join</code>', 'Combina dos secuencias por una clave', '<code>doctors.Join(specs, d =&gt; d.SpecId, s =&gt; s.Id, (d, s) =&gt; …)</code>'],
          ['<code>Count</code>, <code>Sum</code>, <code>Average</code>, <code>Max</code>, <code>Min</code>', 'Agregan a un solo valor', '<code>.Sum(p =&gt; p.Price)</code>'],
          ['<code>First</code>, <code>FirstOrDefault</code>, <code>Single</code>', 'Un elemento', '<code>.FirstOrDefault(p =&gt; p.Code == 40)</code>'],
          ['<code>Any</code>, <code>All</code>', 'Preguntas de sí o no', '<code>.Any(p =&gt; p.Stock == 0)</code>'],
          ['<code>Take</code>, <code>Skip</code>', 'Paginación', '<code>.Skip(10).Take(10)</code>'],
          ['<code>ToList</code>, <code>ToArray</code>, <code>ToDictionary</code>', 'Ejecutan y materializan', '<code>.ToList()</code>'],
        ])}
        <p>Armá consultas encadenando operadores y mirá las dos sintaxis y el resultado:</p>
        ${lab(0)}

        <h2>Dos sintaxis, una consulta</h2>
        ${code('cs', `// Sintaxis de métodos (métodos de extensión de IEnumerable<T>)
var baratos = products
    .Where(p => p.Price < 5000)
    .OrderBy(p => p.Price)
    .Select(p => new { p.Description, p.Price });

// Sintaxis de consulta: el compilador la traduce a la de arriba
var baratos2 = from p in products
               where p.Price < 5000
               orderby p.Price
               select new { p.Description, p.Price };

// Agrupar y agregar
var porCategoria = from p in products
                   group p by p.Category into g
                   select new { Categoria = g.Key, Cantidad = g.Count(), Total = g.Sum(p => p.Price) };`)}
        <p>Algunos operadores (<code>Take</code>, <code>Count</code>, <code>First</code>…) no tienen palabra clave: se combinan las sintaxis con paréntesis. En la práctica, la sintaxis de métodos es la más usada.</p>
        <h3>Join</h3>
        ${code('cs', `var medicos = from d in doctors
              join s in specialities on d.SpecialityId equals s.Id
              select new { d.Name, Especialidad = s.Name };`)}

        <h2>Evaluación diferida</h2>
        <p>Una consulta LINQ no se ejecuta cuando la definís, sino cada vez que la recorrés (<code>foreach</code>, <code>ToList()</code>, <code>Count()</code>…). Eso tiene dos consecuencias:</p>
        <ul>
          <li>Si los datos cambian entre la definición y el recorrido, la consulta ve los datos nuevos.</li>
          <li>Si la recorrés dos veces, se ejecuta dos veces.</li>
        </ul>
        <p>Para “congelar” el resultado, materializalo con <code>ToList()</code> o <code>ToArray()</code>: evaluación inmediata y en caché.</p>
        ${lab(1)}
        ${note('Con Entity Framework (Unidad 3) esto se vuelve clave: mientras la consulta no se ejecuta, EF puede traducirla entera a SQL. Un <code>ToList()</code> antes de tiempo trae toda la tabla a memoria.', 'exam')}
      `,
      labs: [
        {
          type: 'linq',
          title: 'Constructor de consultas LINQ',
          intro: 'Agregá y quitá operadores. Probá a poner ThenBy sin OrderBy, o un Select antes de un Where.',
        },
        {
          type: 'predict',
          title: '¿Qué imprime? Evaluación diferida',
          code: `var numeros = new List<int> { 1, 2, 3 };
var pares = numeros.Where(n => n % 2 == 0);
var paresYa = numeros.Where(n => n % 2 == 0).ToList();
numeros.Add(4);
Console.WriteLine(pares.Count());
Console.WriteLine(paresYa.Count);
Console.WriteLine(string.Join(",", pares.Select(n => n * 10)));`,
          expected: '2\n1\n20,40',
          explain: '<p><code>pares</code> es una consulta diferida: al contarla ya incluye el 4 que se agregó después. <code>paresYa</code> se ejecutó con <code>ToList()</code> cuando la lista era {1, 2, 3}: quedó con un solo elemento.</p>',
        },
      ],
      quiz: [
        { q: '¿Qué hace <code>Select</code>?', o: ['Filtra elementos.', 'Transforma cada elemento en otro valor (proyección).', 'Ordena.', 'Elige el primero.'], a: 1, e: 'Where filtra; Select proyecta.' },
        { q: '¿Cuándo se ejecuta <code>var q = lista.Where(x =&gt; x &gt; 5);</code>?', o: ['En esa línea.', 'Cuando se recorre q (foreach, ToList, Count…).', 'Nunca.', 'Al compilar.'], a: 1, e: 'Evaluación diferida.' },
        { q: '<code>FirstOrDefault</code> sin coincidencias en una lista de objetos devuelve…', o: ['Una excepción.', 'null (el valor por defecto del tipo).', 'El primer elemento.', 'Una lista vacía.'], a: 1, e: 'First, en cambio, lanzaría InvalidOperationException.' },
        { q: '¿Qué operador necesitás para ordenar por categoría y, dentro de cada categoría, por precio?', o: ['OrderBy y luego OrderBy', 'OrderBy y luego ThenBy', 'GroupBy', 'Sort'], a: 1, e: 'Un segundo OrderBy desordenaría el primero.' },
        { q: '<code>from p in products where p.Stock &gt; 0 select p.Description</code> en sintaxis de métodos es…', o: ['<code>products.Select(p =&gt; p.Description).Where(p =&gt; p.Stock &gt; 0)</code>', '<code>products.Where(p =&gt; p.Stock &gt; 0).Select(p =&gt; p.Description)</code>', '<code>products.Filter(p.Stock).Map(Description)</code>', '<code>products.OrderBy(p =&gt; p.Stock)</code>'], a: 1, e: 'Primero se filtra y después se proyecta.' },
        { q: '¿Qué devuelve <code>products.Any(p =&gt; p.Stock == 0)</code>?', o: ['La cantidad sin stock.', 'true si al menos uno no tiene stock.', 'El primero sin stock.', 'Una lista.'], a: 1, e: 'Any responde sí o no.' },
      ],
      sources: [
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(21), points: ['Qué es LINQ; seleccionar, filtrar, ordenar, agrupar y agregar.', 'Join; operadores de consulta frente a métodos de extensión.', 'Consultas sobre el árbol binario genérico.', 'LINQ y la evaluación diferida; caché con ToList.'] },
        { title: 'Introducción a las consultas LINQ', url: 'https://learn.microsoft.com/es-es/dotnet/csharp/linq/get-started/introduction-to-linq-queries', points: ['Las tres partes de una consulta: origen, creación y ejecución.', 'Ejecución diferida e inmediata.'] },
      ],
    },

    {
      id: 'delegados-eventos',
      module: 'cs-adv',
      title: 'Delegados y eventos',
      keywords: 'delegados delegate action func predicate multicast lista de invocacion lambdas clausuras eventos event += -= invoke eventhandler eventargs desacoplar suscriptores publicador ej12 constelacion estrellas',
      tldr: 'Un <mark>delegado</mark> es una referencia a un método: lo guardás en una variable y lo invocás después. Un <mark>evento</mark> es un delegado protegido: los demás solo pueden suscribirse o desuscribirse, y únicamente la clase dueña lo dispara.',
      goals: [
        'Declarar, asignar e invocar delegados, incluidos Action y Func.',
        'Relacionar las expresiones lambda con los delegados.',
        'Declarar eventos, suscribirse, desuscribirse y dispararlos con el patrón EventHandler.',
        'Resolver el EJ12 con eventos.',
      ],
      body: `
        <h2>Delegados</h2>
        <p>A veces una clase necesita ejecutar código que no conoce de antemano: “cuando termines, avisale a quien corresponda”. Un delegado guarda una referencia a un método con una firma determinada.</p>
        ${code('cs', `public delegate void PasoDelTiempoDelegate();       // declara el TIPO de delegado: métodos void sin parámetros

PasoDelTiempoDelegate? paso = null;
paso += estrella1.EvolucionEstelar;                  // asignar (sin paréntesis: no se ejecuta)
paso += estrella2.EvolucionEstelar;                  // multicast: guarda varios métodos
paso?.Invoke();                                      // ejecuta los dos, en orden
paso -= estrella1.EvolucionEstelar;                  // quitar uno`)}
        <p>La lista de métodos de un delegado se llama <strong>lista de invocación</strong>. Si está vacía, el delegado vale <code>null</code>: por eso se invoca con <code>?.Invoke()</code>.</p>
        <h3>Los delegados genéricos de .NET</h3>
        <p>Casi nunca hace falta declarar un tipo de delegado propio:</p>
        ${table(['Tipo', 'Firma', 'Ejemplo'], [
          ['<code>Action</code>, <code>Action&lt;T1, T2…&gt;</code>', 'No devuelve nada', '<code>Action&lt;string&gt; log = m =&gt; Console.WriteLine(m);</code>'],
          ['<code>Func&lt;T1…, TResult&gt;</code>', 'Devuelve TResult (el último tipo)', '<code>Func&lt;double, double&gt; conIva = p =&gt; p * 1.21;</code>'],
          ['<code>Predicate&lt;T&gt;</code>', 'Devuelve bool', '<code>Predicate&lt;Vehiculo&gt; nuevo = v =&gt; v.Anio &gt; 2020;</code>'],
        ])}
        <p>Una <strong>expresión lambda</strong> es un método anónimo que se convierte en un delegado. <code>Where(p =&gt; p.Stock &gt; 0)</code> le pasa a LINQ un <code>Func&lt;Product, bool&gt;</code>. Las lambdas pueden <strong>capturar</strong> variables del método donde se escriben (clausuras).</p>

        <h2>Desacoplar con delegados</h2>
        <p>El ejemplo del libro: <code>CheckoutController</code> procesa una compra y después tiene que avisar a otros componentes (auditoría, envíos). Si los llamara directamente, quedaría acoplado a todos. Con un delegado, cada componente se suscribe y el controlador no sabe quiénes son:</p>
        ${code('cs', `public class CheckoutController
{
    public delegate void CheckoutDelegate(Order order);
    public CheckoutDelegate? CheckoutProcessing;

    public void StartCheckoutProcessing(Order order)
    {
        CheckoutProcessing?.Invoke(order);   // avisa a todos sin conocerlos
    }
}

var checkout = new CheckoutController();
checkout.CheckoutProcessing += auditor.AuditOrder;
checkout.CheckoutProcessing += shipper.ShipOrder;`)}

        <h2>Eventos</h2>
        <p>Con un delegado público hay un problema: cualquier código externo puede hacer <code>CheckoutProcessing = null</code> (borrando todas las suscripciones) o invocarlo como si fuera el dueño. La palabra <code>event</code> lo impide: desde afuera solo se permite <code>+=</code> y <code>-=</code>.</p>
        ${lab(0)}
        <h3>El patrón estándar de .NET</h3>
        ${code('cs', `public class Estrella
{
    // EventHandler<T>: (object? sender, T e). El emisor y los datos del evento
    public event EventHandler<Luminosidad>? LuminosidadCambiada;

    private void CambiarLuminosidad(Luminosidad nueva)
    {
        _luminosidad = nueva;
        LuminosidadCambiada?.Invoke(this, nueva);   // solo la clase dueña dispara
    }
}

// Suscripción con una lambda
estrella.LuminosidadCambiada += (sender, lum) => Console.WriteLine($"Ahora brilla {lum}");`)}
        <p>Las interfaces gráficas funcionan así: un botón tiene un evento <code>Click</code> y tu código se suscribe. El botón no sabe qué va a pasar; vos no sabés cómo detecta el clic. Están desacoplados.</p>
        ${note('Si un objeto de vida corta se suscribe a un evento de uno de vida larga y nunca se desuscribe, el de vida larga lo mantiene vivo: es una fuga de memoria clásica. Desuscribite con <code>-=</code> cuando ya no haga falta.', 'warn')}
      `,
      labs: [
        {
          type: 'events',
          title: 'La constelación: delegado contra evento (EJ12)',
          intro: 'Creá estrellas, hacé pasar el tiempo y probá qué puede hacer el código de afuera con y sin la palabra <code>event</code>.',
        },
      ],
      exercises: [
        {
          official: 'N° 12',
          level: 3,
          title: 'Constelación y evolución estelar con eventos',
          prompt: `<p>El repositorio <code>dsw2026-ej12</code> tiene un dominio (<code>Constelacion</code>, <code>Estrella</code>, <code>Luminosidad</code>) y una presentación de consola que dibuja asteriscos en posiciones al azar, sin relación con el dominio. Completar la aplicación para crear estrellas en una constelación y simular la evolución estelar, <strong>usando eventos y delegados</strong>.</p>`,
          hints: ['Primer obstáculo: el proyecto Presentation no referencia al de Domain. Agregá la referencia.', 'La constelación ya usa un delegado privado. ¿Qué cambia si lo hacés un <code>event</code> público?', 'La estrella cambia su luminosidad con el paso del tiempo: es un buen momento para disparar un evento que la vista escuche para redibujarse.', 'La posición la decide el dominio (proporciones X e Y entre 0 y 1); la vista la traduce a columnas y filas de la consola.', 'El Timer dispara en otro hilo: protegé el acceso a la consola con <code>lock</code>.'],
          solution: sol(`<p>Compilado con .NET 10 y probado: una estrella recorre Media → Alta → Baja → Nula y dispara <code>Murio</code>. El diseño separa responsabilidades con eventos:</p>
            <ul>
              <li><code>Constelacion.PasoDelTiempo</code> pasa a ser un <code>event</code>: solo la constelación (con su Timer) hace avanzar el tiempo.</li>
              <li><code>Constelacion.EstrellaCreada</code> avisa a la vista que hay una estrella nueva.</li>
              <li><code>Estrella.LuminosidadCambiada</code> avisa cuando cambia el brillo; la vista se suscribe y redibuja con otro color.</li>
              <li><code>Estrella.Murio</code> permite a la constelación desuscribirla del paso del tiempo.</li>
            </ul>
            <p>El dominio no sabe nada de la consola: podrías cambiar la presentación por una web sin tocarlo.</p>`, [
            ['Comando previo', 'bash', 'dotnet add Dsw2026Ej12.Presentation reference Dsw2026Ej12.Domain'],
            ['Dsw2026Ej12.Domain/Constelacion.cs', 'cs', `using System.Timers;

namespace Dsw2026Ej12.Domain;

public delegate void PasoDelTiempoDelegate();

public class Constelacion
{
    private readonly System.Timers.Timer _timer;
    private readonly Random _random = new();

    // Solo la constelación dispara el paso del tiempo; afuera solo += o -=
    public event PasoDelTiempoDelegate? PasoDelTiempo;
    // Avisa a la presentación que hay una estrella nueva para dibujar
    public event EventHandler<Estrella>? EstrellaCreada;

    public double Ancho { get; }
    public double Alto { get; }
    public string Nombre { get; set; }
    public List<Estrella> Estrellas { get; }

    public Constelacion(string nombre)
    {
        Nombre = nombre;
        Ancho = 100;
        Alto = 80;
        Estrellas = [];
        _timer = new System.Timers.Timer(250); // cada tick es un año
        _timer.Elapsed += OnTimerElapsed;
        _timer.Start();
    }

    private void OnTimerElapsed(object? sender, ElapsedEventArgs e) => PasoDelTiempo?.Invoke();

    public Estrella CrearEstrella()
    {
        var estrella = new Estrella(_random.Next(1, (int)Ancho) / Ancho, _random.Next(1, (int)Alto) / Alto);
        PasoDelTiempo += estrella.EvolucionEstelar;
        estrella.Murio += OnEstrellaMurio;
        Estrellas.Add(estrella);
        EstrellaCreada?.Invoke(this, estrella);
        return estrella;
    }

    // Una estrella apagada ya no necesita enterarse del paso del tiempo
    private void OnEstrellaMurio(object? sender, EventArgs e)
    {
        if (sender is Estrella estrella) PasoDelTiempo -= estrella.EvolucionEstelar;
    }
}`],
            ['Dsw2026Ej12.Domain/Estrella.cs', 'cs', `namespace Dsw2026Ej12.Domain;

public class Estrella
{
    private Luminosidad _luminosidad = Luminosidad.Media;

    public double X { get; }
    public double Y { get; }
    public int Edad { get; private set; }
    public int TiempoDeVida { get; }

    public Luminosidad Luminosidad
    {
        get => _luminosidad;
        private set
        {
            if (_luminosidad == value) return;   // solo se avisa cuando cambia
            _luminosidad = value;
            LuminosidadCambiada?.Invoke(this, value);
        }
    }

    public event EventHandler<Luminosidad>? LuminosidadCambiada;
    public event EventHandler? Murio;

    public Estrella(double x, double y)
    {
        X = x;
        Y = y;
        TiempoDeVida = Random.Shared.Next(50, 300);
    }

    public void EvolucionEstelar()
    {
        if (Edad > TiempoDeVida)
        {
            Luminosidad = Luminosidad.Nula;
            Murio?.Invoke(this, EventArgs.Empty);
            return;
        }
        Luminosidad = Edad <= TiempoDeVida * 0.1 ? Luminosidad.Media
                    : Edad <= TiempoDeVida * 0.8 ? Luminosidad.Alta
                    : Luminosidad.Baja;
        Edad++;
    }
}`],
            ['Dsw2026Ej12.Presentation/EstrellaTexto.cs', 'cs', `using Dsw2026Ej12.Domain;

namespace Dsw2026Ej12.Presentation;

internal class EstrellaTexto
{
    // El Timer dispara en otro hilo: la consola se usa de a uno
    private static readonly object ConsolaLock = new();
    private readonly int _x;
    private readonly int _y;

    public EstrellaTexto(Estrella estrella, int ancho, int alto)
    {
        _x = 2 + (int)(estrella.X * (ancho - 4));
        _y = 2 + (int)(estrella.Y * (alto - 6));
        estrella.LuminosidadCambiada += (_, luminosidad) => Dibujar(luminosidad);
        Dibujar(estrella.Luminosidad);
    }

    private void Dibujar(Luminosidad luminosidad)
    {
        var (color, simbolo) = luminosidad switch
        {
            Luminosidad.Alta => (ConsoleColor.Yellow, '*'),
            Luminosidad.Media => (ConsoleColor.White, '*'),
            Luminosidad.Baja => (ConsoleColor.DarkRed, '.'),
            _ => (ConsoleColor.Black, ' '),
        };
        lock (ConsolaLock)
        {
            Console.ForegroundColor = color;
            Console.SetCursorPosition(_x, _y);
            Console.Write(simbolo);
            Console.ResetColor();
        }
    }
}`],
            ['Dsw2026Ej12.Presentation/VistaPrincipal.cs (cambios)', 'cs', `using Dsw2026Ej12.Domain;

internal class VistaPrincipal
{
    private static int _width = 140;
    private static int _height = 50;
    private static readonly Constelacion _constelacion = new("Orión");

    public static void Iniciar()
    {
        _constelacion.EstrellaCreada += (_, estrella) => new EstrellaTexto(estrella, _width, _height);
        // … el resto de Iniciar queda igual …
    }

    static void DibujarEstrella()
    {
        _constelacion.CrearEstrella();   // la vista se entera por el evento EstrellaCreada
    }
}`],
          ]),
        },
      ],
      quiz: [
        { q: '¿Qué es un delegado?', o: ['Una clase abstracta.', 'Un tipo que referencia a uno o más métodos con una firma determinada.', 'Un hilo.', 'Una colección.'], a: 1, e: 'Permite pasar métodos como datos.' },
        { q: '<code>paso += obj.Metodo;</code> con <code>paso</code> un delegado…', o: ['…ejecuta Metodo.', '…agrega Metodo a la lista de invocación.', '…reemplaza la lista.', '…no compila.'], a: 1, e: 'Sin paréntesis no se ejecuta: se suscribe.' },
        { q: '¿Qué tipo de delegado corresponde a <code>p =&gt; p.Precio * 1.21</code> con p de tipo Producto y resultado decimal?', o: ['Action&lt;Producto&gt;', 'Func&lt;Producto, decimal&gt;', 'Predicate&lt;Producto&gt;', 'EventHandler'], a: 1, e: 'Func: el último parámetro de tipo es el retorno.' },
        { q: '¿Qué agrega la palabra <code>event</code> a un delegado público?', o: ['Nada.', 'Que desde afuera de la clase solo se pueda usar += y -=.', 'Que se ejecute en otro hilo.', 'Que no pueda tener suscriptores.'], a: 1, e: 'Solo la clase dueña puede asignarlo o invocarlo.' },
        { q: '¿Por qué se dispara un evento con <code>?.Invoke(...)</code>?', o: ['Para que sea más rápido.', 'Porque si no hay suscriptores el evento vale null.', 'Porque es obligatorio con lambdas.', 'Para que sea asíncrono.'], a: 1, e: 'Invocar null lanzaría NullReferenceException.' },
        { q: 'En el patrón <code>EventHandler&lt;T&gt;</code>, ¿qué representa el primer parámetro?', o: ['Los datos del evento.', 'El objeto que dispara el evento (sender).', 'El suscriptor.', 'La hora.'], a: 1, e: '(object? sender, T e).' },
      ],
      sources: [
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(20), points: ['Delegados: declarar, asignar, invocar; ejemplos de la biblioteca de .NET.', 'La aplicación Wide World Importers y el CheckoutController.', 'Expresiones lambda y delegados.', 'Notificaciones con eventos: declarar, suscribirse, desuscribirse y disparar; eventos de la interfaz de usuario.'] },
        { title: 'Eventos en .NET', url: 'https://learn.microsoft.com/es-es/dotnet/standard/events/', points: ['Patrón EventHandler y EventHandler<TEventArgs>.', 'Cómo provocar y consumir eventos.'] },
      ],
    },

    {
      id: 'async-await',
      module: 'cs-adv',
      title: 'Programación asincrónica con async y await',
      keywords: 'async await task asincronico asincrono task.whenall whenany esperar hilo bloqueo result wait deadlock e/s cpu task.run cancellationtoken async void ej13 cotizaciones',
      tldr: '<code>async</code>/<code>await</code> permite esperar operaciones lentas (red, disco, base de datos) <mark>sin bloquear el hilo</mark>. Y si las esperas son independientes, podés iniciarlas todas juntas y esperar con <code>Task.WhenAll</code>: el tiempo total pasa a ser el de la más lenta.',
      goals: [
        'Explicar qué problema resuelve la programación asincrónica.',
        'Escribir métodos async que devuelvan Task y Task<T> y esperarlos con await.',
        'Ejecutar tareas independientes en paralelo con Task.WhenAll.',
        'Evitar los errores comunes: .Result, .Wait() y async void.',
        'Resolver el EJ13.',
      ],
      body: `
        <h2>La analogía del desayuno</h2>
        <p>Microsoft Learn la explica con un desayuno: café, huevos, panceta y tostadas. Un cocinero sincrónico pone los huevos y se queda mirándolos hasta que estén; recién después empieza la panceta. Un cocinero asincrónico pone los huevos, y mientras se cocinan arranca la panceta y las tostadas. No hay más cocineros (no hacen falta más hilos): el mismo cocinero no se queda parado esperando.</p>
        <p>Las operaciones de <strong>entrada/salida</strong> (pedir algo a un servicio web, leer un archivo, consultar una base) pasan la mayor parte del tiempo esperando. Bloquear un hilo durante esa espera es desperdicio: en una app de escritorio la ventana se congela; en un servidor web, ese hilo no puede atender a otros usuarios.</p>

        <h2>Task, async y await</h2>
        ${code('cs', `// Un método asincrónico: devuelve Task<T> (o Task si no devuelve nada)
public async Task<decimal> GetAverageDollarQuoteAsync()
{
    decimal q1 = await QuoteManager.GetDollarQuoteOptionOneAsync();   // espera sin bloquear
    decimal q2 = await QuoteManager.GetDollarQuoteOptionTwoAsync();
    decimal q3 = await QuoteManager.GetDollarQuoteOptionThreeAsync();
    return (q1 + q2 + q3) / 3;                                         // se devuelve decimal; el compilador lo envuelve en Task
}`)}
        <ul>
          <li>Un <code>Task</code> representa una operación que <strong>terminará en el futuro</strong>. <code>Task&lt;T&gt;</code> además producirá un valor de tipo T.</li>
          <li><code>await</code> suspende el método hasta que la tarea termina, <strong>liberando el hilo</strong> mientras tanto. Después, el método continúa donde quedó.</li>
          <li>Un método que usa <code>await</code> debe marcarse <code>async</code>. Por convención, su nombre termina en <code>Async</code>.</li>
        </ul>
        ${note('async no significa paralelo. El código de arriba no bloquea el hilo, pero espera las tres cotizaciones una después de otra: tarda lo mismo que la versión sincrónica. Para ganar tiempo hay que iniciar las tareas antes de esperarlas.', 'exam')}

        <h2>Iniciar todo, esperar todo junto</h2>
        ${code('cs', `public async Task<decimal> GetAverageDollarQuoteAsync()
{
    // 1. Iniciar: cada llamada devuelve un Task en marcha (todavía sin await)
    Task<decimal> t1 = QuoteManager.GetDollarQuoteOptionOneAsync();
    Task<decimal> t2 = QuoteManager.GetDollarQuoteOptionTwoAsync();
    Task<decimal> t3 = QuoteManager.GetDollarQuoteOptionThreeAsync();

    // 2. Esperar a que terminen todas
    decimal[] quotes = await Task.WhenAll(t1, t2, t3);
    return quotes.Average();
}`)}
        ${table(['Método', 'Espera a…'], [
          ['<code>await Task.WhenAll(t1, t2, …)</code>', 'que terminen todas. Si son <code>Task&lt;T&gt;</code>, devuelve un arreglo con los resultados'],
          ['<code>await Task.WhenAny(t1, t2, …)</code>', 'que termine la primera; devuelve esa tarea'],
          ['<code>await Task.Delay(1000)</code>', 'un tiempo, sin bloquear (el equivalente asincrónico de Thread.Sleep)'],
        ])}
        <p>Compará las versiones con la línea de tiempo del EJ13:</p>
        ${lab(0)}

        <h2>Reglas para no equivocarse</h2>
        <ul>
          <li><strong>Async hasta arriba:</strong> si un método llama a uno async, también debería ser async, y así hasta <code>Main</code> (<code>static async Task Main()</code>) o hasta la acción del controlador en una API.</li>
          <li><strong>No bloquees con <code>.Result</code> ni <code>.Wait()</code>:</strong> convierten la espera en bloqueante y pueden causar deadlocks.</li>
          <li><strong>Evitá <code>async void</code>:</strong> sus excepciones no se pueden atrapar desde afuera. La única excepción son los manejadores de eventos de UI.</li>
          <li><strong>E/S contra CPU:</strong> para esperar red o disco usá los métodos <code>…Async</code> de la biblioteca. Para un cálculo pesado que no querés que congele la interfaz, <code>await Task.Run(() =&gt; Calcular())</code> lo pasa a otro hilo.</li>
          <li><strong>Cancelación:</strong> los métodos async suelen aceptar un <code>CancellationToken</code> para abortar una operación que ya no hace falta.</li>
        </ul>
        ${code('cs', `// Leer un archivo de forma asincrónica
public static async Task<List<Product>?> GetProductsFromFileAsync()
{
    await using var stream = File.OpenRead(Path.Combine("Data", "Products.json"));
    return await JsonSerializer.DeserializeAsync<List<Product>>(stream);
}`)}
      `,
      labs: [
        {
          type: 'async',
          title: 'Línea de tiempo del EJ13',
          intro: 'Duraciones aproximadas de cada operación. Ejecutá cada versión y compará el tiempo total y el estado del hilo.',
        },
      ],
      exercises: [
        {
          official: 'N° 13',
          level: 2,
          title: 'Conversor de precios ARS a USD más rápido',
          prompt: `<p>El proyecto <code>dsw2026-ej13</code> obtiene productos de un archivo JSON y de un servicio web, consulta la cotización del dólar en tres servicios distintos y actualiza el precio de cada producto con el promedio. Todo es sincrónico. Mejorar el rendimiento con programación asincrónica.</p>`,
          hints: ['La librería ya ofrece versiones asincrónicas: <code>GetDollarQuoteOptionOneAsync</code>, <code>GetProductsAsync</code>… Revisalas con IntelliSense.', 'Para el archivo, <code>File.OpenRead</code> + <code>JsonSerializer.DeserializeAsync</code>.', 'Las cotizaciones no dependen de los productos, y viceversa: todo puede arrancar a la vez.', '<code>Main</code> también tiene que ser <code>async Task</code>.'],
          solution: sol(`<p>Medido con la librería real del repositorio: el original tarda <strong>8.155 ms</strong> y esta versión <strong>1.569 ms</strong>. Las cinco operaciones de entrada/salida (tres cotizaciones, el servicio web y el archivo) se inician juntas y se esperan con <code>Task.WhenAll</code>.</p>
            <p>Detalle aparte: el original lee <code>"Data\\\\Products.json"</code> con barra invertida, que falla en Linux y macOS. <code>Path.Combine("Data", "Products.json")</code> funciona en cualquier sistema.</p>`, [
            ['Services/ExchangeService.cs', 'cs', `using Dsw2026Ej13.Domain;
using Dsw2026Ej13.Library;

namespace Dsw2026Ej13.Services;

internal class ExchangeService
{
    public async Task<decimal> GetAverageDollarQuoteAsync()
    {
        // Las tres consultas arrancan juntas y se esperan juntas
        decimal[] quotes = await Task.WhenAll(
            QuoteManager.GetDollarQuoteOptionOneAsync(),
            QuoteManager.GetDollarQuoteOptionTwoAsync(),
            QuoteManager.GetDollarQuoteOptionThreeAsync());
        return quotes.Average();
    }

    public async Task<List<Product>> GetProductsAsync()
    {
        var webTask = DataManager.GetProductsAsync();
        var fileTask = DataService.GetProductsFromFileAsync();
        await Task.WhenAll(webTask, fileTask);

        var products = new List<Product>();
        products.AddRange((await webTask)?.Select(p => new Product
        {
            Code = p.Code,
            Description = p.Description,
            Price = p.Price
        }) ?? []);
        products.AddRange(await fileTask ?? []);
        return products;
    }

    public async Task UpdatePricesAsync()
    {
        // Cotizaciones y productos también en paralelo entre sí
        var quoteTask = GetAverageDollarQuoteAsync();
        var productsTask = GetProductsAsync();
        await Task.WhenAll(quoteTask, productsTask);

        decimal quote = await quoteTask;
        foreach (var p in await productsTask)
        {
            p.UpdatePrice(quote);
            Console.WriteLine($"{p.DollarPrice:C2}");
        }
    }
}`],
            ['Services/DataService.cs', 'cs', `using Dsw2026Ej13.Domain;
using System.Text.Json;

namespace Dsw2026Ej13.Services;

internal class DataService
{
    public static async Task<List<Product>?> GetProductsFromFileAsync()
    {
        await using var stream = File.OpenRead(Path.Combine("Data", "Products.json"));
        return await JsonSerializer.DeserializeAsync<List<Product>>(stream);
    }
}`],
            ['Program.cs', 'cs', `static async Task Main(string[] args)
{
    Console.WriteLine("Conversor de precios ARS -> USD");
    var stopwatch = Stopwatch.StartNew();
    var service = new ExchangeService();
    await service.UpdatePricesAsync();
    stopwatch.Stop();
    Console.WriteLine($"Tiempo de ejecución: {stopwatch.ElapsedMilliseconds}");
}`],
          ]),
        },
      ],
      quiz: [
        { q: '¿Qué hace <code>await</code>?', o: ['Crea un hilo nuevo.', 'Suspende el método hasta que la tarea termina, sin bloquear el hilo.', 'Bloquea el hilo hasta que termina.', 'Cancela la tarea.'], a: 1, e: 'El hilo queda libre para otras cosas mientras se espera.' },
        { q: 'Tres <code>await</code> seguidos a operaciones de 1 s cada una, ¿cuánto tardan en total?', o: ['1 s', 'Alrededor de 3 s', '0 s', 'Depende de los núcleos'], a: 1, e: 'Cada await espera al anterior: async no es paralelo.' },
        { q: '¿Cómo esperás tres tareas independientes para que tarden lo que la más lenta?', o: ['Con tres await seguidos.', 'Iniciándolas y luego <code>await Task.WhenAll(t1, t2, t3)</code>.', 'Con .Result en cada una.', 'Con Thread.Sleep.'], a: 1, e: 'Primero se inician todas; después se espera el conjunto.' },
        { q: '¿Por qué evitar <code>tarea.Result</code>?', o: ['Porque devuelve null.', 'Porque bloquea el hilo y puede causar deadlocks.', 'Porque es más lento que await siempre.', 'Porque no compila.'], a: 1, e: 'Convierte el código asincrónico en sincrónico.' },
        { q: '¿Qué tipo de retorno debe tener un método async que no devuelve un valor?', o: ['void', 'Task', 'Task&lt;void&gt;', 'object'], a: 1, e: 'async void solo para manejadores de eventos.' },
        { q: 'Para un cálculo de CPU pesado que congela la interfaz, ¿qué conviene?', o: ['Marcarlo async.', 'await Task.Run(() =&gt; Calcular())', 'Usar .Wait()', 'Task.WhenAny'], a: 1, e: 'Task.Run lo pasa a un hilo del pool.' },
      ],
      sources: [
        { title: 'Programación asincrónica con async y await', url: 'https://learn.microsoft.com/es-es/dotnet/csharp/asynchronous-programming/', points: ['La analogía del desayuno: no bloquear mientras se espera.', 'Iniciar tareas al mismo tiempo y esperarlas con Task.WhenAll y Task.WhenAny.', 'Composición de tareas y manejo de excepciones.'] },
        { title: 'Escenarios de programación asincrónica', url: 'https://learn.microsoft.com/es-es/dotnet/csharp/asynchronous-programming/async-scenarios', points: ['Diferenciar trabajo de E/S de trabajo de CPU (Task.Run).', 'Evitar async void y el bloqueo con .Result/.Wait().'] },
      ],
    },
  );
})();
