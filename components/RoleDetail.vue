<template>
  <div>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-container class="scroll-container">
        <v-text-field v-model="data.id" :disabled="progress" label="id" readonly></v-text-field>
        <v-text-field v-model="data.code" :disabled="progress" label="code" required></v-text-field>
        <v-text-field v-model="data.name" :disabled="progress" label="name" required></v-text-field>
        <v-text-field v-model="data.description" :disabled="progress" label="description" required></v-text-field>
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
import detailMixin from '../mixins/detail';

export default {
  mixins: [detailMixin()]
};
</script>
