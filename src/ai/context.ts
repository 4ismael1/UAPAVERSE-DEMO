import type { Station } from "../data/feria";
import { FERIA } from "../data/feria";

/** Construye el contexto textual que se le da a la IA para cada stand. */
export function buildStationContext(station: Station): string {
  const base = `Feria: ${FERIA.title} (${FERIA.demoTag}). ${FERIA.university}. ${FERIA.school}.`;

  if (station.kind === "carrera" && station.carrera) {
    const c = station.carrera;
    const pensum = c.pensum
      .map((t) => `  - ${t.term}: ${t.subjects.join(", ")}`)
      .join("\n");
    return `${base}

STAND DE CARRERA: ${c.name}
Lema: ${c.tagline}
Descripción: ${c.description}
Qué ofrece la UAPA:
${c.offer.map((o) => `  - ${o}`).join("\n")}
Datos: Grado ${c.stats.grado}; Duración ${c.stats.duracion}; ${c.stats.creditos}; Modalidad ${c.stats.modalidad}.
Pensum (representativo):
${pensum}
Proyectos de esta carrera en la feria: ${c.projects
      .map((p) => p.title)
      .join(", ")}.`;
  }

  if (station.kind === "project" && station.project) {
    const p = station.project;
    return `${base}

STAND DE PROYECTO: ${p.title}
Carrera: ${station.carreraName}
Resumen: ${p.summary}
Descripción: ${p.description}
Tecnologías/etiquetas: ${p.tags.join(", ")}
Autores/origen: ${p.authors.join(", ")}.`;
  }

  return base;
}

export const SYSTEM_PROMPT = `Eres "ARI", el guía virtual por voz de la feria 3D UAPAverse de la Escuela de Ingeniería y Tecnología de la UAPA.
- Respondes SIEMPRE en español, de forma breve (máximo 3-4 frases), clara, cálida y entusiasta.
- Te basas ÚNICAMENTE en el CONTEXTO del stand que se te entrega. Si la respuesta no está en el contexto, dilo con honestidad y sugiere explorar otros stands.
- Hablas de forma natural y conversacional, como un anfitrión de feria; evita listas largas y tecnicismos innecesarios.
- No inventes datos de la UAPA que no estén en el contexto.
- Si te saludan o preguntan algo general, responde amablemente e invita a preguntar sobre el stand actual.`;
