import { gql } from "@apollo/client";

export const REMOVE_CREATORS = gql`
  mutation REMOVE_CREATORS($_in: [uuid!]!) {
    delete_creators(where: { id: { _in: $_in } }) {
      affected_rows
      returning {
        id
      }
    }
  }
`;
