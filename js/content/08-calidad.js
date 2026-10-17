/* Módulo: Logs, pruebas y código limpio (Unidad 3, clases 26 a 28) */
(() => {
  const { code, table, note, lab, fig, sol, flow, def } = window.GUIDE.h;
  const PRESS = 'Pressman, <em>Ingeniería del Software: un enfoque práctico</em>, 7ª ed., cap. 18';

  window.GUIDE.LESSONS.push(
    {
      id: 'logging',
      module: 'qa',
      title: 'Log de aplicaciones',
      keywords: 'logging log registro ilogger niveles trace debug information warning error critical none categoria proveedores console debug eventsource eventlog appsettings registro estructurado plantillas de mensaje scopes loggermessage serilog',
      tldr: 'Un <mark>log</mark> registra lo que hace la aplicación para supervisarla y diagnosticar problemas. En .NET se escribe con <code>ILogger&lt;T&gt;</code>, con un <mark>nivel</mark> por mensaje, y la configuración decide qué niveles se guardan y en qué <mark>proveedores</mark>.',
      goals: [
        'Escribir logs con ILogger<T> eligiendo el nivel adecuado.',
        'Configurar niveles mínimos por categoría en appsettings.json.',
        'Usar registro estructurado con plantillas de mensaje.',
        'Conocer los proveedores integrados.',
      ],
      body: `
        <h2>ILogger</h2>
        <p>.NET admite registro estructurado de alto rendimiento a través de la API <code>ILogger</code>. Se pide por inyección de dependencias; el parámetro de tipo define la <strong>categoría</strong> (el nombre completo de la clase), que permite filtrar después.</p>
        ${code('cs', `public class DoctorService(IPersistence persistence, ILogger<DoctorService> logger)
{
    public Doctor CreateDoctor(string? name, string? licenseNumber, Guid specialityId)
    {
        logger.LogDebug("Creando médico con matrícula {LicenseNumber}", licenseNumber);
        var speciality = persistence.GetSpeciality(specialityId);
        if (speciality is null)
        {
            logger.LogWarning("Especialidad inexistente {SpecialityId}", specialityId);
            throw new ValidationException("La especialidad indicada no existe.");
        }
        // …
        logger.LogInformation("Médico {DoctorId} creado en {Speciality}", doctor.Id, speciality.Name);
        return doctor;
    }
}`)}

        <h2>Niveles</h2>
        ${table(['Nivel', 'Valor', 'Para…', 'Ejemplo'], [
          ['<code>Trace</code>', '0', 'El máximo detalle; puede incluir datos sensibles. Nunca en producción', 'Entrada y salida de cada método'],
          ['<code>Debug</code>', '1', 'Información útil al desarrollar', 'Valores intermedios'],
          ['<code>Information</code>', '2', 'El flujo normal de la aplicación', 'Médico creado; pedido atendido'],
          ['<code>Warning</code>', '3', 'Algo anormal o inesperado que no detiene la app', 'Especialidad inexistente; reintento'],
          ['<code>Error</code>', '4', 'Una operación falló', 'Excepción no controlada en un request'],
          ['<code>Critical</code>', '5', 'Fallas que requieren atención inmediata', 'Sin base de datos; disco lleno'],
          ['<code>None</code>', '6', 'Solo para configuración: no registrar nada', '—'],
        ])}

        <h2>Configuración por categoría</h2>
        <p>Se escribe un mensaje si su nivel es <strong>mayor o igual</strong> al mínimo configurado para la categoría <strong>más específica</strong> que coincida con su nombre.</p>
        ${lab(0)}

        <h2>Registro estructurado</h2>
        <p>Usá <strong>plantillas de mensaje</strong>, no interpolación:</p>
        ${code('cs', `// Bien: plantilla. DoctorId y Speciality quedan como propiedades buscables
logger.LogInformation("Médico {DoctorId} creado en {Speciality}", doctor.Id, speciality.Name);

// Mal: interpolación. Se pierde la estructura y el texto se arma aunque el nivel esté deshabilitado
logger.LogInformation($"Médico {doctor.Id} creado en {speciality.Name}");`)}
        <p>Con proveedores que entienden la estructura (Application Insights, Seq, Elasticsearch, Serilog), después podés buscar “todos los logs con <code>SpecialityId = …</code>”. Las excepciones se pasan como primer argumento: <code>logger.LogError(ex, "Error procesando {Path}", path)</code>.</p>
        <p>Los <strong>scopes</strong> agregan datos a todos los logs de un bloque: <code>using (logger.BeginScope("Pedido {OrderId}", id)) { … }</code>. Para rutas muy calientes existe el generador de código <code>[LoggerMessage]</code>, que evita costos de formateo.</p>

        <h2>Proveedores</h2>
        <p>Un proveedor decide <strong>dónde</strong> se escribe. ASP.NET Core incluye en el framework compartido:</p>
        ${table(['Proveedor', 'Escribe en'], [
          ['Console', 'La consola (lo que ves al hacer dotnet run)'],
          ['Debug', 'La ventana de salida del depurador'],
          ['EventSource', 'Eventos que se recolectan con dotnet-trace y herramientas de diagnóstico'],
          ['EventLog', 'El registro de eventos de Windows (solo Windows)'],
        ])}
        <p>Para escribir en archivos o en servicios externos se usan proveedores de terceros como Serilog o NLog, o Application Insights en Azure.</p>
        ${note('Nunca registres contraseñas, tokens ni datos personales sensibles. Los logs suelen tener menos protección que la base de datos.', 'warn')}
      `,
      labs: [
        {
          type: 'loglevels',
          title: 'Qué se registra con cada configuración',
          intro: 'Cambiá los niveles mínimos y mirá qué mensajes de la API salen por consola.',
        },
      ],
      exercises: [
        {
          level: 1,
          title: 'Agregar logs a la API del EJ15',
          prompt: '<p>Agregá logging al <code>DoctorService</code> y al middleware de excepciones del EJ15: Information al crear o dar de baja un médico, Warning en cada validación fallida y Error (con la excepción) en el middleware para los errores no controlados. Configurá <code>appsettings.Development.json</code> para ver Debug de tus clases pero solo Warning de Microsoft.AspNetCore.</p>',
          hints: ['Pedí <code>ILogger&lt;DoctorService&gt;</code> por constructor: el contenedor ya lo tiene registrado.', 'Usá plantillas con nombres de propiedad, no interpolación.', 'La categoría de tus clases empieza con <code>Dsw2026Ej15</code>.'],
          solution: sol('<p>La categoría de cada logger es el nombre completo de su clase, así que una regla para <code>Dsw2026Ej15</code> cubre todo tu código.</p>', [
            ['appsettings.Development.json', 'json', `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Dsw2026Ej15": "Debug"
    }
  }
}`],
            ['DoctorService.cs (fragmento)', 'cs', `public class DoctorService(IPersistence persistence, ILogger<DoctorService> logger)
{
    public bool DeactivateDoctor(Guid id)
    {
        var doctor = GetActiveDoctor(id);
        if (doctor is null)
        {
            logger.LogWarning("Baja de médico inexistente o inactivo {DoctorId}", id);
            return false;
        }
        doctor.Deactivate();
        persistence.UpdateDoctor(doctor);
        logger.LogInformation("Médico {DoctorId} dado de baja", id);
        return true;
    }
}`],
          ]),
        },
      ],
      quiz: [
        { q: '¿Qué nivel corresponde a “un médico fue creado correctamente”?', o: ['Trace', 'Information', 'Error', 'Critical'], a: 1, e: 'Es el flujo normal de la aplicación.' },
        { q: 'Con <code>"Default": "Warning"</code>, ¿se escribe un <code>LogInformation</code>?', o: ['Sí', 'No, porque Information es menor que Warning', 'Solo en Development', 'Solo en la consola'], a: 1, e: 'Se escribe si el nivel es mayor o igual al mínimo.' },
        { q: '¿Por qué conviene una plantilla de mensaje y no interpolación?', o: ['Es más corta.', 'Conserva las propiedades estructuradas y evita formatear si el nivel está deshabilitado.', 'La interpolación no compila.', 'Las plantillas se cifran.'], a: 1, e: 'Registro estructurado.' },
        { q: '¿Qué define la categoría de un <code>ILogger&lt;DoctorService&gt;</code>?', o: ['El nivel.', 'El nombre completo de la clase DoctorService.', 'El proveedor.', 'El entorno.'], a: 1, e: 'Permite configurar niveles por namespace.' },
        { q: '¿Qué proveedor integrado escribe en el registro de eventos de Windows?', o: ['Console', 'Debug', 'EventLog', 'EventSource'], a: 2, e: 'Solo disponible en Windows.' },
      ],
      sources: [
        { title: 'Registro en .NET y ASP.NET Core', url: 'https://learn.microsoft.com/es-es/aspnet/core/fundamentals/logging/', points: ['ILogger y categorías; niveles de registro.', 'Configuración por categoría en appsettings; reglas de filtrado.', 'Plantillas de mensaje y registro estructurado; scopes.', 'Proveedores integrados: Console, Debug, EventSource, EventLog.'] },
      ],
    },

    {
      id: 'pruebas-teoria',
      module: 'qa',
      title: 'Verificación, validación y diseño de casos de prueba',
      keywords: 'pruebas verificacion validacion inspecciones revisiones estatica dinamica niveles unidad integracion sistema aceptacion comprobabilidad caja blanca caja negra ruta basica complejidad ciclomatica v(g) particion de equivalencia valores limite pressman',
      tldr: 'Probar es ejecutar el software con la intención de <mark>encontrar errores</mark>. Pressman propone dos miradas: <mark>caja blanca</mark> (conociendo el código: rutas, condiciones, bucles) y <mark>caja negra</mark> (solo entradas y salidas: particiones de equivalencia y valores límite).',
      goals: [
        'Distinguir verificación de validación, y V&V estática de dinámica.',
        'Ubicar las pruebas de unidad entre los niveles de prueba.',
        'Calcular la complejidad ciclomática y derivar rutas básicas.',
        'Diseñar casos con partición de equivalencia y análisis de valores límite.',
      ],
      body: `
        <h2>Verificación y validación</h2>
        ${table(['', 'Pregunta (Boehm)'], [
          ['<strong>Verificación</strong>', '¿Construimos el producto correctamente? (cumple su especificación)'],
          ['<strong>Validación</strong>', '¿Construimos el producto correcto? (hace lo que el usuario necesita)'],
        ])}
        <p>Dos actividades complementarias:</p>
        <ul>
          <li><strong>Inspecciones o revisiones (V&V estática):</strong> analizan documentos de requisitos, diseño y código fuente <em>sin ejecutarlos</em>. Una revisión de código en un pull request es V&V estática.</li>
          <li><strong>Pruebas (V&V dinámica):</strong> ejecutan el software con datos de prueba y comparan las salidas con lo esperado.</li>
        </ul>
        <h3>Niveles de granularidad</h3>
        ${table(['Nivel', 'Qué se prueba'], [
          ['<strong>Unidad</strong>', 'Componentes individuales: métodos, clases u objetos, llamados con distintos parámetros. Se consideran adjuntas a la codificación'],
          ['Integración / componentes', 'Varias unidades juntas y sus interfaces (por ejemplo, la API con una base real)'],
          ['Sistema', 'El sistema completo contra sus requisitos'],
          ['Aceptación', 'El cliente valida que el sistema le sirve'],
        ])}
        <p>Para probar una clase a nivel de unidad hay que probar todas sus operaciones, establecer y verificar el valor de todos sus atributos, y llevar al objeto por todos sus estados posibles (simular los eventos que los cambian).</p>

        <h2>Fundamentos (Pressman)</h2>
        <p>La meta de probar es encontrar errores: una buena prueba tiene alta probabilidad de encontrar uno. James Bach describe las características que hacen a un software <strong>comprobable</strong>:</p>
        ${table(['Característica', 'Idea'], [
          ['Operatividad', 'Mientras mejor funcione, más eficientemente se prueba'],
          ['Observabilidad', 'Lo que ves es lo que pruebas: estados y salidas visibles'],
          ['Controlabilidad', 'Mientras mejor puedas controlarlo, más se puede automatizar'],
          ['Descomponibilidad', 'Módulos independientes se prueban por separado'],
          ['Simplicidad', 'Menos que probar, más rápido se prueba'],
          ['Estabilidad', 'Menos cambios, menos perturbaciones para las pruebas'],
          ['Comprensibilidad', 'Más información, pruebas más inteligentes'],
        ])}
        <p>Fijate que la inversión de dependencias mejora la controlabilidad y la descomponibilidad: con una interfaz podés reemplazar la base por un doble de prueba.</p>
        <p>Una buena prueba no es redundante, es “la mejor de su camada” (la que más probabilidad tiene de encontrar una clase de errores) y no es ni demasiado simple ni demasiado compleja.</p>

        <h2>Caja blanca: prueba de ruta básica</h2>
        <p>La prueba de caja blanca usa la estructura de control del código para derivar casos que garanticen: recorrer todas las rutas independientes al menos una vez, cada decisión en sus lados verdadero y falso, los bucles en sus fronteras y las estructuras de datos internas.</p>
        <p>El método de <strong>ruta básica</strong> (McCabe) dibuja el <strong>gráfico de flujo</strong> (nodos = instrucciones, aristas = flujo de control) y calcula la <strong>complejidad ciclomática</strong>, que es la cantidad de rutas independientes del conjunto básico y, por lo tanto, una cota superior de las pruebas necesarias para ejecutar cada instrucción al menos una vez:</p>
        ${table(['Forma', 'Fórmula'], [
          ['Regiones', 'V(G) = cantidad de regiones del gráfico (contando el área exterior)'],
          ['Aristas y nodos', 'V(G) = E − N + 2'],
          ['Nodos predicado', 'V(G) = P + 1 (P = nodos con una condición)'],
        ])}
        ${lab(0)}
        ${code('cs', `public double CalcularConsumo(double kilometros)          // VehiculoElectrico
{
    double total = kilometros / 100 * KwhBase;            // 1
    if (CapacidadCarga > 1200)                            // 2: nodo predicado
        total *= 1.15;                                    // 3
    return total;                                         // 4
}
// Aristas: 1→2, 2→3, 2→4, 3→4  →  E = 4, N = 4  →  V(G) = 4 − 4 + 2 = 2
// También: P = 1  →  V(G) = 1 + 1 = 2. Rutas básicas: 1-2-4 y 1-2-3-4`)}

        <h2>Caja negra</h2>
        <p>Las pruebas de caja negra se enfocan en los requisitos funcionales: entradas y salidas, sin mirar el código. Descubren funciones incorrectas o faltantes, errores de interfaz, de estructuras de datos, de rendimiento y de inicialización.</p>
        <h3>Partición de equivalencia</h3>
        <p>Divide el dominio de entrada en <strong>clases</strong> de datos que el programa debería tratar igual: con un caso por clase alcanza. Las reglas de Pressman:</p>
        <ul>
          <li>Si la entrada es un <strong>rango</strong>, se definen una clase válida y dos inválidas (por debajo y por encima).</li>
          <li>Si es un <strong>valor específico</strong>, una válida y dos inválidas.</li>
          <li>Si es un <strong>miembro de un conjunto</strong>, una válida y una inválida.</li>
          <li>Si es <strong>booleana</strong>, una válida y una inválida.</li>
        </ul>
        <h3>Análisis de valores límite</h3>
        <p>Los errores se concentran en las fronteras (“los errores se esconden en las esquinas”, Beizer). Si una entrada es un rango entre a y b, se prueban <strong>a y b</strong> y los valores <strong>justo por encima y por debajo</strong>. Para la carga del vehículo eléctrico: 1200 (no tiene recargo) y 1201 (sí tiene).</p>
        <p>Diseñá casos para el consumo eléctrico y comprobá cuántos errores típicos detectan:</p>
        ${lab(1)}
        <p>Pressman agrega técnicas como la prueba basada en gráficos, la de arreglo ortogonal (para muchas combinaciones de parámetros) y la basada en modelos (a partir de diagramas de estados).</p>
      `,
      labs: [
        {
          type: 'calc',
          title: 'Complejidad ciclomática',
          intro: 'Contá nodos, aristas y nodos predicado de un gráfico de flujo. Para el procedimiento <em>average</em> de Pressman: 13 nodos, 17 aristas, 5 predicados.',
          fields: [
            { id: 'n', label: 'Nodos (N)', value: 13 },
            { id: 'e', label: 'Aristas (E)', value: 17 },
            { id: 'p', label: 'Nodos predicado (P)', value: 5 },
          ],
          run: (v) => {
            const a = v.e - v.n + 2, b = v.p + 1;
            return `V(G) = E − N + 2 = ${v.e} − ${v.n} + 2 = <strong>${a}</strong>\nV(G) = P + 1 = ${v.p} + 1 = <strong>${b}</strong>\n${a === b ? `Coinciden: hay ${a} rutas independientes; hacen falta como máximo ${a} casos para ejecutar cada instrucción al menos una vez.` : 'No coinciden: revisá el conteo (en un gráfico bien formado, las dos fórmulas dan lo mismo).'}`;
          },
        },
        {
          type: 'mutants',
          title: 'Casos de prueba para el consumo eléctrico',
          intro: 'Fórmula: 16 kWh cada 100 km; si la carga supera los 1200 kg, +15 %. Cargá casos (km, carga y consumo esperado). Los mutantes son errores reales del EJ01.',
          code: `public double CalcularConsumo(double kilometros)
{
    double total = kilometros / 100 * KwhBase;   // KwhBase = 16
    if (CapacidadCarga > 1200)
        total *= 1.15;
    return total;
}`,
          params: [{ name: 'km', label: 'Km', type: 'number', def: '' }, { name: 'carga', label: 'Carga (kg)', type: 'number', def: '' }],
          out: 'number',
          seed: [[100, 1000, 16]],
          fn: (km, c) => (km / 100) * 16 * (c > 1200 ? 1.15 : 1),
          mutants: [
            { desc: 'Usa >= 1200 en lugar de > 1200', fn: (km, c) => (km / 100) * 16 * (c >= 1200 ? 1.15 : 1) },
            { desc: 'Suma 0,15 en lugar de multiplicar por 1,15', fn: (km, c) => (km / 100) * 16 + (c > 1200 ? 0.15 : 0) },
            { desc: 'Ignora los kilómetros (siempre 16)', fn: (km, c) => 16 * (c > 1200 ? 1.15 : 1) },
            { desc: 'Nunca aplica el recargo', fn: (km) => (km / 100) * 16 },
            { desc: 'Divide por 1000 en lugar de 100', fn: (km, c) => (km / 1000) * 16 * (c > 1200 ? 1.15 : 1) },
          ],
        },
      ],
      quiz: [
        { q: '“¿Construimos el producto correcto?” es la pregunta de la…', o: ['…verificación.', '…validación.', '…inspección.', '…integración.'], a: 1, e: 'Verificación: ¿lo construimos correctamente?' },
        { q: 'Revisar el código de un compañero en un pull request es…', o: ['V&V dinámica.', 'V&V estática (inspección).', 'Prueba de sistema.', 'Prueba de aceptación.'], a: 1, e: 'No se ejecuta el software.' },
        { q: 'Un gráfico de flujo tiene 11 aristas y 9 nodos. ¿Cuánto vale V(G)?', o: ['2', '4', '20', '11'], a: 1, e: 'V(G) = 11 − 9 + 2 = 4.' },
        { q: '¿Qué indica la complejidad ciclomática?', o: ['La cantidad de líneas.', 'Una cota superior de las pruebas necesarias para ejecutar cada instrucción al menos una vez.', 'El tiempo de ejecución.', 'La cantidad de errores.'], a: 1, e: 'Es la cantidad de rutas independientes del conjunto básico.' },
        { q: 'Una nota válida está entre 0 y 10. Según la partición de equivalencia, ¿cuántas clases hay?', o: ['Una válida y una inválida.', 'Una válida y dos inválidas (menor a 0 y mayor a 10).', 'Once.', 'Dos válidas.'], a: 1, e: 'Regla del rango.' },
        { q: 'Para “si la carga supera los 1200 kg”, ¿qué valores elige el análisis de valores límite?', o: ['0 y 5000', '1200 y 1201 (y 1199)', 'Solo 1300', 'Valores al azar'], a: 1, e: 'Los errores se concentran en la frontera.' },
        { q: 'Las pruebas de caja negra…', o: ['…requieren conocer el código.', '…se basan en las entradas y salidas según los requisitos.', '…solo sirven para bucles.', '…son estáticas.'], a: 1, e: 'También se las llama funcionales.' },
      ],
      sources: [
        { title: 'Ingeniería del Software: un enfoque práctico', ref: PRESS, points: ['Fundamentos: comprobabilidad (Bach) y características de una buena prueba.', 'Visiones interna y externa: caja blanca y caja negra.', 'Ruta básica: gráficos de flujo, rutas independientes, complejidad ciclomática.', 'Prueba de estructura de control; partición de equivalencia; análisis de valores límite; arreglo ortogonal; prueba basada en modelos.'] },
      ],
    },

    {
      id: 'pruebas-unitarias',
      module: 'qa',
      title: 'Pruebas unitarias con xUnit y mocks',
      keywords: 'pruebas unitarias unit test xunit fact theory inlinedata assert arrange act assert aaa nunit mstest dotnet test moq mock stub fake doble de prueba verify setup buenas practicas nombres controlador',
      tldr: 'Una <mark>prueba unitaria</mark> verifica una pieza chica de código de forma automática, rápida y aislada. Se escribe en tres pasos (<mark>Arrange, Act, Assert</mark>) y las dependencias se reemplazan por <mark>dobles de prueba</mark> como los mocks.',
      goals: [
        'Crear un proyecto de pruebas xUnit y ejecutarlo con dotnet test.',
        'Escribir pruebas con [Fact] y [Theory] siguiendo AAA.',
        'Aislar la unidad con mocks de Moq y verificar interacciones.',
        'Probar la lógica de un controlador.',
        'Aplicar las buenas prácticas de nombres y diseño de pruebas.',
      ],
      body: `
        <h2>Qué hace buena a una prueba unitaria</h2>
        ${table(['Característica', 'Significa'], [
          ['<strong>Rápida</strong>', 'Milisegundos: se corren cientos en cada cambio'],
          ['<strong>Aislada</strong>', 'No depende de la base, la red ni el disco'],
          ['<strong>Repetible</strong>', 'Siempre da el mismo resultado'],
          ['<strong>Autoverificable</strong>', 'Pasa o falla sola, sin que alguien mire la salida'],
          ['<strong>Oportuna</strong>', 'Se escribe junto con el código (o antes, en TDD)'],
        ])}
        <h3>Las fases de una prueba</h3>
        ${table(['Fase', 'Paso', 'Qué hace'], [
          ['<strong>Arrange</strong>', 'Inicio', 'Establecer las condiciones y los datos de la prueba'],
          ['<strong>Act</strong>', 'Ejecución', 'Ejecutar el método a probar con esos datos'],
          ['<strong>Assert</strong>', 'Verificación', 'Comparar el resultado esperado con el obtenido'],
          ['(Cleanup)', 'Cierre', 'Deshacer las condiciones y datos, si hace falta'],
        ])}

        <h2>xUnit</h2>
        <p>Los tres frameworks de pruebas de .NET son xUnit, NUnit y MSTest (el EJ07 usaba MSTest). xUnit es el más usado en proyectos nuevos y el de la plantilla de Microsoft.</p>
        ${code('bash', `dotnet new xunit -n Dsw2026Ej15.Tests
dotnet sln add Dsw2026Ej15.Tests
dotnet add Dsw2026Ej15.Tests reference Dsw2026Ej15.Domain Dsw2026Ej15.Api
dotnet add Dsw2026Ej15.Tests package Moq
dotnet test`)}
        ${code('cs', `// Suponiendo un constructor VehiculoElectrico(patente, capacidadCarga) y KwhBase = 16
public class VehiculoElectricoTests
{
    [Fact]                                     // una prueba
    public void CalcularConsumo_CargaHasta1200_SinRecargo()
    {
        // Arrange
        var v = new VehiculoElectrico("AE123FG", capacidadCarga: 1200);
        // Act
        double consumo = v.CalcularConsumo(100);
        // Assert
        Assert.Equal(16, consumo, precision: 2);
    }

    [Theory]                                   // la misma prueba con varios datos
    [InlineData(100, 1201, 18.4)]
    [InlineData(200, 1300, 36.8)]
    [InlineData(0, 2000, 0)]
    public void CalcularConsumo_CargaMayorA1200_Recargo15(double km, double carga, double esperado)
    {
        var v = new VehiculoElectrico("AE123FG", capacidadCarga: carga);
        Assert.Equal(esperado, v.CalcularConsumo(km), precision: 2);
    }
}`)}
        ${table(['Assert', 'Verifica'], [
          ['<code>Assert.Equal(esperado, real)</code>', 'Igualdad (con <code>precision</code> para decimales)'],
          ['<code>Assert.True / False</code>', 'Una condición'],
          ['<code>Assert.Null / NotNull</code>', 'Nulos'],
          ['<code>Assert.Throws&lt;T&gt;(() =&gt; …)</code>', 'Que se lance una excepción de ese tipo (y la devuelve)'],
          ['<code>Assert.IsType&lt;T&gt;(obj)</code>', 'El tipo exacto (útil con ActionResult)'],
          ['<code>Assert.Contains / Empty / Single</code>', 'Colecciones y textos'],
        ])}
        <p>xUnit crea una instancia nueva de la clase de prueba para cada prueba: el constructor sirve como Arrange común y <code>IDisposable.Dispose</code> como Cleanup.</p>

        <h2>Dobles de prueba y mocks</h2>
        <p>Para probar <code>DoctorService</code> sin una base de datos, se reemplaza <code>IPersistence</code> por un <strong>doble</strong>. Esto solo es posible porque el servicio depende de una interfaz (DIP y dependencias explícitas otra vez).</p>
        ${table(['Doble', 'Qué es'], [
          ['<strong>Fake</strong>', 'Una implementación simple que funciona (como PersistenceInMemory)'],
          ['<strong>Stub</strong>', 'Devuelve respuestas fijas a las llamadas'],
          ['<strong>Mock</strong>', 'Además permite verificar cómo fue llamado (cuántas veces, con qué argumentos)'],
        ])}
        ${code('cs', `public class DoctorServiceTests
{
    private readonly Mock<IPersistence> _persistence = new();
    private readonly DoctorService _service;
    private readonly Speciality _cardiologia = new("Cardiología", "Corazón");

    public DoctorServiceTests()
    {
        // Arrange común: la persistencia simulada conoce una sola especialidad
        _persistence.Setup(p => p.GetSpeciality(_cardiologia.Id)).Returns(_cardiologia);
        _service = new DoctorService(_persistence.Object);
    }

    [Fact]
    public void CreateDoctor_DatosValidos_CreaMedicoActivoYLoGuarda()
    {
        var doctor = _service.CreateDoctor("Laura Pérez", "MP-1234", _cardiologia.Id);

        Assert.True(doctor.IsActive);
        Assert.Equal("Cardiología", doctor.Speciality.Name);
        _persistence.Verify(p => p.AddDoctor(doctor), Times.Once);     // ¿se guardó una vez?
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void CreateDoctor_NombreVacio_LanzaValidationException(string? nombre)
    {
        var ex = Assert.Throws<ValidationException>(() => _service.CreateDoctor(nombre, "MP-1", _cardiologia.Id));

        Assert.Contains("nombre", ex.Message);
        _persistence.Verify(p => p.AddDoctor(It.IsAny<Doctor>()), Times.Never);
    }
}`, 'Pruebas reales del EJ15 (todas pasan con .NET 10)')}

        <h2>Probar la lógica de un controlador</h2>
        <p>Las pruebas unitarias de un controlador verifican su lógica (qué resultado devuelve según el caso), no el enrutamiento, los filtros ni la serialización: eso es tarea de las pruebas de integración.</p>
        ${code('cs', `[Fact]
public void GetById_MedicoInexistente_DevuelveNotFound()
{
    _persistence.Setup(p => p.GetDoctor(It.IsAny<Guid>())).Returns((Doctor?)null);

    var result = _controller.GetById(Guid.NewGuid());

    Assert.IsType<NotFoundResult>(result.Result);
}

[Fact]
public void Create_DatosValidos_DevuelveCreatedAtActionGetById()
{
    var esp = new Speciality("Pediatría", "");
    _persistence.Setup(p => p.GetSpeciality(esp.Id)).Returns(esp);

    var result = _controller.Create(new DoctorRequest("Martín", "MP-9", esp.Id));

    var created = Assert.IsType<CreatedAtActionResult>(result.Result);
    Assert.Equal(nameof(DoctorsController.GetById), created.ActionName);
}`)}

        <h2>Buenas prácticas</h2>
        <ul>
          <li><strong>Nombres en tres partes:</strong> <code>Método_Escenario_ResultadoEsperado</code>. Cuando falla, el nombre explica qué se rompió.</li>
          <li><strong>Un solo Act por prueba.</strong> Si hay que probar dos cosas, son dos pruebas.</li>
          <li><strong>Sin lógica en las pruebas:</strong> nada de if, for ni cálculos que repitan la implementación. Los valores esperados van escritos literalmente.</li>
          <li><strong>Evitar cadenas y números mágicos:</strong> constantes con nombre que expliquen el porqué.</li>
          <li><strong>Preferir métodos auxiliares</strong> a un Arrange común gigante que nadie entiende.</li>
          <li><strong>Probar comportamiento público,</strong> no métodos privados: se prueban a través de los públicos.</li>
          <li><strong>Datos mínimos:</strong> solo lo necesario para el escenario.</li>
          <li>Las pruebas son código: aplicá las mismas reglas de código limpio.</li>
        </ul>
        ${lab(0)}
      `,
      labs: [
        {
          type: 'order',
          title: 'Las fases de una prueba',
          intro: 'Ordená las líneas de esta prueba según AAA.',
          items: [
            'var persistencia = new Mock&lt;IPersistence&gt;();',
            'persistencia.Setup(p =&gt; p.GetDoctor(id)).Returns(doctorActivo);',
            'var servicio = new DoctorService(persistencia.Object);',
            'bool resultado = servicio.DeactivateDoctor(id);',
            'Assert.True(resultado);',
            'persistencia.Verify(p =&gt; p.UpdateDoctor(doctorActivo), Times.Once);',
          ],
          explain: '<p>Las tres primeras son <strong>Arrange</strong> (preparar el doble y el sistema bajo prueba), la cuarta es el único <strong>Act</strong>, y las dos últimas son <strong>Assert</strong>: el resultado y la interacción con el mock.</p>',
        },
      ],
      exercises: [
        {
          level: 2,
          title: 'Pruebas unitarias para el EJ15',
          prompt: '<p>Creá el proyecto <code>Dsw2026Ej15.Tests</code> con xUnit y Moq. Escribí pruebas para <code>DoctorService</code> (alta válida, nombre vacío con <code>[Theory]</code>, especialidad inexistente, baja de un médico activo e inexistente) y para <code>DoctorsController</code> (GetById 404 y 200, Create que devuelve CreatedAtAction, Delete 404).</p>',
          hints: ['Un <code>Mock&lt;IPersistence&gt;</code> por clase de prueba, armado en el constructor.', '<code>Times.Never</code> sirve para comprobar que algo no se guardó.', 'Para los resultados del controlador: <code>Assert.IsType&lt;NotFoundResult&gt;(result.Result)</code>.'],
          solution: sol('<p>Compiladas y ejecutadas: <strong>11 pruebas superadas, 0 con error</strong> (el <code>[Theory]</code> cuenta como tres). Las pruebas del controlador usan un <code>DoctorService</code> real con la persistencia simulada: así se prueba la lógica de la acción sin servidor HTTP ni base de datos.</p>', [
            ['DoctorServiceTests.cs', 'cs', `using Dsw2026Ej15.Domain.Entities;
using Dsw2026Ej15.Domain.Exceptions;
using Dsw2026Ej15.Domain.Interfaces;
using Dsw2026Ej15.Domain.Services;
using Moq;

namespace Dsw2026Ej15.Tests;

public class DoctorServiceTests
{
    private readonly Mock<IPersistence> _persistence = new();
    private readonly DoctorService _service;
    private readonly Speciality _cardiologia = new("Cardiología", "Corazón");

    public DoctorServiceTests()
    {
        _persistence.Setup(p => p.GetSpeciality(_cardiologia.Id)).Returns(_cardiologia);
        _service = new DoctorService(_persistence.Object);
    }

    [Fact]
    public void CreateDoctor_DatosValidos_CreaMedicoActivoYLoGuarda()
    {
        var doctor = _service.CreateDoctor("Laura Pérez", "MP-1234", _cardiologia.Id);

        Assert.True(doctor.IsActive);
        Assert.Equal("Cardiología", doctor.Speciality.Name);
        _persistence.Verify(p => p.AddDoctor(doctor), Times.Once);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void CreateDoctor_NombreVacio_LanzaValidationException(string? nombre)
    {
        var ex = Assert.Throws<ValidationException>(() => _service.CreateDoctor(nombre, "MP-1", _cardiologia.Id));

        Assert.Contains("nombre", ex.Message);
        _persistence.Verify(p => p.AddDoctor(It.IsAny<Doctor>()), Times.Never);
    }

    [Fact]
    public void CreateDoctor_EspecialidadInexistente_LanzaValidationException()
    {
        Assert.Throws<ValidationException>(() => _service.CreateDoctor("Ana", "MP-2", Guid.NewGuid()));
    }

    [Fact]
    public void DeactivateDoctor_MedicoActivo_LoDesactivaYDevuelveTrue()
    {
        var doctor = new Doctor("Ana", "MP-3", _cardiologia);
        _persistence.Setup(p => p.GetDoctor(doctor.Id)).Returns(doctor);

        bool resultado = _service.DeactivateDoctor(doctor.Id);

        Assert.True(resultado);
        Assert.False(doctor.IsActive);
        _persistence.Verify(p => p.UpdateDoctor(doctor), Times.Once);
    }

    [Fact]
    public void DeactivateDoctor_MedicoInexistente_DevuelveFalse()
    {
        _persistence.Setup(p => p.GetDoctor(It.IsAny<Guid>())).Returns((Doctor?)null);

        Assert.False(_service.DeactivateDoctor(Guid.NewGuid()));
    }
}`],
            ['DoctorsControllerTests.cs', 'cs', `using Dsw2026Ej15.Api.Controllers;
using Dsw2026Ej15.Api.Models;
using Dsw2026Ej15.Domain.Entities;
using Dsw2026Ej15.Domain.Interfaces;
using Dsw2026Ej15.Domain.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Dsw2026Ej15.Tests;

public class DoctorsControllerTests
{
    private readonly Mock<IPersistence> _persistence = new();
    private readonly DoctorsController _controller;

    public DoctorsControllerTests()
        => _controller = new DoctorsController(new DoctorService(_persistence.Object));

    [Fact]
    public void GetById_MedicoInexistente_DevuelveNotFound()
    {
        _persistence.Setup(p => p.GetDoctor(It.IsAny<Guid>())).Returns((Doctor?)null);

        var result = _controller.GetById(Guid.NewGuid());

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public void GetById_MedicoActivo_DevuelveOkConLosDatos()
    {
        var doctor = new Doctor("Laura Pérez", "MP-1234", new Speciality("Pediatría", ""));
        _persistence.Setup(p => p.GetDoctor(doctor.Id)).Returns(doctor);

        var result = _controller.GetById(doctor.Id);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var body = Assert.IsType<DoctorDetailResponse>(ok.Value);
        Assert.Equal("Pediatría", body.SpecialityName);
    }

    [Fact]
    public void Create_DatosValidos_DevuelveCreatedAtActionGetById()
    {
        var esp = new Speciality("Pediatría", "");
        _persistence.Setup(p => p.GetSpeciality(esp.Id)).Returns(esp);

        var result = _controller.Create(new DoctorRequest("Martín", "MP-9", esp.Id));

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(nameof(DoctorsController.GetById), created.ActionName);
    }

    [Fact]
    public void Delete_MedicoInexistente_DevuelveNotFound()
    {
        Assert.IsType<NotFoundResult>(_controller.Delete(Guid.NewGuid()));
    }
}`],
            ['Salida', 'text', 'Correctas! - Con error: 0, Superado: 11, Omitido: 0, Total: 11 - Dsw2026Ej15.Tests.dll (net10.0)'],
          ]),
        },
      ],
      quiz: [
        { q: '¿En qué fase de una prueba se ejecuta el método que se está probando?', o: ['Arrange', 'Act', 'Assert', 'Cleanup'], a: 1, e: 'Arrange prepara, Act ejecuta, Assert verifica.' },
        { q: '¿Para qué sirve <code>[Theory]</code> con <code>[InlineData]</code>?', o: ['Para ignorar una prueba.', 'Para ejecutar la misma prueba con distintos datos.', 'Para pruebas asincrónicas.', 'Para crear mocks.'], a: 1, e: 'Cada InlineData es un caso.' },
        { q: '¿Qué diferencia a un mock de un stub?', o: ['Ninguna.', 'El mock además permite verificar cómo fue llamado.', 'El stub es más lento.', 'El mock usa la base real.'], a: 1, e: 'Verify con Times.Once, Times.Never…' },
        { q: '¿Cuál es el mejor nombre para una prueba?', o: ['<code>Test1</code>', '<code>PruebaDoctor</code>', '<code>CreateDoctor_NombreVacio_LanzaValidationException</code>', '<code>Funciona</code>'], a: 2, e: 'Método, escenario y resultado esperado.' },
        { q: '¿Por qué se puede probar DoctorService sin base de datos?', o: ['Porque no usa datos.', 'Porque depende de la interfaz IPersistence, que se reemplaza por un mock.', 'Porque xUnit crea una base temporal.', 'No se puede.'], a: 1, e: 'Inversión de dependencias y dependencias explícitas.' },
        { q: '¿Qué conviene evitar dentro de una prueba unitaria?', o: ['Asserts.', 'Lógica condicional y bucles que repliquen la implementación.', 'Nombres descriptivos.', 'Datos de prueba.'], a: 1, e: 'Las pruebas deben ser obvias.' },
      ],
      sources: [
        { title: 'Prueba unitaria de C# con xUnit', url: 'https://learn.microsoft.com/es-es/dotnet/core/testing/unit-testing-csharp-with-xunit', points: ['Crear la solución con dotnet new xunit y dotnet test.', '[Fact], [Theory] e [InlineData]; enfoque TDD.'] },
        { title: 'Procedimientos recomendados para pruebas unitarias', url: 'https://learn.microsoft.com/es-es/dotnet/core/testing/unit-testing-best-practices', points: ['Características de una buena prueba; terminología de dobles (fake, stub, mock).', 'Nombres en tres partes; organizar con AAA; un solo Act.', 'Evitar lógica, cadenas mágicas y Setup/Teardown excesivos.'] },
        { title: 'Prueba de la lógica del controlador', url: 'https://learn.microsoft.com/es-es/aspnet/core/mvc/controllers/testing', points: ['Probar acciones con dependencias simuladas (Moq).', 'Verificar tipos de resultado: Ok, NotFound, CreatedAtAction.'] },
      ],
    },

    {
      id: 'codigo-limpio',
      module: 'qa',
      title: 'Código limpio',
      keywords: 'clean code codigo limpio consistente intencional adaptable responsable nombres funciones duplicacion dry comentarios convenciones refactorizar sonar revision ej08',
      tldr: 'El <mark>código limpio</mark> es código que otra persona puede leer, entender y cambiar sin miedo. Sonar lo resume en cuatro atributos: <mark>consistente</mark>, <mark>intencional</mark>, <mark>adaptable</mark> y <mark>responsable</mark>.',
      goals: [
        'Definir los cuatro atributos del código limpio.',
        'Reconocer problemas comunes (repetición, nombres pobres, comentarios inútiles).',
        'Aplicar lo aprendido de las revisiones del EJ08.',
      ],
      body: `
        <h2>Los cuatro atributos</h2>
        ${table(['Atributo', 'Qué significa', 'Ejemplo'], [
          ['<strong>Consistente</strong>', 'Sigue un estilo común y unificado. Aunque muchas personas trabajen en él con los años, tiene una apariencia similar y respeta los patrones establecidos', 'Convenciones de C# en todo el proyecto: PascalCase, _campos, propiedades en lugar de Get/Set'],
          ['<strong>Intencional</strong>', 'Transmite su propósito, es autoexplicativo y admite una sola interpretación. Claro y directo', '<code>EncontrarBrechaMaxima</code> en vez de <code>Calc2</code>'],
          ['<strong>Adaptable</strong>', 'Está segmentado y organizado para evolucionar fácil y seguro: extender o recomponer sin efectos secundarios', 'Capas, interfaces, clases chicas con una responsabilidad'],
          ['<strong>Responsable</strong>', 'Es consciente de sus obligaciones éticas con los datos y su influencia social; no presenta riesgos de dañar a terceros', 'No registrar datos personales; proteger la información; licencias respetadas'],
        ])}

        <h2>Prácticas concretas</h2>
        <h3>Nombres</h3>
        <ul>
          <li>Revelan la intención: <code>diasHastaVencimiento</code>, no <code>d</code>.</li>
          <li>Pronunciables y buscables; sin abreviaturas crípticas.</li>
          <li>Clases y propiedades con sustantivos (<code>Doctor</code>, <code>Balance</code>); métodos con verbos (<code>Deactivate</code>, <code>CalcularConsumo</code>).</li>
          <li>Un concepto, una palabra: no mezclar <code>Get</code>, <code>Fetch</code> y <code>Obtener</code> para lo mismo.</li>
        </ul>
        <h3>Métodos</h3>
        <ul>
          <li>Cortos y que hagan una sola cosa, en un solo nivel de abstracción.</li>
          <li>Pocos parámetros. Si son muchos, quizás falta un objeto.</li>
          <li>Sin efectos secundarios ocultos (principio de mínima sorpresa de Booch).</li>
        </ul>
        <h3>No repetir (DRY)</h3>
        <p>Cada pieza de conocimiento debería tener una única representación. El hallazgo más repetido en las revisiones del EJ08 fue el mismo bloque <code>if</code> copiado tres veces para las tres notas (48,8 % de los repositorios):</p>
        ${code('cs', `// Antes (repetido en casi la mitad de las entregas)
if (nota1.HasValue && 0 <= nota1.Value && nota1.Value <= 10) { suma += nota1.Value; count++; }
if (nota2.HasValue && 0 <= nota2.Value && nota2.Value <= 10) { suma += nota2.Value; count++; }
if (nota3.HasValue && 0 <= nota3.Value && nota3.Value <= 10) { suma += nota3.Value; count++; }

// Después: la regla se escribe una sola vez
foreach (int? nota in new[] { nota1, nota2, nota3 })
    if (nota is >= 0 and <= 10) { suma += nota.Value; count++; }`)}
        <h3>Comentarios</h3>
        <p>Un buen comentario explica <strong>por qué</strong>, nunca <strong>qué</strong> (eso ya lo dice el código). Las revisiones del EJ08 encontraron código entregado con comentarios de IA sin revisar, como <code>// Si es null, retorna "SIN-CODIGO"[cite: 1]</code>. Además de ruido, muestran que el código no se leyó antes de entregarlo.</p>
        ${code('cs', `// Mal: repite el código
i++;   // incrementa i

// Bien: explica una decisión que el código no puede mostrar
// El Timer dispara en otro hilo: la consola se usa de a uno
lock (ConsolaLock) { … }`)}
        <h3>Formato y compilación</h3>
        <p>Código bien indentado y que <strong>compila</strong>: el 11,6 % de las entregas del EJ08 no compilaba. Visual Studio formatea con <kbd>Ctrl</kbd>+<kbd>K</kbd>, <kbd>Ctrl</kbd>+<kbd>D</kbd>, y <code>dotnet format</code> lo hace desde la terminal.</p>

        <h2>Lo que dejaron las revisiones del EJ08</h2>
        <p>La cátedra revisó 43 repositorios con 19 criterios: 86,7 % logrado. La conclusión fue que la dificultad no estaba en resolver, sino en <strong>resolver con calidad</strong>: cumplir exactamente la firma, el formato y el archivo pedidos, no repetir lógica, respetar las convenciones de C#, demostrar explícitamente el concepto pedido y revisar que la solución compile.</p>
        ${lab(0)}
      `,
      labs: [
        {
          type: 'classify',
          title: '¿Qué atributo del código limpio falta?',
          buckets: ['Consistente', 'Intencional', 'Adaptable', 'Responsable'],
          items: [
            { t: 'Algunas clases usan propiedades y otras métodos GetX/SetX para lo mismo', b: 0, why: 'Estilos mezclados en el mismo proyecto.' },
            { t: 'Un método se llama <code>Procesar(int a, int b, bool f)</code>', b: 1, why: 'Ni el nombre ni los parámetros dicen qué hace.' },
            { t: 'Para agregar un tipo de cuenta hay que modificar cinco if en tres clases', b: 2, why: 'Cambiar una cosa obliga a tocar muchas.' },
            { t: 'El log de errores guarda el número de documento y la contraseña del usuario', b: 3, why: 'Riesgo para terceros: datos sensibles expuestos.' },
            { t: 'La mitad del equipo nombra los campos <code>_saldo</code> y la otra <code>mSaldo</code>', b: 0, why: 'Convenciones distintas.' },
            { t: 'El controlador calcula descuentos, arma SQL y formatea HTML en el mismo método', b: 2, why: 'Responsabilidades mezcladas: imposible cambiar una sin riesgo.' },
          ],
        },
      ],
      quiz: [
        { q: '¿Cuáles son los cuatro atributos del código limpio según Sonar?', o: ['Rápido, corto, comentado y probado.', 'Consistente, intencional, adaptable y responsable.', 'Seguro, escalable, portable y legible.', 'SOLID.'], a: 1, e: 'La fuente de la cátedra es el artículo de Sonar.' },
        { q: 'Código que “transmite su propósito y admite una sola interpretación” es…', o: ['…consistente.', '…intencional.', '…adaptable.', '…responsable.'], a: 1, e: 'Nombres y estructura que se explican solos.' },
        { q: '¿Qué debería explicar un comentario?', o: ['Qué hace cada línea.', 'Por qué se tomó una decisión que el código no puede mostrar.', 'El historial de cambios.', 'Quién lo escribió.'], a: 1, e: 'El qué lo dice el código; el historial, Git.' },
        { q: '¿Cuál fue la observación más frecuente en las revisiones del EJ08?', o: ['Repositorios vacíos.', 'Repetición de código en el problema 4.', 'Uso de LINQ.', 'Falta de pruebas.'], a: 1, e: 'El mismo if copiado tres veces: 48,8 % de los repositorios.' },
        { q: 'DRY significa…', o: ['Don’t Repeat Yourself: cada conocimiento con una única representación.', 'Debug, Run, Yield.', 'Un patrón de diseño.', 'Una regla de Git.'], a: 0, e: 'Duplicar lógica multiplica los lugares a corregir.' },
      ],
      sources: [
        { title: 'What is Clean Code?', url: 'https://www.sonarsource.com/blog/what-is-clean-code/', points: ['Los cuatro atributos: consistente, intencional, adaptable y responsable.', 'Por qué el código limpio reduce la deuda técnica.'] },
        { title: 'Revisiones EJ08', ref: 'Cátedra DSW 2026', points: ['86,7 % de logro global sobre 817 evaluaciones (43 repositorios × 19 criterios).', 'Observaciones recurrentes: repetición en el problema 4, convenciones de C#, retorno que no evidencia el cambio por referencia, soluciones que no compilan, comentarios de IA.'] },
      ],
    },
  );
})();
