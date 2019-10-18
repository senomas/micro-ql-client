<template>
  <v-form ref="loginForm" v-model="valid" :lazy-validation="lazy">
    <v-text-field
      v-model="username"
      :disabled="progress"
      :rules="usernameRules"
      label="Login"
      required
    />
    <v-text-field
      v-model="password"
      :disabled="progress"
      :rules="passwordRules"
      label="Password"
      required
    />
    <h-btt :disabled="!valid" :progress="progress" @click="login">Login</h-btt>
  </v-form>
</template>

<script>
import { mapMutations } from 'vuex';
import { login } from '../lib';

export default {
  name: 'Login',
  head() {
    return {
      title: 'Login'
    };
  },
  data: () => ({
    lazy: false,
    valid: true,
    progress: false,
    username: 'admin',
    usernameRules: [(v) => !!v || 'Login is required'],
    password: 'dodol123',
    passwordRules: [(v) => !!v || 'Password is required']
  }),
  methods: {
    ...mapMutations(["setToken", "setPopupError"]),
    async login() {
      if (this.$refs.loginForm.validate()) {
        try {
          this.progress = true;
          this.setToken(null);
          const res = await login(this, this.username, this.password);
          console.log('LOGIN', { res });
          sessionStorage.setItem('token', res.token);
          this.setToken(res.token);
        } catch (err) {
          console.log('LOGIN FAILED', { err });
          this.setPopupError({
            code: 'LoginFailed'
          });
        } finally {
          this.progress = false;
        }
      }
    }
  }
};
</script>
