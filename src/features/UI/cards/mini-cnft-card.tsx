import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const MiniCnftCard = ({ className }: { className?: string }) => {
  const router = useRouter();

  return (
    <div
      className={classNames([
        "w-full flex flex-col items-center justify-center mb-4 px-2",
        className,
      ])}
    >
      <div className="shadow-deep rounded-b-md">
        <div className="bg-gray-500 w-full rounded-t-md ">
          <Image
            className="rounded-t-md"
            src={"https://picsum.photos/200"}
            alt={""}
            width={500}
            height={500}
          />
        </div>
        <div className="text-gray-100 bg-gray-500 p-4 w-full space-y-2 rounded-b-md">
          <div>[ name ]</div>
          <div>[ description ]</div>
          <div>[ url ]</div>
          <div className="w-full flex justify-center">
            <div className="text-3xl text-cyan-400">100</div>
          </div>
        </div>
      </div>
    </div>
  );
};
