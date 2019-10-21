import gql from 'graphql-tag';
import { mapMutations, mapState } from 'vuex';
import { handleGraphqlError, logout } from '../lib';

function mixin({ module, breadcrumbs }) {
  const moduleUpperCase = module.toUpperCase();
  const data = {
    apollo: {},
    data: () => ({
      breadcrumbs: breadcrumbs || []
    }),
    computed: {
      ...mapState(['me'])
    },
    methods: {
      ...mapMutations(['setMe', 'setPopupError']),
      async toolbarAction(value) {
        console.log('toolbarAction', { value });
        if (value === 'logout') {
          try {
            const res = await logout(this);
            console.log('LOGOUT', { res });
          } catch (err) {
            console.log('LOGOUT', { err });
          }
          this.setMe(null);
        }
      }
    }
  };
  data.apollo[`${module}`] = {
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
      console.log(`${moduleUpperCase}-INIT-RESULT`, { res });
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
