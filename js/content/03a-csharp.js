/* Módulo: C# fundamentos (Unidad 2, clases 5 a 7: Microsoft Visual C# Step by Step caps. 1 a 6) */
(() => {
  const { code, table, note, lab, fig, sol, flow } = window.GUIDE.h;
  const VCS = (c) => `Sharp, <em>Microsoft Visual C# Step by Step</em>, 10ª ed., cap. ${c}`;

  window.GUIDE.LESSONS.push(
    {
      id: 'dotnet-visual-studio',
      module: 'cs-base',
      title: 'La plataforma .NET y Visual Studio',
      keywords: '.net dotnet clr runtime bcl il jit sdk lts sts net standard nuget ensamblado assembly visual studio solucion proyecto slnx csproj namespace consola dotnet new dotnet run ej05',
      tldr: '.NET es una plataforma gratuita y multiplataforma: escribís en C#, el compilador genera <mark>código intermedio (IL)</mark> y el <mark>runtime (CLR)</mark> lo convierte a código de máquina mientras se ejecuta. Visual Studio es el entorno para escribir, depurar y probar ese código.',
      goals: [
        'Explicar qué son el CLR, la biblioteca de clases, el IL y el compilador JIT.',
        'Distinguir SDK de runtime, y las versiones LTS de las STS.',
        'Reconocer la estructura de una solución y un proyecto en Visual Studio.',
        'Crear, compilar y ejecutar una aplicación de consola (con el IDE y con la CLI).',
      ],
      body: `
        <h2>Qué es .NET</h2>
        <p>.NET es una plataforma de desarrollo <strong>gratuita, de código abierto y multiplataforma</strong> (Windows, Linux, macOS, Android, iOS) para construir muchos tipos de aplicaciones: web, APIs, escritorio, móviles, juegos, servicios en la nube. Tiene tres piezas centrales:</p>
        ${table(['Pieza', 'Qué hace'], [
          ['<strong>Lenguajes</strong>', 'C# (el más usado y el de esta materia), F# y Visual Basic.'],
          ['<strong>Runtime (CLR)</strong>', 'El Common Language Runtime ejecuta el código: compila a código de máquina, administra la memoria (recolector de basura), maneja excepciones e hilos.'],
          ['<strong>Bibliotecas</strong>', 'La biblioteca de clases base (BCL) trae miles de tipos listos: colecciones, archivos, red, JSON, fechas. Además existen miles de paquetes en NuGet.'],
        ])}

        <h2>Del código fuente al programa que corre</h2>
        ${flow('Escribís Program.cs en C#', 'El compilador de C# (Roslyn) genera IL dentro de un ensamblado (.dll)', 'Al ejecutar, el CLR carga el ensamblado', 'El compilador JIT traduce el IL a código de máquina del procesador', 'Se ejecuta')}
        <ul>
          <li><strong>IL (lenguaje intermedio):</strong> un código independiente del procesador. Por eso el mismo <code>.dll</code> corre en Windows, Linux o macOS.</li>
          <li><strong>JIT (just-in-time):</strong> compila el IL a código nativo justo antes de ejecutarlo, y puede optimizar para el procesador real.</li>
          <li><strong>Ensamblado (assembly):</strong> la unidad de despliegue: un <code>.dll</code> o <code>.exe</code> con el IL y los metadatos de los tipos.</li>
          <li><strong>Código administrado:</strong> el que ejecuta el CLR. No liberás memoria a mano: el <strong>recolector de basura</strong> (GC) libera los objetos que ya nadie usa.</li>
        </ul>

        <h2>Implementaciones y versiones</h2>
        ${table(['Nombre', 'Qué es'], [
          ['<strong>.NET</strong> (antes .NET Core)', 'La implementación moderna y multiplataforma. Es la que usás: .NET 10.'],
          ['.NET Framework', 'La implementación original, solo para Windows. Se mantiene pero no evoluciona (última: 4.8.1).'],
          ['Mono', 'Implementación multiplataforma usada por Xamarin y Unity.'],
          ['.NET Standard', 'Una especificación de las APIs comunes a todas las implementaciones, pensada para compartir bibliotecas entre ellas. Hoy, con .NET unificado, casi no hace falta.'],
        ])}
        <p>Sale una versión de .NET por año, en noviembre. Las <strong>pares son LTS</strong> (soporte extendido de 3 años) y las impares <strong>STS</strong> (soporte estándar de 2 años). <strong>.NET 10</strong> (noviembre de 2025, con C# 14) es LTS: por eso la cátedra lo usa.</p>
        <p>Para desarrollar instalás el <strong>SDK</strong>, que incluye el compilador, la herramienta de línea de comandos <code>dotnet</code> y el runtime. Para solo ejecutar alcanza con el <strong>runtime</strong>.</p>
        ${note('Glosario rápido: <strong>TFM</strong> (target framework moniker) es el identificador de la versión destino, como <code>net10.0</code>. <strong>NuGet</strong> es el gestor de paquetes de .NET. <strong>BCL</strong> es la biblioteca de clases base.', '')}

        <h2>Visual Studio</h2>
        <p>Visual Studio 2026 es el IDE de Microsoft para .NET. Organiza el código en dos niveles:</p>
        ${table(['Nivel', 'Archivo', 'Qué contiene'], [
          ['<strong>Solución</strong>', '<code>.slnx</code> (antes <code>.sln</code>)', 'Un contenedor de uno o más proyectos relacionados. Lo que abrís en el IDE.'],
          ['<strong>Proyecto</strong>', '<code>.csproj</code>', 'El código de un ensamblado, su versión de .NET (TFM) y sus dependencias (paquetes NuGet y referencias a otros proyectos).'],
        ])}
        ${code('xml', `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>              <!-- Exe = aplicación; sin esto, biblioteca (.dll) -->
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>    <!-- using System; y otros, automáticos -->
    <Nullable>enable</Nullable>                <!-- advierte posibles null -->
  </PropertyGroup>
</Project>`, 'Dsw2026Ej6.csproj')}
        <p>Las ventanas que más vas a usar: el <strong>Explorador de soluciones</strong> (archivos y proyectos), el <strong>editor</strong> con IntelliSense (autocompletado), la <strong>Lista de errores</strong> y las ventanas de <strong>depuración</strong> que viste en la Unidad 1.</p>

        <h2>Una aplicación de consola</h2>
        ${code('cs', `namespace Dsw2026Ej6;          // agrupa tipos para evitar choques de nombres

internal class Program
{
    static void Main(string[] args)   // punto de entrada
    {
        Console.WriteLine("Hola, Desarrollo de Software");
    }
}`, 'Program.cs')}
        <p>Desde C# 9 también existen las <strong>instrucciones de nivel superior</strong>: un archivo puede tener directamente <code>Console.WriteLine("Hola");</code> y el compilador genera el <code>Main</code> por vos. Las dos formas son equivalentes.</p>
        <p>Un <strong>espacio de nombres</strong> (<code>namespace</code>) agrupa tipos relacionados, como una carpeta lógica: <code>System.Collections.Generic.List&lt;T&gt;</code>. La directiva <code>using System.Text;</code> te permite escribir <code>StringBuilder</code> en vez del nombre completo.</p>
        <h3>La misma tarea desde la terminal</h3>
        ${code('bash', `dotnet --list-sdks                         # qué SDK tenés instalados
dotnet new console -n Dsw2026Ej6          # crea el proyecto
cd Dsw2026Ej6
dotnet run                                 # compila y ejecuta
dotnet new sln -n Dsw2026Ej14              # crea una solución
dotnet sln add Dsw2026Ej14.Domain          # agrega un proyecto a la solución
dotnet add Api reference Domain            # referencia entre proyectos
dotnet add package Microsoft.EntityFrameworkCore   # paquete NuGet
dotnet build                               # solo compila
dotnet test                                # ejecuta las pruebas`)}
        ${note('Al abrir en el laboratorio una solución descargada de internet, Visual Studio puede mostrar una advertencia de seguridad: aceptala. Y donde el libro diga .NET 6.0, elegí .NET 8.0 o superior.', 'tip')}
        ${lab(0)}
      `,
      labs: [
        {
          type: 'classify',
          title: '¿Qué pieza de .NET es?',
          buckets: ['Compilador de C#', 'CLR (runtime)', 'Biblioteca de clases (BCL)', 'SDK / CLI'],
          items: [
            { t: 'Traduce Program.cs a IL', b: 0, why: 'Roslyn genera el ensamblado con IL.' },
            { t: 'Libera la memoria de los objetos que nadie usa', b: 1, why: 'Es el recolector de basura, parte del runtime.' },
            { t: 'Ofrece <code>List&lt;T&gt;</code>, <code>File</code> y <code>JsonSerializer</code>', b: 2, why: 'Son tipos de la biblioteca base.' },
            { t: 'Compila el IL a código de máquina al ejecutar (JIT)', b: 1, why: 'El JIT es parte del CLR.' },
            { t: '<code>dotnet new console</code>', b: 3, why: 'La herramienta de línea de comandos viene con el SDK.' },
            { t: 'Detecta que <code>int x = "hola";</code> es un error', b: 0, why: 'El compilador verifica los tipos antes de generar IL.' },
          ],
        },
      ],
      exercises: [
        {
          official: 'N° 5',
          level: 1,
          title: '.NET y Visual Studio: depurar y corregir con ramas',
          prompt: `<ol>
            <li>Aceptar la asignación de GitHub Classroom y clonar el repositorio creado.</li>
            <li>Crear la rama de largo recorrido <code>development</code>.</li>
            <li>Abrir la solución con Visual Studio 2026.</li>
            <li>Actualizar el README con legajo, apellidos y nombres, y confirmar.</li>
            <li>Ejecutar la aplicación y depurarla para encontrar los errores (es el cálculo de consumos de la empresa de logística, ahora en C#).</li>
            <li>Crear la rama <code>bugfix/calculo-consumos</code> basada en development, corregir los errores y actualizar development mediante un pull request.</li>
          </ol>`,
          hints: ['Los errores son los mismos que en el EJ01: revisá firmas, fórmulas y fronteras (> vs >=).', 'Poné un breakpoint en el método que calcula el total y usá F11 para entrar a <code>CalcularConsumo</code> de cada vehículo.', 'En C#, si un método de la base no es <code>virtual</code> o <code>abstract</code>, la subclase no puede sobrescribirlo con <code>override</code>.'],
          solution: sol(`<p>El flujo de Git es el de la Unidad 1. La corrección del código es la del EJ01 llevada a C#: <code>CalcularConsumo(double kilometros)</code> abstracto en la base y sobrescrito con <code>override</code> en cada subclase.</p>`, [
            ['Git', 'bash', `git clone <url-de-tu-repositorio>
cd <repositorio>
git switch -c development
# editar README.md
git commit -am "Completa el README con los datos del estudiante"
git push -u origin development
git switch -c bugfix/calculo-consumos
# corregir los errores
git commit -am "Corrige el cálculo de consumos"
git push -u origin bugfix/calculo-consumos
# En GitHub: pull request de bugfix/calculo-consumos hacia development`],
            ['VehiculoElectrico.cs', 'cs', `public override double CalcularConsumo(double kilometros)
{
    double total = kilometros / 100 * KwhBase;
    if (CapacidadCarga > 1200)
        total *= 1.15;
    return total;
}`],
            ['VehiculoCombustible.cs', 'cs', `public override double CalcularConsumo(double kilometros)
{
    double extras = DateTime.Now.Year - Anio > 5 ? kilometros / 15 * LitrosExtra : 0;
    return kilometros / KilometrosPorLitro + extras;
}`],
          ]),
        },
      ],
      quiz: [
        { q: '¿Qué genera el compilador de C# al compilar un proyecto?', o: ['Código de máquina para Windows.', 'Un ensamblado con código intermedio (IL) y metadatos.', 'Código JavaScript.', 'Un archivo .cs optimizado.'], a: 1, e: 'El IL es independiente del procesador; el JIT lo traduce al ejecutar.' },
        { q: '¿Qué componente libera la memoria de los objetos que ya no se usan?', o: ['El compilador JIT.', 'El recolector de basura del CLR.', 'Visual Studio.', 'NuGet.'], a: 1, e: 'En código administrado no se libera memoria a mano.' },
        { q: '¿Por qué la cátedra usa .NET 10?', o: ['Porque es la única versión que existe.', 'Porque es una versión LTS, con soporte extendido.', 'Porque solo funciona en Windows.', 'Porque es STS.'], a: 1, e: 'Las versiones pares son LTS: tres años de soporte.' },
        { q: '¿Qué diferencia hay entre una solución y un proyecto en Visual Studio?', o: ['Son lo mismo.', 'Una solución agrupa proyectos; cada proyecto compila a un ensamblado.', 'Un proyecto agrupa soluciones.', 'La solución contiene el código y el proyecto los paquetes.'], a: 1, e: '.slnx agrupa; .csproj describe un ensamblado.' },
        { q: '¿Qué comando crea una aplicación de consola nueva?', o: ['<code>dotnet run console</code>', '<code>dotnet new console</code>', '<code>dotnet build console</code>', '<code>dotnet add console</code>'], a: 1, e: 'dotnet new crea a partir de una plantilla.' },
        { q: 'Para qué sirve un <code>namespace</code>?', o: ['Para declarar variables globales.', 'Para agrupar tipos y evitar choques de nombres.', 'Para importar paquetes NuGet.', 'Para compilar más rápido.'], a: 1, e: 'Es una organización lógica de los tipos.' },
      ],
      sources: [
        { title: 'Introducción a .NET', url: 'https://learn.microsoft.com/es-es/dotnet/core/introduction', points: ['.NET es gratuito, de código abierto y multiplataforma.', 'Lenguajes, runtime, bibliotecas, SDK y herramientas.', 'Compilación a IL y JIT; recolección de elementos no utilizados.'] },
        { title: 'Directiva de soporte de .NET', url: 'https://dotnet.microsoft.com/es-es/platform/support/policy/dotnet-core', points: ['Versiones LTS (3 años) y STS (2 años).', 'Una versión principal por año, en noviembre.'] },
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(1), points: ['Crear una aplicación de consola en Visual Studio.', 'Espacios de nombres y la directiva using.', 'Ensamblados y referencias.'] },
      ],
    },

    {
      id: 'variables-operadores',
      module: 'cs-base',
      title: 'Variables, tipos y operadores',
      keywords: 'variables tipos primitivos int long float double decimal bool char string var identificadores palabras clave operadores aritmeticos precedencia asociatividad incremento division entera modulo interpolacion formato conversion parse tryparse checked overflow',
      tldr: 'Una variable es un lugar con nombre donde guardás un valor de un <mark>tipo</mark> fijo. El tipo define qué valores admite y qué operaciones tienen sentido: no es lo mismo dividir dos <code>int</code> que dos <code>double</code>.',
      goals: [
        'Declarar variables con los tipos primitivos y elegir el adecuado para cada dato.',
        'Predecir el resultado de expresiones con precedencia, división entera y módulo.',
        'Convertir texto a número de forma segura y formatear la salida.',
      ],
      body: `
        <h2>Instrucciones, identificadores y palabras clave</h2>
        <p>Una <strong>instrucción</strong> es una acción completa que termina en <code>;</code>. Un <strong>identificador</strong> es el nombre que le das a variables, métodos o clases: solo letras, dígitos y <code>_</code>, no puede empezar con un dígito, y distingue mayúsculas de minúsculas (<code>total</code> y <code>Total</code> son distintos). Las <strong>palabras clave</strong> (<code>class</code>, <code>int</code>, <code>if</code>…) están reservadas.</p>
        ${table(['Elemento', 'Convención en C#', 'Ejemplo'], [
          ['Clases, métodos, propiedades', 'PascalCase', '<code>CalcularConsumo</code>, <code>VehiculoElectrico</code>'],
          ['Variables locales y parámetros', 'camelCase', '<code>kilometros</code>, <code>totalConsumo</code>'],
          ['Campos privados', '_camelCase', '<code>_saldo</code>'],
          ['Interfaces', 'I + PascalCase', '<code>IPersistencia</code>'],
        ])}
        ${note('Las revisiones del EJ08 encontraron que un 25 % de los repositorios no respetaba las convenciones de nombres de C#. No es un detalle estético: forma parte de la corrección.', 'warn')}

        <h2>Tipos primitivos</h2>
        ${table(['Tipo', 'Tamaño', 'Rango o uso', 'Literal'], [
          ['<code>int</code>', '32 bits', '−2.147.483.648 a 2.147.483.647', '<code>42</code>'],
          ['<code>long</code>', '64 bits', 'Enteros grandes (códigos, legajos)', '<code>1001L</code>'],
          ['<code>float</code>', '32 bits', 'Decimales con unos 7 dígitos de precisión', '<code>0.21F</code>'],
          ['<code>double</code>', '64 bits', 'Decimales con unos 15 dígitos (cálculos científicos)', '<code>16.5</code>'],
          ['<code>decimal</code>', '128 bits', '28-29 dígitos exactos en base 10: <strong>dinero</strong>', '<code>2107.50m</code>'],
          ['<code>bool</code>', '8 bits', '<code>true</code> o <code>false</code>', '<code>true</code>'],
          ['<code>char</code>', '16 bits', 'Un carácter Unicode', "<code>'K'</code>"],
          ['<code>string</code>', 'variable', 'Texto (es un tipo por referencia)', '<code>"Hola"</code>'],
        ])}
        ${note('<code>float</code> y <code>double</code> guardan los números en binario y no pueden representar exactamente valores como 0,1. Por eso <code>15000 * (1 + 0.105F)</code> da <code>16575,000286…</code>. Para dinero usá <code>decimal</code>.', 'exam')}
        <h3>Variables y var</h3>
        ${code('cs', `int kilometros;            // declarada, todavía sin valor
kilometros = 100;          // asignada
double consumo = 16.5;     // declarada e inicializada
var patente = "AE123FG";   // tipo inferido: string (sigue siendo fuertemente tipada)
// var x;                  // error: var necesita un valor inicial para inferir el tipo
const double KwhCada100Km = 16;   // constante: no puede cambiar`)}
        <p>C# exige asignar una variable antes de leerla: usar <code>kilometros</code> sin asignarlo es un error de compilación.</p>

        <h2>Operadores aritméticos</h2>
        ${table(['Operador', 'Significado', 'Ejemplo', 'Resultado'], [
          ['<code>+ - *</code>', 'Suma, resta, multiplicación', '<code>3 + 4 * 2</code>', '<code>11</code>'],
          ['<code>/</code>', 'División. <strong>Entre enteros, trunca</strong>', '<code>7 / 2</code> y <code>7 / 2.0</code>', '<code>3</code> y <code>3,5</code>'],
          ['<code>%</code>', 'Resto de la división', '<code>7 % 2</code>', '<code>1</code>'],
          ['<code>++ --</code>', 'Incremento y decremento', '<code>x++</code>', 'suma 1 a x'],
        ])}
        <p><strong>Precedencia:</strong> <code>* / %</code> antes que <code>+ -</code>. Con igual precedencia, se evalúa de izquierda a derecha (<strong>asociatividad</strong>). Los paréntesis mandan sobre todo. La asignación <code>=</code> es asociativa a derecha: <code>a = b = 5</code> asigna 5 a b y luego a a.</p>
        <p><code>x++</code> (sufijo) devuelve el valor <em>anterior</em> y después incrementa; <code>++x</code> (prefijo) incrementa y devuelve el nuevo.</p>
        ${lab(0)}

        <h2>Texto: concatenación, interpolación y formato</h2>
        ${code('cs', `string nombre = "Auriculares";
decimal precio = 15000.5m;

string a = "Producto: " + nombre;                    // concatenación
string b = $"Producto: {nombre} cuesta {precio}";    // interpolación
string c = $"{precio:C}";        // moneda según la cultura: $ 15.000,50
string d = $"{precio:N2}";       // número con 2 decimales: 15.000,50
string e = $"{0.215:P1}";        // porcentaje: 21,5 %
string f = $"{nombre,-15}|";     // alineado a la izquierda en 15 caracteres`)}

        <h2>Convertir entre tipos</h2>
        <ul>
          <li><strong>Implícita:</strong> sin pérdida de información, la hace el compilador: <code>int</code> → <code>long</code> → <code>double</code>.</li>
          <li><strong>Explícita (cast):</strong> puede perder información y hay que pedirla: <code>(int)3.9</code> da <code>3</code>.</li>
          <li><strong>Desde texto:</strong> <code>int.Parse("42")</code> lanza una excepción si el texto no es un número; <code>int.TryParse(texto, out int n)</code> devuelve <code>false</code> sin excepción. Para leer lo que escribe un usuario, preferí <code>TryParse</code>.</li>
        </ul>
        ${code('cs', `Console.Write("Kilómetros: ");
if (int.TryParse(Console.ReadLine(), out int km))
    Console.WriteLine($"Vas a recorrer {km} km");
else
    Console.WriteLine("Ingresá un número válido");`)}
        <h3>Desbordamiento: checked y unchecked</h3>
        <p>Si una operación entera excede el rango del tipo, por defecto el valor “da la vuelta” sin avisar: <code>int.MaxValue + 1</code> da <code>-2147483648</code>. Dentro de un bloque <code>checked</code>, en cambio, se lanza <code>OverflowException</code>.</p>
        ${code('cs', `int max = int.MaxValue;
int a = unchecked(max + 1);   // -2147483648, sin error
int b = checked(max + 1);     // OverflowException`)}
        ${lab(1)}
      `,
      labs: [
        {
          type: 'predict',
          title: '¿Qué imprime? Operadores',
          code: `int a = 7, b = 2;
Console.WriteLine(a / b);
Console.WriteLine(a % b);
Console.WriteLine(a / (double)b);
Console.WriteLine(2 + 3 * 4);
Console.WriteLine((2 + 3) * 4);
int x = 5;
Console.WriteLine(x++);
Console.WriteLine(++x);`,
          expected: '3\n1\n3,5\n14\n20\n5\n7',
          explain: '<p>7 / 2 entre enteros trunca a 3. Con un <code>double</code> en la división, el resultado es 3,5 (la coma depende de la configuración regional; en Argentina, coma). <code>x++</code> devuelve 5 y deja x en 6; <code>++x</code> lo lleva a 7 y devuelve 7.</p>',
        },
        {
          type: 'classify',
          title: 'Elegí el tipo adecuado',
          buckets: ['int', 'long', 'decimal', 'double', 'bool', 'char', 'string'],
          items: [
            { t: 'El precio de un producto', b: 2, why: 'Dinero: necesita exactitud decimal.' },
            { t: 'El código de producto 1001 (el EJ06 pide “entero largo”)', b: 1, why: 'long admite enteros de 64 bits.' },
            { t: 'Si el producto está activo', b: 4, why: 'Solo dos valores posibles.' },
            { t: "La presentación: 'I', 'S', 'K', 'E' o 'P'", b: 5, why: 'Un único carácter.' },
            { t: 'La cantidad de stock', b: 0, why: 'Un entero chico alcanza.' },
            { t: 'Distancia en km medida por un GPS', b: 3, why: 'Medición física: double es lo habitual.' },
            { t: 'La descripción del producto', b: 6, why: 'Texto.' },
          ],
        },
      ],
      quiz: [
        { q: '¿Cuánto vale <code>17 / 5</code> en C#?', o: ['3,4', '3', '4', '2'], a: 1, e: 'Entre enteros la división trunca la parte decimal.' },
        { q: '¿Cuánto vale <code>17 % 5</code>?', o: ['3', '2', '3,4', '0'], a: 1, e: 'El resto de 17 / 5 es 2.' },
        { q: '¿Qué tipo conviene para guardar dinero?', o: ['float', 'double', 'decimal', 'int'], a: 2, e: 'decimal representa con exactitud fracciones decimales como 0,10.' },
        { q: 'Con <code>int x = 3; int y = x++ * 2;</code>, ¿cuánto vale y?', o: ['6', '8', '7', '4'], a: 0, e: 'x++ devuelve 3 (y después x pasa a 4): 3 × 2 = 6.' },
        { q: '¿Qué ventaja tiene <code>int.TryParse</code> sobre <code>int.Parse</code>?', o: ['Es más rápido siempre.', 'No lanza excepción si el texto no es un número: devuelve false.', 'Convierte también decimales.', 'No necesita una variable.'], a: 1, e: 'Ideal para validar entradas del usuario.' },
        { q: '<code>var total = 10.5m;</code> ¿De qué tipo es total?', o: ['double', 'float', 'decimal', 'var'], a: 2, e: 'El sufijo m indica decimal; var solo infiere el tipo.' },
        { q: '¿Qué hace un bloque <code>checked</code>?', o: ['Valida que las variables estén inicializadas.', 'Lanza OverflowException si una operación entera desborda.', 'Verifica la ortografía.', 'Convierte a decimal.'], a: 1, e: 'Sin checked, el desbordamiento pasa silenciosamente.' },
      ],
      sources: [
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(2), points: ['Instrucciones, identificadores y palabras clave.', 'Tipos primitivos y valores literales.', 'Operadores aritméticos, precedencia y asociatividad.', 'Variables con tipo implícito (var).'] },
        { title: 'Tipos numéricos en C#', url: 'https://learn.microsoft.com/es-es/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types', points: ['float, double y decimal: tamaño, precisión y sufijos (F, D, M).', 'decimal es apropiado para cálculos financieros.'] },
      ],
    },

    {
      id: 'metodos-ambito',
      module: 'cs-base',
      title: 'Métodos, ámbito y parámetros',
      keywords: 'metodos funciones return expression-bodied ambito scope variables locales campos sobrecarga overload parametros opcionales argumentos con nombre ambiguedad tuplas multiples valores funciones locales anidadas ej06 ej07',
      tldr: 'Un método es un bloque de código con nombre que recibe parámetros y puede devolver un valor. C# permite <mark>parámetros opcionales</mark>, <mark>argumentos con nombre</mark>, <mark>sobrecarga</mark> (mismo nombre, distintos parámetros) y devolver varios valores con tuplas.',
      goals: [
        'Declarar y llamar métodos, incluidos los de cuerpo de expresión.',
        'Distinguir el ámbito de una variable local y de un campo.',
        'Usar parámetros opcionales, argumentos con nombre y sobrecargas, y detectar llamadas ambiguas.',
        'Devolver varios valores con una tupla y usar funciones locales.',
      ],
      body: `
        <h2>Declarar un método</h2>
        ${code('cs', `// modificador  tipo de retorno  nombre      parámetros
   public       double           GetFinalPrice()
{
    return _price * (1 + _tax);
}

// Cuerpo de expresión (expression-bodied): para métodos de una sola expresión
public double GetFinalPrice() => _price * (1 + _tax);

// void: no devuelve nada
public void IncreaseStock() => _stock++;`)}
        <p>Para llamarlo: <code>double total = product.GetFinalPrice();</code>. Si el método devuelve un valor, la llamada es una expresión que podés usar en cualquier lugar donde iría ese tipo.</p>

        <h2>Ámbito</h2>
        <p>El <strong>ámbito</strong> de una variable es la región del código donde existe:</p>
        <ul>
          <li>Una <strong>variable local</strong> existe solo dentro del bloque <code>{ }</code> donde se declaró. Al salir del método, desaparece.</li>
          <li>Un <strong>campo</strong> (variable de la clase) existe mientras exista el objeto, y lo ven todos los métodos de la clase.</li>
        </ul>
        ${code('cs', `class Contador
{
    private int _total;              // campo: lo comparten todos los métodos

    public void Sumar(int cantidad)
    {
        int doble = cantidad * 2;    // local: solo existe dentro de Sumar
        _total += doble;
    }
    // acá "doble" no existe
}`)}

        <h2>Sobrecarga</h2>
        <p>Dos métodos pueden llamarse igual si sus parámetros difieren en cantidad o tipo. El compilador elige cuál llamar según los argumentos. El tipo de retorno no cuenta para distinguirlos.</p>
        ${code('cs', `public void IncreaseStock() => _stock++;
public void IncreaseStock(int quantity) { if (quantity > 0) _stock += quantity; }

product.IncreaseStock();     // llama a la primera
product.IncreaseStock(5);    // llama a la segunda`)}

        <h2>Parámetros opcionales y argumentos con nombre</h2>
        ${code('cs', `public void Update(string description, double price = 0, float tax = 0.21F) { … }

product.Update("Hamburguesa x 4");                    // price = 0, tax = 0.21
product.Update("Hamburguesa x 4", 10000);             // tax = 0.21
product.Update("Hamburguesa x 4", 10000, 0.105F);
product.Update("Hamburguesa x 4", tax: 0.05F);        // salteás price usando el nombre`)}
        <p>Los opcionales van siempre al final. Con <strong>argumentos con nombre</strong> podés pasarlos en cualquier orden y omitir los del medio.</p>
        <h3>Cuando opcionales y sobrecarga chocan</h3>
        <p>Si dos sobrecargas pueden aceptar la misma llamada y ninguna es “mejor”, la llamada es <strong>ambigua</strong> y no compila (error <code>CS0121</code>). Cuando una de las candidatas no necesita completar parámetros opcionales con valores por defecto, el compilador la prefiere.</p>
        ${lab(0)}

        <h2>Devolver varios valores: tuplas</h2>
        ${code('cs', `public (string Figura, decimal Area) CalcularArea(decimal lado1, decimal lado2 = 1, char tipo = 'C') { … }

var resultado = CalcularArea(3, 4, 'R');
Console.WriteLine(resultado.Figura);            // Rectángulo
var (figura, area) = CalcularArea(2);           // deconstrucción en dos variables
Console.WriteLine($"{figura}: {area:N2}");`)}
        <p>Otra forma, más antigua, es usar parámetros <code>out</code>: <code>bool TryParse(string s, out int resultado)</code>. Las tuplas suelen ser más claras.</p>

        <h2>Funciones locales</h2>
        <p>Un método puede declarar otros métodos adentro, visibles solo ahí. Ven los parámetros y variables del método que los contiene. Es lo que el EJ07 llama “método anidado”.</p>
        ${code('cs', `public decimal Total(decimal[] precios)
{
    decimal suma = 0;
    foreach (var p in precios) suma += ConIva(p);
    return suma;

    decimal ConIva(decimal precio) => precio * 1.21m;   // solo existe dentro de Total
}`)}
      `,
      labs: [
        {
          type: 'trace',
          title: '¿Qué sobrecarga se ejecuta?',
          intro: 'Las tres sobrecargas del EJ06 avanzado. Elegí una llamada y mirá qué decide el compilador (resultados verificados con .NET 10).',
          code: `public string GetInfo(bool includeTax = true)
    => $"{_description} {(includeTax ? GetFinalPrice() : _price):C}";

public string GetInfo(string prefix = "Producto")
    => $"{prefix} {_description}";

public string GetInfo(bool includeTax = true, bool includeStock = true)
    => GetInfo(includeTax) + (includeStock ? $" (stock: {_stock})" : "");`,
          scenarios: [
            { label: 'GetInfo()', lines: [], output: 'error CS0121: La llamada es ambigua entre los métodos siguientes: \'Product.GetInfo(bool)\' y \'Product.GetInfo(string)\'', note: 'Todas las sobrecargas aceptan cero argumentos usando sus valores por defecto, y ninguna es mejor que otra. No compila.' },
            { label: 'GetInfo(false)', lines: [1, 2], output: 'Hamburguesa x 4 $ 10.000,00', note: 'Un bool solo encaja en las versiones con bool. Entre (bool) y (bool, bool) gana la que no necesita completar opcionales: GetInfo(bool).' },
            { label: 'GetInfo("Oferta")', lines: [4, 5], output: 'Oferta Hamburguesa x 4', note: 'Un string solo encaja en GetInfo(string).' },
            { label: 'GetInfo(true)', lines: [1, 2], output: 'Hamburguesa x 4 $ 10.500,00', note: 'Igual que con false: se prefiere la sobrecarga sin parámetros opcionales sin completar.' },
            { label: 'GetInfo(includeStock: true)', lines: [7, 8], output: 'Hamburguesa x 4 $ 10.500,00 (stock: 0)', note: 'Solo la tercera tiene un parámetro llamado includeStock.' },
            { label: 'GetInfo(false, true)', lines: [7, 8], output: 'Hamburguesa x 4 $ 10.000,00 (stock: 0)', note: 'Dos bool: solo la tercera acepta dos argumentos.' },
            { label: 'GetInfo(prefix: "Producto")', lines: [4, 5], output: 'Producto Hamburguesa x 4', note: 'Así se resuelve la ambigüedad de GetInfo(): nombrando el parámetro.' },
          ],
        },
      ],
      exercises: [
        {
          official: 'N° 6',
          level: 2,
          title: 'La clase Product',
          prompt: `<p>Crear la aplicación de consola <code>Dsw2026Ej6</code> con la clase <code>Domain/Product</code>:</p>
            <ul>
              <li>Atributos: Code (entero largo), Description, Active, Price (punto flotante de 64 bits, sin impuesto), Tax (32 bits, inicia en 0.21), Stock, Presentation (I, S, K, E o P), Date (creación) e Internal.</li>
              <li>Constructor con código, descripción, precio y presentación. Si la presentación no es válida, usar I. Se crea activo, no interno y con la fecha actual.</li>
              <li>Un método get por atributo; set solo para Internal y Tax.</li>
              <li><code>Deactivate</code>, <code>GetFinalPrice</code> (con impuesto) y <code>GetDetailedInfo</code> con el formato <code>[Codigo] Descripcion [Presentacion]: Precio - Mensaje de stock</code> (Disponible, No disponible o Sin stock).</li>
              <li><code>IncreaseStock()</code> de cuerpo de expresión, <code>DecreaseStock()</code> sin stock negativo, <code>IncreaseStock(int)</code>.</li>
              <li><code>GetPricePerFraction(int)</code> solo para presentación K; <code>GetPackaging()</code> con los nombres de cada presentación; <code>Update(description, price = 0, tax = 0.21)</code>.</li>
              <li><strong>Avanzado:</strong> las sobrecargas de <code>GetInfo</code> y el análisis de ambigüedad (está resuelto en el laboratorio de arriba).</li>
            </ul>`,
          hints: ['Para validar la presentación podés tener un arreglo con las letras válidas y usar <code>Contains</code>.', 'El mensaje de stock depende de dos condiciones: primero preguntá si está activo.', '<code>GetPackaging</code> queda muy legible con una expresión switch.', 'En <code>GetPricePerFraction(0)</code> evitá dividir por cero.'],
          solution: sol(`<p>Solución compilada y ejecutada con .NET 10 usando el <code>Main</code> del enunciado. Usa campos privados con métodos Get/Set porque así lo pide la consigna; en la lección de propiedades vas a ver la forma idiomática de C#. Para el precio del detalle se usa el precio final (con impuesto).</p>
            <p>Observá la salida de <code>GetFinalPrice()</code> después de <code>SetTax(0.105F)</code>: muestra <code>16575,000286102295</code> y no 16575. Es la imprecisión del <code>float</code>: 0,105 no se puede representar exacto en binario.</p>`, [
            ['Domain/Product.cs', 'cs', `namespace Dsw2026Ej6.Domain;

public class Product
{
    private static readonly char[] ValidPresentations = ['I', 'S', 'K', 'E', 'P'];

    private long _code;
    private string _description;
    private bool _active;
    private double _price;
    private float _tax = 0.21F;
    private int _stock;
    private char _presentation;
    private DateTime _date;
    private bool _internal;

    public Product(long code, string description, double price, char presentation)
    {
        _code = code;
        _description = description;
        _price = price;
        _presentation = ValidPresentations.Contains(presentation) ? presentation : 'I';
        _active = true;
        _internal = false;
        _date = DateTime.Now;
    }

    public long GetCode() => _code;
    public string GetDescription() => _description;
    public bool GetActive() => _active;
    public double GetPrice() => _price;
    public float GetTax() => _tax;
    public int GetStock() => _stock;
    public char GetPresentation() => _presentation;
    public DateTime GetDate() => _date;
    public bool GetInternal() => _internal;

    public void SetTax(float tax) => _tax = tax;
    public void SetInternal(bool value) => _internal = value;

    public void Deactivate() => _active = false;

    public double GetFinalPrice() => _price * (1 + _tax);

    public string GetDetailedInfo()
    {
        string stockMessage = !_active ? "No disponible" : _stock > 0 ? "Disponible" : "Sin stock";
        return $"[{_code}] {_description} [{_presentation}]: {GetFinalPrice():C} - {stockMessage}";
    }

    public void IncreaseStock() => _stock++;

    public void IncreaseStock(int quantity)
    {
        if (quantity > 0) _stock += quantity;
    }

    public void DecreaseStock()
    {
        if (_stock > 0) _stock--;
    }

    public double GetPricePerFraction(int fractions)
    {
        if (_presentation != 'K' || fractions <= 0) return 0;
        return GetFinalPrice() / fractions;
    }

    public string GetPackaging() => _presentation switch
    {
        'I' => "Envase Individual",
        'S' => "Empaque Secundario",
        'K' => "Pack",
        'E' => "Eco-friendly",
        'P' => "Premium",
        _ => "Desconocido"
    };

    public void Update(string description, double price = 0, float tax = 0.21F)
    {
        _description = description;
        if (price != 0) _price = price;
        if (tax != _tax) _tax = tax;
    }
}`],
            ['Salida (cultura es-AR)', 'text', `Presentation: I
16575,000286102295
[1001] Auriculares [I]: $ 16.575,00 - Sin stock
[1001] Auriculares [I]: $ 16.575,00 - Disponible
[1001] Auriculares [I]: $ 16.575,00 - Sin stock
[1001] Auriculares [I]: $ 16.575,00 - No disponible
2117,500066757202
0
Pack
[1002] Hamburguesa x 4 [K]: $ 8.470,00 - Sin stock
[1002] Hamburguesa x 4 [K]: $ 12.100,00 - Sin stock
[1002] Hamburguesa x 4 [K]: $ 11.050,00 - Sin stock
[1002] Hamburguesa x 4 [K]: $ 10.500,00 - Sin stock`],
          ]),
        },
        {
          official: 'N° 7 (problemas 1 y 2)',
          level: 2,
          title: 'SumarEnteros y CalcularArea con métodos anidados',
          prompt: `<p>El repositorio <code>dsw2026-ej07</code> trae pruebas unitarias que validan cada problema.</p>
            <p><strong>Problema 1:</strong> método público <code>SumarEnteros</code> que recibe dos enteros y devuelve su suma.</p>
            <p><strong>Problema 2:</strong> método público <code>CalcularArea</code> con tres parámetros: un número obligatorio, un número opcional y un <code>char</code> opcional con la figura (por defecto <code>'C'</code>: C círculo, T triángulo, R rectángulo). Devuelve dos valores: el nombre de la figura y el área. Si algún número es 0 o menor: área 0 y nombre "Error". Si la figura no se reconoce: área -1 y "Error". Usar punto flotante de 128 bits. El cálculo de cada área va en un método anidado.</p>`,
          hints: ['128 bits es <code>decimal</code>.', 'Dos valores de retorno: una tupla <code>(string, decimal)</code>.', '¿Qué valor por defecto conviene para el segundo número? Si fuera 0, un círculo de radio 2 caería en el caso de error.', 'Los nombres exactos que esperan las pruebas están en el proyecto de tests: revisalos.'],
          solution: sol(`<p>Verificado con .NET 10. El valor por defecto del segundo parámetro es 1 para que el círculo (que solo usa el radio) no dispare la validación de “0 o menor”. Las áreas se calculan en funciones locales que ven los parámetros de <code>CalcularArea</code>.</p>`, [
            ['Problema1.cs y Problema2.cs', 'cs', `public class Problema1 : ProblemaBase
{
    public int SumarEnteros(int a, int b) => a + b;
}

public class Problema2 : ProblemaBase
{
    public (string, decimal) CalcularArea(decimal valor1, decimal valor2 = 1, char figura = 'C')
    {
        if (valor1 <= 0 || valor2 <= 0) return ("Error", 0);

        return figura switch
        {
            'C' => ("Círculo", AreaCirculo()),
            'T' => ("Triángulo", AreaTriangulo()),
            'R' => ("Rectángulo", AreaRectangulo()),
            _ => ("Error", -1),
        };

        // Métodos anidados (funciones locales)
        decimal AreaCirculo() => (decimal)Math.PI * valor1 * valor1;
        decimal AreaTriangulo() => valor1 * valor2 / 2;
        decimal AreaRectangulo() => valor1 * valor2;
    }
}`],
            ['Salida de prueba', 'text', `CalcularArea(2)          -> (Círculo, 12,56637061435916)
CalcularArea(3, 4, 'T')  -> (Triángulo, 6)
CalcularArea(3, 4, 'R')  -> (Rectángulo, 12)
CalcularArea(0, 4, 'R')  -> (Error, 0)
CalcularArea(3, 4, 'X')  -> (Error, -1)`],
          ]),
        },
      ],
      quiz: [
        { q: '¿Qué distingue a dos sobrecargas de un método?', o: ['El tipo de retorno.', 'La cantidad o el tipo de sus parámetros.', 'El modificador de acceso.', 'El nombre de los parámetros.'], a: 1, e: 'El tipo de retorno no participa en la sobrecarga.' },
        { q: 'Con <code>void Update(string d, double price = 0, float tax = 0.21F)</code>, ¿cómo cambiás solo el impuesto?', o: ['<code>Update("x", , 0.05F)</code>', '<code>Update("x", tax: 0.05F)</code>', '<code>Update(tax: 0.05F)</code>', '<code>Update("x", 0.05F)</code>'], a: 1, e: 'El argumento con nombre permite saltear price; description es obligatorio.' },
        { q: '¿Cuándo una llamada a un método sobrecargado no compila por ambigüedad?', o: ['Cuando hay más de dos sobrecargas.', 'Cuando dos sobrecargas aceptan la llamada y ninguna es mejor que la otra.', 'Cuando un parámetro es opcional.', 'Nunca: el compilador elige la primera.'], a: 1, e: 'Es el error CS0121.' },
        { q: 'Una variable declarada dentro de un <code>if</code>…', o: ['…existe en todo el método.', '…existe solo dentro del bloque del if.', '…es un campo de la clase.', '…es global.'], a: 1, e: 'El ámbito de una local es el bloque donde se declara.' },
        { q: '¿Qué devuelve <code>var (a, b) = (1, "uno");</code>?', o: ['Un error.', 'Dos variables: a = 1 y b = "uno".', 'Un arreglo.', 'Una lista.'], a: 1, e: 'Es la deconstrucción de una tupla.' },
        { q: 'Una función local…', o: ['…es visible desde otras clases.', '…solo existe dentro del método que la declara y ve sus variables.', '…debe ser static.', '…no puede devolver valores.'], a: 1, e: 'Por eso es ideal para los “métodos anidados” del EJ07.' },
      ],
      sources: [
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(3), points: ['Declarar y llamar métodos; métodos de cuerpo de expresión.', 'Devolver varios valores con tuplas.', 'Ámbito: variables locales y campos.', 'Sobrecarga; parámetros opcionales y argumentos con nombre; ambigüedades.'] },
        { title: 'Funciones locales', url: 'https://learn.microsoft.com/es-es/dotnet/csharp/programming-guide/classes-and-structs/local-functions', points: ['Métodos privados anidados en otro miembro.', 'Pueden capturar las variables del método contenedor.'] },
      ],
    },

    {
      id: 'decisiones-iteracion',
      module: 'cs-base',
      title: 'Decisiones e iteraciones',
      keywords: 'if else switch expresion switch patrones bool operadores relacionales logicos cortocircuito && || ternario while for do foreach break continue asignacion compuesta bits brecha binaria ej07',
      tldr: 'Las decisiones (<code>if</code>, <code>switch</code>) eligen qué código ejecutar según una condición booleana; las iteraciones (<code>while</code>, <code>for</code>, <code>do</code>, <code>foreach</code>) repiten código mientras la condición sea verdadera.',
      goals: [
        'Escribir condiciones con operadores relacionales y lógicos, y entender el cortocircuito.',
        'Elegir entre if, switch y expresiones switch con patrones.',
        'Elegir el bucle adecuado y controlar su ejecución con break y continue.',
        'Resolver la brecha binaria del EJ07.',
      ],
      body: `
        <h2>Expresiones booleanas</h2>
        ${table(['Operador', 'Significado', 'Ejemplo'], [
          ['<code>== !=</code>', 'Igual, distinto', '<code>tipo == \'K\'</code>'],
          ['<code>&lt; &lt;= &gt; &gt;=</code>', 'Relacionales', '<code>carga &gt; 1200</code>'],
          ['<code>&amp;&amp;</code>', 'Y lógico', '<code>activo &amp;&amp; stock &gt; 0</code>'],
          ['<code>||</code>', 'O lógico', '<code>nota &lt; 0 || nota &gt; 10</code>'],
          ['<code>!</code>', 'Negación', '<code>!activo</code>'],
        ])}
        <p><code>&amp;&amp;</code> y <code>||</code> hacen <strong>cortocircuito</strong>: si el primer operando ya define el resultado, el segundo no se evalúa. Por eso <code>producto != null &amp;&amp; producto.Stock &gt; 0</code> nunca lanza <code>NullReferenceException</code>.</p>

        <h2>if y else</h2>
        ${code('cs', `string mensaje;
if (!activo)
    mensaje = "No disponible";
else if (stock > 0)
    mensaje = "Disponible";
else
    mensaje = "Sin stock";

// Operador ternario: una decisión que devuelve un valor
string mensaje2 = !activo ? "No disponible" : stock > 0 ? "Disponible" : "Sin stock";`)}

        <h2>switch</h2>
        ${code('cs', `// Instrucción switch: cada caso termina en break (o return)
switch (presentacion)
{
    case 'I': empaque = "Envase Individual"; break;
    case 'K': empaque = "Pack"; break;
    default:  empaque = "Desconocido"; break;
}

// Expresión switch (C# 8+): devuelve un valor, más compacta
string empaque2 = presentacion switch
{
    'I' => "Envase Individual",
    'S' => "Empaque Secundario",
    'K' => "Pack",
    _ => "Desconocido"           // _ es el caso por defecto
};

// Con patrones relacionales y lógicos
string calificacion = nota switch
{
    < 0 or > 10 => "Inválida",
    >= 6 => "Aprobado",
    _ => "Desaprobado"
};`)}

        <h2>Asignación compuesta</h2>
        <p><code>total += consumo;</code> equivale a <code>total = total + consumo;</code>. Existen <code>+= -= *= /= %=</code>, y también <code>??=</code> (asigna solo si es null).</p>

        <h2>Bucles</h2>
        ${table(['Bucle', 'Cuándo usarlo', 'Se ejecuta al menos una vez'], [
          ['<code>while (cond)</code>', 'No sabés cuántas vueltas: mientras se cumpla la condición', 'No'],
          ['<code>for (init; cond; paso)</code>', 'Sabés cuántas vueltas o recorrés por índice', 'No'],
          ['<code>do { } while (cond);</code>', 'Tiene que ejecutarse al menos una vez (un menú)', '<strong>Sí</strong>'],
          ['<code>foreach (var x in coleccion)</code>', 'Recorrer todos los elementos de una colección', 'No'],
        ])}
        ${code('cs', `for (int i = 0; i < vehiculos.Count; i++)
    Console.WriteLine($"{i + 1}. {vehiculos[i].Patente}");

string? opcion;
do
{
    Console.WriteLine("1. Listar  2. Agregar  3. Salir");
    opcion = Console.ReadLine();
} while (opcion != "3");

foreach (var v in vehiculos)
{
    if (v.Patente is null) continue;   // saltea esta vuelta
    if (v.Anio < 2000) break;          // termina el bucle
    Console.WriteLine(v.Patente);
}`)}
        ${lab(0)}

        <h2>Trabajar con bits: la brecha binaria</h2>
        <p>El problema 4 del EJ07 pide la secuencia más larga de ceros rodeada de unos en la representación binaria de un número. Dos herramientas útiles:</p>
        <ul>
          <li><code>n &amp; 1</code> devuelve el último bit (1 si es impar, 0 si es par).</li>
          <li><code>n &gt;&gt;= 1</code> desplaza los bits a la derecha (divide por 2): así recorrés el número bit a bit.</li>
          <li>Alternativa: <code>Convert.ToString(n, 2)</code> devuelve el binario como texto, por ejemplo <code>"1001"</code>.</li>
        </ul>
        <p>La trampa: los ceros del final no cuentan (32 = <code>100000</code> no tiene brecha) porque no están cerrados por un 1. Diseñá casos de prueba que lo detecten:</p>
        ${lab(1)}
      `,
      labs: [
        {
          type: 'predict',
          title: '¿Qué imprime? Bucles',
          code: `int suma = 0;
for (int i = 1; i <= 5; i++)
{
    if (i == 3) continue;
    suma += i;
}
Console.WriteLine(suma);

int n = 10;
do { n++; } while (n < 5);
Console.WriteLine(n);

int k = 0;
while (true)
{
    k += 2;
    if (k > 6) break;
}
Console.WriteLine(k);`,
          expected: '12\n11\n8',
          explain: '<p>El for suma 1 + 2 + 4 + 5 = 12 (saltea el 3). El do se ejecuta una vez aunque la condición sea falsa: n queda en 11. El while suma de a 2 hasta pasar 6: 2, 4, 6, 8 y corta.</p>',
        },
        {
          type: 'mutants',
          title: 'Pruebas para EncontrarBrechaMaxima',
          intro: 'Escribí casos (número y resultado esperado). Abajo hay versiones del método con errores típicos: buenos casos de prueba las detectan.',
          code: `public int EncontrarBrechaMaxima(int n)
{
    int maxima = 0, actual = 0;
    bool empezo = false;            // ya apareció el primer 1
    while (n > 0)
    {
        if ((n & 1) == 1)
        {
            if (empezo) maxima = Math.Max(maxima, actual);
            empezo = true;
            actual = 0;
        }
        else if (empezo) actual++;
        n >>= 1;
    }
    return maxima;
}`,
          params: [{ name: 'n', label: 'N', type: 'number', def: '' }],
          out: 'number',
          seed: [[9, 2]],
          fn: (n) => { let m = 0, a = 0, e = false; while (n > 0) { if (n & 1) { if (e) m = Math.max(m, a); e = true; a = 0; } else if (e) a++; n >>= 1; } return m; },
          mutants: [
            { desc: 'Cuenta los ceros del final como brecha (no espera el 1 de cierre)', fn: (n) => { const s = n.toString(2).replace(/^0+/, ''); return Math.max(0, ...s.split('1').map((x) => x.length)); } },
            { desc: 'Devuelve la última brecha en lugar de la más larga', fn: (n) => { const g = n.toString(2).replace(/0+$/, '').split('1').filter(Boolean); return g.length ? g[g.length - 1].length : 0; } },
            { desc: 'Devuelve la primera brecha en lugar de la más larga', fn: (n) => { const g = n.toString(2).replace(/0+$/, '').split('1').filter(Boolean); return g.length ? g[0].length : 0; } },
            { desc: 'Cuenta la cantidad total de ceros entre unos', fn: (n) => n.toString(2).replace(/0+$/, '').split('').filter((c) => c === '0').length },
            { desc: 'Error por uno: suma 1 a cada brecha', fn: (n) => { const g = n.toString(2).replace(/0+$/, '').split('1').filter(Boolean); return g.length ? Math.max(...g.map((x) => x.length)) + 1 : 0; } },
          ],
        },
      ],
      exercises: [
        {
          official: 'N° 7 (problema 4)',
          level: 2,
          title: 'Brecha binaria máxima',
          prompt: '<p>Crear un método público <code>EncontrarBrechaMaxima</code> que reciba un entero positivo N y devuelva la longitud de su brecha binaria más larga (la secuencia máxima de ceros rodeada por unos en ambos extremos). Debe devolver 0 si no hay brecha. Ejemplos: 9 (<code>1001</code>) da 2; 529 (<code>1000010001</code>) da 4; 20 (<code>10100</code>) da 1; 15 (<code>1111</code>) da 0; 32 (<code>100000</code>) da 0; 1041 (<code>10000010001</code>) da 5.</p>',
          hints: ['Recorré los bits de derecha a izquierda con <code>n &amp; 1</code> y <code>n &gt;&gt;= 1</code>.', 'Empezá a contar ceros recién después de ver el primer 1.', 'Cada vez que aparece un 1, compará el contador con el máximo y reinicialo.'],
          solution: sol('<p>Verificado con .NET 10 para todos los ejemplos del enunciado (9→2, 529→4, 20→1, 15→0, 32→0, 1041→5) y para casos límite como 1 (→0) e <code>int.MaxValue</code> (→0). La variable <code>empezo</code> evita contar los ceros del final; actualizar el máximo solo al encontrar un 1 garantiza que la brecha esté cerrada por ambos lados.</p>', [
            ['Problema4.cs', 'cs', `public class Problema4 : ProblemaBase
{
    public int EncontrarBrechaMaxima(int n)
    {
        int maxima = 0, actual = 0;
        bool empezo = false;            // ya apareció el primer 1
        while (n > 0)
        {
            if ((n & 1) == 1)           // el bit menos significativo es 1
            {
                if (empezo) maxima = Math.Max(maxima, actual);
                empezo = true;
                actual = 0;
            }
            else if (empezo)
            {
                actual++;
            }
            n >>= 1;                    // siguiente bit
        }
        return maxima;
    }
}`],
            ['Alternativa con texto', 'cs', `public int EncontrarBrechaMaxima(int n)
{
    string binario = Convert.ToString(n, 2).TrimEnd('0');   // los ceros del final no cuentan
    return binario.Split('1').Max(s => s.Length);
}`],
          ]),
        },
      ],
      quiz: [
        { q: 'Con <code>producto = null</code>, ¿qué pasa al evaluar <code>producto != null &amp;&amp; producto.Stock &gt; 0</code>?', o: ['Lanza NullReferenceException.', 'Da false sin evaluar la segunda parte.', 'Da true.', 'No compila.'], a: 1, e: 'Cortocircuito: como la primera parte es false, la segunda no se evalúa.' },
        { q: '¿Qué bucle se ejecuta al menos una vez aunque la condición sea falsa desde el inicio?', o: ['while', 'for', 'do...while', 'foreach'], a: 2, e: 'do evalúa la condición al final.' },
        { q: '¿Qué hace <code>continue</code> dentro de un for?', o: ['Termina el bucle.', 'Pasa a la siguiente iteración salteando el resto de la actual.', 'Reinicia el bucle desde 0.', 'Sale del método.'], a: 1, e: 'break termina; continue saltea.' },
        { q: 'En una expresión switch, ¿qué significa <code>_ =&gt; "Desconocido"</code>?', o: ['Es un error.', 'Es el caso por defecto (descarte).', 'Coincide solo con el guion bajo.', 'Devuelve null.'], a: 1, e: '_ coincide con cualquier valor no cubierto antes.' },
        { q: '¿Cuánto vale <code>13 &amp; 1</code>?', o: ['0', '1', '13', '6'], a: 1, e: '13 es 1101 en binario: el último bit es 1 (es impar).' },
        { q: 'La brecha binaria de 32 (<code>100000</code>) es…', o: ['5', '0', '1', '6'], a: 1, e: 'Los ceros no están cerrados por un 1 a la derecha.' },
      ],
      sources: [
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(4), points: ['Variables booleanas y operadores relacionales y lógicos; cortocircuito.', 'if, switch y expresiones switch.'] },
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(5), points: ['Operadores de asignación compuesta.', 'while, for y do; break y continue.'] },
        { title: 'Coincidencia de patrones', url: 'https://learn.microsoft.com/es-es/dotnet/csharp/fundamentals/functional/pattern-matching', points: ['Patrones de constante, relacionales y lógicos (and, or, not).', 'Expresiones switch.'] },
      ],
    },

    {
      id: 'excepciones',
      module: 'cs-base',
      title: 'Errores y excepciones',
      keywords: 'excepciones try catch finally throw jerarquia exception filtros when propagar pila personalizadas formatexception overflowexception dividebyzero nullreference using ej07 boom granadas',
      tldr: 'Una <mark>excepción</mark> interrumpe el flujo normal cuando algo sale mal. Con <code>try</code>/<code>catch</code> la atrapás y decidís qué hacer; con <code>finally</code> ejecutás código que debe correr siempre; con <code>throw</code> la lanzás vos.',
      goals: [
        'Atrapar excepciones con varios catch ordenados del más específico al más general.',
        'Entender cómo se propaga una excepción por la pila de llamadas.',
        'Lanzar excepciones propias y usar finally.',
        'Resolver el problema de las granadas del EJ07.',
      ],
      body: `
        <h2>try y catch</h2>
        ${code('cs', `try
{
    int km = int.Parse(Console.ReadLine()!);
    Console.WriteLine(100 / km);
}
catch (FormatException)
{
    Console.WriteLine("Eso no es un número");
}
catch (DivideByZeroException)
{
    Console.WriteLine("Los kilómetros no pueden ser 0");
}
catch (Exception ex)                  // cualquier otra
{
    Console.WriteLine($"Error inesperado: {ex.Message}");
}`)}
        <p>Cuando una instrucción del <code>try</code> lanza una excepción, el resto del bloque no se ejecuta: el CLR busca el primer <code>catch</code> cuyo tipo coincida (o sea un tipo base). Por eso el orden importa: <strong>del más específico al más general</strong>. Poner <code>catch (Exception)</code> primero ni siquiera compila si hay otros después (CS0160).</p>
        <h3>La jerarquía</h3>
        ${fig(`<svg viewBox="0 0 620 200" width="620" role="img" aria-label="Jerarquía de excepciones">
          <g font-size="12">
          <rect class="box-a" x="250" y="10" width="120" height="30" rx="6"/><text x="310" y="30" text-anchor="middle">Exception</text>
          <rect class="box" x="60" y="80" width="170" height="30" rx="6"/><text x="145" y="100" text-anchor="middle">SystemException</text>
          <rect class="box" x="390" y="80" width="190" height="30" rx="6"/><text x="485" y="100" text-anchor="middle">Tus excepciones (InvalidAmount…)</text>
          <rect class="box" x="0" y="150" width="140" height="30" rx="6"/><text x="70" y="170" text-anchor="middle">FormatException</text>
          <rect class="box" x="150" y="150" width="150" height="30" rx="6"/><text x="225" y="170" text-anchor="middle">ArithmeticException</text>
          <rect class="box" x="310" y="150" width="170" height="30" rx="6"/><text x="395" y="170" text-anchor="middle">NullReferenceException</text>
          <rect class="box" x="490" y="150" width="130" height="30" rx="6"/><text x="555" y="170" text-anchor="middle">ArgumentException</text>
          <path class="stroke" d="M145 80 V60 H485 V80 M310 60 V40 M70 150 V130 H555 V150 M225 130 V150 M395 130 V150 M145 130 V110" stroke-width="1.3"/>
          </g></svg>`, 'DivideByZeroException y OverflowException derivan de ArithmeticException. Un catch (ArithmeticException) atrapa a las dos.')}
        <h3>Filtros</h3>
        <p>Un <code>catch</code> puede tener una condición: <code>catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)</code>. Si la condición es falsa, se sigue buscando otro catch.</p>

        <h2>Propagación</h2>
        <p>Si un método no atrapa una excepción, esta “sube” al método que lo llamó, y así sucesivamente por la <strong>pila de llamadas</strong>. Si nadie la atrapa, el programa termina y muestra el error. Esto permite manejar el error en el nivel que sabe qué hacer con él (por ejemplo, la interfaz muestra un mensaje; el dominio solo lanza).</p>
        ${lab(0)}

        <h2>Lanzar excepciones: throw</h2>
        ${code('cs', `public void Withdraw(decimal amount)
{
    if (amount <= 0)
        throw new InvalidAmount();          // excepción propia
    if (amount > Balance)
        throw new InvalidOperationException("Saldo insuficiente");
    Balance -= amount;
}

// Una excepción propia: hereda de Exception y define su mensaje
public class InvalidAmount : Exception
{
    public InvalidAmount() : base("El monto ingresado no es válido para la operación solicitada") { }
}`)}
        <p>Para relanzar una excepción atrapada sin perder dónde se originó, usá <code>throw;</code> a secas, no <code>throw ex;</code> (que reinicia la traza de la pila).</p>

        <h2>finally</h2>
        <p>El bloque <code>finally</code> se ejecuta <strong>siempre</strong>: si no hubo excepción, si se atrapó, e incluso si no se atrapó. Se usa para liberar recursos (cerrar un archivo, una conexión).</p>
        ${code('cs', `StreamReader? lector = null;
try
{
    lector = new StreamReader("vehiculos.json");
    Procesar(lector.ReadToEnd());
}
finally
{
    lector?.Dispose();     // se cierra pase lo que pase
}

// Equivalente moderno: using libera el recurso al salir del bloque
using var lector2 = new StreamReader("vehiculos.json");`)}
        ${note('No uses excepciones para el flujo normal del programa: son costosas. Si podés verificar antes (con <code>TryParse</code>, con un <code>if</code>), hacelo. Y nunca escribas un <code>catch { }</code> vacío: esconde errores.', 'warn')}
      `,
      labs: [
        {
          type: 'trace',
          title: 'Por dónde pasa la ejecución',
          intro: 'Elegí qué ingresa el usuario y mirá qué líneas se ejecutan (resaltadas) y qué sale por consola.',
          code: `static void Main()
{
    try
    {
        Console.WriteLine("Inicio");
        int r = Dividir(Console.ReadLine());
        Console.WriteLine($"Resultado: {r}");
    }
    catch (FormatException)
    {
        Console.WriteLine("No es un número");
    }
    catch (ArithmeticException ex)
    {
        Console.WriteLine($"Error aritmético: {ex.GetType().Name}");
    }
    finally
    {
        Console.WriteLine("Fin");
    }
}

