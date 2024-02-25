"use client";
import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode | string;
  type?: "submit" | undefined;
  disabled?: boolean;
}

export const PrimaryButton = ({ disabled, children, ...props }: Props) => {
  return (
    <button
      onClick={props?.onClick}
      disabled={disabled}
      className={classNames([
        "cursor-pointer shadow-sm bg-cyan-400 hover:bg-cyan-600 focus:outline-none focus:ring-cyan-500 text-gray-100 rounded-xl p-4 py-2 border transition-all duration-300 ease-in-out flex justify-center items-center hover:shadow-xl focus:shadow-xl disabled:shadow-none disabled:bg-cyan-300 disabled:text-gray-400 disabled:border-none disabled:hover:shadow-none disabled:focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        props.className,
      ])}
      type={props.type}
    >
      <>{children}</>
    </button>
  );
};
