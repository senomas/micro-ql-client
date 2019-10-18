<template>
  <div v-if="detail">
    DETAIL MOVIE {{ id }}
    <v-btn @click="back">Back</v-btn>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import { mapMutations } from 'vuex';

export default {
  name: 'MovieDetail',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  apollo: {
    data: {
      manual: true,
      query: gql`
        query getMovie($id: ID!) {
          me {
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
      variables() {
        return {
          id: this.id
        };
      },
      result(res) {
        console.log('MOVIE-DETAIL-RESULT', { data: res.data });
        if (res.data) {
          if (res.data.me) {
            this.setMe(res.data.me);
          }
          if (res.data.movie) {
            this.detail = res.data.movie;
          }
        }
      }
    }
  },
  head() {
    if (this.detail) {
      return {
        title: `Movie - ${this.detail.title}`
      };
    }
  },
  data() {
    return {
      detail: null
    };
  },
  methods: {
    ...mapMutations(['setMe']),
    back() {
      this.$router.go(-1);
    }
  }
};
</script>
