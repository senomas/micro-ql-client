<template>
  <div v-if="loading > 0">Loading data...</div>
  <div v-else-if="me && me.name">
    <div>{{ me.name }}</div>
    <div>{{ me.time }}</div>
    <div>{{ me.privileges }}</div>
    <div>
      <v-btn @click="refresh">Refresh</v-btn>
      <v-btn @click="logout">Logout</v-btn>
    </div>
    <ag-grid-vue
      class="ag-theme-balham"
      style="height: 400px;"
      row-model-type="infinite"
      row-selection="single"
      :column-defs="columnDefs"
      :datasource="datasource"
      :grid-options="gridOptions"
      @grid-ready="onGridReady"
    />
    <div>Total {{ total }}</div>
  </div>
  <div v-else>
    <v-form ref="loginForm" v-model="valid" :lazy-validation="lazy">
      <v-text-field v-model="login" :rules="loginRules" label="Login" required />
      <v-text-field v-model="password" :rules="passwordRules" label="Password" required />
      <v-btn :disabled="!valid" @click="doLogin">Login</v-btn>
    </v-form>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { AgGridVue } from 'ag-grid-vue'

import { login, logout } from '../lib'

export default {
  apollo: {
    accountInfo: {
      query: gql`
        {
          me {
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
      loadingKey: 'loading',
      error(err) {
        if (err.gqlError && err.gqlError.message === 'TokenExpired') {
          console.log('ERROR HERE', { ctx: this, err })
        }
      },
      result(res) {
        this.me = res.data.me
        if (res.data.me && res.data.me.token && res.data.me.token.token) {
          console.log('RENEW TOKEN', res.data.me)
          this.$apolloHelpers.onLogin(res.data.me.token.token)
        }
      }
    }
  },
  components: {
    AgGridVue
  },
  data: () => ({
    me: null,
    accountInfo: null,
    lazy: false,
    loading: 0,
    gridOptions: {},
    columnDefs: [
      {
        field: 'id'
      },
      {
        field: 'title'
      },
      {
        field: 'year'
      }
    ],
    datasource: this,
    total: 0,
    valid: true,
    login: 'admin',
    skip: 0,
    limit: 20,
    loginRules: [(v) => !!v || 'Login is required'],
    password: 'dodol123',
    passwordRules: [(v) => !!v || 'Password is required']
  }),
  methods: {
    onGridReady(params) {
      console.log('GRID-READY')
      this.gridOptions.api.showLoadingOverlay()
      this.gridOptions.columnApi.autoSizeColumns()
      this.gridOptions.api.setDatasource(this)
    },
    async getRows(param) {
      console.log('GRID-GET-ROWS', { param })
      try {
        const res = (await this.$apollo.query({
          query: gql`
          {
            movies (skip: ${param.startRow}, limit: ${param.endRow -
            param.startRow}) {
              total
              items {
                id
                title
                year
                cast
                genres
              }
            }
          }`
        })).data.movies
        console.log('GRID-GET-ROWS-RESULT', { res })
        this.total = res.total
        param.successCallback(res.items, res.total)
      } finally {
        this.gridOptions.api.hideOverlay()
      }
    },
    async doLogin() {
      if (this.$refs.loginForm.validate()) {
        await this.$apollo.provider.defaultClient.stop()
        const res = await login(this, this.login, this.password)
        console.log('LOGIN', { res })
        await this.$apollo.provider.defaultClient.resetStore()
        await this.$apolloHelpers.onLogin(res.token)
        this.$apollo.queries.accountInfo.refresh()
      }
    },
    async logout() {
      const res = await logout(this)
      console.log('LOGOUT', { res })
      await this.$apolloHelpers.onLogout()
      this.$apollo.queries.accountInfo.refresh()
    },
    async refresh() {
      await this.$apollo.provider.defaultClient.resetStore()
      this.$apollo.queries.accountInfo.refresh()
    }
  }
}
</script>

<style lang="css">
@import '~/node_modules/ag-grid-community/dist/styles/ag-grid.css';
@import '~/node_modules/ag-grid-community/dist/styles/ag-theme-balham.css';
</style>
