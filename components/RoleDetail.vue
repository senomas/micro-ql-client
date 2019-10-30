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
        />
      </v-row>
      <v-row>
        <v-text-field v-model="data.code" :disabled="progress" label="code" required />
      </v-row>
      <v-row>
        <v-text-field v-model="data.name" :disabled="progress" label="name" required />
      </v-row>
      <v-row>
        <v-text-field v-model="data.description" :disabled="progress" label="description" required />
      </v-row>
      <v-row>
        <v-spacer />
        <h-btt
          :disabled="!valid || progress"
          :progress="progress && progressType === 'reset'"
          @click="action('reset')"
        >Reset</h-btt>
        <h-btt
          v-if="!$route.query.new"
          :disabled="!valid || progress"
          :progress="progress && progressType === 'delete'"
          @click="action('delete')"
        >Delete</h-btt>
        <h-btt
          v-if="!$route.query.new"
          :disabled="!valid || progress"
          :progress="progress && progressType === 'save'"
          @click="action('save')"
        >Save</h-btt>
        <h-btt
          v-else
          :disabled="!valid || progress"
          :progress="progress && progressType === 'create'"
          @click="action('create')"
        >Create</h-btt>
        <v-btn :disabled="progress" @click="back">Back</v-btn>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import detailMixin from '../mixins/detail';

export default {
  mixins: [detailMixin()]
};
</script>
