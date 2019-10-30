import { mapMutations, mapState } from 'vuex';
import { logout } from '../lib';
import { modules } from '~/modules';

function mixin() {
  const data = {
    data: () => ({
      breadcrumbs: modules.breadcrumbs
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
  return data;
}

export default mixin;
