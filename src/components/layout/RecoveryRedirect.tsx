"use client";

import { useEffect } from "react";

/**
 * El link del mail de "recuperar contraseña" vuelve al inicio con la sesión
 * temporal en el # de la URL. Si se detecta, se lo lleva a la pantalla para
 * elegir la contraseña nueva (conservando el #).
 */
export function RecoveryRedirect() {
  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) {
      window.location.replace("/auth/nueva-contrasena" + window.location.hash);
    }
  }, []);
  return null;
}
