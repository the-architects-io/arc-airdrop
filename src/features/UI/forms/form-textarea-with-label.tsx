import classNames from "classnames";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
}

export const FormTextareaWithLabel = ({
  onChange,
  value,
  label,
  description,
  ...props
}: Props) => {
  return (
    <label htmlFor={props.name} className="flex flex-col w-full ">
      <div className="mb-1 text-2xl">{label}</div>
      <textarea
        rows={props.rows || 3}
        cols={props.cols || 50}
        name={props.name}
        placeholder={props.placeholder}
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
