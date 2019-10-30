import gql from 'graphql-tag';

export const movie = {
  fields: [
    {
      field: 'id'
    },
    {
      field: 'title'
    },
    {
      field: 'year',
      suppressSizeToFit: true,
      width: 100
    },
    {
      field: 'cast',
      detail: {
        input: 'DetailIgnore'
      }
    },
    {
      field: 'genres',
      detail: {
        input: 'DetailIgnore'
      }
    }
  ],
  query: gql`
    query movies($skip: Int, $limit: Int, $orderBy: [OrderByMovieInput!]) {
      me(ts: "${Date.now() / 1000}") {
        time
        name
        privileges
        token {
          seq
          token
        }
      }
      movies(skip: $skip, limit: $limit, orderBy: $orderBy) {
        total
        items {
          id
          title
          year
          cast
          genres
        }
      }
    }
  `,
  queryDetail: gql`
    query getMovie($id: ID!) {
      me(ts: "${Date.now() / 1000}") {
        time
        name
        privileges
        token {
          seq
          token
        }
      }
      movie(id: $id) {
        id
        title
        year
        cast
        genres
      }
    }
  `,
  mutationUpdate: gql`
    mutation updateMovies($id: ID!, $title: String!, $year: Int!) {
      updateMovies(
        filter: { id: $id }
        data: { title: $title, year: $year }
      ) {
        matched
        modified
      }
    }
  `
};
