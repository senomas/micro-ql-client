<template>
  <div v-if="detail">
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-container>
        <v-text-field v-model="detail.id" :disabled="progress" label="id" readonly></v-text-field>
        <v-text-field v-model="detail.title" :disabled="progress" label="title" required></v-text-field>
        <v-text-field v-model="detail.year" :disabled="progress" label="year" required></v-text-field>
        <v-row>
          <v-spacer />
          <h-btt
            :disabled="!valid || progress"
            :progress="progress && progressType === 'reset'"
            @click="reset"
          >Reset</h-btt>
          <h-btt
            :disabled="!valid || progress"
            :progress="progress && progressType === 'save'"
            @click="save"
          >Save</h-btt>
          <v-btn :disabled="progress" @click="back">Back</v-btn>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import detailMixin from '../mixins/detail';

export default {
  mixins: [
    detailMixin({
      module: 'movie',
      detailQuery: gql`
        query getRole($id: ID!) {
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
      mutationQuery: gql`
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
    })
  ]
};
</script>
