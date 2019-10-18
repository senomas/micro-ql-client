<template>
  <v-btn :disabled="disabled || progress" @click="doClick">
    <slot />
    <div v-if="progress" style="padding-left: 10px">
      <v-progress-circular indeterminate size="20" color="primary" />
    </div>
  </v-btn>
</template>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      defaultValue: false
    },
    progress: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    doClick() {
      this.$emit('click');
    }
  }
};
</script>
