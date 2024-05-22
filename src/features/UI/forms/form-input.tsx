import classNames from "classnames";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {}

export const FormInput = ({ children, onChange, value, ...props }: Props) => {
  return (
    <input
      onWheel={(e) =>
        props.type === "number" && (e.target as HTMLElement).blur()
      }
      type={props.type || "text"}
      name={props.name}
      placeholder={props.placeholder}
      disabled={props.disabled}
      className={classNames(
        "w-full px-4 py-2 text-gray-100 bg-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 shadow-md",
        props.className
      )}
      onChange={onChange}
      value={value}
      min={props.min}
      max={props.max}
    />
  );
};
