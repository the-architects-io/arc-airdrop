"use client";
import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode | string;
  type?: "submit" | undefined;
  disabled?: boolean;
}

export const FabButton = ({ disabled, children, ...props }: Props) => {
  return (
    <button
      onClick={props?.onClick}
      disabled={disabled}
      className={classNames([
        "rounded-full text-gray-400 bg-gray-100 px-4 py-2 text-sm shadow-deep hover:shadow-deep-float transition-all",
        props.className,
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ])}
      type={props.type}
    >
      <>{children}</>
    </button>
  );
};
