import gql from 'graphql-tag';
import { mapMutations, mapState } from 'vuex';
import { handleGraphqlError } from '../lib';

function mixin({ module, query, columnDefs, moduleCapitalize, modulePlurals, modulePluralsCapitalize }) {
  if (!moduleCapitalize) {
    moduleCapitalize = `${module.substr(0, 1).toUpperCase()}${module.substr(1)}`;
  }
  if (!modulePlurals) {
    modulePlurals = `${module}s`;
  }
  if (!modulePluralsCapitalize) {
    modulePluralsCapitalize = `${modulePlurals.substr(0, 1).toUpperCase()}${modulePlurals.substr(1)}`;
  }
  const moduleUpperCase = module.toUpperCase();
  const data = {
    name: `${moduleCapitalize}List`,
    apollo: {},
    created() {
      console.log("MIXIN-LIST-CREATED", this.breadcrumbs);
      for (let i = this.breadcrumbs.length - 1; i >= 0; i--) {
        const bc = this.breadcrumbs[i];
        if (bc.id === `${module}List` || bc.id === `${module}Detail`) {
          this.breadcrumbs.splice(i, 1);
        }
      }
      this.breadcrumbs.push({
        id: `${module}List`,
        items: [{
          text: modulePluralsCapitalize,
          exact: true,
          to: {
            name: module
          }
        }]
      }, {
        id: `${module}Detail`,
        items: []
      });
    },
    data: () => ({
      query,
      columnDefs,
      accountInfo: null,
      gridOptions: {},
      gridApi: null,
      datasource: null,
      id: null,
      total: 0,
      skip: 0,
      limit: 20
    }),
    computed: {
      ...mapState(['me', 'token'])
    },
    watch: {
      $route(to, from) {
        if (!(to.query && to.query.id)) {
          const vid = `${module}Detail`;
          this.breadcrumbs.map((v) => {
            if (v.id === vid) {
              v.items = [];
            }
            return v;
          });
        }
      }
    },
    methods: {
      ...mapMutations(['setMe', 'setPopupError']),
      onGridReady(params) {
        console.log('GRID-READY');
        this.gridApi = this.gridOptions.api;
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
        this.gridApi.showLoadingOverlay();
        this.gridOptions.columnApi.autoSizeColumns();
        this.gridApi.setDatasource(this);
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
      updateRow(data) {
        console.log(`GRID-UPDATE-${moduleUpperCase}-ROW`, { data });
        const row = this.gridApi.getRowNode(data.id);
        for (const col of this.columnDefs) {
          if (col.field && col.field !== 'id') {
            row.setDataValue(col.field, data[col.field]);
          }
        }
      }
    }
  };
  data.apollo[`${module}List`] = {
    manual: true,
    query: gql`{
      me {
        time
        name
        privileges
        token {
          seq
          token
        }
      }
    }`,
    result(res) {
      console.log(`${moduleUpperCase}-INIT-LIST-RESULT`, { res });
      if (res.error) {
        if (!handleGraphqlError(this, res.error)) {
          this.setPopupError({
            code: 'UnknownError'
          });
        }
      } else if (res.data) {
        if (res.data.me) {
          this.setMe(res.data.me);
        }
      }
    }
  };
  return data;
}

export default mixin;
