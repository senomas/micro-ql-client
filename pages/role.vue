<template>
  <div v-if="me && me.name" style="height: 100%;">
    <h-toolbar :me="me" :breadcrumbs="breadcrumbs" @action="toolbarAction">
      <v-btn v-if="gridVisible" icon @click="reload">
        <v-icon size="30px">mdi-reload</v-icon>
      </v-btn>
      <v-btn v-if="gridVisible" icon @click="createNew">
        <v-icon size="30px">mdi-plus</v-icon>
      </v-btn>
      <v-divider v-if="gridVisible" vertical></v-divider>
    </h-toolbar>
    <div v-if="$route.query.id || $route.query.new" style="height: calc(100% - 48px);">
      <vue-element-loading
        :active="overlayProgress"
        spinner="bar-fade-scale"
        background-color="rgba(48,48,48,0.95)"
      >
        <v-progress-circular indeterminate color="primary" />
      </vue-element-loading>
      <ViewDetail
        v-if="detailVisible"
        :data="detail"
        :progress="detailProgress"
        :progressType="detailProgressType"
        @reset="resetDetail"
        @update="updateRow"
      />
    </div>
    <div v-show="gridVisible" style="height: calc(100% - 48px);">
      <ag-grid-vue
        class="ag-theme-balham"
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
</template>

<script>
import gql from 'graphql-tag';
import { AgGridVue } from 'ag-grid-vue';
import VueElementLoading from 'vue-element-loading';
import baseMixin from '../mixins/base';
import listMixin from '../mixins/list';

export default {
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
  ],
  components: { AgGridVue, VueElementLoading }
};
</script>
