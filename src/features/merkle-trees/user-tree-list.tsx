import { MerkleTree } from "@/app/blueprint/types";
import { MerkleTreesTable } from "@/features/merkle-trees/merkle-trees-table";
import { useUserData } from "@nhost/nextjs";

export const UserTreeList = ({
  refetch,
  trees,
}: {
  refetch: () => void;
  trees: MerkleTree[];
}) => {
  const user = useUserData();

  return (
    <>
      {trees?.length === 0 ? (
        <p>No merkle trees found</p>
      ) : (
        <MerkleTreesTable trees={trees} />
      )}
    </>
  );
};
