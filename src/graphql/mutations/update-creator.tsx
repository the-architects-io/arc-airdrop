import { gql } from "@apollo/client";

export const UPDATE_CREATOR = gql`
  mutation UPDATE_CREATOR($id: uuid!, $creator: creators_set_input = {}) {
    update_creators(where: { id: { _eq: $id } }, _set: $creator) {
      affected_rows
      returning {
        id
      }
    }
  }
`;