static int Dividir(string? texto)
{
    int divisor = int.Parse(texto!);
    return 100 / divisor;
}`,
          scenarios: [
            { label: 'El usuario escribe 4', lines: [1, 2, 3, 4, 5, 6, 7, 8, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27], output: 'Inicio\nResultado: 25\nFin', note: 'Sin excepciones: se saltean los catch y finally se ejecuta igual.' },
            { label: 'El usuario escribe "cuatro"', lines: [1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 17, 18, 19, 20, 21, 23, 24, 25], output: 'Inicio\nNo es un número\nFin', note: 'int.Parse lanza FormatException dentro de Dividir. Dividir no la atrapa: se propaga a Main, donde la atrapa el primer catch. La línea 7 nunca se ejecuta.' },
            { label: 'El usuario escribe 0', lines: [1, 2, 3, 4, 5, 6, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26], output: 'Inicio\nError aritmético: DivideByZeroException\nFin', note: 'DivideByZeroException no es FormatException, pero deriva de ArithmeticException: la atrapa el segundo catch.' },
          ],
        },
      ],
      exercises: [
        {
          official: 'N° 7 (problema 3)',
          level: 2,
          title: 'Boom: las granadas del bot',
          prompt: `<p>Programar un método público <code>Boom</code> que reciba una <code>Bomb</code> y devuelva un string. La granada se explota con el método que ofrece <code>Bomb</code>; al explotar lanza una excepción propia de su tipo (<code>FlashException</code>, <code>SmokeException</code> o <code>HandException</code>), cada una con su mensaje. Devolver <code>{tipoGranada}-{mensajeDeExplosion}</code>. Una granada puede no explotar: en ese caso devolver <code>null</code> (el README del repositorio dice cadena vacía: revisá qué esperan las pruebas). Los tipos están en la librería del repositorio.</p>`,
          hints: ['El método para explotar se llama <code>Explode()</code>.', 'Probá qué contiene <code>ex.Message</code>: no es el mensaje que buscás. Cada excepción tiene su propia propiedad (<code>FlashMessage</code>, <code>SmokeMessage</code>, <code>HandMessage</code>).', 'Como cada excepción tiene una propiedad distinta, necesitás un catch por tipo.', '<code>bomb.GetType().Name</code> devuelve "Flash", "Smoke" o "Hand".'],
          solution: sol(`<p>Verificado contra la librería del repositorio con .NET 10. El detalle clave: <code>ex.Message</code> trae el texto genérico “Exception of type … was thrown”; el mensaje específico está en una propiedad distinta para cada excepción, así que hacen falta tres <code>catch</code>.</p>`, [
            ['Problema3.cs', 'cs', `using Dsw.Ut2.Library.Data;

