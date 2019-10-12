<template>
<<<<<<< HEAD
  <div v-if="auth && auth.name">
    <div>{{ accountInfo }}</div>
  </div>
  <div v-else>
    <v-form ref="loginForm" v-model="valid" :lazy-validation="lazy">
      <v-text-field v-model="login" :rules="loginRules" label="Login" required />
      <v-text-field v-model="password" :rules="passwordRules" label="Password" required />
      <v-btn :disabled="!valid" @click="doLogin">Login</v-btn>
    </v-form>
  </div>
=======
  <div>{{ info }}</div>
>>>>>>> 76f0dbb3d7a358f249813f56fb8c3fb670ac5afe
</template>

<script>
import gql from 'graphql-tag'
<<<<<<< HEAD
import { mapState } from 'vuex'
import { login } from '../lib'

export default {
  apollo: {
    accountInfo: {
      query: gql`
        {
          me {
            name
            privileges
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
      result(res) {
        this.me = res.data.me
      }
    }
  },
  data: () => ({
    me: null,
    accountInfo: null,
    lazy: false,
    valid: true,
    login: 'admin',
    loginRules: [(v) => !!v || 'Login is required'],
    password: 'dodol123',
    passwordRules: [(v) => !!v || 'Password is required']
  }),
  computed: {
    ...mapState(['auth'])
  },
  methods: {
    async doLogin() {
      if (this.$refs.loginForm.validate()) {
        const res = await login(this, this.login, this.password)
        console.log('DO-LOGIN', { res })
        this.$store.commit('auth/set', res)
        this.$apolloHelpers.onLogin(res.token)
      }
    }
=======

export default {
  apollo: {
    info: gql`query accountInfo {
      host
      time
    }`
>>>>>>> 76f0dbb3d7a358f249813f56fb8c3fb670ac5afe
  }
}
</script>
