<template>
  <div v-if="me && me.name" style="height: 100%;">
    <h-toolbar :me="me" :breadcrumbs="breadcrumbs" @action="toolbarAction">
      <v-btn v-if="gridVisible" icon @click="reload">
        <v-icon size="30px">mdi-reload</v-icon>
      </v-btn>
      <v-btn v-if="gridVisible" icon @click="createNew">
        <v-icon size="30px">mdi-plus</v-icon>
      </v-btn>
      <v-divider v-if="gridVisible" vertical />
    </h-toolbar>
    <div style="height: calc(100vh - 48px); overflow: auto;">
      <vue-element-loading
        :active="overlayProgress"
        spinner="bar-fade-scale"
        background-color="rgba(48,48,48,0.95)"
      >
        <v-progress-circular indeterminate color="primary" />
      </vue-element-loading>
      <div v-if="detailVisible">
        <ViewDetail
          v-if="detail"
          :data="detail"
          :progress="detailProgress"
          :progress-type="detailProgressType"
          @reset="resetDetail"
          @save="saveDetail"
          @create="createDetail"
          @delete="deleteDetail"
        />
      </div>
      <div v-show="gridVisible" style="height: calc(100vh - 48px);">
        <ag-grid-vue
          class="ag-theme-balham-dark"
          style="height: 100%; width: 100%"
          row-model-type="infinite"
          row-selection="single"
          :column-defs="columnDefs"
          :default-col-def="defaultColDef"
          :datasource="datasource"
          :grid-options="gridOptions"
          :max-blocks-in-cache="3"
          @grid-ready="onGridReady"
        />
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import VueElementLoading from 'vue-element-loading';
import baseMixin from '../mixins/base';
import listMixin from '../mixins/list';

export default {
  components: {
    AgGridVue: async () => (await import('ag-grid-vue')).AgGridVue,
    VueElementLoading
  },
  mixins: [
    baseMixin({
      module: 'role',
      breadcrumbs: [{ text: 'Admin', to: { path: '/' } }]
    }),
    listMixin({
      module: 'role',
      titleKey: 'name',
      query: gql`
        query roles($skip: Int, $limit: Int) {
          me(ts: "${Date.now() / 1000}") {
            time
            name
            privileges
            token {
              seq
              token
            }
          }
          roles(skip: $skip, limit: $limit) {
            total
            items {
              id
              code
              name
              description
            }
          }
        }
      `,
      queryDetail: gql`
        query getRole($id: ID!) {
          me(ts: "${Date.now() / 1000}") {
            time
            name
            privileges
            token {
              seq
              token
            }
          }
          role(id: $id) {
            id
            code
            name
            description
            privileges
          }
        }
      `,
      mutationUpdate: gql`
        mutation updateRoles(
          $id: ID!
          $code: String
          $name: String
          $description: String
        ) {
          updateRoles(
            filter: { id: $id }
            data: { code: $code, name: $name, description: $description }
          ) {
            matched
            modified
          }
        }
      `,
      mutationCreate: gql`
        mutation createRole(
          $code: String!
          $name: String!
          $description: String!
        ) {
          createRole(
            data: { code: $code, name: $name, description: $description }
          ) {
            id
          }
        }
      `,
      mutationDelete: gql`
        mutation deleteRole(
          $id: ID!
        ) {
          deleteRoles(
            filter: { id: $id }
          ) {
            deleted
          }
        }
      `,
      columnDefs: [
        {
          field: 'id'
        },
        {
          field: 'code'
        },
        {
          field: 'name'
        },
        {
          field: 'description'
        }
      ]
    })
  ]
};
</script>
