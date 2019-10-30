<template>
  <v-text-field
    :label="label"
    :value="value"
    :required="required"
    :readonly="readonly"
    :class="classValue"
    @input="input"
  />
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },
    required: {
      type: Boolean,
      required: false,
      defaultValue: false
    },
    readonly: {
      type: Boolean,
      required: false,
      defaultValue: false
    },
    value: {
      type: [String, Number],
      required: false,
      defaultValue: () => null
    },
    classValue: {
      type: String,
      required: false,
      defaultValue: "input"
    }
  },
  methods: {
    input(value) {
      console.log('INPUT', { value });
    }
  }
};
</script>
