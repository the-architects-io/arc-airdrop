import { FormInput } from "@/features/UI/forms/form-input";
import classNames from "classnames";
import { useEffect, useRef } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export const FormInputWithLabel = ({
  children,
  onChange,
  value,
  label,
  description,
  className,
  inputClassName,
  disabled,
  ...props
}: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        inputRef.current.blur();
      }
    };

    document.addEventListener("wheel", handleWheel);

    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, []);

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
        disabled={disabled}
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
