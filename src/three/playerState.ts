// Estado mutable de baja frecuencia para el jugador.
// Se escribe desde el bucle de render (Player) y se lee desde el
// minimapa vía requestAnimationFrame, evitando re-renders de React.
export const playerState = {
  x: 0,
  z: 7,
  yaw: 0,
};
