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
    <div v-else>
      <Login />
    </div>
  </v-app>
</template>

<script>
import gql from 'graphql-tag';
import { mapMutations, mapState } from 'vuex';

import Login from '@/components/Login';

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
  apollo: {
    data: {
      manual: true,
      query: gql`
        query base {
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
      `,
      skip() {
        return !this.token;
      },
      error(err) {
        if (err.networkError) {
          const networkError = err.networkError;
          if (networkError.result && networkError.result.errors) {
            const nerr = networkError.result.errors[0];
            if (nerr.extensions) {
              const errCode = nerr.extensions.code;
              if (errCode === 'SessionExpired' || errCode === 'TokenNotFound') {
                this.setMe(null);
              }
            }
          }
        } else if (err.gqlError && err.gqlError.message === 'TokenExpired') {
          console.log('ERROR HERE', { ctx: this, err });
        }
      },
      result(res) {
        console.log('DEFAULT-RESULT', { data: res.data });
        if (res.data && res.data.me) {
          this.setMe(res.data.me);
        }
      }
    }
  },
  methods: {
    ...mapMutations(['setMe', 'setPopupError']),
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
  overflow: auto;
}
</style>
