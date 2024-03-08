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
    <div className="flex flex-col w-1/3 px-2 mb-4" key={token.id}>
      <div className="flex flex-col h-full max-h-[450px] rounded-md bg-gray-500">
        <div className="shadow-deep rounded-b-md flex flex-col h-full">
          <div className="bg-gray-500 rounded-t-md">
            <Image
              className="rounded-t-md object-cover w-full"
              src={token?.image}
              alt={"Token image"}
              layout="responsive"
              width={500}
              height={500}
            />
          </div>
          <div className="flex flex-col flex-grow p-4">
            <div className="text-gray-100 space-y-3 flex-grow">
              <div className="text-2xl font-bold line-clamp-1">
                {token?.name}
              </div>
              <div className="text-base italic line-clamp-2">
                {token?.description}
              </div>
              <div className="text-base">{token?.external_url}</div>
            </div>
            <div className="text-3xl text-cyan-400 flex justify-center">
              {token?.shouldFillRemaining ? "fill" : token?.amountToMint}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
