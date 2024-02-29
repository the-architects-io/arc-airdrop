import { gql } from "@apollo/client";

export const REMOVE_TOKEN = gql`
  mutation REMOVE_TOKEN($id: uuid!) {
    delete_tokens_by_pk(id: $id) {
      id
    }
  }
`;
