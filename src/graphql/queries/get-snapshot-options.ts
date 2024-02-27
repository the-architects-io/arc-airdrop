import { gql } from "@apollo/client";

export const GET_SNAPSHOT_OPTIONS = gql`
  query GET_SNAPSHOT_OPTIONS {
    snapshotOptions(order_by: { sortOrder: asc }) {
      updatedAt
      name
      imageUrl
      firstVerifiedCreatorAddress
      id
      createdAt
      collectionAddress
      sortOrder
    }
  }
`;
