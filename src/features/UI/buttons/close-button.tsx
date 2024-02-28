import { XCircleIcon } from "@heroicons/react/24/outline";

export const CloseButton = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) => {
  return (
    <button onClick={onClick} className="absolute -mt-4 -mr-4 top-0 right-0">
      <XCircleIcon className="h-10 w-10 text-gray-100 bg-black rounded-full" />
    </button>
  );
};
