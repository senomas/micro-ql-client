import { mapMutations, mapState } from 'vuex';
import { handleGraphqlError } from '../lib';

function mixin({
  module,
  query, queryDetail, mutationUpdate, mutationCreate, mutationDelete,
  columnDefs, defaultColDef,
  moduleCapitalize, modulePlurals, modulePluralsCapitalize, titleKey
}) {
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
      resizable: true,
      maxWidth: 600
    };
  }
  if (!titleKey) {
    titleKey = 'title';
  }
  const moduleUpperCase = module.toUpperCase();
  const data = {
    name: `${moduleCapitalize}List`,
    components: {
      ViewDetail: () => import(`@/components/${moduleCapitalize}Detail`)
    },
    data: () => ({
      loading: true,
      defaultColDef,
      columnDefs,
      accountInfo: null,
      gridOptions: {},
      gridApi: null,
      datasource: null,
      id: null,
      detail: null,
      detailProgress: false,
      detailProgressType: null,
      total: 0,
      skip: 0,
      limit: 20
    }),
    computed: {
      ...mapState(['me', 'token', 'popupError']),
      overlayProgress() {
        return !this.popupError && !this.detailProgress && this.loading;
      },
      detailVisible() {
        return this.$route.query.id || this.$route.query.new;
      },
      gridVisible() {
        return !this.$route.query.id && !this.$route.query.new;
      }
    },
    watch: {
      $route(to) {
        console.log('ROUTE', { to });
        this.initData(to.query);
      }
    },
    beforeMount() {
      this.gridOptions.onCellDoubleClicked = (param) => {
        console.log('onCellDoubleClicked', { param, path: this.$route.path });
        this.$router.replace({
          path: this.$route.path,
          query: {
            id: param.data.id
          }
        });
      };
      this.gridOptions.suppressCellSelection = true;
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
      console.log('MOUNTED', { query: this.$route.query });
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
          this.detail = {
            code: "demo",
            name: "Demo",
            description: "Demo description"
          };
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
        this.gridApi.setDatasource(this);
      },
      async getDetail(id) {
        this.loading = true;
        console.log(`GRID-GET-${moduleUpperCase}-DETAIL`, { id });
        try {
          const res = (await this.$apollo.query({
            query: queryDetail,
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
          this.loading = false;
        }
      },
      async getRows(param) {
        console.log(`GRID-GET-${moduleUpperCase}-ROWS`, { param });
        try {
          const variables = {
            skip: param.startRow,
            limit: param.startRow - param.endRow,
            orderBy: []
          };
          if (param.sortModel && param.sortModel.length > 0) {
            const col = this.gridOptions.columnApi.getColumn(
              param.sortModel[0].colId
            );
            variables.orderBy = {
              field: col.colDef.field,
              type: param.sortModel[0].sort
            };
          }
          const res = (await this.$apollo.query({
            query,
            variables
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
          this.loading = false;
        }
      },
      async reload() {
        await this.$apollo.provider.clients.defaultClient.resetStore();
        this.gridApi.setDatasource(this);
      },
      createNew() {
        this.$router.replace({
          path: this.$route.path,
          query: {
            new: true
          }
        });
      },
      async saveDetail(data) {
        let res;
        try {
          this.detailProgress = true;
          this.detailProgressType = 'save';
          await this.$apollo.provider.clients.defaultClient.resetStore();
          res = await this.$apollo.mutate({
            mutation: mutationUpdate,
            variables: data
          });
          const row = this.gridApi.getRowNode(data.id);
          for (const col of this.columnDefs) {
            if (col.field && col.field !== 'id') {
              row.setDataValue(col.field, data[col.field]);
            }
          }
          if (res.data[`update${modulePluralsCapitalize}`].matched === 1) {
            this.$router.replace({
              path: this.$route.path
            });
          } else {
            this.setPopupError({
              code: 'UpdateObjectNotFound',
              res
            });
          }
        } catch (err) {
          if (!handleGraphqlError(this, err)) {
            console.log('saveDetailError', { err, res });
          }
        } finally {
          this.detailProgress = false;
        }
      },
      async createDetail(data) {
        let res;
        try {
          this.detailProgress = true;
          this.detailProgressType = 'create';
          await this.$apollo.provider.clients.defaultClient.resetStore();
          res = await this.$apollo.mutate({
            mutation: mutationCreate,
            variables: data
          });
          console.log("RES", res);
          if (res.data[`create${moduleCapitalize}`].id) {
            this.gridApi.setDatasource(this);
            this.$router.replace({
              path: this.$route.path
            });
          } else {
            this.setPopupError({
              code: 'UpdateObjectNotFound',
              res
            });
          }
        } catch (err) {
          if (!handleGraphqlError(this, err)) {
            console.log('createDetailError', { err, res });
          }
        } finally {
          this.detailProgress = false;
        }
      },
      async deleteDetail(data) {
        let res;
        try {
          this.detailProgress = true;
          this.detailProgressType = 'delete';
          await this.$apollo.provider.clients.defaultClient.resetStore();
          res = await this.$apollo.mutate({
            mutation: mutationDelete,
            variables: data
          });
          console.log("RES", res);
          if (res.data[`delete${modulePluralsCapitalize}`].deleted > 0) {
            this.gridApi.setDatasource(this);
            this.$router.replace({
              path: this.$route.path
            });
          } else {
            this.setPopupError({
              code: 'UpdateObjectNotFound',
              res
            });
          }
        } catch (err) {
          if (!handleGraphqlError(this, err)) {
            console.log('deleteDetailError', { err, res });
          }
        } finally {
          this.detailProgress = false;
        }
      },
      async resetDetail() {
        this.detailProgress = true;
        this.detailProgressType = 'reset';
        try {
          if (this.$route.query.new) {
            this.detail = {};
          } else if (this.$route.query.id) {
            await this.$apollo.provider.clients.defaultClient.resetStore();
            this.breadcrumbs = this.breadcrumbs.filter((v) => v.mod !== module);
            this.breadcrumbs.push({
              text: moduleCapitalize,
              mod: module,
              exact: true,
              to: {
                name: module
              }
            });
            await this.getDetail(this.$route.query.id);
          } else {
            this.detail = null;
          }
        } catch (err) {
          if (!handleGraphqlError(this, err)) {
            console.log('resetDetailError', { err });
          }
        } finally {
          this.detailProgress = false;
        }
      }
    }
  };
  return data;
}

export default mixin;
