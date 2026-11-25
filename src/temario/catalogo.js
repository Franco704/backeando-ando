/* Unidades del programa y módulos (temas). Cada lección indica su módulo; cada módulo, su unidad. */
  export const UNIDADES = [
    { id: 'u1', title: 'Unidad 1', name: 'Introducción' },
    { id: 'u2', title: 'Unidad 2', name: 'Lenguaje backend: C#' },
    { id: 'u3', title: 'Unidad 3', name: 'Desarrollo backend' },
  ];

  // stop = nombre corto para el recorrido de la portada
  export const MODULOS = [
    { id: 'poo', unit: 'u1', title: 'Programación orientada a objetos', stop: 'POO', blurb: 'el modelo de objetos de Booch y la depuración' },
    { id: 'git', unit: 'u1', title: 'Control de versiones con Git', stop: 'Git', blurb: 'commits, ramas, conflictos y GitHub' },
    { id: 'cs-base', unit: 'u2', title: 'C#: fundamentos', stop: 'C#', blurb: '.NET, tipos, métodos, decisiones y excepciones' },
    { id: 'cs-oop', unit: 'u2', title: 'C#: clases y tipos', stop: 'Tipos', blurb: 'clases, referencias, herencia, propiedades, interfaces y genéricos' },
    { id: 'cs-adv', unit: 'u2', title: 'C#: colecciones y más', stop: 'LINQ', blurb: 'colecciones, LINQ, delegados, eventos y async' },
    { id: 'arq', unit: 'u3', title: 'Arquitectura de software', stop: 'Capas', blurb: 'principios, patrones, capas y microservicios' },
    { id: 'api', unit: 'u3', title: 'APIs web con ASP.NET Core', stop: 'API', blurb: 'REST, controladores, middleware e inyección de dependencias' },
    { id: 'ef', unit: 'u3', title: 'Persistencia con Entity Framework Core', stop: 'EF Core', blurb: 'ORM, modelo, relaciones, consultas' },
    { id: 'sec', unit: 'u3', title: 'Seguridad', stop: 'JWT', blurb: 'autenticación, autorización, CORS, CSRF, XSS' },
    { id: 'qa', unit: 'u3', title: 'Logs, pruebas y código limpio', stop: 'Tests', blurb: 'ILogger, xUnit, mocks y clean code' },
  ];

