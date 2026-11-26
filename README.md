# Backeando Ando

Guía de backend desde cero para **Desarrollo de Software 2026 (UTN-FRT)**: POO, Git, C#, arquitectura, ASP.NET Core, Entity Framework Core, seguridad, logs y pruebas.

- 48 lecciones con teoría desarrollada a partir de la bibliografía de la cátedra.
- 62 laboratorios interactivos (terminal Git simulada, cliente REST, JWT, LINQ, async, EF Core…).
- 282 preguntas de repaso, cuestionario por módulo, simulacro, repaso de las preguntas falladas y una página con todos los laboratorios.
- Los ejercicios EJ01 a EJ16 con pistas y solución verificada con .NET 10.

Sitio en GitHub Pages: [franco704.github.io/backeando-ando](https:/No necesita instalación ni compilación: es HTML, CSS y JavaScript con módulos ES. Como los navegadores no cargan módulos desde `file://`, para usarlo sin internet descargá el repositorio, levantá un servidor estático en la carpeta (por ejemplo `python3 -m http.server`) y abrí `http://localhost:8000`. El progreso se guarda en el navegador de cada persona (claves `ba-*`, las mismas de siempre).

Pruebas: `npm test` (carga todo el temario y valida lecciones, laboratorios y preguntas; además prueba la terminal Git simulada, la API del EJ15 y el resaltado de código).

## Cómo está organizado

La estructura cuenta de qué trata la materia (arquitectura *screaming*):

```
index.html              armazón: barra, índice, dock inferior en móvil
src/main.js             raíz de composición: rutas por hash (#/<lección>, #/quiz/<módulo>, #/simulacro, #/repaso, #/laboratorios) y vistas
src/temario/            lecciones por unidad (introduccion/, lenguaje-csharp/, desarrollo-backend/; un archivo por módulo), catálogo, ayudantes de redacción e índice
src/laboratorios/       terminal Git simulada, cliente REST y JWT (http), C# y .NET, EF Core y calidad (datos), genéricos e índice que los monta
src/estudio/            progreso, preguntas y otras guías
src/vistas/             inicio, lección, cuestionarios (módulo, simulacro, repaso) y laboratorios juntos
src/animaciones/        pantalla de entrada a cada módulo y glifo de cada lección
src/ui/ src/nucleo/     armazón, resaltado de código e íconos; DOM, almacenamiento y rutas
styles/                 tokens, base, armazón, contenido, estudio, laboratorios, vistas y animaciones
```

El diseño es *mobile-first*: en el celular todo se alcanza desde el dock inferior (Inicio, Índice, Labs, Simulacro, Repasar) y el cajón, con el buscador, las herramientas y el índice completo; desde 1024 px el índice queda fijo y las herramientas pasan a la barra superior, y desde 1280 px aparece el riel con las secciones de la lección. La portada abre con un pedido HTTP real contra la API simulada del EJ15, capa por capa. Tipografía: Funnel Display para títulos, Atkinson Hyperlegible Next para leer y JetBrains Mono para el código, que va en bloques oscuros en los dos temas.

arda en el navegador de cada persona.

## También probá

### 2.º año

- [Integrando Ando](https://franco704.github.io/integrando-ando/): Análisis Matemático II ([repositorio](https://github.com/Franco704/integrando-ando))
- [Operando Ando](https://franco704.github.io/operando-ando/): Sistemas Operativos ([repositorio](https://github.com/Franco704/operando-ando))
- [Induciendo Ando](https://franco704.github.io/induciendo-ando/): Física II ([repositorio](https://github.com/Franco704/induciendo-ando))

### 3.er año

- [Consultando Ando](https://franco704.github.io/consultando-ando/): Gestión de Datos ([repositorio](https://github.com/Franco704/consultando-ando))
- [Fronteando Ando](https://franco704.github.io/fronteando-ando/): Desarrollo de Software, frontend ([repositorio](https://github.com/Franco704/fronteando-ando))
- [Diseñando Ando](https://franco704.github.io/disenando-ando/): Diseño de Sistemas de Información ([repositorio](https://github.com/Franco704/disenando-ando))
- [Iterando Ando](https://franco704.github.io/iterando-ando/): Matemática Superior ([repositorio](https://github.com/Franco704/iterando-ando))
- [Modulando Ando](https://franco704.github.io/modulando-ando/): Comunicación de Datos ([repositorio](https://github.com/Franco704/modulando-ando))
- [Probando Ando](https://franco704.github.io/probando-ando/): Probabilidad y Estadística ([repositorio](https://github.com/Franco704/probando-ando))
- [Economizar](https://franco704.github.io/economizar/): Economía ([repositorio](https://github.com/Franco704/economizar))

## Agradecimientos

A **Mateo Rusconi**, autor original de las animaciones de esta guía: la pantalla de entrada a cada módulo, los glifos animados de las lecciones y los microefectos de los cuestionarios vienen de su "Laboratorio Frontend DSW" y están adaptados acá a la identidad de Backeando Ando.
