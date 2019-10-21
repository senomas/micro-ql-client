<template>
  <div v-if="me && me.name">
    <h-toolbar :me="me" :breadcrumbs="breadcrumbs" @action="toolbarAction" />
  </div>
</template>

<script>
import baseMixin from '../mixins/base';

export default {
  mixins: [
    baseMixin({
      module: 'index',
      breadcrumbs: [{ id: 'pre', items: [{ text: 'Admin', href: '/' }] }]
    })
  ]
};
</script>
