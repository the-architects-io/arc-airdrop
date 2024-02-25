import classNames from "classnames";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {}

export const FormInput = ({ children, onChange, value, ...props }: Props) => {
  return (
    <input
      type={props.type || "text"}
      name={props.name}
      placeholder={props.placeholder}
      className={classNames(
        "w-full px-4 py-2 text-stone-300 bg-gray-500 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 ",
        props.className
      )}
      onChange={onChange}
      value={value}
      min={props.min}
      max={props.max}
    />
  );
};
