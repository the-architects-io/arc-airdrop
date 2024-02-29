import { Token } from "@/app/blueprint/types";
import classNames from "classnames";
import Image from "next/image";

export const MiniCnftCard = ({
  className,
  token,
}: {
  className?: string;
  token: Token;
}) => {
  return (
    <div
      className={classNames([
        "w-full flex flex-col items-center justify-center mb-4 px-2",
        className,
      ])}
    >
      <div className="w-full md:w-1/3 shadow-deep rounded-b-md">
        <div className="bg-gray-500 w-full rounded-t-md ">
          <Image
            className="rounded-t-md"
            src={token?.image}
            alt={"Token image"}
            width={500}
            height={500}
          />
        </div>
        <div className="text-gray-100 bg-gray-500 p-4 w-full space-y-2 rounded-b-md">
          <div className="text-2xl font-bold">{token?.name}</div>
          <div className="text-lg">{token?.description}</div>
          <div className="text-lg">{token?.external_url}</div>
          <div className="w-full flex justify-center">
            <div className="text-3xl text-cyan-400">{token?.amountToMint}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
