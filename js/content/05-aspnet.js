/* Módulo: APIs web con ASP.NET Core (Unidad 3, clases 19 a 21) */
(() => {
  const { code, table, note, lab, def, fig, sol, flow } = window.GUIDE.h;

  const EJ15_FILES = [
    ['Estructura de la solución', 'text', `Dsw2026Ej15/
├── Dsw2026Ej15.Api/            (referencia a Domain y Data)
│   ├── Controllers/DoctorsController.cs
│   ├── Middlewares/ExceptionHandlingMiddleware.cs
│   ├── Models/DoctorModel.cs
│   └── Program.cs
├── Dsw2026Ej15.Domain/         (no referencia a nadie)
│   ├── Entities/BaseEntity.cs, Doctor.cs, Speciality.cs
│   ├── Exceptions/ValidationException.cs
│   ├── Interfaces/IPersistence.cs
│   └── Services/DoctorService.cs
└── Dsw2026Ej15.Data/           (referencia a Domain)
    ├── PersistenceInMemory.cs
    └── Sources/specialities.json`],
    ['Comandos para crearla', 'bash', `dotnet new sln -n Dsw2026Ej15
dotnet new webapi --use-controllers -n Dsw2026Ej15.Api -o Dsw2026Ej15.Api
dotnet new classlib -n Dsw2026Ej15.Domain -o Dsw2026Ej15.Domain
dotnet new classlib -n Dsw2026Ej15.Data -o Dsw2026Ej15.Data
dotnet sln add Dsw2026Ej15.Api Dsw2026Ej15.Domain Dsw2026Ej15.Data
dotnet add Dsw2026Ej15.Data reference Dsw2026Ej15.Domain
dotnet add Dsw2026Ej15.Api reference Dsw2026Ej15.Domain Dsw2026Ej15.Data`],
    ['Domain/Entities/BaseEntity.cs', 'cs', `namespace Dsw2026Ej15.Domain.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; private set; }

    protected BaseEntity(Guid? id = null) => Id = id ?? Guid.NewGuid();
}`],
    ['Domain/Entities/Speciality.cs', 'cs', `namespace Dsw2026Ej15.Domain.Entities;

public class Speciality : BaseEntity
{
    public string Name { get; private set; }
    public string Description { get; private set; }

    public Speciality(string name, string description, Guid? id = null) : base(id)
    {
        Name = name;
        Description = description;
    }
}`],
    ['Domain/Entities/Doctor.cs', 'cs', `namespace Dsw2026Ej15.Domain.Entities;

public class Doctor : BaseEntity
{
    public string Name { get; private set; }
    public string LicenseNumber { get; private set; }
    public bool IsActive { get; private set; }
    public Speciality Speciality { get; private set; }

    public Doctor(string name, string licenseNumber, Speciality speciality)
    {
        Name = name;
        LicenseNumber = licenseNumber;
        Speciality = speciality;
        IsActive = true;            // regla de negocio: se crea activo
    }

    public void Deactivate() => IsActive = false;
}`],
    ['Domain/Interfaces/IPersistence.cs', 'cs', `using Dsw2026Ej15.Domain.Entities;

namespace Dsw2026Ej15.Domain.Interfaces;

public interface IPersistence
{
    IEnumerable<Doctor> GetDoctors();
    Doctor? GetDoctor(Guid id);
    void AddDoctor(Doctor doctor);
    void UpdateDoctor(Doctor doctor);
    Speciality? GetSpeciality(Guid id);
}`],
    ['Domain/Exceptions/ValidationException.cs', 'cs', `namespace Dsw2026Ej15.Domain.Exceptions;

public class ValidationException : Exception
{
    public ValidationException(string message) : base(message) { }
}`],
    ['Domain/Services/DoctorService.cs', 'cs', `using Dsw2026Ej15.Domain.Entities;
using Dsw2026Ej15.Domain.Exceptions;
using Dsw2026Ej15.Domain.Interfaces;

namespace Dsw2026Ej15.Domain.Services;

public class DoctorService
{
    private readonly IPersistence _persistence;

    public DoctorService(IPersistence persistence) => _persistence = persistence;

    public Doctor CreateDoctor(string? name, string? licenseNumber, Guid specialityId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ValidationException("El nombre es obligatorio.");
        if (string.IsNullOrWhiteSpace(licenseNumber))
            throw new ValidationException("La matrícula es obligatoria.");
        var speciality = _persistence.GetSpeciality(specialityId)
            ?? throw new ValidationException($"No existe la especialidad {specialityId}.");

        var doctor = new Doctor(name.Trim(), licenseNumber.Trim(), speciality);
        _persistence.AddDoctor(doctor);
        return doctor;
    }

    public IEnumerable<Doctor> GetActiveDoctors() => _persistence.GetDoctors().Where(d => d.IsActive);

    public Doctor? GetActiveDoctor(Guid id)
    {
        var doctor = _persistence.GetDoctor(id);
        return doctor is { IsActive: true } ? doctor : null;
    }

    // Devuelve false si no hay un médico activo con ese id
    public bool DeactivateDoctor(Guid id)
    {
        var doctor = GetActiveDoctor(id);
        if (doctor is null) return false;
        doctor.Deactivate();
        _persistence.UpdateDoctor(doctor);
        return true;
    }
}`],
    ['Data/PersistenceInMemory.cs', 'cs', `using System.Text.Json;
using Dsw2026Ej15.Domain.Entities;
using Dsw2026Ej15.Domain.Interfaces;

namespace Dsw2026Ej15.Data;

public class PersistenceInMemory : IPersistence
{
    private readonly List<Doctor> _doctors = [];
    private readonly List<Speciality> _specialities = [];
    private readonly Lock _lock = new();   // Singleton: varios requests pueden llegar a la vez

    public PersistenceInMemory()
    {
        LoadSpecialities();
    }

    private void LoadSpecialities()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Sources", "specialities.json");
        var json = File.ReadAllText(path);
        var data = JsonSerializer.Deserialize<List<SpecialityData>>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web)) ?? [];
        _specialities.AddRange(data.Select(s => new Speciality(s.Name, s.Description, s.Id)));
    }

    public IEnumerable<Doctor> GetDoctors()
    {
        lock (_lock) return _doctors.ToList();
    }

    public Doctor? GetDoctor(Guid id)
    {
        lock (_lock) return _doctors.FirstOrDefault(d => d.Id == id);
    }

    public void AddDoctor(Doctor doctor)
    {
        lock (_lock) _doctors.Add(doctor);
    }

    // En memoria el objeto ya se modificó por referencia: no hay nada que guardar
    public void UpdateDoctor(Doctor doctor) { }

    public Speciality? GetSpeciality(Guid id) => _specialities.FirstOrDefault(s => s.Id == id);

    private record SpecialityData(Guid Id, string Name, string Description);
}`],
    ['Data/Dsw2026Ej15.Data.csproj (fragmento)', 'xml', `<ItemGroup>
  <None Update="Sources\\specialities.json">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </None>
</ItemGroup>`],
    ['Api/Models/DoctorModel.cs', 'cs', `namespace Dsw2026Ej15.Api.Models;

public record DoctorRequest(string? Name, string? LicenseNumber, Guid SpecialityId);

public record DoctorResponse(Guid Id, string Name, string LicenseNumber, string SpecialityName);

public record DoctorDetailResponse(string Name, string LicenseNumber, string SpecialityName);`],
    ['Api/Controllers/DoctorsController.cs', 'cs', `using Dsw2026Ej15.Api.Models;
using Dsw2026Ej15.Domain.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dsw2026Ej15.Api.Controllers;

[ApiController]
[Route("api/doctors")]
public class DoctorsController : ControllerBase
{
    private readonly DoctorService _service;

    public DoctorsController(DoctorService service) => _service = service;

    [HttpPost]
    public ActionResult<DoctorResponse> Create([FromBody] DoctorRequest request)
    {
        var doctor = _service.CreateDoctor(request.Name, request.LicenseNumber, request.SpecialityId);
        var response = new DoctorResponse(doctor.Id, doctor.Name, doctor.LicenseNumber, doctor.Speciality.Name);
        return CreatedAtAction(nameof(GetById), new { id = doctor.Id }, response);
    }

    [HttpGet]
    public ActionResult<IEnumerable<DoctorResponse>> GetAll()
        => Ok(_service.GetActiveDoctors()
            .Select(d => new DoctorResponse(d.Id, d.Name, d.LicenseNumber, d.Speciality.Name)));

    [HttpGet("{id:guid}")]
    public ActionResult<DoctorDetailResponse> GetById(Guid id)
    {
        var doctor = _service.GetActiveDoctor(id);
        if (doctor is null) return NotFound();
        return Ok(new DoctorDetailResponse(doctor.Name, doctor.LicenseNumber, doctor.Speciality.Name));
    }

    [HttpDelete("{id:guid}")]
    public IActionResult Delete(Guid id)
        => _service.DeactivateDoctor(id) ? NoContent() : NotFound();
}`],
    ['Api/Middlewares/ExceptionHandlingMiddleware.cs', 'cs', `using Dsw2026Ej15.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Dsw2026Ej15.Api.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            await WriteProblem(context, StatusCodes.Status400BadRequest, "Bad Request", ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado procesando {Path}", context.Request.Path);
            await WriteProblem(context, StatusCodes.Status500InternalServerError, "Internal Server Error",
                "Ocurrió un error inesperado.");
        }
    }

    private static Task WriteProblem(HttpContext context, int status, string title, string detail)
    {
        context.Response.StatusCode = status;
        return context.Response.WriteAsJsonAsync(
            new ProblemDetails { Status = status, Title = title, Detail = detail },
            options: null, contentType: "application/problem+json");
    }
}`],
    ['Api/Program.cs', 'cs', `using Dsw2026Ej15.Api.Middlewares;
using Dsw2026Ej15.Data;
using Dsw2026Ej15.Domain.Interfaces;
using Dsw2026Ej15.Domain.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();

// Composition root: acá (y solo acá) se elige la implementación concreta
builder.Services.AddSingleton<IPersistence, PersistenceInMemory>();
builder.Services.AddScoped<DoctorService>();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();   // primero: atrapa lo que lance cualquier etapa posterior

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health-check");

app.Run();`],
    ['Pruebas con curl (resultados reales)', 'http', `POST /api/doctors  {"name":"Martín Ruiz","licenseNumber":"MP-5678","specialityId":"8b2d…"}
201  {"id":"bb3a7cc6-…","name":"Martín Ruiz","licenseNumber":"MP-5678","specialityName":"Pediatría"}
     Location: /api/doctors/bb3a7cc6-…

POST /api/doctors  {"name":"", …}
400  {"title":"Bad Request","status":400,"detail":"El nombre es obligatorio."}

POST /api/doctors  {"specialityId":"00000000-0000-0000-0000-000000000000", …}
400  {"title":"Bad Request","status":400,"detail":"No existe la especialidad 00000000-…"}

GET /api/doctors/bb3a7cc6-…     200  {"name":"Martín Ruiz","licenseNumber":"MP-5678","specialityName":"Pediatría"}
DELETE /api/doctors/bb3a7cc6-…  204
DELETE /api/doctors/bb3a7cc6-…  404   (ya no está activo)
GET /api/doctors                200  []
GET /health-check               200  Healthy`],
  ];

  window.GUIDE.LESSONS.push(
    {
      id: 'rest-http-json',
      module: 'api',
      title: 'REST, HTTP y JSON',
      keywords: 'rest http https verbos metodos get post put patch delete codigos de estado 200 201 204 400 401 403 404 405 500 encabezados headers json recurso url idempotente seguro postman swagger openapi archivo http curl prueba de endpoints',
      tldr: 'Una API REST expone <mark>recursos</mark> (médicos, especialidades) en URLs y usa los <mark>verbos HTTP</mark> para operar sobre ellos. Cada respuesta trae un <mark>código de estado</mark> que dice qué pasó, y los datos viajan normalmente en JSON.',
      goals: [
        'Explicar REST y sus principios.',
        'Usar el verbo y el código de estado correctos para cada operación.',
        'Leer y escribir JSON.',
        'Probar endpoints con herramientas: archivos .http, Postman, curl u OpenAPI.',
      ],
      body: `
        <h2>REST</h2>
        <p>La transferencia de estado representacional (REST) es un estilo de arquitectura para sistemas hipermedia distribuidos como la Web. Hoy se usa en sentido amplio para cualquier interfaz entre sistemas que use HTTP directamente para obtener datos u operar sobre ellos. Sus principios:</p>
        ${table(['Principio', 'Significado'], [
          ['Cliente-servidor', 'Cliente y servidor evolucionan por separado; se comunican por una interfaz.'],
          ['Interfaz uniforme', 'Recursos identificados por URLs y manipulados con los mismos verbos estándar.'],
          ['Sin estado (stateless)', 'Cada pedido trae toda la información necesaria: el servidor no guarda sesión entre pedidos. Por eso un token viaja en cada request.'],
          ['Sistema en capas', 'El cliente no sabe si habla con el servidor final o con un intermediario (proxy, balanceador).'],
          ['Cacheable', 'Las respuestas indican si se pueden guardar en caché.'],
        ])}
        <h3>Recursos y URLs</h3>
        <p>Las URLs nombran <strong>sustantivos</strong> (recursos), no acciones. El verbo HTTP es la acción:</p>
        ${table(['Bien', 'Mal'], [
          ['<code>GET /api/doctors</code>', '<code>GET /api/getDoctors</code>'],
          ['<code>POST /api/doctors</code>', '<code>POST /api/doctors/create</code>'],
          ['<code>DELETE /api/doctors/{id}</code>', '<code>GET /api/deleteDoctor?id=5</code>'],
          ['<code>GET /api/specialities/{id}/doctors</code>', '<code>GET /api/doctorsBySpeciality</code>'],
        ])}

        <h2>HTTP</h2>
        <p>HTTP es un protocolo cliente-servidor: la petición la inicia quien recibirá los datos. Una sesión tiene tres fases: el cliente establece una conexión TCP, manda la petición y espera; el servidor procesa y responde con un código de estado y los datos.</p>
        ${code('http', `POST /api/doctors HTTP/1.1
Host: localhost:7001
Content-Type: application/json
Authorization: Bearer eyJhbGciOi…

{ "name": "Martín Ruiz", "licenseNumber": "MP-5678", "specialityId": "8b2d4f61-…" }`, 'Una petición')}
        ${code('http', `HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: https://localhost:7001/api/doctors/bb3a7cc6-…

{ "id": "bb3a7cc6-…", "name": "Martín Ruiz", "licenseNumber": "MP-5678", "specialityName": "Pediatría" }`, 'Su respuesta')}

        <h3>Verbos</h3>
        ${table(['Verbo', 'Para', 'Seguro', 'Idempotente', 'Cuerpo'], [
          ['<code>GET</code>', 'Obtener un recurso o una colección', 'Sí', 'Sí', 'No'],
          ['<code>POST</code>', 'Crear un recurso (o acciones que no encajan en otro verbo)', 'No', 'No', 'Sí'],
          ['<code>PUT</code>', 'Reemplazar un recurso completo', 'No', 'Sí', 'Sí'],
          ['<code>PATCH</code>', 'Modificar parte de un recurso', 'No', 'No necesariamente', 'Sí'],
          ['<code>DELETE</code>', 'Eliminar un recurso', 'No', 'Sí', 'No'],
        ])}
        <p><strong>Seguro:</strong> no modifica nada en el servidor. <strong>Idempotente:</strong> hacerlo una vez o diez da el mismo estado final (borrar el médico 5 diez veces deja el mismo resultado; crear diez veces crea diez médicos).</p>

        <h3>Códigos de estado</h3>
        ${table(['Rango', 'Significado', 'Los que más vas a usar'], [
          ['1xx', 'Informativos', '—'],
          ['2xx', 'Éxito', '<code>200 OK</code>, <code>201 Created</code> (con encabezado Location), <code>204 No Content</code>'],
          ['3xx', 'Redirección', '<code>301</code>/<code>307</code> (por ejemplo, de http a https), <code>304 Not Modified</code>'],
          ['4xx', 'Error del cliente', '<code>400 Bad Request</code>, <code>401 Unauthorized</code>, <code>403 Forbidden</code>, <code>404 Not Found</code>, <code>405 Method Not Allowed</code>, <code>409 Conflict</code>, <code>429 Too Many Requests</code>'],
          ['5xx', 'Error del servidor', '<code>500 Internal Server Error</code>, <code>503 Service Unavailable</code>'],
        ])}
        ${note('<strong>401</strong> significa “no sé quién sos” (falta autenticación o el token no es válido). <strong>403</strong> significa “sé quién sos, pero no podés hacer esto” (falta autorización). Es una diferencia que se pregunta mucho.', 'exam')}

        <h2>JSON</h2>
        <p>JSON (JavaScript Object Notation) es un formato de texto sencillo para intercambiar datos. Nació como subconjunto de la notación de objetos de JavaScript, pero es independiente del lenguaje. Tiene objetos <code>{ }</code>, arreglos <code>[ ]</code>, strings entre comillas dobles, números, <code>true</code>, <code>false</code> y <code>null</code>.</p>
        ${code('json', `{
  "name": "Martín Ruiz",
  "licenseNumber": "MP-5678",
  "isActive": true,
  "speciality": { "id": "8b2d4f61-7c3e-4a9b-b0d2-5e6f7a8b9c22", "name": "Pediatría" },
  "turnos": ["lunes", "miércoles"],
  "observaciones": null
}`)}
        <p>ASP.NET Core serializa y deserializa JSON con <code>System.Text.Json</code>: las propiedades C# en PascalCase (<code>LicenseNumber</code>) se convierten a camelCase (<code>licenseNumber</code>).</p>

        <h2>Herramientas para probar endpoints</h2>
        ${table(['Herramienta', 'Cómo se usa'], [
          ['Archivo <code>.http</code>', 'Visual Studio y VS Code ejecutan pedidos escritos en un archivo del proyecto (la plantilla webapi lo crea).'],
          ['OpenAPI', 'La plantilla de .NET 10 publica la descripción de la API en <code>/openapi/v1.json</code>. Con Swagger UI o Scalar se convierte en una página para probarla.'],
          ['Postman / Insomnia / Bruno', 'Clientes gráficos con colecciones de pedidos, variables y pruebas.'],
          ['curl', '<code>curl -X POST https://localhost:7001/api/doctors -H "Content-Type: application/json" -d "{…}"</code>'],
        ])}
        ${code('http', `@baseUrl = https://localhost:7001

GET {{baseUrl}}/api/doctors
Accept: application/json

###
POST {{baseUrl}}/api/doctors
Content-Type: application/json

{ "name": "Martín Ruiz", "licenseNumber": "MP-5678", "specialityId": "8b2d4f61-7c3e-4a9b-b0d2-5e6f7a8b9c22" }`, 'Dsw2026Ej15.Api.http')}
        <p>Este cliente REST habla con una versión simulada de la API del EJ15. Mirá el código, los encabezados y el recorrido dentro del servidor:</p>
        ${lab(0)}
        ${lab(1)}
      `,
      labs: [
        {
          type: 'api',
          title: 'Cliente REST: la API de médicos',
          features: { middleware: true, health: true },
          goals: [
            { text: 'Obtener la lista de médicos activos (200)', test: (x) => x.req.method === 'GET' && /\/api\/doctors$/.test(x.req.url) && x.res.status === 200 },
            { text: 'Crear un médico (201 con Location)', test: (x) => x.req.method === 'POST' && x.res.status === 201 },
            { text: 'Provocar un 400 por datos inválidos', test: (x) => x.res.status === 400 },
            { text: 'Provocar un 404', test: (x) => x.res.status === 404 },
            { text: 'Provocar un 405 (verbo no permitido)', test: (x) => x.res.status === 405 },
            { text: 'Dar de baja un médico (204)', test: (x) => x.req.method === 'DELETE' && x.res.status === 204 },
          ],
        },
        {
          type: 'classify',
          title: '¿Qué código de estado corresponde?',
          buckets: ['200', '201', '204', '400', '401', '403', '404', '500'],
          items: [
            { t: 'Se creó un médico nuevo', b: 1, why: 'Created, con el encabezado Location apuntando al recurso.' },
            { t: 'Se dio de baja un médico y no hay nada que devolver', b: 2, why: 'No Content.' },
            { t: 'El JSON del cuerpo no tiene el nombre obligatorio', b: 3, why: 'Error del cliente: datos inválidos.' },
            { t: 'El pedido no trae token y el endpoint requiere autenticación', b: 4, why: 'No sabemos quién es.' },
            { t: 'Un usuario de recepción intenta borrar y solo los administradores pueden', b: 5, why: 'Sabemos quién es, pero no tiene permiso.' },
            { t: 'Se pide un médico con un id que no existe', b: 6, why: 'El recurso no está.' },
            { t: 'La base de datos no responde y el código lanza una excepción', b: 7, why: 'Falla del servidor, no del cliente.' },
            { t: 'Se listan los médicos activos (aunque no haya ninguno)', b: 0, why: 'Una colección vacía sigue siendo un 200 OK.' },
          ],
        },
      ],
      quiz: [
        { q: '¿Qué verbo HTTP corresponde a “crear un médico”?', o: ['GET', 'POST', 'PUT', 'DELETE'], a: 1, e: 'POST crea; PUT reemplaza un recurso existente.' },
        { q: '¿Qué significa que DELETE sea idempotente?', o: ['Que no modifica nada.', 'Que repetirlo deja el mismo estado final que hacerlo una vez.', 'Que no lleva cuerpo.', 'Que siempre devuelve 204.'], a: 1, e: 'El recurso queda borrado igual.' },
        { q: '¿Qué principio de REST implica mandar el token en cada pedido?', o: ['Cacheable', 'Sin estado (stateless)', 'Sistema en capas', 'Interfaz uniforme'], a: 1, e: 'El servidor no guarda sesión entre pedidos.' },
        { q: 'Un usuario autenticado sin permisos intenta una operación. ¿Qué código corresponde?', o: ['401', '403', '404', '400'], a: 1, e: '401 es falta de autenticación; 403, falta de autorización.' },
        { q: '¿Cuál es la URL más RESTful para obtener un médico?', o: ['<code>GET /api/getDoctor?id=5</code>', '<code>GET /api/doctors/5</code>', '<code>POST /api/doctors/get/5</code>', '<code>GET /api/doctor-detail</code>'], a: 1, e: 'Sustantivo en plural y el id en la ruta.' },
        { q: 'Al crear un recurso, la respuesta 201 debería incluir…', o: ['…el encabezado Location con la URL del nuevo recurso.', '…un 404.', '…el encabezado Authorization.', '…nada.'], a: 0, e: 'CreatedAtAction lo genera automáticamente.' },
        { q: '¿Cuál de estos valores NO es JSON válido?', o: ['<code>{"activo": true}</code>', "<code>{'nombre': 'Ana'}</code>", '<code>[1, 2, 3]</code>', '<code>{"x": null}</code>'], a: 1, e: 'JSON exige comillas dobles.' },
      ],
      sources: [
        { title: 'Transferencia de Estado Representacional', url: 'https://es.wikipedia.org/wiki/Transferencia_de_Estado_Representacional', points: ['Definición y origen (Roy Fielding, 2000).', 'Restricciones: cliente-servidor, sin estado, caché, interfaz uniforme, sistema en capas.'] },
        { title: 'Generalidades del protocolo HTTP', url: 'https://developer.mozilla.org/es/docs/Web/HTTP/Overview', points: ['HTTP como protocolo cliente-servidor sin estado.', 'Mensajes de petición y respuesta; sesión en tres fases.'] },
        { title: 'Métodos de petición HTTP', url: 'https://developer.mozilla.org/es/docs/Web/HTTP/Methods', points: ['GET, POST, PUT, PATCH, DELETE y otros.', 'Métodos seguros e idempotentes.'] },
        { title: 'Códigos de estado de respuesta HTTP', url: 'https://developer.mozilla.org/es/docs/Web/HTTP/Status', points: ['Las cinco clases de respuestas.', 'Detalle de cada código.'] },
        { title: 'JSON', url: 'https://es.wikipedia.org/wiki/JSON', points: ['Formato de texto para intercambio de datos, independiente del lenguaje.'] },
      ],
    },

    {
      id: 'aspnet-fundamentos',
      module: 'api',
      title: 'ASP.NET Core: fundamentos',
      keywords: 'asp.net core webapplication builder host kestrel servidor configuracion appsettings json variables de entorno user secrets ioptions entornos development production launchsettings api minimas controladores openapi',
      tldr: 'ASP.NET Core es el framework de .NET para aplicaciones web y APIs: multiplataforma, rápido y con <mark>inyección de dependencias</mark>, <mark>configuración</mark>, <mark>logging</mark> y un <mark>pipeline de middleware</mark> integrados. Todo arranca en <code>Program.cs</code>.',
      goals: [
        'Explicar qué ofrece ASP.NET Core y qué tipos de aplicaciones permite.',
        'Leer un Program.cs: builder, servicios, app y pipeline.',
        'Usar la configuración (appsettings, entornos, variables) y el patrón Options.',
        'Elegir entre API mínima y API con controladores.',
      ],
      body: `
        <h2>Qué es ASP.NET Core</h2>
        <p>Un framework multiplataforma, de código abierto y de alto rendimiento para construir aplicaciones conectadas a internet. Por qué elegirlo:</p>
        <ul>
          <li>Un solo framework para interfaces web y APIs, que corre en Windows, Linux y macOS.</li>
          <li>Inyección de dependencias, configuración por entornos y logging integrados.</li>
          <li>Un servidor web propio, rápido y liviano: <strong>Kestrel</strong>. Puede estar detrás de IIS, Nginx o un balanceador.</li>
          <li>Se despliega en la nube, en contenedores o en servidores propios.</li>
        </ul>
        <p>Con él se pueden hacer APIs web (lo que vas a construir), aplicaciones web con Razor Pages o MVC, aplicaciones Blazor, servicios en tiempo real con SignalR y servicios gRPC.</p>

        <h2>Anatomía de Program.cs</h2>
        ${code('cs', `var builder = WebApplication.CreateBuilder(args);   // 1. host: configuración, logging, DI y Kestrel por defecto

// 2. Servicios (contenedor de inyección de dependencias)
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSingleton<IPersistence, PersistenceInMemory>();

var app = builder.Build();                           // 3. se construye la aplicación

// 4. Pipeline de middleware: el orden importa
if (app.Environment.IsDevelopment())
    app.MapOpenApi();
app.UseHttpsRedirection();
app.UseAuthorization();

// 5. Endpoints
app.MapControllers();

app.Run();                                           // 6. empieza a escuchar pedidos`)}
        ${table(['Concepto', 'Qué es'], [
          ['<strong>Host</strong>', 'El objeto que encapsula los recursos de la app: DI, logging, configuración, el servidor. <code>WebApplication.CreateBuilder</code> crea uno con valores por defecto razonables.'],
          ['<strong>Servidor</strong>', 'Kestrel escucha HTTP en los puertos configurados y entrega cada pedido al pipeline.'],
          ['<strong>Servicios</strong>', 'Lo que se registra en <code>builder.Services</code>: se resuelve por inyección de dependencias.'],
          ['<strong>Middleware</strong>', 'Componentes que procesan cada pedido en orden (próxima lección).'],
          ['<strong>Endpoints</strong>', 'Lo que finalmente responde: acciones de controladores o funciones de API mínimas.'],
        ])}

        <h2>Configuración</h2>
        <p>La configuración se lee de varias fuentes, en este orden (las últimas pisan a las primeras):</p>
        ${flow('appsettings.json', 'appsettings.{Entorno}.json', 'Secretos de usuario (solo Development)', 'Variables de entorno', 'Argumentos de línea de comandos')}
        ${code('json', `{
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "ConnectionStrings": { "Default": "Server=(localdb)\\\\mssqllocaldb;Database=Dsw2026;Trusted_Connection=True" },
  "Jwt": { "Issuer": "https://dsw2026.frt.utn.edu.ar", "Audience": "dsw-api", "ExpireMinutes": 30 }
}`, 'appsettings.json')}
        ${code('cs', `// Leer un valor
string? issuer = builder.Configuration["Jwt:Issuer"];          // las secciones se separan con ":"
string? cs = builder.Configuration.GetConnectionString("Default");

// Patrón Options: enlazar una sección a una clase y pedirla por DI
public class JwtOptions { public string Issuer { get; set; } = ""; public int ExpireMinutes { get; set; } }
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

public class TokenService(IOptions<JwtOptions> options)
{
    private readonly JwtOptions _jwt = options.Value;
}`)}
        ${note('Nunca subas secretos (contraseñas, claves de firma) a Git dentro de appsettings.json. En desarrollo usá secretos de usuario (<code>dotnet user-secrets set "Jwt:Key" "…"</code>); en producción, variables de entorno o un almacén de secretos. En variables de entorno, el separador es doble guion bajo: <code>Jwt__Key</code>.', 'warn')}

        <h2>Entornos</h2>
        <p>La variable <code>ASPNETCORE_ENVIRONMENT</code> define el entorno: <strong>Development</strong>, <strong>Staging</strong> o <strong>Production</strong> (el valor por defecto si no se define). En desarrollo, <code>Properties/launchSettings.json</code> la fija y define los puertos.</p>
        ${code('cs', `if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();               // documentación solo en desarrollo
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}`)}

        <h2>Dos estilos de API</h2>
        ${code('cs', `// API mínima: el endpoint es una función
app.MapGet("/api/specialities", (IPersistence p) => Results.Ok(p.GetSpecialities()));

// API con controladores: clases con acciones (lo que usa la cátedra)
[ApiController]
[Route("api/specialities")]
public class SpecialitiesController(IPersistence persistence) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() => Ok(persistence.GetSpecialities());
}`)}
        ${table(['', 'API mínima', 'Controladores'], [
          ['Código', 'Muy poco; todo en Program.cs o en métodos de extensión', 'Clases organizadas por recurso'],
          ['Ideal para', 'Microservicios chicos y prototipos', 'APIs medianas y grandes, equipos'],
          ['Funciones', 'Casi todas (filtros, validación, OpenAPI)', 'Todas: filtros, model binding, convenciones, [ApiController]'],
        ])}
        <p>Para el logging, que también es un servicio integrado, hay una lección propia más adelante.</p>
      `,
      quiz: [
        { q: '¿Cuál es el servidor web incluido en ASP.NET Core?', o: ['IIS', 'Kestrel', 'Apache', 'Tomcat'], a: 1, e: 'Kestrel; puede estar detrás de IIS o Nginx.' },
        { q: 'En Program.cs, ¿dónde se registran los servicios para inyección de dependencias?', o: ['En <code>app.Use…</code>', 'En <code>builder.Services</code>, antes de <code>Build()</code>', 'En <code>app.Run()</code>', 'En appsettings.json'], a: 1, e: 'Después de Build() se configura el pipeline.' },
        { q: '¿Qué fuente de configuración tiene prioridad?', o: ['appsettings.json', 'appsettings.Development.json', 'Las variables de entorno', 'Todas igual'], a: 2, e: 'Las fuentes posteriores pisan a las anteriores.' },
        { q: '¿Cuál es el entorno por defecto si no se define ASPNETCORE_ENVIRONMENT?', o: ['Development', 'Staging', 'Production', 'Test'], a: 2, e: 'Por seguridad, si no se dice nada, es producción.' },
        { q: '¿Cómo se lee <code>{"Jwt": {"Issuer": "x"}}</code> desde IConfiguration?', o: ['<code>Configuration["Jwt.Issuer"]</code>', '<code>Configuration["Jwt:Issuer"]</code>', '<code>Configuration["Jwt/Issuer"]</code>', '<code>Configuration.Jwt.Issuer</code>'], a: 1, e: 'Las secciones se separan con dos puntos.' },
        { q: '¿Dónde NO deberías guardar la clave de firma de los JWT?', o: ['En secretos de usuario durante el desarrollo.', 'En una variable de entorno en producción.', 'En appsettings.json subido a GitHub.', 'En un almacén de secretos.'], a: 2, e: 'Cualquiera con acceso al repositorio podría firmar tokens.' },
      ],
      sources: [
        { title: 'Introducción a ASP.NET Core', url: 'https://learn.microsoft.com/es-es/aspnet/core/introduction-to-aspnet-core', points: ['Características y por qué elegir ASP.NET Core.', 'Tipos de aplicaciones: web, API, tiempo real, Blazor.'] },
        { title: 'Información general sobre los aspectos básicos de ASP.NET Core', url: 'https://learn.microsoft.com/es-es/aspnet/core/fundamentals/', points: ['Program.cs, inyección de dependencias, middleware, host, servidores.', 'Configuración, entornos y logging.'] },
        { title: 'Configuración en ASP.NET Core', url: 'https://learn.microsoft.com/es-es/aspnet/core/fundamentals/configuration/', points: ['Orígenes de configuración predeterminados y su orden.', 'Acceso a la configuración con DI y en Program.cs; patrón Options.'] },
        { title: 'Uso de varios entornos', url: 'https://learn.microsoft.com/es-es/aspnet/core/fundamentals/environments', points: ['ASPNETCORE_ENVIRONMENT y launchSettings.json.', 'IsDevelopment, IsProduction.'] },
        { title: 'Host genérico de .NET en ASP.NET Core', url: 'https://learn.microsoft.com/es-es/aspnet/core/fundamentals/host/generic-host', points: ['Qué configura el host por defecto.', 'Servicios que proporciona el framework.'] },
      ],
    },

    {
      id: 'di-aspnet',
      module: 'api',
      title: 'Inyección de dependencias en ASP.NET Core',
      keywords: 'inyeccion de dependencias di transient scoped singleton ciclo de vida duracion registro addscoped addsingleton addtransient constructor controladores fromservices dependencia cautiva captive validacion de ambito',
      tldr: 'ASP.NET Core trae un contenedor de DI incorporado. Registrás cada servicio con un <mark>ciclo de vida</mark> (Transient, Scoped o Singleton) y el framework se lo inyecta por constructor a controladores, middleware y otros servicios.',
      goals: [
        'Elegir el ciclo de vida correcto para cada servicio.',
        'Inyectar servicios en controladores y en otros servicios.',
        'Detectar una dependencia cautiva.',
      ],
      body: `
        <h2>Ciclos de vida</h2>
        ${table(['Ciclo de vida', 'Registro', 'Se crea…', 'Ejemplos'], [
          ['<strong>Transient</strong>', '<code>AddTransient</code>', 'Cada vez que se pide al contenedor', 'Servicios livianos sin estado'],
          ['<strong>Scoped</strong>', '<code>AddScoped</code>', 'Una vez por request (por ámbito)', 'El DbContext de EF Core, servicios de aplicación'],
          ['<strong>Singleton</strong>', '<code>AddSingleton</code>', 'Una sola vez para toda la aplicación (la primera vez que se pide)', 'Caché en memoria, configuración, la persistencia en memoria del EJ15'],
        ])}
        <p>Probá cómo cambian las instancias entre requests:</p>
        ${lab(0)}

        <h2>Inyección en controladores y servicios</h2>
        ${code('cs', `// Program.cs
builder.Services.AddSingleton<IPersistence, PersistenceInMemory>();
builder.Services.AddScoped<DoctorService>();

// El contenedor ve que DoctorsController necesita DoctorService,
// que necesita IPersistence… y arma toda la cadena.
public class DoctorsController : ControllerBase
{
    private readonly DoctorService _service;
    public DoctorsController(DoctorService service) => _service = service;
}

// También se puede inyectar en una sola acción
[HttpGet("count")]
public int Count([FromServices] IPersistence persistence) => persistence.GetDoctors().Count();`)}
        <p>Los controladores se crean por request. Si un servicio necesita algo que el contenedor no tiene registrado, la app falla al resolverlo con un <code>InvalidOperationException: Unable to resolve service for type…</code>.</p>

        <h2>Dependencia cautiva</h2>
        <p>Un servicio no debe depender de otro de vida más corta. Si un <strong>Singleton</strong> recibe un <strong>Scoped</strong> por constructor, se queda con esa instancia para siempre: el Scoped “cautivo” sobrevive a su request y, si es un DbContext, termina compartido entre usuarios concurrentes. En Development, ASP.NET Core valida los ámbitos y lanza <code>Cannot consume scoped service … from singleton …</code>.</p>
        ${table(['Puede depender de…', 'Transient', 'Scoped', 'Singleton'], [
          ['<strong>Transient</strong>', 'Sí', 'Sí', 'Sí'],
          ['<strong>Scoped</strong>', 'Sí', 'Sí', 'Sí'],
          ['<strong>Singleton</strong>', 'Con cuidado (queda fijo)', '<strong>No</strong>', 'Sí'],
        ])}
        ${note('Si un Singleton realmente necesita algo Scoped (por ejemplo, un servicio en segundo plano que usa la base), crea un ámbito propio con <code>IServiceScopeFactory.CreateScope()</code>.', 'tip')}
      `,
      labs: [
        {
          type: 'di',
          title: 'Ciclos de vida en acción',
          intro: 'El controlador recibe <code>IDoctorService</code> e <code>IPersistence</code>; <code>DoctorService</code> también recibe <code>IPersistence</code>. Cada request guarda un médico y después cuenta cuántos ve. Probá Transient para la persistencia, después Singleton, y después un servicio Singleton con persistencia Scoped.',
          pers: 'Transient',
          svc: 'Scoped',
        },
      ],
      quiz: [
        { q: '¿Qué ciclo de vida crea una instancia por request HTTP?', o: ['Transient', 'Scoped', 'Singleton', 'Static'], a: 1, e: 'Un ámbito por request.' },
        { q: 'En el EJ15, ¿por qué <code>PersistenceInMemory</code> debe ser Singleton?', o: ['Porque es más rápido.', 'Porque si fuera Scoped o Transient, cada request tendría una lista nueva y vacía.', 'Porque lo exige ASP.NET Core.', 'Porque implementa una interfaz.'], a: 1, e: 'Los datos viven en esa instancia.' },
        { q: '¿Cuál es el ciclo de vida habitual del DbContext de EF Core?', o: ['Singleton', 'Scoped', 'Transient', 'No se registra'], a: 1, e: 'AddDbContext lo registra como Scoped.' },
        { q: 'Un Singleton que recibe un servicio Scoped por constructor es…', o: ['…lo recomendado.', '…una dependencia cautiva: un error.', '…imposible de escribir.', '…igual a dos Singleton.'], a: 1, e: 'El Scoped sobrevive a su request.' },
        { q: '¿Qué pasa si un controlador pide un servicio que no se registró?', o: ['Recibe null.', 'Falla al resolverse con InvalidOperationException.', 'Se crea automáticamente.', 'Se usa un valor por defecto.'], a: 1, e: '“Unable to resolve service for type…”.' },
      ],
      sources: [
        { title: 'Inserción de dependencias en ASP.NET Core', url: 'https://learn.microsoft.com/es-es/aspnet/core/fundamentals/dependency-injection', points: ['Registro de servicios y ciclos de vida (transitorio, con ámbito, singleton).', 'Inyección por constructor; validación de ámbitos en Development.', 'Servicios proporcionados por el framework.'] },
        { title: 'Inserción de dependencias en controladores', url: 'https://learn.microsoft.com/es-es/aspnet/core/mvc/controllers/dependency-injection', points: ['Inyección por constructor en controladores.', 'Inyección en acciones con [FromServices].'] },
      ],
    },

    {
      id: 'controladores',
      module: 'api',
      title: 'Web API con controladores',
      keywords: 'controladores controllerbase apicontroller route atributos httpget httppost httpdelete plantillas de ruta restricciones guid model binding frombody fromroute fromquery iactionresult actionresult ok createdataction nocontent notfound badrequest problemdetails dto record formato json convenciones ej15',
      tldr: 'Un controlador agrupa las acciones de un recurso. Con atributos (<code>[Route]</code>, <code>[HttpGet]</code>…) defino las rutas; con <code>ActionResult&lt;T&gt;</code> devuelvo datos y códigos de estado; con DTOs controlo exactamente qué JSON entra y sale.',
      goals: [
        'Crear un controlador con enrutamiento por atributos y restricciones de ruta.',
        'Recibir datos con model binding (ruta, query, cuerpo).',
        'Devolver el código de estado correcto con los métodos de ControllerBase.',
        'Separar entidades de DTOs.',
        'Resolver el EJ15.',
      ],
      body: `
        <h2>Un controlador</h2>
        ${code('cs', `[ApiController]                       // comportamientos de API (ver abajo)
[Route("api/doctors")]                // ruta base del controlador
public class DoctorsController : ControllerBase   // ControllerBase: sin soporte de vistas
{
    [HttpGet]                         // GET api/doctors
    public ActionResult<IEnumerable<DoctorResponse>> GetAll() { … }

    [HttpGet("{id:guid}")]            // GET api/doctors/3f0c… (solo si es un Guid)
    public ActionResult<DoctorDetailResponse> GetById(Guid id) { … }

    [HttpPost]                        // POST api/doctors
    public ActionResult<DoctorResponse> Create([FromBody] DoctorRequest request) { … }

    [HttpDelete("{id:guid}")]         // DELETE api/doctors/3f0c…
    public IActionResult Delete(Guid id) { … }
}`)}
        <h3>Qué hace [ApiController]</h3>
        <ul>
          <li>Exige enrutamiento por atributos.</li>
          <li>Si el modelo no es válido (JSON mal formado, tipos incorrectos, <code>[Required]</code> sin cumplir) responde <strong>400 automáticamente</strong> con un <code>ValidationProblemDetails</code>, sin llegar a ejecutar la acción.</li>
          <li>Infiere el origen de los parámetros: los tipos complejos vienen del cuerpo; los simples, de la ruta o la query.</li>
          <li>Los errores 4xx se devuelven como <code>ProblemDetails</code> (RFC 9457).</li>
        </ul>

        <h2>Enrutamiento</h2>
        ${table(['Plantilla', 'Coincide con', 'Notas'], [
          ['<code>api/doctors</code>', '<code>/api/doctors</code>', 'Literal'],
          ['<code>api/doctors/{id}</code>', '<code>/api/doctors/abc</code>', 'Parámetro de ruta'],
          ['<code>{id:guid}</code>', 'Solo un Guid válido', 'Restricción: si no coincide, 404'],
          ['<code>{id:int:min(1)}</code>', 'Enteros mayores o iguales a 1', 'Restricciones combinadas'],
          ['<code>{nombre?}</code>', 'Con o sin el segmento', 'Parámetro opcional'],
          ['<code>[controller]</code>', 'El nombre de la clase sin “Controller”', 'Reemplazo de token: <code>api/[controller]</code> → <code>api/Doctors</code>'],
        ])}

        <h2>Model binding: de dónde vienen los datos</h2>
        ${code('cs', `[HttpGet("{id:guid}")]
public IActionResult Get(
    [FromRoute] Guid id,                 // de la URL: /api/doctors/{id}
    [FromQuery] bool includeInactive,    // de la query: ?includeInactive=true
    [FromHeader(Name = "X-Version")] string? version)
{ … }

[HttpPost]
public IActionResult Create([FromBody] DoctorRequest request) { … }   // del JSON del cuerpo`)}

        <h2>Tipos de valor devuelto y códigos de estado</h2>
        ${table(['Método de ControllerBase', 'Código', 'Uso'], [
          ['<code>Ok(datos)</code>', '200', 'Lectura exitosa'],
          ['<code>CreatedAtAction(nameof(GetById), new { id }, datos)</code>', '201', 'Creación: agrega el encabezado Location'],
          ['<code>NoContent()</code>', '204', 'Éxito sin cuerpo (DELETE, PUT)'],
          ['<code>BadRequest(mensaje)</code>', '400', 'Datos inválidos'],
          ['<code>Unauthorized()</code> / <code>Forbid()</code>', '401 / 403', 'Seguridad'],
          ['<code>NotFound()</code>', '404', 'No existe'],
          ['<code>Problem(…)</code>', '500 (u otro)', 'Error con ProblemDetails'],
        ])}
        <p><code>ActionResult&lt;T&gt;</code> permite devolver tanto un <code>T</code> (que se envuelve en 200) como cualquier resultado anterior, y documenta el tipo en OpenAPI. <code>IActionResult</code> se usa cuando no hay un tipo de datos (como en un DELETE).</p>

        <h2>DTOs: no expongas tus entidades</h2>
        <p>Un <strong>DTO</strong> (objeto de transferencia de datos) define exactamente el contrato de la API. Devolver entidades directamente expone datos internos, acopla el JSON a la base y puede provocar ciclos de serialización (un médico con su especialidad que tiene sus médicos…). Los records son ideales:</p>
        ${code('cs', `public record DoctorRequest(string? Name, string? LicenseNumber, Guid SpecialityId);
public record DoctorResponse(Guid Id, string Name, string LicenseNumber, string SpecialityName);`)}

        <h2>Formato de la respuesta</h2>
        <p>Por defecto la respuesta es JSON con propiedades en camelCase. Se puede configurar:</p>
        ${code('cs', `builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());   // enums como texto
        o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });`)}

        <h2>Practicá el EJ15</h2>
        <p>Cumplí cada objetivo con el cliente. Fijate el recorrido: el controlador delega en el servicio, que valida y usa la persistencia.</p>
        ${lab(0)}
      `,
      labs: [
        {
          type: 'api',
          title: 'Los cuatro endpoints del EJ15',
          features: { middleware: true, health: true },
          goals: [
            { text: 'POST válido: 201 Created', test: (x) => x.req.method === 'POST' && /doctors$/.test(x.req.url) && x.res.status === 201 },
            { text: 'POST sin nombre: 400 con el motivo', test: (x) => x.req.method === 'POST' && x.res.status === 400 && /nombre/i.test(JSON.stringify(x.res.body)) },
            { text: 'POST con especialidad inexistente: 400', test: (x) => x.req.method === 'POST' && x.res.status === 400 && /especialidad/i.test(JSON.stringify(x.res.body)) },
            { text: 'GET por id de un médico activo: 200 con name, licenseNumber y specialityName', test: (x) => x.req.method === 'GET' && /doctors\/[0-9a-f-]{36}$/i.test(x.req.url) && x.res.status === 200 },
            { text: 'DELETE: 204 No Content', test: (x) => x.req.method === 'DELETE' && x.res.status === 204 },
            { text: 'GET por id del médico dado de baja: 404', test: (x, log) => x.req.method === 'GET' && x.res.status === 404 && log.some((y) => y.req.method === 'DELETE' && y.res.status === 204 && y.req.url === x.req.url) },
            { text: 'Sondeo de estado en /health-check', test: (x) => /health-check/.test(x.req.url) && x.res.status === 200 },
          ],
        },
      ],
      exercises: [
        {
          official: 'N° 15',
          level: 3,
          title: 'API de médicos y especialidades (2 integrantes)',
          prompt: `<p>Desarrollar una API Web con controladores en .NET:</p>
            <ul>
              <li>Solución <code>Dsw2026Ej15</code> con los proyectos <code>Api</code> (servicios distribuidos), <code>Domain</code> y <code>Data</code>.</li>
              <li>Entidades: <code>Speciality</code> (Name, Description), <code>Doctor</code> (Name, LicenseNumber, IsActive, Speciality) y la base abstracta <code>BaseEntity</code> (Id Guid).</li>
              <li><code>PersistenceInMemory</code> (Singleton) implementa <code>IPersistence</code>, mantiene médicos y especialidades durante la ejecución y carga las especialidades de un JSON con un método privado <code>LoadSpecialities()</code>.</li>
              <li><code>DoctorsController</code>: <code>POST api/doctors</code> (name y licenseNumber requeridos, specialityId debe existir, se crea activo, 201 o 400 con el motivo); <code>GET api/doctors</code> (activos, 200 aunque esté vacío); <code>GET api/doctors/{id}</code> (Name, LicenseNumber, SpecialityName; 404 si no existe o no está activo); <code>DELETE api/doctors/{id}</code> (lo marca inactivo, 204 o 404).</li>
              <li>Las validaciones lanzan <code>ValidationException</code>. Un middleware devuelve 400 para esas excepciones y 500 para cualquier otra.</li>
              <li>Sondeo de estado básico en <code>/health-check</code>.</li>
              <li>Trabajar en development y actualizar main con un pull request.</li>
            </ul>`,
          hints: ['El orden de las referencias: Data → Domain y Api → Domain y Data. Domain no referencia a nadie.', 'El JSON del archivo de especialidades tiene que copiarse a la carpeta de salida (propiedad <code>CopyToOutputDirectory</code>).', 'El 201 con <code>CreatedAtAction</code> necesita el nombre de la acción GET por id.', 'El middleware de excepciones tiene que ser el primero del pipeline para atrapar todo lo que pase después.', 'Ojo: si registrás la persistencia como Scoped o Transient, los médicos desaparecen entre requests.'],
          solution: sol(`<p>Solución compilada con .NET 10 y probada con pedidos reales (resultados al final). Decisiones de diseño:</p>
            <ul>
              <li><strong>Domain</strong> contiene entidades, la interfaz de persistencia, la excepción y el servicio con las reglas (validaciones y “se crea activo”). No sabe nada de HTTP.</li>
              <li><strong>Data</strong> solo implementa <code>IPersistence</code>. Como es Singleton y puede recibir pedidos concurrentes, protege la lista con un <code>lock</code>.</li>
              <li><strong>Api</strong> traduce HTTP ↔ dominio: DTOs, códigos de estado y el middleware que convierte excepciones en 400/500.</li>
              <li><code>UpdateDoctor</code> no hace nada en memoria (el objeto ya cambió por referencia), pero la interfaz lo necesita para el EJ16, donde EF Core sí tiene que guardar.</li>
            </ul>`, EJ15_FILES),
        },
      ],
      quiz: [
        { q: '¿Qué hace <code>[ApiController]</code> cuando el JSON del cuerpo está mal formado?', o: ['Ejecuta la acción con null.', 'Responde 400 automáticamente sin ejecutar la acción.', 'Lanza una excepción 500.', 'Lo ignora.'], a: 1, e: 'Validación automática del modelo.' },
        { q: '<code>[HttpGet("{id:guid}")]</code> y se pide <code>/api/doctors/abc</code>. ¿Qué pasa?', o: ['Se ejecuta con un Guid vacío.', 'Ninguna ruta coincide: 404.', '400 automático.', '500.'], a: 1, e: 'La restricción de ruta no se cumple.' },
        { q: '¿Qué método devuelve 201 con el encabezado Location?', o: ['Ok()', 'CreatedAtAction(...)', 'NoContent()', 'Accepted()'], a: 1, e: 'Necesita la acción que obtiene el recurso creado.' },
        { q: '¿De dónde toma <code>[FromQuery] bool includeInactive</code> su valor?', o: ['Del cuerpo JSON.', 'De la URL después de ?', 'De un encabezado.', 'De la ruta.'], a: 1, e: '/api/doctors?includeInactive=true' },
        { q: '¿Por qué conviene devolver DTOs y no las entidades?', o: ['Porque las entidades no se pueden serializar.', 'Para controlar el contrato, no exponer datos internos y evitar ciclos.', 'Porque es más rápido.', 'Porque lo exige [ApiController].'], a: 1, e: 'El JSON no debería cambiar cuando cambia la base.' },
        { q: 'En el EJ15, un GET de todos los médicos activos cuando no hay ninguno debe devolver…', o: ['404', '204', '200 con una lista vacía', '400'], a: 2, e: 'La colección existe aunque esté vacía.' },
      ],
      sources: [
        { title: 'Creación de API web con ASP.NET Core', url: 'https://learn.microsoft.com/es-es/aspnet/core/web-api/', points: ['ControllerBase y el atributo [ApiController].', 'Inferencia del origen de parámetros y respuestas 400 automáticas.', 'Detalles del problema (ProblemDetails) para errores.'] },
        { title: 'Enrutamiento en ASP.NET Core', url: 'https://learn.microsoft.com/es-es/aspnet/core/fundamentals/routing', points: ['Plantillas de ruta, parámetros y restricciones.', 'Reemplazo de tokens [controller] y [action].'] },
        { title: 'Tipos de valor devueltos de acción de controlador', url: 'https://learn.microsoft.com/es-es/aspnet/core/web-api/action-return-types', points: ['Tipo específico, IActionResult y ActionResult<T>.', 'Resultados con código de estado.'] },
        { title: 'Formato de datos de respuesta', url: 'https://learn.microsoft.com/es-es/aspnet/core/web-api/advanced/formatting', points: ['Formateadores JSON con System.Text.Json; configuración.'] },
      ],
    },

    {
      id: 'middleware-errores',
      module: 'api',
      title: 'Middleware, manejo de errores y health checks',
      keywords: 'middleware pipeline canalizacion use run map next orden request delegate invokeasync middleware personalizado excepciones useexceptionhandler iexceptionhandler problemdetails health checks sondeo de estado mapHealthChecks ihealthcheck',
      tldr: 'Cada pedido atraviesa una <mark>cadena de middleware</mark>: cada uno hace algo antes, llama al siguiente y hace algo después. El <mark>orden</mark> en <code>Program.cs</code> define el comportamiento, incluida la seguridad.',
      goals: [
        'Explicar cómo se ejecuta el pipeline y por qué importa el orden.',
        'Escribir middleware con Use, Run y Map, y como clase.',
        'Centralizar el manejo de errores con middleware o IExceptionHandler.',
        'Agregar sondeos de estado (health checks).',
      ],
      body: `
        <h2>El pipeline</h2>
        <p>Un middleware es un componente que se ensambla en la canalización de la aplicación. Cada uno elige si pasa el pedido al siguiente y puede trabajar antes y después de él. Se ejecutan en el orden en que se agregan para el pedido, y en orden inverso para la respuesta: como capas de una cebolla.</p>
        ${code('cs', `app.Use(async (context, next) =>
{
    Console.WriteLine($"→ {context.Request.Method} {context.Request.Path}");   // antes
    await next(context);                                                      // el resto del pipeline
    Console.WriteLine($"← {context.Response.StatusCode}");                    // después
});

app.Map("/ping", rama => rama.Run(async ctx => await ctx.Response.WriteAsync("pong")));   // rama

app.Run(async context => await context.Response.WriteAsync("Hola"));   // terminal: no llama a next`)}
        ${table(['Método', 'Qué hace'], [
          ['<code>Use</code>', 'Agrega middleware que puede llamar al siguiente (<code>next</code>) o cortocircuitar.'],
          ['<code>Run</code>', 'Agrega middleware <strong>terminal</strong>: nunca llama al siguiente.'],
          ['<code>Map</code> / <code>MapWhen</code>', 'Crea una rama del pipeline según la ruta o una condición.'],
        ])}
        <p>Cuando un middleware no llama a <code>next</code>, <strong>cortocircuita</strong> la cadena: por ejemplo, archivos estáticos que ya encontraron el archivo, o autorización que responde 401.</p>

        <h2>El orden importa</h2>
        <p>Microsoft recomienda este orden para una API:</p>
        ${flow('Manejo de excepciones', 'HSTS (producción)', 'Redirección HTTPS', 'Routing', 'CORS', 'Autenticación', 'Autorización', 'Middleware propio', 'Endpoints (controladores)')}
        <p>Reordená el pipeline y mirá qué pasa con cada tipo de pedido:</p>
        ${lab(0)}
        ${note('Dos errores clásicos: poner <code>UseAuthorization</code> antes de <code>UseAuthentication</code> (todos quedan anónimos y reciben 401 aunque el token sea válido), y poner el manejo de excepciones al final (no atrapa los errores de lo que está antes).', 'exam')}

        <h2>Middleware como clase</h2>
        ${code('cs', `public class RequestTimingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestTimingMiddleware> _logger;

    // Constructor: RequestDelegate + servicios Singleton
    public RequestTimingMiddleware(RequestDelegate next, ILogger<RequestTimingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    // Se ejecuta en cada pedido. Servicios Scoped: como parámetros de InvokeAsync
    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        await _next(context);
        _logger.LogInformation("{Path} tardó {Ms} ms", context.Request.Path, sw.ElapsedMilliseconds);
    }
}

app.UseMiddleware<RequestTimingMiddleware>();`)}
        <p>El middleware se crea <strong>una sola vez</strong> al iniciar la aplicación: por eso los servicios Scoped (como un DbContext) no se reciben por constructor sino como parámetros de <code>InvokeAsync</code>.</p>

        <h2>Manejo de errores</h2>
        <p>Sin manejo, una excepción no atrapada termina en un 500 con poca información (o, en Development, con la página de excepciones para desarrolladores, que nunca debe verse en producción). Hay dos formas de centralizarlo:</p>
        <h3>1. Middleware propio (lo que pide el EJ15)</h3>
        ${code('cs', `public async Task InvokeAsync(HttpContext context)
{
    try
    {
        await _next(context);
    }
    catch (ValidationException ex)
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        await context.Response.WriteAsJsonAsync(new ProblemDetails { Status = 400, Title = "Bad Request", Detail = ex.Message });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error no controlado");
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsJsonAsync(new ProblemDetails { Status = 500, Title = "Internal Server Error" });
    }
}`)}
        <h3>2. IExceptionHandler (.NET 8 en adelante)</h3>
        ${code('cs', `public class ValidationExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        if (ex is not ValidationException) return false;   // que lo maneje otro
        ctx.Response.StatusCode = 400;
        await ctx.Response.WriteAsJsonAsync(new ProblemDetails { Status = 400, Detail = ex.Message }, ct);
        return true;
    }
}

builder.Services.AddExceptionHandler<ValidationExceptionHandler>();
builder.Services.AddProblemDetails();
app.UseExceptionHandler();`)}
        <p>En ambos casos la respuesta usa <strong>ProblemDetails</strong> (RFC 9457): un formato JSON estándar para errores HTTP con <code>type</code>, <code>title</code>, <code>status</code> y <code>detail</code>.</p>
        <p>Probá el cliente con y sin el middleware, y simulando una caída del almacenamiento:</p>
        ${lab(1)}

        <h2>Health checks</h2>
        <p>Un sondeo de estado es un endpoint que informa si la aplicación (y sus dependencias) funciona. Los usan los balanceadores y orquestadores (Kubernetes) para decidir si mandarle tráfico o reiniciarla.</p>
        ${code('cs', `builder.Services.AddHealthChecks()
    .AddCheck<PersistenceHealthCheck>("persistencia");     // comprobación propia

app.MapHealthChecks("/health-check");                       // responde Healthy, Degraded o Unhealthy

public class PersistenceHealthCheck(IPersistence persistence) : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        try
        {
            persistence.GetDoctors();
            return Task.FromResult(HealthCheckResult.Healthy());
        }
        catch (Exception ex)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("No se puede leer la persistencia", ex));
        }
    }
}`)}
        <p>Un sondeo básico (sin comprobaciones agregadas) responde <code>200 Healthy</code> si la app puede atender pedidos. Si alguna comprobación falla, responde <code>503 Unhealthy</code>.</p>
      `,
      labs: [
        {
          type: 'pipeline',
          title: 'Reordenar el pipeline',
          intro: 'Subí, bajá, activá o desactivá middleware. Probá: autorización antes que autenticación; autorización antes que routing; sin manejo de excepciones con el pedido que explota; un app.Run al principio.',
        },
        {
          type: 'api',
          title: 'Errores con y sin middleware',
          intro: 'Este cliente tiene un interruptor para simular que el almacenamiento falla. Hacé un GET de médicos con la falla activada.',
          features: { middleware: true, health: true, dbToggle: true },
        },
      ],
      quiz: [
        { q: '¿En qué orden se ejecuta el middleware para la respuesta?', o: ['En el mismo orden que para el pedido.', 'En orden inverso.', 'Al azar.', 'Solo el último procesa la respuesta.'], a: 1, e: 'Como capas de una cebolla.' },
        { q: '¿Qué diferencia a <code>app.Run</code> de <code>app.Use</code>?', o: ['Run es asincrónico.', 'Run es terminal: nunca llama al siguiente middleware.', 'Use no puede escribir la respuesta.', 'No hay diferencia.'], a: 1, e: 'Todo lo que se agregue después de Run no se ejecuta para ese pedido.' },
        { q: 'Si <code>UseAuthorization</code> está antes que <code>UseAuthentication</code>, un pedido con token válido a un endpoint con [Authorize]…', o: ['…se atiende normalmente.', '…recibe 401: cuando se autoriza, todavía nadie leyó el token.', '…recibe 500.', '…se redirige a https.'], a: 1, e: 'El orden importa.' },
        { q: '¿Por qué el middleware de excepciones va primero?', o: ['Por rendimiento.', 'Para envolver a todo lo que viene después y atrapar sus excepciones.', 'Porque lo exige el compilador.', 'Para que se ejecute una sola vez.'], a: 1, e: 'Solo atrapa lo que ocurre “dentro” de su llamada a next.' },
        { q: 'Un middleware escrito como clase se crea…', o: ['…en cada pedido.', '…una sola vez al iniciar la aplicación.', '…una vez por usuario.', '…nunca.'], a: 1, e: 'Por eso los servicios Scoped van como parámetros de InvokeAsync.' },
        { q: '¿Qué responde un health check si una de sus comprobaciones falla?', o: ['200 Healthy', '503 Unhealthy', '404', '401'], a: 1, e: 'Así el balanceador deja de mandarle tráfico.' },
      ],
      sources: [
        { title: 'Middleware de ASP.NET Core', url: 'https://learn.microsoft.com/es-es/aspnet/core/fundamentals/middleware/', points: ['Canalización con Use, Run y Map; cortocircuito.', 'Orden recomendado del middleware y middleware integrado.'] },
        { title: 'Escritura de middleware personalizado', url: 'https://learn.microsoft.com/es-es/aspnet/core/fundamentals/middleware/write', points: ['Clase con RequestDelegate e InvokeAsync.', 'Dependencias por constructor (singleton) y por InvokeAsync (scoped).'] },
        { title: 'Control de errores en las API web', url: 'https://learn.microsoft.com/es-es/aspnet/core/web-api/handle-errors', points: ['Página de excepciones para desarrolladores.', 'Controlador de excepciones, IExceptionHandler y ProblemDetails.'] },
        { title: 'Comprobaciones de estado en ASP.NET Core', url: 'https://learn.microsoft.com/es-es/aspnet/core/host-and-deploy/health-checks', points: ['Sondeo de estado básico con MapHealthChecks.', 'Comprobaciones personalizadas con IHealthCheck y sus opciones.'] },
      ],
    },
  );
})();
