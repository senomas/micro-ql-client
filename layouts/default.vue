<template>
  <v-app>
    <v-dialog :value="!!popupError" persistent max-width="290">
      <v-card v-if="popupError">
        <v-card-title>{{ popupError.title || popupError.code || 'Error' }}</v-card-title>
        <v-card-text>{{ popupError.message || popupError.code || 'Unknown error' }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closePopupError">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-content v-if="token && me && me.name" style="height: 100%">
      <nuxt />
    </v-content>
    <div v-else-if="!$apollo.loading">
      <Login />
    </div>
  </v-app>
</template>

<script>
import gql from 'graphql-tag';
import { mapMutations, mapState } from 'vuex';
import { handleGraphqlError } from '../lib';

import Login from '@/components/Login';

window.onbeforeunload = () => {
  return 'Are you sure you want to leave?';
};

export default {
  components: { Login },
  computed: {
    ...mapState(['me', 'token', 'loading', 'popupError']),
    popupErrorVisible: {
      get: () => {
        return !!this.popupError;
      },
      set: (value) => {
        if (!value) {
          this.setPopupError(null);
        }
      }
    }
  },
  mounted() {
    this.checkAuth();
  },
  watch: {
    $route(to) {
      this.checkAuth();
    },
    token(token) {
      if (token) {
        this.checkAuth();
      }
    }
  },
  methods: {
    ...mapMutations(['setMe', 'setPopupError']),
    async checkAuth() {
      console.log('CHECK-AUTH');
      try {
        const res = await this.$apollo.query({
          query: gql`
            query auth {
              me(ts: "${Date.now() / 5000}") {
                time
                name
                privileges
                token {
                  seq
                  token
                }
              }
              accountInfo {
                host
                time
                buildTime
                commits {
                  abbrevHash
                  subject
                  authorName
                  authorDate
                }
              }
            }
          `
        });
        console.log(`CHECK-AUTH-RESULT`, { res });
        if (res.data && res.data.me) {
          this.setMe(res.data.me);
        }
      } catch (err) {
        if (!handleGraphqlError(this, err)) {
          console.log(`CHECK-AUTH-ERROR`, { err });
          this.setPopupError({
            ...err,
            code: 'UnknownError',
            action: () => {
              this.$router.replace({
                path: this.$route.path
              });
            }
          });
        }
      }
    },
    closePopupError() {
      if (this.popupError && this.popupError.action) {
        this.popupError.action();
      }
      this.setPopupError(null);
    }
  }
};
</script>

<style type="text/css">
html {
  overflow: hidden;
}
.detail-input-container {
  width: 100%
}
</style>
