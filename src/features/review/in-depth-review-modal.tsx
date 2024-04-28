import { Airdrop, Collection, MerkleTree } from "@/app/blueprint/types";
import { useCluster } from "@/hooks/cluster";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function InDepthReviewModal({
  close,
  airdrop,
  collection,
  merkleTree,
  driveAddress,
}: {
  close: () => void;
  airdrop: Airdrop;
  collection: Collection;
  merkleTree: MerkleTree | null;
  driveAddress: string | undefined;
}) {
  const { cluster } = useCluster();
  return (
    <div className="absolute top-8 right-8 left-8 bottom-8 rounded-lg shadow-deep-float p-8 z-50 backdrop-blur-md bg-gray-100 bg-opacity-80 backdrop-opacity-100 backdrop-contrast-120 overflow-auto">
      <div className="fixed top-6 right-6">
        <button onClick={close}>
          <XMarkIcon className="cursor-pointer w-6 h-6" />
        </button>
      </div>
      <div className="w-full flex justify-center py-4">
        <div className="">
          <div className="flex py-2">
            <div className="mr-4 font-bold">cluster:</div>
            <div>{cluster}</div>
          </div>
          <div className="flex py-2">
            <div className="mr-4 font-bold">collection name:</div>
            <div>{collection.name}</div>
          </div>
          <div className="flex py-2">
            <div className="mr-4 font-bold">collection symbol:</div>
            <div>{collection.symbol}</div>
          </div>
          <div className="flex py-2">
            <div className="mr-4 font-bold">collection image size:</div>
            <div>{collection.imageSizeInBytes} bytes</div>
          </div>
          <div className="flex py-2">
            <div className="mr-4 font-bold">combined token images size:</div>
            <div>{collection.tokenImagesSizeInBytes} bytes</div>
          </div>
          <div className="flex py-2">
            <div className="mr-4 font-bold">total tokens:</div>
            <div>{collection.tokenCount}</div>
          </div>
          <div className="flex py-2">
            <div className="mr-4 font-bold">description:</div>
            <div>{collection.description}</div>
          </div>
          <div className="flex py-2">
            <div className="mr-4 font-bold">royalty percentage:</div>
            <div>{collection.sellerFeeBasisPoints / 100}%</div>
          </div>
          <div className="flex py-2">
            <div className="mr-4 font-bold">merkle tree address:</div>
            <div>{!!merkleTree ? merkleTree.address : "not set"}</div>
          </div>
          {!!merkleTree && (
            <>
              <div className="flex py-2">
                <div className="mr-4 font-bold">merkle tree max capacity:</div>
                <div>{merkleTree?.maxCapacity}</div>
              </div>
              <div className="flex py-2">
                <div className="mr-4 font-bold">
                  merkle tree max buffer size:
                </div>
                <div>{merkleTree?.maxBufferSize}</div>
              </div>
              <div className="flex py-2">
                <div className="mr-4 font-bold">merkle tree max depth:</div>
                <div>{merkleTree?.maxDepth}</div>
              </div>
            </>
          )}
          <div className="flex py-2">
            <div className="mr-4 font-bold">drive address:</div>
            <div>
              {!!collection?.driveAddress ? collection.driveAddress : "not set"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
