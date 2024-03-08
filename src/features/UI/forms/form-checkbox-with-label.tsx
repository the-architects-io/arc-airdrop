import classNames from "classnames";
import { FormikHandlers } from "formik";

interface Props {
  label: string;
  onChange: FormikHandlers["handleChange"];
  value: boolean;
  name: string;
  className?: string;
  disabled?: boolean;
}

export const FormCheckboxWithLabel = ({
  label,
  onChange,
  value,
  name,
  className,
  disabled,
  ...props
}: Props) => {
  return (
    <div className="flex justify-start">
      <label
        htmlFor={name}
        className={classNames(["flex flex-col items-start w-auto", className])}
      >
        <span className="mb-1 text-2xl">{label}</span>
        <input
          className={classNames([
            "w-12 h-12 rounded-md active:ring-2 active:ring-cyan-400 shadow-md",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          ])}
          type="checkbox"
          name={name}
          checked={value || false}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
      </label>
    </div>
  );
};
