import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ContentWrapperYAxisCenteredContent = ({
  children,
  className,
  onClick,
}: Props) => (
  <div
    onClick={onClick}
    className={classNames([
      "flex flex-col items-center h-app min-h-screen",
      className?.split(" ").includes("justify-start")
        ? "justify-start"
        : "justify-center",
    ])}
  >
    {children}
  </div>
);
