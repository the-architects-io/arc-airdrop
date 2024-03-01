import { gql } from "@apollo/client";

export const GET_AIRDROP_BY_ID = gql`
  query GET_AIRDROP_BY_ID($id: uuid!) {
    airdrops_by_pk(id: $id) {
      id
      name
      cluster
      hasBeenPaidFor
      collectionNft {
        id
        mintAddress
        name
        symbol
      }
      job {
        id
        status {
          id
          name
        }
        statusText
      }
      collection {
        maxBufferSize
        maxDepth
        canopyDepth
        id
        tokenCount
        createdAt
        updatedAt
        owner {
          id
        }
        name
        imageUrl
        family
        hasBeenMinted
        sellerFeeBasisPoints
        isReadyToMint
        symbol
        description
        creators {
          id
          wallet {
            id
            address
          }
          share
        }
        isReadyToMint
        driveAddress
        uploadJob {
          id
          status {
            id
            name
          }
          statusText
        }
      }
      isReadyToDrop
      startTime
      recipients {
        id
        wallet {
          id
          address
        }
        amount
      }
      recipients_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;
