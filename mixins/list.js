import { mapMutations, mapState } from 'vuex';
import { handleGraphqlError } from '../lib';

function mixin({ module, query, queryDetail, columnDefs, defaultColDef, moduleCapitalize, modulePlurals, modulePluralsCapitalize, titleKey }) {
  if (!moduleCapitalize) {
    moduleCapitalize = `${module.substr(0, 1).toUpperCase()}${module.substr(1)}`;
  }
  if (!modulePlurals) {
    modulePlurals = `${module}s`;
  }
  if (!modulePluralsCapitalize) {
    modulePluralsCapitalize = `${modulePlurals.substr(0, 1).toUpperCase()}${modulePlurals.substr(1)}`;
  }
  if (!defaultColDef) {
    defaultColDef = {
      sortable: true,
      resizable: true
    };
  }
  if (!titleKey) {
    titleKey = 'title';
  }
  console.log("MIXIN HERE", { query });
  const moduleUpperCase = module.toUpperCase();
  const data = {
    name: `${moduleCapitalize}List`,
    components: {
      ViewDetail: () => import(`@/components/${moduleCapitalize}Detail`)
    },
    data: () => ({
      query,
      queryDetail,
      defaultColDef,
      columnDefs,
      accountInfo: null,
      gridOptions: {},
      gridApi: null,
      datasource: null,
      id: null,
      detail: null,
      detailLoading: false,
      detailProgress: false,
      detailProgressType: null,
      total: 0,
      skip: 0,
      limit: 20
    }),
    computed: {
      ...mapState(['me', 'token', 'popupError']),
      overlayProgress() {
        return !this.popupError && !this.detailProgress && (!this.detail || this.detailLoading);
      },
      detailVisible() {
        return this.detail;
      },
      gridVisible() {
        return !this.$route.query.id && !this.$route.query.new;
      }
    },
    watch: {
      $route(to) {
        console.log("ROUTE", { to });
        this.initData(to.query);
      }
    },
    beforeMount() {
      this.gridOptions.onCellDoubleClicked = (param) => {
        console.log('onCellDoubleClicked', { param, path: this.$route.path });
        this.$router.push({
          path: this.$route.path,
          query: {
            id: param.data.id
          }
        });
      };
      this.gridOptions.getRowNodeId = (item) => {
        return item.id.toString();
      };
      this.gridOptions.statusBar = {
        statusPanels: [
          { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
          { statusPanel: 'agTotalRowCountComponent', align: 'center' },
          { statusPanel: 'agFilteredRowCountComponent' },
          { statusPanel: 'agSelectedRowCountComponent' },
          { statusPanel: 'agAggregationComponent' }
        ]
      };
    },
    mounted() {
      console.log("MOUNTED", { query: this.$route.query });
      this.initData(this.$route.query);
    },
    methods: {
      ...mapMutations(['setMe', 'loadingDone', 'setPopupError']),
      async initData(rq) {
        this.breadcrumbs = this.breadcrumbs.filter((v) => v.mod !== module);
        this.breadcrumbs.push({
          text: moduleCapitalize,
          mod: module,
          exact: true,
          to: {
            name: module
          }
        });
        if (rq.new) {
          this.detail = {};
          this.breadcrumbs.push({
            text: 'New Entry',
            mod: module,
            exact: true
          });
        } else if (rq.id) {
          await this.getDetail(rq.id);
        } else {
          this.detail = null;
        }
      },
      onGridReady(params) {
        console.log('GRID-READY');
        this.gridApi = this.gridOptions.api;
        this.gridApi.showLoadingOverlay();
        this.gridApi.setDatasource(this);
      },
      async getDetail(id) {
        this.detailLoading = true;
        console.log(`GRID-GET-${moduleUpperCase}-DETAIL`, { id });
        try {
          const res = (await this.$apollo.query({
            query: this.queryDetail,
            variables: {
              id
            }
          })).data;
          console.log(`GRID-GET-${moduleUpperCase}-DETAIL-RESULT`, { res });
          this.setMe(res.me);
          this.detail = res[module];
          if (!this.detail) {
            this.detail = {};
            this.setPopupError({
              code: 'NoEntry',
              action: () => {
                this.$router.replace({
                  path: this.$route.path
                });
              }
            });
          }
          this.breadcrumbs.push({
            text: this.detail[titleKey],
            mod: module,
            exact: true,
            to: {
              name: module,
              query: {
                id: this.detail.id
              }
            }
          });
        } catch (err) {
          if (!handleGraphqlError(this, err)) {
            console.log(`GRID-GET-${moduleUpperCase}-DETAIL-ERROR`, { err });
            this.setPopupError({
              ...err,
              code: 'UnknownError',
              action: () => {
                this.$router.replace({
                  path: this.$route.path
                });
              }
            });
          }
        } finally {
          this.detailLoading = false;
        }
      },
      async getRows(param) {
        console.log(`GRID-GET-${moduleUpperCase}-ROWS`, { param });
        try {
          const res = (await this.$apollo.query({
            query: this.query,
            variables: {
              skip: param.startRow,
              limit: param.startRow - param.endRow
            }
          })).data;
          console.log(`GRID-GET-${moduleUpperCase}-ROWS-RESULT`, { res });
          this.setMe(res.me);
          this.total = res[modulePlurals].total;
          param.successCallback(res[modulePlurals].items, res[modulePlurals].total);
        } catch (err) {
          if (!handleGraphqlError(this, err)) {
            console.log(`GRID-GET-${moduleUpperCase}-ROWS-ERROR`, { err });
          }
          param.failCallback();
        } finally {
          this.gridApi.hideOverlay();
        }
      },
      async reload() {
        await this.$apollo.provider.clients.defaultClient.resetStore();
        this.gridApi.setDatasource(this);
      },
      createNew() {
        this.$router.push({
          path: this.$route.path,
          query: {
            new: true
          }
        });
      },
      async resetDetail() {
        this.detailProgress = true;
        this.detailProgressType = "reset";
        try {
          if (this.$route.query.new) {
            this.detail = {};
          } else if (this.$route.query.id) {
            this.breadcrumbs = this.breadcrumbs.filter((v) => v.mod !== module);
            this.breadcrumbs.push({
              text: moduleCapitalize,
              mod: module,
              exact: true,
              to: {
                name: module
              }
            });
            await this.$apollo.provider.clients.defaultClient.resetStore();
            await this.getDetail(this.$route.query.id);
          } else {
            this.detail = null;
          }
        } finally {
          this.detailProgress = false;
          this.detailProgressType = "reset";
        }
      },
      updateRow(data) {
        console.log(`GRID-UPDATE-${moduleUpperCase}-ROW`, { data });
        if (data.update) {
          for (const update of data.update) {
            const row = this.gridApi.getRowNode(update.id);
            for (const col of this.columnDefs) {
              if (col.field && col.field !== 'id') {
                row.setDataValue(col.field, update[col.field]);
              }
            }
          }
        }
      }
    }
  };
  return data;
}

export default mixin;
