import Spinner from "@/features/UI/spinner";

export const Overlay = ({
  message,
  showLoader,
}: {
  message?: string;
  showLoader?: boolean;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="text-gray-100 bg-gray-400 p-4 rounded-md h-48 w-56 flex flex-col items-center justify-center text-3xl space-y-4 text-center">
        <div>{message}</div>
        {showLoader && <Spinner />}
      </div>
    </div>
  );
};
