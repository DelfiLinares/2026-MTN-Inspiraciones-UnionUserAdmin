import { AkarIconsGithub } from "../AkarIconsGithub/AkarIconsGithub";
import { BotNContinuar } from "../BotNContinuar/BotNContinuar";
import { BotNLogin } from "../BotNLogin/BotNLogin";
import { FluentAccept } from "../FluentAccept/FluentAccept";
import line2 from "./line-2.svg";
import "./style.css";

export const Registro = (): JSX.Element => {
  return (
    <div className="registro">
      <div className="div">
        <div className="auto">
          <div className="overlap">
            <FluentAccept className="fluent-mdl-accept" />
          </div>
          <img className="line" alt="Line" src={line2} />
          <AkarIconsGithub className="akar-icons-github-fill" />
        </div>
        <div className="auto-flex">
          <div className="auto-flex-2">
            <div className="text-wrapper-2">Crear cuenta</div>
            <div className="overlap-2">
              <div className="rectangle-2" />
              <div className="rectangle-3" />
              <div className="text-wrapper-3">Nombre</div>
            </div>
            <div className="overlap-3">
              <div className="rectangle-4" />
              <div className="rectangle-5" />
              <div className="text-wrapper-4">Contraseña</div>
            </div>
            <div className="overlap-3">
              <div className="rectangle-4" />
              <div className="rectangle-6" />
              <div className="text-wrapper-4">Correo</div>
            </div>
            <p className="p">Acepto todos los terminos y condiciones.</p>
            <BotNContinuar className="botn-continuar" property1="default" />
            <div className="div-wrapper">
              <div className="text-wrapper-5">Continuar con Google</div>
            </div>
            <div className="overlap-4">
              <div className="text-wrapper-5">Continuar con GitHub</div>
            </div>
          </div>
          <div className="overlap-5">
            <div className="ellipse" />
            <div className="ellipse-2" />
            <div className="text-wrapper-6">Empezá a crear</div>
            <div className="text-wrapper-7">¿Ya tenés una cuenta?</div>
            <BotNLogin className="botn-login" property1="default" />
          </div>
        </div>
      </div>
    </div>
  );
};
