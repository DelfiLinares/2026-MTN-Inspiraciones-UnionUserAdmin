import "./bot-n-login.css";

export interface BotNLoginProps {
  property1: "default";

  className: string;
}

export const BotNLogin = ({
  property1 = "default",
  className,
}: BotNLoginProps): JSX.Element => {
  return (
    <div className={`bot-n-login ${className}`}>
      <div className="text-wrapper">Iniciar sesión</div>
    </div>
  );
};
