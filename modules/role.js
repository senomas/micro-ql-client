import gql from 'graphql-tag';

export const role = {
  fields: [
    {
      field: 'id'
    },
    {
      field: 'code'
    },
    {
      field: 'name'
    },
    {
      field: 'description'
    }
  ],
  titleKey: 'name',
  query: gql`
    query roles($skip: Int, $limit: Int) {
      me(ts: "${Date.now() / 1000}") {
        time
        name
        privileges
        token {
          seq
          token
        }
      }
      roles(skip: $skip, limit: $limit) {
        total
        items {
          id
          code
          name
          description
        }
      }
    }
  `,
  queryDetail: gql`
    query getRole($id: ID!) {
      me(ts: "${Date.now() / 1000}") {
        time
        name
        privileges
        token {
          seq
          token
        }
      }
      role(id: $id) {
        id
        code
        name
        description
        privileges
      }
    }
  `,
  mutationUpdate: gql`
    mutation updateRoles(
      $id: ID!
      $code: String
      $name: String
      $description: String
    ) {
      updateRoles(
        filter: { id: $id }
        data: { code: $code, name: $name, description: $description }
      ) {
        matched
        modified
      }
    }
  `,
  mutationCreate: gql`
    mutation createRole(
      $code: String!
      $name: String!
      $description: String!
    ) {
      createRole(
        data: { code: $code, name: $name, description: $description }
      ) {
        id
      }
    }
  `,
  mutationDelete: gql`
    mutation deleteRole($id: ID!) {
      deleteRoles(filter: { id: $id }) {
        deleted
      }
    }
  `
};
