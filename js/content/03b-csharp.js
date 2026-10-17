/* Módulo: C# clases y tipos (Unidad 2, clases 8 a 11: caps. 7 a 13, 15 y 17) */
(() => {
  const { code, table, note, lab, fig, sol } = window.GUIDE.h;
  const VCS = (c) => `Sharp, <em>Microsoft Visual C# Step by Step</em>, 10ª ed., cap. ${c}`;

  window.GUIDE.LESSONS.push(
    {
      id: 'clases-objetos',
      module: 'cs-oop',
      title: 'Clases y objetos en C#',
      keywords: 'clases objetos new constructor sobrecarga this campos modificadores public private internal static miembros estaticos clase estatica partial clases parciales anonimas inicializadores ej08',
      tldr: 'Una clase agrupa datos (campos) y comportamiento (métodos). Con <code>new</code> creás objetos y el <mark>constructor</mark> los deja en un estado válido. <code>static</code> marca lo que pertenece a la clase y no a cada objeto.',
      goals: [
        'Definir clases con campos privados, constructores y métodos públicos.',
        'Usar modificadores de acceso y miembros estáticos.',
        'Dividir una clase con partial y crear objetos anónimos.',
        'Resolver los problemas 1 y 2 del EJ08.',
      ],
      body: `
        <h2>Clasificación y encapsulamiento en código</h2>
        <p>Clasificar es reconocer qué tienen en común un grupo de cosas: todos los vehículos tienen patente y calculan consumo. En C#, eso se expresa con una <code>class</code>. El encapsulamiento se logra con los <strong>modificadores de acceso</strong>:</p>
        ${table(['Modificador', 'Quién lo ve'], [
          ['<code>public</code>', 'Cualquier código'],
          ['<code>private</code>', 'Solo la propia clase (valor por defecto para los miembros)'],
          ['<code>protected</code>', 'La clase y sus derivadas'],
          ['<code>internal</code>', 'Cualquier código del mismo ensamblado (valor por defecto para las clases)'],
          ['<code>protected internal</code> / <code>private protected</code>', 'Combinaciones de los anteriores'],
        ])}

        <h2>Constructores</h2>
        <p>El <strong>constructor</strong> es un método especial, con el nombre de la clase y sin tipo de retorno, que se ejecuta al hacer <code>new</code>. Si no escribís ninguno, el compilador agrega uno sin parámetros; si escribís alguno, ya no lo agrega.</p>
        ${code('cs', `public class Sucursal
{
    private readonly string _codigo;     // readonly: solo se asigna en el constructor
    private string _ciudad;

    public Sucursal(string codigo, string ciudad)
    {
        _codigo = codigo;
        _ciudad = ciudad;
    }

    // Sobrecarga que reutiliza la otra con this(...)
    public Sucursal(string codigo) : this(codigo, "Tucumán") { }

    public string Describir() => $"{_codigo} ({_ciudad})";
}

var central = new Sucursal("SUC01", "Tucumán");
Sucursal yb = new("SUC02", "Yerba Buena");    // new con tipo inferido (C# 9)`)}
        <p>Desde C# 12 también existen los <strong>constructores primarios</strong>: <code>public class Sucursal(string codigo, string ciudad) { … }</code>. Los parámetros quedan disponibles en toda la clase.</p>

        <h2>Miembros estáticos</h2>
        <p>Un miembro <code>static</code> pertenece a la clase, no a cada objeto: se usa sin crear instancias (<code>Math.Sqrt(9)</code>, <code>Console.WriteLine</code>). Sirven para datos compartidos y utilidades. Una <code>static class</code> solo puede tener miembros estáticos y no se puede instanciar: es donde viven los métodos de extensión.</p>
        ${code('cs', `public class Vehiculo
{
    private static int _creados;               // compartido por todos los vehículos
    public static int Creados => _creados;

    public Vehiculo() => _creados++;
}

new Vehiculo(); new Vehiculo();
Console.WriteLine(Vehiculo.Creados);           // 2`)}

        <h2>Clases parciales</h2>
        <p>Con <code>partial</code> una clase se reparte en varios archivos; el compilador las une. Es común cuando una parte la genera una herramienta (formularios, migraciones) y otra la escribís vos, o para separar responsabilidades de una clase grande.</p>
        ${code('cs', `// ProductHelper.cs
public partial class ProductHelper
{
    public string ObtenerEtiquetaProducto(long code, string description, decimal price)
        => $"[{code}] {description} - {FormatearMoneda(price)}";
}

// ProductHelper.Formato.cs
public partial class ProductHelper
{
    private static string FormatearMoneda(decimal price) => price.ToString("C");
}`)}

        <h2>Clases anónimas e inicializadores</h2>
        <p>Una <strong>clase anónima</strong> es un objeto sin clase declarada: el compilador genera el tipo. Sus propiedades son de solo lectura. Se usa para agrupar datos temporales, sobre todo en consultas LINQ.</p>
        ${code('cs', `var venta = new { Code = 7L, Description = "Yerba", Quantity = 3, Total = 3 * 4200m };
Console.WriteLine(venta.Total);       // 12600
// venta.Total = 0;                    // error: las propiedades son de solo lectura`)}
        <p>Los <strong>inicializadores de objeto</strong> asignan propiedades públicas al crear: <code>new Herramienta("Taladro") { Precio = 50000 }</code>.</p>
        ${lab(0)}
      `,
      labs: [
        {
          type: 'predict',
          title: '¿Qué imprime? Estáticos e instancias',
          code: `var a = new Contador();
var b = new Contador();
a.Sumar(); a.Sumar(); b.Sumar();
Console.WriteLine(a.Propio);
Console.WriteLine(b.Propio);
Console.WriteLine(Contador.Total);

class Contador
{
    public static int Total;
    public int Propio;
    public void Sumar() { Propio++; Total++; }
}`,
          expected: '2\n1\n3',
          explain: '<p><code>Propio</code> es de cada objeto: a lo incrementó 2 veces y b una. <code>Total</code> es estático: lo comparten todos, así que suma las 3 llamadas.</p>',
        },
      ],
      exercises: [
        {
          official: 'N° 8 (problema 1)',
          level: 1,
          title: 'Etiqueta de producto con una clase parcial',
          prompt: '<p>Crear un método público <code>ObtenerEtiquetaProducto(long code, string description, decimal price)</code> dentro de una clase parcial <code>ProductHelper</code> que devuelva <code>[code] description - price</code>, con el precio en formato moneda. La clase debe estar dividida en dos archivos: en uno el método principal; en el otro, al menos un método auxiliar o constante <strong>que el método principal use</strong>.</p>',
          hints: ['Según las revisiones de la cátedra, el error más común fue que la segunda parte existiera pero no se usara.', 'El formato moneda es <code>{price:C}</code> o <code>price.ToString("C")</code>.'],
          solution: sol('<p>Verificado con .NET 10: <code>[1001] Auriculares - $ 15.000,50</code>. La segunda parte aporta el formateo con una cultura fija para que el resultado no dependa de la configuración de la máquina.</p>', [
            ['ProductHelper.cs', 'cs', `namespace Dsw2026Ej8.Problema1;

public partial class ProductHelper
{
    public string ObtenerEtiquetaProducto(long code, string description, decimal price)
        => $"[{code}] {description} - {FormatearMoneda(price)}";
}`],
            ['ProductHelper.Formato.cs', 'cs', `using System.Globalization;

namespace Dsw2026Ej8.Problema1;

public partial class ProductHelper
{
    private static readonly CultureInfo Cultura = new("es-AR");

    private static string FormatearMoneda(decimal price) => price.ToString("C", Cultura);
}`],
          ]),
        },
        {
          official: 'N° 8 (problema 2)',
          level: 1,
          title: 'Resumen de venta con una clase anónima',
          prompt: '<p>Crear <code>CrearResumenVenta(long productCode, string productDescription, int quantity, decimal unitPrice)</code> en la clase <code>Problema2</code>. Debe crear internamente una clase anónima con Code, Description, Quantity y Total, y devolver <code>Code-Description-Total</code>. Total es quantity × unitPrice, o 0 si quantity es menor o igual a 0.</p>',
          solution: sol('<p>Verificado: <code>CrearResumenVenta(7, "Yerba", 3, 4200)</code> devuelve <code>7-Yerba-12600</code>, y con cantidad 0 devuelve <code>7-Yerba-0</code>.</p>', [
            ['Problema2.cs', 'cs', `public class Problema2
{
    public string CrearResumenVenta(long productCode, string productDescription, int quantity, decimal unitPrice)
    {
        var venta = new
        {
            Code = productCode,
            Description = productDescription,
            Quantity = quantity,
            Total = quantity > 0 ? quantity * unitPrice : 0
        };
        return $"{venta.Code}-{venta.Description}-{venta.Total}";
    }
}`],
          ]),
        },
      ],
      quiz: [
        { q: 'Si escribís un constructor con parámetros y ninguno sin parámetros, ¿podés hacer <code>new Sucursal()</code>?', o: ['Sí, siempre existe.', 'No: el compilador solo agrega el constructor vacío si no declaraste ninguno.', 'Sí, pero los campos quedan en null.', 'Solo si la clase es static.'], a: 1, e: 'Al declarar un constructor, desaparece el predeterminado.' },
        { q: '¿Qué modificador tienen por defecto los miembros de una clase?', o: ['public', 'internal', 'private', 'protected'], a: 2, e: 'Los miembros son private por defecto; las clases, internal.' },
        { q: 'Un campo <code>static</code>…', o: ['…tiene un valor distinto en cada objeto.', '…es compartido por todas las instancias de la clase.', '…no se puede modificar.', '…solo existe en clases static.'], a: 1, e: 'Pertenece a la clase.' },
        { q: '¿Para qué sirve <code>partial</code>?', o: ['Para heredar de dos clases.', 'Para dividir la definición de una clase en varios archivos.', 'Para que una clase no se pueda instanciar.', 'Para ocultar métodos.'], a: 1, e: 'El compilador une todas las partes.' },
        { q: 'Las propiedades de un objeto anónimo…', o: ['…son de solo lectura.', '…se pueden modificar libremente.', '…son siempre string.', '…no se pueden leer.'], a: 0, e: 'Se fijan al crearlo.' },
        { q: '<code>public Sucursal(string c) : this(c, "Tucumán") { }</code> hace que…', o: ['…se llame al constructor de la clase base.', '…se llame primero al otro constructor de la misma clase.', '…se cree una sucursal estática.', '…no compile.'], a: 1, e: 'this(...) encadena constructores de la misma clase; base(...) los de la clase padre.' },
      ],
      sources: [
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(7), points: ['Clasificación y encapsulamiento.', 'Controlar la accesibilidad; constructores y sobrecarga.', 'Métodos y datos estáticos; clases estáticas.', 'Clases parciales y clases anónimas.'] },
      ],
    },

    {
      id: 'valor-referencia',
      module: 'cs-oop',
      title: 'Tipos por valor y por referencia',
      keywords: 'tipos por valor referencia stack heap pila monticulo copia null nullable int? hasvalue ?? ?. ref out boxing unboxing object recolector ej08',
      tldr: 'Una variable de <mark>tipo por valor</mark> (int, double, struct) guarda el dato; una de <mark>tipo por referencia</mark> (clases, string, arreglos) guarda la dirección de un objeto en el heap. Copiar la primera duplica el dato; copiar la segunda duplica la flecha, no el objeto.',
      goals: [
        'Predecir qué pasa al copiar variables por valor y por referencia.',
        'Usar tipos que aceptan null y los operadores ?? y ?.',
        'Distinguir parámetros por valor, ref y out.',
        'Explicar boxing y unboxing.',
        'Resolver los problemas 3 y 4 del EJ08.',
      ],
      body: `
        <h2>Dos formas de guardar datos</h2>
        ${table(['', 'Tipo por valor', 'Tipo por referencia'], [
          ['Ejemplos', '<code>int</code>, <code>double</code>, <code>decimal</code>, <code>bool</code>, <code>char</code>, <code>enum</code>, <code>struct</code>', '<code>class</code>, <code>string</code>, arreglos, <code>object</code>, delegados, <code>record</code>'],
          ['La variable contiene', 'El valor', 'Una referencia al objeto'],
          ['Dónde vive el dato', 'En la pila (stack) si es una variable local', 'Siempre en el heap (montículo)'],
          ['Al copiar', 'Se duplica el valor: cambiar uno no afecta al otro', 'Se duplica la referencia: los dos apuntan al mismo objeto'],
          ['Puede ser null', 'No (salvo <code>int?</code>)', 'Sí'],
        ])}
        <p>Recorré paso a paso el problema 3 del EJ08 y mirá la memoria:</p>
        ${lab(0)}
        ${note('<code>string</code> es un tipo por referencia, pero <strong>inmutable</strong>: ningún método lo modifica, todos devuelven uno nuevo. Por eso se “comporta” como si fuera por valor.', 'tip')}

        <h2>null y los tipos que aceptan null</h2>
        <p>Una referencia puede valer <code>null</code>: no apunta a ningún objeto. Usar un miembro de una referencia nula lanza <code>NullReferenceException</code>. Los tipos por valor no pueden ser null… salvo que los declares como <strong>nullable</strong> con <code>?</code>:</p>
        ${code('cs', `int? nota = null;                   // Nullable<int>
if (nota.HasValue) Console.WriteLine(nota.Value);
int segura = nota ?? 0;             // ?? : valor alternativo si es null
nota ??= 7;                         // asigna solo si es null

string? texto = null;
int? largo = texto?.Length;         // ?. : si texto es null, todo da null (no explota)

if (nota is >= 0 and <= 10)         // patrón: no null y en rango
    Console.WriteLine("Nota válida");`)}
        <p>Con <code>&lt;Nullable&gt;enable&lt;/Nullable&gt;</code> en el proyecto, el compilador además advierte cuando una referencia (<code>string</code>) podría ser null y la usás sin chequear. <code>string</code> significa “nunca null” y <code>string?</code> “puede ser null”.</p>

        <h2>Parámetros por valor, ref y out</h2>
        ${table(['Parámetro', 'Qué recibe el método', 'Cambios visibles afuera'], [
          ['Por valor (por defecto)', 'Una copia del argumento (si es una referencia, una copia de la flecha)', 'No en la variable; sí en el objeto apuntado'],
          ['<code>ref</code>', 'La variable misma (debe estar inicializada)', 'Sí'],
          ['<code>out</code>', 'La variable misma; el método debe asignarla', 'Sí (es una salida)'],
          ['<code>in</code>', 'La variable por referencia, de solo lectura', 'No'],
        ])}
        ${lab(1)}

        <h2>System.Object, boxing y unboxing</h2>
        <p>Todos los tipos derivan de <code>System.Object</code> (<code>object</code>). Cuando asignás un valor a una variable <code>object</code>, el CLR lo copia a una “caja” en el heap: eso es <strong>boxing</strong>. Recuperarlo con un cast es <strong>unboxing</strong>, y si el tipo no coincide, lanza <code>InvalidCastException</code>.</p>
        ${code('cs', `int peso = 42;
object caja = peso;          // boxing: copia 42 al heap
int otra = (int)caja;        // unboxing
// long mal = (long)caja;    // InvalidCastException: la caja contiene un int

if (caja is int p)           // forma segura: patrón de tipo
    Console.WriteLine(p);`)}
        <p>El boxing es costoso y pierde la verificación de tipos: es exactamente el problema de la “bodega básica” del EJ10, que los genéricos resuelven.</p>
      `,
      labs: [
        {
          type: 'memory',
          title: 'Copiar un valor y copiar una referencia (EJ08, problema 3)',
          code: `int originalValue = 5;
Product product = new Product("Original");
int copia = originalValue;
copia++;
Product otraReferencia = product;
otraReferencia.ChangeDescription("Modificado");
Console.WriteLine($"{originalValue}-{copia}-{product.Description}");`,
          steps: [
            { line: 1, stack: [['originalValue', '5']], heap: [], note: 'Un int es un tipo por valor: la variable guarda el 5 directamente.' },
            { line: 2, stack: [['originalValue', '5'], ['product', '', '#1']], heap: [{ id: '#1', label: 'Product', rows: [['Description', '"Original"']] }], hot: '#1', note: '<code>new</code> crea el objeto en el heap. La variable guarda una referencia (#1) a él.' },
            { line: 3, stack: [['originalValue', '5'], ['product', '', '#1'], ['copia', '5']], heap: [{ id: '#1', label: 'Product', rows: [['Description', '"Original"']] }], note: 'Se copia el valor 5 en otra variable independiente.' },
            { line: 4, stack: [['originalValue', '5'], ['product', '', '#1'], ['copia', '6']], heap: [{ id: '#1', label: 'Product', rows: [['Description', '"Original"']] }], note: 'Cambiar la copia no afecta al original: originalValue sigue en 5.' },
            { line: 5, stack: [['originalValue', '5'], ['product', '', '#1'], ['copia', '6'], ['otraReferencia', '', '#1']], heap: [{ id: '#1', label: 'Product', rows: [['Description', '"Original"']] }], hot: '#1', note: 'Se copia la <strong>referencia</strong>, no el objeto. Ahora hay dos variables que apuntan al mismo Product.' },
            { line: 6, stack: [['originalValue', '5'], ['product', '', '#1'], ['copia', '6'], ['otraReferencia', '', '#1']], heap: [{ id: '#1', label: 'Product', rows: [['Description', '"Modificado"']] }], hot: '#1', note: 'Se modifica el objeto a través de otraReferencia… y como es el mismo objeto, product también lo “ve” cambiado.' },
            { line: 7, stack: [['originalValue', '5'], ['product', '', '#1'], ['copia', '6'], ['otraReferencia', '', '#1']], heap: [{ id: '#1', label: 'Product', rows: [['Description', '"Modificado"']] }], note: 'Imprime <code>5-6-Modificado</code>. Leer la descripción desde <code>product</code> (y no desde la copia) es lo que demuestra el concepto: las revisiones marcaron ese detalle.' },
          ],
        },
        {
          type: 'predict',
          title: '¿Qué imprime? Parámetros',
          code: `int a = 1;
var lista = new List<int> { 1 };
Cambiar(a, lista);
Console.WriteLine($"{a} {lista.Count}");
CambiarRef(ref a);
Console.WriteLine(a);
Reemplazar(lista);
Console.WriteLine(lista.Count);

static void Cambiar(int x, List<int> l) { x = 99; l.Add(2); }
static void CambiarRef(ref int x) { x = 99; }
static void Reemplazar(List<int> l) { l = new List<int>(); }`,
          expected: '1 2\n99\n2',
          explain: '<p><code>Cambiar</code> recibe una copia de <code>a</code> (no cambia afuera) y una copia de la referencia a la lista: agrega al mismo objeto, por eso Count es 2. Con <code>ref</code>, el método trabaja sobre la variable misma. <code>Reemplazar</code> hace que su copia de la referencia apunte a otra lista nueva: la original no se entera.</p>',
        },
      ],
      exercises: [
        {
          official: 'N° 8 (problema 3)',
          level: 1,
          title: 'Comparar copias',
          prompt: '<p>Crear <code>CompararCopias(int originalValue, Product product)</code> en la clase <code>Problema3</code>: copiar originalValue en una variable local, incrementar solo la copia, copiar la referencia de product en otra variable, modificar la descripción del producto copiado con el método de la clase y devolver <code>valorOriginal-valorCopia-descripcionProducto</code>.</p>',
          hints: ['El laboratorio de arriba es exactamente este problema.', 'Leé la descripción desde el producto original para demostrar que la referencia es compartida.'],
          solution: sol('<p>Verificado: con 5 y un producto "Original" devuelve <code>5-6-Modificado</code>.</p>', [
            ['Problema3.cs', 'cs', `public class Problema3
{
    public string CompararCopias(int originalValue, Product product)
    {
        int copia = originalValue;      // copia del VALOR
        copia++;                        // solo cambia la copia

        Product otraReferencia = product;               // copia de la REFERENCIA
        otraReferencia.ChangeDescription("Modificado"); // cambia el único objeto

        // Se lee desde el original: demuestra que ambos apuntan al mismo objeto
        return $"{originalValue}-{copia}-{product.Description}";
    }
}`],
          ]),
        },
        {
          official: 'N° 8 (problema 4)',
          level: 2,
          title: 'Promedio con notas que aceptan null',
          prompt: '<p>Crear <code>CalcularPromedio(int? nota1, int? nota2, int? nota3)</code> que devuelva un <code>double</code>: el promedio solo de las notas con valor; 0 si las tres son null; ignorando notas menores a 0 o mayores a 10; sin lanzar excepciones.</p>',
          hints: ['Las revisiones encontraron que casi la mitad de las soluciones repetía tres veces el mismo if. ¿Cómo recorrerías las tres notas con un solo bloque?', 'Ojo con la división entera: convertí a double antes de dividir.', 'LINQ todavía no se vio en esa clase: resolvelo con un bucle.'],
          solution: sol('<p>Verificado: (8, null, 6) → 7; (null, null, null) → 0; (11, -1, 7) → 7; (10, 9, 8) → 9. Recorrer un arreglo con las tres notas evita repetir la lógica, y el patrón <code>is &gt;= 0 and &lt;= 10</code> chequea a la vez que no sea null y que esté en rango.</p>', [
            ['Problema4.cs', 'cs', `public class Problema4
{
    public double CalcularPromedio(int? nota1, int? nota2, int? nota3)
    {
        int suma = 0, cantidad = 0;
        foreach (int? nota in new[] { nota1, nota2, nota3 })
        {
            if (nota is >= 0 and <= 10)     // no es null y está en rango
            {
                suma += nota.Value;
                cantidad++;
            }
        }
        return cantidad == 0 ? 0 : (double)suma / cantidad;
    }
}`],
          ]),
        },
      ],
      quiz: [
        { q: '<code>var a = new Product("X"); var b = a; b.ChangeDescription("Y");</code> ¿Qué descripción tiene a?', o: ['"X"', '"Y"', 'null', 'Depende del compilador'], a: 1, e: 'a y b apuntan al mismo objeto.' },
        { q: '<code>int x = 5; int y = x; y = 10;</code> ¿Cuánto vale x?', o: ['10', '5', '0', '15'], a: 1, e: 'int es por valor: y es una copia independiente.' },
        { q: '¿Qué hace <code>nota ?? 0</code>?', o: ['Devuelve 0 siempre.', 'Devuelve nota si no es null; si es null, 0.', 'Compara nota con 0.', 'Lanza una excepción si es null.'], a: 1, e: 'Es el operador de fusión de null.' },
        { q: '¿Qué diferencia hay entre <code>ref</code> y <code>out</code>?', o: ['Ninguna.', 'Con out el método está obligado a asignar el parámetro; con ref la variable debe venir inicializada.', 'ref es para tipos por referencia y out para tipos por valor.', 'out no permite modificar la variable.'], a: 1, e: 'out es un canal de salida; ref es de entrada y salida.' },
        { q: '¿Qué es el boxing?', o: ['Convertir un objeto a string.', 'Copiar un valor a un objeto en el heap al asignarlo a object.', 'Encerrar código en un try.', 'Comprimir datos.'], a: 1, e: 'Y unboxing es el camino inverso con un cast.' },
        { q: '¿Dónde se guarda siempre un objeto creado con <code>new</code> a partir de una clase?', o: ['En la pila (stack).', 'En el heap.', 'En el disco.', 'En el registro del procesador.'], a: 1, e: 'Las clases son tipos por referencia.' },
        { q: '<code>string? s = null; var n = s?.Length;</code> ¿Qué pasa?', o: ['NullReferenceException.', 'n vale null y no hay excepción.', 'n vale 0.', 'No compila.'], a: 1, e: '?. corta la evaluación si s es null.' },
      ],
      sources: [
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(8), points: ['Copiar variables y clases de tipos por valor y referencia.', 'Valores nulos y tipos que aceptan null; operadores ?? y ?.', 'Parámetros ref y out.', 'Cómo se organiza la memoria: pila y montículo.', 'System.Object, boxing y unboxing; conversiones seguras con is y as.'] },
      ],
    },

    {
      id: 'herencia',
      module: 'cs-oop',
      title: 'Herencia, polimorfismo y métodos de extensión',
      keywords: 'herencia clase base derivada base virtual override new ocultar polimorfismo protected sealed tostring equals metodos de extension this static ej08',
      tldr: 'Una clase derivada hereda los miembros de su base y puede <mark>redefinir</mark> los <code>virtual</code> con <code>override</code>. Así, al llamar a un método desde una variable de la base, se ejecuta la versión del tipo real del objeto: eso es polimorfismo.',
      goals: [
        'Declarar clases derivadas y llamar al constructor de la base.',
        'Distinguir override (redefinir) de new (ocultar).',
        'Usar protected y sealed.',
        'Crear métodos de extensión.',
        'Resolver los problemas 5 y 6 del EJ08.',
      ],
      body: `
        <h2>Derivar una clase</h2>
        ${code('cs', `public class Sale
{
    public decimal Amount { get; }
    public Sale(decimal amount) => Amount = amount;

    public virtual decimal CalculateTotal() => Amount;   // virtual: se puede redefinir
}

public class WholesaleSale : Sale                         // WholesaleSale hereda de Sale
{
    public WholesaleSale(decimal amount) : base(amount) { }   // llama al constructor de la base

    public override decimal CalculateTotal() => Amount * 0.9m; // redefine
}`)}
        <p>Una clase hereda de una sola clase base (herencia simple). Si no indicás ninguna, hereda de <code>System.Object</code>. El constructor de la derivada siempre llama a uno de la base, explícitamente con <code>: base(...)</code> o implícitamente al sin parámetros.</p>

        <h2>virtual, override y new</h2>
        <p>Esta es la diferencia que más se pregunta. Probala:</p>
        ${lab(0)}
        ${table(['Palabra', 'Dónde', 'Efecto'], [
          ['<code>virtual</code>', 'En la base', 'Permite que las derivadas redefinan el método'],
          ['<code>override</code>', 'En la derivada', 'Redefine: se ejecuta según el tipo <strong>real</strong> del objeto (ligadura dinámica)'],
          ['<code>new</code>', 'En la derivada', 'Oculta: se ejecuta según el tipo de la <strong>variable</strong> (ligadura estática)'],
          ['<code>abstract</code>', 'En la base', 'Obliga a redefinir; no tiene implementación (lo vas a ver con clases abstractas)'],
          ['<code>sealed</code>', 'En una clase o en un override', 'Impide seguir heredando o redefiniendo'],
        ])}
        ${note('Si declarás en la derivada un método con la misma firma que uno no virtual de la base y no ponés <code>new</code>, el compilador da la advertencia CS0108: estás ocultando sin darte cuenta.', 'warn')}
        <h3>protected</h3>
        <p>Un miembro <code>protected</code> es accesible desde la propia clase y sus derivadas, pero no desde afuera. Útil para datos que las subclases necesitan pero los clientes no.</p>
        <h3>Los métodos de System.Object</h3>
        <p>Todas las clases heredan <code>ToString()</code>, <code>Equals(object)</code>, <code>GetHashCode()</code> y <code>GetType()</code>. Es habitual redefinir <code>ToString()</code>:</p>
        ${code('cs', 'public override string ToString() => $"{Marca} {Modelo} ({Patente})";')}

        <h2>Métodos de extensión</h2>
        <p>Permiten “agregar” métodos a un tipo existente sin modificarlo ni heredar: incluso a <code>string</code> o a interfaces. Se escriben como métodos estáticos en una clase estática, con <code>this</code> antes del primer parámetro.</p>
        ${code('cs', `public static class Extensions
{
    public static string ToProductCode(this string? code)
    {
        if (code is null) return "SIN-CODIGO";
        var partes = code.Trim().ToUpper().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return string.Join('-', partes);
    }
}

" ab 123 x ".ToProductCode();   // "AB-123-X": se llama como si fuera de string`)}
        <p>Todo LINQ está hecho con métodos de extensión sobre <code>IEnumerable&lt;T&gt;</code>. Para que un método de extensión esté disponible, su espacio de nombres tiene que estar importado con <code>using</code>.</p>
      `,
      labs: [
        {
          type: 'trace',
          title: 'override contra new',
          intro: 'La misma jerarquía con dos formas de “redefinir”. Elegí la llamada.',
          code: `class Vehiculo
{
    public virtual string Tipo() => "Vehículo";
    public string Marca() => "Genérica";
}

class Electrico : Vehiculo
{
    public override string Tipo() => "Eléctrico";
    public new string Marca() => "Tesla";
}

Vehiculo v = new Electrico();
Electrico e = new Electrico();`,
          scenarios: [
            { label: 'Console.WriteLine(v.Tipo());', lines: [9, 13], output: 'Eléctrico', note: 'Tipo() es virtual y Electrico lo redefine con override: se ejecuta la versión del tipo REAL del objeto (Electrico), aunque la variable sea Vehiculo.' },
            { label: 'Console.WriteLine(v.Marca());', lines: [4, 13], output: 'Genérica', note: 'Marca() no es virtual; Electrico la oculta con new. Se decide por el tipo de la VARIABLE (Vehiculo), así que corre la de la base.' },
            { label: 'Console.WriteLine(e.Tipo());', lines: [9, 14], output: 'Eléctrico', note: 'Variable y objeto son Electrico.' },
            { label: 'Console.WriteLine(e.Marca());', lines: [10, 14], output: 'Tesla', note: 'La variable es Electrico: se usa la versión que oculta.' },
            { label: 'Console.WriteLine(((Vehiculo)e).Marca());', lines: [4, 14], output: 'Genérica', note: 'Al convertir la referencia a Vehiculo, el método oculto vuelve a ser el de la base. Con new, el comportamiento depende de cómo mirás al objeto: por eso casi siempre querés override.' },
          ],
        },
      ],
      exercises: [
        {
          official: 'N° 8 (problema 5)',
          level: 1,
          title: 'Ventas minoristas y mayoristas',
          prompt: '<p>Crear <code>ObtenerImporteFinal(Sale sale)</code> en <code>Problema5</code>, que devuelva un decimal llamando a <code>sale.CalculateTotal()</code>. La base <code>Sale</code> tiene el método virtual <code>CalculateTotal</code>; <code>RetailSale</code> devuelve el importe sin descuento y <code>WholesaleSale</code> aplica un 10 % de descuento. La resolución debe demostrar que se ejecuta el método del tipo real del objeto.</p>',
          solution: sol('<p>Verificado: con un importe de 1000, <code>RetailSale</code> devuelve 1000 y <code>WholesaleSale</code> 900,00. <code>ObtenerImporteFinal</code> no pregunta el tipo: el polimorfismo elige la implementación.</p>', [
            ['Sales.cs', 'cs', `public class Sale
{
    public decimal Amount { get; }
    public Sale(decimal amount) => Amount = amount;
    public virtual decimal CalculateTotal() => Amount;
}

public class RetailSale : Sale
{
    public RetailSale(decimal amount) : base(amount) { }
    public override decimal CalculateTotal() => Amount;
}

public class WholesaleSale : Sale
{
    private const decimal Discount = 0.10m;
    public WholesaleSale(decimal amount) : base(amount) { }
    public override decimal CalculateTotal() => Amount * (1 - Discount);
}

public class Problema5
{
    public decimal ObtenerImporteFinal(Sale sale) => sale.CalculateTotal();
}`],
          ]),
        },
        {
          official: 'N° 8 (problema 6)',
          level: 2,
          title: 'Normalizar código con un método de extensión',
          prompt: '<p>Crear <code>NormalizarCodigoProducto(string code)</code> en <code>Problema6</code>, que use un método de extensión <code>ToProductCode</code> definido en otra clase y otro archivo llamada <code>Extensions</code>. La extensión elimina espacios al inicio y al final, pasa a mayúsculas y reemplaza los espacios internos por guiones. Si el código es null, devuelve "SIN-CODIGO". Ejemplo: <code>" ab 123 x "</code> → <code>"AB-123-X"</code>.</p>',
          hints: ['La clase debe ser <code>static</code> y el parámetro llevar <code>this</code>.', 'Para que acepte null sin advertencias, el parámetro es <code>this string? code</code>.', '¿Qué pasa si hay dos espacios seguidos? <code>Split</code> con <code>RemoveEmptyEntries</code> lo resuelve.'],
          solution: sol('<p>Verificado: <code>" ab 123 x "</code> → <code>AB-123-X</code>, <code>null</code> → <code>SIN-CODIGO</code>, <code>"a  b"</code> → <code>A-B</code>.</p>', [
            ['Extensions.cs', 'cs', `public static class Extensions
{
    public static string ToProductCode(this string? code)
    {
        if (code is null) return "SIN-CODIGO";
        var partes = code.Trim().ToUpper().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return string.Join('-', partes);
    }
}`],
            ['Problema6.cs', 'cs', `public class Problema6
{
    public string NormalizarCodigoProducto(string? code) => code.ToProductCode();
}`],
          ]),
        },
      ],
      quiz: [
        { q: 'Con <code>Vehiculo v = new Electrico();</code> y <code>Tipo()</code> virtual redefinido con override, <code>v.Tipo()</code> ejecuta…', o: ['…la versión de Vehiculo.', '…la versión de Electrico.', '…ninguna: no compila.', '…las dos.'], a: 1, e: 'override usa el tipo real del objeto.' },
        { q: 'Si en la derivada ocultás un método con <code>new</code>, ¿qué versión se ejecuta?', o: ['La del tipo real del objeto.', 'La del tipo de la variable.', 'Siempre la de la base.', 'Siempre la de la derivada.'], a: 1, e: 'new no participa del polimorfismo.' },
        { q: '¿Qué hace <code>: base(amount)</code> en un constructor?', o: ['Llama al constructor de la clase base.', 'Llama a otro constructor de la misma clase.', 'Declara una variable base.', 'Hereda de amount.'], a: 0, e: 'Inicializa la parte heredada del objeto.' },
        { q: '¿Qué significa <code>protected</code>?', o: ['Visible desde cualquier lugar.', 'Visible desde la clase y sus derivadas.', 'Visible solo en el mismo archivo.', 'No se puede modificar.'], a: 1, e: 'Es el nivel pensado para la herencia.' },
        { q: 'Un método de extensión debe estar…', o: ['…en una clase abstracta.', '…en una clase estática, ser estático y tener this en el primer parámetro.', '…en la misma clase que extiende.', '…marcado con override.'], a: 1, e: 'Es azúcar sintáctico sobre un método estático.' },
        { q: '¿Qué impide <code>sealed</code> en una clase?', o: ['Que se instancie.', 'Que otras clases hereden de ella.', 'Que tenga métodos virtuales.', 'Que se use fuera del ensamblado.'], a: 1, e: 'Una clase sellada no puede ser base de otra.' },
      ],
      sources: [
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(12), points: ['Qué es la herencia; llamar a constructores de la base.', 'Métodos new, virtual y override; polimorfismo.', 'Acceso protected.', 'Crear métodos de extensión.'] },
        { title: 'Métodos de extensión', url: 'https://learn.microsoft.com/es-es/dotnet/csharp/programming-guide/classes-and-structs/extension-methods', points: ['Se definen como estáticos en una clase estática con this en el primer parámetro.', 'Se usan como si fueran de instancia; requieren el using de su espacio de nombres.'] },
      ],
    },

    {
      id: 'propiedades-records',
      module: 'cs-oop',
      title: 'Propiedades y records',
      keywords: 'propiedades get set init automaticas solo lectura calculadas accesibilidad private set inicializadores de objeto required record igualdad por valor with ej09 cuenta bancaria',
      tldr: 'Una <mark>propiedad</mark> se usa como un campo pero por dentro son métodos <code>get</code> y <code>set</code>: encapsulás sin escribir <code>GetSaldo()</code> y <code>SetSaldo()</code>. Un <mark>record</mark> es un tipo pensado para datos, con igualdad por valor.',
      goals: [
        'Reemplazar campos y métodos get/set por propiedades con la accesibilidad correcta.',
        'Usar propiedades automáticas, init y required, e inicializadores de objeto.',
        'Crear records y entender su igualdad por valor y la expresión with.',
        'Resolver el EJ09.',
      ],
      body: `
        <h2>De Get/Set a propiedades</h2>
        <p>En el EJ06 escribiste <code>GetTax()</code> y <code>SetTax()</code>. En C# lo idiomático es una propiedad:</p>
        ${code('cs', `// Propiedad con campo de respaldo y validación
private decimal _balance;
public decimal Balance
{
    get => _balance;
    private set                       // solo la clase puede asignarla
    {
        if (value < -1_000_000) throw new ArgumentOutOfRangeException(nameof(value));
        _balance = value;
    }
}

// Propiedad automática: el compilador crea el campo
public string Number { get; }              // solo lectura: se asigna en el constructor
public Status Status { get; private set; } = Status.Active;
public decimal InterestRate { get; init; } // se asigna al crear, después no cambia
public required string Holder { get; init; }  // obligatoria en el inicializador

// Propiedad calculada: no guarda nada
public bool IsOverdrawn => Balance < 0;`)}
        <p>Las revisiones del EJ08 marcaron como error usar métodos Get/Set en lugar de propiedades. Regla práctica: <strong>un dato del objeto es una propiedad; una acción es un método</strong>.</p>
        ${table(['Accesor', 'Quién puede asignar'], [
          ['<code>{ get; set; }</code>', 'Cualquiera, siempre'],
          ['<code>{ get; private set; }</code>', 'Solo la clase'],
          ['<code>{ get; protected set; }</code>', 'La clase y sus derivadas'],
          ['<code>{ get; init; }</code>', 'Cualquiera, pero solo al construir (constructor o inicializador)'],
          ['<code>{ get; }</code>', 'Solo el constructor'],
        ])}
        <h3>Inicializadores de objeto</h3>
        ${code('cs', `var cuenta = new SavingsAccount("CA-001", 10000)   // número y saldo: en el constructor
{
    InterestRate = 0.05m,                           // tasa: al inicializar, no en el constructor
    Holders = ["Ana", "Luis"]
};`)}
        <p>Así resuelve el EJ09 que “la tasa se indica al inicializar la instancia, pero no mediante el constructor”.</p>
        ${note('Precaución del libro: no uses una propiedad para algo que tarda o tiene efectos laterales (leer un archivo, llamar a un servicio). Quien la usa espera que sea tan barata como leer un campo.', 'tip')}

        <h2>Records</h2>
        <p>Un <code>record</code> es una clase (o struct) pensada para <strong>transportar datos</strong>. El compilador genera por vos: constructor, propiedades <code>init</code>, <code>ToString()</code> legible e <strong>igualdad por valor</strong> (dos records son iguales si todas sus propiedades lo son).</p>
        ${code('cs', `public record AccountSummary(string Number, AccountType Type, decimal Balance);

var r1 = new AccountSummary("CA-001", AccountType.SavingsAccount, 11550m);
var r2 = new AccountSummary("CA-001", AccountType.SavingsAccount, 11550m);
Console.WriteLine(r1);          // AccountSummary { Number = CA-001, Type = SavingsAccount, Balance = 11550 }
Console.WriteLine(r1 == r2);    // True: igualdad por valor (con clases sería False)
var r3 = r1 with { Balance = 0 };   // copia con un cambio: los records son inmutables`)}
        <p>En la Unidad 3 vas a usar records para los <strong>DTO</strong> de las APIs (lo que entra y sale en JSON).</p>
        ${lab(0)}
      `,
      labs: [
        {
          type: 'predict',
          title: '¿Qué imprime? Records y clases',
          code: `var c1 = new PuntoClase { X = 1 };
var c2 = new PuntoClase { X = 1 };
Console.WriteLine(c1 == c2);
var r1 = new PuntoRecord(1);
var r2 = new PuntoRecord(1);
Console.WriteLine(r1 == r2);
var r3 = r1 with { X = 5 };
Console.WriteLine(r1.X);
Console.WriteLine(r3);

class PuntoClase { public int X { get; set; } }
record PuntoRecord(int X);`,
          expected: 'False\nTrue\n1\nPuntoRecord { X = 5 }',
          explain: '<p>Dos objetos de una clase son distintos aunque tengan los mismos datos (igualdad por referencia). Los records comparan por valor. <code>with</code> crea una copia: r1 no cambia.</p>',
        },
      ],
      exercises: [
        {
          official: 'N° 9',
          level: 3,
          title: 'Cuentas bancarias: herencia, propiedades y excepciones',
          prompt: `<p>Sobre el repositorio <code>dsw2026-ej9</code> (una clase <code>BankAccount</code> con getters, setters y un <code>if</code> por tipo de cuenta en cada operación), trabajando en <code>development</code>:</p>
            <ol>
              <li>Refactorizar aplicando herencia.</li>
              <li>Reemplazar getters, setters y campos por propiedades con la accesibilidad correcta.</li>
              <li>El número y el saldo se reciben en el constructor; la tasa de interés y el límite de descubierto se indican al inicializar, pero no por constructor.</li>
              <li>Reglas: monto menor o igual a 0 → <code>InvalidAmount</code>; cuenta no activa → <code>AccountNotActive</code>; retiro sin saldo (considerando el descubierto) → <code>InsufficientBalance</code> y la cuenta queda suspendida. Con los mensajes del enunciado.</li>
              <li>Instanciar 4 cuentas (dos de cada tipo), operar para comprobar todo, y recorrerlas creando un <code>record</code> con número, tipo y saldo.</li>
              <li>La aplicación no debe interrumpirse si se produce una excepción.</li>
            </ol>`,
          hints: ['Los <code>if (_type == ...)</code> son la señal: cada rama va a una subclase.', 'La única diferencia del retiro es cuánto puede quedar en negativo. Un método virtual <code>AvailableOverdraft()</code> que devuelve 0 en la base y el límite en la cuenta corriente evita duplicar el retiro.', 'La validación de monto y estado es común a todas las operaciones: un método protegido en la base.', '<code>init</code> resuelve “al inicializar pero no por constructor”.'],
          solution: sol(`<p>Compilado y ejecutado con .NET 10. La base concentra lo común (validación y retiro); cada subclase aporta solo lo que la diferencia. La salida muestra cada regla funcionando y el programa continúa después de cada excepción.</p>`, [
            ['Domain/BankAccount.cs', 'cs', `using Dsw2026Ej9.Domain.Exceptions;

namespace Dsw2026Ej9.Domain;

public abstract class BankAccount
{
    public string Number { get; }
    public decimal Balance { get; protected set; }
    public Status Status { get; protected set; } = Status.Active;
    public string[] Holders { get; init; } = [];
    public abstract AccountType Type { get; }

    protected BankAccount(string number, decimal balance)
    {
        Number = number;
        Balance = balance;
    }

    public virtual void Deposit(decimal amount)
    {
        Validate(amount);
        Balance += amount;
    }

    public void Withdraw(decimal amount)
    {
        Validate(amount);
        if (Balance - amount < -AvailableOverdraft())
        {
            Status = Status.Suspended;
            throw new InsufficientBalance();
        }
        Balance -= amount;
    }

    // Cuánto puede quedar en negativo la cuenta: 0 salvo que una subclase diga otra cosa
    protected virtual decimal AvailableOverdraft() => 0;

    protected void Validate(decimal amount)
    {
        if (Status != Status.Active) throw new AccountNotActive(Status);
        if (amount <= 0) throw new InvalidAmount();
    }
}

public class SavingsAccount : BankAccount
{
    public decimal InterestRate { get; init; }
    public override AccountType Type => AccountType.SavingsAccount;

    public SavingsAccount(string number, decimal balance) : base(number, balance) { }

    public void ApplyInterest()
    {
        if (Status != Status.Active) throw new AccountNotActive(Status);
        Balance += Balance * InterestRate;
    }
}

public class CheckingAccount : BankAccount
{
    public decimal OverdraftLimit { get; init; }
    public decimal Commission { get; init; }
    public override AccountType Type => AccountType.CheckingAccount;

    public CheckingAccount(string number, decimal balance) : base(number, balance) { }

    public override void Deposit(decimal amount)
    {
        Validate(amount);
        Balance += amount - amount * Commission;
    }

    protected override decimal AvailableOverdraft() => OverdraftLimit;
}

public record AccountSummary(string Number, AccountType Type, decimal Balance);`],
            ['Domain/Exceptions/AccountExceptions.cs', 'cs', `namespace Dsw2026Ej9.Domain.Exceptions;

public class InvalidAmount : Exception
{
    public InvalidAmount() : base("El monto ingresado no es válido para la operación solicitada") { }
}

public class AccountNotActive : Exception
{
    public AccountNotActive(Status status) : base($"No se puede operar con la cuenta {status}") { }
}

public class InsufficientBalance : Exception
{
    public InsufficientBalance() : base("La cuenta no cuenta con saldo para la operación solicitada. Fue suspendida.") { }
}`],
            ['Program.cs', 'cs', `using Dsw2026Ej9.Domain;

var accounts = new List<BankAccount>
{
    new SavingsAccount("CA-001", 10000) { InterestRate = 0.05m, Holders = ["Ana"] },
    new SavingsAccount("CA-002", 500) { InterestRate = 0.03m },
    new CheckingAccount("CC-001", 2000) { OverdraftLimit = 5000, Commission = 0.01m },
    new CheckingAccount("CC-002", 0) { OverdraftLimit = 1000, Commission = 0.02m },
};

void Try(string label, Action action)
{
    try { action(); Console.WriteLine($"OK   {label}"); }
    catch (Exception ex) { Console.WriteLine($"FAIL {label}: {ex.GetType().Name} - {ex.Message}"); }
}

var ca1 = (SavingsAccount)accounts[0];
var ca2 = (SavingsAccount)accounts[1];
var cc1 = (CheckingAccount)accounts[2];
var cc2 = (CheckingAccount)accounts[3];

Try("Depósito 1000 en CA-001", () => ca1.Deposit(1000));
Try("Interés en CA-001", ca1.ApplyInterest);
Try("Depósito -50 en CA-001", () => ca1.Deposit(-50));
Try("Retiro 800 en CA-002 (saldo 500)", () => ca2.Withdraw(800));
Try("Depósito 100 en CA-002 suspendida", () => ca2.Deposit(100));
Try("Depósito 1000 en CC-001 (comisión 1 %)", () => cc1.Deposit(1000));
Try("Retiro 6000 en CC-001 (descubierto 5000)", () => cc1.Withdraw(6000));
Try("Retiro 1500 en CC-002 (descubierto 1000)", () => cc2.Withdraw(1500));

foreach (var a in accounts)
    Console.WriteLine(new AccountSummary(a.Number, a.Type, a.Balance));`],
            ['Salida', 'text', `OK   Depósito 1000 en CA-001
OK   Interés en CA-001
FAIL Depósito -50 en CA-001: InvalidAmount - El monto ingresado no es válido para la operación solicitada
FAIL Retiro 800 en CA-002 (saldo 500): InsufficientBalance - La cuenta no cuenta con saldo para la operación solicitada. Fue suspendida.
FAIL Depósito 100 en CA-002 suspendida: AccountNotActive - No se puede operar con la cuenta Suspended
OK   Depósito 1000 en CC-001 (comisión 1 %)
OK   Retiro 6000 en CC-001 (descubierto 5000)
FAIL Retiro 1500 en CC-002 (descubierto 1000): InsufficientBalance - La cuenta no cuenta con saldo para la operación solicitada. Fue suspendida.
AccountSummary { Number = CA-001, Type = SavingsAccount, Balance = 11550,00 }
AccountSummary { Number = CA-002, Type = SavingsAccount, Balance = 500 }
AccountSummary { Number = CC-001, Type = CheckingAccount, Balance = -3010,00 }
AccountSummary { Number = CC-002, Type = CheckingAccount, Balance = 0 }`],
          ]),
        },
      ],
      quiz: [
        { q: '¿Qué permite <code>public decimal Balance { get; private set; }</code>?', o: ['Que cualquiera lea y asigne el saldo.', 'Que cualquiera lea el saldo y solo la clase lo asigne.', 'Que nadie lo lea.', 'Que solo las derivadas lo asignen.'], a: 1, e: 'El get es público y el set privado.' },
        { q: '¿Para qué sirve <code>init</code>?', o: ['Para que la propiedad solo se pueda asignar al construir el objeto.', 'Para inicializar con 0.', 'Para que sea estática.', 'Para que se calcule cada vez.'], a: 0, e: 'Después de la construcción es de solo lectura.' },
        { q: '¿Cuándo dos records son iguales con <code>==</code>?', o: ['Cuando son el mismo objeto.', 'Cuando todas sus propiedades tienen el mismo valor.', 'Nunca.', 'Cuando tienen el mismo nombre de tipo.'], a: 1, e: 'Los records tienen igualdad por valor.' },
        { q: '¿Qué hace <code>r with { Balance = 0 }</code>?', o: ['Modifica r.', 'Crea una copia de r con Balance en 0.', 'Compara r con 0.', 'No compila.'], a: 1, e: 'Los records son inmutables: with produce otro.' },
        { q: '<code>public bool IsOverdrawn => Balance &lt; 0;</code> es…', o: ['…un campo.', '…una propiedad calculada de solo lectura.', '…un método void.', '…un evento.'], a: 1, e: 'No guarda nada: se calcula al leerla.' },
        { q: 'Según el libro, ¿cuándo NO conviene usar una propiedad?', o: ['Para datos simples del objeto.', 'Para operaciones lentas o con efectos laterales.', 'Para valores de solo lectura.', 'Para valores calculados.'], a: 1, e: 'Quien la lee espera que sea tan barata como un campo.' },
      ],
      sources: [
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(15), points: ['Encapsular con métodos y con propiedades; get y set.', 'Restricciones de las propiedades y propiedades en interfaces.', 'Propiedades automáticas e inicializadores de objeto.', 'Records con propiedades.'] },
        { title: 'Registros (records)', url: 'https://learn.microsoft.com/es-es/dotnet/csharp/fundamentals/types/records', points: ['Igualdad basada en valores y mutación no destructiva con with.', 'Sintaxis posicional y ToString generado.'] },
      ],
    },

    {
      id: 'enums-structs-arrays',
      module: 'cs-oop',
      title: 'Enumeraciones, estructuras y arreglos',
      keywords: 'enum enumeraciones struct estructuras tipo por valor arreglos arrays multidimensionales irregulares jagged copia params parametros variables sum',
      tldr: 'Un <mark>enum</mark> da nombre a un conjunto fijo de valores; un <mark>struct</mark> es un tipo por valor liviano; un <mark>arreglo</mark> guarda una cantidad fija de elementos del mismo tipo, y <code>params</code> permite pasar una cantidad variable de argumentos.',
      goals: [
        'Declarar y usar enumeraciones.',
        'Decidir entre struct y class.',
        'Crear, recorrer y copiar arreglos, incluidos los multidimensionales.',
        'Escribir métodos con params.',
      ],
      body: `
        <h2>Enumeraciones</h2>
        ${code('cs', `public enum Status
{
    Active = 1,        // si no indicás, empieza en 0
    Inactive,          // 2
    Suspended          // 3
}

Status s = Status.Active;
Console.WriteLine(s);              // Active
Console.WriteLine((int)s);         // 1
Status desdeTexto = Enum.Parse<Status>("Suspended");
bool valido = Enum.IsDefined(typeof(Status), 5);   // false`)}
        <p>Un enum es un tipo por valor cuyo tipo subyacente es <code>int</code> (podés cambiarlo: <code>enum Talle : byte</code>). Evita los “números mágicos” y los strings libres: <code>Status.Suspended</code> se lee y el compilador lo verifica.</p>

        <h2>Estructuras</h2>
        <p>Un <code>struct</code> se declara como una clase, pero es un <strong>tipo por valor</strong>: se copia completo al asignarlo. <code>int</code>, <code>double</code>, <code>DateTime</code> y <code>Guid</code> son structs.</p>
        ${table(['', 'struct', 'class'], [
          ['Tipo', 'Por valor', 'Por referencia'],
          ['Herencia', 'No (solo interfaces)', 'Sí'],
          ['Null', 'No (salvo <code>Nullable</code>)', 'Sí'],
          ['Cuándo', 'Datos chicos e inmutables (coordenadas, dinero)', 'Entidades con identidad y comportamiento'],
        ])}

        <h2>Arreglos</h2>
        ${code('cs', `int[] notas = new int[3];                 // tamaño fijo, inicializado en 0
int[] primos = { 2, 3, 5, 7 };            // inicializado
string[] tipos = ["Eléctrico", "Combustible"];   // expresión de colección (C# 12)

Console.WriteLine(primos[0]);             // 2  (índices desde 0)
Console.WriteLine(primos.Length);         // 4
// primos[4] = 11;                        // IndexOutOfRangeException

foreach (int p in primos) Console.Write($"{p} ");

int[,] tablero = new int[3, 3];           // multidimensional (rectangular)
tablero[1, 2] = 5;
int[][] irregular = new int[2][];         // arreglo de arreglos (jagged)
irregular[0] = [1, 2];
irregular[1] = [3, 4, 5];`)}
        <p>Un arreglo es un tipo por referencia: <code>int[] b = a;</code> no copia los datos. Para copiar: <code>(int[])a.Clone()</code>, <code>Array.Copy</code> o <code>a.ToArray()</code>.</p>

        <h2>params</h2>
        <p>Con <code>params</code>, un método acepta una cantidad variable de argumentos que llegan como arreglo:</p>
        ${code('cs', `public static int Sum(params int[] valores)
{
    if (valores.Length == 0) throw new ArgumentException("Se necesita al menos un valor");
    int total = 0;
    foreach (int v in valores) total += v;
    return total;
}

Sum(1, 2, 3);          // 6
Sum(new[] { 4, 5 });   // también acepta un arreglo`)}
        <p>Solo puede haber un <code>params</code> y debe ser el último parámetro. A diferencia de los opcionales, <code>params</code> acepta cualquier cantidad.</p>
        ${lab(0)}
      `,
      labs: [
        {
          type: 'predict',
          title: '¿Qué imprime? Struct contra class',
          code: `var p1 = new PuntoS { X = 1 };
var p2 = p1;
p2.X = 9;
Console.WriteLine(p1.X);

var c1 = new PuntoC { X = 1 };
var c2 = c1;
c2.X = 9;
Console.WriteLine(c1.X);

int[] a = { 1, 2, 3 };
int[] b = a;
b[0] = 100;
Console.WriteLine(a[0]);

struct PuntoS { public int X; }
class PuntoC { public int X; }`,
          expected: '1\n9\n100',
          explain: '<p>El struct se copia completo: p1 no cambia. La clase y el arreglo son tipos por referencia: b y c2 apuntan al mismo objeto que a y c1.</p>',
        },
      ],
      quiz: [
        { q: 'Si no indicás valores, ¿con qué número empieza un enum?', o: ['1', '0', '-1', 'No tiene números'], a: 1, e: 'El primer miembro vale 0 salvo que asignes otro.' },
        { q: '¿Qué es un struct?', o: ['Un tipo por referencia.', 'Un tipo por valor que se copia completo al asignarlo.', 'Una clase abstracta.', 'Un arreglo.'], a: 1, e: 'int y DateTime son structs.' },
        { q: '¿Qué pasa con <code>primos[primos.Length]</code>?', o: ['Devuelve el último.', 'Lanza IndexOutOfRangeException.', 'Devuelve 0.', 'No compila.'], a: 1, e: 'Los índices válidos van de 0 a Length - 1.' },
        { q: '<code>int[] b = a;</code> ¿copia los elementos?', o: ['Sí.', 'No: copia la referencia al mismo arreglo.', 'Solo el primero.', 'Depende del tamaño.'], a: 1, e: 'Los arreglos son tipos por referencia.' },
        { q: '¿Qué condición debe cumplir un parámetro params?', o: ['Ser el primero.', 'Ser el último y único params.', 'Ser opcional.', 'Ser de tipo object.'], a: 1, e: 'Solo uno y al final.' },
      ],
      sources: [
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(9), points: ['Declarar y usar enumeraciones.', 'Estructuras: diferencias con las clases, inicialización y copia.'] },
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(10), points: ['Declarar, crear, inicializar, recorrer y copiar arreglos.', 'Arreglos multidimensionales e irregulares; el juego de cartas.'] },
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(11), points: ['Arreglos de parámetros con params.', 'params object[] y comparación con parámetros opcionales.'] },
      ],
    },

    {
      id: 'interfaces-abstractas',
      module: 'cs-oop',
      title: 'Interfaces y clases abstractas',
      keywords: 'interfaces interface implementar contrato multiples interfaces implementacion explicita clases abstractas abstract metodos abstractos sealed idraw icolor drawingshape cuando usar',
      tldr: 'Una <mark>interfaz</mark> define qué debe saber hacer un tipo, sin decir cómo. Una <mark>clase abstracta</mark> es una base incompleta: comparte código y deja huecos (métodos abstractos) que las derivadas deben completar.',
      goals: [
        'Definir e implementar interfaces, incluso varias en una misma clase.',
        'Referenciar objetos a través de una interfaz.',
        'Crear clases abstractas con métodos abstractos.',
        'Elegir entre interfaz y clase abstracta.',
      ],
      body: `
        <h2>Interfaces</h2>
        ${code('cs', `public interface IDraw
{
    void SetLocation(int x, int y);
    void Draw(Canvas canvas);
}

public interface IColor
{
    void SetColor(Color color);
}

// Una clase hereda de UNA clase, pero implementa MUCHAS interfaces
public class Square : IDraw, IColor
{
    private int _x, _y, _side;
    public Square(int side) => _side = side;

    public void SetLocation(int x, int y) { _x = x; _y = y; }
    public void Draw(Canvas canvas) { /* … */ }
    public void SetColor(Color color) { /* … */ }
}

IDraw figura = new Square(100);     // se usa a través de la interfaz
figura.SetLocation(10, 10);`)}
        <p>Una interfaz solo declara firmas (a partir de C# 8 puede tener implementaciones por defecto, pero no es lo habitual). No tiene campos ni constructores, y no se instancia. Una clase que la implementa debe implementar <strong>todos</strong> sus miembros como <code>public</code>.</p>
        <p>Por convención, su nombre empieza con <code>I</code>. En la Unidad 3 las interfaces son la base de todo: <code>IPersistence</code>, <code>IDoctorService</code>, <code>ILogger&lt;T&gt;</code>. Permiten cambiar una implementación por otra (memoria por base de datos) sin tocar a quien la usa.</p>
        ${note('Si dos interfaces tienen un método con la misma firma, podés implementarlos por separado con <strong>implementación explícita</strong>: <code>void IDraw.Draw(Canvas c) { … }</code>. Ese método solo se puede llamar a través de una variable del tipo de esa interfaz.', 'tip')}

        <h2>Clases abstractas</h2>
        <p>Cuando varias clases comparten código, repetirlo en cada una es un error. Una clase <code>abstract</code> concentra lo común y no se puede instanciar:</p>
        ${code('cs', `public abstract class DrawingShape
{
    protected int Size;
    protected int LocX, LocY;
    protected Color Color;

    protected DrawingShape(int size) => Size = size;

    public void SetLocation(int x, int y) { LocX = x; LocY = y; }   // común a todas
    public void SetColor(Color color) => Color = color;

    public abstract double Area();          // cada figura la calcula distinto
}

public class Circle : DrawingShape, IDraw, IColor
{
    public Circle(int diameter) : base(diameter) { }
    public override double Area() => Math.PI * Math.Pow(Size / 2.0, 2);
    public void Draw(Canvas canvas) { /* … */ }
}

// var s = new DrawingShape(10);   // error CS0144: no se puede crear una instancia de una clase abstracta`)}
        <p>Un método <code>abstract</code> no tiene cuerpo, es implícitamente virtual y las derivadas no abstractas deben redefinirlo con <code>override</code>.</p>

        <h2>¿Interfaz o clase abstracta?</h2>
        ${table(['', 'Interfaz', 'Clase abstracta'], [
          ['Expresa', 'Una capacidad: “sabe dibujarse”', 'Una identidad: “es una figura”'],
          ['Código compartido', 'Normalmente no', 'Sí: campos, constructores, métodos'],
          ['Cuántas', 'Una clase implementa muchas', 'Una clase hereda de una sola'],
          ['Modificadores', 'Miembros públicos', 'Cualquier accesibilidad'],
        ])}
        <p>Pueden combinarse, como en el ejemplo: la clase abstracta comparte código y las interfaces definen contratos que otros consumen.</p>
        ${lab(0)}
      `,
      labs: [
        {
          type: 'classify',
          title: '¿Interfaz, clase abstracta o clase concreta?',
          buckets: ['Interfaz', 'Clase abstracta', 'Clase concreta'],
          items: [
            { t: 'IPersistence: cualquier forma de guardar médicos (memoria, base de datos)', b: 0, why: 'Es un contrato sin código común: cada implementación es totalmente distinta.' },
            { t: 'Vehiculo: patente, marca y sucursal comunes; el consumo depende del tipo', b: 1, why: 'Hay datos compartidos y un método que cada derivada completa.' },
            { t: 'VehiculoElectrico', b: 2, why: 'Se instancia: es un vehículo concreto.' },
            { t: 'BaseEntity: todas las entidades tienen un Id', b: 1, why: 'Comparte un dato y no tiene sentido instanciarla sola (EJ15).' },
            { t: 'IComparable&lt;T&gt;: “sé compararme con otro T”', b: 0, why: 'Es una capacidad que pueden tener tipos sin relación.' },
            { t: 'PersistenceInMemory', b: 2, why: 'Es la implementación concreta de IPersistence.' },
          ],
        },
      ],
      quiz: [
        { q: '¿Cuántas interfaces puede implementar una clase en C#?', o: ['Una.', 'Dos.', 'Las que quiera.', 'Ninguna si hereda de otra clase.'], a: 2, e: 'Herencia simple de clases, múltiple de interfaces.' },
        { q: '¿Se puede instanciar una clase abstracta?', o: ['Sí.', 'No.', 'Solo dentro de la propia clase.', 'Solo si no tiene métodos abstractos.'], a: 1, e: 'Error CS0144. Se instancian sus derivadas concretas.' },
        { q: 'Un método <code>abstract</code>…', o: ['…tiene una implementación por defecto.', '…no tiene cuerpo y las derivadas concretas deben redefinirlo.', '…es estático.', '…no se puede redefinir.'], a: 1, e: 'Es implícitamente virtual.' },
        { q: '¿Qué ventaja da programar contra una interfaz (<code>IPersistence</code>) en vez de una clase (<code>PersistenceInMemory</code>)?', o: ['El código corre más rápido.', 'Se puede cambiar la implementación sin modificar a quien la usa.', 'No hace falta implementar los métodos.', 'Evita usar new.'], a: 1, e: 'Es la base de la inversión de dependencias de la Unidad 3.' },
        { q: '¿Cuándo conviene una clase abstracta en lugar de una interfaz?', o: ['Cuando querés compartir código y estado entre las derivadas.', 'Cuando la clase debe implementar varias.', 'Nunca.', 'Cuando los miembros son todos públicos.'], a: 0, e: 'La interfaz define el qué; la abstracta además comparte el cómo.' },
      ],
      sources: [
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(13), points: ['Definir, implementar y referenciar interfaces; varias interfaces; implementación explícita.', 'IDraw, IColor, Square y Circle.', 'Clases abstractas (DrawingShape), métodos abstractos y clases selladas.'] },
      ],
    },

    {
      id: 'genericos',
      module: 'cs-oop',
      title: 'Genéricos',
      keywords: 'genericos generics <t> parametro de tipo restricciones where class new interfaz metodos genericos interfaces genericas icomparable arbol binario tree boxing object varianza covarianza contravarianza ej10 bodega barco',
      tldr: 'Los <mark>genéricos</mark> te dejan escribir una clase o un método una sola vez para cualquier tipo, manteniendo la seguridad de tipos: <code>List&lt;Alimento&gt;</code> solo acepta alimentos, sin casts ni boxing.',
      goals: [
        'Explicar el problema que resuelven los genéricos frente a object.',
        'Crear clases, métodos e interfaces genéricas.',
        'Restringir los parámetros de tipo con where.',
        'Resolver el EJ10.',
      ],
      body: `
        <h2>El problema con object</h2>
        <p>La bodega básica del EJ10 guarda todo como <code>object</code> en un <code>ArrayList</code>. Funciona, pero:</p>
        <ul>
          <li>Al sacar un elemento hay que hacer un <strong>cast</strong>, y si te equivocás de tipo, explota en ejecución (<code>InvalidCastException</code>).</li>
          <li>Nada impide meter un martillo entre las manzanas: el compilador no verifica.</li>
          <li>Los tipos por valor (<code>int</code>) se <strong>boxean</strong> al guardarse: más memoria y más lento.</li>
        </ul>
        <p>Hacer una bodega por tipo (<code>Alimentos</code>, <code>Herramientas</code>, <code>Enteros</code>) resuelve la seguridad pero repite el mismo código una y otra vez.</p>

        <h2>Una clase genérica</h2>
        ${code('cs', `public class Bodega<T>                 // T es un parámetro de tipo
{
    private readonly List<T> _items = [];

    public void Agregar(T item) => _items.Add(item);
    public T Obtener(int index) => _items[index];
    public IReadOnlyList<T> Listar() => _items;
}

var alimentos = new Bodega<Alimento>();      // T = Alimento
alimentos.Agregar(new Alimento("Manzana"));
// alimentos.Agregar(new Herramienta("Martillo"));   // error de compilación
Alimento a = alimentos.Obtener(0);           // sin cast`)}
        <p>El compilador genera una versión especializada para cada tipo que uses. La lógica se escribe una vez y el tipo se verifica al compilar.</p>

        <h2>Restricciones</h2>
        <p>Por defecto, dentro de la clase solo podés hacer con <code>T</code> lo que se puede hacer con cualquier <code>object</code>. Las restricciones (<code>where</code>) limitan qué tipos se aceptan y, a cambio, habilitan sus miembros:</p>
        ${table(['Restricción', 'Exige que T…'], [
          ['<code>where T : class</code>', 'sea un tipo por referencia'],
          ['<code>where T : struct</code>', 'sea un tipo por valor'],
          ['<code>where T : new()</code>', 'tenga constructor sin parámetros (podés hacer <code>new T()</code>)'],
          ['<code>where T : IMercancia</code>', 'implemente esa interfaz (podés usar sus miembros)'],
          ['<code>where T : Vehiculo</code>', 'sea Vehiculo o derive de él'],
          ['<code>where T : IComparable&lt;T&gt;</code>', 'se pueda comparar con otro T (por ejemplo, para ordenar)'],
        ])}

        <h2>Métodos e interfaces genéricas</h2>
        ${code('cs', `// Método genérico: el tipo se infiere de los argumentos
public static T Mayor<T>(T a, T b) where T : IComparable<T>
    => a.CompareTo(b) >= 0 ? a : b;

Mayor(3, 7);              // 7  (T = int)
Mayor("pera", "manzana"); // "pera"

// Árbol binario ordenado del libro: necesita comparar elementos
public class Tree<TItem> where TItem : IComparable<TItem>
{
    public TItem NodeData { get; set; }
    public Tree<TItem>? LeftTree { get; set; }
    public Tree<TItem>? RightTree { get; set; }

    public Tree(TItem nodeValue) => NodeData = nodeValue;

    public void Insert(TItem newItem)
    {
        if (newItem.CompareTo(NodeData) < 0)
        {
            if (LeftTree is null) LeftTree = new Tree<TItem>(newItem);
            else LeftTree.Insert(newItem);
        }
        else
        {
            if (RightTree is null) RightTree = new Tree<TItem>(newItem);
            else RightTree.Insert(newItem);
        }
    }

    // Recorrido en orden: devuelve los elementos ordenados
    public string WalkTree() => $"{LeftTree?.WalkTree()} {NodeData} {RightTree?.WalkTree()}".Trim();
}`)}
        <p>La interfaz <code>IComparable&lt;T&gt;</code> tiene un solo método, <code>CompareTo</code>, que devuelve un número negativo, cero o positivo según el orden. Los tipos numéricos y <code>string</code> ya la implementan.</p>
        ${note('Varianza (opcional): una interfaz genérica marcada con <code>out T</code> es <strong>covariante</strong> (un <code>IEnumerable&lt;string&gt;</code> se puede usar donde se espera <code>IEnumerable&lt;object&gt;</code>), y con <code>in T</code> es <strong>contravariante</strong> (un <code>IComparer&lt;object&gt;</code> sirve como <code>IComparer&lt;string&gt;</code>).', '')}
        ${lab(0)}
      `,
      labs: [
        {
          type: 'predict',
          title: '¿Qué imprime? El árbol genérico',
          code: `var arbol = new Tree<int>(5);
foreach (int n in new[] { 3, 8, 1, 4, 9 })
    arbol.Insert(n);
Console.WriteLine(arbol.WalkTree());

var nombres = new Tree<string>("Mario");
nombres.Insert("Ana");
nombres.Insert("Zoe");
Console.WriteLine(nombres.WalkTree());`,
          expected: '1 3 4 5 8 9\nAna Mario Zoe',
          explain: '<p>El recorrido en orden visita primero el subárbol izquierdo (menores), luego el nodo y después el derecho (mayores): la salida queda ordenada. El mismo código funciona para int y string porque ambos implementan <code>IComparable&lt;T&gt;</code>. (Usa la clase <code>Tree&lt;TItem&gt;</code> de arriba.)</p>',
        },
      ],
      exercises: [
        {
          official: 'N° 10',
          level: 2,
          title: 'El barco de carga: una bodega genérica',
          prompt: `<p>El barco tiene bodegas separadas para alimentos, herramientas y enteros, todas con el mismo código basado en <code>ArrayList</code>. No hay espacio para más bodegas. En <code>Dsw2026Ej10.Bodegas.Generica</code>:</p>
            <ol>
              <li>Crear una clase genérica con los métodos que debería tener una bodega.</li>
              <li>Completar el ejemplo de bodegas genéricas: instanciar una bodega por tipo de mercancía, agregar al menos dos elementos de cada tipo, listarlos y mostrarlos.</li>
              <li>Asegurar que la bodega genérica <strong>solo acepte mercancías</strong>.</li>
            </ol>`,
          hints: ['Las tres entidades (Alimento, Herramienta, ProductoElectronico) no tienen nada en común todavía. ¿Qué podrías agregarles para que el compilador sepa que son mercancías?', 'Una interfaz <code>IMercancia</code> con <code>Nombre</code> y una restricción <code>where T : IMercancia</code>.', 'Usá <code>List&lt;T&gt;</code> internamente: adiós ArrayList, casts y boxing.'],
          solution: sol(`<p>Verificado con .NET 10. La interfaz <code>IMercancia</code> cumple dos funciones: restringe qué tipos acepta la bodega (<code>Generica&lt;int&gt;</code> deja de compilar con el error CS0315) y permite usar <code>Nombre</code> dentro del código genérico. <code>Listar</code> devuelve <code>IReadOnlyList&lt;T&gt;</code> para que nadie modifique la bodega desde afuera.</p>`, [
            ['Entidades/IMercancia.cs', 'cs', `namespace Dsw2026Ej10.Entidades;

// Identifica a cualquier mercancía que puede viajar en el barco
public interface IMercancia
{
    string Nombre { get; }
}`],
            ['Entidades/Alimento.cs (igual en Herramienta y ProductoElectronico)', 'cs', `namespace Dsw2026Ej10.Entidades;

public class Alimento : IMercancia
{
    public string Nombre { get; }
    public Alimento(string nombre) => Nombre = nombre;
}`],
            ['Bodegas/Generica.cs', 'cs', `using Dsw2026Ej10.Entidades;

namespace Dsw2026Ej10.Bodegas;

public class Generica<T> where T : IMercancia
{
    private readonly List<T> _items = [];

    public int Cantidad => _items.Count;

    public void Agregar(T item) => _items.Add(item);

    public T Obtener(int index)
    {
        if (index < 0 || index >= _items.Count)
            throw new ArgumentOutOfRangeException(nameof(index), "No hay un elemento en esa posición de la bodega");
        return _items[index];
    }

    public IReadOnlyList<T> Listar() => _items;
}`],
            ['Ejemplos.BodegaGenerica', 'cs', `public static void BodegaGenerica()
{
    var alimentos = new Generica<Alimento>();
    alimentos.Agregar(new Alimento("Manzana"));
    alimentos.Agregar(new Alimento("Yerba"));

    var herramientas = new Generica<Herramienta>();
    herramientas.Agregar(new Herramienta("Martillo"));
    herramientas.Agregar(new Herramienta("Taladro", true));

    var electronica = new Generica<ProductoElectronico>();
    electronica.Agregar(new ProductoElectronico("Pantalla", "Samsung"));
    electronica.Agregar(new ProductoElectronico("Mouse", "Logitech"));

    Mostrar("Alimentos", alimentos);
    Mostrar("Herramientas", herramientas);
    Mostrar("Electrónica", electronica);
    // var enteros = new Generica<int>();   // error CS0315: int no es una mercancía
}

private static void Mostrar<T>(string titulo, Generica<T> bodega) where T : IMercancia
{
    Console.WriteLine($"--- {titulo} ({bodega.Cantidad}) ---");
    foreach (T item in bodega.Listar())
        Console.WriteLine($"- {item.Nombre}");
}`],
          ]),
        },
      ],
      quiz: [
        { q: '¿Qué problema de <code>ArrayList</code> resuelven los genéricos?', o: ['Ninguno, son equivalentes.', 'La falta de verificación de tipos al compilar, los casts y el boxing.', 'Que ArrayList no puede crecer.', 'Que ArrayList no se puede recorrer.'], a: 1, e: 'List<T> es seguro y eficiente.' },
        { q: '<code>class Bodega&lt;T&gt; where T : IMercancia</code> significa que…', o: ['…T puede ser cualquier tipo.', '…T debe implementar IMercancia.', '…T es IMercancia exactamente.', '…T debe tener constructor vacío.'], a: 1, e: 'Las restricciones limitan los tipos aceptados.' },
        { q: '¿Qué restricción permite escribir <code>new T()</code>?', o: ['where T : class', 'where T : new()', 'where T : struct', 'where T : object'], a: 1, e: 'Exige un constructor sin parámetros.' },
        { q: '¿Qué devuelve <code>a.CompareTo(b)</code> cuando a es menor que b?', o: ['Un número negativo.', 'Cero.', 'Un número positivo.', 'true.'], a: 0, e: 'Negativo, cero o positivo según el orden.' },
        { q: '<code>Mayor(3, 7)</code> con <code>static T Mayor&lt;T&gt;(T a, T b)</code>: ¿cómo sabe el compilador qué es T?', o: ['Hay que escribir Mayor&lt;int&gt; siempre.', 'Lo infiere de los argumentos.', 'T es siempre object.', 'No compila.'], a: 1, e: 'La inferencia de tipos evita escribirlo.' },
      ],
      sources: [
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(17), points: ['El problema del tipo object y la solución con genéricos.', 'Restricciones; clases genéricas: el árbol binario Tree<TItem>.', 'Métodos genéricos (InsertIntoTree) e interfaces genéricas.', 'Interfaces IComparable e IComparable<T>; varianza.'] },
      ],
    },
  );
})();
