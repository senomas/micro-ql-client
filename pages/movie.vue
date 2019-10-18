<template>
  <div v-if="me && me.name">
    <div v-if="$apollo.loading">Loading data...</div>
    <div v-if="detail">
      <MovieDetail :id="detail" />
    </div>
    <div v-show="!detail">
      <h-table type="movies" :me="me" :column-defs="columnDefs" :query="query" />
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import { mapState } from 'vuex';

import MovieDetail from '@/components/MovieDetail';

export default {
  name: 'PageMovie',
  components: { MovieDetail },
  head() {
    if (!this.detail) {
      return {
        title: 'Movies'
      };
    }
  },
  data: () => ({
    accountInfo: null,
    query: gql`
      query movies($skip: Int, $limit: Int) {
        me {
          time
          name
          privileges
          token {
            seq
            token
          }
        }
        movies(skip: $skip, limit: $limit) {
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
    columnDefs: [
      {
        field: 'id'
      },
      {
        field: 'title'
      },
      {
        field: 'year'
      },
      {
        field: 'cast'
      },
      {
        field: 'genres'
      }
    ]
  }),
  computed: {
    ...mapState(['me'])
  },
  watch: {
    $route(value) {
      this.detail = value.query.id;
    }
  },
  asyncData({ query }) {
    return {
      detail: query.id
    };
  }
};
</script>
