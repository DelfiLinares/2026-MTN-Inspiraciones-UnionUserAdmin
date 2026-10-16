// Servidor MSW para entornos de test (Node / Vitest) (T027).
// Combina todos los handlers REST del frontend simulado.

import { setupServer } from "msw/node";
import { carpetasHandlers } from "./handlers/carpetas";
import { likesHandlers } from "./handlers/likes";
import { publicacionesHandlers } from "./handlers/publicaciones";
import { reportesHandlers } from "./handlers/reportes";
import { sesionHandlers } from "./handlers/sesion";

export const todosLosHandlers = [
  ...sesionHandlers,
  ...publicacionesHandlers,
  ...likesHandlers,
  ...carpetasHandlers,
  ...reportesHandlers,
];

export const server = setupServer(...todosLosHandlers);
