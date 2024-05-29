import { gql } from "@apollo/client";

export const GET_AIRDROPS = gql`
  query GET_AIRDROPS {
    airdrops {
      cluster
      collection {
        id
        name
      }
      collectionNft {
        mintAddress
        id
        createdAt
      }
      createdAt
      failedRecipientAddresses
      hasBeenPaidFor
      id
      isReadyToDrop
      job {
        id
      }
      name
      owner {
        id
      }
      queueName
      recipients_aggregate {
        aggregate {
          count
        }
      }
      shouldKickoffManually
      startTime
      tokensMintedPerMs
      updatedAt
    }
  }
`;