public class Problema3 : ProblemaBase
{
    public string? Boom(Bomb bomb)
    {
        try
        {
            bomb.Explode();
            return null;    // no explotó
        }
        catch (FlashException ex)
        {
            return $"{bomb.GetType().Name}-{ex.FlashMessage}";
        }
        catch (SmokeException ex)
        {
            return $"{bomb.GetType().Name}-{ex.SmokeMessage}";
        }
        catch (HandException ex)
        {
            return $"{bomb.GetType().Name}-{ex.HandMessage}";
        }
    }
}`],
            ['Salida real', 'text', `Flash-YouReBlind
Smoke-YouReHidden
Hand-YouReInFire
null`],
          ]),
        },
      ],
      quiz: [
        { q: '¿En qué orden deben ir los bloques catch?', o: ['Del más general al más específico.', 'Del más específico al más general.', 'No importa.', 'Alfabético.'], a: 1, e: 'Se elige el primero que coincide; uno general primero taparía a los demás.' },
        { q: '¿Cuándo se ejecuta el bloque <code>finally</code>?', o: ['Solo si hubo una excepción.', 'Solo si no hubo excepción.', 'Siempre.', 'Solo si hay un catch.'], a: 2, e: 'Por eso se usa para liberar recursos.' },
        { q: 'Un método lanza una excepción y no la atrapa. ¿Qué pasa?', o: ['Se ignora.', 'Se propaga al método que lo llamó.', 'El programa sigue en la línea siguiente.', 'Se convierte en null.'], a: 1, e: 'Sube por la pila de llamadas hasta que alguien la atrape.' },
        { q: '<code>catch (ArithmeticException)</code> atrapa una <code>DivideByZeroException</code>?', o: ['Sí, porque DivideByZeroException deriva de ArithmeticException.', 'No, los tipos deben ser idénticos.', 'Solo con un filtro when.', 'Solo en modo checked.'], a: 0, e: 'Un catch atrapa el tipo indicado y todos sus derivados.' },
        { q: '¿Cuál es la forma correcta de relanzar la excepción atrapada sin perder la traza original?', o: ['<code>throw ex;</code>', '<code>throw;</code>', '<code>throw new Exception(ex.Message);</code>', '<code>return ex;</code>'], a: 1, e: 'throw ex reinicia la traza de la pila.' },
        { q: 'En el EJ07, ¿por qué no alcanza con un único <code>catch (Exception ex)</code> que devuelva <code>ex.Message</code>?', o: ['Porque no compila.', 'Porque el mensaje específico está en una propiedad distinta de cada tipo de excepción.', 'Porque las granadas no lanzan excepciones.', 'Porque Exception no tiene Message.'], a: 1, e: 'Message es genérico; hay que leer FlashMessage, SmokeMessage o HandMessage.' },
      ],
      sources: [
        { title: 'Microsoft Visual C# Step by Step', ref: VCS(6), points: ['try/catch, varios manejadores, jerarquía de excepciones.', 'Propagar excepciones; checked y unchecked.', 'Lanzar excepciones; el bloque finally.'] },
        { title: 'Procedimientos recomendados para excepciones', url: 'https://learn.microsoft.com/es-es/dotnet/standard/exceptions/best-practices-for-exceptions', points: ['Usar try/catch/finally para recuperarse y liberar recursos.', 'Evitar excepciones para el flujo normal: comprobar antes cuando se pueda.', 'Relanzar con throw; para conservar la traza.'] },
      ],
    },
  );
})();
