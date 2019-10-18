<template>
  <div>
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
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import { AgGridVue } from 'ag-grid-vue';

import { handleGraphqlError } from '../../lib';

export default {
  name: 'GridList',
  components: { AgGridVue },
  props: {
    type: {
      type: String,
      required: true
    },
    columnDefs: {
      type: Array,
      required: true
    },
    query: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    gridOptions: {},
    datasource: this,
    id: null,
    total: 0,
    skip: 0,
    limit: 20
  }),
  computed: {
    ...mapState(['me', 'token'])
  },
  mounted() {
    this.gridOptions.onCellDoubleClicked = (param) => {
      console.log('onCellDoubleClicked', { param, path: this.$route.path });
      this.$router.push({
        path: this.$route.path,
        query: {
          id: param.data.id
        }
      });
    };
  },
  methods: {
    ...mapMutations(['setMe', 'setPopupError']),
    onGridReady(params) {
      console.log('GRID-READY');
      this.gridOptions.api.showLoadingOverlay();
      this.gridOptions.columnApi.autoSizeColumns();
      this.gridOptions.api.setDatasource(this);
    },
    refreshList() {
      console.log('GRID-LIST REFRESH-LIST');
      this.gridOptions.api.setDatasource(this);
      // this.gridOptions.api.refreshCells({ force: true });
    },
    async getRows(param) {
      console.log('GRID-GET-ROWS', { param });
      try {
        const res = (await this.$apollo.query({
          query: this.query,
          variables: {
            skip: param.startRow,
            limit: param.startRow - param.endRow
          }
        })).data;
        console.log('GRID-GET-ROWS-RESULT', { res });
        this.setMe(res.me);
        this.total = res[this.type].total;
        param.successCallback(res[this.type].items, res[this.type].total);
      } catch (err) {
        if (!handleGraphqlError(this, err)) {
          console.log('GRID-GET-ROWS-ERROR', { err });
        }
        param.failCallback();
      } finally {
        this.gridOptions.api.hideOverlay();
      }
    }
  }
};
</script>
