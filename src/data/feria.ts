// =============================================================
//  DATOS DE LA FERIA VIRTUAL  ·  UAPA - Ingeniería y Tecnología
// -------------------------------------------------------------
//  Edita este archivo para añadir carreras, stands y proyectos.
//  El recinto 3D se genera automáticamente a partir de estos
//  datos: no hace falta tocar la escena para sumar contenido.
//
//  NOTA: los videos de YouTube, pensums e imágenes son
//  representativos / placeholder. Reemplaza los `youtubeId`,
//  `pensum` y textos por el contenido oficial de la UAPA.
// =============================================================

export interface MediaImage {
  label: string;
  src?: string;
}

export interface PensumTerm {
  /** Ej: "1er Cuatrimestre" o "Trimestre X". */
  term: string;
  subjects: string[];
}

export interface Project {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  description: string;
  youtubeId?: string;
  images: MediaImage[];
  tags: string[];
  links?: { label: string; url: string }[];
}

export interface Carrera {
  id: string;
  name: string;
  short: string;
  color: string;
  accent: string;
  tagline: string;
  /** Descripción de qué trata la carrera. */
  description: string;
  /** Qué ofrece la UAPA en esta carrera (perfil/beneficios). */
  offer: string[];
  /** Datos clave. */
  stats: { grado: string; duracion: string; creditos: string; modalidad: string };
  /** Video de YouTube que explica la carrera. */
  careerVideoId: string;
  /** Pensum (representativo). */
  pensum: PensumTerm[];
  images: MediaImage[];
  projects: Project[];
}

// ----------------------------------------------------------------
//  Videos REALES de YouTube (referencias de ejemplo, no oficiales
//  de la UAPA). Reemplázalos por los videos del canal de la UAPA.
// ----------------------------------------------------------------
const YT = {
  // Software / IoT
  iotHome: "eidD14dXW8s", // IoT Home Automation Project Tutorial
  rfidLock: "3xb2PLFjJxk", // Smart Door Lock con Arduino + RFID
  ledWled: "RF2O21AznrA", // Iluminación inteligente ESP32 + WLED
  esp32Blynk: "JSqjUducJXo", // Monitor IoT con ESP32 + Blynk
  smartRemote: "9eSuWfviL0A", // Mando universal smart home (ESP32)
  // Informática Gerencial / BI / ERP
  powerBiSales: "fZn83JRt4Nk", // Power BI - Sales Dashboard (Rishabh Mishra)
  biMasterclass: "mXD0Peot4hY", // Power BI masterclass (Chandoo)
  powerBiCourse: "I0vQ_VLZTWg", // Learn Power BI in under 3 hours
  odooWine: "ELLQQPiiX4s", // Run your shop with Odoo (oficial Odoo)
  odooWhatIs: "b-dRhwwYdRk", // What is Odoo ERP?
  // Agrimensura
  droneMapping: "_53GhvVwNbM", // Professional Drone Mapping Workflow
  droneSurvey: "CSTodaZb4Vc", // UAV photogrammetry / RTK survey
  // TIC / Ciberseguridad
  phishing: "sEMrBKmUTPE", // SANS Security Awareness: Email & Phishing
};

export const FERIA = {
  title: "UAPAverse",
  demoTag: "Demo de ejemplo",
  university: "Universidad Abierta para Adultos · UAPA",
  school: "Escuela de Ingeniería y Tecnología",
  edition: "Edición 2026",
};

