import classNames from "classnames";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export const FormTextareaWithLabel = ({
  onChange,
  value,
  label,
  description,
  disabled,
  ...props
}: Props) => {
  return (
    <label
      htmlFor={props.name}
      className={classNames("flex flex-col w-full", props.className)}
    >
      <div className="mb-1">{label}</div>
      <textarea
        rows={props.rows || 3}
        cols={props.cols || 50}
        name={props.name}
        placeholder={props.placeholder}
        disabled={disabled}
        className={classNames(
          "w-full px-4 py-2 text-gray-100 bg-gray-400 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 ",
          props.className
        )}
        onChange={onChange}
        value={value}
      />
      {description && (
        <p className="text-sm text-gray-400 my-4 italic">{description}</p>
      )}
    </label>
  );
};
