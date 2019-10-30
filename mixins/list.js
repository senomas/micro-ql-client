import { mapMutations, mapState } from 'vuex';
import * as cloneDeep from 'clone-deep';
import { handleGraphqlError } from '../lib';
import { modules } from '../modules';

function mixin() {
  const data = {
    asyncData({ params }) {
      console.log('ASYNC-DATA', { module: params.list });
      const module = params.list;
      const v = modules[module];
      if (!v.moduleCapitalize) {
        v.moduleCapitalize = `${module.substr(0, 1).toUpperCase()}${module.substr(1)}`;
      }
      if (!v.modulePlurals) {
        v.modulePlurals = `${module}s`;
      }
      if (!v.modulePluralsCapitalize) {
        v.modulePluralsCapitalize = `${v.modulePlurals.substr(0, 1).toUpperCase()}${v.modulePlurals.substr(1)}`;
      }
      if (!v.defaultColDef) {
        v.defaultColDef = {
          sortable: true,
          resizable: true,
          maxWidth: 600
        };
      }
      if (!v.titleKey) {
        v.titleKey = 'title';
      }
      v.moduleUpperCase = module.toUpperCase();
      console.log('columnDefs', { v });
      const columnDefs = v.fields.map((v) => {
        const nv = cloneDeep(v);
        delete nv.detail;
        return nv;
      });
      return {
        ...v,
        module,
        columnDefs
      };
    },
    data: () => ({
      loading: true,
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
      detailViewComponent() {
        // return () => import(`@/components/${this.moduleCapitalize}Detail`);
        return () => import("@/components/GenericDetail");
      },
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
    },
    mounted() {
      console.log('MOUNTED', { query: this.$route.query });
      this.initData(this.$route.query);
    },
    methods: {
      ...mapMutations(['setMe', 'loadingDone', 'setPopupError']),
      async initData(rq) {
        this.breadcrumbs = this.breadcrumbs.filter((v) => v.mod !== this.module);
        this.breadcrumbs.push({
          text: this.moduleCapitalize,
          mod: this.module,
          exact: true,
          to: {
            name: this.module
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
            mod: this.module,
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
        console.log(`GRID-GET-${this.moduleUpperCase}-DETAIL`, { id });
        try {
          const res = (await this.$apollo.query({
            query: this.queryDetail,
            variables: {
              id
            }
          })).data;
          console.log(`GRID-GET-${this.moduleUpperCase}-DETAIL-RESULT`, { res });
          this.setMe(res.me);
          this.detail = res[this.module];
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
            text: this.detail[this.titleKey || 'name'],
            mod: this.module,
            exact: true,
            to: {
              name: this.module,
              query: {
                id: this.detail.id
              }
            }
          });
        } catch (err) {
          if (!handleGraphqlError(this, err)) {
            console.log(`GRID-GET-${this.moduleUpperCase}-DETAIL-ERROR`, { err });
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
        console.log(`GRID-GET-${this.moduleUpperCase}-ROWS`, { param });
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
            query: this.query,
            variables
          })).data;
          console.log(`GRID-GET-${this.moduleUpperCase}-ROWS-RESULT`, { res });
          this.setMe(res.me);
          this.total = res[this.modulePlurals].total;
          param.successCallback(
            res[this.modulePlurals].items,
            res[this.modulePlurals].total
          );
        } catch (err) {
          if (!handleGraphqlError(this, err)) {
            console.log(`GRID-GET-${this.moduleUpperCase}-ROWS-ERROR`, { err });
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
            mutation: this.mutationUpdate,
            variables: data
          });
          const row = this.gridApi.getRowNode(data.id);
          if (row) {
            for (const col of this.columnDefs) {
              if (col.field && col.field !== 'id') {
                row.setDataValue(col.field, data[col.field]);
              }
            }
          } else {
            console.log("REFRESH ALL", { data });
            this.gridApi.setDatasource(this);
          }
          if (res.data[`update${this.modulePluralsCapitalize}`].matched === 1) {
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
            mutation: this.mutationCreate,
            variables: data
          });
          console.log("RES", res);
          if (res.data[`create${this.moduleCapitalize}`].id) {
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
            mutation: this.mutationDelete,
            variables: data
          });
          console.log("RES", res);
          if (res.data[`delete${this.modulePluralsCapitalize}`].deleted > 0) {
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
            this.breadcrumbs = this.breadcrumbs.filter((v) => v.mod !== this.module);
            this.breadcrumbs.push({
              text: this.moduleCapitalize,
              mod: this.module,
              exact: true,
              to: {
                name: this.module
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
