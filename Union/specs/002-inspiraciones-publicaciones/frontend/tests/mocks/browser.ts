// Worker MSW para el navegador en modo desarrollo (T027).

import { setupWorker } from "msw/browser";
import { carpetasHandlers } from "./handlers/carpetas";
import { likesHandlers } from "./handlers/likes";
import { publicacionesHandlers } from "./handlers/publicaciones";
import { reportesHandlers } from "./handlers/reportes";
import { sesionHandlers } from "./handlers/sesion";

export const worker = setupWorker(
  ...sesionHandlers,
  ...publicacionesHandlers,
  ...likesHandlers,
  ...carpetasHandlers,
  ...reportesHandlers,
);
