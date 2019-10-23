<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-container>
      <v-row>
        <v-text-field
          v-if="!$route.query.new"
          v-model="data.id"
          :disabled="progress"
          label="id"
          readonly
        ></v-text-field>
      </v-row>
      <v-row>
        <v-text-field v-model="data.title" :disabled="progress" label="title" required></v-text-field>
      </v-row>
      <v-row>
        <v-text-field v-model="data.year" :disabled="progress" label="year" required></v-text-field>
      </v-row>
      <v-row>
        <v-spacer />
        <h-btt
          :disabled="!valid || progress"
          :progress="progress && progressType === 'reset'"
          @click="reset"
        >Reset</h-btt>
        <h-btt
          v-if="!$route.query.new"
          :disabled="!valid || progress"
          :progress="progress && progressType === 'save'"
          @click="save"
        >Save</h-btt>
        <h-btt
          v-else
          :disabled="!valid || progress"
          :progress="progress && progressType === 'create'"
          @click="create"
        >Create</h-btt>
        <v-btn :disabled="progress" @click="back">Back</v-btn>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import gql from 'graphql-tag';
import detailMixin from '../mixins/detail';

export default {
  mixins: [
    detailMixin({
      module: 'movie',
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
