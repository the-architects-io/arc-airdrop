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
      creators_deprecated
      description
      external_url
      animation_url
      id
      image
      isPremint
      merkleTree {
        address
        canopyDepth
        capacity
        cluster
        id
        maxBufferSize
        maxCapacity
        maxDepth
        updatedAt
      }
      name
      properties
      seller_fee_basis_points
      symbol
      updatedAt
      merkleTreeId
      user {
        id
      }
      creators {
        id
        share
        sortOrder
        token {
          id
        }
        createdAt
        wallet {
          address
        }
      }
    }
  }
`;