export const CARRERAS: Carrera[] = [
  {
    id: "software",
    name: "Ingeniería en Software",
    short: "Software",
    color: "#1d6fd6",
    accent: "#7ec8ff",
    tagline: "Sistemas confiables, aprende creando.",
    description:
      "La Ingeniería en Software te permite crear sistemas confiables y de calidad basándote en métodos y técnicas de ingeniería, además de desarrollar habilidades para brindar soporte operacional. Aprendes ejecutando proyectos reales durante tus años de estudio.",
    offer: [
      "Enfoque 'aprende haciendo y creando' con proyectos reales.",
      "Habilidades directivas y gerenciales en áreas de ingeniería y tecnología.",
      "Dominio de sistemas, instrumentos y técnicas de desarrollo de software.",
      "Formación en emprendimiento y empoderamiento profesional.",
    ],
    stats: {
      grado: "Ingeniería",
      duracion: "4 años",
      creditos: "209 créditos",
      modalidad: "Semipresencial",
    },
    careerVideoId: YT.smartRemote,
    pensum: [
      {
        term: "Ciclo inicial",
        subjects: [
          "Introducción a la Programación",
          "Matemática Básica",
          "Lógica y Algoritmos",
          "TIC I",
        ],
      },
      {
        term: "Ciclo intermedio",
        subjects: [
          "Programación Orientada a Objetos",
          "Estructura de Datos",
          "Bases de Datos",
          "Ingeniería de Requisitos",
        ],
      },
      {
        term: "Ciclo avanzado",
        subjects: [
          "Arquitectura de Software",
          "Desarrollo Web y Móvil",
          "Calidad y Pruebas de Software",
          "Gestión de Proyectos de Software",
        ],
      },
    ],
    images: [
      { label: "Laboratorio de desarrollo" },
      { label: "Estudiantes programando" },
      { label: "Proyecto en equipo" },
    ],
    projects: [
      {
        id: "sw-domotica",
        title: "Domótica IoT con ESP32",
        authors: ["Proyecto de referencia", "Ejemplo real (YouTube)"],
        summary: "Sistema de automatización del hogar controlado por internet.",
        description:
          "Sistema completo de domótica que usa microcontroladores ESP32, LEDs y servomotores para controlar dispositivos del hogar desde una Raspberry Pi o el ordenador, aplicando herramientas y prácticas estándar de la industria IoT.",
        youtubeId: YT.iotHome,
        images: [
          { label: "Demo del sistema" },
          { label: "Control de dispositivos" },
          { label: "Arquitectura IoT" },
        ],
        tags: ["IoT", "ESP32", "Automatización", "Hardware"],
        links: [
          { label: "Ver en YouTube", url: "https://www.youtube.com/watch?v=eidD14dXW8s" },
        ],
      },
      {
        id: "sw-rfid",
        title: "Cerradura Inteligente con RFID",
        authors: ["Proyecto de referencia", "Ejemplo real (YouTube)"],
        summary: "Control de acceso con Arduino y tarjetas RFID.",
        description:
          "Sistema de cerradura inteligente basado en Arduino y lector RFID que permite abrir una puerta solo con tarjetas autorizadas, un clásico proyecto de electrónica embebida y control de acceso.",
        youtubeId: YT.rfidLock,
        images: [{ label: "Lector RFID" }, { label: "Montaje del prototipo" }],
        tags: ["Arduino", "RFID", "Seguridad", "Embebidos"],
        links: [
          { label: "Ver en YouTube", url: "https://www.youtube.com/watch?v=3xb2PLFjJxk" },
        ],
      },
      {
        id: "sw-wled",
        title: "Iluminación Inteligente (ESP32 + WLED)",
        authors: ["Proyecto de referencia", "Ejemplo real (YouTube)"],
        summary: "Barra de luces LED controlada por app y voz.",
        description:
          "Barra de iluminación inteligente con ESP32 y el firmware open-source WLED, controlable desde el móvil y asistentes de voz, con efectos y escenas personalizables.",
        youtubeId: YT.ledWled,
        images: [{ label: "Efectos de luz" }, { label: "App de control" }],
        tags: ["ESP32", "WLED", "Open Source", "IoT"],
        links: [
          { label: "Ver en YouTube", url: "https://www.youtube.com/watch?v=RF2O21AznrA" },
        ],
      },
      {
        id: "sw-blynk",
        title: "Monitor Ambiental IoT (Blynk)",
        authors: ["Proyecto de referencia", "Ejemplo real (YouTube)"],
        summary: "Monitoreo de temperatura y control de relés desde el móvil.",
        description:
          "Proyecto IoT compacto con ESP32 y la plataforma Blynk que controla electrodomésticos en tiempo real desde el teléfono, con sensor DHT para medir el ambiente y operación offline por interruptores.",
        youtubeId: YT.esp32Blynk,
        images: [{ label: "Dashboard Blynk" }, { label: "Sensor + relés" }],
        tags: ["IoT", "ESP32", "Blynk", "Sensores"],
        links: [
          { label: "Ver en YouTube", url: "https://www.youtube.com/watch?v=JSqjUducJXo" },
        ],
      },
    ],
  },
  {
    id: "informatica",
    name: "Informática Gerencial",
    short: "Inf. Gerencial",
    color: "#16a37b",
    accent: "#7ef0c8",
    tagline: "Tecnología que genera valor empresarial.",
    description:
      "Informática Gerencial aplica los conocimientos informáticos a las áreas administrativas y gerenciales de las organizaciones. Capacita para entender cómo las TI optimizan procesos, mejoran la toma de decisiones y generan valor empresarial.",
    offer: [
      "Perfil que combina habilidades técnicas con conocimientos gerenciales.",
      "Salidas como analista de sistemas, consultor TI y gerente de proyectos.",
      "Enfoque en seguridad informática y desarrollo con software libre.",
      "Visión estratégica de la tecnología en la empresa.",
    ],
    stats: {
      grado: "Licenciatura",
      duracion: "≈ 5 años (10 trimestres)",
      creditos: "243 créditos",
      modalidad: "Semipresencial",
    },
    careerVideoId: YT.odooWhatIs,
    pensum: [
      {
        term: "Trimestres iniciales",
        subjects: [
          "Fundamentos de Informática",
          "Contabilidad",
          "Administración",
          "TIC I y II",
        ],
      },
      {
        term: "Trimestres intermedios",
        subjects: [
          "Bases de Datos",
          "Análisis de Sistemas",
          "Gestión de Proyectos",
          "Redes de Computadoras",
        ],
      },
      {
        term: "Trimestres finales",
        subjects: [
          "Informática Gerencial",
          "Desarrollo de Proyectos con Software Libre",
          "Seguridad Informática",
          "Inteligencia de Negocios",
        ],
      },
    ],
    images: [
      { label: "Análisis de datos empresariales" },
      { label: "Gestión de proyectos TI" },
    ],
    projects: [
      {
        id: "ig-powerbi",
        title: "Dashboard de Ventas en Power BI",
        authors: ["Proyecto de referencia", "Ejemplo real (YouTube)"],
        summary: "Tablero ejecutivo de ventas de principio a fin.",
        description:
          "Proyecto completo de Business Intelligence: importación y limpieza de datos, modelo relacional, medidas DAX, gráficos avanzados, filtros, pronóstico de ventas y publicación del dashboard. Un caso real de analítica para la toma de decisiones.",
        youtubeId: YT.powerBiSales,
        images: [{ label: "KPIs ejecutivos" }, { label: "Pronóstico de ventas" }],
        tags: ["Power BI", "BI", "DAX", "Analítica"],
        links: [
          { label: "Ver en YouTube", url: "https://www.youtube.com/watch?v=fZn83JRt4Nk" },
        ],
      },
      {
        id: "ig-odoo",
        title: "ERP para PYMES con Odoo",
        authors: ["Proyecto de referencia", "Ejemplo real (YouTube)"],
        summary: "Gestión integral del negocio en una sola plataforma.",
        description:
          "Implementación de Odoo, plataforma ERP modular y open-source, para estructurar catálogo, ventas, CRM e inventario de un negocio. Muestra cómo centralizar la operación de una PYME en un sistema integrado.",
        youtubeId: YT.odooWine,
        images: [{ label: "Catálogo y ventas" }, { label: "CRM integrado" }],
        tags: ["ERP", "Odoo", "CRM", "PYME"],
        links: [
          { label: "Ver en YouTube", url: "https://www.youtube.com/watch?v=ELLQQPiiX4s" },
        ],
      },
      {
        id: "ig-masterclass",
        title: "Masterclass de Tablero de Ventas",
        authors: ["Proyecto de referencia", "Ejemplo real (YouTube)"],
        summary: "Construcción guiada de un dashboard analítico.",
        description:
          "Clase magistral de análisis de datos: conexión y visualización de datos de ventas con medidas DAX, diseño de la página del dashboard y publicación para compartir insights con la organización.",
        youtubeId: YT.biMasterclass,
        images: [{ label: "Medidas DAX" }, { label: "Publicación del tablero" }],
        tags: ["BI", "Datos", "Visualización"],
        links: [
          { label: "Ver en YouTube", url: "https://www.youtube.com/watch?v=mXD0Peot4hY" },
        ],
      },
    ],
  },
  {
    id: "agrimensura",
    name: "Técnico en Agrimensura",
    short: "Agrimensura",
    color: "#f7941d",
    accent: "#ffd089",
    tagline: "Medición precisa del territorio.",
    description:
      "El Técnico en Agrimensura capacita profesionales con conocimiento en la medición de tierras, catastros urbanos y rurales, interpretación de fotografías aéreas, actualización de mapas y censo de parcelas y solares.",
    offer: [
      "Manejo de procedimientos para la adjudicación del derecho de propiedad.",
      "Participación activa en la planificación territorial pública o privada.",
      "Uso de tecnología para proyectos de medición con exactitud.",
      "Capacidad para gestionar y guiar proyectos del campo.",
    ],
    stats: {
      grado: "Técnico",
      duracion: "2 años",
      creditos: "129 créditos",
      modalidad: "Semipresencial",
    },
    careerVideoId: YT.droneSurvey,
    pensum: [
      {
        term: "Primer año",
        subjects: [
          "Topografía I",
          "Dibujo Técnico",
          "Matemática Aplicada",
          "Legislación de Tierras",
        ],
      },
      {
        term: "Segundo año",
        subjects: [
          "Topografía II",
          "Cartografía y SIG",
          "Fotogrametría",
          "Catastro y Geodesia",
        ],
      },
    ],
    images: [
      { label: "Levantamiento topográfico" },
      { label: "Equipo de medición GPS" },
    ],
    projects: [
      {
        id: "ag-dronemap",
        title: "Mapeo Profesional con Dron",
        authors: ["Proyecto de referencia", "Ejemplo real (YouTube)"],
        summary: "Flujo de fotogrametría: de las fotos al modelo 3D.",
        description:
          "Procesamiento de datos reales de un dron DJI para generar ortomosaicos, modelos digitales del terreno (DSM/DTM), nubes de puntos y reconstrucción 3D usando software profesional como Pix4D, Metashape y ArcGIS Reality Mapping.",
        youtubeId: YT.droneMapping,
        images: [{ label: "Ortomosaico aéreo" }, { label: "Modelo 3D del terreno" }],
        tags: ["Drones", "Fotogrametría", "GIS", "Pix4D"],
        links: [
          { label: "Ver en YouTube", url: "https://www.youtube.com/watch?v=_53GhvVwNbM" },
        ],
      },
      {
        id: "ag-rtk",
        title: "Topografía con Dron y RTK",
        authors: ["Proyecto de referencia", "Ejemplo real (YouTube)"],
        summary: "Levantamiento de linderos con precisión centimétrica.",
        description:
          "Uso de drones con GPS RTK para levantamientos topográficos y delimitación de linderos, reemplazando jornadas de estación total por vuelos de pocas horas con exactitud de hasta 1 cm.",
        youtubeId: YT.droneSurvey,
        images: [{ label: "Vuelo con RTK" }, { label: "Mapa parcelario" }],
        tags: ["RTK", "GPS", "Catastro", "UAV"],
        links: [
          { label: "Ver en YouTube", url: "https://www.youtube.com/watch?v=CSTodaZb4Vc" },
        ],
      },
    ],
  },
  {
    id: "tic",
    name: "Tecnologías de la Información (TIC)",
    short: "TIC",
    color: "#9b5cf6",
    accent: "#d3b8ff",
    tagline: "La base digital de toda profesión.",
    description:
      "La Escuela de Ingeniería y Tecnología administra las asignaturas de Tecnología de la Información y Comunicación I y II, que se imparten en todas las carreras de la UAPA, dotando a cada estudiante de competencias digitales fundamentales.",
    offer: [
      "Competencias digitales transversales para todas las carreras.",
      "Dominio de herramientas ofimáticas y colaborativas.",
      "Fundamentos de internet, seguridad y ciudadanía digital.",
      "Base tecnológica para el aprendizaje en línea de la UAPA.",
    ],
    stats: {
      grado: "Asignaturas transversales",
      duracion: "TIC I y II",
      creditos: "Obligatorias",
      modalidad: "Semipresencial / Virtual",
    },
    careerVideoId: YT.powerBiCourse,
    pensum: [
      {
        term: "TIC I",
        subjects: [
          "Manejo del entorno digital",
          "Procesador de texto y hojas de cálculo",
          "Presentaciones efectivas",
          "Plataforma de aprendizaje UAPA",
        ],
      },
      {
        term: "TIC II",
        subjects: [
          "Internet y búsqueda de información",
          "Herramientas colaborativas en la nube",
          "Seguridad y ciudadanía digital",
          "Producción de contenido digital",
        ],
      },
    ],
    images: [
      { label: "Aula virtual UAPA" },
      { label: "Herramientas colaborativas" },
    ],
    projects: [
      {
        id: "tic-phishing",
        title: "Concientización: Correo y Phishing",
        authors: ["Proyecto de referencia", "Ejemplo real (YouTube)"],
        summary: "Cómo reconocer y evitar ataques de phishing.",
        description:
          "Módulo de concientización en seguridad que explica los métodos que usan los atacantes para engañar por correo (enlaces, adjuntos, urgencia) y las claves para detectar y reportar phishing de forma segura. Competencia digital esencial para toda la comunidad universitaria.",
        youtubeId: YT.phishing,
        images: [{ label: "Señales de phishing" }, { label: "Verificar enlaces" }],
        tags: ["Ciberseguridad", "Phishing", "Buenas prácticas"],
        links: [
          { label: "Ver en YouTube", url: "https://www.youtube.com/watch?v=sEMrBKmUTPE" },
        ],
      },
      {
        id: "tic-datos",
        title: "Herramientas Digitales y Datos",
        authors: ["Proyecto de referencia", "Ejemplo real (YouTube)"],
        summary: "Del dato a la decisión con herramientas modernas.",
        description:
          "Introducción práctica a las herramientas digitales y al análisis de datos: formateo, visualizaciones, relaciones y construcción de un proyecto completo, fortaleciendo las competencias TIC transversales a todas las carreras.",
        youtubeId: YT.powerBiCourse,
        images: [{ label: "Visualización de datos" }, { label: "Proyecto guiado" }],
        tags: ["Datos", "Ofimática", "Competencias digitales"],
        links: [
          { label: "Ver en YouTube", url: "https://www.youtube.com/watch?v=I0vQ_VLZTWg" },
        ],
      },
    ],
  },
];

