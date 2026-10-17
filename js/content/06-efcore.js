/* Módulo: Persistencia con Entity Framework Core (Unidad 3, clases 22 y 23) */
(() => {
  const { code, table, note, lab, fig, sol, flow } = window.GUIDE.h;

  window.GUIDE.LESSONS.push(
    {
      id: 'ef-modelo',
      module: 'ef',
      title: 'ORM, DbContext y el modelo',
      keywords: 'orm mapeo objeto relacional entity framework core ef dbcontext dbset modelo convenciones data annotations fluent api onmodelcreating tipos de entidad propiedades claves hasKey hasmaxlength isrequired migraciones dotnet ef database update cadena de conexion sql server sqlite ej16',
      tldr: 'Un <mark>ORM</mark> traduce entre objetos C# y tablas relacionales. En EF Core, el <mark>DbContext</mark> es tu sesión con la base: expone un <code>DbSet</code> por entidad, traduce LINQ a SQL y guarda los cambios. El <mark>modelo</mark> se configura por convenciones, atributos o Fluent API, y las <mark>migraciones</mark> crean y actualizan el esquema.',
      goals: [
        'Explicar qué problema resuelve un ORM.',
        'Instalar EF Core, crear un DbContext y registrarlo en ASP.NET Core.',
        'Configurar entidades, propiedades y claves con convenciones, Data Annotations y Fluent API.',
        'Crear y aplicar migraciones.',
        'Resolver el EJ16.',
      ],
      body: `
        <h2>El desajuste objeto-relacional</h2>
        <p>En C# pensás en objetos con referencias (<code>doctor.Speciality.Name</code>), herencia y colecciones. La base relacional piensa en tablas, filas, claves foráneas y JOIN. Traducir a mano entre ambos mundos (escribir SQL, leer filas, armar objetos) es repetitivo y propenso a errores. Un <strong>ORM</strong> (mapeador objeto-relacional) automatiza esa traducción.</p>
        <p><strong>Entity Framework Core</strong> es el ORM oficial de .NET: liviano, multiplataforma y con proveedores para SQL Server, SQLite, PostgreSQL, MySQL, Cosmos DB y más.</p>
        ${table(['Mundo de objetos', 'Mundo relacional'], [
          ['Clase entidad (<code>Doctor</code>)', 'Tabla (<code>Doctors</code>)'],
          ['Propiedad (<code>Name</code>)', 'Columna'],
          ['Instancia', 'Fila'],
          ['Referencia (<code>doctor.Speciality</code>)', 'Clave foránea + JOIN'],
          ['LINQ (<code>Where</code>, <code>OrderBy</code>)', 'SQL (<code>WHERE</code>, <code>ORDER BY</code>)'],
        ])}

        <h2>Instalación</h2>
        ${code('bash', `# En el proyecto de infraestructura (Data): el proveedor de base de datos
dotnet add Dsw2026Ej15.Data package Microsoft.EntityFrameworkCore.SqlServer
# (o Microsoft.EntityFrameworkCore.Sqlite para una base en un archivo)

# En el proyecto de inicio (Api): herramientas de diseño para las migraciones
dotnet add Dsw2026Ej15.Api package Microsoft.EntityFrameworkCore.Design

# La herramienta de línea de comandos, una sola vez por computadora
dotnet tool install --global dotnet-ef`)}
        <p>Con Visual Studio también podés usar la Consola del Administrador de paquetes (<code>Add-Migration</code>, <code>Update-Database</code>). Los comandos son equivalentes.</p>

        <h2>El DbContext</h2>
        ${code('cs', `public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Doctor> Doctors => Set<Doctor>();            // una tabla consultable
    public DbSet<Speciality> Specialities => Set<Speciality>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // configuración con Fluent API (ver abajo)
    }
}

// Program.cs: se registra como Scoped (una instancia por request)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));`)}
        <p>Un DbContext representa una <strong>unidad de trabajo</strong>: se crea, se usa para un conjunto de operaciones y se descarta. Por eso su ciclo de vida es Scoped: uno por request. No es seguro usar la misma instancia desde dos hilos a la vez.</p>
        ${code('json', `{
  "ConnectionStrings": {
    "Default": "Server=(localdb)\\\\mssqllocaldb;Database=Dsw2026Ej16;Trusted_Connection=True;TrustServerCertificate=True"
  }
}`, 'appsettings.json (SQL Server LocalDB)')}

        <h2>Crear y configurar el modelo</h2>
        <p>EF Core construye el modelo en tres niveles, de menor a mayor prioridad:</p>
        ${table(['Mecanismo', 'Ejemplo', 'Comentario'], [
          ['<strong>Convenciones</strong>', 'Una propiedad <code>Id</code> o <code>DoctorId</code> es la clave; un <code>string</code> que no acepta null es obligatorio', 'Sin escribir nada'],
          ['<strong>Data Annotations</strong>', '<code>[Required]</code>, <code>[MaxLength(100)]</code>, <code>[Table("Doctors")]</code> sobre la clase', 'Simple, pero ensucia el dominio con detalles de la base'],
          ['<strong>Fluent API</strong>', '<code>modelBuilder.Entity&lt;Doctor&gt;().Property(d =&gt; d.Name).HasMaxLength(100)</code>', 'Más poderosa; mantiene el dominio limpio. <strong>Tiene prioridad</strong>'],
        ])}
        ${code('cs', `protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Speciality>(e =>
    {
        e.ToTable("Specialities");                            // tipo de entidad → tabla
        e.HasKey(s => s.Id);                                  // clave primaria
        e.Property(s => s.Name).IsRequired().HasMaxLength(60);
        e.Property(s => s.Description).HasMaxLength(250);
    });

    modelBuilder.Entity<Doctor>(e =>
    {
        e.ToTable("Doctors");
        e.HasKey(d => d.Id);
        e.Property(d => d.Name).IsRequired().HasMaxLength(100);
        e.Property(d => d.LicenseNumber).IsRequired().HasMaxLength(20);
        e.HasIndex(d => d.LicenseNumber).IsUnique();          // índice único
        e.HasOne(d => d.Speciality).WithMany()                // relación (próxima lección)
         .HasForeignKey("SpecialityId").IsRequired();
    });

    // Otras opciones frecuentes
    // e.Property(p => p.Price).HasPrecision(18, 2);          // decimal
    // e.Ignore(p => p.PrecioConIva);                         // no se guarda
    // e.HasKey(x => new { x.PedidoId, x.ProductoId });       // clave compuesta
}`)}
        <p>Si el modelo crece, cada configuración puede ir en su propia clase que implementa <code>IEntityTypeConfiguration&lt;T&gt;</code>, y se cargan todas con <code>modelBuilder.ApplyConfigurationsFromAssembly(...)</code>.</p>
        ${note('EF Core necesita poder crear las entidades. Si tus constructores reciben objetos (como <code>Doctor(name, license, Speciality speciality)</code>), agregá un constructor privado sin parámetros: EF lo usa y asigna las propiedades, aunque tengan <code>private set</code>. Tu dominio sigue protegido.', 'tip')}

        <h2>Migraciones</h2>
        <p>Una migración es una clase generada que describe cómo pasar el esquema de la base de una versión del modelo a la siguiente (y cómo volver). Se versionan con el código en Git.</p>
        ${code('bash', `# -p: proyecto donde está el DbContext / -s: proyecto de inicio (con la configuración)
dotnet ef migrations add Initial -p Dsw2026Ej15.Data -s Dsw2026Ej15.Api
dotnet ef database update -s Dsw2026Ej15.Api           # aplica las pendientes
dotnet ef migrations remove -p Dsw2026Ej15.Data -s Dsw2026Ej15.Api   # quita la última (si no se aplicó)
dotnet ef migrations script -s Dsw2026Ej15.Api         # genera el SQL para un DBA`)}
        ${code('cs', `migrationBuilder.CreateTable(
    name: "Doctors",
    columns: table => new
    {
        Id = table.Column<Guid>(nullable: false),
        Name = table.Column<string>(maxLength: 100, nullable: false),
        LicenseNumber = table.Column<string>(maxLength: 20, nullable: false),
        IsActive = table.Column<bool>(nullable: false),
        SpecialityId = table.Column<Guid>(nullable: false)
    },
    constraints: table =>
    {
        table.PrimaryKey("PK_Doctors", x => x.Id);
        table.ForeignKey("FK_Doctors_Specialities_SpecialityId", x => x.SpecialityId,
            "Specialities", "Id", onDelete: ReferentialAction.Restrict);
    });`, 'Fragmento real de la migración generada')}
        ${lab(0)}
      `,
      labs: [
        {
          type: 'classify',
          title: 'Convención, Data Annotation o Fluent API',
          buckets: ['Convención (automático)', 'Data Annotation', 'Fluent API'],
          items: [
            { t: 'La propiedad <code>Id</code> se convierte en clave primaria', b: 0, why: 'EF busca Id o NombreDeClaseId.' },
            { t: '<code>[MaxLength(100)] public string Name { get; set; }</code>', b: 1, why: 'Un atributo sobre la propiedad.' },
            { t: '<code>e.HasIndex(d =&gt; d.LicenseNumber).IsUnique()</code>', b: 2, why: 'Configuración en OnModelCreating.' },
            { t: 'Un <code>string</code> que no acepta null se crea como columna NOT NULL', b: 0, why: 'Con tipos de referencia que no aceptan null habilitados.' },
            { t: '<code>[Table("Medicos")]</code> sobre la clase', b: 1, why: 'Atributo de esquema.' },
            { t: '<code>e.Property(p =&gt; p.Price).HasPrecision(18, 2)</code>', b: 2, why: 'También existe [Precision], pero así está escrito con Fluent API.' },
          ],
        },
      ],
      exercises: [
        {
          official: 'N° 16',
          level: 3,
          title: 'Persistencia con Entity Framework sobre el EJ15',
          prompt: `<p>Sobre el repositorio del EJ15, cada integrante crea desde main una rama <code>feature/persistencia-db-{legajo}</code>:</p>
            <ol>
              <li>Agregar las bibliotecas y la configuración para gestionar la persistencia con Entity Framework Core 10.</li>
              <li>Crear la clase <code>PersistenceEf</code> que implemente <code>IPersistence</code> y completar los métodos para acceder a la base de datos.</li>
            </ol>
            <p>Trabajo individual: al final el repositorio tiene una rama por integrante.</p>`,
          hints: ['Si la interfaz quedó bien diseñada en el EJ15, ni el dominio ni el controlador cambian: solo se agrega una implementación y se cambia una línea en Program.cs.', 'El DbContext es Scoped: la nueva persistencia también tiene que serlo (no Singleton).', 'Para cargar el médico con su especialidad, Include.', 'Para la baja lógica: buscá con seguimiento, cambiá IsActive y llamá a SaveChanges.', '¿Cómo se cargan las especialidades del JSON? Con <code>HasData</code> en una migración, o con <code>UseSeeding</code> (EF Core 9+).'],
          solution: sol(`<p>Probado con .NET 10 y EF Core 10 (con SQLite; con SQL Server solo cambia <code>UseSqlite</code> por <code>UseSqlServer</code> y la cadena de conexión). Resultados: los médicos persisten después de reiniciar la API; el GET genera un único <code>SELECT … INNER JOIN Specialities</code>; la baja lógica genera <code>UPDATE "Doctors" SET "IsActive" = @p0</code>.</p>
            <p>Gracias a la inversión de dependencias del EJ15, <strong>el dominio y el controlador no cambian</strong>: cambia la implementación de <code>IPersistence</code> y una línea del composition root. Ese es el beneficio concreto de Clean Architecture.</p>
            <p>Mejora sugerida: con el índice único sobre la matrícula, crear un médico con una matrícula repetida hace fallar <code>SaveChanges</code> y la API responde 500. Conviene validarlo en <code>DoctorService</code> y lanzar <code>ValidationException</code> para responder 400.</p>`, [
            ['Comandos', 'bash', `git switch main
git switch -c feature/persistencia-db-51234
dotnet add Dsw2026Ej15.Data package Microsoft.EntityFrameworkCore.SqlServer
dotnet add Dsw2026Ej15.Api package Microsoft.EntityFrameworkCore.Design
dotnet ef migrations add Initial -p Dsw2026Ej15.Data -s Dsw2026Ej15.Api
dotnet ef database update -s Dsw2026Ej15.Api`],
            ['Data/AppDbContext.cs', 'cs', `using Dsw2026Ej15.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dsw2026Ej15.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Speciality> Specialities => Set<Speciality>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Speciality>(e =>
        {
            e.ToTable("Specialities");
            e.HasKey(s => s.Id);
            e.Property(s => s.Name).IsRequired().HasMaxLength(60);
            e.Property(s => s.Description).HasMaxLength(250);
        });

        modelBuilder.Entity<Doctor>(e =>
        {
            e.ToTable("Doctors");
            e.HasKey(d => d.Id);
            e.Property(d => d.Name).IsRequired().HasMaxLength(100);
            e.Property(d => d.LicenseNumber).IsRequired().HasMaxLength(20);
            e.HasIndex(d => d.LicenseNumber).IsUnique();
            e.HasOne(d => d.Speciality)              // uno a muchos: cada médico tiene una especialidad
             .WithMany()                             // la especialidad no tiene colección de médicos
             .HasForeignKey("SpecialityId")          // clave foránea "sombra" (no existe en la clase)
             .IsRequired()
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}`],
            ['Data/PersistenceEf.cs', 'cs', `using Dsw2026Ej15.Domain.Entities;
using Dsw2026Ej15.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Dsw2026Ej15.Data;

public class PersistenceEf : IPersistence
{
    private readonly AppDbContext _context;

    public PersistenceEf(AppDbContext context) => _context = context;

    public IEnumerable<Doctor> GetDoctors()
        => _context.Doctors
            .Include(d => d.Speciality)      // carga diligente: un solo SELECT con JOIN
            .AsNoTracking()                  // solo lectura: no hace falta seguir cambios
            .ToList();

    public Doctor? GetDoctor(Guid id)
        => _context.Doctors
            .Include(d => d.Speciality)
            .FirstOrDefault(d => d.Id == id);   // con seguimiento: puede modificarse y guardarse

    public void AddDoctor(Doctor doctor)
    {
        _context.Doctors.Add(doctor);
        _context.SaveChanges();
    }

    public void UpdateDoctor(Doctor doctor) => _context.SaveChanges();   // el change tracker detecta qué cambió

    public Speciality? GetSpeciality(Guid id) => _context.Specialities.Find(id);
}`],
            ['Data/SpecialitySeeder.cs', 'cs', `using System.Text.Json;
using Dsw2026Ej15.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dsw2026Ej15.Data;

// Carga las especialidades del JSON la primera vez (EF Core 9+: UseSeeding)
public static class SpecialitySeeder
{
    public static void Seed(DbContext context)
    {
        var set = context.Set<Speciality>();
        if (set.Any()) return;
        var path = Path.Combine(AppContext.BaseDirectory, "Sources", "specialities.json");
        var data = JsonSerializer.Deserialize<List<SpecialityData>>(File.ReadAllText(path),
            new JsonSerializerOptions(JsonSerializerDefaults.Web)) ?? [];
        set.AddRange(data.Select(s => new Speciality(s.Name, s.Description, s.Id)));
        context.SaveChanges();
    }

    private record SpecialityData(Guid Id, string Name, string Description);
}`],
            ['Domain: constructores para EF (agregados)', 'cs', `// BaseEntity
protected BaseEntity() { }   // para Entity Framework

// Speciality
private Speciality() { Name = Description = null!; }   // para Entity Framework

// Doctor
private Doctor() { Name = LicenseNumber = null!; Speciality = null!; }   // para Entity Framework`],
            ['Api/Program.cs (cambios)', 'cs', `using Microsoft.EntityFrameworkCore;

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default"))
           .UseSeeding((context, _) => SpecialitySeeder.Seed(context)));
builder.Services.AddScoped<IPersistence, PersistenceEf>();   // antes: AddSingleton<IPersistence, PersistenceInMemory>

var app = builder.Build();

// Solo para desarrollo: aplica las migraciones pendientes al iniciar
using (var scope = app.Services.CreateScope())
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();`],
          ]),
        },
      ],
      quiz: [
        { q: '¿Qué problema resuelve un ORM?', o: ['Hace más rápida la base de datos.', 'Automatiza la traducción entre objetos y tablas relacionales.', 'Reemplaza a la base de datos.', 'Genera interfaces gráficas.'], a: 1, e: 'El llamado desajuste objeto-relacional.' },
        { q: '¿Cuál es el ciclo de vida recomendado del DbContext en una API?', o: ['Singleton', 'Scoped (uno por request)', 'Transient', 'Static'], a: 1, e: 'Es una unidad de trabajo corta y no es segura entre hilos.' },
        { q: 'Si configurás lo mismo con un atributo y con Fluent API, ¿cuál gana?', o: ['El atributo.', 'Fluent API.', 'La convención.', 'Da error.'], a: 1, e: 'Fluent API tiene la mayor prioridad.' },
        { q: '¿Qué hace <code>dotnet ef migrations add Initial</code>?', o: ['Crea la base de datos.', 'Genera una clase de migración con los cambios del modelo.', 'Borra la base.', 'Ejecuta las consultas.'], a: 1, e: 'Aplicarla es otro comando: database update.' },
        { q: 'Por convención, ¿qué propiedad se toma como clave primaria de <code>Doctor</code>?', o: ['Name', 'Id o DoctorId', 'LicenseNumber', 'La primera propiedad'], a: 1, e: 'Si no hay ninguna, hay que configurarla con HasKey.' },
        { q: 'En el EJ16, ¿por qué no hace falta cambiar el controlador?', o: ['Porque EF lo reescribe.', 'Porque depende de la abstracción IPersistence y solo cambia su implementación.', 'Porque el controlador no usa datos.', 'Porque se usa la misma clase.'], a: 1, e: 'Es la inversión de dependencias en acción.' },
      ],
      sources: [
        { title: 'Entity Framework Core: información general', url: 'https://learn.microsoft.com/es-es/ef/core/', points: ['EF Core como mapeador objeto-relacional moderno.', 'El modelo, las consultas y el guardado.'] },
        { title: 'Instalación de Entity Framework Core', url: 'https://learn.microsoft.com/es-es/ef/core/get-started/overview/install', points: ['Paquetes de proveedor, Design y herramientas dotnet-ef / PMC.'] },
        { title: 'Duración, configuración e inicialización de DbContext', url: 'https://learn.microsoft.com/es-es/ef/core/dbcontext-configuration/', points: ['El DbContext como unidad de trabajo de vida corta.', 'AddDbContext e inyección de dependencias; no es seguro para subprocesos.'] },
        { title: 'Creación y configuración de un modelo', url: 'https://learn.microsoft.com/es-es/ef/core/modeling/', points: ['Convenciones, Data Annotations y Fluent API (con su prioridad).', 'Tipos de entidad, propiedades y claves.'] },
        { title: 'Migraciones', url: 'https://learn.microsoft.com/es-es/ef/core/managing-schemas/migrations/', points: ['Crear, aplicar, quitar migraciones y generar scripts SQL.'] },
      ],
    },

    {
      id: 'ef-relaciones',
      module: 'ef',
      title: 'Relaciones entre entidades',
      keywords: 'relaciones uno a muchos uno a uno muchos a muchos clave foranea principal dependiente navegacion referencia coleccion hasone withmany hasforeignkey propiedad sombra requerida opcional entidad de union convenciones',
      tldr: 'Las relaciones se definen con <mark>navegaciones</mark> (propiedades que apuntan a otras entidades) y <mark>claves foráneas</mark>. EF Core reconoce uno a muchos, uno a uno y muchos a muchos, casi siempre por convención.',
      goals: [
        'Distinguir entidad principal y dependiente, clave principal y foránea.',
        'Configurar relaciones uno a muchos, uno a uno y muchos a muchos.',
        'Usar navegaciones de referencia y de colección.',
      ],
      body: `
        <h2>Vocabulario</h2>
        ${table(['Término', 'Significado', 'Ejemplo'], [
          ['Entidad <strong>principal</strong>', 'La que existe por sí misma', '<code>Speciality</code>'],
          ['Entidad <strong>dependiente</strong>', 'La que tiene la clave foránea', '<code>Doctor</code>'],
          ['<strong>Clave principal</strong>', 'La que identifica a la principal (normalmente su PK)', '<code>Speciality.Id</code>'],
          ['<strong>Clave foránea</strong>', 'Columna de la dependiente que referencia a la principal', '<code>Doctor.SpecialityId</code>'],
          ['Navegación de <strong>referencia</strong>', 'Propiedad que apunta a una entidad', '<code>doctor.Speciality</code>'],
          ['Navegación de <strong>colección</strong>', 'Propiedad que contiene varias', '<code>speciality.Doctors</code>'],
          ['Propiedad <strong>sombra</strong>', 'Existe en la base y en el modelo de EF, pero no en la clase', 'SpecialityId en el EJ16'],
        ])}

        <h2>Uno a muchos</h2>
        <p>La más común: una especialidad tiene muchos médicos; cada médico tiene una especialidad.</p>
        ${code('cs', `public class Speciality
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public List<Doctor> Doctors { get; } = [];      // navegación de colección (opcional)
}

