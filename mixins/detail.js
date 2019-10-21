import { mapMutations } from 'vuex';
import { handleGraphqlError } from '../lib';

function mixin({ module, detailQuery, mutationQuery, moduleCapitalize, modulePlurals, modulePluralsCapitalize, titleKey }) {
  if (!moduleCapitalize) {
    moduleCapitalize = `${module.substr(0, 1).toUpperCase()}${module.substr(1)}`;
  }
  if (!modulePlurals) {
    modulePlurals = `${module}s`;
  }
  if (!modulePluralsCapitalize) {
    modulePluralsCapitalize = `${modulePlurals.substr(0, 1).toUpperCase()}${modulePlurals.substr(1)}`;
  }
  if (!titleKey) {
    titleKey = 'title';
  }
  const moduleUpperCase = module.toUpperCase();
  const data = {
    name: `${moduleCapitalize}Detail`,
    props: {
      id: {
        type: String,
        required: true
      },
      breadcrumbs: {
        type: Array,
        required: true
      }
    },
    apollo: {},
    data() {
      return {
        valid: true,
        progress: false,
        progressType: null,
        detail: null,
        mutationQuery
      };
    },
    methods: {
      ...mapMutations(['setMe', 'setPopupError']),
      async reset() {
        try {
          this.progress = true;
          this.progressType = 'reset';
          await this.$apollo.queries[`${module}Detail`].refetch();
        } catch (err) {
          if (!handleGraphqlError(this, err)) {
            console.log('resetError', { err });
          }
        } finally {
          this.progress = true;
        }
      },
      async save() {
        try {
          this.progress = true;
          this.progressType = 'save';
          this.$apollo.queries[`${module}Detail`].skip = true;
          console.log('SAVE', { data: this.detail });
          await this.$apollo.provider.clients.defaultClient.resetStore();
          const res = await this.$apollo.mutate({
            mutation: this.mutationQuery,
            variables: this.detail
          });
          console.log('RES', { res });
          if (res.data[`update${modulePluralsCapitalize}`].matched === 1) {
            this.$router.go(-1);
            this.$emit('update', this.detail);
          } else {
            this.setPopupError({
              code: 'UpdateObjectNotFound'
            });
          }
        } catch (err) {
          if (!handleGraphqlError(this, err)) {
            console.log('saveError', { err });
          }
        } finally {
          this.progress = true;
          this.$apollo.queries[`${module}Detail`].skip = false;
        }
      },
      back() {
        this.$router.go(-1);
      }
    }
  };
  data.apollo[`${module}Detail`] = {
    manual: true,
    query: detailQuery,
    variables() {
      return {
        id: this.id
      };
    },
    result(res) {
      console.log(`${moduleUpperCase}-DETAIL-RESULT`, { id: this.id, res });
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
        if (res.data[module]) {
          this.detail = res.data[module];
          const vid = `${module}Detail`;
          const text = this.detail[titleKey];
          this.$emit("update:breadcrumbs", this.breadcrumbs.map((v) => {
            if (v.id === vid) {
              v.items = [{
                text,
                exact: true,
                to: {
                  name: module,
                  query: {
                    id: this.id
                  }
                }
              }];
            }
            return v;
          }));
        } else {
          this.setPopupError({
            code: 'EntityNotFound',
            action: () => {
              this.$router.replace(`/${module}`);
              this.$emit('update', this.detail);
            }
          });
        }
      }
    }
  };
  return data;
}

export default mixin;
