import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode | string;
  type?: "submit" | undefined;
}

export const SecondaryButton = ({ children, ...props }: Props) => {
  return (
    <button
      onClick={props?.onClick}
      className={classNames([
        "bg-stone-300 hover:bg-gray-300 rounded-xl p-4 py-2 uppercase text-stone-900",
        props.className,
      ])}
      type={props.type}
    >
      <>{children}</>
    </button>
  );
};
