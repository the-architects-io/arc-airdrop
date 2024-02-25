import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const ContentWrapper = ({ children, className }: Props) => {
  return (
    <div
      className={classNames([
        "max-w-6xl w-full mx-auto  min-h-screen min-w-screen",
        className,
      ])}
    >
      {children}
    </div>
  );
};