// =============================================================
//  Derivados: estaciones (stands) con posición en el recinto.
//  Por cada carrera generamos: 1 stand de carrera + N de proyecto.
// =============================================================

export type StationKind = "carrera" | "project";

export interface Station {
  uid: string;
  kind: StationKind;
  index: number;
  // metadatos de carrera (presentes en ambos tipos)
  carreraId: string;
  carreraName: string;
  carreraShort: string;
  color: string;
  accent: string;
  // contenido
  title: string;
  subtitle: string;
  // payload específico
  carrera?: Carrera;
  project?: Project;
  // ubicación
  position: [number, number, number];
  rotationY: number;
  side: -1 | 1;
}

const AISLE_HALF = 5.5; // media anchura del pasillo central
const STAND_SPACING = 9; // separación entre stands a lo largo del pasillo
const START_Z = -8;

export function buildStations(): Station[] {
  const seq: Array<
    Pick<
      Station,
      | "kind"
      | "carreraId"
      | "carreraName"
      | "carreraShort"
      | "color"
      | "accent"
      | "title"
      | "subtitle"
      | "carrera"
      | "project"
    >
  > = [];

  for (const c of CARRERAS) {
    seq.push({
      kind: "carrera",
      carreraId: c.id,
      carreraName: c.name,
      carreraShort: c.short,
      color: c.color,
      accent: c.accent,
      title: c.name,
      subtitle: c.tagline,
      carrera: c,
    });
    for (const p of c.projects) {
      seq.push({
        kind: "project",
        carreraId: c.id,
        carreraName: c.name,
        carreraShort: c.short,
        color: c.color,
        accent: c.accent,
        title: p.title,
        subtitle: p.summary,
        project: p,
      });
    }
  }

  return seq.map((s, i) => {
    const side: -1 | 1 = i % 2 === 0 ? -1 : 1;
    const row = Math.floor(i / 2);
    const z = START_Z - row * STAND_SPACING;
    const x = side * AISLE_HALF;
    const rotationY = side === -1 ? Math.PI / 2 : -Math.PI / 2;
    return {
      ...s,
      uid: s.kind === "carrera" ? `c-${s.carreraId}` : `p-${s.project!.id}`,
      index: i,
      position: [x, 0, z],
      rotationY,
      side,
    };
  });
}

export const STATIONS = buildStations();

/** Índice de los stands de carrera (para accesos directos). */
export const CARRERA_STATIONS = STATIONS.filter((s) => s.kind === "carrera");

export const HALL_LENGTH = Math.ceil(STATIONS.length / 2) * STAND_SPACING + 26;
export const HALL_WIDTH = AISLE_HALF * 2 + 9;
export const AISLE_HALF_WIDTH = AISLE_HALF;