public class Doctor
{
    public Guid Id { get; set; }
    public Guid SpecialityId { get; set; }           // clave foránea explícita (opcional)
    public Speciality Speciality { get; set; } = null!;   // navegación de referencia
}

// Por convención EF ya entiende la relación. Explícita con Fluent API:
modelBuilder.Entity<Doctor>()
    .HasOne(d => d.Speciality)
    .WithMany(s => s.Doctors)
    .HasForeignKey(d => d.SpecialityId)
    .IsRequired();`)}
        <p>Si la clave foránea acepta null (<code>Guid?</code>), la relación es <strong>opcional</strong>: puede haber médicos sin especialidad.</p>

        <h2>Uno a uno</h2>
        ${code('cs', `public class Doctor { public Guid Id { get; set; } public Consultorio? Consultorio { get; set; } }
public class Consultorio { public Guid Id { get; set; } public Guid DoctorId { get; set; } public Doctor Doctor { get; set; } = null!; }

modelBuilder.Entity<Doctor>()
    .HasOne(d => d.Consultorio)
    .WithOne(c => c.Doctor)
    .HasForeignKey<Consultorio>(c => c.DoctorId);   // hay que decir de qué lado está la FK`)}

        <h2>Muchos a muchos</h2>
        <p>Un médico atiende en muchas obras sociales y una obra social tiene muchos médicos. En la base hace falta una <strong>tabla de unión</strong>; EF Core la crea sola si ambas entidades tienen una colección de la otra:</p>
        ${code('cs', `public class Doctor { public Guid Id { get; set; } public List<ObraSocial> ObrasSociales { get; } = []; }
public class ObraSocial { public Guid Id { get; set; } public List<Doctor> Doctors { get; } = []; }
// EF crea la tabla DoctorObraSocial (DoctorsId, ObrasSocialesId)

// Si la unión necesita datos propios (desde cuándo atiende), se modela como entidad:
public class Convenio
{
    public Guid DoctorId { get; set; }
    public Guid ObraSocialId { get; set; }
    public DateOnly Desde { get; set; }
}`)}
        ${fig(`<svg viewBox="0 0 600 150" width="600" role="img" aria-label="Tipos de relación">
          <g font-size="12">
          <rect class="box" x="10" y="20" width="110" height="30" rx="5"/><text x="65" y="40" text-anchor="middle">Speciality</text>
          <rect class="box" x="10" y="100" width="110" height="30" rx="5"/><text x="65" y="120" text-anchor="middle">Doctor</text>
          <path class="stroke-a" d="M65 50 V100" stroke-width="1.6"/><text x="72" y="66">1</text><text x="72" y="96">*</text>
          <text x="65" y="146" text-anchor="middle" class="muted">uno a muchos</text>
          <rect class="box" x="230" y="20" width="110" height="30" rx="5"/><text x="285" y="40" text-anchor="middle">Doctor</text>
          <rect class="box" x="230" y="100" width="110" height="30" rx="5"/><text x="285" y="120" text-anchor="middle">Consultorio</text>
          <path class="stroke-a" d="M285 50 V100" stroke-width="1.6"/><text x="292" y="66">1</text><text x="292" y="96">0..1</text>
          <text x="285" y="146" text-anchor="middle" class="muted">uno a uno</text>
          <rect class="box" x="420" y="20" width="80" height="30" rx="5"/><text x="460" y="40" text-anchor="middle">Doctor</text>
          <rect class="box" x="510" y="20" width="85" height="30" rx="5"/><text x="552" y="40" text-anchor="middle">ObraSocial</text>
          <rect class="box-a" x="440" y="100" width="130" height="30" rx="5"/><text x="505" y="120" text-anchor="middle">DoctorObraSocial</text>
          <path class="stroke-a" d="M460 50 L490 100 M552 50 L520 100" stroke-width="1.6"/>
          <text x="505" y="146" text-anchor="middle" class="muted">muchos a muchos (tabla de unión)</text>
          </g></svg>`, 'Los tres tipos de relación y cómo quedan en la base.')}
        ${lab(0)}
      `,
      labs: [
        {
          type: 'classify',
          title: '¿Qué tipo de relación es?',
          buckets: ['Uno a muchos', 'Uno a uno', 'Muchos a muchos'],
          items: [
            { t: 'Sucursal y vehículos (EJ14)', b: 0, why: 'Una sucursal tiene muchos vehículos; cada vehículo, una sucursal.' },
            { t: 'Sucursal y responsable a cargo', b: 1, why: 'Cada sucursal tiene un responsable y cada responsable está a cargo de una.' },
            { t: 'Estudiantes y materias', b: 2, why: 'Un estudiante cursa muchas materias y una materia tiene muchos estudiantes.' },
            { t: 'Pedido y líneas del pedido', b: 0, why: 'Un pedido tiene muchas líneas.' },
            { t: 'Producto y categorías (un producto puede estar en varias)', b: 2, why: 'Necesita tabla de unión.' },
            { t: 'Usuario y su perfil con foto y biografía', b: 1, why: 'Un perfil por usuario.' },
          ],
        },
      ],
      quiz: [
        { q: 'En la relación médico-especialidad, ¿cuál es la entidad dependiente?', o: ['Speciality', 'Doctor', 'Ninguna', 'Las dos'], a: 1, e: 'La dependiente es la que tiene la clave foránea.' },
        { q: '¿Qué es una navegación de colección?', o: ['Una propiedad que apunta a una sola entidad.', 'Una propiedad que contiene varias entidades relacionadas.', 'Un índice.', 'Una tabla de unión.'], a: 1, e: 'Por ejemplo, speciality.Doctors.' },
        { q: '¿Qué crea EF Core para una relación muchos a muchos sin entidad de unión explícita?', o: ['Nada.', 'Una tabla de unión automáticamente.', 'Una columna con una lista.', 'Un error.'], a: 1, e: 'Si la unión necesita datos propios, se modela como entidad.' },
        { q: 'Si la clave foránea es <code>Guid?</code>, la relación es…', o: ['…obligatoria.', '…opcional.', '…uno a uno.', '…inválida.'], a: 1, e: 'Puede haber dependientes sin principal.' },
        { q: 'En uno a uno con Fluent API, ¿qué hay que indicar además?', o: ['La tabla de unión.', 'De qué lado está la clave foránea (HasForeignKey&lt;T&gt;).', 'El índice.', 'Nada.'], a: 1, e: 'EF no puede adivinar cuál es la dependiente.' },
      ],
      sources: [
        { title: 'Relaciones en EF Core', url: 'https://learn.microsoft.com/es-es/ef/core/modeling/relationships', points: ['Uno a muchos, uno a uno y muchos a muchos.', 'Claves foráneas y principales; navegaciones; convenciones de descubrimiento.'] },
      ],
    },

    {
      id: 'ef-consultas',
      module: 'ef',
      title: 'Consultar datos con EF Core',
      keywords: 'consultas linq to entities iqueryable evaluacion cliente servidor seguimiento tracking astracking asnotracking datos relacionados include theninclude carga diligente explicita diferida lazy loading proxies n+1 proyeccion select paginacion skip take keyset',
      tldr: 'Una consulta LINQ sobre un <code>DbSet</code> se traduce a SQL y corre en el servidor. Para traer entidades relacionadas hay tres estrategias (diligente, explícita y diferida) y una trampa famosa: el <mark>problema N+1</mark>.',
      goals: [
        'Distinguir qué se evalúa en el servidor y qué en el cliente.',
        'Elegir entre consultas con y sin seguimiento.',
        'Cargar datos relacionados con Include, carga explícita y carga diferida, evitando N+1.',
        'Paginar resultados.',
      ],
      body: `
        <h2>De LINQ a SQL</h2>
        ${code('cs', `var cardiologos = await _context.Doctors
    .Where(d => d.IsActive && d.Speciality.Name == "Cardiología")
    .OrderBy(d => d.Name)
    .Select(d => new { d.Name, d.LicenseNumber })
    .ToListAsync();`)}
        ${code('sql', `SELECT [d].[Name], [d].[LicenseNumber]
FROM [Doctors] AS [d]
INNER JOIN [Specialities] AS [s] ON [d].[SpecialityId] = [s].[Id]
WHERE [d].[IsActive] = CAST(1 AS bit) AND [s].[Name] = N'Cardiología'
ORDER BY [d].[Name]`, 'SQL que genera EF Core para SQL Server')}
        <p>Un <code>DbSet</code> es un <code>IQueryable&lt;T&gt;</code>: los operadores no se ejecutan en memoria, se van acumulando en un árbol de expresiones que EF traduce a SQL recién cuando materializás (<code>ToListAsync</code>, <code>FirstOrDefaultAsync</code>, <code>CountAsync</code>, <code>foreach</code>). Es la evaluación diferida de LINQ llevada a la base.</p>

        <h2>Evaluación en el cliente o en el servidor</h2>
        <p>EF traduce todo lo que puede a SQL. En la proyección final (<code>Select</code>) admite llamar a métodos de C# que no tienen traducción, evaluándolos en el cliente. Pero si algo intraducible aparece en un <code>Where</code> u <code>OrderBy</code>, lanza una excepción en lugar de traer toda la tabla a memoria en silencio.</p>
        ${code('cs', `// Bien: el método se aplica en el cliente, después de traer las filas
.Select(d => new { Nombre = Formatear(d.Name) })

// Error: EF no puede traducir Formatear a SQL dentro de un Where
.Where(d => Formatear(d.Name).StartsWith("Dr"))      // InvalidOperationException`)}
        ${note('Un <code>ToList()</code> antes del <code>Where</code> “arregla” el error… trayendo toda la tabla a memoria. Con miles de filas es un problema serio de rendimiento.', 'warn')}

        <h2>Con o sin seguimiento</h2>
        <p>Por defecto, las entidades que devuelve una consulta quedan <strong>seguidas</strong> por el change tracker: EF guarda una copia de sus valores originales para detectar cambios en <code>SaveChanges</code>. Si solo vas a leer, <code>AsNoTracking()</code> es más rápido y usa menos memoria.</p>
        ${code('cs', `var lista = _context.Doctors.AsNoTracking().ToList();     // GET: solo lectura
var doctor = _context.Doctors.Find(id);                   // con seguimiento: lo vas a modificar
doctor.Deactivate();
_context.SaveChanges();                                   // UPDATE solo de lo que cambió`)}

        <h2>Cargar datos relacionados</h2>
        ${table(['Estrategia', 'Cómo', 'Cuándo carga'], [
          ['<strong>Diligente</strong> (eager)', '<code>.Include(d =&gt; d.Speciality)</code>, y <code>.ThenInclude(...)</code> para el siguiente nivel', 'En la misma consulta inicial'],
          ['<strong>Explícita</strong>', '<code>_context.Entry(d).Reference(x =&gt; x.Speciality).Load()</code> o <code>.Collection(...)</code>', 'Cuando vos lo pedís, después'],
          ['<strong>Diferida</strong> (lazy)', 'Paquete Proxies, <code>UseLazyLoadingProxies()</code> y navegaciones <code>virtual</code>', 'Automáticamente, la primera vez que tocás la navegación'],
          ['<strong>Proyección</strong>', '<code>.Select(d =&gt; new Dto(d.Name, d.Speciality.Name))</code>', 'En la consulta, solo las columnas necesarias'],
        ])}
        <p>Compará cuántas consultas genera cada estrategia para listar médicos con su especialidad:</p>
        ${lab(0)}
        ${note('El problema N+1: una consulta para traer N médicos y después una consulta más por cada uno para traer su especialidad. Con 1000 médicos son 1001 viajes a la base. La carga diferida lo produce sin que te des cuenta; Include o una proyección lo resuelven.', 'exam')}

        <h2>Paginación</h2>
        ${code('cs', `// Por desplazamiento: simple, pero cada página salta todas las anteriores
var pagina = await _context.Doctors
    .OrderBy(d => d.Name)                 // ¡siempre ordenar antes de paginar!
    .Skip((numero - 1) * tamanio)
    .Take(tamanio)
    .ToListAsync();

// Por conjunto de claves (keyset): más eficiente en tablas grandes
var siguiente = await _context.Doctors
    .OrderBy(d => d.Id)
    .Where(d => d.Id > ultimoIdVisto)
    .Take(tamanio)
    .ToListAsync();`)}
      `,
      labs: [
        {
          type: 'efload',
          title: 'Estrategias de carga y el problema N+1',
          intro: 'Elegí una estrategia y mové la cantidad de médicos. Cada barra es un viaje a la base de datos. (Hay 3 especialidades distintas.)',
        },
      ],
      quiz: [
        { q: '¿Cuándo se ejecuta en la base <code>var q = _context.Doctors.Where(d =&gt; d.IsActive);</code>?', o: ['En esa línea.', 'Al materializar: ToList, First, Count, foreach…', 'Al compilar.', 'Nunca.'], a: 1, e: 'IQueryable acumula la consulta hasta que se ejecuta.' },
        { q: '¿Qué hace <code>AsNoTracking()</code>?', o: ['Desactiva el SQL.', 'Devuelve entidades que el change tracker no sigue: más rápido para solo lectura.', 'Borra el caché.', 'Evita los JOIN.'], a: 1, e: 'Los cambios sobre esas entidades no se guardan con SaveChanges.' },
        { q: 'Listar 100 médicos con lazy loading y leer la especialidad de cada uno puede generar…', o: ['1 consulta.', 'Hasta 101 consultas (N+1).', '2 consultas.', '0 consultas.'], a: 1, e: 'Una por la lista y una por cada navegación cargada.' },
        { q: '¿Cómo se cargan los médicos con su especialidad en una sola consulta?', o: ['<code>.Include(d =&gt; d.Speciality)</code>', '<code>.AsNoTracking()</code>', '<code>.Load()</code>', '<code>.Skip(1)</code>'], a: 0, e: 'Carga diligente con JOIN.' },
        { q: 'Antes de paginar con Skip/Take, siempre hay que…', o: ['…usar AsNoTracking.', '…ordenar (OrderBy).', '…llamar a ToList.', '…usar Include.'], a: 1, e: 'Sin orden, las páginas pueden repetir o saltear filas.' },
        { q: '¿Qué pasa si usás en un <code>Where</code> un método C# que EF no puede traducir a SQL?', o: ['Lo evalúa en memoria en silencio.', 'Lanza una excepción.', 'Lo ignora.', 'Devuelve todo.'], a: 1, e: 'Solo la proyección final admite evaluación en el cliente.' },
      ],
      sources: [
        { title: 'Consulta de datos', url: 'https://learn.microsoft.com/es-es/ef/core/querying/', points: ['Cómo funcionan las consultas: de LINQ a SQL.', 'Evaluación de cliente frente a servidor.'] },
        { title: 'Consultas de seguimiento frente a consultas sin seguimiento', url: 'https://learn.microsoft.com/es-es/ef/core/querying/tracking', points: ['Cuándo usar AsNoTracking.', 'Resolución de identidad.'] },
        { title: 'Carga de datos relacionados', url: 'https://learn.microsoft.com/es-es/ef/core/querying/related-data/', points: ['Carga diligente con Include y ThenInclude.', 'Carga explícita con Entry().Reference()/Collection().Load().', 'Carga diferida con proxies y sus riesgos (N+1).'] },
        { title: 'Paginación', url: 'https://learn.microsoft.com/es-es/ef/core/querying/pagination', points: ['Paginación por desplazamiento (Skip/Take) y por conjunto de claves.'] },
      ],
    },

    {
      id: 'ef-guardar',
      module: 'ef',
      title: 'Guardar datos y patrones de persistencia',
      keywords: 'savechanges add update remove change tracker estados added modified deleted unchanged detached datos relacionados grafo eliminacion en cascada cascade delete restrict transacciones repositorio unidad de trabajo unit of work repository fowler',
      tldr: 'EF Core guarda con <code>SaveChanges</code>: revisa el <mark>change tracker</mark>, ve qué entidades están Added, Modified o Deleted y genera los INSERT, UPDATE y DELETE en una transacción. El DbContext ya implementa los patrones <mark>Unidad de trabajo</mark> y <mark>Repositorio</mark>.',
      goals: [
        'Explicar los estados de una entidad y qué SQL genera cada uno.',
        'Agregar, modificar y eliminar entidades, incluidas las relacionadas.',
        'Configurar la eliminación en cascada.',
        'Explicar los patrones Repositorio y Unidad de trabajo.',
      ],
      body: `
        <h2>SaveChanges y los estados</h2>
        ${table(['Estado', 'Significa', 'SaveChanges genera'], [
          ['<code>Added</code>', 'Nueva: se agregó con Add', '<code>INSERT</code>'],
          ['<code>Unchanged</code>', 'Seguida y sin cambios', 'Nada'],
          ['<code>Modified</code>', 'Seguida y con propiedades cambiadas', '<code>UPDATE</code> solo de las columnas modificadas'],
          ['<code>Deleted</code>', 'Marcada con Remove', '<code>DELETE</code>'],
          ['<code>Detached</code>', 'El contexto no la conoce', 'Nada'],
        ])}
        <p>Probá cada acción y mirá el estado y el SQL:</p>
        ${lab(0)}
        <p>Todas las operaciones de un <code>SaveChanges</code> se ejecutan en una <strong>transacción</strong>: o se aplican todas o ninguna. Para varias llamadas a SaveChanges que deben ser atómicas, existe <code>_context.Database.BeginTransaction()</code>.</p>

        <h2>Guardar datos relacionados</h2>
        ${code('cs', `// Agregar un grafo: la especialidad nueva y sus médicos se insertan juntos
var esp = new Speciality("Traumatología", "Huesos y articulaciones");
esp.Doctors.Add(new Doctor("Pablo Díaz", "MP-777"));
_context.Specialities.Add(esp);
_context.SaveChanges();            // INSERT Specialities + INSERT Doctors (con la FK correcta)

// Relacionar con una existente: buscarla en el mismo contexto
var cardio = _context.Specialities.Find(cardioId)!;
_context.Doctors.Add(new Doctor("Ana Sosa", "MP-888", cardio));   // cardio queda Unchanged: no se duplica
_context.SaveChanges();`)}

        <h2>Eliminación en cascada</h2>
        <p>¿Qué pasa con los dependientes cuando se borra el principal? Se configura con <code>OnDelete</code>:</p>
        ${table(['DeleteBehavior', 'Efecto al borrar la especialidad'], [
          ['<code>Cascade</code>', 'Se borran también sus médicos (por defecto en relaciones obligatorias)'],
          ['<code>Restrict</code> / <code>NoAction</code>', 'No se puede borrar mientras tenga médicos'],
          ['<code>SetNull</code>', 'Los médicos quedan con la FK en null (requiere relación opcional)'],
        ])}
        ${note('En datos de negocio, la cascada puede borrar mucho más de lo que esperás. Por eso el EJ16 usa <code>Restrict</code>, y el EJ15 pide borrado <strong>lógico</strong>: marcar <code>IsActive = false</code> conserva la historia.', 'warn')}

        <h2>Repositorio y Unidad de trabajo</h2>
        <p>Dos patrones de Martin Fowler (<em>Patterns of Enterprise Application Architecture</em>):</p>
        <ul>
          <li><strong>Repositorio:</strong> media entre el dominio y la capa de datos con una interfaz parecida a una colección (<code>Add</code>, <code>GetById</code>, <code>Find(criterio)</code>). El dominio no sabe cómo se guarda.</li>
          <li><strong>Unidad de trabajo:</strong> mantiene una lista de los objetos afectados por una transacción de negocio y coordina la escritura de los cambios al final.</li>
        </ul>
        <p>El <code>DbContext</code> ya implementa ambos: cada <code>DbSet</code> funciona como un repositorio y <code>SaveChanges</code> es el cierre de la unidad de trabajo. Igual se suele definir una interfaz propia (como <code>IPersistence</code> o <code>IRepository&lt;T&gt;</code>) para que el dominio no dependa de EF Core: así es posible reemplazar la implementación o usar un doble en las pruebas.</p>
        ${code('cs', `public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id);
    Task<List<T>> GetAllAsync();
    Task AddAsync(T entity);
}

public class EfRepository<T>(AppDbContext context) : IRepository<T> where T : BaseEntity
{
    public Task<T?> GetByIdAsync(Guid id) => context.Set<T>().FirstOrDefaultAsync(e => e.Id == id);
    public Task<List<T>> GetAllAsync() => context.Set<T>().AsNoTracking().ToListAsync();
    public async Task AddAsync(T entity) { context.Set<T>().Add(entity); await context.SaveChangesAsync(); }
}

builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));   // genérico abierto`)}
      `,
      labs: [
        {
          type: 'tracker',
          title: 'El change tracker paso a paso',
          intro: 'Probá estas secuencias: crear, Add y SaveChanges; Find, cambiar el nombre y SaveChanges; AsNoTracking, cambiar y SaveChanges (¿qué pasa?); Find, Remove y SaveChanges.',
        },
      ],
      quiz: [
        { q: 'Una entidad obtenida con <code>Find</code> y a la que le cambiás una propiedad queda en estado…', o: ['Added', 'Unchanged', 'Modified', 'Detached'], a: 2, e: 'EF compara con los valores originales.' },
        { q: '¿Qué SQL genera EF para una entidad Modified en la que cambió una sola propiedad?', o: ['UPDATE de todas las columnas.', 'UPDATE solo de la columna modificada.', 'DELETE e INSERT.', 'Nada.'], a: 1, e: 'Por eso el EJ16 solo actualiza IsActive.' },
        { q: 'Modificás una entidad obtenida con AsNoTracking y llamás a SaveChanges. ¿Qué pasa?', o: ['Se actualiza.', 'No se guarda nada: la entidad no está seguida.', 'Lanza excepción.', 'Se duplica.'], a: 1, e: 'Habría que adjuntarla con Update o Attach.' },
        { q: '¿Qué hace <code>DeleteBehavior.Restrict</code>?', o: ['Borra los dependientes.', 'Impide borrar el principal mientras tenga dependientes.', 'Pone las FK en null.', 'Nada.'], a: 1, e: 'Cascade los borraría.' },
        { q: '¿Qué patrón implementa SaveChanges?', o: ['Repositorio', 'Unidad de trabajo', 'Adapter', 'Singleton'], a: 1, e: 'Coordina la escritura de todos los cambios al final.' },
        { q: 'Si un SaveChanges tiene tres inserts y el tercero falla…', o: ['Quedan guardados los dos primeros.', 'No se guarda ninguno: es una transacción.', 'Se reintenta solo.', 'Se guarda el tercero igual.'], a: 1, e: 'Todo o nada.' },
      ],
      sources: [
        { title: 'Guardado básico', url: 'https://learn.microsoft.com/es-es/ef/core/saving/basic', points: ['Agregar, actualizar y eliminar con SaveChanges.', 'Varias operaciones en un solo SaveChanges.'] },
        { title: 'Guardado de datos relacionados', url: 'https://learn.microsoft.com/es-es/ef/core/saving/related-data', points: ['Agregar un grafo de entidades nuevas.', 'Agregar entidades relacionadas a existentes; cambiar y quitar relaciones.'] },
        { title: 'Eliminación en cascada', url: 'https://learn.microsoft.com/es-es/ef/core/saving/cascade-delete', points: ['Cascade, Restrict, SetNull, NoAction.', 'Cuándo ocurren las eliminaciones en cascada.'] },
        { title: 'Repository y Unit of Work', url: 'https://martinfowler.com/eaaCatalog/repository.html', points: ['Repositorio: mediador entre dominio y datos con una interfaz de colección.', 'Unidad de trabajo: lista de objetos afectados por una transacción de negocio.'] },
      ],
    },
  );
})();
