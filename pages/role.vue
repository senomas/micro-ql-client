<template>
  <div v-if="me && me.name">
    <h-toolbar :me="me" :breadcrumbs="breadcrumbs" @action="toolbarAction" />
    <div v-if="$apollo.loading"></div>
    <div v-else-if="$route.query.id">
      <RoleDetail :id="$route.query.id" :breadcrumbs.sync="breadcrumbs" @update="updateRow" />
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
import RoleDetail from '@/components/RoleDetail';

export default {
  mixins: [
    baseMixin({
      module: 'role',
      breadcrumbs: [
        { id: 'pre', items: [{ text: 'Admin', to: { path: '/' } }] }
      ]
    }),
    listMixin({
      module: 'role',
      query: gql`
        query roles($skip: Int, $limit: Int) {
          me {
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
  components: { AgGridVue, RoleDetail }
};
</script>
