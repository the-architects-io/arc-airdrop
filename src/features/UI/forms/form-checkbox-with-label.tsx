import classNames from "classnames";
import { FormikHandlers } from "formik";

interface Props {
  label: string;
  onChange: FormikHandlers["handleChange"];
  value: boolean;
  name: string;
  className?: string;
}

export const FormCheckboxWithLabel = ({
  label,
  onChange,
  value,
  name,
  className,
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
          className="w-12 h-12 rounded-md active:ring-2 active:ring-cyan-400"
          type="checkbox"
          name={name}
          checked={value || false}
          onChange={onChange}
        />
      </label>
    </div>
  );
};
