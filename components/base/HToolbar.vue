<template>
  <div>
    <v-app-bar dense dark>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon size="30px">mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list shaped dense>
          <v-subheader>REPORTS</v-subheader>
          <v-list-item-group>
            <v-list-item @click="$router.replace('/movie')">
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Movies</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="$router.replace('/role')">
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Roles</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>
      <v-toolbar-title>
        <v-breadcrumbs :items="breadcrumbs" divider=">" />
      </v-toolbar-title>
      <v-spacer />
      <slot />
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon size="30px">mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
  </div>
</template>

<script>
export default {
  props: {
    me: {
      type: Object,
      required: true
    },
    breadcrumbs: {
      type: Array,
      required: true
    }
  },
  head() {
    return {
      title: this.breadcrumbs.map((v) => v.text).join(' | ')
    };
  },
  methods: {
    logout() {
      this.$emit('action', 'logout');
    }
  }
};
</script>
