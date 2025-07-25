import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode | string;
  type?: "submit" | undefined;
  disabled?: boolean;
}

export const SecondaryButton = ({ disabled, children, ...props }: Props) => {
  return (
    <button
      onClick={props?.onClick}
      className={classNames([
        "cursor-pointer bg-gray-400 hover:bg-gray-600 focus:outline-none focus:ring-gray-500 text-gray-100 p-4 py-2 border border-gray-400 transition-all duration-300 ease-in-out flex justify-center items-center focus:shadow-xl disabled:shadow-none disabled:border-none disabled:hover:shadow-none disabled:focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50 disabled:hover:scale-[1em] rounded-md shadow-lg hover:shadow-deep hover:scale-[1.05]",
        props.className,
      ])}
      disabled={disabled}
      type={props.type}
    >
      <>{children}</>
    </button>
  );
};
