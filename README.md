# UAPAverse · Feria Virtual 3D (DEMO)

> **Aviso:** Este repositorio es un **DEMO DE EJEMPLO** creado como referencia/propuesta
> para el **grupo de pasantías encargado del proyecto UAPAverse** de la Escuela de
> Ingeniería y Tecnología de la **Universidad Abierta para Adultos (UAPA)**.
>
> No es la versión oficial ni final. Los textos, imágenes, videos, pensums y proyectos
> son **contenido de ejemplo / placeholder** y deben reemplazarse por la información
> oficial de la UAPA.

UAPAverse es una **feria virtual 3D navegable en el navegador**: un pabellón de expo por
el que el visitante "camina" en primera persona y recorre **stands por carrera** (con su
descripción, pensum, video e imágenes) y **stands de proyectos**, con una experiencia
inmersiva tipo feria real.

---

## ✨ Características

- **Recorrido 3D en primera persona** (WASD + ratón en PC, joystick táctil + arrastrar en móvil).
- **Tour guiado** automático por paradas y **navegación rápida** por carrera.
- **Stands de carrera**: descripción, "qué ofrece la UAPA", datos (grado, duración,
  créditos, modalidad), **pensum** y **video** explicativo.
- **Stands de proyectos** con miniatura real de YouTube, imágenes, descripción y enlace al video.
- **Minimapa** interactivo, **pantalla de carga**, **audio ambiente** y postprocesado (bloom, viñeta).
- **Asistente de voz con IA ("ARI")** por stand: mantén pulsado para preguntar por voz y
  responde hablando, usando un modelo de **Google Gemini** con el contexto de cada stand.

## 🧩 Carreras incluidas (ejemplo)

- Ingeniería en Software
- Informática Gerencial
- Técnico en Agrimensura
- Tecnologías de la Información (TIC)

## 🛠️ Tecnologías

- **React + TypeScript + Vite**
- **React Three Fiber** + **drei** + **postprocessing** (Three.js)
- **Zustand** (estado), **Tailwind CSS** + **Framer Motion** (UI)
- **Google Gemini API** (asistente de voz) + Web Audio / SpeechSynthesis

---

## 🚀 Cómo ejecutarlo

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar la clave de IA (opcional, para el asistente de voz)
cp .env.example .env
# y edita .env con tu clave de Google AI Studio (https://aistudio.google.com/app/apikey)

# 3. Levantar el entorno de desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

### Variables de entorno

| Variable | Descripción |
| --- | --- |
| `VITE_GEMINI_API_KEY` | Clave de Google AI Studio (Gemini) para el asistente de voz. |
| `VITE_GEMINI_MODEL` | Modelo a usar (por defecto `gemini-2.5-flash`). |

> ⚠️ **Seguridad:** al ser una app web, la clave viaja al navegador y es visible para el
> usuario. Úsala **solo para demo/pruebas**. El archivo `.env` está en `.gitignore` y no
> se sube al repositorio.

---

## 📁 Dónde editar el contenido

Todo el contenido de la feria (carreras, descripciones, pensums, proyectos, videos e
imágenes) vive en un único archivo, sin tener que tocar la escena 3D:

```
src/data/feria.ts
```

El recinto 3D, los stands y el minimapa se generan automáticamente a partir de esos datos.

## 🗂️ Estructura

```
src/
├── data/feria.ts        # Datos de carreras, proyectos, pensums y videos
├── three/               # Escena 3D (pabellón, stands, jugador, texturas)
├── ui/                  # Interfaz 2D (portada, HUD, modal, minimapa, joystick, asistente)
├── ai/                  # Asistente de voz: Gemini, grabación, contexto por stand
└── store.ts             # Estado global (Zustand)
```

---

Hecho como demo de propuesta para el equipo de **UAPAverse · UAPA**.
