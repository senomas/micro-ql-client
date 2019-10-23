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
      <div v-if="detailVisible" style="height: 100%;">
        <ViewDetail
          v-if="detail"
          :data="detail"
          :progress="detailProgress"
          :progress-type="detailProgressType"
          @reset="resetDetail"
          @save="saveDetail"
          @create="createDetail"
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
      module: 'movie',
      breadcrumbs: [{ text: 'Admin', to: { path: '/' } }]
    }),
    listMixin({
      module: 'movie',
      query: gql`
        query movies($skip: Int, $limit: Int, $orderBy: [OrderByMovieInput!]) {
          me(ts: "${Date.now() / 1000}") {
            time
            name
            privileges
            token {
              seq
              token
            }
          }
          movies(skip: $skip, limit: $limit, orderBy: $orderBy) {
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
      mutationUpdate: gql`
        mutation updateMovies($id: ID!, $title: String!, $year: Int!) {
          updateMovies(
            filter: { id: $id }
            data: { title: $title, year: $year }
          ) {
            matched
            modified
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
  ]
};
</script>
