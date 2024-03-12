import { gql } from "@apollo/client";

export const REMOVE_CREATOR = gql`
  mutation REMOVE_CREATOR($id: uuid!) {
    delete_creators_by_pk(id: $id) {
      id
    }
  }
`;
