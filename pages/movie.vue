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
    <div v-if="$route.query.id || $route.query.new" style="height: calc(100% - 48px); overflow-y: auto;">
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
      module: 'movie',
      breadcrumbs: [{ text: 'Admin', to: { path: '/' } }]
    }),
    listMixin({
      module: 'movie',
      query: gql`
        query movies($skip: Int, $limit: Int) {
          me(ts: "${Date.now() / 1000}") {
            time
            name
            privileges
            token {
              seq
              token
            }
          }
          movies(skip: $skip, limit: $limit) {
            total
            items {
              id
              title
              year
              cast
              genres
            }
          }
        }
      `,
      queryDetail: gql`
        query getMovie($id: ID!) {
          me(ts: "${Date.now() / 1000}") {
            time
            name
            privileges
            token {
              seq
              token
            }
          }
          movie(id: $id) {
            id
            title
            year
            cast
            genres
          }
        }
      `,
      columnDefs: [
        {
          field: 'id'
        },
        {
          field: 'title'
        },
        {
          field: 'year',
          suppressSizeToFit: true,
          width: 100
        },
        {
          field: 'cast'
        },
        {
          field: 'genres'
        }
      ]
    })
  ],
  components: { AgGridVue, VueElementLoading }
};
</script>
