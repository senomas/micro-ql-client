<template>
  <div v-if="detail">
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-container>
        <v-text-field v-model="detail.id" :disabled="progress" label="id" readonly></v-text-field>
        <v-text-field v-model="detail.code" :disabled="progress" label="code" required></v-text-field>
        <v-text-field v-model="detail.name" :disabled="progress" label="name" required></v-text-field>
        <v-text-field
          v-model="detail.description"
          :disabled="progress"
          label="description"
          required
        ></v-text-field>
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
      module: 'role',
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
          role(id: $id) {
            id
            code
            name
            description
            privileges
          }
        }
      `,
      mutationQuery: gql`
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
      titleKey: 'name'
    })
  ]
};
</script>
