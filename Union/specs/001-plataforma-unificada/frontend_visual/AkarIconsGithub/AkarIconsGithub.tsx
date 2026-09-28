import "./akar-icons-github.css";

export interface AkarIconsGithubProps {
  className: string;
}

export const AkarIconsGithub = ({
  className,
}: AkarIconsGithubProps): JSX.Element => {
  return (
    <img className={`akar-icons-github ${className}`} alt="Akar icons github" />
  );
};
