import { FormInput } from "@/features/UI/forms/form-input";
import classNames from "classnames";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  className?: string;
  inputClassName?: string;
}

export const FormInputWithLabel = ({
  children,
  onChange,
  value,
  label,
  description,
  className,
  inputClassName,
  ...props
}: Props) => {
  return (
    <label
      htmlFor={props.name}
      className={classNames(["flex flex-col w-full text-2xl", className])}
    >
      {label}
      <FormInput
        className={classNames(["mt-1", inputClassName])}
        type={props.type || "text"}
        name={props.name}
        placeholder={props.placeholder}
        onChange={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange?.(e);
        }}
        value={value}
        {...props}
      />
      {children}
      {description && (
        <p className="text-sm text-gray-400 mt-2 italic">{description}</p>
      )}
    </label>
  );
};
