<template>
  <div v-if="me && me.name">
    <h-toolbar :me="me" :breadcrumbs="breadcrumbs" @action="toolbarAction" />
    <div v-if="$apollo.loading"></div>
    <div v-else-if="$route.query.id">
      <MovieDetail :id="$route.query.id" :breadcrumbs.sync="breadcrumbs" @update="updateRow" />
    </div>
    <div v-show="!$route.query.id">
      <ag-grid-vue
        class="ag-theme-balham"
        style="height: 400px;"
        row-model-type="infinite"
        row-selection="single"
        :column-defs="columnDefs"
        :datasource="datasource"
        :grid-options="gridOptions"
        :max-blocks-in-cache="3"
        @grid-ready="onGridReady"
      />
      <div>Total {{ total }}</div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import { AgGridVue } from 'ag-grid-vue';
import baseMixin from '../mixins/base';
import listMixin from '../mixins/list';
import MovieDetail from '@/components/MovieDetail';

export default {
  mixins: [
    baseMixin({
      module: 'movie',
      breadcrumbs: [
        { id: 'pre', items: [{ text: 'Admin', to: { path: '/' } }] }
      ]
    }),
    listMixin({
      module: 'movie',
      query: gql`
        query movies($skip: Int, $limit: Int) {
          me {
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
      columnDefs: [
        {
          field: 'id'
        },
        {
          field: 'title'
        },
        {
          field: 'year'
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
  components: { AgGridVue, MovieDetail }
};
</script>
