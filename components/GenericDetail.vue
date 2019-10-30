<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-container>
      <v-row>
        <div :class="inputContainerClass">
          <template v-for="input of inputComponents">
            <component
              v-if="!$route.query.new || input.field !== 'id'"
              :key="input.field"
              :is="input.component"
              :label="input.field"
              :disabled="progress"
              :required="input.required"
              :columnDef="fields[input.field]"
              :readonly="input.readonly || input.field == 'id'"
              :class-value="input.classValue"
              v-model="data[input.field]"
            />
          </template>
        </div>
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
