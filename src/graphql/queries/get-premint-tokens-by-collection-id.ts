import { gql } from "@apollo/client";

export const GET_PREMINT_TOKENS_BY_COLLECTION_ID = gql`
  query GET_PREMINT_TOKENS_BY_COLLECTION_ID($id: uuid!) {
    tokens(where: { collectionId: { _eq: $id } }) {
      amountToMint
      shouldFillRemaining
      animation_url
      attributes
      cluster
      collection {
        id
      }
      createdAt
      creators
      description
      external_url
      id
      image
      isPremint
      name
      properties
      seller_fee_basis_points
      symbol
      updatedAt
      imageSizeInBytes
    }
  }
`;
