import React from 'react';
import { ESLOGAN_BIENVENIDA, SUBTITULO_BIENVENIDA } from './constants';
import './cuestionario.css';

/**
 * BienvenidaHeader
 *
 * Componente React que renderiza el header de bienvenida del cuestionario.
 *
 * Requisitos:
 * - HU-01: Mostrar mensaje de bienvenida con eslogan
 * - RF-01: Eslogan de bienvenida en parte superior
 * - RF-02: Breve, atractivo, coherente con identidad
 * - RNF-01: Accesible a todos los usuarios
 * - RNF-02: Breve y fácil de comprender
 * - RNF-10: Responsive (mobile y desktop)
 * - A-5: Uso de variables CSS
 *
 * Características:
 * - Responsive: se ajusta a mobile, tablet y desktop
 * - Accesible: semántica correcta (heading + decorativo)
 * - Personalizable: eslogan desde constants.ts
 * - Estilos coherentes: utiliza variables CSS del sistema
 *
 * Referencia: spec.md § 3.2, tasks.md § T013
 */
export const BienvenidaHeader: React.FC = () => {
  return (
    <header className="bienvenida-header">
      <div className="bienvenida-header__content">
        <h1 className="bienvenida-header__eslogan">{ESLOGAN_BIENVENIDA}</h1>
        <p className="bienvenida-header__subtitulo">{SUBTITULO_BIENVENIDA}</p>
      </div>
    </header>
  );
};

export default BienvenidaHeader;
