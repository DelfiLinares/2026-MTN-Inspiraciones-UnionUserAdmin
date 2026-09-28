import "./bot-n-continuar.css";

export interface BotNContinuarProps {
  property1: "default";

  className: string;
}

export const BotNContinuar = ({
  property1 = "default",
  className,
}: BotNContinuarProps): JSX.Element => {
  return (
    <div className={`bot-n-continuar ${className}`}>
      <div className="overlap-group">
        <div className="rectangle" />
        <div className="continuar">Registrarse</div>
      </div>
    </div>
  );
};
