import "./fluent-accept.css";

export interface FluentAcceptProps {
  className: string;
}

export const FluentAccept = ({ className }: FluentAcceptProps): JSX.Element => {
  return <img className={`fluent-accept ${className}`} alt="Fluent accept" />;
};
